import { prisma } from "@/src/lib/prisma";
import { sanitizeBookingNotes } from "@/src/lib/bookingNotes";
import { ACTIVE_BOOKING_STATUSES } from "@/src/lib/bookingStatus";
import type { CourtAvailability } from "./types/availability";

export type AdminAvailabilityData = {
  courts: CourtAvailability[];
  message: string;
};

export async function getAdminAvailabilityData(params: {
  organizationId: string;
  targetDate: Date;
}): Promise<AdminAvailabilityData> {
  const { organizationId, targetDate } = params;
  const dayOfWeek = targetDate.getDay();

  const operatingHour = await prisma.operatingHour.findUnique({
    where: {
      organizationId_dayOfWeek: {
        organizationId,
        dayOfWeek,
      },
    },
  });

  if (!operatingHour || operatingHour.isClosed) {
    return {
      courts: [],
      message: "ปิดให้บริการในวันนี้",
    };
  }

  const holiday = await prisma.holiday.findUnique({
    where: {
      organizationId_date: {
        organizationId,
        date: targetDate,
      },
    },
  });

  if (holiday?.isClosed) {
    return {
      courts: [],
      message: holiday.description || "วันหยุด",
    };
  }

  const courts = await prisma.court.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    orderBy: { name: "asc" },
  });

  const existingItems = await prisma.bookingItem.findMany({
    where: {
      date: targetDate,
      courtId: { in: courts.map((court) => court.id) },
      booking: {
        status: {
          in: ACTIVE_BOOKING_STATUSES,
        },
      },
    },
    include: {
      booking: {
        select: {
          id: true,
          status: true,
          notes: true,
          user: {
            select: { displayName: true, phone: true },
          },
        },
      },
    },
  });

  const openHour = parseInt(operatingHour.openTime.split(":")[0]);
  let closeHour = parseInt(operatingHour.closeTime.split(":")[0]);

  if (closeHour === 0 && openHour === 0) {
    closeHour = 24;
  } else if (closeHour <= openHour) {
    closeHour += 24;
  }

  const courtsWithSlots: CourtAvailability[] = courts.map((court) => {
    const slots = [];

    for (let h = openHour; h < closeHour; h++) {
      const displayStartH = h % 24;
      const displayEndH = (h + 1) % 24;
      const startTime = `${displayStartH.toString().padStart(2, "0")}:00`;
      const endTime = `${displayEndH.toString().padStart(2, "0")}:00`;

      const matchedItem = existingItems.find((item) => {
        if (item.courtId !== court.id) {
          return false;
        }

        const itemStart = parseInt(item.startTime.split(":")[0]);
        let itemEnd = parseInt(item.endTime.split(":")[0]);

        if (itemEnd === 0 && itemStart === 0) itemEnd = 24;
        else if (itemEnd <= itemStart) itemEnd += 24;

        return h < itemEnd && h + 1 > itemStart;
      });

      slots.push({
        startTime,
        endTime,
        isAvailable: !matchedItem,
        bookedBy: matchedItem?.booking?.user?.displayName || null,
        customerPhone: matchedItem?.booking?.user?.phone || null,
        bookingStatus: matchedItem?.booking?.status || null,
        bookingId: matchedItem?.booking?.id || null,
        notes: sanitizeBookingNotes(
          matchedItem?.booking?.notes,
        ),
      });
    }

    return {
      id: court.id,
      name: court.name,
      slots,
    };
  });

  return {
    courts: courtsWithSlots,
    message: "",
  };
}
