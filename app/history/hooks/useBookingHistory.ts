"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getUserBookings } from "../services/bookingHistoryService";
import type {
  Booking,
  BookingStatusSummary,
  StatusFilter,
} from "../types/booking";
import { EMPTY_STATUS_SUMMARY } from "../utils/booking";

export function useBookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("all");

  const fetchBookings = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError("");

      const data = await getUserBookings(signal);
      setBookings(data);
    } catch (requestError) {
      if (
        requestError instanceof DOMException &&
        requestError.name === "AbortError"
      ) {
        return;
      }

      console.error("Fetch user bookings error:", requestError);

      setError(
        requestError instanceof Error
          ? requestError.message
          : "เกิดข้อผิดพลาดในการโหลดข้อมูล",
      );
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    queueMicrotask(() => {
      void fetchBookings(controller.signal);
    });

    return () => {
      controller.abort();
    };
  }, [fetchBookings]);

  const statusSummary = useMemo<BookingStatusSummary>(() => {
    return bookings.reduce<BookingStatusSummary>(
      (summary, booking) => {
        summary.all += 1;
        summary[booking.status] += 1;
        return summary;
      },
      { ...EMPTY_STATUS_SUMMARY },
    );
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();

    return bookings.filter((booking) => {
      const bookingId = booking.id.toLowerCase();

      const fieldNames = booking.items
        .map((item : { court?: { name: string } }    ) => item.court?.name || "")
        .join(" ")
        .toLowerCase();

      const surfaces = booking.items
        .map((item : any) => item.court?.surface || "")
        .join(" ")
        .toLowerCase(); 

      const matchesSearch =
        keyword === "" ||
        bookingId.includes(keyword) ||
        fieldNames.includes(keyword) ||
        surfaces.includes(keyword);

      const matchesStatus =
        statusFilter === "all" ||
        booking.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchKeyword, statusFilter]);

  const clearFilters = useCallback(() => {
    setSearchKeyword("");
    setStatusFilter("all");
  }, []);

  const hasActiveFilters =
    searchKeyword.trim() !== "" || statusFilter !== "all";

  return {
    bookings,
    filteredBookings,
    loading,
    error,
    searchKeyword,
    statusFilter,
    statusSummary,
    hasActiveFilters,
    setSearchKeyword,
    setStatusFilter,
    clearFilters,
    fetchBookings,
  };
}
