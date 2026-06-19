export type Court = {
  name: string;
  surface: string | null;
};

export type BookingItem = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  price: string;
  court: Court;
};

export type Payment = {
  id: string;
  status: string;
} | null;

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "expired"
  | "no_show";

export type Booking = {
  id: string;
  totalPrice: string;
  status: BookingStatus;
  createdAt: string;
  items: BookingItem[];
};

export type StatusFilter = "all" | BookingStatus;

export type StatusOption = {
  value: StatusFilter;
  label: string;
};

export type BookingStatusSummary = Record<StatusFilter, number>;

export type BookingHistoryPageData = {
  bookings: Booking[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  totalBookings: number;
  statusSummary: BookingStatusSummary;
};
