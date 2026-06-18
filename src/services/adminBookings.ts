import apiClient from "@/lib/apiClient";

import type {
  Booking as AdminBooking,
  BookingStatus as AdminBookingStatus,
} from "@/app/admin/bookings/types/booking";

import type {
  Booking as AllBooking,
  BookingStatus as AllBookingStatus,
} from "@/app/admin/all-bookings/types/booking";

type BookingsResponse<TBooking> = {
  bookings?: TBooking[];
};

export async function fetchAdminBookings<
  TBooking = AdminBooking,
>(): Promise<TBooking[]> {
  const response =
    await apiClient.get<BookingsResponse<TBooking> | TBooking[]>(
      "/admin/bookings",
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );

  return Array.isArray(response.data)
    ? response.data
    : response.data.bookings || [];
}

export async function updateAdminBookingStatus(
  bookingId: string,
  status: AdminBookingStatus | AllBookingStatus,
) {
  const response =
    await apiClient.patch<{ success: true }>(
      "/admin/bookings",
      {
        bookingId,
        status,
      },
    );

  return response.data;
}

export type {
  AdminBooking,
  AllBooking,
};
