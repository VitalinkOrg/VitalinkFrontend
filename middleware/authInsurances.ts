// middleware/authPacientes.ts
export default defineNuxtRouteMiddleware((to) => {
  const role = useCookie("role");
  if (role.value !== "FINANCE_ENTITY") {
    return navigateTo("/");
  }
});
