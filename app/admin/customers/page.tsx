import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/src/lib/prisma";

import type { PaginationMeta } from "@/src/types/pagination";
import {
  createPaginationMeta,
  parsePageParam,
} from "@/src/utils/pagination";
import CustomersListView from "./CustomersListView";
import type { CustomerSummary } from "./types/customer";

export const metadata: Metadata = {
  title: "รายชื่อลูกค้า — Admin",
  description: "ดูรายชื่อลูกค้าและประวัติการใช้งาน",
};

const PAGE_LIMIT = 10;

type AdminCustomersPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
  }>;
};

export default async function AdminCustomersPage({
  searchParams,
}: AdminCustomersPageProps) {
  const cookieStore = await cookies();
  const adminId = cookieStore.get("admin_session_id")?.value;
  const resolvedSearchParams = await searchParams;
  const searchQuery =
    resolvedSearchParams.q?.trim() || "";

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

const where: Record<string, any> = {
    organizationId: admin.organizationId,
    ...(searchQuery
      ? {
          OR: [
            {
              displayName: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
            {
              phone: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
            {
              email: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
            {
              bookings: {
                some: {
                  items: {
                    some: {
                      court: {
                        is: {
                          name: {
                            contains: searchQuery,
                            mode: "insensitive" as const,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const total = await prisma.user.count({
    where,
  });

  const requestedPage = parsePageParam(
    resolvedSearchParams.page,
  );

  const pagination: PaginationMeta =
    createPaginationMeta({
      total,
      page: requestedPage,
      limit: PAGE_LIMIT,
    });

  const users = await prisma.user.findMany({
    where,
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
    skip: (pagination.page - 1) * PAGE_LIMIT,
    take: PAGE_LIMIT,
  });

  const [
    totalCustomers,
    activeCustomers,
    offlineCustomers,
    revenueAggregate,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        organizationId: admin.organizationId,
      },
    }),
    prisma.user.count({
      where: {
        organizationId: admin.organizationId,
        isActive: true,
      },
    }),
    prisma.user.count({
      where: {
        organizationId: admin.organizationId,
        lineUserId: {
          startsWith: "offline_",
        },
      },
    }),
    prisma.booking.aggregate({
      where: {
        organizationId: admin.organizationId,
        status: {
          in: [
            "paid",
            "confirmed",
            "completed",
          ],
        },
      },
      _sum: {
        totalPrice: true,
      },
    }),
  ]);

  const customers: CustomerSummary[] = users.map((user : any) => {
    const lastBooking = [...user.bookings].sort(
      (left, right) =>
        right.createdAt.getTime() - left.createdAt.getTime(),
    )[0];

const courtCounts = user.bookings
  .flatMap((booking: any) =>
    booking.items.map((item: any) => item.court.name),
  )
  .reduce(
    (map: Map<string, number>, courtName: string) => {
      map.set(courtName, (map.get(courtName) || 0) + 1);
      return map;
    },
    new Map<string, number>(),
  );

    const favoriteCourt =
      [...courtCounts.entries()].sort(
        (left, right) => right[1] - left[1],
      )[0]?.[0] || null;

    const activeBookings = user.bookings.filter(
      (booking : { status: string }) =>
        booking.status === "pending" ||
        booking.status === "paid" ||
        booking.status === "confirmed",
    ).length;

    const completedBookings = user.bookings.filter(
      (booking : { status: string }) => booking.status === "completed",
    ).length;

    const cancelledBookings = user.bookings.filter(
      (booking : { status: string }) => booking.status === "cancelled",
    ).length;

const totalSpent = user.bookings.reduce(
  (sum: number, booking: { status: string; totalPrice: string }) =>
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
      <CustomersListView
        key={`${searchQuery}:${pagination.page}`}
        customers={customers}
        pagination={pagination}
        initialSearchQuery={searchQuery}
        summary={{
          total: totalCustomers,
          active: activeCustomers,
          offline: offlineCustomers,
          revenue: Number(
            revenueAggregate._sum.totalPrice || 0,
          ),
        }}
      />
    </div>
  );
}
