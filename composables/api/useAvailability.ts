import { useLogger } from "@/composables/useLogger";
import useApi from "./useApi";

export const useAvailability = () => {
  const { getToken } = useAuthToken();
  const logger = useLogger("useAvailability");

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

  const createAvailability = (payload: IAvailabilityCreationRequest) =>
    executeRequest<IAvailability>("createAvailability", "/availability/add", {
      method: "POST",
      body: payload,
    });

  const updateAvailability = (
    availabilityId: number,
    payload: IAvailabilityUpdateRequest,
  ) =>
    executeRequest<IAvailability>("updateAvailability", "/availability/edit", {
      method: "PUT",
      body: payload,
      query: { id: availabilityId },
    });

  const getAllAvailabilities = () =>
    executeRequest<IAvailability[]>(
      "getAllAvailabilities",
      "/availability/get_all",
      {
        method: "GET",
      },
    );

  const getAvailabilitiesBySupplier = (supplierId: number) =>
    executeRequest<IAvailability[]>(
      "getAvailabilitiesBySupplier",
      "/availability/get_all",
      {
        method: "GET",
        query: { supplier_id: supplierId },
      },
    );

  const getAvailabilityById = (availabilityId: number) =>
    executeRequest<IAvailability>("getAvailabilityById", "/availability/", {
      method: "GET",
      query: { id: availabilityId },
    });

  const deleteAvailability = (availabilityId: number) =>
    executeRequest<null>("deleteAvailability", "/availability/delete", {
      method: "DELETE",
      query: { id: availabilityId },
    });

  return {
    createAvailability,
    updateAvailability,
    getAvailabilitiesBySupplier,
    getAllAvailabilities,
    getAvailabilityById,
    deleteAvailability,
  };
};
