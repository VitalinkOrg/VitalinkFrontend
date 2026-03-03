import { translateError } from "@/utils/errorTranslations";

/**
 * Generic composable for API requests with translated error handling.
 *
 * Wraps Nuxt's $fetch with reactive state for loading, response, and error.
 * Backend error messages are automatically translated to Spanish.
 */
const useApi = <T>(
  endpoint: string,
  options?: Parameters<typeof $fetch>[1],
): IUsableAPI<T> => {
  const config = useRuntimeConfig();

  const response = ref<T>() as Ref<T | undefined>;
  const error = ref<IApiErrorResponse | null>(null);
  const loading = ref(false);

  const request = async (): Promise<void> => {
    loading.value = true;
    error.value = null;
    response.value = undefined;

    try {
      const result = await $fetch<IApiResponse<T>>(endpoint, {
        baseURL: `${config.public.API_BASE_URL}/`,
        ...options,
      });

      response.value = result.data;
    } catch (err: unknown) {
      error.value = normalizeApiError(err);
    } finally {
      loading.value = false;
    }
  };

  return { response, request, error, loading };
};

/**
 * Normalizes any caught error into the IApiErrorResponse structure,
 * translating messages to Spanish.
 */
function normalizeApiError(err: unknown): IApiErrorResponse {
  const fetchError = err as {
    response?: { _data?: IApiErrorResponse; status?: number };
    message?: string;
  };

  const data = fetchError?.response?._data;

  if (data?.status && data?.info) {
    return {
      ...data,
      status: {
        ...data.status,
        message: translateError(data.status.message),
      },
      info: translateError(data.info),
    };
  }

  return {
    status: {
      id: 0,
      message: translateError("Unknown Error"),
      http_code: fetchError?.response?.status ?? 500,
    },
    info: translateError(fetchError?.message ?? "An unexpected error occurred"),
    data: null,
  };
}

export default useApi;
