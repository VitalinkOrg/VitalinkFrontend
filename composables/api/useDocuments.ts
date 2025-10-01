import type { ApiResponse } from "~/types";
import useApi, { type UsableAPI } from "./useApi";

export interface DocumentUploadFields {
  title: string;
  type: string;
  description?: string;
  id_for_table: number;
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
  created_date: string;
}

export function useDocuments() {
  const config = useRuntimeConfig();
  const token = useCookie<string>("token");

  const uploadDocument = (
    file: File,
    fields: DocumentUploadFields
  ): UsableAPI<ApiResponse<DocumentResponse>> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("fields", JSON.stringify(fields));

    const url = `${config.public.API_BASE_URL}/document/add`;

    return useApi<ApiResponse<DocumentResponse>>(url, {
      method: "POST",
      body: formData,
    });
  };

  const deleteDocument = (
    id: number
  ): UsableAPI<ApiResponse<DocumentResponse>> => {
    if (!token.value) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/document/delete?id=${id}`;

    return useApi<ApiResponse<DocumentResponse>>(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: token.value,
      },
    });
  };

  return { uploadDocument, deleteDocument };
}
