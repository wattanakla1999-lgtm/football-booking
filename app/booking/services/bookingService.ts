import apiClient from "@/lib/apiClient";

import type {
  Court,
  TimeSlot,
} from "../types/booking";

export async function getCourts(): Promise<Court[]> {
  const response =
    await apiClient.get<{ courts?: Court[] }>("/courts");

  return response.data.courts || [];
}

export async function getAvailability({
  courtId,
  date,
}: {
  courtId: string;
  date: string;
}): Promise<TimeSlot[]> {
  const response =
    await apiClient.get<{ slots?: TimeSlot[] }>(
      "/availability",
      {
        params: {
          courtId,
          date,
        },
      },
    );

  return response.data.slots || [];
}

export async function createBooking({
  courtId,
  date,
  slots,
  phone,
}: {
  courtId: string;
  date: string;
  slots: TimeSlot[];
  phone: string;
}) {
  const response =
    await apiClient.post<{
      success?: boolean;
      bookingId?: string;
    }>(
      "/bookings",
      {
        courtId,
        date,
        slots,
        phone,
      },
    );

  return response.data;
}
