import apiClient from "@/lib/apiClient";

import type { Booking } from "../types/booking";

export interface BookingHistoryResponse {
  bookings: Booking[];
  message?: string;
}

type BookingHistoryApiResponse =
  | Booking[]
  | BookingHistoryResponse;

export async function getUserBookings(
  signal?: AbortSignal,
): Promise<Booking[]> {
  const response =
    await apiClient.get<BookingHistoryApiResponse>(
      "/user/bookings",
      {
        signal,
      },
    );

  const data = response.data;

  if (Array.isArray(data)) {
    return data;
  }

  return Array.isArray(data.bookings)
    ? data.bookings
    : [];
}
