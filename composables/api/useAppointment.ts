import { useLogger } from "@/composables/useLogger";
import useApi from "./useApi";

export const useAppointment = () => {
  const { getToken } = useAuthToken();
  const logger = useLogger("useAppointment");

  const getAuthHeaders = (): Record<string, string> => {
    const token = getToken();
    if (!token) {
      logger.error("No authentication token found");
      throw new Error("No authentication token found");
    }
    return {
      Authorization: token,
      "Content-Type": "application/json",
    };
  };

  const executeRequest = async <T>(
    operationName: string,
    endpoint: string,
    options: Parameters<typeof $fetch>[1],
  ): Promise<{ data: T | undefined; error: IApiErrorResponse | null }> => {
    try {
      const headers = getAuthHeaders();
      const { response, request, error } = useApi<T>(endpoint, {
        ...options,
        headers: { ...headers, ...options?.headers },
      });

      await request();

      if (error.value) {
        logger.error(`${operationName} failed`, {
          endpoint,
          status: error.value.status?.http_code,
          message: error.value.info,
        });
        return { data: undefined, error: error.value };
      }

      logger.debug(`${operationName} succeeded`, { endpoint });
      return { data: response.value, error: null };
    } catch (err: unknown) {
      const fallbackError: IApiErrorResponse = {
        status: { id: 0, message: "Error inesperado", http_code: 500 },
        info:
          err instanceof Error
            ? err.message
            : "Ocurrió un error inesperado antes de realizar la solicitud",
        data: null,
      };

      logger.error(`${operationName} threw unexpectedly`, {
        endpoint,
        error: fallbackError.info,
      });

      return { data: undefined, error: fallbackError };
    }
  };

  const createAppointment = (payload: ICreateAppointmentRequest) =>
    executeRequest<IAppointment>("createAppointment", "appointment/add", {
      method: "POST",
      body: JSON.stringify(payload),
    });

  const updateAppointment = (
    appointmentId: number,
    payload: IAppointmentUpdateRequest,
  ) =>
    executeRequest<IAppointment>("updateAppointment", "appointment/edit", {
      method: "PUT",
      body: JSON.stringify(payload),
      query: { id: appointmentId },
    });

  const getAppointmentById = (appointmentId: number) =>
    executeRequest<IAppointment>("getAppointmentById", "appointment/get", {
      method: "GET",
      query: { id: appointmentId },
    });

  const getAllAppointments = () =>
    executeRequest<IAppointment[]>(
      "getAllAppointments",
      "appointment/get_all",
      {
        method: "GET",
      },
    );

  const deleteAppointment = (appointmentId: number) =>
    executeRequest<null>("deleteAppointment", "appointment/delete", {
      method: "DELETE",
      query: { id: appointmentId },
    });

  const confirmValorationAppointment = (appointmentId: number) =>
    executeRequest<IAppointment>(
      "confirmValorationAppointment",
      "appointment/confirm_valoration_appointment",
      {
        method: "PUT",
        query: { id: appointmentId },
      },
    );

  const successPaymentValorationAppointment = (
    appointmentId: number,
    paymentMethodCode: string,
  ) =>
    executeRequest<IAppointment>(
      "successPaymentValorationAppointment",
      "appointment/success_payment_valoration_appointment",
      {
        method: "PUT",
        body: JSON.stringify({ payment_method_code: paymentMethodCode }),
        query: { id: appointmentId },
      },
    );

  const uploadProforma = (
    appointmentId: number,
    payload: IUploadProformaRequest,
  ) =>
    executeRequest<IAppointment>(
      "uploadProforma",
      "appointment/upload_proforma",
      {
        method: "PUT",
        body: JSON.stringify(payload),
        query: { id: appointmentId },
      },
    );

  const reserveProcedure = (appointmentId: number) =>
    executeRequest<IAppointment>(
      "reserveProcedure",
      "appointment/reserve_procedure",
      {
        method: "PUT",
        query: { id: appointmentId },
      },
    );

  const confirmProcedure = (appointmentId: number) =>
    executeRequest<IAppointment>(
      "confirmProcedure",
      "appointment/confirm_procedure",
      {
        method: "PUT",
        query: { id: appointmentId },
      },
    );

  const successPaymentProcedure = (
    appointmentId: number,
    paymentMethodCode: string,
  ) =>
    executeRequest<IAppointment>(
      "successPaymentProcedure",
      "appointment/success_payment_procedure",
      {
        method: "PUT",
        body: JSON.stringify({ payment_method_code: paymentMethodCode }),
        query: { id: appointmentId },
      },
    );

  const setProcedureRealized = (appointmentId: number) =>
    executeRequest<IAppointment>(
      "setProcedureRealized",
      "appointment/set_procedure_realized",
      {
        method: "PUT",
        query: { id: appointmentId },
      },
    );

  return {
    createAppointment,
    updateAppointment,
    getAppointmentById,
    getAllAppointments,
    deleteAppointment,
    confirmValorationAppointment,
    successPaymentValorationAppointment,
    uploadProforma,
    reserveProcedure,
    confirmProcedure,
    successPaymentProcedure,
    setProcedureRealized,
  };
};
