import type { ApiResponse, Service, Supplier } from "@/types";
import useApi, { type UsableAPI } from "./useApi";

export interface SupplierSpecialty {
  supplier_id: number;
  medical_specialty_code: string;
}

export interface CreateSupplier {
  id_type: string;
  card_id: string;
  email: string;
  medical_type_code: string;
  legal_representative: string; // UUID
  num_medical_enrollment: string;
  name: string;
  phone_number: string;
  country_iso_code: string; // Código de país ISO (ej: "CRC", "USA", etc.)
  province: string;
  city_name: string;
  profile_picture_url: string;
  description: string;
  is_hospital: boolean;
  code_card_id_file: string;
  code_medical_license_file: string;
}

export const useSupplier = () => {
  const config = useRuntimeConfig();
  const { getToken } = useAuthToken();

  const fetchAllSuppliers = (): UsableAPI<ApiResponse<Supplier[]>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/supplier/get_all`;

    return useApi<ApiResponse<Supplier[]>>(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const fetchSupplier = (userId: string | number, token?: string) => {
    const authToken = token || getToken();
    if (!authToken) {
      throw new Error("No authentication token found");
    }

    const url = `${config.public.API_BASE_URL}/supplier/get?id=${userId}`;

    return useApi<ApiResponse<Supplier>>(url, {
      method: "GET",
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
    });
  };

  const fetchAllMain = () => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/supplier/get_all_main`;

    return useApi<ApiResponse<any>>(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const fetchSpecialtyBySupplier = (supplierId: number) => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/specialtybysupplier/get_all?supplier_id=${supplierId}`;

    return useApi<ApiResponse<Service[]>>(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const createSupplier = (body: CreateSupplier) => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/supplier/add`;

    return useApi<ApiResponse<any>>(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: token,
      },
    });
  };

  const uploadSpecialtyBySupplier = (body: SupplierSpecialty[]) => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/specialtybysupplier/add_multiple`;

    return useApi<ApiResponse<any>>(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: token,
      },
    });
  };

  return {
    createSupplier,
    fetchAllSuppliers,
    fetchSupplier,
    uploadSpecialtyBySupplier,
    fetchSpecialtyBySupplier,
    fetchAllMain,
  };
};
