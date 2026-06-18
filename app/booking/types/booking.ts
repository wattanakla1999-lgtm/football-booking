export type Court = {
  id: string;
  name: string;
  surface: string | null;
  maxPlayers: number | null;
  pricePerHour: number | string;
  images: { url: string }[];
};

export type TimeSlot = {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
};

export type BookingUser = {
  id: string;
  displayName: string;
  pictureUrl: string | null;
  phone: string | null;
};

export type BookingStep = 1 | 2 | 3;
