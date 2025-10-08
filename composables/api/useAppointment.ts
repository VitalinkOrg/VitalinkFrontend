import type { ApiResponse, Appointment } from "@/types";
import useApi from "./useApi";

interface AppointmentPayload {
  customer_id?: string;
  proforma_file_code?: string;
  appointment_date?: string;
  appointment_hour?: string;
  reservation_type?: string;
  appointment_status_code?: string;
  supplier_id?: number;
  package_id?: number;
  procedure_id?: number;
  application_date?: string;
  payment_status_code?: string;
  payment_method_code?: string;
  appointment_result_code?: string;
  user_description?: string;
  recommendation_post_appointment?: string;
  diagnostic?: string;
  is_for_external_user?: boolean;
  phone_number_external_user?: string;
}

interface UploadProforma {
  appointment_result_code?: string;
  proforma_file_code?: string;
}

interface GetDocumentResponse {
  id: number;
  name: string;
  code: string;
  file_name: string;
  type: string;
  extension: string;
  description: string;
  url: string;
  id_for_table: number;
  table: string;
  user_id: string;
  is_public: number;
  created_date: string;
}

interface CreateAppointment {
  customer_id: string;
  appointment_date: string;
  appointment_hour: string;
  supplier_id: number;
  package_id?: number;
  user_description: string;
  is_for_external_user: boolean;
  phone_number_external_user: string;
  procedure_id?: number;
}

export const useAppointment = () => {
  const config = useRuntimeConfig();
  const { getToken } = useAuthToken();

  const fetchAllAppointments = () => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/appointment/get_all`;

    return useApi<ApiResponse<Appointment[]>>(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const createAppointment = (body: CreateAppointment) => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/appointment/add`;

    return useApi<ApiResponse<any>>(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const confirmProcedure = (appointmentId: number) => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/appointment/confirm_procedure?id=${appointmentId}`;

    return useApi<ApiResponse<any>>(url, {
      method: "PUT",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const setProcedureRealized = (appointmentId: number) => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/appointment/set_procedure_realized?id=${appointmentId}`;

    return useApi<ApiResponse<any>>(url, {
      method: "PUT",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const confirmValorationAppointment = (appointmentId: number) => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/appointment/confirm_valoration_appointment?id=${appointmentId}`;

    return useApi<ApiResponse<any>>(url, {
      method: "PUT",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const updateAppointment = (
    body: AppointmentPayload,
    appointmentId: number
  ) => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/appointment/edit?id=${appointmentId}`;

    return useApi<ApiResponse<any>>(url, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const uploadProforma = (body: UploadProforma, appointmentId: number) => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/appointment/upload_proforma?id=${appointmentId}`;

    return useApi<ApiResponse<any>>(url, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const fetchDocumentByCode = (proformaFileCode: string) => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/document/get_by_code?code=${proformaFileCode}`;

    return useApi<ApiResponse<GetDocumentResponse>>(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  return {
    updateAppointment,
    uploadProforma,
    confirmProcedure,
    setProcedureRealized,
    confirmValorationAppointment,
    fetchDocumentByCode,
    fetchAllAppointments,
    createAppointment,
  };
};
