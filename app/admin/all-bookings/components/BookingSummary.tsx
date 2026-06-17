import SummaryCard from "./SummaryCard";

import type {
    Booking,
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
            label: "รอดำเนินการ",
            icon: "pending_actions",
        },
        {
            status: "paid",
            label: "ชำระเงินแล้ว",
            icon: "payments",
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
    ];

interface BookingSummaryProps {
    bookings: Booking[];
    statusFilter: StatusFilter;
    onStatusChange: (
        status: StatusFilter
    ) => void;
}

export default function BookingSummary({
    bookings,
    statusFilter,
    onStatusChange,
}: BookingSummaryProps) {
    const summary = bookings.reduce<
        Record<BookingStatus, number>
    >(
        (result, booking) => {
            result[booking.status] += 1;
            return result;
        },
        {
            pending: 0,
            paid: 0,
            confirmed: 0,
            completed: 0,
            cancelled: 0,
        }
    );

    return (
        <section className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-5">
            {SUMMARY_ITEMS.map((item) => (
                <SummaryCard
                    key={item.status}
                    icon={item.icon}
                    label={item.label}
                    value={summary[item.status]}
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