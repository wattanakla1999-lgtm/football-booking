interface BookingPageHeaderProps {
    title: string;
    searchKeyword: string;
    showFilters: boolean;
    hasActiveFilters: boolean;
    activeFilterCount: number;

    onSearchChange: (value: string) => void;
    onToggleFilters: () => void;
    onReset: () => void;
}

export default function BookingPageHeader({
    title,
    searchKeyword,
    showFilters,
    hasActiveFilters,
    activeFilterCount,
    onSearchChange,
    onToggleFilters,
    onReset,
}: BookingPageHeaderProps) {
    return (
        <section className="glass-card overflow-hidden rounded-2xl">
            <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">
                            calendar_month
                        </span>

                        <span className="text-label-sm font-bold uppercase tracking-[0.18em] text-primary">
                            Booking Management
                        </span>
                    </div>

                    <h1 className="text-headline-lg font-headline-lg text-on-surface">
                        {title}
                    </h1>

                    <p className="mt-1 text-body-md text-on-surface-variant">
                        ตรวจสอบ กรอง และจัดการการจองสนามทั้งหมด
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={onToggleFilters}
                        className={`
              inline-flex h-11 items-center justify-center
              gap-2 rounded-xl border px-4
              text-label-md font-bold transition-all
              active:scale-95
              ${showFilters || hasActiveFilters
                                ? "border-primary/30 bg-primary/10 text-primary"
                                : "border-outline-variant/20 bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                            }
            `}
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            tune
                        </span>

                        ตัวกรอง

                        {hasActiveFilters && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-on-primary">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={onReset}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-label-md font-bold text-on-primary transition-all hover:brightness-110 active:scale-95"
                    >
                        <span className="material-symbols-outlined text-[20px]">
                            refresh
                        </span>

                        รีเฟรช
                    </button>
                </div>
            </div>

            <div className="border-t border-outline-variant/10 p-5 sm:p-6">
                <div className="relative">
                    <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-on-surface-variant">
                        search
                    </span>

                    <input
                        type="search"
                        value={searchKeyword}
                        onChange={(event) =>
                            onSearchChange(event.target.value)
                        }
                        placeholder="ค้นหา ID การจอง ชื่อลูกค้า เบอร์โทร หรือสนาม..."
                        className="h-12 w-full min-w-0 rounded-xl border border-outline-variant/20 bg-surface-container-low pl-12 pr-11 text-body-md text-on-surface outline-none transition-all placeholder:text-on-surface-variant/60 focus:border-primary/60 focus:bg-surface-container focus:ring-4 focus:ring-primary/10"
                    />

                    {searchKeyword && (
                        <button
                            type="button"
                            onClick={() => onSearchChange("")}
                            aria-label="ล้างการค้นหา"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant transition-colors hover:text-on-surface"
                        >
                            <span className="material-symbols-outlined text-[20px]">
                                close
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}