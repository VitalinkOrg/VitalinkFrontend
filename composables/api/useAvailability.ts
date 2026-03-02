import useApi from "./useApi";

export const useAvailability = () => {
  const { getToken } = useAuthToken();

  const createAvailability = (
    payload: IAvailabilityCreationRequest,
  ): IUsableAPI<IApiResponse<IAvailability>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    return useApi<IApiResponse<IAvailability>>("/availability/add", {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  };

  const updateAvailability = (
    availabilityId: number,
    payload: IAvailabilityUpdateRequest,
  ): IUsableAPI<IApiResponse<IAvailability>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    return useApi<IApiResponse<IAvailability>>("/availability/edit", {
      method: "PUT",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      query: { id: availabilityId },
    });
  };

  const getAllAvailabilities = (): IUsableAPI<
    IApiResponse<IAvailability[]>
  > => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    return useApi<IApiResponse<IAvailability[]>>("/availability/get_all", {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  };

  const getAvailabilityById = (
    availabilityId: number,
  ): IUsableAPI<IApiResponse<IAvailability>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    return useApi<IApiResponse<IAvailability>>("/availability/", {
      method: "GET",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      query: { id: availabilityId },
    });
  };

  const deleteAvailability = (
    availabilityId: number,
  ): IUsableAPI<IApiResponse<null>> => {
    const token = getToken();
    if (!token) throw new Error("No authentication token found");

    return useApi<IApiResponse<null>>("/availability/delete", {
      method: "DELETE",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      query: { id: availabilityId },
    });
  };

  return {
    createAvailability,
    updateAvailability,
    getAllAvailabilities,
    getAvailabilityById,
    deleteAvailability,
  };
};
