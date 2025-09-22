import type { ApiResponse, Product } from "~/types";
import useApi, { type UsableAPI } from "./useApi";

export const useProducts = () => {
  const config = useRuntimeConfig();
  const token = useCookie("token");

  const fetchProducts = (params?: {
    father_code?: string;
  }): UsableAPI<ApiResponse<Product[]>> => {
    if (!token.value) throw new Error("No authentication token found");

    const query = new URLSearchParams({
      type: "MEDICAL_PRODUCT",
      ...(params?.father_code && { father_code: params.father_code }),
    });

    const url = `${config.public.API_BASE_URL}/udc/get_all?${query.toString()}`;

    return useApi<ApiResponse<Product[]>>(url, {
      method: "GET",
      headers: {
        Authorization: token.value,
        "Content-Type": "application/json",
      },
    });
  };

  return { fetchProducts };
};
