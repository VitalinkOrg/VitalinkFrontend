const ROLE_ROUTES: Record<string, { home: string; login: string }> = {
  CUSTOMER: {
    home: "/pacientes/inicio",
    login: "/auth/login",
  },
  FINANCE_ENTITY: {
    home: "/socio-financiero/inicio",
    login: "/auth/login",
  },
  LEGAL_REPRESENTATIVE: {
    home: "/medicos/inicio",
    login: "/auth/login",
  },
};

export const useRoleRoutes = () => {
  const { getRole } = useAuthState();

  const getRoutes = (role?: string | null) => {
    const currentRole = role || getRole();
    return ROLE_ROUTES[currentRole || ""] || ROLE_ROUTES.CUSTOMER;
  };

  const getHome = (role?: string | null) => getRoutes(role).home;
  const getLogin = (role?: string | null) => getRoutes(role).login;

  return { getRoutes, getHome, getLogin, ROLE_ROUTES };
};
