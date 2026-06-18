import { prisma } from "@/src/lib/prisma";
import { sendAdminBookingNotification } from "@/src/services/lineNotificationService";
import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type BookingSlotPayload = {
  startTime: string;
  endTime: string;
};

type CreateBookingBody = {
  courtId?: string;
  date?: string;
  slots?: BookingSlotPayload[];
  customerMode?: "existing" | "new";
  existingCustomerId?: string;
  customerName?: string;
  customerPhone?: string;
  bookingStatus?: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus?: "unpaid" | "pending_verify" | "verified";
};

// Helper: verify admin session
async function getAdmin() {
  const cookieStore = await cookies();
  const adminId = cookieStore.get("admin_session_id")?.value;
  if (!adminId) return null;

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, organizationId: true, role: true, isActive: true },
  });

  if (!admin || !admin.isActive) return null;
  return admin;
}

export async function POST(request: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body =
      (await request.json()) as CreateBookingBody;

    const {
      courtId,
      date,
      slots,
      customerMode = "new",
      existingCustomerId,
      customerName,
      customerPhone,
      bookingStatus = "confirmed",
      paymentStatus = "unpaid",
    } = body;

    if (
      !courtId ||
      !date ||
      !slots ||
      slots.length === 0 ||
      !bookingStatus ||
      !paymentStatus
    ) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
    }

    if (
      customerMode === "existing" &&
      !existingCustomerId
    ) {
      return NextResponse.json(
        { error: "กรุณาเลือกลูกค้าเดิม" },
        { status: 400 },
      );
    }

    if (
      customerMode === "new" &&
      (!customerName?.trim() || !customerPhone?.trim())
    ) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อลูกค้าและเบอร์โทรศัพท์" },
        { status: 400 },
      );
    }

    const validBookingStatuses = [
      "pending",
      "confirmed",
      "cancelled",
      "completed",
    ];

    if (!validBookingStatuses.includes(bookingStatus)) {
      return NextResponse.json(
        { error: "สถานะการจองไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    const validPaymentStatuses = [
      "unpaid",
      "pending_verify",
      "verified",
    ];

    if (!validPaymentStatuses.includes(paymentStatus)) {
      return NextResponse.json(
        { error: "สถานะการชำระเงินไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    const targetDate = new Date(date);

    // 1. Fetch court to verify price & organization
    const court = await prisma.court.findUnique({
      where: { id: courtId },
    });

    if (!court || court.organizationId !== admin.organizationId) {
      return NextResponse.json({ error: "ไม่พบสนามบอลที่เลือก" }, { status: 404 });
    }

    // 2. Double-check availability (prevent overlapping bookings)
    const existingItems = await prisma.bookingItem.findMany({
      where: {
        courtId,
        date: targetDate,
        booking: { status: { not: "cancelled" } },
      }
    });

    for (const slot of slots) {
      const slotStart = parseInt(slot.startTime.split(":")[0]);
      const slotEnd = parseInt(slot.endTime.split(":")[0]);

      const isConflict = existingItems.some((item) => {
        const itemStart = parseInt(item.startTime.split(":")[0]);
        const itemEnd = parseInt(item.endTime.split(":")[0]);
        return slotStart < itemEnd && slotEnd > itemStart;  
      });

      if (isConflict) {
        return NextResponse.json(
          { error: `ช่วงเวลา ${slot.startTime} - ${slot.endTime} ถูกจองไปแล้ว` },
          { status: 409 }
        );
      }
    }

    // 3. Resolve or create customer
    let customerUser = null;

    if (customerMode === "existing") {
      customerUser = await prisma.user.findFirst({
        where: {
          id: existingCustomerId,
          organizationId: admin.organizationId,
        },
      });

      if (!customerUser) {
        return NextResponse.json(
          { error: "ไม่พบลูกค้าที่เลือก" },
          { status: 404 },
        );
      }
    } else {
      customerUser = await prisma.user.findFirst({
        where: {
          organizationId: admin.organizationId,
          phone: customerPhone!.trim(),
        },
      });

      if (!customerUser) {
        const uniqueSuffix =
          `${customerPhone!.trim()}_${Date.now()}`;

        customerUser = await prisma.user.create({
          data: {
            lineUserId: `offline_${uniqueSuffix}`,
            displayName: customerName!.trim(),
            phone: customerPhone!.trim(),
            organizationId: admin.organizationId,
          },
        });
      }
    }

    // 4. Calculate price
    const pricePerHour = Number(court.pricePerHour);
    const totalPrice = slots.length * pricePerHour;

    // 5. Create Booking and BookingItems in transaction
    const booking = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newBooking = await tx.booking.create({
        data: {
          userId: customerUser.id,
          organizationId: admin.organizationId,
          totalPrice,
          status: bookingStatus,
          notes:
            customerMode === "existing"
              ? "จองโดยผู้ดูแลระบบ (ลูกค้าเดิม)"
              : "จองโดยผู้ดูแลระบบ (ลูกค้าใหม่ / โทรจอง)",
          items: {
            create: slots.map((slot: BookingSlotPayload) => ({
              courtId,
              date: targetDate,
              startTime: slot.startTime,
              endTime: slot.endTime,
              price: pricePerHour,
            }))
          }
        }
      });

      await tx.payment.create({
        data: {
          bookingId: newBooking.id,
          amount: totalPrice,
          status: paymentStatus,
          verifiedAt:
            paymentStatus === "verified"
              ? new Date()
              : null,
          verifiedById:
            paymentStatus === "verified"
              ? admin.id
              : null,
        },
      });

      return newBooking;
    });

    try {
      await sendAdminBookingNotification({
        bookingId: booking.id,
        customerName: customerUser.displayName,
        customerPhone: customerUser.phone,
        courtName: court.name,
        bookingDate: date,
        slots,
        totalPrice,
        bookingStatus,
        paymentStatus,
      });
    } catch (notificationError) {
      console.error(
        "Failed to send LINE admin booking notification:",
        notificationError
      );
    }

    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch (error) {
    console.error("Error admin creating booking:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
