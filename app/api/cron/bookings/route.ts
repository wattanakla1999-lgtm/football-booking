import { NextResponse } from "next/server";

import { prisma } from "@/src/lib/prisma";
import { auditLog } from "@/src/lib/audit";
import { appendSystemNote } from "@/src/lib/bookingNotes";
import { sendCustomerBookingReminderNotification } from "@/src/services/lineNotificationService";

const PENDING_EXPIRY_MINUTES = 30;
const REMINDER_WINDOW_MINUTES = 90;
const REMINDER_NOTE_PREFIX = "[SYSTEM_REMINDER_SENT]";

function isAuthorized(request: Request) {
  const cronSecret = process.env.CRON_SECRET?.trim();

  if (!cronSecret) {
    return false;
  }

  const headerSecret =
    request.headers.get("x-cron-secret")?.trim() ||
    new URL(request.url).searchParams.get("secret")?.trim();

  return headerSecret === cronSecret;
}

function toDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function toDateTime(date: Date, time: string) {
  const [hour, minute] = time.split(":").map(Number);
  const next = new Date(date);
  next.setHours(hour, minute || 0, 0, 0);
  return next;
}

function reminderMarker(bookingId: string, date: Date, startTime: string) {
  return `${REMINDER_NOTE_PREFIX}:${bookingId}:${toDateKey(date)}:${startTime}`;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    auditLog({
      event: "cron.auth_failed",
      level: "warn",
      actorType: "system",
      message: "invalid cron secret",
    });

    return NextResponse.json(
      { error: "ไม่มีสิทธิ์" },
      { status: 401 },
    );
  }

  const now = new Date();
  const expiredBefore = new Date(
    now.getTime() - PENDING_EXPIRY_MINUTES * 60 * 1000,
  );

  try {
    const pendingToExpire = await prisma.booking.findMany({
      where: {
        status: "pending",
        createdAt: {
          lte: expiredBefore,
        },
      },
      select: {
        id: true,
        organizationId: true,
      },
    });

    const confirmedBookings = await prisma.booking.findMany({
      where: {
        status: "confirmed",
      },
      include: {
        user: {
          select: {
            lineUserId: true,
          },
        },
        items: {
          orderBy: [{ date: "asc" }, { startTime: "asc" }],
          select: {
            date: true,
            startTime: true,
            endTime: true,
            court: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    let completedCount = 0;
    let expiredCount = 0;
    let reminderCount = 0;

    for (const booking of pendingToExpire) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "expired" },
      });

      expiredCount += 1;
      auditLog({
        event: "booking.expired",
        actorType: "system",
        bookingId: booking.id,
        organizationId: booking.organizationId,
      });
    }

    for (const booking of confirmedBookings) {
      const firstItem = booking.items[0];
      const lastItem = booking.items[booking.items.length - 1];

      if (!firstItem || !lastItem) {
        continue;
      }

      const bookingStart = toDateTime(firstItem.date, firstItem.startTime);
      const bookingEnd = toDateTime(lastItem.date, lastItem.endTime);

      if (bookingEnd.getTime() <= now.getTime()) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: "completed" },
        });

        completedCount += 1;
        auditLog({
          event: "booking.completed_by_cron",
          actorType: "system",
          bookingId: booking.id,
          organizationId: booking.organizationId,
        });
        continue;
      }

      const diffMinutes = Math.floor(
        (bookingStart.getTime() - now.getTime()) / 60000,
      );
      const marker = reminderMarker(
        booking.id,
        firstItem.date,
        firstItem.startTime,
      );

      if (
        diffMinutes > 0 &&
        diffMinutes <= REMINDER_WINDOW_MINUTES &&
        !String(booking.notes || "").includes(marker) &&
        booking.user.lineUserId &&
        !booking.user.lineUserId.startsWith("offline_")
      ) {
        await sendCustomerBookingReminderNotification({
          lineUserId: booking.user.lineUserId,
          bookingId: booking.id,
          courtName: firstItem.court.name,
          bookingDate: toDateKey(firstItem.date),
          slots: booking.items.map((item) => ({
            startTime: item.startTime,
            endTime: item.endTime,
          })),
        });

        await prisma.booking.update({
          where: { id: booking.id },
          data: {
            notes: appendSystemNote(
              booking.notes,
              marker,
            ),
          },
        });

        reminderCount += 1;
        auditLog({
          event: "booking.reminder_sent",
          actorType: "system",
          bookingId: booking.id,
          organizationId: booking.organizationId,
          meta: {
            startsAt: bookingStart.toISOString(),
          },
        });
      }
    }

    auditLog({
      event: "cron.bookings.completed",
      actorType: "system",
      meta: {
        expiredCount,
        completedCount,
        reminderCount,
      },
    });

    return NextResponse.json({
      success: true,
      expiredCount,
      completedCount,
      reminderCount,
    });
  } catch (error) {
    auditLog({
      event: "cron.bookings.failed",
      level: "error",
      actorType: "system",
      message: error instanceof Error ? error.message : "unknown error",
    });

    return NextResponse.json(
      { error: "ระบบขัดข้อง" },
      { status: 500 },
    );
  }
}
