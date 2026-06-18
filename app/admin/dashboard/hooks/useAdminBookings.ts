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

export function useAdminBookings() {
  const [bookings, setBookings] =
    useState<AdminBooking[]>([]);

  const [loading, setLoading] =
    useState(true);

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
    queueMicrotask(() => {
      void fetchBookings();
    });
  }, [fetchBookings]);

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
            currentBookings.map((booking) =>
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
