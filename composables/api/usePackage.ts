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

  return { fetchPackages };
};
