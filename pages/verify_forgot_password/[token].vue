<template>
  <NuxtLayout name="pacientes-autenticacion">
    <div class="auth-content">
      <div class="auth-header">
        <h1 id="change-password-heading" class="auth-header__title">
          Cambiar contraseña
        </h1>
        <p v-if="!isSuccess" class="auth-header__subtitle">
          Ingresa tu nueva contraseña para restablecer el acceso a tu cuenta
        </p>
      </div>

      <div
        v-if="tokenError"
        class="token-error"
        role="alert"
        aria-labelledby="token-error-heading"
      >
        <div class="token-error__icon" aria-hidden="true">
          <AtomsIconsCircleXIcon size="32" />
        </div>
        <h2 id="token-error-heading" class="token-error__title">
          Enlace inválido o expirado
        </h2>
        <p class="token-error__description">
          El enlace de recuperación es inválido o ha expirado. Por favor,
          solicita uno nuevo.
        </p>
        <NuxtLink to="/auth/recuperar-contrasena" class="token-error__button">
          Solicitar nuevo enlace
        </NuxtLink>
      </div>

      <div v-else-if="!isSuccess" class="auth-form">
        <form
          @submit.prevent="handleSubmit"
          novalidate
          aria-labelledby="change-password-heading"
        >
          <div class="form-group">
            <label for="password" class="form-group__label">
              Nueva Contraseña
              <div class="tooltip-container">
                <AtomsIconsInfoIcon
                  size="16"
                  class="tooltip-trigger"
                  aria-hidden="true"
                />
                <div class="tooltip-content" role="tooltip">
                  La contraseña debe tener al menos 8 caracteres
                </div>
              </div>
            </label>
            <div class="input-with-icon">
              <input
                v-model="password"
                @blur="touched.password = true"
                :type="showPassword ? 'text' : 'password'"
                class="form-group__input"
                :class="{
                  'input-error':
                    touched.password && (!password || !isPasswordValid),
                }"
                placeholder="Ingresa tu nueva contraseña"
                :disabled="isLoading"
                id="password"
                autocomplete="new-password"
                required
                aria-required="true"
                :aria-invalid="
                  touched.password && (!password || !isPasswordValid)
                "
                :aria-describedby="
                  touched.password && !password
                    ? 'password-error-required'
                    : touched.password && password && !isPasswordValid
                      ? 'password-error-invalid'
                      : undefined
                "
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
                :aria-label="
                  showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                "
                :disabled="isLoading"
              >
                <AtomsIconsEyeIcon v-if="!showPassword" size="20" />
                <AtomsIconsEyeOffIcon v-else size="20" />
              </button>
            </div>
            <small
              v-if="touched.password && !password"
              id="password-error-required"
              class="form-group__error-message"
              role="alert"
            >
              La contraseña es requerida
            </small>
            <small
              v-else-if="touched.password && password && !isPasswordValid"
              id="password-error-invalid"
              class="form-group__error-message"
              role="alert"
            >
              La contraseña debe tener al menos 8 caracteres
            </small>
          </div>

          <div class="form-group">
            <label for="confirmPassword" class="form-group__label">
              Confirmar Nueva Contraseña
            </label>
            <div class="input-with-icon">
              <input
                v-model="confirmPassword"
                @blur="touched.confirmPassword = true"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-group__input"
                :class="{
                  'input-error':
                    touched.confirmPassword &&
                    (!confirmPassword || passwordMismatch),
                }"
                placeholder="Confirma tu nueva contraseña"
                :disabled="isLoading"
                id="confirmPassword"
                autocomplete="new-password"
                required
                aria-required="true"
                :aria-invalid="
                  touched.confirmPassword &&
                  (!confirmPassword || passwordMismatch)
                "
                :aria-describedby="
                  touched.confirmPassword && !confirmPassword
                    ? 'confirm-error-required'
                    : touched.confirmPassword && passwordMismatch
                      ? 'confirm-error-mismatch'
                      : undefined
                "
              />
              <button
                type="button"
                class="toggle-password"
                @click="showConfirmPassword = !showConfirmPassword"
                :aria-label="
                  showConfirmPassword
                    ? 'Ocultar contraseña'
                    : 'Mostrar contraseña'
                "
                :disabled="isLoading"
              >
                <AtomsIconsEyeIcon v-if="!showConfirmPassword" size="20" />
                <AtomsIconsEyeOffIcon v-else size="20" />
              </button>
            </div>
            <small
              v-if="touched.confirmPassword && !confirmPassword"
              id="confirm-error-required"
              class="form-group__error-message"
              role="alert"
            >
              Debes confirmar tu contraseña
            </small>
            <small
              v-else-if="touched.confirmPassword && passwordMismatch"
              id="confirm-error-mismatch"
              class="form-group__error-message"
              role="alert"
            >
              Las contraseñas no coinciden
            </small>
          </div>

          <div
            class="password-requirements"
            aria-label="Requisitos de contraseña"
          >
            <p class="password-requirements__title" aria-hidden="true">
              La contraseña debe cumplir con:
            </p>
            <ul class="password-requirements__list">
              <li
                class="password-requirements__item"
                :class="{ 'is-valid': password.length >= 8 }"
                :aria-label="`Mínimo 8 caracteres: ${password.length >= 8 ? 'cumplido' : 'pendiente'}`"
              >
                <AtomsIconsCheckIcon
                  v-if="password.length >= 8"
                  size="16"
                  aria-hidden="true"
                />
                <AtomsIconsXIcon v-else size="16" aria-hidden="true" />
                <span aria-hidden="true">Mínimo 8 caracteres</span>
              </li>
              <li
                class="password-requirements__item"
                :class="{ 'is-valid': hasUpperCase }"
                :aria-label="`Al menos una mayúscula: ${hasUpperCase ? 'cumplido' : 'pendiente'}`"
              >
                <AtomsIconsCheckIcon
                  v-if="hasUpperCase"
                  size="16"
                  aria-hidden="true"
                />
                <AtomsIconsXIcon v-else size="16" aria-hidden="true" />
                <span aria-hidden="true"
                  >Al menos una mayúscula (recomendado)</span
                >
              </li>
              <li
                class="password-requirements__item"
                :class="{ 'is-valid': hasNumber }"
                :aria-label="`Al menos un número: ${hasNumber ? 'cumplido' : 'pendiente'}`"
              >
                <AtomsIconsCheckIcon
                  v-if="hasNumber"
                  size="16"
                  aria-hidden="true"
                />
                <AtomsIconsXIcon v-else size="16" aria-hidden="true" />
                <span aria-hidden="true">Al menos un número (recomendado)</span>
              </li>
            </ul>
          </div>

          <button
            type="submit"
            class="form-submit-button"
            :disabled="!isFormValid || isLoading"
            :aria-busy="isLoading"
          >
            <span v-if="isLoading" class="spinner" aria-hidden="true"></span>
            {{ isLoading ? "Cambiando contraseña..." : "Cambiar contraseña" }}
          </button>
        </form>

        <div class="auth-footer">
          <p class="auth-footer__text">
            <NuxtLink to="/auth/login" class="auth-footer__link">
              Volver al inicio de sesión
            </NuxtLink>
          </p>
        </div>
      </div>

      <div
        v-else
        class="success-message"
        role="status"
        aria-live="polite"
        aria-labelledby="success-heading"
      >
        <div class="success-message__icon" aria-hidden="true">
          <AtomsIconsCheckIcon size="32" />
        </div>
        <h2 id="success-heading" class="success-message__title">
          ¡Contraseña cambiada exitosamente!
        </h2>
        <p class="success-message__description">
          Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar
          sesión con tu nueva contraseña.
        </p>

        <div class="success-message__actions">
          <NuxtLink to="/auth/login" class="success-message__button">
            Ir a iniciar sesión
          </NuxtLink>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
