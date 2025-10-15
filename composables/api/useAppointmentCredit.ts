import type { ApiResponse, AppointmentCredit, Credit } from "@/types";
import useApi, { type UsableAPI } from "./useApi";

interface AppointmentCreditPayload {
  already_been_used: number;
}

export const useAppointmentCredit = () => {
  const config = useRuntimeConfig();
  const { getToken } = useAuthToken();

  const fetchAllAppointmentCreditByQrCode = (
    appointmentQrCode: string
  ): UsableAPI<ApiResponse<AppointmentCredit[]>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/appointmentcredit/get_all?appointment_qr_code=${appointmentQrCode}`;

    return useApi<ApiResponse<AppointmentCredit[]>>(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const fetchAllAppointmentCredit = (): UsableAPI<ApiResponse<Credit[]>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/appointmentcredit/get_all`;

    return useApi<ApiResponse<Credit[]>>(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const updateAppointmentCredit = (
    body: AppointmentCreditPayload,
    appointmentId: number
  ) => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/appointmentcredit/edit?id=${appointmentId}`;

    return useApi<ApiResponse<any>>(url, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  return {
    updateAppointmentCredit,
    fetchAllAppointmentCredit,
    fetchAllAppointmentCreditByQrCode,
  };
};
