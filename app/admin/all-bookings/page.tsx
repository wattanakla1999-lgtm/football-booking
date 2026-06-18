import { prisma } from "@/src/lib/prisma";
import {
  createPaginationMeta,
  parsePageParam,
} from "@/src/utils/pagination";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AllBookingsView from "./AllBookingsView";
import type {
  Booking,
  PrismaBookingStatus,
  StatusFilter,
} from "./types/booking";

const PAGE_LIMIT = 10;

type AdminAllBookingsPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    court?: string;
    startDate?: string;
    endDate?: string;
  }>;
};

export default async function AdminAllBookingsPage({
  searchParams,
}: AdminAllBookingsPageProps) {
  const cookieStore = await cookies();
  const adminId = cookieStore.get("admin_session_id")?.value;
  const resolvedSearchParams = await searchParams;

  if (!adminId) {
    redirect("/admin/login");
  }

  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: {
      organizationId: true,
      isActive: true,
    },
  });

  if (!admin || !admin.isActive) {
    redirect("/admin/login");
  }

  const searchKeyword = resolvedSearchParams.q?.trim() || "";

  const statusFilter =
    resolvedSearchParams.status === "pending" ||
    resolvedSearchParams.status === "paid" ||
    resolvedSearchParams.status === "confirmed" ||
    resolvedSearchParams.status === "completed" ||
    resolvedSearchParams.status === "cancelled"
      ? resolvedSearchParams.status
      : "all";

  const bookingStatusFilter =
    statusFilter === "all"
      ? null
      : (statusFilter as PrismaBookingStatus);

  const courtFilter =
    resolvedSearchParams.court?.trim() || "all";
  const startDateFilter =
    resolvedSearchParams.startDate?.trim() || "";
  const endDateFilter =
    resolvedSearchParams.endDate?.trim() || "";

  const baseWhere: Record<string, unknown> = {
    organizationId: admin.organizationId,
  };

  if (searchKeyword) {
    baseWhere.OR = [
      {
        id: {
          contains: searchKeyword,
        },
      },
      {
        user: {
          is: {
            displayName: {
              contains: searchKeyword,
              mode: "insensitive",
            },
          },
        },
      },
      {
        user: {
          is: {
            phone: {
              contains: searchKeyword,
              mode: "insensitive",
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
                  contains: searchKeyword,
                  mode: "insensitive",
                },
              },
            },
          },
        },
      },
    ];
  }

  if (
    courtFilter !== "all" ||
    startDateFilter ||
    endDateFilter
  ) {
    baseWhere.items = {
      some: {
        ...(courtFilter !== "all"
          ? { courtId: courtFilter }
          : {}),
        ...(startDateFilter || endDateFilter
          ? {
              date: {
                ...(startDateFilter
                  ? { gte: new Date(startDateFilter) }
                  : {}),
                ...(endDateFilter
                  ? { lte: new Date(endDateFilter) }
                  : {}),
              },
            }
          : {}),
      },
    };
  }

  const where = {
    ...baseWhere,
    ...(bookingStatusFilter
      ? { status: bookingStatusFilter }
      : {}),
  };

  const [
    total,
    allCount,
    pendingCount,
    paidCount,
    confirmedCount,
    completedCount,
    cancelledCount,
    courtOptions,
  ] = await Promise.all([
    prisma.booking.count({ where }),
    prisma.booking.count({ where: baseWhere }),
    prisma.booking.count({
      where: { ...baseWhere, status: "pending" },
    }),
    prisma.booking.count({
      where: { ...baseWhere, status: "paid" },
    }),
    prisma.booking.count({
      where: { ...baseWhere, status: "confirmed" },
    }),
    prisma.booking.count({
      where: { ...baseWhere, status: "completed" },
    }),
    prisma.booking.count({
      where: { ...baseWhere, status: "cancelled" },
    }),
    prisma.court.findMany({
      where: {
        organizationId: admin.organizationId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  const pagination = createPaginationMeta({
    total,
    page: parsePageParam(resolvedSearchParams.page),
    limit: PAGE_LIMIT,
  });

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          displayName: true,
          phone: true,
          pictureUrl: true,
        },
      },
      items: {
        include: {
          court: {
            select: {
              id: true,
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
    skip: (pagination.page - 1) * PAGE_LIMIT,
    take: PAGE_LIMIT,
  });

  const serializedBookings: Booking[] = bookings.map(
    (booking) => ({
      id: booking.id,
      totalPrice: Number(booking.totalPrice),
      status: booking.status,
      user: {
        id: booking.user.id,
        displayName: booking.user.displayName,
        phone: booking.user.phone,
        pictureUrl: booking.user.pictureUrl,
      },
      items: booking.items.map((item) => ({
        id: item.id,
        date: item.date.toISOString(),
        startTime: item.startTime,
        endTime: item.endTime,
        court: item.court
          ? {
              id: item.court.id,
              name: item.court.name,
            }
          : null,
      })),
    }),
  );

  return (
    <AllBookingsView
      key={`${searchKeyword}:${statusFilter}:${courtFilter}:${startDateFilter}:${endDateFilter}:${pagination.page}`}
      bookings={serializedBookings}
      pagination={pagination}
      title="รายการจองทั้งหมด"
      initialFilters={{
        searchKeyword,
        statusFilter: statusFilter as StatusFilter,
        courtFilter,
        startDateFilter,
        endDateFilter,
      }}
      courtOptions={courtOptions.map((court) => ({
        value: court.id,
        label: court.name,
      }))}
      summaryCounts={{
        all: allCount,
        pending: pendingCount,
        paid: paidCount,
        confirmed: confirmedCount,
        completed: completedCount,
        cancelled: cancelledCount,
      }}
    />
  );
}