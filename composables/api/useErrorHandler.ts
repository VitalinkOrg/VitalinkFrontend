import { type Ref } from "vue";

export interface ErrorHandlerOptions {
  customMessage?: string;
  redirectOn401?: boolean;
  redirectPath?: string;
  logError?: boolean;
  context?: string;
}

export interface ApiError {
  statusCode?: number;
  name?: string;
  message?: string;
  data?: { errors?: Record<string, string[]>; message?: string };
}

export const useErrorHandler = () => {
  const handleApiError = (
    error: ApiError | any,
    options: ErrorHandlerOptions = {}
  ): string => {
    const {
      customMessage,
      redirectOn401 = true,
      redirectPath = "/pacientes/login",
      logError = true,
      context = "API",
    } = options;

    let message =
      customMessage ||
      error.data?.message ||
      error.response?.data?.message ||
      error.message ||
      "Ocurrió un error inesperado.";

    const status = error.statusCode || error.response?.status || error.status;

    if (status) {
      if (status === 401 && redirectOn401 && process.client)
        navigateTo(redirectPath);
      message = customMessage || message;
    }

    if (logError) {
      console.error(`🔴 ${context} Error:`, {
        message,
        status,
        timestamp: new Date().toISOString(),
      });
    }

    return message;
  };

  const withErrorHandling = async <T>(
    operation: Promise<T> | (() => Promise<T>),
    loadingRef?: Ref<boolean>,
    options?: ErrorHandlerOptions
  ): Promise<{ data: T | null; error: string | null }> => {
    try {
      if (loadingRef) loadingRef.value = true;
      const result =
        typeof operation === "function" ? await operation() : await operation;
      return { data: result, error: null };
    } catch (err: any) {
      return { data: null, error: handleApiError(err, options) };
    } finally {
      if (loadingRef) loadingRef.value = false;
    }
  };

  return { handleApiError, withErrorHandling };
};
