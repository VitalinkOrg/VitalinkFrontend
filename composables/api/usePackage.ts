import { useLogger } from "@/composables/useLogger";
import useApi from "./useApi";

export const usePackage = () => {
  const { getToken } = useAuthToken();
  const logger = useLogger("usePackage");

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

  const createPackage = (payload: IPackageCreationRequest) =>
    executeRequest<IPackage>("createPackage", "package/add", {
      method: "POST",
      body: JSON.stringify(payload),
    });

  const updatePackage = (packageId: number, payload: IPackageUpdateRequest) =>
    executeRequest<IPackage>("updatePackage", "package/edit", {
      method: "PUT",
      body: JSON.stringify(payload),
      query: { id: packageId },
    });

  const getAllPackages = (supplierId?: number) =>
    executeRequest<IPackage[]>("getAllPackages", "package/get_all", {
      method: "GET",
      query: { supplier_id: supplierId },
    });

  const getPackageById = (packageId: number) =>
    executeRequest<IPackage>("getPackageById", "package/", {
      method: "GET",
      query: { id: packageId },
    });

  const deletePackage = (packageId: number) =>
    executeRequest<null>("deletePackage", "package/delete", {
      method: "DELETE",
      query: { id: packageId },
    });

  return {
    createPackage,
    updatePackage,
    getAllPackages,
    getPackageById,
    deletePackage,
  };
};
