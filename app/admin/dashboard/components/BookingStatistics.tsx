import type {
  BookingStatistics as BookingStatisticsType,
} from "../types/adminBooking";

import { formatPrice } from "../utils/adminBooking";
import { StatCard } from "./StatCard";

type BookingStatisticsProps = {
  statistics: BookingStatisticsType;
};

export function BookingStatistics({
  statistics,
}: BookingStatisticsProps) {
  const totalStatuses =
    statistics.pendingCount +
    statistics.confirmedCount +
    statistics.completedCount +
    statistics.cancelledCount;

  const formatShare = (value: number) => {
    if (totalStatuses === 0) {
      return "0%";
    }

    return `${Math.round(
      (value / totalStatuses) * 100,
    )}%`;
  };

  return (
    <section className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-md mb-lg">
      <StatCard
        icon="pending_actions"
        label="รอดำเนินการ"
        value={statistics.pendingCount}
        trendLabel={formatShare(
          statistics.pendingCount,
        )}
        trendIcon="donut_small"
      />

      <StatCard
        icon="check_circle"
        label="ยืนยันแล้ว"
        value={statistics.confirmedCount}
        trendLabel={formatShare(
          statistics.confirmedCount,
        )}
        trendIcon="donut_small"
      />

      <StatCard
        icon="task_alt"
        label="เสร็จสิ้น"
        value={statistics.completedCount}
        trendLabel={formatShare(
          statistics.completedCount,
        )}
        trendIcon="donut_small"
        tone="neutral"
      />

      <StatCard
        icon="cancel"
        label="ยกเลิกแล้ว"
        value={statistics.cancelledCount}
        trendLabel={formatShare(
          statistics.cancelledCount,
        )}
        trendIcon="donut_small"
        tone="error"
      />

      <StatCard
        icon="payments"
        label="รายได้วันนี้"
        value={`฿${formatPrice(
          statistics.todayRevenue,
        )}`}
        trendLabel="วันนี้"
        trendIcon="today"
      />

      <StatCard
        icon="account_balance_wallet"
        label="รายได้เดือนนี้"
        value={`฿${formatPrice(
          statistics.monthlyRevenue,
        )}`}
        trendLabel="เดือนนี้"
        trendIcon="calendar_month"
      />
    </section>
  );
}
