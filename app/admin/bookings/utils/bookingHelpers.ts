import { formatPrice } from "@/utils/bookingFormatters";

import type { Booking, BookingItem } from "../types/booking";

const THAI_SHORT_MONTHS = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

export function formatThaiDate(dateStr: string) {
  const date = new Date(dateStr);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return `${date.getDate()} ${THAI_SHORT_MONTHS[date.getMonth()]} ${date.getFullYear() + 543}`;
}

export function formatBookingPrice(price: string | number) {
  return formatPrice(Number(price) || 0);
}

export function getFirstBookingItem(booking: Booking): BookingItem | undefined {
  return booking.items[0];
}

export function isOfflineBooking(booking: Booking) {
  return booking.user.lineUserId?.startsWith("offline_") ?? false;
}
