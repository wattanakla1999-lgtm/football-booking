"use client";

import { BookingCharts } from "./components/BookingCharts";
import { BookingDashboardError } from "./components/BookingDashboardError";
import { BookingDashboardSkeleton } from "./components/BookingDashboardSkeleton";
import { BookingStatistics } from "./components/BookingStatistics";
import { useAdminBookings } from "./hooks/useAdminBookings";

export default function AdminBookingList() {
  const {
    loading,
    error,
    statistics,
    chartSeries,
    fetchBookings,
  } = useAdminBookings();

  if (loading) {
    return <BookingDashboardSkeleton />;
  }

  if (error) {
    return (
      <BookingDashboardError
        message={error}
        onRetry={fetchBookings}
      />
    );
  }

  return (
    <>
      <BookingStatistics
        statistics={statistics}
      />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-lg mb-lg">
        {/*
          Reserved for the booking management table.
          Add the table component here when its JSX is available.

          Example:
          <div className="xl:col-span-2">
            <AdminBookingTable />
          </div>
        */}

        <div className="xl:col-start-1 xl:col-end-4">
          <BookingCharts
            chartSeries={chartSeries}
          />
        </div>
      </div>
    </>
  );
}
