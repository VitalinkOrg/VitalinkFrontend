import { useLogger } from "@/composables/useLogger";
import useApi from "./useApi";

export const useLocation = () => {
  const { getToken } = useAuthToken();
  const logger = useLogger("useLocation");

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

  const createLocation = (payload: ILocationCreationRequest) =>
    executeRequest<ILocation>("createLocation", "location/add", {
      method: "POST",
      body: JSON.stringify(payload),
    });

  const updateLocation = (
    locationId: number,
    payload: ILocationUpdateRequest,
  ) =>
    executeRequest<ILocation>("updateLocation", "location/edit", {
      method: "PUT",
      body: JSON.stringify(payload),
      query: { id: locationId },
    });

  const getAllLocations = () =>
    executeRequest<ILocation[]>("getAllLocations", "location/get_all", {
      method: "GET",
    });

  const getLocationById = (locationId: number) =>
    executeRequest<ILocation>("getLocationById", "location/", {
      method: "GET",
      query: { id: locationId },
    });

  const deleteLocation = (locationId: number) =>
    executeRequest<null>("deleteLocation", "location/delete", {
      method: "DELETE",
      query: { id: locationId },
    });

  return {
    createLocation,
    updateLocation,
    getAllLocations,
    getLocationById,
    deleteLocation,
  };
};
