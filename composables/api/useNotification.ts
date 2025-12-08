import type { ApiResponse, UserNotification } from "@/types";
import useApi from "./useApi";

export const useUserNotification = () => {
  const config = useRuntimeConfig();
  const { getToken } = useAuthToken();

  const fetchUserNotifications = () => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/usernotification/get_all`;

    return useApi<ApiResponse<UserNotification[]>>(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const fetchUserNotificationById = (id: number | string) => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/usernotification/get?id=${id}`;

    return useApi<ApiResponse<UserNotification>>(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const createUserNotification = (payload: Omit<UserNotification, "id">) => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/usernotification/add`;

    return useApi<ApiResponse<UserNotification>>(url, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  };

  const markAsRead = (id: number | string) => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/usernotification/is_read?id=${id}`;

    return useApi<ApiResponse<UserNotification>>(url, {
      method: "PUT",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const deleteUserNotification = (id: number | string) => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/usernotification/delete?id=${id}`;

    return useApi<ApiResponse<void>>(url, {
      method: "DELETE",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  return {
    fetchUserNotifications,
    fetchUserNotificationById,
    createUserNotification,
    markAsRead,
    deleteUserNotification,
  };
};
