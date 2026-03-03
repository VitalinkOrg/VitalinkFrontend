import { useLogger } from "@/composables/useLogger";
import useApi from "./useApi";

interface AppointmentCreditPayload {
  appointment?: number;
  already_been_used?: number;
  credit_status?: string;
}

export const useAppointmentCredit = () => {
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

  const getAllAppointmentCreditByQrCode = (appointmentQrCode: string) =>
    executeRequest<IAppointmentCredit[]>(
      "getAllAppointmentCreditByQrCode",
      "appointmentcredit/get_all",
      {
        method: "GET",
        query: { appointment_qr_code: appointmentQrCode },
      },
    );

  const getAllAppointmentCredit = () =>
    executeRequest<IAppointmentCredit[]>(
      "getAllAppointmentCredit",
      "appointmentcredit/get_all",
      {
        method: "GET",
      },
    );

  const updateAppointmentCredit = (
    payload: IAppointmentCreditUpdateRequest,
    appointmentId: number,
  ) =>
    executeRequest<IAppointmentCredit>(
      "updateAppointmentCredit",
      "appointmentcredit/edit",
      {
        method: "PUT",
        body: JSON.stringify(payload),
        query: { id: appointmentId },
      },
    );

  return {
    updateAppointmentCredit,
    getAllAppointmentCredit,
    getAllAppointmentCreditByQrCode,
  };
};
