export default defineNuxtRouteMiddleware((to) => {
  const { getToken, clearTokens } = useAuthToken();
  const { clearAuthState } = useAuthState();
  const { clearUserInfo } = useUserInfo();

  const token = getToken();

  if (!token) {
    return navigateTo("/");
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const isExpired = payload.exp * 1000 < Date.now();

    if (isExpired || payload.role !== "FINANCE_ENTITY") {
      clearTokens();
      clearAuthState();
      clearUserInfo();
      return navigateTo("/");
    }
  } catch {
    clearTokens();
    clearAuthState();
    clearUserInfo();
    return navigateTo("/");
  }
});
