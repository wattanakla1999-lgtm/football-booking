import type {
  Court,
  SaveCourtPayload,
} from "@/app/admin/courts/types/court";
import apiClient from "@/lib/apiClient";

export async function fetchAdminCourts(): Promise<Court[]> {
  const response =
    await apiClient.get<{ courts?: Court[] }>(
      "/admin/courts",
    );

  return response.data.courts || [];
}

export async function createAdminCourt(
  payload: SaveCourtPayload
) {
  const response =
    await apiClient.post<{ success: true }>(
      "/admin/courts",
      payload,
    );

  return response.data;
}

export async function updateAdminCourt(
  payload: SaveCourtPayload & { courtId: string }
) {
  const response =
    await apiClient.patch<{ success: true }>(
      "/admin/courts",
      payload,
    );

  return response.data;
}

export async function deleteAdminCourt(courtId: string) {
  const response =
    await apiClient.delete<{ success: true }>(
      "/admin/courts",
      {
        params: {
          courtId,
        },
      },
    );

  return response.data;
}
