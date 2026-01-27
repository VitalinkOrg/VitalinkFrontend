import type { ApiResponse, UserInformation } from "@/types";
import useApi, { type UsableAPI } from "./useApi";

export interface IRegister {
  card_id: string;
  name: string;
  email: string;
  password: string;
  gender: string; // "M,"F","O"
  role_code: string;
  phone_number: string;
  country_iso_code: string;
  province: string;
  profile_picture_url: string;
  code_contract: string;
}

export interface ILogin {
  email: string;
  username: string;
  password: string;
}

export interface ILoginResponse {
  access_token: string;
  refresh_token: string;
  screens_access: any[];
}

export interface IForgotPassword {
  email: string;
}

export interface IResetPassword {
  password: string;
}

export interface IForgotPasswordResponse {
  message: string;
  token?: string;
}

export interface IVerifyTokenResponse {
  valid: boolean;
  message: string;
}

export interface IResetPasswordResponse {
  message: string;
  success: boolean;
}

export const useAuth = () => {
  const config = useRuntimeConfig();
  const { getToken, clearTokens } = useAuthToken();
  const { clearAuthState } = useAuthState();
  const { clearUserInfo } = useUserInfo();

  const register = (body: IRegister) => {
    const url = `${config.public.API_BASE_URL}/auth/register`;

    return useApi<ApiResponse<any>>(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const login = (body: ILogin): UsableAPI<ApiResponse<ILoginResponse>> => {
    const url = `${config.public.API_BASE_URL}/auth/login`;

    return useApi<ApiResponse<ILoginResponse>>(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const fetchUserInfo = (
    userId: string,
    token?: string
  ): UsableAPI<ApiResponse<UserInformation>> => {
    const authToken = token || getToken();
    if (!authToken) {
      throw new Error("No authentication token found");
    }

    const url = `${config.public.API_BASE_URL}/user/get?id=${userId}`;

    return useApi<ApiResponse<UserInformation>>(url, {
      method: "GET",
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
    });
  };

  const fetchHospitalInfo = (token?: string): UsableAPI<ApiResponse<any>> => {
    const authToken = token || getToken();
    if (!authToken) {
      throw new Error("No authentication token found");
    }

    const url = `${config.public.API_BASE_URL}/hospitals/get_hospital_info`;

    return useApi<ApiResponse<any>>(url, {
      method: "GET",
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
    });
  };

  const deleteUser = (userId: string): UsableAPI<ApiResponse<void>> => {
    const token = getToken();
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${config.public.API_BASE_URL}/user/delete?id=${userId}`;

    return useApi<ApiResponse<void>>(url, {
      method: "DELETE",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const forgotPassword = (
    body: IForgotPassword
  ): UsableAPI<ApiResponse<IForgotPasswordResponse>> => {
    const url = `${config.public.API_BASE_URL}/forgot_password`;

    return useApi<ApiResponse<IForgotPasswordResponse>>(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const verifyForgotPasswordToken = (
    token: string
  ): UsableAPI<ApiResponse<IVerifyTokenResponse>> => {
    const url = `${config.public.API_BASE_URL}/verify_forgot_password/${token}`;

    return useApi<ApiResponse<IVerifyTokenResponse>>(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const resetPassword = (
    token: string,
    body: IResetPassword
  ): UsableAPI<ApiResponse<IResetPasswordResponse>> => {
    const url = `${config.public.API_BASE_URL}/reset_password/${token}`;

    return useApi<ApiResponse<IResetPasswordResponse>>(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        "Content-Type": "application/json",
      },
    });
  };

  const logout = () => {
    clearTokens();
    clearAuthState();
    clearUserInfo();
  };

  return {
    register,
    login,
    logout,
    fetchUserInfo,
    fetchHospitalInfo,
    deleteUser,
    forgotPassword,
    verifyForgotPasswordToken,
    resetPassword,
  };
};
