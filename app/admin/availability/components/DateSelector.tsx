import {
    THAI_SHORT_DAYS,
    THAI_SHORT_MONTHS,
} from "../utils/availability";

interface DateSelectorProps {
    dates: Date[];
    selectedDate: Date;
    loading?: boolean;
    onSelectDate: (date: Date) => void;
}

export default function DateSelector({
    dates,
    selectedDate,
    loading = false,
    onSelectDate,
}: DateSelectorProps) {
    return (
        <div className="admin-scroll mb-8 flex gap-2 overflow-x-auto border-b border-white/[0.03] pb-3">
            {dates.map((date : Date) => {
                const isSelected =
                    date.toDateString() ===
                    selectedDate.toDateString();

                return (
                    <button
                        key={date.toISOString()}
                        type="button"
                        onClick={() => onSelectDate(date)}
                        disabled={loading}
                        className={`
              flex h-20 min-w-[4.5rem] shrink-0
              flex-col items-center justify-center
              gap-0.5 rounded-2xl border
              transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60
              ${isSelected
                                ? "border-green-500 bg-green-500/[0.08] text-green-300"
                                : "border-white/[0.05] bg-white/[0.01] text-white/45 hover:bg-white/[0.03]"
                            }
            `}
                    >
                        <span className="text-[0.65rem] font-medium">
                            {THAI_SHORT_DAYS[date.getDay()]}
                        </span>

                        <span className="text-xl font-extrabold">
                            {date.getDate()}
                        </span>

                        <span className="text-[0.6rem]">
                            {THAI_SHORT_MONTHS[date.getMonth()]}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
