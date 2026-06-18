import { prisma } from "@/src/lib/prisma";
import type { AdminBooking } from "./types/adminBooking";

export async function getAdminBookingsByOrganizationId(
  organizationId: string,
): Promise<AdminBooking[]> {
  const bookings = await prisma.booking.findMany({
    where: { organizationId },
    select: {
      id: true,
      totalPrice: true,
      status: true,
      createdAt: true,
      user: {
        select: {
          displayName: true,
          pictureUrl: true,
          phone: true,
        },
      },
      items: {
        select: {
          id: true,
          date: true,
          startTime: true,
          endTime: true,
          price: true,
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
    orderBy: {
      createdAt: "desc",
    },
  });

  return bookings.map((booking) => ({
    id: booking.id,
    totalPrice: booking.totalPrice.toString(),
    status: booking.status,
    createdAt: booking.createdAt.toISOString(),
    user: {
      displayName: booking.user.displayName,
      pictureUrl: booking.user.pictureUrl,
      phone: booking.user.phone,
    },
    items: booking.items.map((item) => ({
      id: item.id,
      date: item.date.toISOString(),
      startTime: item.startTime,
      endTime: item.endTime,
      price: item.price.toString(),
      court: {
        name: item.court.name,
      },
    })),
  }));
}
