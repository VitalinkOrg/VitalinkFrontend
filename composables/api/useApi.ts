import { ref, type Ref } from "vue";
import { useErrorHandler } from "./useErrorHandler";

export interface UsableAPI<T> {
  response: Ref<T | undefined>;
  request: () => Promise<void>;
  error: Ref<ApiErrorResponse | null>;
  loading: Ref<boolean>;
}

export interface ApiErrorResponse {
  httpCode: number;
  info?: string;
  message: string;
  raw?: string;
  statusId?: number;
  isDuplicateEntry?: boolean;
  isNetworkError?: boolean;
}

export default function useApi<T>(
  url: RequestInfo,
  options?: RequestInit & { params?: Record<string, any> },
): UsableAPI<T> {
  const response = ref<T>();
  const error = ref<ApiErrorResponse | null>(null);
  const loading = ref(false);
  const { parseError, logError } = useErrorHandler();

  const request = async () => {
    loading.value = true;
    error.value = null;

    try {
      const res = await fetch(url, options);

      if (!res.ok) {
        const errorData = await res.text().catch(() => null);
        throw new Error(`HTTP ${res.status}: ${errorData || res.statusText}`);
      }

      const data = await res.json();
      response.value = data as T;
      error.value = null;
    } catch (err) {
      const parsedError = parseError(err);
      logError(parsedError, `API Request to ${url}`);

      error.value = {
        httpCode: parsedError.httpCode,
        info: parsedError.info,
        message: parsedError.message,
        raw: parsedError.raw,
        statusId: parsedError.statusId,
        isDuplicateEntry: parsedError.isDuplicateEntry,
        isNetworkError: parsedError.isNetworkError,
      };

      response.value = undefined;
    } finally {
      loading.value = false;
    }
  };

  return { response, request, error, loading };
}
