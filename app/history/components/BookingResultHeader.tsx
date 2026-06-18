type BookingResultHeaderProps = {
  resultCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

export function BookingResultHeader({
  resultCount,
  totalCount,
  hasActiveFilters,
  onClearFilters,
}: BookingResultHeaderProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-lg font-bold text-white">
          รายการจองของคุณ
        </h2>

        <p className="mt-0.5 text-xs text-white/40">
          พบ {resultCount} จาก {totalCount} รายการ
        </p>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="inline-flex w-fit items-center gap-1.5 text-xs font-bold text-red-400 transition-colors hover:text-red-300"
        >
          <span className="material-symbols-outlined text-[17px]">
            filter_alt_off
          </span>
          ล้างตัวกรอง
        </button>
      )}
    </div>
  );
}