useSeoMeta({
  title: "Cambiar Contraseña — Vitalink",
  description: "Actualiza tu contraseña de acceso a Vitalink de forma segura.",
  ogTitle: "Cambiar Contraseña — Vitalink",
  ogDescription:
    "Actualiza tu contraseña de acceso a Vitalink de forma segura.",
});

import { useAuth } from "@/composables/api";
import { useToast } from "@/composables/useToast";

const route = useRoute();
const { resetPassword, verifyForgotPasswordToken } = useAuth();
const toast = useToast();

const password = ref<string>("");
const confirmPassword = ref<string>("");
const showPassword = ref<boolean>(false);
const showConfirmPassword = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const isSuccess = ref<boolean>(false);
const isVerifyingToken = ref<boolean>(true);
const tokenError = ref<boolean>(false);

const touched = reactive({
  password: false,
  confirmPassword: false,
});

const token = computed(() => (route.params.token as string) || "");

const isPasswordValid = computed(() => password.value.length >= 8);

const hasUpperCase = computed(() => /[A-Z]/.test(password.value));

const hasNumber = computed(() => /\d/.test(password.value));

const passwordMismatch = computed(
  () =>
    password.value.trim() !== "" &&
    password.value !== confirmPassword.value &&
    confirmPassword.value !== "",
);

