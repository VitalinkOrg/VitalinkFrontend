/** System roles with differentiated access */
export const UserRole = {
  CUSTOMER: "CUSTOMER",
  LEGAL_REPRESENTATIVE: "LEGAL_REPRESENTATIVE",
  FINANCE_ENTITY: "FINANCE_ENTITY",
} as const;

export type UserRoleType = (typeof UserRole)[keyof typeof UserRole];

export interface DecodedToken {
  readonly id: string;
  readonly role: UserRoleType;
  readonly exp?: number;
  readonly iat?: number;
}

export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

export interface LoginResponse {
  readonly access_token: string;
  readonly refresh_token: string;
}

export interface LoginFieldErrors {
  email: string;
  password: string;
}
export interface IForgotPassword {
  email: string;
}

export interface IResetPassword {
  password: string;
}

export interface IForgotPasswordResponse {
  message: string;
  token?: string;
}

export interface IVerifyTokenResponse {
  valid: boolean;
  message: string;
}

export interface IResetPasswordResponse {
  message: string;
  success: boolean;
}

/** Map of home routes by role */
export const ROLE_HOME_ROUTES: Readonly<Record<UserRoleType, string>> = {
  [UserRole.CUSTOMER]: "/pacientes/inicio",
  [UserRole.LEGAL_REPRESENTATIVE]: "/medicos/inicio",
  [UserRole.FINANCE_ENTITY]: "/socio-financiero/inicio",
};

/**
 * Roles that require fetching complete user profile after login.
 * FINANCE_ENTITY only needs data from the decoded token.
 */
export const ROLES_REQUIRING_PROFILE: ReadonlySet<UserRoleType> = new Set([
  UserRole.CUSTOMER,
  UserRole.LEGAL_REPRESENTATIVE,
]);
