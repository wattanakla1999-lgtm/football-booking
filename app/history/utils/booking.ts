import type {
  BookingStatusSummary,
  StatusOption,
} from "../types/booking";

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

function parseDateValue(dateValue: string) {
  const normalizedValue = dateValue.includes("T")
    ? dateValue
    : `${dateValue}T12:00:00`;

  return new Date(normalizedValue);
}

export const STATUS_OPTIONS: StatusOption[] = [
  { value: "all", label: "ทั้งหมด" },
  { value: "pending", label: "รอแอดมินยืนยัน" },
  { value: "confirmed", label: "ยืนยันแล้ว" },
  { value: "completed", label: "เสร็จสิ้น" },
  { value: "expired", label: "หมดเวลารอ" },
  { value: "no_show", label: "ลูกค้าไม่มา" },
  { value: "cancelled", label: "ยกเลิก" },
];

export const EMPTY_STATUS_SUMMARY: BookingStatusSummary = {
  all: 0,
  pending: 0,
  confirmed: 0,
  completed: 0,
  expired: 0,
  no_show: 0,
  cancelled: 0,
};

export function formatPrice(price: string | number) {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return "0";
  }

  return numericPrice.toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatDate(dateValue: string) {
  const date = parseDateValue(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "ไม่พบวันที่";
  }

  return `${date.getDate()} ${
    THAI_SHORT_MONTHS[date.getMonth()]
  } ${date.getFullYear() + 543}`;
}

export function formatCreatedAt(dateValue: string) {
  const date = parseDateValue(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "ไม่พบข้อมูล";
  }

  const datePart = `${date.getDate()} ${
    THAI_SHORT_MONTHS[date.getMonth()]
  } ${date.getFullYear() + 543}`;

  const timePart = date.toLocaleTimeString(
    "th-TH",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    },
  );

  return `${datePart} ${timePart}`;
}

export function shortBookingId(bookingId: string) {
  return bookingId.slice(-8).toUpperCase();
}
