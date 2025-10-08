import type { ApiResponse, Package } from "~/types";
import useApi, { type UsableAPI } from "./useApi";

interface PackageCreationRequest {
  specialty_id: number;
  procedure_code: string;
  product_code: string;
  discount: number;
  services_offer: {
    ASSESSMENT_DETAILS: string[];
  };
  is_king: number;
  observations: string;
  postoperative_assessments: number;
}

export const usePackage = () => {
  const config = useRuntimeConfig();
  const { getToken } = useAuthToken();

  const fetchPackages = (): UsableAPI<ApiResponse<Package[]>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/package/get_all`;

    return useApi<ApiResponse<Package[]>>(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const fetchPackagesBySupplierId = (
    supplierId: number
  ): UsableAPI<ApiResponse<Package[]>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/package/get_all?supplier_id=${supplierId}`;

    return useApi<ApiResponse<Package[]>>(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const createPackage = (
    packageData: Partial<PackageCreationRequest>
  ): UsableAPI<ApiResponse<PackageCreationRequest>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/package/add`;

    return useApi<ApiResponse<PackageCreationRequest>>(url, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(packageData),
    });
  };

  return { fetchPackages, fetchPackagesBySupplierId, createPackage };
};
