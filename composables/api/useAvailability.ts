import type { ApiResponse, Location, Supplier } from "@/types";
import useApi, { type UsableAPI } from "./useApi";

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

export interface CreateAvailabilityPayload {
  supplier_id: number;
  location_id: number;
  weekday: string;
  from_hour: string;
  to_hour: string;
}

export interface UpdateAvailabilityPayload {
  supplier_id?: number;
  location_id?: number;
  weekday?: string;
  from_hour?: string;
  to_hour?: string;
}

export const useAvailability = () => {
  const config = useRuntimeConfig();
  const { getToken } = useAuthToken();

  const getHeaders = (): HeadersInit => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    return {
      Authorization: token,
      "Content-Type": "application/json",
    };
  };

  const fetchAvailability = (): UsableAPI<ApiResponse<Availability[]>> => {
    return useApi<ApiResponse<Availability[]>>(
      `${config.public.API_BASE_URL}/availability/get_all`,
      { method: "GET", headers: getHeaders() },
    );
  };

  const fetchAvailabilityBySupplierId = (
    supplierId: number,
  ): UsableAPI<ApiResponse<Availability[]>> => {
    return useApi<ApiResponse<Availability[]>>(
      `${config.public.API_BASE_URL}/availability/get_all?supplier_id=${supplierId}`,
      { method: "GET", headers: getHeaders() },
    );
  };

  const fetchAvailabilityById = (
    id: number,
  ): UsableAPI<ApiResponse<Availability>> => {
    return useApi<ApiResponse<Availability>>(
      `${config.public.API_BASE_URL}/availability/get?id=${id}`,
      { method: "GET", headers: getHeaders() },
    );
  };

  const createAvailability = (
    payload: CreateAvailabilityPayload,
  ): UsableAPI<ApiResponse<Availability>> => {
    return useApi<ApiResponse<Availability>>(
      `${config.public.API_BASE_URL}/availability/add`,
      { method: "POST", headers: getHeaders(), body: JSON.stringify(payload) },
    );
  };

  const updateAvailability = (
    id: number,
    payload: UpdateAvailabilityPayload,
  ): UsableAPI<ApiResponse<Availability>> => {
    return useApi<ApiResponse<Availability>>(
      `${config.public.API_BASE_URL}/availability/edit?id=${id}`,
      { method: "PUT", headers: getHeaders(), body: JSON.stringify(payload) },
    );
  };

  const deleteAvailability = (id: number): UsableAPI<ApiResponse<void>> => {
    return useApi<ApiResponse<void>>(
      `${config.public.API_BASE_URL}/availability/delete?id=${id}`,
      { method: "DELETE", headers: getHeaders() },
    );
  };

  return {
    fetchAvailability,
    fetchAvailabilityBySupplierId,
    fetchAvailabilityById,
    createAvailability,
    updateAvailability,
    deleteAvailability,
  };
};
