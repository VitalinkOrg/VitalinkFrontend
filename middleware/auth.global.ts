// middleware/auth.ts
import { useStore } from "~/store";

export default defineNuxtRouteMiddleware((to) => {
    const store = useStore();
    const token = useCookie('token');
  
    if (token.value) {
      // check if value exists
      store.authenticated = true;
    }
  
    // if token exists and url is /login redirect to homepage
    if (token.value && to?.path === '/pacientes/login') {
      return navigateTo('/');
    }
    // if (!token.value && to?.path === '/') {
    //   return navigateTo('/');
    // }
});
