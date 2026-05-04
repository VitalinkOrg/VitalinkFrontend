import { useLogger } from "@/composables/useLogger";
import useApi from "./useApi";

export const useAuth = () => {
  const { getToken, clearTokens } = useAuthToken();
  const { clearAuthState } = useAuthState();
  const { clearUserInfo } = useUserInfo();
  const logger = useLogger("useAuth");

  const getAuthHeaders = (): Record<string, string> => {
    const token = getToken();
    if (!token) {
      logger.error("No authentication token found");
      throw new Error("No authentication token found");
    }
    return { Authorization: token };
  };

  const executeRequest = async <T>(
    operationName: string,
    endpoint: string,
    options: Parameters<typeof $fetch>[1],
  ): Promise<{
    data: T | undefined;
    error: IApiErrorResponse | null;
  }> => {
    try {
      const { response, request, error } = useApi<T>(endpoint, options);

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

  // ─── Public endpoints (no auth required) ───

  const register = (payload: IRegisterRequest) =>
    executeRequest<ILoginResponse>("register", "auth/register", {
      method: "POST",
      body: payload,
    });

  const login = (payload: ILoginRequest) =>
    executeRequest<ILoginResponse>("login", "auth/login", {
      method: "POST",
      body: payload,
    });

  const forgotPassword = (payload: IForgotPassword) =>
    executeRequest<IForgotPasswordResponse>(
      "forgotPassword",
      "forgot_password",
      {
        method: "POST",
        body: payload,
      },
    );

  const verifyForgotPasswordToken = (token: string) =>
    executeRequest<IVerifyTokenResponse>(
      "verifyForgotPasswordToken",
      `verify_forgot_password/${token}`,
      {
        method: "GET",
      },
    );

  const resetPassword = (token: string, payload: IResetPassword) =>
    executeRequest<IResetPasswordResponse>(
      "resetPassword",
      `reset_password/${token}`,
      {
        method: "POST",
        body: payload,
      },
    );

  const confirmationRegister = (token: string) =>
    executeRequest("confirmationRegister", `confirmation_register/${token}`, {
      method: "GET",
    });

  // ─── Authenticated endpoints ───

  const getUserById = (userId: string, token?: string) => {
    const headers = token ? { Authorization: token } : getAuthHeaders();

    return executeRequest<IUser>("getUserById", "user/get", {
      method: "GET",
      headers,
      query: { id: userId },
    });
  };

  const updateUser = (userId: string, payload: IUserUpdateRequest) =>
    executeRequest<IUser>("updateUser", "user/edit", {
      method: "PUT",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      query: { id: userId },
      body: JSON.stringify(payload),
    });

  const deleteUser = (userId: string) =>
    executeRequest<void>("deleteUser", "user/delete", {
      method: "DELETE",
      headers: getAuthHeaders(),
      query: { id: userId },
    });

  const logout = async () => {
    try {
      const headers = getAuthHeaders();

      await executeRequest<null>("logout", "auth/logout", {
        method: "POST",
        headers: headers,
      });
    } catch (error) {
      logger.error("Cierre de sesión local o el token ya no existía.");
    } finally {
      console.log("Finally: Limpiando estado local");
      clearTokens();
      clearAuthState();
      clearUserInfo();
    }
  };

  return {
    register,
    login,
    getUserById,
    updateUser,
    deleteUser,
    forgotPassword,
    verifyForgotPasswordToken,
    resetPassword,
    logout,
    confirmationRegister,
  };
};
