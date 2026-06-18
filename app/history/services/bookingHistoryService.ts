import apiClient from "@/lib/apiClient";

import type {
  Booking,
  BookingStatusSummary,
  StatusFilter,
} from "../types/booking";
import type { PaginationMeta } from "@/src/types/pagination";

export interface BookingHistoryResponse {
  bookings: Booking[];
  pagination: PaginationMeta;
  totalBookings: number;
  statusSummary: BookingStatusSummary;
  message?: string;
}

export async function getUserBookings(
  {
    limit,
    page,
    searchKeyword,
    statusFilter,
  }: {
    limit: number;
    page: number;
    searchKeyword: string;
    statusFilter: StatusFilter;
  },
  signal?: AbortSignal,
): Promise<BookingHistoryResponse> {
  const response =
    await apiClient.get<BookingHistoryResponse>(
      "/user/bookings",
      {
        params: {
          limit,
          page,
          search: searchKeyword,
          status: statusFilter,
        },
        signal,
      },
    );

  return response.data;
}
