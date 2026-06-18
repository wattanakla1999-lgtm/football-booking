import { formatPrice } from "../utils/booking";

type BookingSuccessStepProps = {
  bookingId: string;
  courtName: string;
  bookingDateLabel: string;
  slotLabels: string[];
  totalPrice: number;
  isNavigating?: boolean;
  onViewHistory: () => void;
  onViewBookingDetail: () => void;
};

function shortBookingId(bookingId: string) {
  return bookingId.slice(-8).toUpperCase();
}

export function BookingSuccessStep({
  bookingId,
  courtName,
  bookingDateLabel,
  slotLabels,
  totalPrice,
  isNavigating = false,
  onViewHistory,
  onViewBookingDetail,
}: BookingSuccessStepProps) {
  return (
    <div className="mt-1 animate-[slideUp_0.3s_ease-out]">
      <div className="overflow-hidden rounded-[28px] border border-green-500/20 bg-gradient-to-b from-green-500/12 via-green-500/8 to-white/[0.03]">
        <div className="border-b border-green-500/15 px-6 py-7 text-center">
          <div className="mx-auto w-full max-w-2xl">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-green-400/20 bg-green-500/15 shadow-[0_0_40px_rgba(34,197,94,0.2)]">
              <span className="material-symbols-outlined text-[42px] text-green-400">
                task_alt
              </span>
            </div>

            <h2 className="mt-5 w-full text-2xl font-extrabold leading-tight text-white">
              จองสนามสำเร็จแล้ว
            </h2>

            <p className="mt-3 w-full text-sm leading-7 text-white/65">
              ระบบบันทึกรายการจองของคุณเรียบร้อยแล้ว
              สามารถดูรายการทั้งหมดหรือเปิดดูรายการที่เพิ่งจองได้ทันที
            </p>
          </div>
        </div>

        <div className="space-y-4 px-6 py-6">
          <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
              รหัสการจอง
            </p>
            <p className="mt-2 font-mono text-lg font-bold text-green-400">
              #{shortBookingId(bookingId)}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                สนาม
              </p>
              <p className="mt-2 text-sm font-bold text-white">
                {courtName}
              </p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                วันที่
              </p>
              <p className="mt-2 text-sm font-bold text-white">
                {bookingDateLabel}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
              ช่วงเวลาที่จอง
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {slotLabels.map((slotLabel) => (
                <span
                  key={slotLabel}
                  className="inline-flex rounded-xl bg-green-500/10 px-3 py-1.5 text-sm font-semibold text-green-300"
                >
                  {slotLabel}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-green-500/15 bg-green-500/[0.07] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-white/70">
                ยอดรวมทั้งหมด
              </span>
              <span className="text-2xl font-extrabold text-green-400">
                ฿{formatPrice(totalPrice)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <button
          type="button"
          onClick={onViewBookingDetail}
          disabled={isNavigating}
          className="w-full rounded-2xl bg-green-500 py-4 text-base font-bold text-white transition-all duration-150 hover:bg-green-600 active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
        >
          ดูรายละเอียดการจอง
        </button>

        <button
          type="button"
          onClick={onViewHistory}
          disabled={isNavigating}
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-4 text-sm font-semibold text-white/80 transition-all duration-150 hover:bg-white/[0.06] active:scale-[0.98] disabled:cursor-wait disabled:opacity-70"
        >
          ดูการจองทั้งหมดของฉัน
        </button>
      </div>
    </div>
  );
}
