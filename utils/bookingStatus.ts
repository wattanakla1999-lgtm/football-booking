import { StatusFilter } from "../app/admin/all-bookings/types/booking";

export function countActiveFilters({
    searchKeyword,
    statusFilter,
    courtFilter,
    startDateFilter,
    endDateFilter,
}: {
    searchKeyword: string;
    statusFilter: StatusFilter;
    courtFilter: string;
    startDateFilter: string;
    endDateFilter: string;
}) {
    let count = 0;

    if (searchKeyword.trim()) count += 1;
    if (statusFilter !== "all") count += 1;
    if (courtFilter !== "all") count += 1;
    if (startDateFilter || endDateFilter) count += 1;

    return count;
}