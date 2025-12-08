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
  legal_representative: string;
  num_medical_enrollment: string;
  name: string;
  phone_number: string;
  country_iso_code: string;
  province: string;
  city_name: string;
  postal_code?: string;
  profile_picture_url: string;
  description: string;
  is_hospital: boolean;
  code_card_id_file: string;
  code_medical_license_file: string;
  gender?: string;
  address?: string;
  street_number?: string;
  floor?: string;
  door_number?: string;
  latitude?: string;
  longitude?: string;
  experience_years?: string;
  patients_number?: string;
  our_history?: string;
  mission?: string;
  vision?: string;
}

export interface CreateHospital {
  name: string;
  email: string;
  phone_number: string;
  country_iso_code: string;
  province: string;
  city_name: string;
  address: string;
  street_number?: string;
  postal_code?: string;
  floor?: string;
  door_number?: string;
  id_type: "JURIDICAL_DNI";
  card_id: string;
  legal_representative: string;
  is_hospital: true;
  description?: string;
  medical_type_code: string;
  num_medical_enrollment: string;
  profile_picture_url: string;
  code_card_id_file: string;
  code_medical_license_file: string;
}

export interface UpdateHospital {
  name?: string;
  email?: string;
  phone_number?: string;
  country_iso_code?: string;
  province?: string;
  city_name?: string;
  address?: string;
  street_number?: string;
  postal_code?: string;
  floor?: string;
  door_number?: string;

  id_type?: "JURIDICAL_DNI";
  card_id?: string;
  description?: string;
  medical_type_code?: string;
  num_medical_enrollment?: string;
  // is_hospital: true;
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

  const fetchAllMain = (params?: Record<string, string>) => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const queryString = params
      ? `?${new URLSearchParams(params).toString()}`
      : "";

    const url = `${config.public.API_BASE_URL}/supplier/get_all_main${queryString}`;

    return useApi<ApiResponse<Supplier[]>>(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const fetchSpecialtyBySupplier = (supplierId: number, token?: string) => {
    const authToken = token || getToken();
    if (!authToken) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/specialtybysupplier/get_all?supplier_id=${supplierId}`;

    return useApi<ApiResponse<Service[]>>(url, {
      method: "GET",
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
    });
  };

  const createSupplier = (body: CreateSupplier, token?: string) => {
    const authToken = token || getToken();
    if (!authToken) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/supplier/add`;

    return useApi<ApiResponse<any>>(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
    });
  };

  const uploadSpecialtyBySupplier = (
    body: SupplierSpecialty[],
    token?: string
  ) => {
    const authToken = token || getToken();
    if (!authToken) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/specialtybysupplier/add_multiple`;

    return useApi<ApiResponse<any>>(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
    });
  };

  const createHospital = (body: CreateHospital, token?: string) => {
    const authToken = token || getToken();
    if (!authToken) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/supplier/add`;

    return useApi<ApiResponse<any>>(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
    });
  };

  const updateHospital = (id: string, body: UpdateHospital, token?: string) => {
    const authToken = token || getToken();
    if (!authToken) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/supplier/edit?id=${encodeURIComponent(id)}`;

    return useApi<ApiResponse<any>>(url, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
    });
  };

  const deleteHospital = (id: string, token?: string) => {
    const authToken = token || getToken();
    if (!authToken) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/supplier/delete?id=${encodeURIComponent(id)}`;

    return useApi<ApiResponse<any>>(url, {
      method: "DELETE",
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
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
    createHospital,
    updateHospital,
    deleteHospital,
  };
};
