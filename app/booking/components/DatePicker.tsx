"use client";

import { useEffect, useRef } from "react";
import { THAI_DAY_SHORT, THAI_MONTH } from "../utils/booking";

type DatePickerProps = {
  dates: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

export function DatePicker({
  dates,
  selectedDate,
  onSelectDate,
}: DatePickerProps) {
  const dateListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedElement = dateListRef.current?.querySelector(
      "[data-selected='true']",
    );

    selectedElement?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  }, [selectedDate]);

  return (
    <div className="mb-8">
      <p className="text-sm font-medium text-white/70 mb-4">วันที่</p>

      <div
        ref={dateListRef}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6 snap-x snap-mandatory"
      >
        {dates.map((date, index) => {
          const isToday = index === 0;
          const isSelected =
            date.toDateString() === selectedDate.toDateString();

          return (
            <button
              type="button"
              key={date.toISOString()}
              data-selected={isSelected}
              onClick={() => onSelectDate(date)}
              className={`snap-start flex flex-col items-center justify-center min-w-[4.5rem] h-[5.5rem] rounded-2xl border-2 transition-all duration-150 shrink-0 ${
                isSelected
                  ? "bg-green-500 border-green-500 text-white scale-105 shadow-[0_0_16px_rgba(34,197,94,0.3)]"
                  : "bg-white/[0.02] border-white/10 text-white/50 hover:bg-white/[0.06] hover:border-white/20"
              }`}
            >
              <span
                className={`text-sm font-medium ${
                  isSelected ? "text-green-100" : "text-white/40"
                }`}
              >
                {isToday ? "วันนี้" : THAI_DAY_SHORT[date.getDay()]}
              </span>

              <span
                className={`text-2xl font-black leading-tight ${
                  isToday && !isSelected ? "text-white/80" : ""
                }`}
              >
                {date.getDate()}
              </span>

              <span
                className={`text-[11px] mt-0.5 ${
                  isSelected ? "text-green-100" : "opacity-50"
                }`}
              >
                {THAI_MONTH[date.getMonth()]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
