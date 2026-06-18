import type {
  Booking,
  StatusFilter,
} from "../types/booking";
import { bookingStatusMeta } from "@/src/constants/statusColors";

export const STATUS_CONFIG: Record<
  Exclude<StatusFilter, "all">,
  {
    label: string;
    dotColor: string;
    bgColor: string;
    textColor: string;
  }
> = {
  pending: {
    label: bookingStatusMeta.pending.shortLabel,
    dotColor: bookingStatusMeta.pending.dotColor,
    bgColor: bookingStatusMeta.pending.bgColor,
    textColor: bookingStatusMeta.pending.textColor,
  },
  paid: {
    label: bookingStatusMeta.paid.shortLabel,
    dotColor: bookingStatusMeta.paid.dotColor,
    bgColor: bookingStatusMeta.paid.bgColor,
    textColor: bookingStatusMeta.paid.textColor,
  },
  confirmed: {
    label: bookingStatusMeta.confirmed.shortLabel,
    dotColor: bookingStatusMeta.confirmed.dotColor,
    bgColor: bookingStatusMeta.confirmed.bgColor,
    textColor: bookingStatusMeta.confirmed.textColor,
  },
  cancelled: {
    label: bookingStatusMeta.cancelled.shortLabel,
    dotColor: bookingStatusMeta.cancelled.dotColor,
    bgColor: bookingStatusMeta.cancelled.bgColor,
    textColor: bookingStatusMeta.cancelled.textColor,
  },
  completed: {
    label: bookingStatusMeta.completed.shortLabel,
    dotColor: bookingStatusMeta.completed.dotColor,
    bgColor: bookingStatusMeta.completed.bgColor,
    textColor: bookingStatusMeta.completed.textColor,
  },
};

export const FILTER_TABS: {
  key: StatusFilter;
  label: string;
}[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pending", label: "รอชำระ" },
  { key: "paid", label: "รอตรวจสอบ" },
  { key: "confirmed", label: "ยืนยันแล้ว" },
  { key: "completed", label: "เสร็จสิ้น" },
  { key: "cancelled", label: "ยกเลิก" },
];

export function getStatusCounts(bookings: Booking[]) {
  return {
    all: bookings.length,
    pending: bookings.filter((booking) => booking.status === "pending").length,
    paid: bookings.filter((booking) => booking.status === "paid").length,
    confirmed: bookings.filter((booking) => booking.status === "confirmed").length,
    cancelled: bookings.filter((booking) => booking.status === "cancelled").length,
    completed: bookings.filter((booking) => booking.status === "completed").length,
  };
}
