import { BookingStatusBadge } from "@/src/components/common";
import type { BookingStatus } from "../types/booking";

type StatusBadgeProps = {
  status: BookingStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <BookingStatusBadge status={status} tone="history" />;
}
