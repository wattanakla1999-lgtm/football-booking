import apiClient from "@/lib/apiClient";

import type {
  AdminLoginPayload,
  AdminLoginResponse,
} from "../types/adminAuth";

export async function loginAdmin(
  payload: AdminLoginPayload,
): Promise<AdminLoginResponse> {
  const response =
    await apiClient.post<AdminLoginResponse>(
      "/admin/auth",
      payload,
    );

  return response.data;
}
