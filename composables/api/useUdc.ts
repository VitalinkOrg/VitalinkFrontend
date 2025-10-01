import type { ApiResponse, IUdc } from "@/types";
import useApi, { type UsableAPI } from "./useApi";

type UdcType =
  | "MEDICAL_SPECIALTY"
  | "MEDICAL_PRODUCT"
  | "MEDICAL_PROCEDURE"
  | "ID_TYPE"
  | "MEDICAL_TYPE"
  | "REVIEW"
  | "ASSESSMENT_DETAIL"
  | "ASSESSMENT";

export function useUdc() {
  const config = useRuntimeConfig();
  const token = useCookie("token");

  const fetchUdc = (
    type: UdcType,
    params?: Record<string, string>,
    options?: { authRequired?: boolean }
  ): UsableAPI<ApiResponse<IUdc[]>> => {
    const { authRequired = true } = options || {};

    if (authRequired && !token.value) {
      throw new Error("No authentication token found");
    }

    const query = new URLSearchParams({
      type,
      ...params,
    });

    const url = `${config.public.API_BASE_URL}/udc/get_all?${query.toString()}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (authRequired && token.value) {
      headers.Authorization = token.value;
    }

    return useApi<ApiResponse<IUdc[]>>(url, {
      method: "GET",
      headers,
    });
  };

  return { fetchUdc };
}
