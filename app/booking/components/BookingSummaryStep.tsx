import type { Court, TimeSlot } from "../types/booking";
import { formatPrice } from "../utils/booking";
import { BackButton } from "./BackButton";
import { PhoneInput } from "./PhoneInput";
import { SectionHeader } from "./SectionHeader";

type BookingSummaryStepProps = {
  court: Court;
  selectedDate: Date;
  selectedSlots: TimeSlot[];
  totalPrice: number;
  phone: string;
  phoneError: string;
  error: string;
  isSubmitting: boolean;
  onBack: () => void;
  onPhoneChange: (value: string) => void;
  onConfirm: () => void;
};

export function BookingSummaryStep({
  court,
  selectedDate,
  selectedSlots,
  totalPrice,
  phone,
  phoneError,
  error,
  isSubmitting,
  onBack,
  onPhoneChange,
  onConfirm,
}: BookingSummaryStepProps) {
  return (
    <div className="animate-[slideUp_0.3s_ease-out] mt-1">
      <div className="flex items-center gap-3 mb-6">
        <BackButton onClick={onBack} />
        <SectionHeader
          title="สรุปการจอง"
          description="ตรวจสอบข้อมูลก่อนยืนยัน"
        />
      </div>

      <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden mb-4">
        <div className="px-5 py-5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-500/15 flex items-center justify-center text-xl shrink-0">
            🏟️
          </div>
          <div>
            <p className="font-bold text-base">{court.name}</p>
            <p className="text-xs text-white/40 mt-1 leading-relaxed">
              {court.surface && `${court.surface} · `}
              ฿{formatPrice(court.pricePerHour)}/ชม.
              {court.maxPlayers && ` · สูงสุด ${court.maxPlayers} คน`}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/[0.02] rounded-2xl border border-white/[0.06] overflow-hidden mb-4">
        <div className="divide-y divide-white/[0.04]">
          <div className="px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
              📅
            </div>
            <div>
              <p className="text-xs text-white/40">วันที่</p>
              <p className="text-sm font-medium mt-0.5">
                {selectedDate.toLocaleDateString("th-TH", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="px-5 py-4 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
              ⏰
            </div>
            <div>
              <p className="text-xs text-white/40">เวลา</p>
              <div className="flex flex-wrap gap-2 mt-1.5">
                {selectedSlots.map((slot : { startTime: string, endTime: string }) => (
                  <span
                    key={slot.startTime}
                    className="inline-block bg-green-500/10 text-green-400 text-sm font-medium px-3 py-1.5 rounded-xl"
                  >
                    {slot.startTime.slice(0, 5)}–{slot.endTime.slice(0, 5)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="px-5 py-5">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-white/50">
                <span>ราคาต่อชั่วโมง</span>
                <span>฿{formatPrice(court.pricePerHour)}</span>
              </div>
              <div className="flex justify-between text-white/50">
                <span>จำนวนชั่วโมง</span>
                <span>{selectedSlots.length} ชม.</span>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/[0.06]">
              <span className="text-base font-bold">รวมทั้งหมด</span>
              <span className="text-xl font-extrabold text-green-400">
                ฿{formatPrice(totalPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <PhoneInput
        phone={phone}
        error={phoneError}
        onChange={onPhoneChange}
      />

      {error && (
        <div className="bg-red-500/10 rounded-2xl text-red-400 text-sm px-5 py-4 flex items-start gap-3 mb-4 leading-relaxed">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-3 mt-8">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-5 rounded-2xl text-base tracking-wide transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center gap-2">
            ยืนยันการจอง
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        </button>

        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="w-full bg-transparent border border-white/10 text-white/50 hover:text-white hover:bg-white/5 font-medium py-4 rounded-2xl text-sm tracking-wide transition-all duration-150 active:scale-[0.98]"
        >
          ← แก้ไขวันเวลา
        </button>
      </div>
    </div>
  );
}
