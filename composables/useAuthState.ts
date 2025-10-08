export const useAuthState = () => {
  const authenticated = useCookie<boolean>("authenticated", {
    default: () => false,
  });

  const role = useCookie<string | null>("role");

  const setAuthenticated = (isAuthenticated: boolean) => {
    authenticated.value = isAuthenticated;
  };

  const setRole = (userRole: string) => {
    role.value = userRole;
  };

  const getAuthenticated = (): boolean => {
    return authenticated.value || false;
  };

  const getRole = (): string | null => {
    return role.value;
  };

  const clearAuthState = () => {
    authenticated.value = false;
    role.value = null;
  };

  return {
    authenticated: readonly(authenticated),
    role: readonly(role),
    setAuthenticated,
    setRole,
    getAuthenticated,
    getRole,
    clearAuthState,
  };
};
