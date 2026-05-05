import { useLogger } from "@/composables/useLogger";
import useApi from "./useApi";

export function useLanguageSupplier() {
  const { getToken } = useAuthToken();
  const logger = useLogger("useLanguageSupplier");

  const getAuthHeaders = (
    authRequired: boolean = true,
  ): Record<string, string> => {
    const token = getToken();

    if (!token && authRequired) {
      logger.error("No authentication token found");
      throw new Error("No authentication token found");
    }

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

  const createLanguageSupplier = (payload: ILanguageSupplierRequest) =>
    executeRequest<ILanguageSupplier>(
      "createLanguageSupplier",
      "languagesupplier/add",
      {
        method: "POST",
        body: payload,
      },
    );

  const updateLanguageSupplier = (
    id: number,
    payload: ILanguageSupplierRequest,
  ) =>
    executeRequest<ILanguageSupplier>(
      "updateLanguageSupplier",
      "languagesupplier/edit",
      {
        method: "PUT",
        body: payload,
        query: { id },
      },
    );

  const getLanguageSupplier = (id: number, authRequired: boolean = true) =>
    executeRequest<ILanguageSupplier>(
      "getLanguageSupplier",
      "languagesupplier/get",
      {
        method: "GET",
        query: { id },
      },
      authRequired,
    );

  const getAllLanguageSuppliers = (authRequired: boolean = true) =>
    executeRequest<ILanguageSupplier[]>(
      "getAllLanguageSuppliers",
      "languagesupplier/get_all",
      { method: "GET" },
      authRequired,
    );

  const deleteLanguageSupplier = (id: number) =>
    executeRequest<null>("deleteLanguageSupplier", "languagesupplier/delete", {
      method: "DELETE",
      query: { id },
    });

  return {
    createLanguageSupplier,
    updateLanguageSupplier,
    getLanguageSupplier,
    getAllLanguageSuppliers,
    deleteLanguageSupplier,
  };
}