const isFormValid = computed(
  () =>
    password.value.trim() !== "" &&
    confirmPassword.value.trim() !== "" &&
    isPasswordValid.value &&
    !passwordMismatch.value &&
    token.value !== "",
);

const markAllTouched = () => {
  Object.keys(touched).forEach((key) => {
    touched[key as keyof typeof touched] = true;
  });
};

const verifyToken = async () => {
  if (!token.value) {
    isVerifyingToken.value = false;
    tokenError.value = true;
    toast.error(
      "Token de recuperación no encontrado. Por favor, utiliza el enlace enviado a tu correo electrónico.",
    );
    return;
  }

  const { data, error } = await verifyForgotPasswordToken(token.value);

  isVerifyingToken.value = false;

  if (error || !data?.valid) {
    tokenError.value = true;
    toast.error(
      "El enlace de recuperación es inválido o ha expirado. Por favor, solicita uno nuevo.",
    );
  }
};

const handleSubmit = async () => {
  markAllTouched();

  if (!isFormValid.value || isLoading.value) {
    return;
  }

  if (!token.value) {
    toast.error(
      "Token de recuperación inválido o expirado. Por favor, solicita un nuevo enlace de recuperación.",
    );
    return;
  }

  isLoading.value = true;

  const { error } = await resetPassword(token.value, {
    password: password.value,
  });

  isLoading.value = false;

  if (error) {
    toast.error(
      "No se pudo cambiar la contraseña. Por favor, intenta nuevamente o solicita un nuevo enlace de recuperación.",
    );
    return;
  }

  isSuccess.value = true;
  toast.success("¡Contraseña cambiada exitosamente!");

  setTimeout(() => {
    navigateTo("/auth/login");
  }, 3000);
};

onMounted(async () => {
  await verifyToken();
});
</script>

<style lang="scss" scoped>
.auth-content {
  max-width: 32rem;
  margin: 0 auto;
  padding: 2rem 0;

  @media (max-width: 48rem) {
    padding: 1rem 0;
  }
}

.auth-header {
  text-align: center;
  margin-bottom: 2.5rem;

  &__title {
    @include label-base;
    font-size: 2rem;
    font-weight: 700;
    color: $color-foreground;
    margin-bottom: 0.75rem;

    @media (max-width: 48rem) {
      font-size: 1.75rem;
    }
  }

  &__subtitle {
    @include text-base;
    font-size: 1rem;
    color: $color-text-muted;
    line-height: 1.6;
    margin: 0;
  }
}

.auth-form {
  @include space-y(1.5rem);
}

