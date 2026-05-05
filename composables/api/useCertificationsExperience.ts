import { useLogger } from "@/composables/useLogger";
import useApi from "./useApi";

export function useCertificationsExperience() {
  const { getToken } = useAuthToken();
  const logger = useLogger("useCertificationsExperience");

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

  // --- Endpoints de la Entidad ---

  const createCertificationExperience = (
    payload: ICreateCertificationExperienceRequest,
  ) =>
    executeRequest<ICertificationExperience>(
      "createCertificationExperience",
      "certificationsexperience/add",
      {
        method: "POST",
        body: payload, // Se eliminó JSON.stringify ya que $fetch de Nuxt lo maneja automáticamente
      },
    );

  const createMultipleCertificationsExperience = (
    payload: ICreateCertificationExperienceRequest[],
  ) =>
    executeRequest<ICertificationExperience[]>(
      "createMultipleCertificationsExperience",
      "certificationsexperience/add_multiple",
      {
        method: "POST",
        body: payload,
      },
    );

  const updateCertificationExperience = (
    id: number,
    payload: IUpdateCertificationExperienceRequest,
  ) =>
    executeRequest<ICertificationExperience>(
      "updateCertificationExperience",
      "certificationsexperience/edit",
      {
        method: "PUT",
        body: payload,
        query: { id },
      },
    );

  const getCertificationExperience = (
    id: number,
    authRequired: boolean = true,
  ) =>
    executeRequest<ICertificationExperience>(
      "getCertificationExperience",
      "certificationsexperience/get",
      {
        method: "GET",
        query: { id },
      },
      authRequired,
    );

  const getAllCertificationExperiences = (
    params?: IGetAllCertificationExperienceParams,
    authRequired: boolean = true,
  ) =>
    executeRequest<ICertificationExperience[]>(
      "getAllCertificationExperiences",
      "certificationsexperience/get_all",
      {
        method: "GET",
        query: params,
      },
      authRequired,
    );

  const deleteCertificationExperience = (id: number) =>
    executeRequest<null>(
      "deleteCertificationExperience",
      "certificationsexperience/delete",
      {
        method: "DELETE",
        query: { id },
      },
    );

  return {
    createCertificationExperience,
    createMultipleCertificationsExperience,
    updateCertificationExperience,
    getCertificationExperience,
    getAllCertificationExperiences,
    deleteCertificationExperience,
  };
}
