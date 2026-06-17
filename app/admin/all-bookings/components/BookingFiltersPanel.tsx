import FilterDate from "./FilterDate";
import FilterSelect from "./FilterSelect";

import { statusOptions } from "../utils/bookingFilters";

import type { StatusFilter } from "../types/booking";

interface CourtOption {
    value: string;
    label: string;
}

interface BookingFiltersPanelProps {
    visible: boolean;
    hasActiveFilters: boolean;

    statusFilter: StatusFilter;
    courtFilter: string;
    startDateFilter: string;
    endDateFilter: string;
    courtOptions: CourtOption[];

    onStatusChange: (value: StatusFilter) => void;
    onCourtChange: (value: string) => void;
    onStartDateChange: (value: string) => void;
    onEndDateChange: (value: string) => void;
    onReset: () => void;
}

export default function BookingFiltersPanel({
    visible,
    hasActiveFilters,
    statusFilter,
    courtFilter,
    startDateFilter,
    endDateFilter,
    courtOptions,
    onStatusChange,
    onCourtChange,
    onStartDateChange,
    onEndDateChange,
    onReset,
}: BookingFiltersPanelProps) {
    if (!visible) return null;

    return (
        <section className="glass-card rounded-2xl border border-outline-variant/10 bg-surface-container-low/40 p-5 sm:p-6">
            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <FilterSelect
                    id="status-filter"
                    label="สถานะการจอง"
                    icon="task_alt"
                    value={statusFilter}
                    onChange={(value) =>
                        onStatusChange(value as StatusFilter)
                    }
                    options={statusOptions}
                />

                <FilterSelect
                    id="field-filter"
                    label="สนาม"
                    icon="stadium"
                    value={courtFilter}
                    onChange={onCourtChange}
                    options={[
                        {
                            value: "all",
                            label: "ทุกสนาม",
                        },
                        ...courtOptions,
                    ]}
                />

                <FilterDate
                    id="start-date-filter"
                    label="ตั้งแต่วันที่"
                    value={startDateFilter}
                    max={endDateFilter || undefined}
                    onChange={onStartDateChange}
                />

                <FilterDate
                    id="end-date-filter"
                    label="ถึงวันที่"
                    value={endDateFilter}
                    min={startDateFilter || undefined}
                    onChange={onEndDateChange}
                />
            </div>

            {hasActiveFilters && (
                <div className="mt-4 flex justify-end">
                    <button
                        type="button"
                        onClick={onReset}
                        className="inline-flex items-center gap-2 text-label-md font-bold text-error hover:underline"
                    >
                        <span className="material-symbols-outlined text-[18px]">
                            filter_alt_off
                        </span>

                        ล้างตัวกรองทั้งหมด
                    </button>
                </div>
            )}
        </section>
    );
}