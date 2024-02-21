// middleware/authPacientes.ts
import { useStore } from "~/store";

export default defineNuxtRouteMiddleware((to) => {
    const store = useStore();
  
    if (!store.authenticated && store.role !== "R_DOC") {
      return navigateTo('/');
    }
});
