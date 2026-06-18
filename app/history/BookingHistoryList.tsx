"use client";

import { BookingCard } from "./components/BookingCard";
import { BookingHistoryHeader } from "./components/BookingHistoryHeader";
import { HistoryPagination } from "./components/HistoryPagination";
import { BookingResultHeader } from "./components/BookingResultHeader";
import { BookingSkeleton } from "./components/BookingSkeleton";
import { EmptyState } from "./components/EmptyState";
import { ErrorState } from "./components/ErrorState";
import { StatusFilters } from "./components/StatusFilters";
import { useBookingHistory } from "./hooks/useBookingHistory";
import type {
  Booking,
  BookingHistoryPageData,
} from "./types/booking";
import { shortBookingId } from "./utils/booking";
import { AdminRouteLoadingOverlay } from "@/src/components/common/AdminRouteLoadingOverlay";

type BookingHistoryListProps = {
  initialData: BookingHistoryPageData;
};

export default function BookingHistoryList({
  initialData,
}: BookingHistoryListProps) {
  const {
    bookings,
    pagination,
    loading,
    error,
    searchKeyword,
    statusFilter,
    statusSummary,
    totalBookings,
    currentPage,
    hasActiveFilters,
    setSearchKeyword,
    setStatusFilter,
    setCurrentPage,
    clearFilters,
    fetchBookings,
  } = useBookingHistory(initialData);

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
      <AdminRouteLoadingOverlay
        open={loading && totalBookings > 0}
      />

      <div className="mx-auto w-full max-w-7xl space-y-5">
        <BookingHistoryHeader
          totalBookings={totalBookings}
          loading={loading}
          searchKeyword={searchKeyword}
          onSearchChange={(value) => {
            setSearchKeyword(value);
            setCurrentPage(1);
          }}
          onClearSearch={() => {
            setSearchKeyword("");
            setCurrentPage(1);
          }}
          onRefresh={() =>
            void fetchBookings(undefined, {
              page: currentPage,
            })
          }
        />

        <StatusFilters
          activeFilter={statusFilter}
          summary={statusSummary}
          onChange={(value) => {
            setStatusFilter(value);
            setCurrentPage(1);
          }}
        />

        {!loading && !error && totalBookings > 0 && (
          <BookingResultHeader
            resultCount={pagination.total}
            totalCount={totalBookings}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={() => {
              clearFilters();
            }}
          />
        )}

        {loading ? (
          <BookingSkeleton />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() =>
              void fetchBookings(undefined, {
                page: currentPage,
              })
            }
          />
        ) : totalBookings === 0 ? (
          <EmptyState
            title="คุณยังไม่มีประวัติการจอง"
            description="เมื่อคุณจองสนาม รายการจองจะปรากฏอยู่ในหน้านี้"
            icon="event_busy"
          />
        ) : pagination.total === 0 ? (
          <EmptyState
            title="ไม่พบรายการที่ค้นหา"
            description="ลองเปลี่ยนคำค้นหา หรือเลือกสถานะอื่น"
            icon="search_off"
            actionLabel="ล้างตัวกรอง"
            onAction={() => {
              clearFilters();
            }}
          />
        ) : (
          <>
            <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
              {bookings.map(
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
              loading={loading}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
