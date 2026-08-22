import { UserRole } from "@/types/auth";

export default defineNuxtRouteMiddleware(() => {
  const authenticated = useCookie("authenticated");
  const role = useCookie("role");

  if (!authenticated.value || role.value !== UserRole.SUPER_ADMIN) {
    return navigateTo("/");
  }
});
