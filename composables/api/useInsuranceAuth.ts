import useApi from "./useApi";

export const useInsuranceAuth = () => {
  const registerInsurance = (body: IRegisterRequest): IUsableAPI<ILoginResponse> => {
    return useApi<ILoginResponse>("auth/register", {
      method: "POST",
      body,
    });
  };

  return { registerInsurance };
};
