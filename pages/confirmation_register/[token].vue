<template>
  <div class="auth-content">
    <div v-if="isLoading" class="verification-state">
      <div class="verification-state__spinner">
        <span class="spinner spinner--large"></span>
      </div>
      <h1 class="verification-state__title">Verificando tu cuenta</h1>
      <p class="verification-state__description">
        Estamos confirmando tu registro, por favor espera un momento...
      </p>
    </div>

    <div v-else-if="isSuccess && isPendingApproval" class="pending-message">
      <div class="pending-message__icon">
        <AtomsIconsCheckIcon size="32" />
      </div>
      <h1 class="pending-message__title">¡Correo verificado!</h1>
      <p class="pending-message__description">
        Tu dirección de correo ha sido confirmada. Espera que Vitalink confirme
        tu registro antes de poder acceder a tu cuenta.
      </p>
      <p class="pending-message__note">
        Recibirás una notificación cuando tu cuenta haya sido aprobada.
      </p>
    </div>

    <div v-else-if="isSuccess" class="success-message">
      <div class="success-message__icon">
        <AtomsIconsCheckIcon size="32" />
      </div>
      <h1 class="success-message__title">¡Cuenta verificada!</h1>
      <p class="success-message__description">
        Tu cuenta ha sido confirmada exitosamente. Ya puedes iniciar sesión y
        comenzar a usar Vitalink.
      </p>
      <div class="success-message__actions">
        <NuxtLink to="/auth/login" class="success-message__button">
          Ir a iniciar sesión
        </NuxtLink>
      </div>
    </div>

    <div v-else class="error-message">
      <div class="error-message__icon">
        <AtomsIconsCircleXIcon size="32" />
      </div>
      <h1 class="error-message__title">Verificación fallida</h1>
      <p class="error-message__description">
        {{ errorMessage }}
      </p>
      <div class="error-message__actions">
        <NuxtLink to="/pacientes/registro" class="error-message__button">
          Volver al registro
        </NuxtLink>
        <NuxtLink to="/auth/login" class="error-message__button-secondary">
          Ir a iniciar sesión
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
useSeoMeta({
  title: "Confirmar Registro — Vitalink",
  description: "Confirma tu registro en Vitalink para activar tu cuenta.",
  ogTitle: "Confirmar Registro — Vitalink",
  ogDescription: "Confirma tu registro en Vitalink para activar tu cuenta.",
});

import { useAuth } from "@/composables/api";
import { UserRole } from "@/types/auth";
import { decodeJWT } from "@/utils/jwt";

const route = useRoute();
const { confirmationRegister } = useAuth();

const isLoading = ref<boolean>(true);
const isSuccess = ref<boolean>(false);
const errorMessage = ref<string>(
  "El enlace de confirmación es inválido o ha expirado. Por favor, regístrate nuevamente o solicita un nuevo enlace de confirmación.",
);

const token = computed(() => (route.params.token as string) || "");

const isPendingApproval = computed(() => {
  if (!token.value) return false;
  const payload = decodeJWT(token.value);
  return (
    payload?.role === UserRole.LEGAL_REPRESENTATIVE ||
    payload?.role === UserRole.FINANCE_ENTITY
  );
});

onMounted(async () => {
  if (!token.value) {
    errorMessage.value =
      "No se encontró el token de confirmación. Por favor, utiliza el enlace enviado a tu correo electrónico.";
    isLoading.value = false;
    return;
  }

  const { error } = await confirmationRegister(token.value);

  if (error) {
    errorMessage.value =
      error.info ||
      "El enlace de confirmación es inválido o ha expirado. Por favor, regístrate nuevamente o solicita un nuevo enlace de confirmación.";
    isLoading.value = false;
    return;
  }

  isSuccess.value = true;
  isLoading.value = false;
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

.verification-state {
  text-align: center;
  padding: 2rem 0;

  &__spinner {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
  }

  &__title {
    @include label-base;
    font-size: 1.75rem;
    font-weight: 700;
    color: $color-foreground;
    margin-bottom: 0.75rem;

    @media (max-width: 48rem) {
      font-size: 1.5rem;
    }
  }

  &__description {
    @include text-base;
    font-size: 1rem;
    color: $color-text-muted;
    line-height: 1.6;
    margin: 0;
  }
}

.spinner {
  display: inline-block;
  border: 2px solid rgba($color-primary, 0.2);
  border-top-color: $color-primary;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  width: 1rem;
  height: 1rem;

  &--large {
    width: 3rem;
    height: 3rem;
    border-width: 3px;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.pending-message {
  text-align: center;
  padding: 1rem 0;

  &__icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 4.5rem;
    height: 4.5rem;
    background: linear-gradient(135deg, #fef9c3 0%, #fde68a 100%);
    border-radius: 50%;
    margin: 0 auto 1.5rem;

    svg {
      color: #b45309;
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
  }

  &__note {
    @include text-base;
    font-size: 0.875rem;
    color: $color-text-muted;
    line-height: 1.5;
    margin: 0;
    padding: 1rem;
    background-color: #fffbeb;
    border-radius: 0.5rem;
    border-left: 3px solid #f59e0b;
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
}

.error-message {
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

  &__actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
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
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
