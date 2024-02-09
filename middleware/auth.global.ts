// middleware/auth.ts
import { useStore } from "~/store";

export default defineNuxtRouteMiddleware((to) => {
    const store = useStore();
    const token = useCookie('token');
  
    if (token.value) {
      store.authenticated = true;
    }
});
