import type { ApiResponse, Location, Supplier } from "@/types";
import useApi from "./useApi";

export interface Availability {
  id: number;
  supplier: Supplier;
  location: Location;
  weekday: string;
  from_hour: string;
  to_hour: string;
  created_date: string;
  updated_date: string;
}

export const useAvailability = () => {
  const config = useRuntimeConfig();
  const { getToken } = useAuthToken();

  const fetchAvailability = () => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/availability/get_all`;

    return useApi<ApiResponse<Availability[]>>(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const fetchAvailabilityBySupplierId = (supplierId: number) => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/availability/get_all?supplier_id=${supplierId}`;

    return useApi<ApiResponse<Availability[]>>(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  return {
    fetchAvailability,
    fetchAvailabilityBySupplierId,
  };
};
