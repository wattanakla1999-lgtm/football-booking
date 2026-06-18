"use client";

import { BookingCard } from "./components/BookingCard";
import { BookingHistoryHeader } from "./components/BookingHistoryHeader";
import { BookingResultHeader } from "./components/BookingResultHeader";
import { BookingSkeleton } from "./components/BookingSkeleton";
import { EmptyState } from "./components/EmptyState";
import { ErrorState } from "./components/ErrorState";
import { StatusFilters } from "./components/StatusFilters";
import { useBookingHistory } from "./hooks/useBookingHistory";
import type { Booking } from "./types/booking";
import { shortBookingId } from "./utils/booking";

export default function BookingHistoryList() {
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
  } = useBookingHistory();

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
          onSearchChange={setSearchKeyword}
          onClearSearch={() => setSearchKeyword("")}
          onRefresh={() => void fetchBookings()}
        />

        <StatusFilters
          activeFilter={statusFilter}
          summary={statusSummary}
          onChange={setStatusFilter}
        />

        {!loading && !error && bookings.length > 0 && (
          <BookingResultHeader
            resultCount={filteredBookings.length}
            totalCount={bookings.length}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={clearFilters}
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
            onAction={clearFilters}
          />
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onPayment={handlePayment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
