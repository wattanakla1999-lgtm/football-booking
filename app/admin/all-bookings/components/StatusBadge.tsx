import { BookingStatus } from "../types/booking";

export default function StatusBadge({
    status,
}: {
    status: BookingStatus;
}) {
    const statusConfig: Record<
        BookingStatus,
        {
            label: string;
            icon: string;
            className: string;
        }
    > = {
        pending: {
            label: "รอดำเนินการ",
            icon: "schedule",
            className:
                "border-yellow-500/20 bg-yellow-500/10 text-yellow-400",
        },
        paid: {
            label: "รอตรวจสอบสลิป",
            icon: "payments",
            className:
                "border-blue-500/20 bg-blue-500/10 text-blue-400",
        },
        confirmed: {
            label: "ยืนยันแล้ว",
            icon: "verified",
            className:
                "border-primary/20 bg-primary/10 text-primary",
        },
        completed: {
            label: "เสร็จสิ้น",
            icon: "task_alt",
            className:
                "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
        },
        cancelled: {
            label: "ยกเลิกแล้ว",
            icon: "cancel",
            className:
                "border-error/20 bg-error/10 text-error",
        },
    };

    const config = statusConfig[status];

    return (
        <span
            className={`
        inline-flex items-center gap-1
        whitespace-nowrap rounded-full
        border px-2 py-0.5
        text-[9px] font-bold
        ${config.className}
      `}
        >
            <span className="material-symbols-outlined text-[12px]">
                {config.icon}
            </span>

            <span className="hidden sm:inline">
                {config.label}
            </span>
        </span>
    );
}