
export type BookingStatus =
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "expired"
    | "no_show";

export type StatusFilter = "all" | BookingStatus;


export type PrismaBookingStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "expired"
  | "no_show";



export interface BookingCourt {
    id?: string;
    name: string;
}

export interface BookingItem {
    id?: string;
    date: string;
    startTime: string;
    endTime: string;
    court?: BookingCourt | null;
}

export interface BookingUser {
    id?: string;
    displayName: string;
    phone?: string | null;
    pictureUrl?: string | null;
}

export interface Booking {
    id: string;
    totalPrice: number;
    status: BookingStatus;
    user: BookingUser;
    items: BookingItem[];
}
