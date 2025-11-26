import type { ApiResponse } from "@/types";
import useApi, { type UsableAPI } from "./useApi";

export interface DocumentUploadFields {
  title: string;
  type: string;
  description?: string;
  id_for_table: string;
  table: string;
  action_type: string;
  user_id: string;
  is_public: number;
}

export interface DocumentResponse {
  id: number;
  name: string;
  code: string;
  file_name: string;
  type: string;
  extension: string;
  description: string;
  url: string;
  id_for_table: number;
  table: string;
  user_id: string;
  is_public: number;
  action_type?: string;
  created_date: string;
}

export interface DocumentFilters {
  table?: string;
  id_for_table?: string;
  action_type?: string;
  user_id?: string;
}

export function useDocuments() {
  const config = useRuntimeConfig();
  const { getToken } = useAuthToken();

  const uploadDocument = (
    file: File,
    fields: DocumentUploadFields
  ): UsableAPI<ApiResponse<DocumentResponse>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fields", JSON.stringify(fields));

    const url = `${config.public.API_BASE_URL}/document/add`;

    return useApi<ApiResponse<DocumentResponse>>(url, {
      method: "POST",
      headers: {
        Authorization: token,
      },
      body: formData,
    });
  };

  const updateDocument = (
    id: number,
    file: File,
    fields: DocumentUploadFields
  ): UsableAPI<ApiResponse<DocumentResponse>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fields", JSON.stringify(fields));

    const url = `${config.public.API_BASE_URL}/document/edit?id=${id}`;

    return useApi<ApiResponse<DocumentResponse>>(url, {
      method: "PUT",
      headers: {
        Authorization: token,
      },
      body: formData,
    });
  };

  const getDocumentsByFilters = (
    filters: DocumentFilters
  ): UsableAPI<ApiResponse<DocumentResponse[]>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const url = `${config.public.API_BASE_URL}/document/get_by_filters?${queryParams.toString()}`;

    return useApi<ApiResponse<DocumentResponse[]>>(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
  };

  const deleteDocument = (
    id: number
  ): UsableAPI<ApiResponse<DocumentResponse>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/document/delete?id=${id}`;

    return useApi<ApiResponse<DocumentResponse>>(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });
  };

  return {
    uploadDocument,
    updateDocument,
    getDocumentsByFilters,
    deleteDocument,
  };
}
