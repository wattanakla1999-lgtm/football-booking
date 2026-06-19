import { prisma } from "@/src/lib/prisma";
import { parseApiDate } from "@/app/booking/utils/booking";
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
  phone?: string;
  paymentMethod?: string;
};

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get("session_user_id")?.value;

    if (!sessionUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body =
      (await request.json()) as CreateBookingBody;
    const { courtId, date, slots } = body;

    if (!courtId || !date || !slots || slots.length === 0) {
      return NextResponse.json({ error: "Invalid booking data" }, { status: 400 });
    }

    const targetDate = parseApiDate(date);

    // 0. Reject slots that are already in the past (server-side guard)
    const now = new Date();
    const [y, mo, d] = String(date).split("-").map(Number);
    for (const slot of slots) {
      const [h, mi] = String(slot.startTime).split(":").map(Number);
      const slotDateTime = new Date(y, mo - 1, d, h, mi || 0, 0, 0);
      if (slotDateTime.getTime() <= now.getTime()) {
        return NextResponse.json(
          { error: `ไม่สามารถจองเวลาที่ผ่านไปแล้วได้ (${slot.startTime})` },
          { status: 400 }
        );
      }
    }

    // 1. Get user
    const user = await prisma.user.findUnique({
      where: { id: sessionUserId },
      select: {
        organizationId: true,
        displayName: true,
        phone: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Fetch court to verify price
    const court = await prisma.court.findUnique({
      where: { id: courtId },
    });

    if (!court || court.organizationId !== user.organizationId) {
      return NextResponse.json({ error: "Court not found or invalid" }, { status: 404 });
    }

    // 2.5 Check holiday
    const holiday = await prisma.holiday.findUnique({
      where: {
        organizationId_date: {
          organizationId: user.organizationId,
          date: targetDate,
        }
      }
    });

    if (holiday?.isClosed) {
      return NextResponse.json({ error: holiday.description || "Closed for holiday" }, { status: 400 });
    }

    // 2.6 Check operating hours
    const dayOfWeek = targetDate.getDay();
    const operatingHour = await prisma.operatingHour.findUnique({
      where: {
        organizationId_dayOfWeek: {
          organizationId: user.organizationId,
          dayOfWeek,
        }
      }
    });

    if (!operatingHour || operatingHour.isClosed) {
      return NextResponse.json({ error: "Closed on this day" }, { status: 400 });
    }

    const openHour = parseInt(operatingHour.openTime.split(":")[0]);
    let closeHour = parseInt(operatingHour.closeTime.split(":")[0]);

    if (closeHour === 0 && openHour === 0) {
      closeHour = 24;
    } else if (closeHour <= openHour) {
      closeHour += 24;
    }

    for (const slot of slots) {
      let slotStart = parseInt(slot.startTime.split(":")[0]);
      let slotEnd = parseInt(slot.endTime.split(":")[0]);
      
      if (slotStart < openHour) {
        slotStart += 24;
      }
      if (slotEnd <= slotStart) {
        slotEnd += 24;
      }

      if (slotStart < openHour || slotEnd > closeHour) {
        return NextResponse.json(
          { error: `เวลา ${slot.startTime} - ${slot.endTime} อยู่นอกเวลาเปิดทำการ` },
          { status: 400 }
        );
      }
    }

    // 3. Double-check availability (prevent race conditions)
    // Find any existing bookings that overlap with requested slots
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
          { error: `Slot ${slot.startTime} - ${slot.endTime} is no longer available` },
          { status: 409 }
        );
      }
    }

    const { phone, paymentMethod } = body;

    // 4. Calculate total price (using court's current pricePerHour)
    const pricePerHour = Number(court.pricePerHour);
    const totalPrice = slots.length * pricePerHour;

    // 5. Create Booking, update User details, and create Payment in a transaction
    const booking = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Update phone number in user profile if provided
      if (phone) {
        await tx.user.update({
          where: { id: sessionUserId },
          data: { phone },
        });
      }

      const newBooking = await tx.booking.create({
        data: {
          userId: sessionUserId,
          organizationId: user.organizationId,
          totalPrice,
          status: "pending",
          notes: paymentMethod ? `วิธีการชำระเงิน: ${paymentMethod}` : null,
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

      // Create linked payment record as unpaid initially
      await tx.payment.create({
        data: {
          amount: totalPrice,
          status: "unpaid",
          bookingId: newBooking.id,
        }
      });

      return newBooking;
    });

    try {
      await sendAdminBookingNotification({
        bookingId: booking.id,
        customerName: user.displayName,
        customerPhone: phone?.trim() || user.phone || null,
        courtName: court.name,
        bookingDate: date,
        slots,
        totalPrice,
        bookingStatus: "pending",
        paymentStatus: "unpaid",
      });
    } catch (notificationError) {
      console.error(
        "Failed to send LINE admin booking notification:",
        notificationError
      );
    }

    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
