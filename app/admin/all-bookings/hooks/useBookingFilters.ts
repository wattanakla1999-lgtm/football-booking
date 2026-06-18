import { useMemo, useState } from "react";

import { normalizeDate } from "@/utils/bookingFormatters";

import type {
    Booking,
    StatusFilter,
} from "../types/booking";

export function useBookingFilters(bookings: Booking[]) {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [statusFilter, setStatusFilter] =
        useState<StatusFilter>("all");
    const [courtFilter, setCourtFilter] = useState("all");
    const [startDateFilter, setStartDateFilter] = useState("");
    const [endDateFilter, setEndDateFilter] = useState("");

    const courtOptions = useMemo(() => {
        const courtMap = new Map<string, string>();

        bookings.forEach((booking) => {
            booking.items.forEach((item) => {
                const courtName = item.court?.name?.trim();

                if (!courtName) return;

                const courtValue =
                    item.court?.id || courtName;

                courtMap.set(courtValue, courtName);
            });
        });

        return Array.from(courtMap.entries())
            .map(([value, label]) => ({
                value,
                label,
            }))
            .sort((a, b) =>
                a.label.localeCompare(b.label)
            );
    }, [bookings]);

    const filteredBookings = useMemo(() => {
        const keyword = searchKeyword
            .trim()
            .toLowerCase();

        const startDate = startDateFilter
            ? normalizeDate(startDateFilter)
            : null;

        const endDate = endDateFilter
            ? normalizeDate(endDateFilter)
            : null;

        return bookings.filter((booking) => {
            const searchableText = [
                booking.id,
                booking.user?.displayName,
                booking.user?.phone,
                ...booking.items.map(
                    (item) => item.court?.name
                ),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch =
                !keyword ||
                searchableText.includes(keyword);

            const matchesStatus =
                statusFilter === "all" ||
                booking.status === statusFilter;

            const matchesCourt =
                courtFilter === "all" ||
                booking.items.some((item) => {
                    const courtValue =
                        item.court?.id || item.court?.name;

                    return courtValue === courtFilter;
                });

            const bookingDates = booking.items
                .map((item : { date: string }) => normalizeDate(item.date))
                .filter(
                    (date): date is number =>
                        date !== null
                );

            const bookingDate =
                bookingDates.length > 0
                    ? Math.min(...bookingDates)
                    : null;

            const matchesStartDate =
                startDate === null ||
                (bookingDate !== null &&
                    bookingDate >= startDate);

            const matchesEndDate =
                endDate === null ||
                (bookingDate !== null &&
                    bookingDate <= endDate);

            return (
                matchesSearch &&
                matchesStatus &&
                matchesCourt &&
                matchesStartDate &&
                matchesEndDate
            );
        });
    }, [
        bookings,
        searchKeyword,
        statusFilter,
        courtFilter,
        startDateFilter,
        endDateFilter,
    ]);

    const hasActiveFilters =
        searchKeyword.trim() !== "" ||
        statusFilter !== "all" ||
        courtFilter !== "all" ||
        startDateFilter !== "" ||
        endDateFilter !== "";

    const resetFilters = () => {
        setSearchKeyword("");
        setStatusFilter("all");
        setCourtFilter("all");
        setStartDateFilter("");
        setEndDateFilter("");
    };

    return {
        searchKeyword,
        setSearchKeyword,
        statusFilter,
        setStatusFilter,
        courtFilter,
        setCourtFilter,
        startDateFilter,
        setStartDateFilter,
        endDateFilter,
        setEndDateFilter,
        courtOptions,
        filteredBookings,
        hasActiveFilters,
        resetFilters,
    };
}