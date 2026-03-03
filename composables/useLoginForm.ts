import type { LoginCredentials, LoginFieldErrors } from "@/types/auth";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export function useLoginForm() {
  const email = ref("");
  const password = ref("");

  const errors = reactive<LoginFieldErrors>({
    email: "",
    password: "",
  });

  const clearErrors = (): void => {
    errors.email = "";
    errors.password = "";
  };

  const validate = (): boolean => {
    clearErrors();
    let isValid = true;

    const trimmedEmail = email.value.trim();

    if (!trimmedEmail) {
      errors.email = "El correo electrónico o cédula es obligatorio";
      isValid = false;
    } else if (trimmedEmail.includes("@") && !EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = "El formato del correo electrónico no es válido";
      isValid = false;
    }

    if (!password.value) {
      errors.password = "La contraseña es obligatoria";
      isValid = false;
    } else if (password.value.length < MIN_PASSWORD_LENGTH) {
      errors.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
      isValid = false;
    }

    return isValid;
  };

  /**
   * Classifies an API error and assigns it to the corresponding field.
   * If the message contains password keywords → password field;
   * if it contains email/user keywords → email field;
   * otherwise → general error in password field.
   */
  const setApiError = (errorMessage: string): void => {
    const lower = errorMessage.toLowerCase();

    const passwordKeywords = ["password", "contraseña"];
    const emailKeywords = ["email", "user", "correo", "usuario", "cédula"];

    if (passwordKeywords.some((kw) => lower.includes(kw))) {
      errors.password = errorMessage;
    } else if (emailKeywords.some((kw) => lower.includes(kw))) {
      errors.email = errorMessage;
    } else {
      errors.password = errorMessage;
    }
  };

  const credentials = computed<LoginCredentials>(() => ({
    email: email.value.trim(),
    password: password.value,
  }));

  const hasErrors = computed(
    () => Boolean(errors.email) || Boolean(errors.password),
  );

  return {
    email,
    password,
    errors,
    clearErrors,
    validate,
    setApiError,
    credentials,
    hasErrors,
  };
}
