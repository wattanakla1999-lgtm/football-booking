import type {
  BookingStatusSummary,
  StatusFilter,
} from "../types/booking";
import { STATUS_OPTIONS } from "../utils/booking";

type StatusFiltersProps = {
  activeFilter: StatusFilter;
  summary: BookingStatusSummary;
  onChange: (status: StatusFilter) => void;
};

export function StatusFilters({
  activeFilter,
  summary,
  onChange,
}: StatusFiltersProps) {
  return (
    <section className="flex w-full gap-2 overflow-x-auto pb-1">
      {STATUS_OPTIONS.map((option) => {
        const isActive = activeFilter === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3.5 text-xs font-bold transition-all active:scale-95 ${
              isActive
                ? "border-green-500/30 bg-green-500 text-white shadow-lg shadow-green-500/10"
                : "border-white/10 bg-white/[0.04] text-white/50 hover:border-green-500/20 hover:bg-green-500/10 hover:text-green-400"
            }`}
          >
            {option.label}

            <span
              className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] ${
                isActive
                  ? "bg-black/20 text-white"
                  : "bg-white/10 text-white/50"
              }`}
            >
              {summary[option.value]}
            </span>
          </button>
        );
      })}
    </section>
  );
}
