<template>
  <NuxtLayout name="pacientes-autenticacion">
    <div class="auth-content">
      <div class="auth-header">
        <h1 class="auth-header__title">Recuperar contraseña</h1>
        <p v-if="!isSuccess" class="auth-header__subtitle">
          Ingresa tu correo electrónico y te enviaremos instrucciones para
          restablecer tu contraseña
        </p>
      </div>

      <div v-if="!isSuccess" class="auth-form">
        <form @submit.prevent="handleSubmit" novalidate>
          <div class="form-group">
            <label for="email" class="form-group__label">
              Correo Electrónico
            </label>
            <input
              v-model="email"
              @input="handleEmailInput"
              @blur="touched.email = true"
              type="email"
              class="form-group__input"
              :class="{
                'input-error':
                  touched.email && (!email.trim() || !isEmailValid),
              }"
              placeholder="tu-email@ejemplo.com"
              :disabled="isLoading"
              id="email"
              autocomplete="email"
              required
            />
            <small
              v-if="touched.email && !email.trim()"
              class="form-group__error-message"
            >
              El correo electrónico es requerido
            </small>
            <small
              v-else-if="touched.email && email.trim() && !isEmailValid"
              class="form-group__error-message"
            >
              Ingresa un correo electrónico válido (ej: usuario@ejemplo.com)
            </small>
          </div>

          <div v-if="errorMessage" class="form-error">
            <AtomsIconsAlertCircleIcon size="20" />
            <span>{{ errorMessage }}</span>
          </div>

          <button
            type="submit"
            class="form-submit-button"
            :disabled="!isFormValid || isLoading"
          >
            <span v-if="isLoading" class="spinner"></span>
            {{ isLoading ? "Enviando..." : "Enviar instrucciones" }}
          </button>
        </form>

        <div class="auth-footer">
          <p class="auth-footer__text">
            <span>¿Recordaste tu contraseña?</span>
            <NuxtLink to="/auth/login" class="auth-footer__link">
              Iniciar sesión
            </NuxtLink>
          </p>
        </div>
      </div>

      <div v-else class="success-message">
        <div class="success-message__icon">
          <AtomsIconsCheckIcon size="32" />
        </div>
        <h2 class="success-message__title">¡Instrucciones enviadas!</h2>
        <p class="success-message__description">
          Hemos enviado las instrucciones para restablecer tu contraseña a
          <strong>{{ email }}</strong
          >. Revisa tu bandeja de entrada y sigue los pasos indicados.
        </p>
        <p class="success-message__note">
          Si no recibes el correo en unos minutos, verifica tu carpeta de spam o
          correo no deseado.
        </p>

        <div class="success-message__actions">
          <NuxtLink to="/auth/login" class="success-message__button">
            Volver al inicio de sesión
          </NuxtLink>
          <button
            type="button"
            class="success-message__button-secondary"
            @click="resetForm"
          >
            Enviar a otro correo
          </button>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import { useAuth } from "@/composables/api";

const { forgotPassword } = useAuth();

const email = ref<string>("");
const isLoading = ref<boolean>(false);
const isSuccess = ref<boolean>(false);
const errorMessage = ref<string>("");

const touched = reactive({
  email: false,
});

const isEmailValid = computed(() => {
  if (!email.value) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.value);
});

const isFormValid = computed(() => {
  return email.value.trim() !== "" && isEmailValid.value;
});

const handleEmailInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  email.value = target.value;
  touched.email = true;
  errorMessage.value = "";
};

const markAllTouched = () => {
  Object.keys(touched).forEach((key) => {
    touched[key as keyof typeof touched] = true;
  });
};

const handleSubmit = async () => {
  markAllTouched();

  if (!isFormValid.value || isLoading.value) {
    return;
  }

  try {
    isLoading.value = true;
    errorMessage.value = "";

    const api = forgotPassword({ email: email.value });
    await api.request();

    if (api.error.value) {
      throw new Error(
        typeof api.error.value === "string"
          ? api.error.value
          : "Error al enviar el correo de recuperación",
      );
    }

    isSuccess.value = true;
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value =
        "No se pudo enviar el correo de recuperación. Por favor, verifica que el correo electrónico sea correcto e intenta nuevamente.";
    }
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  email.value = "";
  isSuccess.value = false;
  errorMessage.value = "";
  touched.email = false;
};
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
  @include space-y(0.5rem);

  &__label {
    @include form-label;
    color: #344054;
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

.input-error {
  border-color: #dc2626 !important;
  background-color: #fef2f2 !important;

  &:focus {
    border-color: #dc2626 !important;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
  }
}

.form-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 1rem;
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
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    margin: 0;
    font-family: $font-family-alt;
    font-weight: 400;
    font-size: 0.875rem;
    color: $color-text-muted;

    @media (max-width: 48rem) {
      flex-direction: column;
      gap: 0.5rem;
    }
  }

  &__link {
    @include link-base;
    font-weight: 600;
    color: $color-primary;

    &:hover {
      text-decoration: underline;
      color: $color-primary-darkened-10;
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
    margin: 0 0 1rem 0;

    strong {
      color: $color-primary;
      font-weight: 600;
    }
  }

  &__note {
    @include text-base;
    font-size: 0.875rem;
    color: $color-text-secondary;
    line-height: 1.5;
    margin: 0 0 2rem 0;
    padding: 1rem;
    background-color: #f9fafb;
    border-radius: 0.5rem;
    border-left: 3px solid $color-primary;
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

  &__button-secondary {
    @include outline-button;
    width: 100%;
  }
}
</style>
