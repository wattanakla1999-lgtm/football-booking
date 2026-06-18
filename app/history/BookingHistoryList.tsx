"use client";

import { useMemo, useState } from "react";

import { BookingCard } from "./components/BookingCard";
import { BookingHistoryHeader } from "./components/BookingHistoryHeader";
import { HistoryPagination } from "./components/HistoryPagination";
import { BookingResultHeader } from "./components/BookingResultHeader";
import { BookingSkeleton } from "./components/BookingSkeleton";
import { EmptyState } from "./components/EmptyState";
import { ErrorState } from "./components/ErrorState";
import { StatusFilters } from "./components/StatusFilters";
import { useBookingHistory } from "./hooks/useBookingHistory";
import type { Booking } from "./types/booking";
import { shortBookingId } from "./utils/booking";
import { createPaginationMeta } from "@/src/utils/pagination";

type BookingHistoryListProps = {
  initialBookings: Booking[];
};

const PAGE_LIMIT = 5;

export default function BookingHistoryList({
  initialBookings,
}: BookingHistoryListProps) {
  const {
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
  } = useBookingHistory(initialBookings);
  const [requestedPage, setRequestedPage] =
    useState(1);

  const pagination = useMemo(
    () =>
      createPaginationMeta({
        total: filteredBookings.length,
        page: requestedPage,
        limit: PAGE_LIMIT,
      }),
    [filteredBookings.length, requestedPage],
  );

  const paginatedBookings = useMemo(() => {
    const start =
      (pagination.page - 1) * PAGE_LIMIT;
    const end = start + PAGE_LIMIT;

    return filteredBookings.slice(start, end);
  }, [filteredBookings, pagination.page]);

  const handlePayment = (booking: Booking) => {
    /*
     * Replace this with a modal or router.push()
     * when the payment flow is ready.
     */
    alert(
      `แจ้งชำระเงินสำหรับรายการ #${shortBookingId(booking.id)}`,
    );
  };

  return (
    <div>
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <BookingHistoryHeader
          totalBookings={bookings.length}
          loading={loading}
          searchKeyword={searchKeyword}
          onSearchChange={(value) => {
            setSearchKeyword(value);
            setRequestedPage(1);
          }}
          onClearSearch={() => {
            setSearchKeyword("");
            setRequestedPage(1);
          }}
          onRefresh={() => void fetchBookings()}
        />

        <StatusFilters
          activeFilter={statusFilter}
          summary={statusSummary}
          onChange={(value) => {
            setStatusFilter(value);
            setRequestedPage(1);
          }}
        />

        {!loading && !error && bookings.length > 0 && (
          <BookingResultHeader
            resultCount={filteredBookings.length}
            totalCount={bookings.length}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={() => {
              clearFilters();
              setRequestedPage(1);
            }}
          />
        )}

        {loading ? (
          <BookingSkeleton />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => void fetchBookings()}
          />
        ) : bookings.length === 0 ? (
          <EmptyState
            title="คุณยังไม่มีประวัติการจอง"
            description="เมื่อคุณจองสนาม รายการจองจะปรากฏอยู่ในหน้านี้"
            icon="event_busy"
          />
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            title="ไม่พบรายการที่ค้นหา"
            description="ลองเปลี่ยนคำค้นหา หรือเลือกสถานะอื่น"
            icon="search_off"
            actionLabel="ล้างตัวกรอง"
            onAction={() => {
              clearFilters();
              setRequestedPage(1);
            }}
          />
        ) : (
          <>
            <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
              {paginatedBookings.map(
                (booking: Booking) => (
                  <BookingCard
                    key={booking.id}
                    booking={booking}
                    onPayment={handlePayment}
                  />
                ),
              )}
            </div>

            <HistoryPagination
              page={pagination.page}
              total={pagination.total}
              limit={pagination.limit}
              totalPages={pagination.totalPages}
              onPageChange={setRequestedPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
