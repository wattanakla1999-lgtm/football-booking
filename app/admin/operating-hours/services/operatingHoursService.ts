import apiClient from "@/lib/apiClient";

import type {
  OperatingHoursResponse,
  UpdateOperatingHoursPayload,
  UpdateOperatingHoursResponse,
} from "../types/operatingHours";

export async function getOperatingHours(): Promise<OperatingHoursResponse> {
  const response =
    await apiClient.get<OperatingHoursResponse>(
      "/admin/operating-hours",
    );

  return response.data;
}

export async function updateOperatingHours(
  payload: UpdateOperatingHoursPayload,
): Promise<UpdateOperatingHoursResponse> {
  const response =
    await apiClient.patch<UpdateOperatingHoursResponse>(
      "/admin/operating-hours",
      payload,
    );

  return response.data;
}
