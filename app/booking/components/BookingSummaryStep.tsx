import type { Court, TimeSlot } from "../types/booking";
import { formatPrice } from "../utils/booking";

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
  const primaryImageUrl = court.images?.[0]?.url;
  const digitLength = phone.replace(/\D/g, "").length;
  const dateLabel = selectedDate.toLocaleDateString("th-TH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const surfaceLabel = court.surface?.toUpperCase() || "FOOTBALL";

  return (
    <div className="animate-[slideUp_0.3s_ease-out] -mx-2 mt-1 overflow-hidden rounded-[28px] border border-green-300/20 bg-[#061524] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <div className="sticky top-0 z-10 border-b border-green-300/10 bg-[#082033]/95 px-5 py-4 backdrop-blur">
        <div className="grid grid-cols-[44px_1fr_44px] items-center">
          <button
            type="button"
            onClick={onBack}
            disabled={isSubmitting}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl text-green-300 transition-colors hover:bg-white/5 disabled:opacity-50"
            aria-label="กลับ"
          >
            <span className="material-symbols-outlined text-[34px]">
              arrow_back
            </span>
          </button>

          <div className="text-center">
            <h2 className="text-3xl font-black leading-none tracking-tight text-green-300">
              สรุปการจอง
            </h2>
            <p className="mt-2 text-sm font-black tracking-[0.12em] text-slate-300">
              ตรวจสอบข้อมูลการจองของคุณ
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center text-slate-300">
            <span className="material-symbols-outlined text-[32px]">
              more_vert
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-5 px-5 pb-32 pt-6">
        <section className="rounded-[26px] border border-slate-500/30 bg-slate-800/70 p-4 shadow-inner">
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-slate-500/40 bg-[#04101b] sm:h-28 sm:w-28">
              {primaryImageUrl ? (
                <img
                  src={primaryImageUrl}
                  alt={court.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 overflow-hidden bg-[radial-gradient(circle_at_50%_0%,rgba(148,163,184,0.65),transparent_22%),linear-gradient(180deg,#06131f,#020812)]">
                  <div className="absolute left-5 top-3 h-14 w-6 rotate-12 rounded-full bg-white/45 blur-md" />
                  <div className="absolute right-5 top-3 h-14 w-6 -rotate-12 rounded-full bg-white/45 blur-md" />
                  <div className="absolute bottom-4 left-1/2 h-px w-14 -translate-x-1/2 bg-green-200/40" />
                </div>
              )}
              <div className="absolute bottom-2 right-2 grid h-7 w-7 place-items-center rounded-full bg-green-400 text-[#061524]">
                <span className="material-symbols-outlined text-[20px]">
                  sports_soccer
                </span>
              </div>
            </div>

            <div className="min-w-0">
              <p className="text-sm font-black tracking-wide text-green-300">
                ประเภทสนาม: {surfaceLabel}
              </p>
              <h3 className="mt-1 text-2xl font-black leading-tight text-slate-100 sm:text-3xl">
                {court.name}
              </h3>
              <p className="mt-2 flex items-center gap-1.5 text-sm font-bold text-slate-300/80 sm:text-lg">
                <span className="material-symbols-outlined text-[22px]">
                  location_on
                </span>
                Football Booking Arena
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[26px] border border-slate-500/30 bg-slate-800/70 p-5 shadow-inner">
          <div className="grid gap-5">
            <div className="grid grid-cols-[36px_64px_1fr] items-center gap-2 sm:grid-cols-[44px_120px_1fr]">
              <span className="material-symbols-outlined text-[32px] text-green-300 sm:text-[36px]">
                calendar_month
              </span>
              <p className="text-base font-black text-slate-300 sm:text-xl">
                วันที่
              </p>
              <p className="text-right text-base font-black leading-snug text-slate-100 sm:text-xl">
                {dateLabel}
              </p>
            </div>

            <div className="grid grid-cols-[36px_64px_1fr] items-start gap-2 sm:grid-cols-[44px_120px_1fr]">
              <span className="material-symbols-outlined text-[32px] text-green-300 sm:text-[36px]">
                schedule
              </span>
              <p className="pt-1 text-base font-black text-slate-300 sm:text-xl">
                เวลา
              </p>
              <div className="flex flex-wrap justify-end gap-2">
                {selectedSlots.map((slot) => (
                  <span
                    key={slot.startTime}
                    className="rounded-lg bg-green-400/15 px-2.5 py-1 text-sm font-black text-green-300 sm:px-3 sm:text-base"
                  >
                    {slot.startTime.slice(0, 5)} -{" "}
                    {slot.endTime.slice(0, 5)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="my-5 h-px bg-slate-500/20" />

          <div className="space-y-4">
            <SummaryRow
              label="ราคาต่อชั่วโมง"
              value={`฿ ${formatPrice(court.pricePerHour)}`}
            />
            <SummaryRow
              label="จำนวนชั่วโมง"
              value={`${selectedSlots.length} ชั่วโมง`}
            />
          </div>

          <div className="mt-6 flex items-end justify-between gap-4">
            <p className="text-2xl font-black text-slate-100">
              ราคาสุทธิ
            </p>
            <p className="text-4xl font-black tracking-tight text-green-300">
              ฿ {formatPrice(totalPrice)}
            </p>
          </div>
        </section>

        <section
          className={`rounded-[26px] border bg-slate-800/70 p-5 shadow-inner transition-colors ${
            phoneError
              ? "border-red-400/50"
              : "border-slate-500/30"
          }`}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[30px] text-slate-300">
                call
              </span>
              <p className="text-base font-black text-slate-300 sm:text-xl">
                เบอร์โทรศัพท์ติดต่อ
              </p>
            </div>
            <span
              className={`text-sm font-black ${
                digitLength === 10
                  ? "text-green-300"
                  : "text-slate-400"
              }`}
            >
              {digitLength}/10
            </span>
          </div>

          <input
            type="tel"
            inputMode="tel"
            placeholder="08X-XXX-XXXX"
            value={phone}
            onChange={(event) =>
              onPhoneChange(
                event.target.value.replace(/[^0-9-]/g, ""),
              )
            }
            maxLength={13}
            className={`h-[72px] w-full rounded-2xl border bg-[#071d2e] px-5 py-5 text-xl font-black tracking-wide text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:ring-4 sm:h-20 sm:px-6 sm:text-2xl ${
              phoneError
                ? "border-red-400/50 focus:ring-red-400/10"
                : "border-slate-500/30 focus:border-green-300/60 focus:ring-green-300/10"
            }`}
          />

          {phoneError ? (
            <p className="mt-3 flex items-center gap-2 text-sm font-bold text-red-300">
              <span className="material-symbols-outlined text-[18px]">
                error
              </span>
              {phoneError}
            </p>
          ) : (
            <p className="mt-4 text-sm font-bold italic text-slate-400">
              * ระบุเบอร์โทรศัพท์สำหรับการติดต่อกลับและยืนยันการจอง
            </p>
          )}
        </section>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-sm font-bold leading-relaxed text-red-300">
            <span className="material-symbols-outlined text-[20px]">
              warning
            </span>
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 border-t border-green-300/10 bg-[#061524]/92 px-5 py-6 shadow-[0_-18px_60px_rgba(34,197,94,0.18)] backdrop-blur">
        <button
          type="button"
          onClick={onConfirm}
          disabled={isSubmitting}
          className="h-20 w-full rounded-3xl bg-green-400 text-xl font-black text-[#063018] shadow-[0_18px_50px_rgba(34,197,94,0.28)] transition-all duration-150 hover:bg-green-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[34px]">
              check_circle
            </span>
            ยืนยันการจองสนาม
          </span>
        </button>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-base font-black sm:text-xl">
      <span className="text-slate-300">{label}</span>
      <span className="text-slate-100">{value}</span>
    </div>
  );
}
