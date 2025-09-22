import type { ApiResponse, Package } from "~/types";
import useApi, { type UsableAPI } from "./useApi";

export const usePackage = () => {
  const config = useRuntimeConfig();
  const token = useCookie("token");

  const fetchPackages = (): UsableAPI<ApiResponse<Package[]>> => {
    if (!token.value) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/package/get_all`;

    return useApi<ApiResponse<Package[]>>(url, {
      method: "GET",
      headers: {
        Authorization: token.value,
        "Content-Type": "application/json",
      },
    });
  };

  const createPackage = (
    packageData: Partial<Package>
  ): UsableAPI<ApiResponse<Package>> => {
    if (!token.value) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/package/add`;

    return useApi<ApiResponse<Package>>(url, {
      method: "POST",
      headers: {
        Authorization: token.value,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(packageData),
    });
  };

  return { fetchPackages, createPackage };
};
