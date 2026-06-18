export type OperatingHourRow = {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
};

export interface OperatingHoursResponse {
  operatingHours: OperatingHourRow[];
  message?: string;
}

export interface UpdateOperatingHoursPayload {
  hours: OperatingHourRow[];
}

export interface UpdateOperatingHoursResponse {
  operatingHours?: OperatingHourRow[];
  message?: string;
}

export type OperatingHourField =
  | "openTime"
  | "closeTime";
