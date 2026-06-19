import type {
    Booking,
    BookingStatus,
} from "../types/booking";

export default function QuickActionButton({
    booking,
    onUpdateStatus,
}: {
    booking: Booking;
    onUpdateStatus: (
        bookingId: string,
        status: BookingStatus
    ) => Promise<void>;
}) {
    if (
        booking.status === "pending"
    ) {
        return (
            <button
                type="button"
                onClick={() =>
                    onUpdateStatus(
                        booking.id,
                        "confirmed"
                    )
                }
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-[10px] font-bold text-on-primary transition-all hover:brightness-110 active:scale-95"
            >
                <span className="material-symbols-outlined text-[16px]">
                    check_circle
                </span>

                ยืนยันการจอง
            </button>
        );
    }

    if (booking.status === "confirmed") {
        return (
            <button
                type="button"
                onClick={() =>
                    onUpdateStatus(
                        booking.id,
                        "completed"
                    )
                }
                className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-[10px] font-bold text-on-primary transition-all hover:brightness-110 active:scale-95"
            >
                <span className="material-symbols-outlined text-[16px]">
                    task_alt
                </span>

                สำเร็จ
            </button>
        );
    }

    return (
        <span className="inline-flex h-8 items-center justify-center rounded-lg border border-outline-variant/10 bg-surface-container-low px-3 text-[10px] font-bold text-on-surface-variant">
            ไม่มีการกระทำ
        </span>
    );
}
