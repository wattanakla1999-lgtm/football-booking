import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { prisma } from "@/src/lib/prisma";

import CustomersListView from "./CustomersListView";
import type { CustomerSummary } from "./types/customer";

export const metadata: Metadata = {
  title: "รายชื่อลูกค้า — Admin",
  description: "ดูรายชื่อลูกค้าและประวัติการใช้งาน",
};

export default async function AdminCustomersPage() {
  const cookieStore = await cookies();
  const adminId = cookieStore.get("admin_session_id")?.value;

  if (!adminId) {
    redirect("/admin/login");
  }

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: {
      isActive: true,
      organizationId: true,
    },
  });

  if (!admin || !admin.isActive) {
    redirect("/admin/login");
  }

  const users = await prisma.user.findMany({
    where: {
      organizationId: admin.organizationId,
    },
    include: {
      bookings: {
        select: {
          id: true,
          createdAt: true,
          status: true,
          totalPrice: true,
          items: {
            select: {
              court: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const customers: CustomerSummary[] = users.map((user) => {
    const lastBooking = [...user.bookings].sort(
      (left, right) =>
        right.createdAt.getTime() - left.createdAt.getTime(),
    )[0];

    const courtCounts = user.bookings
      .flatMap((booking) =>
        booking.items.map((item) => item.court.name),
      )
      .reduce<Map<string, number>>((map, courtName) => {
        map.set(courtName, (map.get(courtName) || 0) + 1);
        return map;
      }, new Map());

    const favoriteCourt =
      [...courtCounts.entries()].sort(
        (left, right) => right[1] - left[1],
      )[0]?.[0] || null;

    const activeBookings = user.bookings.filter(
      (booking) =>
        booking.status === "pending" ||
        booking.status === "paid" ||
        booking.status === "confirmed",
    ).length;

    const completedBookings = user.bookings.filter(
      (booking) => booking.status === "completed",
    ).length;

    const cancelledBookings = user.bookings.filter(
      (booking) => booking.status === "cancelled",
    ).length;

    const totalSpent = user.bookings.reduce(
      (sum, booking) =>
        booking.status === "paid" ||
        booking.status === "confirmed" ||
        booking.status === "completed"
          ? sum + Number(booking.totalPrice)
          : sum,
      0,
    );

    return {
      id: user.id,
      displayName: user.displayName,
      pictureUrl: user.pictureUrl,
      phone: user.phone,
      email: user.email,
      lineUserId: user.lineUserId,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      lastBookingAt: lastBooking
        ? lastBooking.createdAt.toISOString()
        : null,
      totalBookings: user.bookings.length,
      activeBookings,
      completedBookings,
      cancelledBookings,
      totalSpent,
      favoriteCourt,
      source: user.lineUserId.startsWith("offline_")
        ? "offline"
        : "line",
      status: user.isActive ? "active" : "inactive",
    };
  });

  return (
    <div className="flex flex-col gap-lg">
      <CustomersListView customers={customers} />
    </div>
  );
}
