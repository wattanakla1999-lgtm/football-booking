import type { Booking } from "../types/booking";
import {
  formatCreatedAt,
  formatDate,
  formatPrice,
  getPaymentLabel,
  shortBookingId,
} from "../utils/booking";
import { StatusBadge } from "./StatusBadge";

type BookingDetailModalProps = {
  booking: Booking;
  onClose: () => void;
};

export function BookingDetailModal({
  booking,
  onClose,
}: BookingDetailModalProps) {
  const firstItem = booking.items[0];
  const bookingDate = firstItem?.date
    ? formatDate(firstItem.date)
    : "ไม่พบวันที่";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[640px] rounded-[28px] border border-white/10 bg-[#171f35] shadow-2xl"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 px-5 py-5 sm:px-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/35">
              รายละเอียดการจอง
            </p>
            <h3 className="mt-2 text-xl font-extrabold text-green-400">
              {firstItem?.court?.name ||
                "สนามฟุตบอล"}
            </h3>
            <p className="mt-1 font-mono text-sm text-white/45">
              #{shortBookingId(booking.id)}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge
              status={booking.status}
            />
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              ปิด
            </button>
          </div>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <DetailCard
              label="วันที่จอง"
              value={bookingDate}
            />
            <DetailCard
              label="สร้างเมื่อ"
              value={formatCreatedAt(
                booking.createdAt,
              )}
            />
            <DetailCard
              label="พื้นสนาม"
              value={
                firstItem?.court?.surface ||
                "ไม่ระบุ"
              }
            />
            <DetailCard
              label="สถานะการชำระเงิน"
              value={getPaymentLabel(booking)}
            />
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/15">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <p className="text-sm font-bold text-white/80">
                ช่วงเวลาที่จอง
              </p>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white/45">
                {booking.items.length} รายการ
              </span>
            </div>

            <div className="divide-y divide-white/10">
              {booking.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white">
                      {item.startTime.slice(0, 5)} -{" "}
                      {item.endTime.slice(0, 5)}
                    </p>
                    <p className="mt-1 text-xs text-white/45">
                      {item.court.name}
                    </p>
                  </div>

                  <div className="shrink-0 text-right text-sm font-bold text-white/80">
                    ฿{formatPrice(item.price)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-end justify-between gap-3 rounded-2xl border border-green-500/15 bg-green-500/[0.08] px-4 py-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                ยอดรวมทั้งหมด
              </p>
              <p className="mt-1 text-xs text-white/55">
                รวมราคาทุกรายการใน booking นี้
              </p>
            </div>

            <p className="text-2xl font-extrabold text-green-400">
              ฿{formatPrice(booking.totalPrice)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/35">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold text-white/85">
        {value}
      </p>
    </div>
  );
}
