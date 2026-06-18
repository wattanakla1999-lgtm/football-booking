import type { RefObject } from "react";

import BookingCard from "./BookingCard";

import type {
    Booking,
    BookingStatus,
} from "../types/booking";

interface BookingCardsGridProps {
    bookings: Booking[];
    updatingId: string | null;
    activeActionMenuId: string | null;
    actionMenuRef: RefObject<HTMLDivElement | null>;

    onToggleMenu: (bookingId: string) => void;
    onCloseMenu: () => void;

    onUpdateStatus: (
        bookingId: string,
        status: BookingStatus
    ) => Promise<void>;
}

export default function BookingCardsGrid({
    bookings,
    updatingId,
    activeActionMenuId,
    actionMenuRef,
    onToggleMenu,
    onCloseMenu,
    onUpdateStatus,
}: BookingCardsGridProps) {
    return (
        <section className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {bookings.map((booking) => (
                <BookingCard
                    key={booking.id}
                    booking={booking}
                    isUpdating={updatingId === booking.id}
                    isMenuOpen={
                        activeActionMenuId === booking.id
                    }
                    menuRef={
                        activeActionMenuId === booking.id
                            ? actionMenuRef
                            : undefined
                    }
                    onToggleMenu={() =>
                        onToggleMenu(booking.id)
                    }
                    onCloseMenu={onCloseMenu}
                    onUpdateStatus={onUpdateStatus}
                />
            ))}
        </section>
    );
}
