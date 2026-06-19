import { NextResponse } from "next/server";

import { parseApiDate } from "@/app/booking/utils/booking";
import {
  badRequest,
  internalError,
  notFound,
  unauthorized,
} from "@/src/lib/apiResponse";
import { ACTIVE_BOOKING_STATUSES } from "@/src/lib/bookingStatus";
import { prisma } from "@/src/lib/prisma";
import { getUserSessionId } from "@/src/lib/session";

export async function GET(request: Request) {
  try {
    const sessionUserId = await getUserSessionId();

    if (!sessionUserId) {
      return unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const courtId = searchParams.get("courtId");

    if (!dateParam || !courtId) {
      return badRequest("กรุณาระบุวันที่และสนาม");
    }

    const targetDate = parseApiDate(dateParam);

    if (Number.isNaN(targetDate.getTime())) {
      return badRequest("รูปแบบวันที่ไม่ถูกต้อง");
    }

    const user = await prisma.user.findUnique({
      where: { id: sessionUserId },
      select: { organizationId: true },
    });

    if (!user) {
      return notFound("ไม่พบข้อมูลผู้ใช้งาน");
    }

    const court = await prisma.court.findFirst({
      where: {
        id: courtId,
        organizationId: user.organizationId,
      },
      select: {
        id: true,
        isActive: true,
      },
    });

    if (!court) {
      return notFound("ไม่พบสนามที่เลือก");
    }

    if (!court.isActive) {
      return NextResponse.json({
        slots: [],
        message: "สนามนี้ปิดให้บริการชั่วคราว",
      });
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
      return NextResponse.json({
        slots: [],
        message:
          holiday.description || "สนามปิดให้บริการในวันหยุดนี้",
      });
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
      return NextResponse.json({
        slots: [],
        message: "สนามปิดให้บริการในวันนี้",
      });
    }

    const existingBookingItems = await prisma.bookingItem.findMany({
      where: {
        courtId,
        date: targetDate,
        booking: {
          status: {
            in: ACTIVE_BOOKING_STATUSES,
          },
        },
      },
      select: {
        startTime: true,
        endTime: true,
      },
    });

    const slots = [];
    let currentHour = Number.parseInt(
      operatingHour.openTime.split(":")[0] ?? "0",
      10,
    );
    let closeHour = Number.parseInt(
      operatingHour.closeTime.split(":")[0] ?? "0",
      10,
    );

    if (closeHour === 0 && currentHour === 0) {
      closeHour = 24;
    } else if (closeHour <= currentHour) {
      closeHour += 24;
    }

    while (currentHour < closeHour) {
      const displayStartH = currentHour % 24;
      const displayEndH = (currentHour + 1) % 24;
      const startTime = `${displayStartH.toString().padStart(2, "0")}:00`;
      const endTime = `${displayEndH.toString().padStart(2, "0")}:00`;

      const isBooked = existingBookingItems.some(
        (item) => item.startTime === startTime,
      );

      slots.push({
        startTime,
        endTime,
        isAvailable: !isBooked,
      });

      currentHour += 1;
    }

    return NextResponse.json({ slots, message: null });
  } catch (error) {
    console.error("Error checking availability:", error);
    return internalError();
  }
}
