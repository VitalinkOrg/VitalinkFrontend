// middleware/authPacientes.ts
export default defineNuxtRouteMiddleware((to) => {
  const role = useCookie("role");
  const authenticated = useCookie("authenticated");

  if (!authenticated.value || role.value !== "CUSTOMER") {
    return navigateTo("/");
  }
});
