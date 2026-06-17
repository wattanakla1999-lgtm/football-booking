export type BookingStatus =
    | "pending"
    | "paid"
    | "confirmed"
    | "completed"
    | "cancelled"
    | null;

export type Slot = {
    startTime: string;
    endTime: string;
    isAvailable: boolean;
    bookedBy: string | null;
    customerPhone: string | null;
    bookingStatus: BookingStatus;
    bookingId: string | null;
    notes: string | null;
};

export type CourtAvailability = {
    id: string;
    name: string;
    slots: Slot[];
};

export type SelectedBookedSlot = Slot & {
    courtName: string;
};

export type StatusColor = {
    bg: string;
    border: string;
    text: string;
};