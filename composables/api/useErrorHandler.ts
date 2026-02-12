interface ErrorStatus {
  id: number;
  message: string;
  http_code: number;
}

interface ApiErrorResponse {
  status: ErrorStatus;
  data: any;
  info?: string;
}

export interface ParsedError {
  message: string;
  httpCode: number;
  info?: string;
  statusId?: number;
  raw?: string;
  isDuplicateEntry?: boolean;
  isNetworkError?: boolean;
}

export function useErrorHandler() {
  const parseError = (error: unknown): ParsedError => {
    if (error instanceof Error) {
      const errorMessage = error.message;

      const jsonMatch = errorMessage.match(/HTTP \d+: ({.*})/);

      if (jsonMatch) {
        try {
          const errorData: ApiErrorResponse = JSON.parse(jsonMatch[1]);

          const isDuplicateEntry =
            errorData.data?.message?.includes("Duplicate Entry") ||
            errorData.info?.includes("Duplicate Entry") ||
            errorMessage.includes("Duplicate Entry");

          const isDbError = errorData.info?.includes("Data Base Error");

          let friendlyMessage = errorData.status.message;
          let effectiveHttpCode = errorData.status.http_code;

          if (isDuplicateEntry) {
            friendlyMessage = "El usuario ya existe";
            effectiveHttpCode = 409;
          } else if (isDbError) {
            friendlyMessage = "Error procesando la solicitud";
          }

          return {
            message: friendlyMessage,
            httpCode: effectiveHttpCode,
            info: errorData.info,
            statusId: errorData.status.id,
            raw: errorMessage,
            isDuplicateEntry,
          };
        } catch (e) {
          console.error("Failed to parse error JSON:", e);
        }
      }

      const httpCodeMatch = errorMessage.match(/HTTP (\d+)/);

      const isNetworkError =
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("Network request failed") ||
        errorMessage.includes("NetworkError");

      return {
        message: isNetworkError
          ? "Error de conexión. Verifica tu internet."
          : errorMessage,
        httpCode: httpCodeMatch ? parseInt(httpCodeMatch[1]) : 500,
        raw: errorMessage,
        isNetworkError,
      };
    }

    return {
      message: "Error desconocido",
      httpCode: 500,
      raw: String(error),
    };
  };

  const logError = (parsedError: ParsedError, context?: string) => {
    console.error("Error Details:", {
      context,
      ...parsedError,
    });
  };

  return {
    parseError,
    logError,
  };
}
