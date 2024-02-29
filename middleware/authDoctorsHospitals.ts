// middleware/authPacientes.ts
import { useStore } from "~/store";

export default defineNuxtRouteMiddleware((to) => {
  const store = useStore();
  const role = useCookie("role");

  if (!store.authenticated) {
    return navigateTo("/");
  }
  if (role.value !== "R_DOC" && role.value !== "R_HOS") {
    return navigateTo("/");
  }
});
