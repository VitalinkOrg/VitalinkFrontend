import type { ApiResponse, InsuranceRegisterData } from "~/types";
import useApi, { type UsableAPI } from "./useApi";

export const useInsuranceAuth = () => {
  const config = useRuntimeConfig();
  const token = useCookie("token");

  const registerInsurance = (
    body: InsuranceRegisterData
  ): UsableAPI<ApiResponse<any>> => {
    if (!token.value) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/users/register_insurance`;

    return useApi<ApiResponse<any>>(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const loginInsurance = (
    body: InsuranceRegisterData
  ): UsableAPI<ApiResponse<any>> => {
    if (!token.value) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/users/login_insurance`;
    return useApi<ApiResponse<any>>(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  return { registerInsurance };
};
