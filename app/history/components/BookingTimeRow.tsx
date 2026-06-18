import type { BookingItem } from "../types/booking";
import { formatPrice } from "../utils/booking";

type BookingTimeRowProps = {
  item: BookingItem;
  showCourtName: boolean;
};

export function BookingTimeRow({
  item,
  showCourtName,
}: BookingTimeRowProps) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <span className="material-symbols-outlined shrink-0 text-[16px] text-white/35">
          schedule
        </span>

        <div className="min-w-0">
          <p className="whitespace-nowrap text-xs font-medium text-white/80">
            {item.startTime} - {item.endTime}
          </p>

          {showCourtName && (
            <p className="mt-0.5 truncate text-[10px] text-white/35">
              {item.court?.name || "สนามฟุตบอล"}
            </p>
          )}
        </div>
      </div>

      <span className="shrink-0 text-xs font-bold text-white/55">
        ฿{formatPrice(item.price)}
      </span>
    </div>
  );
}
