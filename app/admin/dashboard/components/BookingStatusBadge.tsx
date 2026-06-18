import { BookingStatusBadge as SharedBookingStatusBadge } from "@/src/components/common";
import type {
  BookingStatus,
} from "../types/adminBooking";

type BookingStatusBadgeProps = {
  status: BookingStatus;
};

export function BookingStatusBadge({
  status,
}: BookingStatusBadgeProps) {
  return (
    <SharedBookingStatusBadge
      status={status}
      tone="dashboard"
    />
  );
}
