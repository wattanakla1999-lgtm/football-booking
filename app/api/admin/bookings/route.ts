import { NextResponse } from "next/server";

import {
  badRequest,
  internalError,
  notFound,
  unauthorized,
} from "@/src/lib/apiResponse";
import { normalizeBookingStatus } from "@/src/lib/bookingStatus";
import { prisma } from "@/src/lib/prisma";
import { getAdminSessionId } from "@/src/lib/session";
import {
  sendCustomerBookingCancelledByAdminNotification,
  sendCustomerBookingConfirmedByAdminNotification,
} from "@/src/services/lineNotificationService";

export const dynamic = "force-dynamic";

const VALID_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
  "expired",
  "no_show",
] as const;

type NextStatus = (typeof VALID_STATUSES)[number];

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

function formatLocalDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function canTransition(
  currentStatus: string,
  nextStatus: NextStatus,
) {
  const current = normalizeBookingStatus(currentStatus);

  if (current === nextStatus) {
    return true;
  }

  if (current === "cancelled" || current === "completed") {
    return false;
  }

  if (current === "expired" || current === "no_show") {
    return nextStatus === "completed";
  }

  return true;
}

export async function GET() {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return unauthorized("กรุณาเข้าสู่ระบบผู้ดูแล");
    }

    const bookings = await prisma.booking.findMany({
      where: {
        organizationId: admin.organizationId,
      },
      include: {
        user: {
          select: {
            displayName: true,
            pictureUrl: true,
            lineUserId: true,
            phone: true,
          },
        },
        items: {
          include: {
            court: {
              select: { name: true },
            },
          },
          orderBy: { startTime: "asc" },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      bookings: bookings.map((booking) => ({
        ...booking,
        status: normalizeBookingStatus(booking.status),
      })),
    });
  } catch (error) {
    console.error("Error fetching admin bookings:", error);
    return internalError();
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAdmin();

    if (!admin) {
      return unauthorized("กรุณาเข้าสู่ระบบผู้ดูแล");
    }

    const body = (await request.json()) as {
      bookingId?: string;
      status?: string;
    };

    const bookingId = body.bookingId?.trim();
    const status = body.status?.trim() as NextStatus | undefined;

    if (!bookingId || !status) {
      return badRequest("กรุณาระบุ bookingId และ status");
    }

    if (!VALID_STATUSES.includes(status)) {
      return badRequest("สถานะการจองไม่ถูกต้อง");
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        organizationId: admin.organizationId,
      },
      include: {
        user: {
          select: {
            lineUserId: true,
          },
        },
        items: {
          include: {
            court: {
              select: {
                name: true,
              },
            },
          },
          orderBy: [{ date: "asc" }, { startTime: "asc" }],
        },
      },
    });

    if (!booking) {
      return notFound("ไม่พบรายการจอง");
    }

    if (!canTransition(booking.status, status)) {
      return badRequest("ไม่สามารถเปลี่ยนสถานะของรายการนี้ได้");
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    const firstItem = booking.items[0];
    const uniqueCourtNames = Array.from(
      new Set(booking.items.map((item) => item.court.name)),
    );
    const courtName =
      uniqueCourtNames.length <= 1
        ? uniqueCourtNames[0] || "ไม่ระบุสนาม"
        : `${uniqueCourtNames[0]} +${uniqueCourtNames.length - 1} สนาม`;
    const bookingDate = firstItem
      ? formatLocalDate(firstItem.date)
      : "-";
    const slots = booking.items.map((item) => ({
      startTime: item.startTime,
      endTime: item.endTime,
    }));

    if (
      status === "cancelled" &&
      normalizeBookingStatus(booking.status) !== "cancelled"
    ) {
      try {
        await sendCustomerBookingCancelledByAdminNotification({
          lineUserId: booking.user.lineUserId,
          bookingId: booking.id,
          courtName,
          bookingDate,
          slots,
        });
      } catch (notificationError) {
        console.error(
          "Failed to send LINE customer cancellation notification:",
          notificationError,
        );
      }
    }

    if (
      status === "confirmed" &&
      normalizeBookingStatus(booking.status) !== "confirmed"
    ) {
      try {
        await sendCustomerBookingConfirmedByAdminNotification({
          lineUserId: booking.user.lineUserId,
          bookingId: booking.id,
          courtName,
          bookingDate,
          slots,
        });
      } catch (notificationError) {
        console.error(
          "Failed to send LINE customer confirmation notification:",
          notificationError,
        );
      }
    }

    return NextResponse.json({
      success: true,
      booking: {
        ...updatedBooking,
        status: normalizeBookingStatus(updatedBooking.status),
      },
    });
  } catch (error) {
    console.error("Error updating booking:", error);
    return internalError();
  }
}
