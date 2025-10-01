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

  const logout = () => {
    clearTokens();
    clearAuthState();
    clearUserInfo();
  };

  return { register, login, logout, fetchUserInfo, fetchHospitalInfo };
};
