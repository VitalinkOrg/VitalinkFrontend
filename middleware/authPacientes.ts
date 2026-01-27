export default defineNuxtRouteMiddleware((to) => {
  const role = useCookie("role");
  const { getToken, clearTokens } = useAuthToken();
  const { clearAuthState } = useAuthState();
  const { clearUserInfo } = useUserInfo();

  const token = getToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const isExpired = payload.exp * 1000 < Date.now();

      if (isExpired) {
        clearTokens();
        clearAuthState();
        clearUserInfo();
        return navigateTo("/");
      }
    } catch (error) {
      clearTokens();
      clearAuthState();
      clearUserInfo();
      return navigateTo("/");
    }
  }

  if (role.value !== "CUSTOMER") {
    return navigateTo("/");
  }
});
