import type { ApiResponse, AssessmentDetail } from "~/types";
import useApi, { type UsableAPI } from "./useApi";

export const useAssessment = () => {
  const config = useRuntimeConfig();
  const token = useCookie("token");

  const fetchAssessment = (): UsableAPI<ApiResponse<AssessmentDetail[]>> => {
    if (!token.value) throw new Error("No authentication token found");

    const query = new URLSearchParams({
      type: "ASSESSMENT",
    });

    const url = `${config.public.API_BASE_URL}/udc/get_all?${query.toString()}`;

    return useApi<ApiResponse<AssessmentDetail[]>>(url, {
      method: "GET",
      headers: {
        Authorization: token.value,
        "Content-Type": "application/json",
      },
    });
  };

  const fetchAssessmentDetail = (): UsableAPI<
    ApiResponse<AssessmentDetail[]>
  > => {
    if (!token.value) throw new Error("No authentication token found");

    const query = new URLSearchParams({
      type: "ASSESSMENT_DETAIL",
    });

    const url = `${config.public.API_BASE_URL}/udc/get_all?${query.toString()}`;

    return useApi<ApiResponse<AssessmentDetail[]>>(url, {
      method: "GET",
      headers: {
        Authorization: token.value,
        "Content-Type": "application/json",
      },
    });
  };

  return { fetchAssessmentDetail, fetchAssessment };
};
