import { Prisma } from "@prisma/client";

import type {
  BookingStatusSummary,
  StatusFilter,
} from "./types/booking";
import { HISTORY_PAGE_LIMIT } from "./constants";
import { EMPTY_STATUS_SUMMARY } from "./utils/booking";
import { prisma } from "@/src/lib/prisma";
import type { PaginationMeta } from "@/src/types/pagination";
import {
  createPaginationMeta,
  parsePageParam,
} from "@/src/utils/pagination";

export type HistoryBooking = {
  id: string;
  totalPrice: string;
  status:
    | "pending"
    | "confirmed"
    | "cancelled"
    | "completed"
    | "expired"
    | "no_show";
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
};

export type HistoryBookingQuery = {
  limit?: number;
  page?: number;
  searchKeyword?: string;
  statusFilter?: StatusFilter;
};

export type HistoryBookingPageData = {
  bookings: HistoryBooking[];
  pagination: PaginationMeta;
  totalBookings: number;
  statusSummary: BookingStatusSummary;
};

function buildHistoryBookingWhere(
  userId: string,
  {
    searchKeyword = "",
    statusFilter = "all",
  }: Pick<
    HistoryBookingQuery,
    "searchKeyword" | "statusFilter"
  >,
): Prisma.BookingWhereInput {
  const keyword = searchKeyword.trim();
  const where: Prisma.BookingWhereInput = {
    userId,
  };

  if (statusFilter !== "all") {
    where.status = statusFilter;
  }

  if (!keyword) {
    return where;
  }

  return {
    ...where,
    OR: [
      {
        id: {
          contains: keyword,
          mode: "insensitive",
        },
      },
      {
        items: {
          some: {
            court: {
              name: {
                contains: keyword,
                mode: "insensitive",
              },
            },
          },
        },
      },
      {
        items: {
          some: {
            court: {
              surface: {
                contains: keyword,
                mode: "insensitive",
              },
            },
          },
        },
      },
    ],
  };
}

function mapStatusSummary(
  rows: Array<{
    status: HistoryBooking["status"];
    _count: { _all: number };
  }>,
): BookingStatusSummary {
  return rows.reduce<BookingStatusSummary>(
    (summary, row) => {
      summary[row.status] = row._count._all;
      summary.all += row._count._all;
      return summary;
    },
    { ...EMPTY_STATUS_SUMMARY },
  );
}

function mapHistoryBookings(
  bookings: Array<{
    id: string;
    totalPrice: Prisma.Decimal;
    status: HistoryBooking["status"];
    createdAt: Date;
    items: Array<{
      id: string;
      date: Date;
      startTime: string;
      endTime: string;
      price: Prisma.Decimal;
      court: {
        name: string;
        surface: string | null;
      };
    }>;
  }>,
): HistoryBooking[] {
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
  }));
}

export async function getHistoryBookingPageByUserId(
  userId: string,
  query: HistoryBookingQuery = {},
): Promise<HistoryBookingPageData> {
  const limit = Math.max(
    1,
    Math.floor(query.limit ?? HISTORY_PAGE_LIMIT),
  );
  const requestedPage = parsePageParam(
    String(query.page ?? 1),
  );
  const filteredWhere = buildHistoryBookingWhere(
    userId,
    query,
  );

  const [filteredTotal, statusRows] =
    await Promise.all([
      prisma.booking.count({
        where: filteredWhere,
      }),
      prisma.booking.groupBy({
        by: ["status"],
        where: {
          userId,
        },
        _count: {
          _all: true,
        },
      }),
    ]);

  const pagination = createPaginationMeta({
    total: filteredTotal,
    page: requestedPage,
    limit,
  });

  const bookings = await prisma.booking.findMany({
    where: filteredWhere,
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
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (pagination.page - 1) * pagination.limit,
    take: pagination.limit,
  });

  return {
    bookings: mapHistoryBookings(bookings),
    pagination,
    totalBookings: statusRows.reduce(
      (total, row) => total + row._count._all,
      0,
    ),
    statusSummary: mapStatusSummary(
      statusRows as Array<{
        status: HistoryBooking["status"];
        _count: { _all: number };
      }>,
    ),
  };
}
