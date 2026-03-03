import { useLogger } from "@/composables/useLogger";
import useApi from "./useApi";

export const useSpecialtyBySupplier = () => {
  const { getToken } = useAuthToken();
  const logger = useLogger("useSpecialtyBySupplier");

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

  const createSpecialtyBySupplier = (
    payload: ICreateSpecialtyBySupplierRequest,
  ) =>
    executeRequest<ISpecialtyBySupplier>(
      "createSpecialtyBySupplier",
      "/specialtybysupplier/add",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

  const createMultipleSpecialtiesBySupplier = (
    payload: ICreateSpecialtyBySupplierRequest[],
  ) =>
    executeRequest<ISpecialtyBySupplier[]>(
      "createMultipleSpecialtiesBySupplier",
      "specialtybysupplier/add_multiple",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

  const updateSpecialtyBySupplier = (
    specialtyBySupplierId: number,
    payload: ISpecialtyBySupplierUpdateRequest,
  ) =>
    executeRequest<ISpecialtyBySupplier>(
      "updateSpecialtyBySupplier",
      "specialtybysupplier/edit",
      {
        method: "PUT",
        body: JSON.stringify(payload),
        query: { id: specialtyBySupplierId },
      },
    );

  const getSpecialtyBySupplierById = (specialtyBySupplierId: number) =>
    executeRequest<ISpecialtyBySupplier>(
      "getSpecialtyBySupplierById",
      "specialtybysupplier/get",
      {
        method: "POST",
        query: { id: specialtyBySupplierId },
      },
    );

  const getAllSpecialtyBySupplier = () =>
    executeRequest<ISpecialtyBySupplier[]>(
      "getAllSpecialtyBySupplier",
      "specialtybysupplier/get_all",
      {
        method: "POST",
      },
    );

  const deleteSpecialtyBySupplier = (specialtyBySupplierId: number) =>
    executeRequest<null>(
      "deleteSpecialtyBySupplier",
      "specialtybysupplier/delete",
      {
        method: "DELETE",
        query: { id: specialtyBySupplierId },
      },
    );

  return {
    createSpecialtyBySupplier,
    createMultipleSpecialtiesBySupplier,
    getSpecialtyBySupplierById,
    getAllSpecialtyBySupplier,
    updateSpecialtyBySupplier,
    deleteSpecialtyBySupplier,
  };
};
