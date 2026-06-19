export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "expired"
  | "no_show";

export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  "pending",
  "confirmed",
];

export const CUSTOMER_CANCELLABLE_BOOKING_STATUSES: BookingStatus[] =
  ["pending", "confirmed"];

export function normalizeBookingStatus(
  status: string,
): BookingStatus {
  if (
    status === "pending" ||
    status === "confirmed" ||
    status === "cancelled" ||
    status === "completed" ||
    status === "expired" ||
    status === "no_show"
  ) {
    return status;
  }

  if (status === "paid") {
    return "pending";
  }

  return "pending";
}
