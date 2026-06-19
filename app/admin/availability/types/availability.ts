export type BookingStatus =
    | "pending"
    | "confirmed"
    | "completed"
    | "cancelled"
    | "expired"
    | "no_show"
    | null;

export type ManualBookingStatus =
    | "pending"
    | "confirmed"
    | "completed"
    | "no_show";

export type CustomerMode =
    | "existing"
    | "new";

export type CustomerSearchItem = {
    id: string;
    displayName: string;
    phone: string | null;
    pictureUrl: string | null;
    lineUserId: string;
    createdAt: string;
};

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
