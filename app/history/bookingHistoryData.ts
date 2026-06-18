import { prisma } from "@/src/lib/prisma";

export type HistoryBooking = {
  id: string;
  totalPrice: string;
  status:
    | "pending"
    | "paid"
    | "confirmed"
    | "cancelled"
    | "completed";
  createdAt: string;
  items: Array<{
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    price: string;
    court: {
      name: string;
      surface: string | null;
    };
  }>;
  payment: {
    id: string;
    status: string;
  } | null;
};

export async function getHistoryBookingsByUserId(
  userId: string,
): Promise<HistoryBooking[]> {
  const bookings = await prisma.booking.findMany({
    where: { userId },
    select: {
      id: true,
      totalPrice: true,
      status: true,
      createdAt: true,
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
              surface: true,
            },
          },
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      },
      payment: {
        select: {
          id: true,
          status: true,
        },
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
    items: booking.items.map((item) => ({
      id: item.id,
      date: item.date.toISOString(),
      startTime: item.startTime,
      endTime: item.endTime,
      price: item.price.toString(),
      court: {
        name: item.court.name,
        surface: item.court.surface,
      },
    })),
    payment: booking.payment
      ? {
          id: booking.payment.id,
          status: booking.payment.status,
        }
      : null,
  }));
}
