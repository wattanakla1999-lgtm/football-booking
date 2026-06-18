import type { Booking } from "../types/booking";
import {
  formatCreatedAt,
  formatDate,
  formatPrice,
  getPaymentLabel,
  shortBookingId,
} from "../utils/booking";
import { BookingTimeRow } from "./BookingTimeRow";
import { InformationBox } from "./InformationBox";
import { StatusBadge } from "./StatusBadge";

type BookingCardProps = {
  booking: Booking;
  onPayment: (booking: Booking) => void;
};

export function BookingCard({
  booking,
  onPayment,
}: BookingCardProps) {
  const firstItem = booking.items?.[0];
  const primaryCourtName =
    firstItem?.court?.name || "สนามฟุตบอล";

  const bookingDate = firstItem?.date
    ? formatDate(firstItem.date)
    : "ไม่พบวันที่";

  const additionalCourtCount = Math.max(
    new Set(
      booking.items
        .map((item : { court?: { name: string } }) => item.court?.name)
        .filter(Boolean),
    ).size - 1,
    0,
  );

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition-all duration-200 hover:-translate-y-0.5 hover:border-green-500/20 hover:bg-white/[0.055]">
      <div className="flex min-w-0 items-start justify-between gap-3 border-b border-white/10 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-400">
            <span className="material-symbols-outlined text-[21px]">
              sports_soccer
            </span>
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-bold text-green-400">
              {primaryCourtName}
            </h3>

            <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-[11px] text-white/40">
              <span className="material-symbols-outlined shrink-0 text-[14px]">
                confirmation_number
              </span>

              <span className="truncate font-mono">
                #{shortBookingId(booking.id)}
              </span>
            </div>
          </div>
        </div>

        <StatusBadge status={booking.status} />
      </div>

      <div className="flex-1 space-y-4 p-4">
        <div className="grid min-w-0 grid-cols-2 gap-2">
          <InformationBox
            icon="calendar_today"
            label="วันที่จอง"
            value={bookingDate}
          />

          <InformationBox
            icon="grass"
            label="พื้นสนาม"
            value={firstItem?.court?.surface || "ไม่ระบุ"}
          />
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2.5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px] text-green-400">
                schedule
              </span>

              <p className="text-xs font-bold text-white/70">
                ช่วงเวลาที่จอง
              </p>
            </div>

            <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/50">
              {booking.items.length} รายการ
            </span>
          </div>

          <div className="divide-y divide-white/10">
            {booking.items.map((item) => (
              <BookingTimeRow
                key={item.id}
                item={item}
                showCourtName={
                  item.court?.name !== primaryCourtName ||
                  additionalCourtCount > 0
                }
              />
            ))}
          </div>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">
              สถานะการชำระเงิน
            </p>

            <div className="mt-1 flex items-center gap-1.5">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  booking.payment
                    ? "bg-green-400"
                    : "bg-yellow-400"
                }`}
              />

              <span className="truncate text-xs text-white/60">
                {getPaymentLabel(booking)}
              </span>
            </div>
          </div>

          <div className="shrink-0 text-right">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">
              ยอดรวม
            </p>

            <p className="mt-0.5 text-xl font-bold text-white">
              <span className="mr-0.5 text-sm text-green-400">
                ฿
              </span>
              {formatPrice(booking.totalPrice)}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-white/10 bg-black/10 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-1.5 text-[11px] text-white/35">
          <span className="material-symbols-outlined shrink-0 text-[15px]">
            history
          </span>

          <span className="truncate">
            สร้างเมื่อ {formatCreatedAt(booking.createdAt)}
          </span>
        </div>

        {booking.status === "pending" ? (
          <button
            type="button"
            onClick={() => onPayment(booking)}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-green-500/30 bg-green-500/10 px-3 text-xs font-bold text-green-400 transition-all hover:bg-green-500 hover:text-white active:scale-95"
          >
            <span className="material-symbols-outlined text-[17px]">
              upload_file
            </span>
            แจ้งชำระเงิน
          </button>
        ) : (
          <div className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 text-[11px] font-bold text-white/40">
            <span className="material-symbols-outlined text-[16px]">
              receipt_long
            </span>
            ดูรายละเอียด
          </div>
        )}
      </div>
    </article>
  );
}
