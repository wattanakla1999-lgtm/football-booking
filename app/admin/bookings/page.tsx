import { prisma } from "@/src/lib/prisma";
import { getAdminSessionId } from "@/src/lib/session";
import { normalizeBookingStatus } from "@/src/lib/bookingStatus";
import type { Prisma } from "@prisma/client";
import {
  createPaginationMeta,
  parsePageParam,
} from "@/src/utils/pagination";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PrismaBookingStatus } from "../all-bookings/types/booking";
import AdminBookingsTable from "./AdminBookingsTable";

export const metadata: Metadata = {
  title: "รายการจองทั้งหมด — Admin",
  description: "ดูรายการจองสนามฟุตบอลทั้งหมดในรูปแบบตาราง",
};

const PAGE_LIMIT = 10;

type AdminBookingsPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
  }>;
};

export default async function AdminBookingsPage({
  searchParams,
}: AdminBookingsPageProps) {
  const adminId = await getAdminSessionId();
  const resolvedSearchParams = await searchParams;
  const searchQuery =
    resolvedSearchParams.q?.trim() || "";
  const statusFilter =
    resolvedSearchParams.status === "pending" ||
    resolvedSearchParams.status === "confirmed" ||
    resolvedSearchParams.status === "cancelled" ||
    resolvedSearchParams.status === "completed" ||
    resolvedSearchParams.status === "expired" ||
    resolvedSearchParams.status === "no_show"
      ? resolvedSearchParams.status
      : "all";
  const bookingStatusFilter =
    statusFilter === "all"
      ? null
      : (statusFilter as PrismaBookingStatus);

  if (!adminId) {
    redirect("/admin/login");
  }

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: {
      displayName: true,
      role: true,
      isActive: true,
      organizationId: true,
    },
  });

  if (!admin || !admin.isActive) {
    redirect("/admin/login");
  }

  const baseWhere: Prisma.BookingWhereInput = {
    organizationId: admin.organizationId,
    ...(searchQuery
      ? {
          OR: [
            {
              id: {
                contains: searchQuery,
                mode: "insensitive" as const,
              },
            },
            {
              user: {
                is: {
                  displayName: {
                    contains: searchQuery,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
            {
              user: {
                is: {
                  phone: {
                    contains: searchQuery,
                    mode: "insensitive" as const,
                  },
                },
              },
            },
            {
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
          ],
        }
      : {}),
  };

  const where: Prisma.BookingWhereInput = {
    ...baseWhere,
    ...(bookingStatusFilter
      ? { status: bookingStatusFilter }
      : {}),
  };

  const [
    total,
    allCount,
    pendingCount,
    confirmedCount,
    cancelledCount,
    completedCount,
    expiredCount,
    noShowCount,
  ] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.count({ where: baseWhere }),
    prisma.booking.count({
      where: { ...baseWhere, status: "pending" },
    }),
    prisma.booking.count({
      where: {
        ...baseWhere,
        status: "confirmed",
      },
    }),
    prisma.booking.count({
      where: {
        ...baseWhere,
        status: "cancelled",
      },
    }),
    prisma.booking.count({
      where: {
        ...baseWhere,
        status: "completed",
      },
    }),
    prisma.booking.count({
      where: {
        ...baseWhere,
        status: "expired",
      },
    }),
    prisma.booking.count({
      where: {
        ...baseWhere,
        status: "no_show",
      },
    }),
  ]);

  const pagination = createPaginationMeta({
    total,
    page: parsePageParam(
      resolvedSearchParams.page,
    ),
    limit: PAGE_LIMIT,
  });

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      user: {
        select: {
          displayName: true,
          pictureUrl: true,
          lineUserId: true,
          phone: true,
        },
      },
      items: {
        include: {
          court: {
            select: { name: true },
          },
        },
        orderBy: { startTime: "asc" },
      },
      payment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (pagination.page - 1) * PAGE_LIMIT,
    take: PAGE_LIMIT,
  });

  const serializedBookings = bookings.map((booking) => ({
    id: booking.id,
    totalPrice: booking.totalPrice.toString(),
    status: normalizeBookingStatus(booking.status),
    notes: booking.notes,
    createdAt: booking.createdAt.toISOString(),
    user: {
      displayName: booking.user.displayName,
      pictureUrl: booking.user.pictureUrl,
      lineUserId: booking.user.lineUserId,
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
    payment: null,
  }));

  return (
    <div className="flex flex-col gap-lg">
      <AdminBookingsTable
        key={`${searchQuery}:${statusFilter}:${pagination.page}`}
        initialBookings={serializedBookings}
        pagination={pagination}
        initialSearchQuery={searchQuery}
        initialStatusFilter={statusFilter}
        statusCounts={{
          all: allCount,
          pending: pendingCount,
          confirmed: confirmedCount,
          cancelled: cancelledCount,
          completed: completedCount,
          expired: expiredCount,
          no_show: noShowCount,
        }}
      />
    </div>
  );
}
