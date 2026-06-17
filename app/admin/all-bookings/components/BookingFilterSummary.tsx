import FilterChip from "./FilterChip";

import { capitalize } from "@/utils/bookingFormatters";

import type { StatusFilter } from "../types/booking";

interface CourtOption {
    value: string;
    label: string;
}

interface BookingFilterSummaryProps {
    totalItems: number;
    allBookingsCount: number;

    searchKeyword: string;
    statusFilter: StatusFilter;
    courtFilter: string;
    startDateFilter: string;
    endDateFilter: string;
    courtOptions: CourtOption[];

    onSearchClear: () => void;
    onStatusClear: () => void;
    onCourtClear: () => void;
    onDateClear: () => void;
}

export default function BookingFilterSummary({
    totalItems,
    allBookingsCount,
    searchKeyword,
    statusFilter,
    courtFilter,
    startDateFilter,
    endDateFilter,
    courtOptions,
    onSearchClear,
    onStatusClear,
    onCourtClear,
    onDateClear,
}: BookingFilterSummaryProps) {
    const hasActiveFilters =
        searchKeyword !== "" ||
        statusFilter !== "all" ||
        courtFilter !== "all" ||
        startDateFilter !== "" ||
        endDateFilter !== "";

    return (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 className="text-headline-md font-headline-md text-on-surface">
                    รายการการจอง
                </h2>

                <p className="mt-1 text-label-sm text-on-surface-variant">
                    แสดง {totalItems} จาก {allBookingsCount} รายการ
                </p>
            </div>

            {hasActiveFilters && (
                <div className="flex flex-wrap gap-2">
                    {searchKeyword && (
                        <FilterChip
                            label={`ค้นหา: ${searchKeyword}`}
                            onRemove={onSearchClear}
                        />
                    )}

                    {statusFilter !== "all" && (
                        <FilterChip
                            label={`สถานะ: ${capitalize(statusFilter)}`}
                            onRemove={onStatusClear}
                        />
                    )}

                    {courtFilter !== "all" && (
                        <FilterChip
                            label={`สนาม: ${courtOptions.find(
                                (court) => court.value === courtFilter
                            )?.label || courtFilter
                                }`}
                            onRemove={onCourtClear}
                        />
                    )}

                    {(startDateFilter || endDateFilter) && (
                        <FilterChip
                            label={`${startDateFilter || "เริ่มต้น"} - ${endDateFilter || "สิ้นสุด"
                                }`}
                            onRemove={onDateClear}
                        />
                    )}
                </div>
            )}
        </div>
    );
}