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
  isBookingSlotConflictError,
  lockBookingSlots,
  SLOT_CONFLICT_ERROR,
} from "@/src/lib/bookingAvailability";
import { prisma } from "@/src/lib/prisma";
import { getAdminSessionId } from "@/src/lib/session";
import { auditLog } from "@/src/lib/audit";
import {
  sendAdminBookingNotification,
  sendCustomerBookingConfirmedByAdminNotification,
} from "@/src/services/lineNotificationService";

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
  bookingStatus?: "pending" | "confirmed";
};

async function getAdmin() {
  const adminId = await getAdminSessionId();

  if (!adminId) {
    return null;
  }

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: { id: true, organizationId: true, role: true, isActive: true },
  });

  if (!admin || !admin.isActive) {
    return null;
  }

  return admin;
}

export async function POST(request: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return unauthorized("กรุณาเข้าสู่ระบบผู้ดูแล");
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
    } = body;

    if (!courtId || !date || !slots || slots.length === 0) {
      return badRequest("ข้อมูลการจองไม่ครบถ้วน");
    }

    if (customerMode === "existing" && !existingCustomerId) {
      return badRequest("กรุณาเลือกลูกค้าเดิม");
    }

    if (
      customerMode === "new" &&
      (!customerName?.trim() || !customerPhone?.trim())
    ) {
      return badRequest("กรุณากรอกชื่อลูกค้าและเบอร์โทรศัพท์");
    }

    if (
      bookingStatus !== "pending" &&
      bookingStatus !== "confirmed"
    ) {
      return badRequest("สถานะการจองไม่ถูกต้อง");
    }

    const targetDate = parseApiDate(date);
    const court = await prisma.court.findUnique({
      where: { id: courtId },
    });

    if (!court || court.organizationId !== admin.organizationId) {
      return notFound("ไม่พบสนามที่เลือก");
    }

    if (!court.isActive) {
      return badRequest("สนามนี้ปิดให้บริการชั่วคราว");
    }

    let customerUser = null;

    if (customerMode === "existing") {
      customerUser = await prisma.user.findFirst({
        where: {
          id: existingCustomerId,
          organizationId: admin.organizationId,
        },
      });
    } else {
      customerUser = await prisma.user.findFirst({
        where: {
          organizationId: admin.organizationId,
          phone: customerPhone?.trim(),
        },
      });

      if (!customerUser) {
        customerUser = await prisma.user.create({
          data: {
            lineUserId: `offline_${customerPhone?.trim()}_${Date.now()}`,
            displayName: customerName!.trim(),
            phone: customerPhone!.trim(),
            organizationId: admin.organizationId,
          },
        });
      }
    }

    if (!customerUser) {
      return notFound("ไม่พบลูกค้าที่เลือก");
    }

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
          auditLog({
            event: "booking.conflict",
            level: "warn",
            actorType: "admin",
            actorId: admin.id,
            organizationId: admin.organizationId,
            message: "admin create hit reserved slot",
            meta: { courtId, date, slots },
          });
          throw new Error(SLOT_CONFLICT_ERROR);
        }

        return tx.booking.create({
          data: {
            userId: customerUser.id,
            organizationId: admin.organizationId,
            totalPrice,
            status: bookingStatus,
            notes:
              customerMode === "existing"
                ? "ผู้ดูแลสร้างรายการจองให้ลูกค้าเดิม"
                : "ผู้ดูแลสร้างรายการจองให้ลูกค้าใหม่",
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
        customerName: customerUser.displayName,
        customerPhone: customerUser.phone,
        courtName: court.name,
        bookingDate: date,
        slots,
        totalPrice,
        bookingStatus,
      });
    } catch (notificationError) {
      console.error(
        "Failed to send LINE admin booking notification:",
        notificationError,
      );
    }

    if (bookingStatus === "confirmed" && customerUser.lineUserId) {
      try {
        await sendCustomerBookingConfirmedByAdminNotification({
          lineUserId: customerUser.lineUserId,
          bookingId: booking.id,
          courtName: court.name,
          bookingDate: date,
          slots,
        });
      } catch (notificationError) {
        console.error(
          "Failed to send LINE customer confirmation notification:",
          notificationError,
        );
      }
    }

    auditLog({
      event: "booking.create_by_admin",
      actorType: "admin",
      actorId: admin.id,
      bookingId: booking.id,
      organizationId: admin.organizationId,
      meta: {
        customerId: customerUser.id,
        courtId,
        date,
        slotCount: slots.length,
        status: booking.status,
      },
    });

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      bookingStatus: booking.status,
    });
  } catch (error) {
    if (isBookingSlotConflictError(error)) {
      return conflict(
        "ช่วงเวลานี้ถูกจองไปแล้ว กรุณาเลือกเวลาใหม่",
      );
    }

    console.error("Error creating admin booking:", error);
    auditLog({
      event: "booking.create_by_admin.failed",
      level: "error",
      actorType: "admin",
      message: error instanceof Error ? error.message : "unknown error",
    });
    return internalError();
  }
}
