import { Prisma } from "@prisma/client";

import { ACTIVE_BOOKING_STATUSES } from "@/src/lib/bookingStatus";

type BookingSlotPayload = {
  startTime: string;
  endTime: string;
};

export const SLOT_CONFLICT_ERROR = "BOOKING_SLOT_CONFLICT";

function parseHour(time: string) {
  return Number.parseInt(time.split(":")[0] ?? "0", 10);
}

function overlaps(
  left: BookingSlotPayload,
  right: BookingSlotPayload,
) {
  const leftStart = parseHour(left.startTime);
  const leftEnd = parseHour(left.endTime);
  const rightStart = parseHour(right.startTime);
  const rightEnd = parseHour(right.endTime);

  return leftStart < rightEnd && leftEnd > rightStart;
}

export async function lockBookingSlots(
  tx: Prisma.TransactionClient,
  courtId: string,
  date: string,
  slots: BookingSlotPayload[],
) {
  const sortedSlots = [...slots].sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
  );

  for (const slot of sortedSlots) {
    await tx.$queryRaw`
      SELECT pg_advisory_xact_lock(
        hashtext(${`${courtId}:${date}:${slot.startTime}:${slot.endTime}`})
      )
    `;
  }
}

export async function findConflictingBookingItems(
  tx: Prisma.TransactionClient,
  courtId: string,
  targetDate: Date,
  slots: BookingSlotPayload[],
) {
  const existingItems = await tx.bookingItem.findMany({
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
      id: true,
      startTime: true,
      endTime: true,
      booking: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  return existingItems.filter((item) =>
    slots.some((slot) =>
      overlaps(slot, {
        startTime: item.startTime,
        endTime: item.endTime,
      }),
    ),
  );
}

export function isBookingSlotConflictError(error: unknown) {
  if (
    error instanceof Error &&
    error.message === SLOT_CONFLICT_ERROR
  ) {
    return true;
  }

  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}
