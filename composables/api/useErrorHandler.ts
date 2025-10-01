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
}

export function useErrorHandler() {
  const parseError = (error: unknown): ParsedError => {
    if (error instanceof Error) {
      const errorMessage = error.message;

      const jsonMatch = errorMessage.match(/HTTP \d+: ({.*})/);

      if (jsonMatch) {
        try {
          const errorData: ApiErrorResponse = JSON.parse(jsonMatch[1]);

          return {
            message: errorData.status.message,
            httpCode: errorData.status.http_code,
            info: errorData.info,
            statusId: errorData.status.id,
            raw: errorMessage,
          };
        } catch (e) {
          console.error("Failed to parse error JSON:", e);
        }
      }

      const httpCodeMatch = errorMessage.match(/HTTP (\d+)/);
      return {
        message: errorMessage,
        httpCode: httpCodeMatch ? parseInt(httpCodeMatch[1]) : 500,
        raw: errorMessage,
      };
    }

    return {
      message: "An unknown error occurred",
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
