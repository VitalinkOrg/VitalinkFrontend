import { useLogger } from "@/composables/useLogger";
import useApi from "./useApi";

interface PaymentInitiationPayload {
  appointment_id: number;
  payment_method_code: string;
  amount: number;
}

interface PaymentConfirmationPayload {
  payment_method_code: string;
  transaction_reference: string;
}

interface PaymentRecord {
  id: number;
  appointment_id: number;
  amount: string;
  payment_method: string;
  transaction_reference: string;
  status: string;
  created_date: string;
  updated_date: string;
}

export const usePayment = () => {
  const { getToken } = useAuthToken();
  const logger = useLogger("usePayment");

  const getAuthHeaders = (): Record<string, string> => {
    const token = getToken();
    if (!token) {
      logger.error("Token de autenticación no encontrado");
      throw new Error("No se encontró el token de autenticación");
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
        logger.error(`${operationName} falló`, {
          endpoint,
          status: error.value.status?.http_code,
          message: error.value.info,
        });
        return { data: undefined, error: error.value };
      }

      logger.debug(`${operationName} completado`, { endpoint });
      return { data: response.value, error: null };
    } catch (err: unknown) {
      const fallbackError: IApiErrorResponse = {
        status: { id: 0, message: "Error inesperado", http_code: 500 },
        info:
          err instanceof Error
            ? err.message
            : "Ocurrió un error inesperado al procesar el pago",
        data: null,
      };

      logger.error(`${operationName} lanzó un error inesperado`, {
        endpoint,
        error: fallbackError.info,
      });

      return { data: undefined, error: fallbackError };
    }
  };

  const confirmValorationPayment = (
    appointmentId: number,
    payload: PaymentConfirmationPayload,
  ) =>
    executeRequest<IAppointment>(
      "confirmValorationPayment",
      "appointment/success_payment",
      {
        method: "PUT",
        body: JSON.stringify(payload),
        query: { id: appointmentId },
      },
    );

  const confirmProcedurePayment = (
    appointmentId: number,
    payload: PaymentConfirmationPayload,
  ) =>
    executeRequest<IAppointment>(
      "confirmProcedurePayment",
      "appointment/success_payment_procedure",
      {
        method: "PUT",
        body: JSON.stringify(payload),
        query: { id: appointmentId },
      },
    );

  const getPaymentsByAppointment = (appointmentId: number) =>
    executeRequest<PaymentRecord[]>(
      "getPaymentsByAppointment",
      "payment/by_appointment",
      {
        method: "GET",
        query: { appointment_id: appointmentId },
      },
    );

  return {
    confirmValorationPayment,
    confirmProcedurePayment,
    getPaymentsByAppointment,
  };
};
