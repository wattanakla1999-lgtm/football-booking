"use client";

import { useEffect } from "react";
import { useState } from "react";

import { BookingCard } from "./components/BookingCard";
import { BookingDetailModal } from "./components/BookingDetailModal";
import { BookingHistoryHeader } from "./components/BookingHistoryHeader";
import { HistoryPagination } from "./components/HistoryPagination";
import { BookingResultHeader } from "./components/BookingResultHeader";
import { BookingSkeleton } from "./components/BookingSkeleton";
import { EmptyState } from "./components/EmptyState";
import { ErrorState } from "./components/ErrorState";
import { StatusFilters } from "./components/StatusFilters";
import { useBookingHistory } from "./hooks/useBookingHistory";
import { updateUserBookingStatus } from "./services/bookingHistoryService";
import type {
  Booking,
  BookingHistoryPageData,
} from "./types/booking";
import { shortBookingId } from "./utils/booking";
import { AdminRouteLoadingOverlay } from "@/src/components/common/AdminRouteLoadingOverlay";

type BookingHistoryListProps = {
  initialData: BookingHistoryPageData;
  highlightedBookingId?: string;
};

export default function BookingHistoryList({
  initialData,
  highlightedBookingId = "",
}: BookingHistoryListProps) {
  const [cancellingBookingId, setCancellingBookingId] =
    useState("");
  const [detailLoadingId, setDetailLoadingId] =
    useState("");
  const [selectedDetailBooking, setSelectedDetailBooking] =
    useState<Booking | null>(null);
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

  const handleCancelBooking = async (
    booking: Booking,
  ) => {
    const confirmed = window.confirm(
      `ต้องการยกเลิกรายการ #${shortBookingId(booking.id)} ใช่หรือไม่`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingBookingId(booking.id);
      await updateUserBookingStatus(
        booking.id,
        "cancelled",
      );

      await fetchBookings(undefined, {
        page: currentPage,
      });
    } catch (requestError) {
      window.alert(
        requestError instanceof Error
          ? requestError.message
          : "ไม่สามารถยกเลิกรายการจองได้",
      );
    } finally {
      setCancellingBookingId("");
    }
  };

  const handleViewDetails = (
    booking: Booking,
  ) => {
    setDetailLoadingId(booking.id);

    window.setTimeout(() => {
      setSelectedDetailBooking(booking);
      setDetailLoadingId("");
    }, 180);
  };

  const highlightedBooking =
    highlightedBookingId
      ? bookings.find(
          (booking) =>
            booking.id === highlightedBookingId,
        )
      : null;

  useEffect(() => {
    if (!highlightedBookingId || loading) {
      return;
    }

    const element = document.getElementById(
      `booking-card-${highlightedBookingId}`,
    );

    if (!element) {
      return;
    }

    window.setTimeout(() => {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 150);
  }, [bookings, highlightedBookingId, loading]);

  return (
    <div>
      <AdminRouteLoadingOverlay
        open={
          (loading && totalBookings > 0) ||
          Boolean(cancellingBookingId) ||
          Boolean(detailLoadingId)
        }
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

        {highlightedBooking && (
          <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.08] px-4 py-3 text-sm text-green-200">
            <span className="font-bold">
              รายการจองล่าสุดของคุณ
            </span>{" "}
            คือรหัส #
            {shortBookingId(
              highlightedBooking.id,
            )}
          </div>
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
                    highlighted={
                      booking.id ===
                      highlightedBookingId
                    }
                    isCancelling={
                      booking.id ===
                      cancellingBookingId
                    }
                    onCancelBooking={
                      handleCancelBooking
                    }
                    onViewDetails={
                      handleViewDetails
                    }
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

      {selectedDetailBooking && (
        <BookingDetailModal
          booking={selectedDetailBooking}
          onClose={() =>
            setSelectedDetailBooking(null)
          }
        />
      )}
    </div>
  );
}
