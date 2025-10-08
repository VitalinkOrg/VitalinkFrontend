export const useAuthToken = () => {
  const token = useCookie<string | null>("token");
  const refreshToken = useCookie<string | null>("refresh_token");

  const setToken = (newToken: string) => {
    token.value = newToken;
  };

  const setRefreshToken = (newRefreshToken: string) => {
    refreshToken.value = newRefreshToken;
  };

  const getToken = (): string | null => {
    return token.value;
  };

  const getRefreshToken = (): string | null => {
    return refreshToken.value;
  };

  const clearTokens = () => {
    token.value = null;
    refreshToken.value = null;
  };

  return {
    token: readonly(token),
    refreshToken: readonly(refreshToken),
    setToken,
    setRefreshToken,
    getToken,
    getRefreshToken,
    clearTokens,
  };
};
