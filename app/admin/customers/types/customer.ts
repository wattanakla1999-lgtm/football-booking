export type CustomerStatus = "active" | "inactive";

export type CustomerSource = "line" | "offline";

export type CustomerSummary = {
  id: string;
  displayName: string;
  pictureUrl: string | null;
  phone: string | null;
  email: string | null;
  lineUserId: string;
  isActive: boolean;
  createdAt: string;
  lastBookingAt: string | null;
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpent: number;
  favoriteCourt: string | null;
  source: CustomerSource;
  status: CustomerStatus;
};
