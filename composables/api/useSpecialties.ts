import type { ApiResponse, IUdc } from "@/types";
import useApi, { type UsableAPI } from "./useApi";

interface AddSpecialtyBySupplierRequest {
  supplier_id: number;
  medical_specialty_code: string;
}

interface AddMultipleSpecialtiesRequest {
  supplier_id: number;
  medical_specialty_codes: string[];
}

interface SpecialtyBySupplierResponse {
  id: number;
  supplier_id: number;
  medical_specialty: IUdc;
  created_date: string;
}

export const useSpecialties = () => {
  const config = useRuntimeConfig();
  const { getToken } = useAuthToken();

  const fetchSpecialtiesBySupplier = (
    supplierId: number,
  ): UsableAPI<ApiResponse<SpecialtyBySupplierResponse[]>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/specialtybysupplier/get_all?supplier_id=${supplierId}`;

    return useApi<ApiResponse<SpecialtyBySupplierResponse[]>>(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const addSpecialtyToSupplier = (
    data: AddSpecialtyBySupplierRequest,
  ): UsableAPI<ApiResponse<SpecialtyBySupplierResponse>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/specialtybysupplier/add`;

    return useApi<ApiResponse<SpecialtyBySupplierResponse>>(url, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  };

  const addMultipleSpecialties = (
    data: AddMultipleSpecialtiesRequest,
  ): UsableAPI<ApiResponse<SpecialtyBySupplierResponse[]>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/specialtybysupplier/add_multiple`;

    return useApi<ApiResponse<SpecialtyBySupplierResponse[]>>(url, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  };

  const updateSpecialtyBySupplier = (
    id: number,
    data: Partial<AddSpecialtyBySupplierRequest>,
  ): UsableAPI<ApiResponse<SpecialtyBySupplierResponse>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/specialtybysupplier/edit?id=${id}`;

    return useApi<ApiResponse<SpecialtyBySupplierResponse>>(url, {
      method: "PUT",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  };

  const deleteSpecialtyFromSupplier = (
    id: number,
  ): UsableAPI<ApiResponse<void>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/specialtybysupplier/delete?id=${id}`;

    return useApi<ApiResponse<void>>(url, {
      method: "DELETE",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const fetchSpecialtyById = (
    id: number,
  ): UsableAPI<ApiResponse<SpecialtyBySupplierResponse>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/specialtybysupplier/get?id=${id}`;

    return useApi<ApiResponse<SpecialtyBySupplierResponse>>(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  return {
    fetchSpecialtiesBySupplier,
    addSpecialtyToSupplier,
    addMultipleSpecialties,
    updateSpecialtyBySupplier,
    deleteSpecialtyFromSupplier,
    fetchSpecialtyById,
  };
};
