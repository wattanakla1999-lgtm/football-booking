interface BookingPaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    startIndex: number;
    endIndex: number;
    onPrevious: () => void;
    onNext: () => void;
}

export default function BookingPagination({
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    onPrevious,
    onNext,
}: BookingPaginationProps) {
    if (totalItems === 0) return null;

    return (
        <section className="glass-card flex flex-col gap-4 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <p className="text-label-sm text-on-surface-variant">
                แสดง{" "}
                <span className="font-bold text-on-surface">
                    {startIndex + 1}
                </span>{" "}
                ถึง{" "}
                <span className="font-bold text-on-surface">
                    {endIndex}
                </span>{" "}
                จาก{" "}
                <span className="font-bold text-on-surface">
                    {totalItems}
                </span>{" "}
                รายการ
            </p>

            <div className="flex items-center justify-between gap-2 sm:justify-end">
                <button
                    type="button"
                    onClick={onPrevious}
                    disabled={currentPage === 1}
                    className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 text-label-md font-bold text-on-surface transition-all hover:bg-surface-container-high active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <span className="material-symbols-outlined text-[19px]">
                        chevron_left
                    </span>

                    <span className="hidden sm:inline">
                        ก่อนหน้า
                    </span>
                </button>

                <div className="flex h-10 min-w-20 items-center justify-center rounded-xl bg-primary/10 px-3 text-label-md font-bold text-primary">
                    {currentPage} / {totalPages}
                </div>

                <button
                    type="button"
                    onClick={onNext}
                    disabled={currentPage >= totalPages}
                    className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 text-label-md font-bold text-on-surface transition-all hover:bg-surface-container-high active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <span className="hidden sm:inline">
                        ถัดไป
                    </span>

                    <span className="material-symbols-outlined text-[19px]">
                        chevron_right
                    </span>
                </button>
            </div>
        </section>
    );
}