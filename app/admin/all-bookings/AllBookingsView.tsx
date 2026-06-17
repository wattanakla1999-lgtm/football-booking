"use client";

import { useEffect, useRef, useState } from "react";
import { usePagination } from "@/hooks/usePagination";
import { countActiveFilters } from "../../../utils/bookingStatus";
import BookingCardsGrid from "./components/BookingCardsGrid";
import BookingCardsSkeleton from "./components/BookingCardsSkeleton";
import BookingFiltersPanel from "./components/BookingFiltersPanel";
import BookingPageHeader from "./components/BookingPageHeader";
import BookingPagination from "./components/BookingPagination";
import BookingSummary from "./components/BookingSummary";
import EmptyBookings from "./components/EmptyBookings";
import { useBookingFilters } from "./hooks/useBookingFilters";
import type { Booking, BookingStatus, } from "./types/booking";

interface RecentBookingsTableProps {
    bookings: Booking[];
    loading?: boolean;
    itemsPerPage?: number;
    title?: string;
    onUpdateStatus: (
        bookingId: string,
        status: BookingStatus
    ) => Promise<void> | void;
    onViewAll?: () => void;
}

export default function RecentBookingsTable({
    bookings,
    loading = false,
    itemsPerPage = 8,
    title = "All Bookings",
    onUpdateStatus,
    onViewAll,
}: RecentBookingsTableProps) {
    const actionMenuRef = useRef<HTMLDivElement | null>(null);
    const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [showFilters, setShowFilters] = useState(false);
    const filters = useBookingFilters(bookings);

    const {
        currentPage,
        totalPages,
        totalItems,
        startIndex,
        endIndex,
        paginatedItems: paginatedBookings,
        goToPreviousPage,
        goToNextPage,
        resetPage,
    } = usePagination(
        filters.filteredBookings,
        itemsPerPage
    );

    useEffect(() => {
        resetPage();
    }, [
        filters.searchKeyword,
        filters.statusFilter,
        filters.courtFilter,
        filters.startDateFilter,
        filters.endDateFilter,
        resetPage,
    ]);

    useEffect(() => {
        const handleClickOutside = (
            event: MouseEvent
        ) => {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setActiveActionMenuId(null);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    const resetFilters = () => {
        filters.resetFilters();
        setActiveActionMenuId(null);
        onViewAll?.();
    };

    const updateStatus = async (
        bookingId: string,
        status: BookingStatus
    ) => {
        if (updatingId) return;

        try {
            setUpdatingId(bookingId);
            setActiveActionMenuId(null);

            await onUpdateStatus(bookingId, status);
        } catch (error) {
            console.error(
                "Unable to update booking status:",
                error
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const toggleActionMenu = (
        bookingId: string
    ) => {
        setActiveActionMenuId((currentId) =>
            currentId === bookingId
                ? null
                : bookingId
        );
    };

    return (
        <div className="w-full min-w-0 max-w-full space-y-5 overflow-x-hidden">
            <BookingPageHeader
                title={title}
                searchKeyword={filters.searchKeyword}
                showFilters={showFilters}
                hasActiveFilters={filters.hasActiveFilters}
                activeFilterCount={countActiveFilters({
                    searchKeyword: filters.searchKeyword,
                    statusFilter: filters.statusFilter,
                    courtFilter: filters.courtFilter,
                    startDateFilter: filters.startDateFilter,
                    endDateFilter: filters.endDateFilter,
                })}
                onSearchChange={filters.setSearchKeyword}
                onToggleFilters={() => setShowFilters((current) => !current)}
                onReset={resetFilters}
            />

            <BookingSummary
                bookings={bookings}
                statusFilter={filters.statusFilter}
                onStatusChange={filters.setStatusFilter}
            />

            <BookingFiltersPanel
                visible={showFilters}
                hasActiveFilters={filters.hasActiveFilters}
                statusFilter={filters.statusFilter}
                courtFilter={filters.courtFilter}
                startDateFilter={filters.startDateFilter}
                endDateFilter={filters.endDateFilter}
                courtOptions={filters.courtOptions}
                onStatusChange={filters.setStatusFilter}
                onCourtChange={filters.setCourtFilter}
                onStartDateChange={filters.setStartDateFilter}
                onEndDateChange={filters.setEndDateFilter}
                onReset={resetFilters}
            />

            {loading ? (
                <BookingCardsSkeleton />
            ) : paginatedBookings.length === 0 ? (
                <EmptyBookings
                    hasActiveFilters={filters.hasActiveFilters}
                    onReset={resetFilters}
                />
            ) : (
                <BookingCardsGrid
                    bookings={paginatedBookings}
                    updatingId={updatingId}
                    activeActionMenuId={activeActionMenuId}
                    actionMenuRef={actionMenuRef}
                    onToggleMenu={toggleActionMenu}
                    onCloseMenu={() => setActiveActionMenuId(null)}
                    onUpdateStatus={updateStatus}
                />
            )}

            {!loading && (
                <BookingPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    startIndex={startIndex}
                    endIndex={endIndex}
                    onPrevious={goToPreviousPage}
                    onNext={goToNextPage}
                />
            )}
        </div>
    );
}