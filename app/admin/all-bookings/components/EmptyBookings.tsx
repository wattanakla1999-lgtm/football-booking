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

            <h3 className="mt-4 max-w-3xl text-balance text-headline-md font-bold text-on-surface">
                {hasActiveFilters
                    ? "ไม่พบรายการจองที่ตรงกับเงื่อนไข"
                    : "ยังไม่มีรายการจอง"}
            </h3>

            <p className="mt-3 w-full max-w-2xl text-pretty text-body-md leading-7 text-on-surface-variant">
                {hasActiveFilters
                    ? "ยังไม่มีรายการจองที่ตรงกับตัวกรองที่เลือกอยู่ ลองเปลี่ยนเงื่อนไขการค้นหาหรือล้างตัวกรองเพื่อดูรายการทั้งหมด"
                    : "เมื่อมีลูกค้าทำรายการจอง ข้อมูลการจองทั้งหมดจะแสดงที่หน้านี้"}
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

                    ล้างตัวกรอง
                </button>
            )}
        </section>
    );
}
