export default function EmptyBookings({
    hasActiveFilters,
    onReset,
}: {
    hasActiveFilters: boolean;
    onReset: () => void;
}) {
    return (
        <section className="glass-card flex min-h-80 flex-col items-center justify-center rounded-2xl p-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[34px]">
                    {hasActiveFilters
                        ? "search_off"
                        : "event_busy"}
                </span>
            </div>

            <h3 className="mt-4 text-headline-md font-bold text-on-surface">
                {hasActiveFilters
                    ? "No matching bookings"
                    : "No bookings yet"}
            </h3>

            <p className="mt-2 max-w-md text-body-md text-on-surface-variant">
                {hasActiveFilters
                    ? "No bookings match the current filters. Try changing or clearing the filters."
                    : "Bookings will appear here when customers reserve a field."}
            </p>

            {hasActiveFilters && (
                <button
                    type="button"
                    onClick={onReset}
                    className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-label-md font-bold text-on-primary transition-all hover:brightness-110 active:scale-95"
                >
                    <span className="material-symbols-outlined text-[19px]">
                        filter_alt_off
                    </span>

                    Clear filters
                </button>
            )}
        </section>
    );
}