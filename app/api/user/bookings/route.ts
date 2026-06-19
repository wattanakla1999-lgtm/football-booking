import { NextRequest, NextResponse } from "next/server";

import {
  getHistoryBookingPageByUserId,
} from "@/app/history/bookingHistoryData";
import { HISTORY_PAGE_LIMIT } from "@/app/history/constants";
import {
  badRequest,
  internalError,
  notFound,
  unauthorized,
} from "@/src/lib/apiResponse";
import {
  CUSTOMER_CANCELLABLE_BOOKING_STATUSES,
  normalizeBookingStatus,
} from "@/src/lib/bookingStatus";
import { prisma } from "@/src/lib/prisma";
import { getUserSessionId } from "@/src/lib/session";
import {
  sendAdminBookingCancelledNotification,
} from "@/src/services/lineNotificationService";
import { parsePageParam } from "@/src/utils/pagination";

const CUSTOMER_CANCEL_CUTOFF_HOURS = 2;

function formatLocalDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export async function GET(request: NextRequest) {
  try {
    const sessionUserId = await getUserSessionId();

    if (!sessionUserId) {
      return unauthorized();
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parsePageParam(searchParams.get("page") ?? "1");
    const limit = Number(
      searchParams.get("limit") ?? HISTORY_PAGE_LIMIT,
    );
    const searchKeyword =
      searchParams.get("search") ?? "";
    const rawStatusFilter =
      searchParams.get("status") ?? "all";
    const statusFilter =
      rawStatusFilter === "pending" ||
      rawStatusFilter === "confirmed" ||
      rawStatusFilter === "cancelled" ||
      rawStatusFilter === "completed" ||
      rawStatusFilter === "expired" ||
      rawStatusFilter === "no_show"
        ? rawStatusFilter
        : "all";

    const data = await getHistoryBookingPageByUserId(
      sessionUserId,
      {
        page,
        limit,
        searchKeyword,
        statusFilter,
      },
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    return internalError();
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionUserId = await getUserSessionId();

    if (!sessionUserId) {
      return unauthorized();
    }

    const body = (await request.json()) as {
      bookingId?: string;
      status?: string;
    };

    const bookingId = body.bookingId?.trim();
    const nextStatus = body.status?.trim();

    if (!bookingId || !nextStatus) {
      return badRequest("กรุณาระบุ bookingId และ status");
    }

    if (nextStatus !== "cancelled") {
      return badRequest("สถานะที่เปลี่ยนได้สำหรับลูกค้าคือ cancelled เท่านั้น");
    }

    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId: sessionUserId,
      },
      include: {
        user: {
          select: {
            displayName: true,
            phone: true,
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

    const currentStatus = normalizeBookingStatus(booking.status);

    if (
      !CUSTOMER_CANCELLABLE_BOOKING_STATUSES.includes(
        currentStatus,
      )
    ) {
      return badRequest("รายการนี้ไม่สามารถยกเลิกได้แล้ว");
    }

    const firstItem = booking.items[0];

    if (!firstItem) {
      return badRequest("ไม่พบช่วงเวลาของรายการจอง");
    }

    const [hour, minute] = firstItem.startTime
      .split(":")
      .map(Number);
    const bookingStartTime = new Date(firstItem.date);
    bookingStartTime.setHours(hour, minute || 0, 0, 0);

    const cutoffTime = new Date(
      bookingStartTime.getTime() -
        CUSTOMER_CANCEL_CUTOFF_HOURS * 60 * 60 * 1000,
    );

    if (Date.now() >= cutoffTime.getTime()) {
      return badRequest(
        `ไม่สามารถยกเลิกได้ภายใน ${CUSTOMER_CANCEL_CUTOFF_HOURS} ชั่วโมงก่อนเวลาใช้งาน`,
      );
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: "cancelled",
      },
    });

    const uniqueCourtNames = Array.from(
      new Set(booking.items.map((item) => item.court.name)),
    );
    const courtName =
      uniqueCourtNames.length <= 1
        ? uniqueCourtNames[0] || "ไม่ระบุสนาม"
        : `${uniqueCourtNames[0]} +${uniqueCourtNames.length - 1} สนาม`;

    try {
      await sendAdminBookingCancelledNotification({
        bookingId: booking.id,
        customerName: booking.user.displayName,
        customerPhone: booking.user.phone,
        courtName,
        bookingDate: formatLocalDate(firstItem.date),
        slots: booking.items.map((item) => ({
          startTime: item.startTime,
          endTime: item.endTime,
        })),
        totalPrice: Number(booking.totalPrice),
      });
    } catch (notificationError) {
      console.error(
        "Failed to send LINE admin cancellation notification:",
        notificationError,
      );
    }

    return NextResponse.json({
      success: true,
      booking: {
        id: updatedBooking.id,
        status: normalizeBookingStatus(updatedBooking.status),
      },
    });
  } catch (error) {
    console.error(
      "Error updating user booking:",
      error,
    );

    return internalError();
  }
}
