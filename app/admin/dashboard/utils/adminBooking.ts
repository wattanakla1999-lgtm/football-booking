import type {
  AdminBooking,
  BookingStatistics,
  DashboardChartPoint,
  DashboardChartSeries,
  DashboardTrend,
} from "../types/adminBooking";

const REVENUE_STATUSES = new Set([
  "paid",
  "confirmed",
  "completed",
]);

export function formatPrice(
  price: string | number,
): string {
  const numericPrice = Number(price);

  if (!Number.isFinite(numericPrice)) {
    return "0";
  }

  return numericPrice.toLocaleString("th-TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function calculateBookingStatistics(
  bookings: AdminBooking[],
): BookingStatistics {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const monthStart = new Date(
    todayStart.getFullYear(),
    todayStart.getMonth(),
    1,
  );

  return bookings.reduce<BookingStatistics>(
    (statistics, booking) => {
      if (
        booking.status === "pending" ||
        booking.status === "paid"
      ) {
        statistics.pendingCount += 1;
      }

      if (booking.status === "confirmed") {
        statistics.confirmedCount += 1;
      }

      if (booking.status === "completed") {
        statistics.completedCount += 1;
      }

      if (booking.status === "cancelled") {
        statistics.cancelledCount += 1;
      }

      if (REVENUE_STATUSES.has(booking.status)) {
        const amount = Number(booking.totalPrice) || 0;
        const createdDate = new Date(booking.createdAt);

        if (
          !Number.isNaN(createdDate.getTime()) &&
          createdDate >= todayStart
        ) {
          statistics.todayRevenue += amount;
        }

        if (
          !Number.isNaN(createdDate.getTime()) &&
          createdDate >= monthStart
        ) {
          statistics.monthlyRevenue += amount;
        }
      }

      return statistics;
    },
    {
      pendingCount: 0,
      confirmedCount: 0,
      completedCount: 0,
      cancelledCount: 0,
      todayRevenue: 0,
      monthlyRevenue: 0,
    },
  );
}

export function getUniqueCourtNames(
  bookings: AdminBooking[],
): string[] {
  return Array.from(
    new Set(
      bookings
        .flatMap((booking : AdminBooking) =>
          booking.items.map(
            (item) => item.court?.name,
          ),
        )
        .filter(
          (name): name is string =>
            Boolean(name),
        ),
    ),
  );
}

function startOfDay(date: Date) {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
}

function formatDateKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function formatShortThaiDay(date: Date) {
  return date.toLocaleDateString("th-TH", {
    weekday: "short",
  });
}

function buildTrend(
  currentValue: number,
  previousValue: number,
): DashboardTrend {
  if (currentValue === previousValue) {
    return {
      value: 0,
      direction: "flat",
    };
  }

  if (previousValue === 0) {
    return {
      value: currentValue > 0 ? 100 : 0,
      direction: currentValue > 0 ? "up" : "flat",
    };
  }

  const deltaPercent =
    ((currentValue - previousValue) / previousValue) *
    100;

  return {
    value: Math.round(Math.abs(deltaPercent)),
    direction: deltaPercent > 0 ? "up" : "down",
  };
}

export function buildDashboardChartSeries(
  bookings: AdminBooking[],
): DashboardChartSeries {
  const today = startOfDay(new Date());

  const revenueByDay = new Map<string, number>();
  const loadByDay = new Map<string, number>();

  const chartDays = Array.from(
    { length: 7 },
    (_, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - index));
      return date;
    },
  );

  for (const day of chartDays) {
    const key = formatDateKey(day);
    revenueByDay.set(key, 0);
    loadByDay.set(key, 0);
  }

  bookings.forEach((booking) => {
    const hasRevenue =
      REVENUE_STATUSES.has(booking.status);

    booking.items.forEach((item) => {
      const itemDate = new Date(item.date);

      if (Number.isNaN(itemDate.getTime())) {
        return;
      }

      const dayKey = formatDateKey(itemDate);

      if (!loadByDay.has(dayKey)) {
        return;
      }

      loadByDay.set(
        dayKey,
        (loadByDay.get(dayKey) || 0) + 1,
      );

      if (hasRevenue) {
        revenueByDay.set(
          dayKey,
          (revenueByDay.get(dayKey) || 0) +
            (Number(item.price) || 0),
        );
      }
    });
  });

  const revenue = chartDays.map<DashboardChartPoint>(
    (day) => {
      const key = formatDateKey(day);

      return {
        dateKey: key,
        label: day.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
        }),
        shortLabel: formatShortThaiDay(day),
        value: revenueByDay.get(key) || 0,
      };
    },
  );

  const load = chartDays.map<DashboardChartPoint>(
    (day) => {
      const key = formatDateKey(day);

      return {
        dateKey: key,
        label: day.toLocaleDateString("th-TH", {
          day: "numeric",
          month: "short",
        }),
        shortLabel: formatShortThaiDay(day),
        value: loadByDay.get(key) || 0,
      };
    },
  );

  const currentRevenueWindow = revenue
    .slice(3)
    .reduce(
      (sum, point) => sum + point.value,
      0,
    );

  const previousRevenueWindow = revenue
    .slice(0, 3)
    .reduce(
      (sum, point) => sum + point.value,
      0,
    );

  const currentLoadWindow = load
    .slice(3)
    .reduce(
      (sum, point) => sum + point.value,
      0,
    );

  const previousLoadWindow = load
    .slice(0, 3)
    .reduce(
      (sum, point) => sum + point.value,
      0,
    );

  return {
    revenue,
    load,
    revenueTrend: buildTrend(
      currentRevenueWindow,
      previousRevenueWindow,
    ),
    loadTrend: buildTrend(
      currentLoadWindow,
      previousLoadWindow,
    ),
    weeklyRevenueTotal: revenue.reduce(
      (sum, point) => sum + point.value,
      0,
    ),
    weeklyLoadTotal: load.reduce(
      (sum, point) => sum + point.value,
      0,
    ),
  };
}
