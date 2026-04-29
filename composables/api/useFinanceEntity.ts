import { useLogger } from "@/composables/useLogger";
import useApi from "./useApi";

export function useFinanceEntity() {
  const { getToken } = useAuthToken();
  const logger = useLogger("useFinanceEntity");

  const getAuthHeaders = (
    authRequired: boolean = true,
  ): Record<string, string> => {
    const token = getToken();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (token && authRequired) {
      headers.Authorization = token;
    }

    return headers;
  };

  const executeRequest = async <T>(
    operationName: string,
    endpoint: string,
    options: Parameters<typeof $fetch>[1],
    authRequired: boolean = true,
  ): Promise<{ data: T | undefined; error: IApiErrorResponse | null }> => {
    try {
      const headers = getAuthHeaders(authRequired);
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

  const getAllFinanceEntities = () =>
    executeRequest<IUdc[]>("getAllFinanceEntities", "financeentity/get_all", {
      method: "GET",
    });

  return { getAllFinanceEntities };
}
