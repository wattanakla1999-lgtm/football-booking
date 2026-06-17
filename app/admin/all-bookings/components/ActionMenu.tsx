import { Booking, BookingStatus } from "../types/booking";
import MenuButton from "./MenuButton";

export default function ActionMenu({
    booking,
    onClose,
    onUpdateStatus,
}: {
    booking: Booking;
    onClose: () => void;
    onUpdateStatus: (
        bookingId: string,
        status: BookingStatus
    ) => Promise<void>;
}) {
    return (
        <div
            className="
        absolute right-0 top-12 z-[100]
        w-56 overflow-hidden rounded-xl
        border border-outline-variant/20
        bg-surface-container py-2
        text-left shadow-2xl
      "
        >
            <p className="px-4 pb-2 pt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
                จัดการการจอง
            </p>

            {(booking.status === "pending" ||
                booking.status === "paid") && (
                    <MenuButton
                        icon="check_circle"
                        label="ยืนยันการจอง"
                        className="text-primary"
                        onClick={() =>
                            onUpdateStatus(
                                booking.id,
                                "confirmed"
                            )
                        }
                    />
                )}

            {booking.status === "confirmed" && (
                <MenuButton
                    icon="task_alt"
                    label="ทำเครื่องหมายว่าเสร็จสิ้น"
                    className="text-primary"
                    onClick={() =>
                        onUpdateStatus(
                            booking.id,
                            "completed"
                        )
                    }
                />
            )}

            {booking.status !== "cancelled" &&
                booking.status !== "completed" && (
                    <MenuButton
                        icon="cancel"
                        label="ยกเลิกการจอง"
                        className="text-error"
                        onClick={() =>
                            onUpdateStatus(
                                booking.id,
                                "cancelled"
                            )
                        }
                    />
                )}

            <div className="my-1 border-t border-outline-variant/10" />

            <MenuButton
                icon="close"
                label="Close menu"
                className="text-on-surface-variant"
                onClick={onClose}
            />
        </div>
    );
}