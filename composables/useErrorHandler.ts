export const useErrorHandler = () => {
  const handleApiError = (
    error: any,
    options: {
      customMessage?: string;
      redirectOn401?: boolean;
      logError?: boolean;
    } = {}
  ): string => {
    const { customMessage, redirectOn401 = true, logError = true } = options;

    let errorMessage =
      customMessage ||
      "Ocurrió un error inesperado. Por favor intenta nuevamente.";

    if (error.statusCode) {
      switch (error.statusCode) {
        case 400:
          errorMessage =
            customMessage ||
            "Datos inválidos. Por favor verifica la información.";
          break;
        case 401:
          errorMessage =
            customMessage ||
            "No autorizado. Por favor inicia sesión nuevamente.";
          if (redirectOn401) {
            navigateTo("/pacientes/login");
          }
          break;
        case 403:
          errorMessage =
            customMessage || "No tienes permisos para realizar esta acción.";
          break;
        case 404:
          errorMessage = customMessage || "Recurso no encontrado.";
          break;
        case 409:
          errorMessage = customMessage || "Conflicto: el recurso ya existe.";
          break;
        case 500:
          errorMessage =
            customMessage ||
            "Error interno del servidor. Por favor intenta más tarde.";
          break;
        case 502:
          errorMessage =
            customMessage || "Error de gateway. El servidor no responde.";
          break;
        case 503:
          errorMessage =
            customMessage ||
            "Servicio no disponible. Por favor intenta más tarde.";
          break;
        default:
          errorMessage =
            customMessage ||
            `Error ${error.statusCode}: ${error.message || "Error desconocido"}`;
      }
    } else if (error.name === "FetchError" || error.name === "NetworkError") {
      errorMessage =
        customMessage ||
        "Error de conexión. Verifica tu internet e intenta nuevamente.";
    } else if (error.data?.errors) {
      const validationErrors = Object.values(error.data.errors).flat();
      errorMessage = validationErrors.join(", ") || "Error de validación";
    } else if (error.data?.message) {
      errorMessage = error.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    if (logError) {
      console.error("🔴 API Error:", {
        message: errorMessage,
        status: error.statusCode,
        error: error.data || error.message,
        timestamp: new Date().toISOString(),
      });
    }

    return errorMessage;
  };

  const withErrorHandling = async <T>(
    operation: Promise<T>,
    loadingRef?: Ref<boolean>,
    options?: Parameters<typeof handleApiError>[1]
  ): Promise<{ data: T | null; error: string | null }> => {
    try {
      if (loadingRef) loadingRef.value = true;
      const data = await operation;
      return { data, error: null };
    } catch (error: any) {
      const errorMessage = handleApiError(error, options);
      return { data: null, error: errorMessage };
    } finally {
      if (loadingRef) loadingRef.value = false;
    }
  };

  return {
    handleApiError,
    withErrorHandling,
  };
};
