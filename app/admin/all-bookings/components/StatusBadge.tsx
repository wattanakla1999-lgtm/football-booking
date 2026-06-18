import { BookingStatusBadge } from "@/src/components/common";
import type { BookingStatus } from "../types/booking";

export default function StatusBadge({
    status,
}: {
    status: BookingStatus;
}) {
    return (
        <BookingStatusBadge status={status} />
    );
}