.form-group {
  margin-top: 0.5rem;
  @include space-y(0.5rem);

  &__label {
    @include form-label;
    color: #344054;
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  &__input {
    @include input-base;
    width: 100%;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &:disabled {
      background-color: #f9fafb;
      cursor: not-allowed;
      opacity: 0.6;
    }

    &:focus {
      outline: none;
      border-color: $color-primary;
      box-shadow: 0 0 0 3px rgba($color-primary, 0.1);
    }
  }

  &__error-message {
    display: block;
    color: #dc2626;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    line-height: 1.25;
  }
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;

  input {
    padding-right: 3rem;
  }
}

.toggle-password {
  @include button-base;
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.5rem;
  color: $color-text-muted;
  border-radius: 0.25rem;
  transition: all 0.2s ease;

  &:hover {
    color: $color-primary;
    background-color: rgba($color-primary, 0.05);
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

.tooltip-container {
  position: relative;
  display: inline-flex;
  align-items: center;

  .tooltip-trigger {
    cursor: help;
    color: #6b7280;
    transition: color 0.2s ease;

    &:hover {
      color: #374151;
    }
  }

  .tooltip-content {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 50%;
    transform: translateX(-50%);
    background: #1f2937;
    color: $white;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 400;
    white-space: nowrap;
    z-index: 1000;
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);

    &::before {
      content: "";
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 0.375rem solid transparent;
      border-bottom-color: #1f2937;
    }

    opacity: 0;
    visibility: hidden;
    transform: translateX(-50%) translateY(-0.25rem);
    transition: all 0.2s ease;
    pointer-events: none;
  }

  &:hover .tooltip-content {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
    pointer-events: auto;
  }
}

.password-requirements {
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-top: 1rem;

  &__title {
    @include label-base;
    font-size: 0.875rem;
    font-weight: 600;
    color: $color-foreground;
    margin: 0 0 0.75rem 0;
  }

  &__list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: $color-text-muted;
    transition: color 0.2s ease;

    svg {
      color: #9ca3af;
      flex-shrink: 0;
    }

    &.is-valid {
      color: #059669;

      svg {
        color: #059669;
      }
    }
  }
}

.input-error {
  border-color: #dc2626 !important;
  background-color: #fef2f2 !important;

  &:focus {
    border-color: #dc2626 !important;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
  }
}

.form-submit-button {
  @include primary-button;
  width: 100%;
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.auth-footer {
  margin-top: 2rem;
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;

  &__text {
    margin: 0;
    font-family: $font-family-alt;
    font-weight: 400;
    font-size: 0.875rem;
  }

  &__link {
    @include link-base;
    font-weight: 600;
    color: $color-primary;

    &:hover {
      text-decoration: underline;
      color: $color-primary-darkened-10;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
      border-radius: 2px;
    }
  }
}

.success-message {
  text-align: center;
  padding: 1rem 0;

  &__icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 4.5rem;
    height: 4.5rem;
    background: linear-gradient(135deg, #d3f2dd 0%, #a7e9ba 100%);
    border-radius: 50%;
    margin: 0 auto 1.5rem;

    svg {
      color: #0e7d3a;
    }
  }

  &__title {
    @include label-base;
    font-size: 1.75rem;
    font-weight: 700;
    color: $color-foreground;
    margin-bottom: 1rem;

    @media (max-width: 48rem) {
      font-size: 1.5rem;
    }
  }

  &__description {
    @include text-base;
    font-size: 1rem;
    color: $color-text-muted;
    line-height: 1.7;
    margin: 0 0 1.5rem 0;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 2rem;
  }

  &__button {
    @include primary-button;
    width: 100%;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.token-error {
  text-align: center;
  padding: 1rem 0;

  &__icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 4.5rem;
    height: 4.5rem;
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    border-radius: 50%;
    margin: 0 auto 1.5rem;

    svg {
      color: #dc2626;
    }
  }

  &__title {
    @include label-base;
    font-size: 1.75rem;
    font-weight: 700;
    color: $color-foreground;
    margin-bottom: 1rem;

    @media (max-width: 48rem) {
      font-size: 1.5rem;
    }
  }

  &__description {
    @include text-base;
    font-size: 1rem;
    color: $color-text-muted;
    line-height: 1.7;
    margin: 0 0 2rem 0;
  }

  &__button {
    @include primary-button;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding-left: 2rem;
    padding-right: 2rem;
  }
}
</style>
