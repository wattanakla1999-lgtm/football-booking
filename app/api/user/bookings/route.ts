import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getHistoryBookingPageByUserId,
} from "@/app/history/bookingHistoryData";
import { HISTORY_PAGE_LIMIT } from "@/app/history/constants";
import { parsePageParam } from "@/src/utils/pagination";
import { prisma } from "@/src/lib/prisma";
import { sendAdminBookingCancelledNotification } from "@/src/services/lineNotificationService";

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionUserId = cookieStore.get("session_user_id")?.value;

    if (!sessionUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parsePageParam(
      searchParams.get("page") ?? "1",
    );
    const limit = Number(
      searchParams.get("limit") ?? HISTORY_PAGE_LIMIT,
    );
    const searchKeyword =
      searchParams.get("search") ?? "";
    const rawStatusFilter =
      searchParams.get("status") ?? "all";
    const statusFilter =
      rawStatusFilter === "pending" ||
      rawStatusFilter === "paid" ||
      rawStatusFilter === "confirmed" ||
      rawStatusFilter === "cancelled" ||
      rawStatusFilter === "completed"
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
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionUserId =
      cookieStore.get("session_user_id")?.value;

    if (!sessionUserId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = (await request.json()) as {
      bookingId?: string;
      status?: string;
    };

    const bookingId = body.bookingId?.trim();
    const nextStatus = body.status?.trim();

    if (!bookingId || !nextStatus) {
      return NextResponse.json(
        { error: "Missing bookingId or status" },
        { status: 400 },
      );
    }

    if (nextStatus !== "cancelled") {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 },
      );
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
          orderBy: [
            { date: "asc" },
            { startTime: "asc" },
          ],
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 },
      );
    }

    if (
      booking.status === "cancelled" ||
      booking.status === "completed"
    ) {
      return NextResponse.json(
        {
          error:
            "รายการนี้ไม่สามารถยกเลิกได้แล้ว",
        },
        { status: 400 },
      );
    }

    const updatedBooking =
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          status: "cancelled",
        },
      });

    const firstItem = booking.items[0];
    const uniqueCourtNames = Array.from(
      new Set(
        booking.items.map(
          (item) => item.court.name,
        ),
      ),
    );
    const courtName =
      uniqueCourtNames.length <= 1
        ? uniqueCourtNames[0] || "ไม่ระบุสนาม"
        : `${uniqueCourtNames[0]} +${
            uniqueCourtNames.length - 1
          } สนาม`;

    try {
      await sendAdminBookingCancelledNotification({
        bookingId: booking.id,
        customerName:
          booking.user.displayName,
        customerPhone: booking.user.phone,
        courtName,
        bookingDate: firstItem
          ? firstItem.date.toISOString().slice(0, 10)
          : "-",
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
        status: updatedBooking.status,
      },
    });
  } catch (error) {
    console.error(
      "Error updating user booking:",
      error,
    );

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
