export default async function useRefreshToken() {
  const config = useRuntimeConfig();
  const token = useCookie("token");
  const refreshToken = useCookie("refresh_token");

  const { data }: any = await useLazyFetch(
    "https://stg.vitalink.cr" + `/users/refresh_token/${refreshToken.value}`
  );
  if (data.value) {
    token.value = data?.value?.data?.access_token;
  }
}
