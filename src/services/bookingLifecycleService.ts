import { prisma } from "@/src/lib/prisma";

type CompleteExpiredBookingsResult = {
  updatedCount: number;
  updatedBookingIds: string[];
};

function getTimeZoneOffsetMs(
  date: Date,
  timeZone: string,
) {
  const formatter =
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  const parts = formatter.formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter(
        (part) => part.type !== "literal",
      )
      .map((part) => [part.type, part.value]),
  );

  const utcTimestamp = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );

  return utcTimestamp - date.getTime();
}

function toUtcFromLocalDateTime(
  dateValue: Date,
  timeValue: string,
  timeZone: string,
) {
  const [hours, minutes] = timeValue
    .split(":")
    .map(Number);

  const year = dateValue.getUTCFullYear();
  const month = dateValue.getUTCMonth();
  const day = dateValue.getUTCDate();
  const utcGuess = Date.UTC(
    year,
    month,
    day,
    hours || 0,
    minutes || 0,
    0,
    0,
  );

  const offsetMs = getTimeZoneOffsetMs(
    new Date(utcGuess),
    timeZone,
  );

  return utcGuess - offsetMs;
}

function getLatestBookingEndMs(
  items: Array<{
    date: Date;
    endTime: string;
  }>,
  timeZone: string,
) {
  return items.reduce((latestMs, item) => {
    const endMs = toUtcFromLocalDateTime(
      item.date,
      item.endTime,
      timeZone,
    );

    return Math.max(latestMs, endMs);
  }, Number.NEGATIVE_INFINITY);
}

export async function completeExpiredBookings(): Promise<CompleteExpiredBookingsResult> {
  const candidateBookings =
    await prisma.booking.findMany({
      where: {
        status: {
          in: ["pending", "paid", "confirmed"],
        },
        items: {
          some: {},
        },
      },
      select: {
        id: true,
        organization: {
          select: {
            timezone: true,
          },
        },
        items: {
          select: {
            date: true,
            endTime: true,
          },
        },
      },
    });

  const nowMs = Date.now();
  const expiredBookingIds =
    candidateBookings
      .filter((booking) => {
        const timeZone =
          booking.organization.timezone ||
          "Asia/Bangkok";

        const latestEndMs =
          getLatestBookingEndMs(
            booking.items,
            timeZone,
          );

        return (
          Number.isFinite(latestEndMs) &&
          latestEndMs <= nowMs
        );
      })
      .map((booking) => booking.id);

  if (expiredBookingIds.length === 0) {
    return {
      updatedCount: 0,
      updatedBookingIds: [],
    };
  }

  const updateResult =
    await prisma.booking.updateMany({
      where: {
        id: {
          in: expiredBookingIds,
        },
        status: {
          in: ["pending", "paid", "confirmed"],
        },
      },
      data: {
        status: "completed",
      },
    });

  return {
    updatedCount: updateResult.count,
    updatedBookingIds: expiredBookingIds,
  };
}
