import type { TimeSlot } from "../types/booking";

export const THAI_DAY_SHORT = ["อา.", "จ.", "อ.", "พ.", "พฤ.", "ศ.", "ส."];

export const THAI_MONTH = [
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

export const formatPrice = (price: number | string) =>
  Number(price).toLocaleString("th-TH");

export const formatApiDate = (date: Date) =>
  date.toISOString().split("T")[0];

export const validateThaiPhone = (
  raw: string,
): { valid: boolean; digits: string; error: string } => {
  const digits = raw.replace(/\D/g, "");

  if (digits.length === 0) {
    return { valid: false, digits, error: "กรุณากรอกเบอร์โทรศัพท์" };
  }

  if (!digits.startsWith("0")) {
    return { valid: false, digits, error: "เบอร์โทรต้องเริ่มต้นด้วย 0" };
  }

  if (digits.length < 10) {
    return { valid: false, digits, error: "เบอร์โทรต้องมี 10 หลัก" };
  }

  if (digits.length > 10) {
    return { valid: false, digits, error: "เบอร์โทรต้องมีไม่เกิน 10 หลัก" };
  }

  return { valid: true, digits, error: "" };
};

export const getBookingDates = (amount = 14) =>
  Array.from({ length: amount }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return date;
  });

export const isPastTimeSlot = (
  selectedDate: Date,
  slot: TimeSlot,
): boolean => {
  const now = new Date();
  const isToday = selectedDate.toDateString() === now.toDateString();

  if (!isToday) return false;

  const [hours, minutes] = slot.startTime.split(":").map(Number);
  const slotTime = new Date(selectedDate);
  slotTime.setHours(hours, minutes, 0, 0);

  return slotTime.getTime() <= now.getTime();
};
