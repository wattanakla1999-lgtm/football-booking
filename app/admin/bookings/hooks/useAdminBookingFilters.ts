import { useMemo, useState } from "react";

import type {
  Booking,
  StatusFilter,
} from "../types/booking";

export function useAdminBookingFilters(bookings: Booking[]) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredBookings = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return bookings.filter((booking) => {
      if (statusFilter !== "all" && booking.status !== statusFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const matchName = booking.user.displayName.toLowerCase().includes(query);
      const matchCourt = booking.items.some((item) =>
        item.court.name.toLowerCase().includes(query)
      );
      const matchId = booking.id.toLowerCase().includes(query);
      const matchPhone = booking.user.phone?.toLowerCase().includes(query);

      return matchName || matchCourt || matchId || Boolean(matchPhone);
    });
  }, [bookings, searchQuery, statusFilter]);

  return {
    filteredBookings,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
  };
}
