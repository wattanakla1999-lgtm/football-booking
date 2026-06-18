import apiClient from "@/lib/apiClient";

import type {
    CustomerMode,
    CourtAvailability,
    CustomerSearchItem,
    ManualBookingStatus,
    ManualPaymentStatus,
    Slot,
} from "../types/availability";

export interface AvailabilityResponse {
    courts: CourtAvailability[];
    message?: string;
}

export interface CreateAdminBookingPayload {
    courtId: string;
    date: string;
    slots: Slot[];
    customerMode: CustomerMode;
    existingCustomerId?: string;
    customerName: string;
    customerPhone: string;
    bookingStatus: ManualBookingStatus;
    paymentStatus: ManualPaymentStatus;
}

export interface CreateAdminBookingResponse {
    bookingId: string;
    message?: string;
}

export interface SearchCustomersResponse {
    customers: CustomerSearchItem[];
}

export async function getAvailability(
    date: string,
): Promise<AvailabilityResponse> {
    const response =
        await apiClient.get<AvailabilityResponse>(
            "/admin/availability",
            {
                params: {
                    date,
                },
            },
        );

    return response.data;
}

export async function createAdminBooking(
    payload: CreateAdminBookingPayload,
): Promise<CreateAdminBookingResponse> {
    const response =
        await apiClient.post<CreateAdminBookingResponse>(
            "/admin/bookings/create",
            payload,
        );
    return response.data;
}
