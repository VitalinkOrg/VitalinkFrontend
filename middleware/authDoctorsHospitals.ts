// middleware/authPacientes.ts
export default defineNuxtRouteMiddleware((to) => {
  const role = useCookie("role");
  if (role.value !== "R_DOC" && role.value !== "R_HOS") {
    return navigateTo("/");
  }
});
