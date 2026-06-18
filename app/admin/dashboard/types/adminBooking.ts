export type BookingStatus =
  | "pending"
  | "paid"
  | "confirmed"
  | "cancelled"
  | "completed";

export type BookingItem = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  price: string;
  court: {
    name: string;
  };
};

export type BookingUser = {
  displayName: string;
  pictureUrl: string | null;
  phone: string | null;
};

export type AdminBooking = {
  id: string;
  totalPrice: string;
  status: BookingStatus;
  createdAt: string;
  items: BookingItem[];
  user: BookingUser;
};

export type AdminBookingResponse = {
  bookings: AdminBooking[];
  message?: string;
};

export type UpdateBookingStatusPayload = {
  bookingId: string;
  status: BookingStatus;
};

export type UpdateBookingStatusResponse = {
  booking?: AdminBooking;
  message?: string;
};

export type BookingStatistics = {
  pendingCount: number;
  confirmedCount: number;
  completedCount: number;
  cancelledCount: number;
  todayRevenue: number;
  monthlyRevenue: number;
};

export type DashboardChartPoint = {
  dateKey: string;
  label: string;
  shortLabel: string;
  value: number;
};

export type DashboardTrend = {
  value: number;
  direction: "up" | "down" | "flat";
};

export type DashboardChartSeries = {
  revenue: DashboardChartPoint[];
  load: DashboardChartPoint[];
  revenueTrend: DashboardTrend;
  loadTrend: DashboardTrend;
  weeklyRevenueTotal: number;
  weeklyLoadTotal: number;
};
