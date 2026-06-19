import SummaryCard from "./SummaryCard";

import type {
    BookingStatus,
    StatusFilter,
} from "../types/booking";

const SUMMARY_ITEMS: Array<{
    status: BookingStatus;
    label: string;
    icon: string;
}> = [
        {
            status: "pending",
            label: "รอแอดมินยืนยัน",
            icon: "pending_actions",
        },
        {
            status: "confirmed",
            label: "ยืนยันแล้ว",
            icon: "verified",
        },
        {
            status: "completed",
            label: "เสร็จสิ้น",
            icon: "task_alt",
        },
        {
            status: "cancelled",
            label: "ยกเลิกแล้ว",
            icon: "cancel",
        },
        {
            status: "expired",
            label: "หมดเวลารอ",
            icon: "timer_off",
        },
        {
            status: "no_show",
            label: "ลูกค้าไม่มา",
            icon: "person_off",
        },
    ];

interface BookingSummaryProps {
    counts: Record<
        StatusFilter,
        number
    > &
        Record<BookingStatus, number>;
    statusFilter: StatusFilter;
    onStatusChange: (
        status: StatusFilter
    ) => void;
}

export default function BookingSummary({
    counts,
    statusFilter,
    onStatusChange,
}: BookingSummaryProps) {
    return (
        <section className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-5">
            {SUMMARY_ITEMS.map((item) => (
                <SummaryCard
                    key={item.status}
                    icon={item.icon}
                    label={item.label}
                    value={counts[item.status]}
                    active={
                        statusFilter === item.status
                    }
                    onClick={() =>
                        onStatusChange(
                            statusFilter === item.status
                                ? "all"
                                : item.status
                        )
                    }
                />
            ))}
        </section>
    );
}
