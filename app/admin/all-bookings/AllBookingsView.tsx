"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import { countActiveFilters } from "../../../utils/bookingStatus";
import { PaginationControls } from "@/src/components/common/PaginationControls";
import type { PaginationMeta } from "@/src/types/pagination";
import { updateAdminBookingStatus } from "@/src/services/adminBookings";
import BookingCardsGrid from "./components/BookingCardsGrid";
import BookingFiltersPanel from "./components/BookingFiltersPanel";
import BookingPageHeader from "./components/BookingPageHeader";
import BookingSummary from "./components/BookingSummary";
import EmptyBookings from "./components/EmptyBookings";
import type {
  Booking,
  BookingStatus,
  StatusFilter,
} from "./types/booking";

interface CourtOption {
  value: string;
  label: string;
}

interface AllBookingsViewProps {
  bookings: Booking[];
  pagination: PaginationMeta;
  title: string;
  initialFilters: {
    searchKeyword: string;
    statusFilter: StatusFilter;
    courtFilter: string;
    startDateFilter: string;
    endDateFilter: string;
  };
  courtOptions: CourtOption[];
  summaryCounts: Record<
    StatusFilter,
    number
  > &
    Record<BookingStatus, number>;
}

export default function AllBookingsView({
  bookings,
  pagination,
  title,
  initialFilters,
  courtOptions,
  summaryCounts,
}: AllBookingsViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const actionMenuRef =
    useRef<HTMLDivElement | null>(null);
  const [activeActionMenuId, setActiveActionMenuId] =
    useState<string | null>(null);
  const [updatingId, setUpdatingId] =
    useState<string | null>(null);
  const [showFilters, setShowFilters] =
    useState(false);
  const [searchKeyword, setSearchKeyword] =
    useState(initialFilters.searchKeyword);

  useEffect(() => {
    setSearchKeyword(
      initialFilters.searchKeyword,
    );
  }, [initialFilters.searchKeyword]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const trimmedKeyword =
        searchKeyword.trim();

      if (
        trimmedKeyword ===
        initialFilters.searchKeyword
      ) {
        return;
      }

      pushQuery({
        nextSearchKeyword: trimmedKeyword,
        nextPage: 1,
      });
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [
    initialFilters.searchKeyword,
    searchKeyword,
  ]);

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent,
    ) => {
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(
          event.target as Node,
        )
      ) {
        setActiveActionMenuId(null);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );
    };
  }, []);

  const pushQuery = ({
    nextPage = 1,
    nextSearchKeyword = searchKeyword.trim(),
    nextStatus = initialFilters.statusFilter,
    nextCourt = initialFilters.courtFilter,
    nextStartDate = initialFilters.startDateFilter,
    nextEndDate = initialFilters.endDateFilter,
  }: {
    nextPage?: number;
    nextSearchKeyword?: string;
    nextStatus?: StatusFilter;
    nextCourt?: string;
    nextStartDate?: string;
    nextEndDate?: string;
  }) => {
    const params = new URLSearchParams();

    if (nextSearchKeyword) {
      params.set("q", nextSearchKeyword);
    }

    if (nextStatus !== "all") {
      params.set("status", nextStatus);
    }

    if (nextCourt !== "all") {
      params.set("court", nextCourt);
    }

    if (nextStartDate) {
      params.set("startDate", nextStartDate);
    }

    if (nextEndDate) {
      params.set("endDate", nextEndDate);
    }

    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }

    router.push(
      params.size
        ? `${pathname}?${params.toString()}`
        : pathname,
    );
  };

  const hasActiveFilters =
    Boolean(initialFilters.searchKeyword) ||
    initialFilters.statusFilter !== "all" ||
    initialFilters.courtFilter !== "all" ||
    initialFilters.startDateFilter !== "" ||
    initialFilters.endDateFilter !== "";

  const resetFilters = () => {
    setSearchKeyword("");
    setActiveActionMenuId(null);
    router.push(pathname);
  };

  const updateStatus = async (
    bookingId: string,
    status: BookingStatus,
  ) => {
    if (updatingId) return;

    try {
      setUpdatingId(bookingId);
      setActiveActionMenuId(null);

      await updateAdminBookingStatus(
        bookingId,
        status,
      );
      router.refresh();
    } catch (error) {
      console.error(
        "Unable to update booking status:",
        error,
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleActionMenu = (
    bookingId: string,
  ) => {
    setActiveActionMenuId((currentId) =>
      currentId === bookingId
        ? null
        : bookingId,
    );
  };

  return (
    <div className="w-full min-w-0 max-w-full space-y-5 overflow-x-hidden">
      <BookingPageHeader
        title={title}
        searchKeyword={searchKeyword}
        showFilters={showFilters}
        hasActiveFilters={hasActiveFilters}
        activeFilterCount={countActiveFilters({
          searchKeyword:
            initialFilters.searchKeyword,
          statusFilter:
            initialFilters.statusFilter,
          courtFilter:
            initialFilters.courtFilter,
          startDateFilter:
            initialFilters.startDateFilter,
          endDateFilter:
            initialFilters.endDateFilter,
        })}
        onSearchChange={setSearchKeyword}
        onToggleFilters={() =>
          setShowFilters((current) => !current)
        }
        onReset={resetFilters}
      />

      <BookingSummary
        counts={summaryCounts}
        statusFilter={
          initialFilters.statusFilter
        }
        onStatusChange={(status) =>
          pushQuery({
            nextStatus: status,
            nextPage: 1,
          })
        }
      />

      <BookingFiltersPanel
        visible={showFilters}
        hasActiveFilters={hasActiveFilters}
        statusFilter={
          initialFilters.statusFilter
        }
        courtFilter={
          initialFilters.courtFilter
        }
        startDateFilter={
          initialFilters.startDateFilter
        }
        endDateFilter={
          initialFilters.endDateFilter
        }
        courtOptions={courtOptions}
        onStatusChange={(value) =>
          pushQuery({
            nextStatus:
              value as StatusFilter,
            nextPage: 1,
          })
        }
        onCourtChange={(value) =>
          pushQuery({
            nextCourt: value,
            nextPage: 1,
          })
        }
        onStartDateChange={(value) =>
          pushQuery({
            nextStartDate: value,
            nextPage: 1,
          })
        }
        onEndDateChange={(value) =>
          pushQuery({
            nextEndDate: value,
            nextPage: 1,
          })
        }
        onReset={resetFilters}
      />

      {bookings.length === 0 ? (
        <EmptyBookings
          hasActiveFilters={hasActiveFilters}
          onReset={resetFilters}
        />
      ) : (
        <BookingCardsGrid
          bookings={bookings}
          updatingId={updatingId}
          activeActionMenuId={activeActionMenuId}
          actionMenuRef={actionMenuRef}
          onToggleMenu={toggleActionMenu}
          onCloseMenu={() =>
            setActiveActionMenuId(null)
          }
          onUpdateStatus={updateStatus}
        />
      )}

      <PaginationControls
        page={pagination.page}
        total={pagination.total}
        limit={pagination.limit}
        totalPages={pagination.totalPages}
        onPageChange={(page) =>
          pushQuery({
            nextPage: page,
          })
        }
      />
    </div>
  );
}
