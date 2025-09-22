import { ref, type Ref } from "vue";
import { useErrorHandler } from "./useErrorHandler";

export interface UsableAPI<T> {
  response: Ref<T | undefined>;
  request: () => Promise<void>;
  error: Ref<string | null>;
  loading: Ref<boolean>;
}

export default function useApi<T>(
  url: RequestInfo,
  options?: RequestInit
): UsableAPI<T> {
  const response = ref<T>();
  const error = ref<string | null>(null);
  const loading = ref(false);
  const { withErrorHandling } = useErrorHandler();

  const request = async () => {
    const { data, error: apiError } = await withErrorHandling(
      fetch(url, options).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }),
      loading,
      { context: `API Request to ${url}` }
    );

    if (apiError) error.value = apiError;
    else response.value = data as T;
  };

  return { response, request, error, loading };
}
