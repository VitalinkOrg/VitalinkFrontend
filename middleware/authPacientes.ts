// middleware/authPacientes.ts
import { useStore } from "~/store";

export default defineNuxtRouteMiddleware((to) => {
    const store = useStore();
  
    if (!store.authenticated) {
      return navigateTo('/');
    }
});
