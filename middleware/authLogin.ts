// middleware/authLogin.ts
export default defineNuxtRouteMiddleware((to) => {
    const authenticated = useCookie("authenticated");
  
    if (authenticated.value) {
      return navigateTo("/");
    }
  });