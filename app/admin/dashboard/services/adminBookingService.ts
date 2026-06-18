import apiClient from "@/lib/apiClient";

import type {
  AdminBooking,
  AdminBookingResponse,
  UpdateBookingStatusPayload,
  UpdateBookingStatusResponse,
} from "../types/adminBooking";

type AdminBookingApiResponse =
  | AdminBooking[]
  | AdminBookingResponse;

export async function getAdminBookings(): Promise<AdminBooking[]> {
  const response =
    await apiClient.get<AdminBookingApiResponse>(
      "/admin/bookings",
    );

  const data = response.data;

  if (Array.isArray(data)) {
    return data;
  }

  return Array.isArray(data.bookings)
    ? data.bookings
    : [];
}

export async function updateAdminBookingStatus(
  payload: UpdateBookingStatusPayload,
): Promise<UpdateBookingStatusResponse> {
  const response =
    await apiClient.patch<UpdateBookingStatusResponse>(
      "/admin/bookings",
      payload,
    );

  return response.data;
}
