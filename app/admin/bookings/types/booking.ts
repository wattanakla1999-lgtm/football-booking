import { bookingStatusMeta } from "@/src/constants/statusColors";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "expired"
  | "no_show";

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

export type Booking = {
  id: string;
  totalPrice: string | number;
  status: BookingStatus;
  notes: string | null;
  createdAt: string;
  user: BookingUser;
  items: BookingItem[];
};

export type BookingStatusMetaKey = keyof typeof bookingStatusMeta;
