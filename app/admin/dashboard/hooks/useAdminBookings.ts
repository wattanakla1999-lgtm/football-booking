"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAdminBookings,
  updateAdminBookingStatus,
} from "../services/adminBookingService";

import type {
  AdminBooking,
  BookingStatus,
} from "../types/adminBooking";

import {
  buildDashboardChartSeries,
  calculateBookingStatistics,
  getUniqueCourtNames,
} from "../utils/adminBooking";

export function useAdminBookings(
  initialBookings: AdminBooking[] = [],
) {
  const [bookings, setBookings] =
    useState<AdminBooking[]>(initialBookings);

  const [loading, setLoading] =
    useState(initialBookings.length === 0);

  const [error, setError] =
    useState("");

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const fetchBookings =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getAdminBookings();

        setBookings(data);
      } catch (requestError) {
        console.error(
          "Fetch admin bookings error:",
          requestError,
        );

        setError(
          requestError instanceof Error
            ? requestError.message
            : "ไม่สามารถโหลดรายการจองได้",
        );
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    if (initialBookings.length > 0) {
      return;
    }

    queueMicrotask(() => {
      void fetchBookings();
    });
  }, [fetchBookings, initialBookings.length]);

  const updateStatus =
    useCallback(
      async (
        bookingId: string,
        status: BookingStatus,
      ) => {
        try {
          setUpdatingId(bookingId);

          const response =
            await updateAdminBookingStatus({
              bookingId,
              status,
            });

          setBookings((currentBookings) =>
            currentBookings.map((booking : AdminBooking) =>
              booking.id === bookingId
                ? response.booking ?? {
                    ...booking,
                    status,
                  }
                : booking,
            ),
          );

          return true;
        } catch (requestError) {
          console.error(
            "Update booking status error:",
            requestError,
          );

          return false;
        } finally {
          setUpdatingId(null);
        }
      },
      [],
    );

  const statistics = useMemo(
    () =>
      calculateBookingStatistics(bookings),
    [bookings],
  );

  const uniqueCourts = useMemo(
    () => getUniqueCourtNames(bookings),
    [bookings],
  );

  const chartSeries = useMemo(
    () => buildDashboardChartSeries(bookings),
    [bookings],
  );

  return {
    bookings,
    loading,
    error,
    updatingId,
    statistics,
    chartSeries,
    uniqueCourts,
    fetchBookings,
    updateStatus,
  };
}
