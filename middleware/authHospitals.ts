export default defineNuxtRouteMiddleware((to) => {
  const authenticated = useCookie("authenticated");
  const role = useCookie("role");

  if (!authenticated.value || role.value !== "R_HOS") {
    return navigateTo("/");
  }
});
