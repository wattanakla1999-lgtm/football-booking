import type {
  DashboardChartPoint,
  DashboardTrend,
} from "../types/adminBooking";

type DailyLoadChartProps = {
  data: DashboardChartPoint[];
  trend: DashboardTrend;
  weeklyTotal: number;
};

export function DailyLoadChart({
  data,
  trend,
  weeklyTotal,
}: DailyLoadChartProps) {
  const maxValue = Math.max(
    ...data.map((item : DashboardChartPoint) => item.value),
    1,
  );

  const trendLabel =
    trend.direction === "flat"
      ? "คงที่"
      : `${trend.direction === "up" ? "+" : "-"}${trend.value}%`;

  return (
    <div className="glass-card flex-1 rounded-xl p-md">
      <div className="mb-md flex items-start justify-between gap-3">
        <div>
          <h3 className="text-headline-md font-headline-md">
          ปริมาณการใช้งาน
          </h3>
          <p className="mt-1 text-label-sm text-on-surface-variant">
            {weeklyTotal} ช่วงเวลาที่ถูกจองใน 7 วันล่าสุด
          </p>
        </div>

        <span
          className={`inline-flex items-center rounded-full px-2.5 py-1 text-label-sm font-bold ${
            trend.direction === "down"
              ? "bg-error/10 text-error"
              : trend.direction === "flat"
                ? "bg-surface-container-high text-on-surface-variant"
                : "bg-primary/10 text-primary"
          }`}
        >
          {trendLabel}
        </span>
      </div>

      <div className="flex h-40 items-end justify-between gap-3 px-1">
        {data.map((item : DashboardChartPoint) => (
          <div
            key={item.dateKey}
            className="group relative flex w-full flex-col items-center gap-2"
          >
            <div className="pointer-events-none absolute -top-2 left-1/2 z-10 w-max -translate-x-1/2 -translate-y-full rounded-lg border border-outline-variant/20 bg-surface px-2.5 py-1.5 text-[11px] font-semibold text-on-surface opacity-0 shadow-lg shadow-black/20 transition-all duration-150 group-hover:opacity-100">
              <div>{item.label}</div>
              <div className="text-on-surface-variant">
                {item.value} ช่วงเวลา
              </div>
            </div>

            <span className="text-[11px] font-semibold text-on-surface-variant">
              {item.value}
            </span>
            <div className="relative flex h-28 w-full items-end overflow-hidden rounded-t-xl bg-surface-container-low">
              <div
                className="w-full rounded-t-xl bg-gradient-to-t from-primary to-emerald-300 transition-all duration-500"
                style={{
                  height: `${Math.max(
                    10,
                    (item.value / maxValue) * 100,
                  )}%`,
                  boxShadow:
                    "0 0 24px rgba(75, 226, 119, 0.18)",
                }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 mt-4 text-center">
        {data.map((item : DashboardChartPoint) => (
          <span
            key={item.dateKey}
            className="text-label-sm text-on-surface-variant"
            title={item.label}
          >
            {item.shortLabel}
          </span>
        ))}
      </div>
    </div>
  );
}
