import type { ApiResponse, Supplier } from "~/types";
import useApi, { type UsableAPI } from "./useApi";

export const useSupplier = () => {
  const config = useRuntimeConfig();
  const token = useCookie("token");

  const fetchSupplier = (): UsableAPI<ApiResponse<Supplier[]>> => {
    if (!token.value) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/supplier/get_all`;

    return useApi<ApiResponse<Supplier[]>>(url, {
      method: "GET",
      headers: {
        Authorization: token.value,
        "Content-Type": "application/json",
      },
    });
  };

  return { fetchSupplier };
};
