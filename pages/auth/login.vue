<template>
  <NuxtLayout name="pacientes-autenticacion">
    <form
      @submit.prevent="onSubmit"
      class="login-form"
      role="form"
      aria-labelledby="login-heading"
      novalidate
    >
      <div class="login-form__header">
        <h1 id="login-heading" class="login-form__title">
          Ingrese a su cuenta
        </h1>
      </div>

      <div
        v-if="generalError"
        class="login-form__alert"
        role="alert"
        aria-live="assertive"
      >
        {{ generalError }}
      </div>

      <div class="login-form__body">
        <div class="form-field">
          <label for="login-email" class="form-field__label">
            Nº de Cédula o Correo electrónico
          </label>
          <input
            ref="emailInputRef"
            v-model="email"
            type="email"
            id="login-email"
            class="form-field__input"
            :class="{ 'form-field__input--error': errors.email }"
            placeholder="Escribe tu número de cédula o correo electrónico"
            required
            aria-required="true"
            :aria-invalid="!!errors.email"
            :aria-describedby="errors.email ? 'login-email-error' : undefined"
            autocomplete="username"
            :disabled="isLoading"
            @blur="clearFieldError('email')"
          />
          <span
            v-if="errors.email"
            id="login-email-error"
            class="form-field__error"
            role="alert"
          >
            {{ errors.email }}
          </span>
        </div>

        <div class="form-field">
          <label for="login-password" class="form-field__label">
            Contraseña
          </label>
          <div class="form-field__input-wrapper">
            <input
              v-model="password"
              :type="isPasswordVisible ? 'text' : 'password'"
              id="login-password"
              class="form-field__input form-field__input--with-toggle"
              :class="{ 'form-field__input--error': errors.password }"
              placeholder="Escribe tu contraseña"
              required
              aria-required="true"
              :aria-invalid="!!errors.password"
              :aria-describedby="
                errors.password ? 'login-password-error' : undefined
              "
              autocomplete="current-password"
              :disabled="isLoading"
              @blur="clearFieldError('password')"
            />
            <button
              type="button"
              class="form-field__toggle-password"
              :aria-label="
                isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
              "
              :disabled="isLoading"
              @click="isPasswordVisible = !isPasswordVisible"
            >
              <AtomsIconsEyeOffIcon v-if="isPasswordVisible" />
              <AtomsIconsEyeIcon v-else />
            </button>
          </div>
          <span
            v-if="errors.password"
            id="login-password-error"
            class="form-field__error"
            role="alert"
          >
            {{ errors.password }}
          </span>
        </div>

        <div class="forgot-password">
          <NuxtLink
            to="/auth/recuperar-contrasena"
            class="forgot-password__link"
          >
            ¿Olvidaste tu contraseña?
          </NuxtLink>
        </div>
      </div>

      <div class="login-form__footer">
        <button
          type="submit"
          class="login-form__submit"
          :disabled="isLoading"
          :aria-busy="isLoading"
        >
          <span
            v-if="isLoading"
            class="login-form__spinner"
            aria-hidden="true"
          />
          {{ isLoading ? "Ingresando..." : "Ingresar" }}
        </button>

        <p class="login-form__register-prompt">
          <span>¿No tienes cuenta?</span>
          <NuxtLink to="/pacientes/registro" class="login-form__link">
            Regístrate
          </NuxtLink>
        </p>
      </div>
    </form>
  </NuxtLayout>
</template>

<script lang="ts" setup>
useSeoMeta({
  title: "Iniciar Sesión — Vitalink",
  description: "Accede a tu cuenta de Vitalink.",
  ogTitle: "Iniciar Sesión — Vitalink",
  ogDescription: "Accede a tu cuenta de Vitalink.",
});

import { useAuth } from "@/composables/api";
import { useLoginForm } from "@/composables/useLoginForm";
import { useToast } from "@/composables/useToast";
import {
  type DecodedToken,
  type LoginFieldErrors,
  type LoginResponse,
  type UserRoleType,
  ROLE_HOME_ROUTES,
  ROLES_REQUIRING_PROFILE,
} from "@/types/auth";
import { jwtDecode } from "jwt-decode";

definePageMeta({
  middleware: ["auth-login"],
});

const { login, getUserById } = useAuth();
const { setUserInfo } = useUserInfo();
const { setRole, setAuthenticated } = useAuthState();
const { setToken, setRefreshToken } = useAuthToken();
const router = useRouter();
const toast = useToast();

const {
  email,
  password,
  errors,
  validate,
  setApiError,
  clearErrors,
  credentials,
} = useLoginForm();

const isLoading = ref(false);
const isPasswordVisible = ref(false);
const generalError = ref("");
const emailInputRef = ref<HTMLInputElement | null>(null);

const clearFieldError = (field: keyof LoginFieldErrors): void => {
  if (errors[field]) {
    errors[field] = "";
  }
};

const onSubmit = async (): Promise<void> => {
  generalError.value = "";

  if (!validate()) {
    focusFirstInvalidField();
    return;
  }

  await performLogin();
};

