import { useLogger } from "@/composables/useLogger";
import useApi from "./useApi";

export const useSupplier = () => {
  const { getToken } = useAuthToken();
  const logger = useLogger("useSupplier");

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
  ): Promise<{
    data: T | undefined;
    error: IApiErrorResponse | null;
    loading: Ref<boolean>;
  }> => {
    const loading = ref(true);

    try {
      const headers = getAuthHeaders();
      const { response, request, error } = useApi<T>(endpoint, {
        ...options,
        headers: { ...headers, ...options?.headers },
      });

      await request();

      loading.value = false;

      if (error.value) {
        logger.error(`${operationName} failed`, {
          endpoint,
          status: error.value.status?.http_code,
          message: error.value.info,
        });
        return { data: undefined, error: error.value, loading };
      }

      logger.debug(`${operationName} succeeded`, { endpoint });
      return { data: response.value, error: null, loading };
    } catch (err: unknown) {
      loading.value = false;

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

      return { data: undefined, error: fallbackError, loading };
    }
  };

  const createSupplier = (payload: ICreateSupplierRequest) =>
    executeRequest<ISupplierSystem>("createSupplier", "supplier/add", {
      method: "POST",
      body: JSON.stringify(payload),
    });

  const updateSupplier = (
    supplierId: number,
    payload: ISupplierUpdateRequest,
  ) =>
    executeRequest<ISupplierSystem>("updateSupplier", "supplier/edit", {
      method: "PUT",
      body: JSON.stringify(payload),
      query: { id: supplierId },
    });

  const getSupplierById = (supplierId: number) =>
    executeRequest<ISupplierDetail>("getSupplierById", "supplier/get", {
      method: "GET",
      query: { id: supplierId },
    });

  const getAllSuppliers = () =>
    executeRequest<ISupplierSystem[]>("getAllSuppliers", "supplier/get_all", {
      method: "GET",
    });

  const getAllMainSuppliers = (params?: ISupplierParams) =>
    executeRequest<ISupplierMain[]>(
      "getAllMainSuppliers",
      "supplier/get_all_main",
      {
        method: "GET",
        query: params,
      },
    );

  const deleteSupplier = (supplierId: number) =>
    executeRequest<{ success: boolean }>("deleteSupplier", "supplier/delete", {
      method: "DELETE",
      query: { id: supplierId },
    });

  return {
    createSupplier,
    updateSupplier,
    getSupplierById,
    getAllSuppliers,
    getAllMainSuppliers,
    deleteSupplier,
  };
};
