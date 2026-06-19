import type {
    BookingStatus,
    StatusColor,
} from "../types/availability";

export const THAI_SHORT_DAYS = [
    "อา.",
    "จ.",
    "อ.",
    "พ.",
    "พฤ.",
    "ศ.",
    "ส.",
];

export const THAI_SHORT_MONTHS = [
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

export function createUpcomingDates(
    totalDays = 14,
): Date[] {
    return Array.from({ length: totalDays }, (_, index) => {
        const date = new Date();
        date.setDate(date.getDate() + index);
        return date;
    });
}

export function formatApiDate(date: Date): string {
    return [
        date.getFullYear(),
        String(date.getMonth() + 1).padStart(2, "0"),
        String(date.getDate()).padStart(2, "0"),
    ].join("-");
}

export function formatThaiLongDate(date: Date): string {
    return date.toLocaleDateString("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export function getStatusColor(
    status: BookingStatus,
): StatusColor {
    switch (status) {
        case "pending":
            return {
                bg: "rgba(245, 158, 11, 0.08)",
                border: "rgba(245, 158, 11, 0.25)",
                text: "#f59e0b",
            };

        case "paid":
            return {
                bg: "rgba(59, 130, 246, 0.08)",
                border: "rgba(59, 130, 246, 0.25)",
                text: "#60a5fa",
            };

        case "confirmed":
            return {
                bg: "rgba(59, 130, 246, 0.08)",
                border: "rgba(59, 130, 246, 0.25)",
                text: "#60a5fa",
            };

        case "completed":
            return {
                bg: "rgba(255, 255, 255, 0.03)",
                border: "rgba(255, 255, 255, 0.1)",
                text: "rgba(255, 255, 255, 0.4)",
            };

        default:
            return {
                bg: "rgba(255, 255, 255, 0.02)",
                border: "rgba(255, 255, 255, 0.05)",
                text: "rgba(255, 255, 255, 0.4)",
            };
    }
}

export function getStatusLabel(
    status: BookingStatus,
): string {
    switch (status) {
        case "pending":
            return "รอดำเนินการ";

        case "paid":
            return "รอตรวจสอบสลิป";

        case "confirmed":
            return "ยืนยันแล้ว";

        case "completed":
            return "เสร็จสิ้น";

        case "cancelled":
            return "ยกเลิก";

        default:
            return "ไม่ระบุ";
    }
}
