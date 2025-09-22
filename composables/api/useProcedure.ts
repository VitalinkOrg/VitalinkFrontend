import type { ApiResponse, Procedure } from "~/types";
import useApi, { type UsableAPI } from "./useApi";

export const useProcedure = () => {
  const config = useRuntimeConfig();
  const token = useCookie("token");

  const fetchProcedure = (): UsableAPI<ApiResponse<Procedure[]>> => {
    if (!token.value) throw new Error("No authentication token found");

    const query = new URLSearchParams({
      type: "MEDICAL_PROCEDURE",
    });

    const url = `${config.public.API_BASE_URL}/udc/get_all?${query.toString()}`;

    return useApi<ApiResponse<Procedure[]>>(url, {
      method: "GET",
      headers: {
        Authorization: token.value,
        "Content-Type": "application/json",
      },
    });
  };

  return { fetchProcedure };
};
