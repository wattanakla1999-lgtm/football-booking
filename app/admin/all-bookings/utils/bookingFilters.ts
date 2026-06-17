import { StatusFilter } from "../types/booking";

export const statusOptions: Array<{
    value: StatusFilter;
    label: string;
}> = [
        {
            value: "all",
            label: "การจองทั้งหมด",
        },
        {
            value: "pending",
            label: "รอดำเนินการ",
        },
        {
            value: "paid",
            label: "รอตรวจสอบสลิป",
        },
        {
            value: "confirmed",
            label: "ยืนยันแล้ว",
        },
        {
            value: "completed",
            label: "เสร็จสิ้น",
        },
        {
            value: "cancelled",
            label: "ยกเลิกแล้ว",
        },
    ];