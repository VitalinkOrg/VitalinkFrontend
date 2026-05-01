<template>
  <NuxtLayout name="pacientes-autenticacion">
    <form
      @submit.prevent="handleLogin"
      class="login-form"
      role="form"
      aria-labelledby="login-heading"
    >
      <div class="login-form__header">
        <h1 id="login-heading" class="login-form__title">
          Ingrese a su cuenta
        </h1>
      </div>

      <div class="login-form__body">
        <div class="form-field">
          <label for="email" class="form-field__label">
            Nº de Cédula o Correo electrónico
          </label>
          <input
            v-model="email"
            type="email"
            id="email"
            class="form-field__input"
            :class="{ 'form-field__input--error': emailError }"
            placeholder="Escribe tu número de cédula o correo electrónico"
            required
            aria-required="true"
            :aria-invalid="!!emailError"
            autocomplete="username"
            :disabled="isLoading"
          />
          <span v-if="emailError" class="form-field__error" role="alert">
            {{ emailError }}
          </span>
        </div>

        <div class="form-field">
          <label for="password" class="form-field__label"> Contraseña </label>
          <input
            v-model="password"
            type="password"
            id="password"
            class="form-field__input"
            :class="{ 'form-field__input--error': passwordError }"
            placeholder="Escribe tu contraseña"
            required
            aria-required="true"
            :aria-invalid="!!passwordError"
            autocomplete="current-password"
            :disabled="isLoading"
          />
          <span v-if="passwordError" class="form-field__error" role="alert">
            {{ passwordError }}
          </span>
        </div>
      </div>

      <div class="login-form__footer">
        <button
          type="submit"
          class="login-form__submit"
          aria-label="Iniciar sesión"
          :disabled="isLoading"
        >
          {{ isLoading ? "Cargando..." : "Ingresar" }}
        </button>

        <div class="login-form__links">
          <p class="login-form__register-prompt" id="register-link-label">
            <span>¿No tienes cuenta?</span>
            <NuxtLink
              to="/pacientes/registro"
              class="login-form__link"
              aria-describedby="register-link-label"
            >
              Regístrate
            </NuxtLink>
          </p>
        </div>
      </div>
    </form>
  </NuxtLayout>
</template>

<script lang="ts" setup>
useSeoMeta({
  title: "Iniciar Sesión — Vitalink",
  description: "Accede a tu cuenta de paciente en Vitalink.",
  ogTitle: "Iniciar Sesión — Vitalink",
  ogDescription: "Accede a tu cuenta de paciente en Vitalink.",
});

import { useAuth } from "@/composables/api";
import {
  type DecodedToken,
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

const email = ref<string>("");
const password = ref<string>("");
const isLoading = ref<boolean>(false);

const emailError = ref<string>("");
const passwordError = ref<string>("");

const handleLogin = async () => {
  try {
    isLoading.value = true;
    clearErrors();

    const { data, error } = await login({
      email: email.value,
      password: password.value,
    });

    if (error) {
      handleLoginError(error);
      return;
    }

    if (data) {
      await handleSuccessfulLogin(data as LoginResponse);
    }
  } catch (err) {
    console.error("Login error:", err);
  } finally {
    isLoading.value = false;
  }
};

const clearErrors = () => {
  emailError.value = "";
  passwordError.value = "";
};

const handleLoginError = (error: IApiErrorResponse) => {
  const errorInfo =
    error.info || error.status?.message || "Error al iniciar sesión";

  if (errorInfo.toLowerCase().includes("password")) {
    passwordError.value = errorInfo;
  } else if (
    errorInfo.toLowerCase().includes("email") ||
    errorInfo.toLowerCase().includes("user")
  ) {
    emailError.value = errorInfo;
  } else {
    passwordError.value = errorInfo;
  }
};

const handleSuccessfulLogin = async (data: LoginResponse) => {
  const { access_token, refresh_token } = data;

  setToken(access_token);
  setRefreshToken(refresh_token);
  setAuthenticated(true);

  const decoded = jwtDecode<DecodedToken>(access_token);
  setRole(decoded.role);

  await loadUserProfile(decoded, access_token);
  navigateToHome(decoded.role);
};

const loadUserProfile = async (decoded: DecodedToken, token: string) => {
  if (!ROLES_REQUIRING_PROFILE.has(decoded.role)) {
    setUserInfo(decoded);
    return;
  }

  const { data, error } = await getUserById(decoded.id, token);

  if (error) {
    console.error("Error al obtener perfil:", error);
    return;
  }

  if (data) {
    setUserInfo(data);
  }
};

const navigateToHome = (role: UserRoleType) => {
  const route = ROLE_HOME_ROUTES[role];
  if (route) {
    router.push(route);
  }
};
</script>

<style lang="scss" scoped>
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

  &__body {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
    flex: 1;
  }

  &__footer {
    margin-top: auto;
  }

  &__submit {
    @include primary-button;
    width: 100%;
  }

  &__links {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-top: 20px;
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
  }
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;

  &__label {
    @include label-base;
  }

  &__input {
    @include input-base;

    &--error {
      border-color: $color-danger;

      &:focus {
        border-color: $color-danger;
        box-shadow: 0 0 0 3px rgba($color-danger, 0.1);
      }
    }
  }

  &__error {
    font-family: $font-family-alt;
    font-size: 13px;
    color: $color-danger;
    margin-top: 4px;
  }
}

.social-login {
  &__label {
    @include label-base;
  }

  &__button {
    @include outline-button;
    width: 100%;
    padding: 10px 16px;
    gap: 12px;
  }

  @include space-y(10px, vertical);
}
</style>
