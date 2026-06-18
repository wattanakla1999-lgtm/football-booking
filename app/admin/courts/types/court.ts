export type CourtImage = {
  id: string;
  url: string;
};

export type Court = {
  id: string;
  name: string;
  description: string | null;
  surface: string | null;
  maxPlayers: number | null;
  pricePerHour: string | number;
  isActive: boolean;
  images: CourtImage[];
};

export type CourtFormValues = {
  name: string;
  pricePerHour: string;
  maxPlayers: string;
  surface: string;
  imageUrl: string;
  description: string;
  isActive: boolean;
};

export type SaveCourtPayload = {
  courtId?: string;
  name: string;
  pricePerHour: string;
  maxPlayers: number | null;
  surface: string;
  imageUrl: string;
  description: string;
  isActive: boolean;
};
