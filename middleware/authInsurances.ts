// middleware/authPacientes.ts
import { useStore } from "~/store";

export default defineNuxtRouteMiddleware((to) => {
    const store = useStore();
    const role = useCookie("role");
  
    if (!store.authenticated || role.value !== "R_INS") {
      return navigateTo('/');
    }
});
