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
  ): UsableAPI<ApiResponse<Package>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/package/add`;

    return useApi<ApiResponse<Package>>(url, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(packageData),
    });
  };

  const fetchPackageById = (
    packageId: number
  ): UsableAPI<ApiResponse<Package>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/package/get?id=${packageId}`;

    return useApi<ApiResponse<Package>>(url, {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const updatePackage = (
    packageId: number,
    packageData: Partial<PackageCreationRequest>
  ): UsableAPI<ApiResponse<Package>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/package/edit?id=${packageId}`;

    return useApi<ApiResponse<Package>>(url, {
      method: "PUT",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(packageData),
    });
  };

  const deletePackage = (packageId: number): UsableAPI<ApiResponse<void>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    const url = `${config.public.API_BASE_URL}/package/delete?id=${packageId}`;

    return useApi<ApiResponse<void>>(url, {
      method: "DELETE",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  return {
    fetchPackages,
    fetchPackagesBySupplierId,
    fetchPackageById,
    createPackage,
    updatePackage,
    deletePackage,
  };
};
