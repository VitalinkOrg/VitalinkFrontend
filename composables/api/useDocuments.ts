import { useLogger } from "@/composables/useLogger";
import useApi from "./useApi";

export function useDocuments() {
  const { getToken } = useAuthToken();
  const logger = useLogger("useDocuments");

  const getAuthHeaders = (
    includeContentType: boolean = true,
  ): Record<string, string> => {
    const token = getToken();
    if (!token) {
      logger.error("No authentication token found");
      throw new Error("No authentication token found");
    }
    const headers: Record<string, string> = {
      Authorization: token,
    };
    if (includeContentType) {
      headers["Content-Type"] = "application/json";
    }
    return headers;
  };

  const executeRequest = async <T>(
    operationName: string,
    endpoint: string,
    options: Parameters<typeof $fetch>[1],
    isFormData: boolean = false,
  ): Promise<{ data: T | undefined; error: IApiErrorResponse | null }> => {
    try {
      const headers = getAuthHeaders(!isFormData);

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

  const buildFormData = (payload: IDocumentCreationRequest): FormData => {
    const formData = new FormData();
    formData.append("file", payload.file);
    formData.append("fields", JSON.stringify(payload.fields));
    return formData;
  };

  const addDocument = (payload: IDocumentCreationRequest) => {
    const formData = buildFormData(payload);
    return executeRequest<IDocument>(
      "addDocument",
      "document/add",
      {
        method: "POST",
        body: formData,
      },
      true,
    );
  };

  const editDocument = (
    documentId: number,
    payload: IDocumentCreationRequest,
  ) => {
    const formData = buildFormData(payload);
    return executeRequest<IDocument>(
      "editDocument",
      "document/edit",
      {
        method: "PUT",
        body: formData,
        query: { id: documentId },
      },
      true,
    );
  };

  const getDocumentByCode = (code: string) =>
    executeRequest<IDocument>("getDocumentByCode", "document/get_by_code", {
      method: "GET",
      query: { code },
    });

  const getAllDocuments = () =>
    executeRequest<IDocument[]>("getAllDocuments", "document/get_all", {
      method: "GET",
    });

  const getDocumentsByFilters = (filters: IDocumentFilters) =>
    executeRequest<IDocument[]>(
      "getDocumentsByFilters",
      "document/get_by_filters",
      {
        method: "GET",
        query: { ...filters },
      },
    );

  const deleteDocument = (documentId: number) =>
    executeRequest<null>("deleteDocument", "document/delete", {
      method: "DELETE",
      query: { id: documentId },
    });

  return {
    addDocument,
    editDocument,
    getDocumentByCode,
    getAllDocuments,
    getDocumentsByFilters,
    deleteDocument,
  };
}
