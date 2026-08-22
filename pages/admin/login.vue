<script setup lang="ts">
useSeoMeta({
  title: "Acceso Administrador — Vitalink",
  description: "Acceso exclusivo para administradores de la plataforma Vitalink.",
  ogTitle: "Acceso Administrador — Vitalink",
  ogDescription: "Acceso exclusivo para administradores de la plataforma Vitalink.",
});

import { useAuth } from "@/composables/api";
import { useLoginForm } from "@/composables/useLoginForm";
import { useToast } from "@/composables/useToast";
import {
  UserRole,
  type DecodedToken,
  type LoginFieldErrors,
  type LoginResponse,
} from "@/types/auth";
import { jwtDecode } from "jwt-decode";

definePageMeta({
  middleware: ["auth-login"],
});

const { login } = useAuth();
const { setUserInfo } = useUserInfo();
const { setRole, setAuthenticated } = useAuthState();
const { setToken, setRefreshToken } = useAuthToken();
const router = useRouter();
const toast = useToast();

const { email, password, errors, validate, setApiError, clearErrors, credentials } =
  useLoginForm();

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
    console.error("Admin login error:", err);
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
  const decoded = jwtDecode<DecodedToken>(access_token);

  if (decoded.role !== UserRole.SUPER_ADMIN) {
    generalError.value = "Esta cuenta no tiene permisos de administrador.";
    toast.error(generalError.value);
    return;
  }

  setToken(access_token);
  setRefreshToken(refresh_token);
  setAuthenticated(true);
  setRole(decoded.role);
  setUserInfo(decoded);

  router.push("/admin/inicio");
};

const focusFirstInvalidField = (): void => {
  nextTick(() => {
    const firstInvalid = document.querySelector<HTMLInputElement>(
      ".is-invalid, [aria-invalid='true']",
    );
    firstInvalid?.focus();
  });
};
</script>

<template>
  <div class="admin-login d-flex align-items-center justify-content-center min-vh-100 bg-light">
    <div class="card border-0 shadow-sm rounded-4 p-2" style="width: 100%; max-width: 26rem">
      <div class="card-body p-4">
        <div class="text-center mb-4">
          <AtomsVitalinkLogo />
          <h1 class="fs-5 fw-semibold mt-3 mb-0">Panel de Administración</h1>
          <p class="text-muted small mb-0">Acceso exclusivo para administradores</p>
        </div>

        <div
          v-if="generalError"
          class="alert alert-danger py-2 small"
          role="alert"
          aria-live="assertive"
        >
          {{ generalError }}
        </div>

        <form @submit.prevent="onSubmit" novalidate>
          <div class="mb-3">
            <label for="admin-login-email" class="form-label">Correo electrónico</label>
            <input
              ref="emailInputRef"
              v-model="email"
              type="email"
              id="admin-login-email"
              class="form-control"
              :class="{ 'is-invalid': errors.email }"
              placeholder="admin@vitalink.com"
              required
              aria-required="true"
              :aria-invalid="!!errors.email"
              :aria-describedby="errors.email ? 'admin-login-email-error' : undefined"
              autocomplete="username"
              :disabled="isLoading"
              @blur="clearFieldError('email')"
            />
            <span
              v-if="errors.email"
              id="admin-login-email-error"
              class="text-danger small"
              role="alert"
            >
              {{ errors.email }}
            </span>
          </div>

          <div class="mb-3">
            <label for="admin-login-password" class="form-label">Contraseña</label>
            <div class="input-group">
              <input
                v-model="password"
                :type="isPasswordVisible ? 'text' : 'password'"
                id="admin-login-password"
                class="form-control"
                :class="{ 'is-invalid': errors.password }"
                placeholder="Escribe tu contraseña"
                required
                aria-required="true"
                :aria-invalid="!!errors.password"
                :aria-describedby="errors.password ? 'admin-login-password-error' : undefined"
                autocomplete="current-password"
                :disabled="isLoading"
                @blur="clearFieldError('password')"
              />
              <button
                type="button"
                class="btn btn-outline-secondary"
                :aria-label="isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                :disabled="isLoading"
                @click="isPasswordVisible = !isPasswordVisible"
              >
                <AtomsIconsEyeOffIcon v-if="isPasswordVisible" />
                <AtomsIconsEyeIcon v-else />
              </button>
            </div>
            <span
              v-if="errors.password"
              id="admin-login-password-error"
              class="text-danger small"
              role="alert"
            >
              {{ errors.password }}
            </span>
          </div>

          <button
            type="submit"
            class="btn btn-primary w-100"
            :disabled="isLoading"
            :aria-busy="isLoading"
          >
            {{ isLoading ? "Ingresando…" : "Ingresar" }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
