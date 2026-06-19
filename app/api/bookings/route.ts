import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { parseApiDate } from "@/app/booking/utils/booking";
import {
  badRequest,
  conflict,
  internalError,
  notFound,
  unauthorized,
} from "@/src/lib/apiResponse";
import {
  findConflictingBookingItems,
  lockBookingSlots,
} from "@/src/lib/bookingAvailability";
import { prisma } from "@/src/lib/prisma";
import { getUserSessionId } from "@/src/lib/session";
import {
  sendAdminBookingNotification,
  sendCustomerBookingRequestedNotification,
} from "@/src/services/lineNotificationService";

type BookingSlotPayload = {
  startTime: string;
  endTime: string;
};

type CreateBookingBody = {
  courtId?: string;
  date?: string;
  slots?: BookingSlotPayload[];
  phone?: string;
};

const SLOT_CONFLICT_ERROR = "BOOKING_SLOT_CONFLICT";

export async function POST(request: Request) {
  try {
    const sessionUserId = await getUserSessionId();

    if (!sessionUserId) {
      return unauthorized();
    }

    const body =
      (await request.json()) as CreateBookingBody;
    const { courtId, date, slots } = body;

    if (!courtId || !date || !slots || slots.length === 0) {
      return badRequest("ข้อมูลการจองไม่ครบถ้วน");
    }

    const targetDate = parseApiDate(date);
    const now = new Date();
    const [y, mo, d] = date.split("-").map(Number);

    for (const slot of slots) {
      const [h, mi] = slot.startTime.split(":").map(Number);
      const slotDateTime = new Date(
        y,
        mo - 1,
        d,
        h,
        mi || 0,
        0,
        0,
      );

      if (slotDateTime.getTime() <= now.getTime()) {
        return badRequest(
          `ไม่สามารถจองเวลาที่ผ่านไปแล้วได้ (${slot.startTime})`,
        );
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUserId },
      select: {
        organizationId: true,
        displayName: true,
        phone: true,
        lineUserId: true,
      },
    });

    if (!user) {
      return notFound("ไม่พบข้อมูลผู้ใช้งาน");
    }

    const court = await prisma.court.findUnique({
      where: { id: courtId },
    });

    if (!court || court.organizationId !== user.organizationId) {
      return notFound("ไม่พบสนามที่เลือก");
    }

    if (!court.isActive) {
      return badRequest("สนามนี้ปิดให้บริการชั่วคราว");
    }

    const holiday = await prisma.holiday.findUnique({
      where: {
        organizationId_date: {
          organizationId: user.organizationId,
          date: targetDate,
        },
      },
    });

    if (holiday?.isClosed) {
      return badRequest(
        holiday.description || "สนามปิดให้บริการในวันหยุดนี้",
      );
    }

    const dayOfWeek = targetDate.getDay();
    const operatingHour = await prisma.operatingHour.findUnique({
      where: {
        organizationId_dayOfWeek: {
          organizationId: user.organizationId,
          dayOfWeek,
        },
      },
    });

    if (!operatingHour || operatingHour.isClosed) {
      return badRequest("สนามปิดให้บริการในวันนี้");
    }

    const openHour = Number.parseInt(
      operatingHour.openTime.split(":")[0] ?? "0",
      10,
    );
    let closeHour = Number.parseInt(
      operatingHour.closeTime.split(":")[0] ?? "0",
      10,
    );

    if (closeHour === 0 && openHour === 0) {
      closeHour = 24;
    } else if (closeHour <= openHour) {
      closeHour += 24;
    }

    for (const slot of slots) {
      let slotStart = Number.parseInt(
        slot.startTime.split(":")[0] ?? "0",
        10,
      );
      let slotEnd = Number.parseInt(
        slot.endTime.split(":")[0] ?? "0",
        10,
      );

      if (slotStart < openHour) {
        slotStart += 24;
      }

      if (slotEnd <= slotStart) {
        slotEnd += 24;
      }

      if (slotStart < openHour || slotEnd > closeHour) {
        return badRequest(
          `เวลา ${slot.startTime} - ${slot.endTime} อยู่นอกเวลาเปิดทำการ`,
        );
      }
    }

    const phone = body.phone?.trim() || null;
    const totalPrice = slots.length * Number(court.pricePerHour);

    const booking = await prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        await lockBookingSlots(tx, courtId, date, slots);

        const conflictingItems =
          await findConflictingBookingItems(
            tx,
            courtId,
            targetDate,
            slots,
          );

        if (conflictingItems.length > 0) {
          throw new Error(SLOT_CONFLICT_ERROR);
        }

        if (phone) {
          await tx.user.update({
            where: { id: sessionUserId },
            data: { phone },
          });
        }

        return tx.booking.create({
          data: {
            userId: sessionUserId,
            organizationId: user.organizationId,
            totalPrice,
            status: "pending",
            notes: "ลูกค้าส่งคำขอจองผ่านหน้าเว็บไซต์",
            items: {
              create: slots.map((slot) => ({
                courtId,
                date: targetDate,
                startTime: slot.startTime,
                endTime: slot.endTime,
                price: court.pricePerHour,
              })),
            },
          },
        });
      },
      {
        isolationLevel:
          Prisma.TransactionIsolationLevel.Serializable,
      },
    );

    try {
      await sendAdminBookingNotification({
        bookingId: booking.id,
        customerName: user.displayName,
        customerPhone: phone || user.phone || null,
        courtName: court.name,
        bookingDate: date,
        slots,
        totalPrice,
        bookingStatus: "pending",
      });
    } catch (notificationError) {
      console.error(
        "Failed to send LINE admin booking notification:",
        notificationError,
      );
    }

    try {
      await sendCustomerBookingRequestedNotification({
        lineUserId: user.lineUserId,
        bookingId: booking.id,
        courtName: court.name,
        bookingDate: date,
        slots,
      });
    } catch (notificationError) {
      console.error(
        "Failed to send LINE customer booking requested notification:",
        notificationError,
      );
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      bookingStatus: booking.status,
      message: "ส่งคำขอจองแล้ว รอแอดมินยืนยัน",
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === SLOT_CONFLICT_ERROR
    ) {
      return conflict(
        "ช่วงเวลานี้ถูกจองไปแล้ว กรุณาเลือกเวลาใหม่",
      );
    }

    console.error("Error creating booking:", error);
    return internalError();
  }
}
