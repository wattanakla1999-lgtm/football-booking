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
  | "paid"
  | "confirmed"
  | "cancelled"
  | "completed";

export type Booking = {
  id: string;
  totalPrice: string;
  status: BookingStatus;
  createdAt: string;
  items: BookingItem[];
  payment: Payment;
};

export type StatusFilter = "all" | BookingStatus;

export type StatusOption = {
  value: StatusFilter;
  label: string;
};

export type BookingStatusSummary = Record<StatusFilter, number>;
