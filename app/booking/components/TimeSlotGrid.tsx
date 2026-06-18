import type { TimeSlot } from "../types/booking";

type TimeSlotGridProps = {
  slots: TimeSlot[];
  selectedSlots: TimeSlot[];
  loading: boolean;
  error: string;
  isPastSlot: (slot: TimeSlot) => boolean;
  onToggleSlot: (slot: TimeSlot) => void;
};

export function TimeSlotGrid({
  slots,
  selectedSlots,
  loading,
  error,
  isPastSlot,
  onToggleSlot,
}: TimeSlotGridProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-white/70">เวลา</p>

        {selectedSlots.length > 0 && (
          <span className="text-xs text-green-400 font-medium bg-green-500/10 px-3 py-1 rounded-full">
            {selectedSlots.length} ช่วง
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {Array.from({ length: 12 }).map((_ , index : number) => (
            <div
              key={index}
              className="h-[4.5rem] rounded-2xl bg-white/[0.03] animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-500/10 rounded-2xl text-red-400 text-center py-10 text-sm">
          {error}
        </div>
      ) : slots.length === 0 ? (
        <div className="bg-white/[0.02] rounded-2xl text-center py-12">
          <div className="text-4xl mb-3">🚫</div>
          <p className="text-white/40 text-sm">สนามปิดให้บริการในวันนี้</p>
          <p className="text-white/30 text-xs mt-1.5">กรุณาเลือกวันอื่น</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {slots.map((slot : { startTime: string, endTime: string, isAvailable: boolean }) => {
              const isSelected = selectedSlots.some(
                (selected) => selected.startTime === slot.startTime,
              );
              const isPast = isPastSlot(slot);
              const disabled = !slot.isAvailable || isPast;

              return (
                <button
                  type="button"
                  key={slot.startTime}
                  disabled={disabled}
                  onClick={() => onToggleSlot(slot)}
                  className={`relative h-[4.5rem] rounded-2xl text-base font-bold transition-all duration-100 flex flex-col items-center justify-center ${
                    disabled
                      ? "bg-white/[0.01] text-white/15 cursor-not-allowed"
                      : isSelected
                        ? "bg-green-500 text-white shadow-[0_0_16px_rgba(34,197,94,0.3)] scale-[1.02]"
                        : "bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white hover:scale-[1.02] active:scale-95"
                  }`}
                >
                  {isPast || !slot.isAvailable ? (
                    <>
                      <span className="relative z-10 text-base font-bold opacity-30">
                        {slot.startTime.slice(0, 5)}
                      </span>
                      <span className="text-[10px] opacity-20 mt-0.5">
                        {isPast ? "เลยเวลา" : "ไม่ว่าง"}
                      </span>
                      <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-2xl">
                        <div className="w-[200%] h-px bg-white/10 -rotate-12" />
                      </div>
                    </>
                  ) : isSelected ? (
                    <>
                      <span className="relative z-10 text-lg font-black">
                        {slot.startTime.slice(0, 5)}
                      </span>
                      <span className="text-[10px] text-green-200 font-medium mt-0.5">
                        ✓ เลือกแล้ว
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10 text-lg font-bold">
                        {slot.startTime.slice(0, 5)}
                      </span>
                      <span className="text-[10px] opacity-30 mt-0.5">ว่าง</span>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-6 mt-5 text-xs text-white/30">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-white/[0.06]" /> ว่าง
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-green-500" /> เลือกแล้ว
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-white/[0.01]" /> ไม่ว่าง
            </span>
          </div>
        </>
      )}
    </div>
  );
}