const performLogin = async (): Promise<void> => {
  isLoading.value = true;
  clearErrors();

  try {
    const { data, error } = await login(credentials.value);

    if (error) {
      handleApiError(error);
      return;
    }

    if (data) {
      await handleLoginSuccess(data as LoginResponse);
    }
  } catch (err) {
    generalError.value = "Ocurrió un error inesperado. Intenta de nuevo.";
    toast.error(generalError.value);
    console.error("Login error:", err);
  } finally {
    isLoading.value = false;
  }
};

const handleApiError = (apiError: IApiErrorResponse): void => {
  const message =
    apiError.info || apiError.status?.message || "Error al iniciar sesión";
  setApiError(message);
  toast.error(message);
  focusFirstInvalidField();
};

const handleLoginSuccess = async (data: LoginResponse): Promise<void> => {
  const { access_token, refresh_token } = data;

  setToken(access_token);
  setRefreshToken(refresh_token);
  setAuthenticated(true);

  const decoded = jwtDecode<DecodedToken>(access_token);
  setRole(decoded.role);

  await loadUserProfile(decoded, access_token);
  navigateToHome(decoded.role);
};

const loadUserProfile = async (
  decoded: DecodedToken,
  token: string,
): Promise<void> => {
  if (!ROLES_REQUIRING_PROFILE.has(decoded.role)) {
    setUserInfo(decoded);
    return;
  }

  const { data, error } = await getUserById(decoded.id, token);

  if (error) {
    console.error("Error al obtener perfil:", error);
    toast.warning("No se pudo cargar tu perfil completo.");
    return;
  }

  if (data) {
    setUserInfo(data);
  }
};

const navigateToHome = (role: UserRoleType): void => {
  const route = ROLE_HOME_ROUTES[role];

  if (!route) {
    toast.error("Rol de usuario no reconocido.");
    console.error(`Rol desconocido: ${role}`);
    return;
  }

  router.push(route);
};

const focusFirstInvalidField = (): void => {
  nextTick(() => {
    const firstInvalid = document.querySelector<HTMLInputElement>(
      ".form-field__input--error, [aria-invalid='true']",
    );
    firstInvalid?.focus();
  });
};
</script>

<style lang="scss" scoped>
/* Sin cambios en los estilos */
.login-form {
  display: flex;
  flex-direction: column;
  min-height: 100%;

  &__header {
    margin-bottom: 34px;
  }

  &__title {
    font-family: $font-family-main;
    font-weight: 700;
    font-size: 24px;
    line-height: 100%;
    letter-spacing: 0;
    color: $color-foreground;
  }

  &__alert {
    padding: 12px 16px;
    margin-bottom: $spacing-lg;
    border-radius: $border-radius-md;
    background-color: rgba($color-danger, 0.08);
    border: 1px solid rgba($color-danger, 0.25);
    color: $color-error;
    font-family: $font-family-alt;
    font-size: 14px;
    line-height: 1.5;
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
    flex: 1;
  }

  &__footer {
    margin-top: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }

  &__submit {
    @include primary-button;
    width: 100%;
    position: relative;

    &[aria-busy="true"] {
      opacity: 0.85;
      cursor: wait;
    }
  }

  &__spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(#fff, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
    margin-right: $spacing-sm;
  }

  &__register-prompt {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 0;
    font-family: $font-family-alt;
    font-weight: 400;
    font-size: 14px;
    color: $color-text-muted;
  }

  &__link {
    @include link-base;
    font-weight: 600;
    text-decoration: none;
    color: $color-primary;

    &:hover {
      text-decoration: underline;
      color: darken($color-primary, 10%);
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
      border-radius: 2px;
    }
  }
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;

  &__label {
    @include label-base;
  }

  &__input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__input {
    @include input-base;
    width: 100%;

    &--with-toggle {
      padding-right: 48px;
    }

    &--error {
      border-color: $color-danger;

      &:focus {
        border-color: $color-danger;
        box-shadow: 0 0 0 3px rgba($color-danger, 0.15);
      }
    }
  }

  &__toggle-password {
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    font-size: 18px;
    line-height: 1;
    color: $color-text-muted;
    border-radius: 4px;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.7;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.4;
    }
  }

  &__error {
    font-family: $font-family-alt;
    font-size: 13px;
    color: $color-danger;
    margin-top: 4px;
  }
}

.forgot-password {
  text-align: right;
  margin-top: -8px;

  &__link {
    @include link-base;
    font-family: $font-family-alt;
    font-size: 14px;
    font-weight: 400;
    color: $color-primary;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
      color: darken($color-primary, 10%);
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
      border-radius: 2px;
    }
  }
}

.social-login {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__divider {
    @include label-base;
    text-align: center;
    position: relative;

    span {
      position: relative;
      z-index: 1;
      background: $white;
      padding: 0 12px;
    }

    &::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background: #d4dae0;
    }
  }

  &__button {
    @include outline-button;
    width: 100%;
    padding: 10px 16px;
    gap: 12px;

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
