import { prisma } from "@/src/lib/prisma";
import type { Court } from "./types/booking";

export async function getBookingCourtsByOrganizationId(
  organizationId: string,
): Promise<Court[]> {
  const courts = await prisma.court.findMany({
    where: {
      organizationId,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      surface: true,
      maxPlayers: true,
      pricePerHour: true,
      images: {
        where: { isPrimary: true },
        select: {
          url: true,
        },
        take: 1,
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  return courts.map((court) => ({
    id: court.id,
    name: court.name,
    surface: court.surface,
    maxPlayers: court.maxPlayers,
    pricePerHour: Number(court.pricePerHour),
    images: court.images.map((image) => ({
      url: image.url,
    })),
  }));
}
