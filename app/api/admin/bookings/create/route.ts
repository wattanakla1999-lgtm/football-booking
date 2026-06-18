import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { cookies } from "next/headers";

type BookingSlotPayload = {
  startTime: string;
  endTime: string;
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

    const body = await request.json();
    const { courtId, date, slots, customerName, customerPhone } = body;

    if (!courtId || !date || !slots || slots.length === 0 || !customerName) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบถ้วน" }, { status: 400 });
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

      const isConflict = existingItems.some(item => {
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

    // 3. Find or create the Customer User
    // If a phone is provided, try to find a user with lineUserId starting with offline_ and matching phone
    let customerUser = null;
    if (customerPhone) {
      customerUser = await prisma.user.findFirst({
        where: {
          organizationId: admin.organizationId,
          phone: customerPhone,
          lineUserId: { startsWith: "offline_" }
        }
      });
    }

    if (!customerUser) {
      const uniqueSuffix = customerPhone ? customerPhone : `temp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      customerUser = await prisma.user.create({
        data: {
          lineUserId: `offline_${uniqueSuffix}`,
          displayName: customerName,
          phone: customerPhone || null,
          organizationId: admin.organizationId,
        }
      });
    }

    // 4. Calculate price
    const pricePerHour = Number(court.pricePerHour);
    const totalPrice = slots.length * pricePerHour;

    // 5. Create Booking and BookingItems in transaction
    const booking = await prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          userId: customerUser.id,
          organizationId: admin.organizationId,
          totalPrice,
          status: "confirmed", // Admins book directly with confirmed status
          notes: "จองโดยผู้ดูแลระบบ (สายโทรเข้า / วอล์กอิน)",
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
      return newBooking;
    });

    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch (error) {
    console.error("Error admin creating booking:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
