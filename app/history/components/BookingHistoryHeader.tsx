type BookingHistoryHeaderProps = {
  totalBookings: number;
  loading: boolean;
  searchKeyword: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onRefresh: () => void;
};

export function BookingHistoryHeader({
  totalBookings,
  loading,
  searchKeyword,
  onSearchChange,
  onClearSearch,
  onRefresh,
}: BookingHistoryHeaderProps) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
              <span className="material-symbols-outlined text-[21px]">
                history
              </span>
            </div>

            <span className="text-xs font-bold uppercase tracking-[0.16em] text-green-400">
              Booking History
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            ประวัติการจอง
          </h1>

          <p className="mt-1 text-sm text-white/50">
            ตรวจสอบรายการจอง ช่วงเวลา และสถานะล่าสุดของการจอง
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-green-400/70">
              รายการทั้งหมด
            </p>

            <p className="mt-0.5 text-2xl font-bold text-green-400">
              {totalBookings}
            </p>
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-white/60 transition-all hover:border-green-500/30 hover:bg-green-500/10 hover:text-green-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="โหลดข้อมูลใหม่"
          >
            <span
              className={`material-symbols-outlined text-[22px] ${
                loading ? "animate-spin" : ""
              }`}
            >
              refresh
            </span>
          </button>
        </div>
      </div>

      <div className="border-t border-white/10 p-5 sm:p-6">
        <div className="relative">
          <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[21px] text-white/40">
            search
          </span>

          <input
            type="search"
            value={searchKeyword}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="ค้นหา Booking ID, ชื่อสนาม หรือประเภทพื้นสนาม"
            className="h-12 w-full min-w-0 rounded-2xl border border-white/10 bg-black/20 pl-12 pr-11 text-sm text-white outline-none transition-all placeholder:text-white/30 focus:border-green-500/50 focus:bg-black/30 focus:ring-4 focus:ring-green-500/10"
          />

          {searchKeyword && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center text-white/40 transition-colors hover:text-white"
              aria-label="ล้างการค้นหา"
            >
              <span className="material-symbols-outlined text-[19px]">
                close
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
