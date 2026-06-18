import { bookingStatusMeta } from "@/src/constants/statusColors";

export type BookingStatus =
  | "pending"
  | "paid"
  | "confirmed"
  | "cancelled"
  | "completed";

export type StatusFilter = "all" | BookingStatus;

export type BookingItem = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  price: string | number;
  court: { name: string };
};

export type BookingUser = {
  displayName: string;
  pictureUrl: string | null;
  lineUserId: string | null;
  phone: string | null;
};

export type Payment = {
  id: string;
  amount: string | number;
  slipUrl: string | null;
  status: string;
} | null;

export type Booking = {
  id: string;
  totalPrice: string | number;
  status: BookingStatus;
  notes: string | null;
  createdAt: string;
  user: BookingUser;
  items: BookingItem[];
  payment: Payment;
};

 export type BookingStatusMetaKey = keyof typeof bookingStatusMeta;
export type PaymentStatusMetaKey = keyof typeof paymentStatusMeta;
