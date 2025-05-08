// middleware/authPacientes.ts
export default defineNuxtRouteMiddleware((to) => {
  const role = useCookie("role");
  if (role.value !== "LEGAL_REPRESENTATIVE") {
    return navigateTo("/");
  }
});
