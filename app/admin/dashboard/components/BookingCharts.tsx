import type { DashboardChartSeries } from "../types/adminBooking";
import { DailyLoadChart } from "./DailyLoadChart";
import { RevenueGrowthChart } from "./RevenueGrowthChart";

type BookingChartsProps = {
  chartSeries: DashboardChartSeries;
};

export function BookingCharts({
  chartSeries,
}: BookingChartsProps) {
  return (
    <div className="flex flex-col gap-lg">
      <RevenueGrowthChart
        data={chartSeries.revenue}
        trend={chartSeries.revenueTrend}
        weeklyTotal={chartSeries.weeklyRevenueTotal}
      />
      <DailyLoadChart
        data={chartSeries.load}
        trend={chartSeries.loadTrend}
        weeklyTotal={chartSeries.weeklyLoadTotal}
      />
    </div>
  );
}
