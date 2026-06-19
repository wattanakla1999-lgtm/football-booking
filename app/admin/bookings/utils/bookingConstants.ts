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
  expired: {
    label: bookingStatusMeta.expired.shortLabel,
    dotColor: bookingStatusMeta.expired.dotColor,
    bgColor: bookingStatusMeta.expired.bgColor,
    textColor: bookingStatusMeta.expired.textColor,
  },
  no_show: {
    label: bookingStatusMeta.no_show.shortLabel,
    dotColor: bookingStatusMeta.no_show.dotColor,
    bgColor: bookingStatusMeta.no_show.bgColor,
    textColor: bookingStatusMeta.no_show.textColor,
  },
};

export const FILTER_TABS: {
  key: StatusFilter;
  label: string;
}[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "pending", label: "รอแอดมินยืนยัน" },
  { key: "confirmed", label: "ยืนยันแล้ว" },
  { key: "completed", label: "เสร็จสิ้น" },
  { key: "expired", label: "หมดเวลารอ" },
  { key: "no_show", label: "ลูกค้าไม่มา" },
  { key: "cancelled", label: "ยกเลิก" },
];

export function getStatusCounts(bookings: Booking[]) {
  return {
    all: bookings.length,
    pending: bookings.filter((booking) => booking.status === "pending").length,
    confirmed: bookings.filter((booking) => booking.status === "confirmed").length,
    cancelled: bookings.filter((booking) => booking.status === "cancelled").length,
    completed: bookings.filter((booking) => booking.status === "completed").length,
    expired: bookings.filter((booking) => booking.status === "expired").length,
    no_show: bookings.filter((booking) => booking.status === "no_show").length,
  };
}
