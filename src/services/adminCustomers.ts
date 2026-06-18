import apiClient from "@/lib/apiClient";

import type { CustomerSearchItem } from "@/app/admin/availability/types/availability";

type SearchAdminCustomersResponse = {
  customers?: CustomerSearchItem[];
};

export async function searchAdminCustomers(
  query: string,
): Promise<CustomerSearchItem[]> {
  const response =
    await apiClient.get<SearchAdminCustomersResponse>(
      "/admin/customers",
      {
        params: { query },
      },
    );

  return Array.isArray(response.data.customers)
    ? response.data.customers
    : [];
}
