<script setup lang="ts">
import { useAuth } from "@/composables/api";

definePageMeta({
  middleware: ["auth-pacientes"],
});

const router = useRouter();
const { deleteUser, logout } = useAuth();
const { getUserInfo } = useUserInfo();

const isDeleting = ref(false);
const errorMessage = ref<string | null>(null);
const showConfirmation = ref(false);
const statusMessage = ref("");
const confirmationInput = ref("");
const modalRef = ref<HTMLElement | null>(null);
const previousFocusElement = ref<HTMLElement | null>(null);

const isConfirmationValid = computed(() => {
  return confirmationInput.value.toLowerCase() === "eliminar";
});

const handleDeleteAccount = async () => {
  if (!isConfirmationValid.value) {
    errorMessage.value = 'Debes escribir "eliminar" para confirmar';
    statusMessage.value = 'Error: Debes escribir "eliminar" para confirmar';
    return;
  }

  const userInfo = getUserInfo();

  if (!userInfo?.id) {
    errorMessage.value = "No se pudo obtener la información del usuario";
    statusMessage.value =
      "Error: No se pudo obtener la información del usuario";
    return;
  }

  isDeleting.value = true;
  errorMessage.value = null;
  statusMessage.value = "Eliminando cuenta, por favor espera";

  try {
    const { request, error } = deleteUser(userInfo.id);
    await request();

    if (error.value) {
      errorMessage.value = error.value.message || "Error al eliminar la cuenta";
      statusMessage.value = `Error: ${errorMessage.value}`;
      return;
    }

    statusMessage.value = "Cuenta eliminada exitosamente. Redirigiendo...";
    logout();

    setTimeout(() => {
      router.push("/auth/login");
    }, 1000);
  } catch (err) {
    errorMessage.value =
      err instanceof Error
        ? err.message
        : "Error inesperado al eliminar la cuenta";
    statusMessage.value = `Error: ${errorMessage.value}`;
    console.error("Error deleting account:", err);
  } finally {
    isDeleting.value = false;

    if (errorMessage.value) {
      showConfirmation.value = false;
      nextTick(() => {
        if (previousFocusElement.value) {
          previousFocusElement.value.focus();
        }
      });
    }
  }
};

const openConfirmation = () => {
  previousFocusElement.value = document.activeElement as HTMLElement;
  showConfirmation.value = true;
  errorMessage.value = null;
  confirmationInput.value = "";
  statusMessage.value = "Modal de confirmación abierto";

  nextTick(() => {
    const firstInput = document.querySelector(
      ".delete-account__confirmation-input",
    ) as HTMLInputElement;
    if (firstInput) {
      firstInput.focus();
    }
  });

  document.addEventListener("keydown", handleEscapeKey);
};

const closeConfirmation = () => {
  showConfirmation.value = false;
  confirmationInput.value = "";
  statusMessage.value = "Modal de confirmación cerrado";

  nextTick(() => {
    if (previousFocusElement.value) {
      previousFocusElement.value.focus();
    }
  });

  document.removeEventListener("keydown", handleEscapeKey);

  setTimeout(() => {
    statusMessage.value = "";
  }, 1000);
};

const handleEscapeKey = (e: KeyboardEvent) => {
  if (e.key === "Escape" && !isDeleting.value) {
    closeConfirmation();
  }
};

onUnmounted(() => {
  document.removeEventListener("keydown", handleEscapeKey);
});

useHead({
  title: "Eliminar Cuenta - Vitalink",
  meta: [
    {
      name: "description",
      content: "Gestiona la eliminación de tu cuenta de Vitalink",
    },
    {
      name: "robots",
      content: "noindex, nofollow",
    },
  ],
});
</script>

<template>
  <NuxtLayout name="pacientes-dashboard-perfil">
    <div class="delete-account">
      <header class="delete-account__header">
        <h1 id="delete-account-title" class="delete-account__title">
          ¿Quieres borrar tu cuenta de Vitalink?
        </h1>
        <p class="delete-account__description">
          Al eliminar la cuenta se borrará la totalidad de los contenidos y
          datos asociados a ella. Esta acción es permanente y no se puede
          deshacer.
        </p>
      </header>

      <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
        {{ statusMessage }}
      </div>

      <div
        v-if="errorMessage"
        class="delete-account__message delete-account__message--error"
        role="alert"
        aria-live="assertive"
        tabindex="-1"
        ref="errorMessageRef"
      >
        <strong>Error:</strong> {{ errorMessage }}
      </div>

      <div class="delete-account__actions">
        <button
          type="button"
          class="delete-account__button"
          :disabled="isDeleting"
          @click="openConfirmation"
          aria-label="Abrir modal para confirmar eliminación de cuenta"
          :aria-describedby="errorMessage ? 'error-message' : undefined"
        >
          <span aria-hidden="true">⚠️</span>
          Eliminar cuenta
        </button>
      </div>
    </div>

    <AtomsModalBase
      :is-open="showConfirmation"
      size="extra-small"
      @close="closeConfirmation"
    >
      <div
        class="delete-account__body"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        ref="modalRef"
      >
        <h2 id="modal-title" class="delete-account__modal-title">
          Confirmar eliminación de cuenta
        </h2>
        <p id="modal-description" class="delete-account__modal-description">
          Esta acción eliminará permanentemente tu cuenta y todos los datos
          asociados. No podrás recuperar tu cuenta una vez eliminada.
        </p>

        <div class="delete-account__confirmation-wrapper">
          <label
            for="confirmation-input"
            class="delete-account__confirmation-label"
          >
            Para confirmar, escribe <strong>"eliminar"</strong> en el campo:
          </label>
          <input
            id="confirmation-input"
            v-model="confirmationInput"
            type="text"
            class="delete-account__confirmation-input"
            :class="{
              'delete-account__confirmation-input--error':
                confirmationInput && !isConfirmationValid,
            }"
            placeholder='Escribe "eliminar"'
            autocomplete="off"
            :disabled="isDeleting"
            :aria-invalid="confirmationInput.length > 0 && !isConfirmationValid"
            aria-describedby="confirmation-hint"
            @keydown.enter="isConfirmationValid && handleDeleteAccount()"
          />
          <span
            id="confirmation-hint"
            class="delete-account__confirmation-hint"
            :class="{
              'delete-account__confirmation-hint--error':
                confirmationInput && !isConfirmationValid,
            }"
          >
            <template v-if="!confirmationInput">
              Debes escribir exactamente "eliminar"
            </template>
            <template v-else-if="!isConfirmationValid">
              El texto no coincide. Debe ser exactamente "eliminar"
            </template>
            <template v-else> ✓ Confirmación correcta </template>
          </span>
        </div>
      </div>

      <template #footer>
        <div class="delete-account__modal-actions">
          <button
            type="button"
            class="delete-account__modal-button delete-account__modal-button--cancel"
            :disabled="isDeleting"
            @click="closeConfirmation"
            aria-label="Cancelar eliminación de cuenta"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="delete-account__modal-button delete-account__modal-button--confirm"
            :disabled="isDeleting || !isConfirmationValid"
            @click="handleDeleteAccount"
            :aria-label="
              isDeleting
                ? 'Eliminando cuenta, por favor espera'
                : 'Confirmar eliminación de cuenta'
            "
            :aria-busy="isDeleting"
          >
            <span
              v-if="isDeleting"
              class="delete-account__spinner"
              aria-hidden="true"
            ></span>
            <span>{{
              isDeleting ? "Eliminando..." : "Sí, eliminar cuenta"
            }}</span>
          </button>
        </div>
      </template>
    </AtomsModalBase>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.delete-account {
  margin-top: 1rem;
  padding: 0 1rem;

  @include respond-to(md) {
    margin-top: 1.5rem;
    padding: 0;
  }

  &__header {
    margin-bottom: 2rem;
  }

  &__title {
    @include text-base;
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 1.3;
    margin: 0 0 0.75rem 0;
    color: $color-foreground;

    @include respond-to(md) {
      font-size: 1.75rem;
    }
  }

  &__description {
    @include text-base;
    color: $color-text-secondary;
    margin: 0;
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.5;
  }

  &__message {
    padding: 1rem;
    border-radius: 8px;
    margin-bottom: 1.5rem;
    font-family: $font-family-main;
    font-size: 14px;
    line-height: 1.5;

    &:focus {
      outline: 2px solid $color-error;
      outline-offset: 2px;
    }

    &--error {
      background-color: $color-cancel;
      color: $color-error;
      border: 1px solid $color-error;

      strong {
        font-weight: 600;
      }
    }
  }

  &__actions {
    margin-top: 2rem;

    @include respond-to(md) {
      margin-top: 2.5rem;
    }
  }

  &__button {
    @include danger-button;
    width: 100%;
    min-height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    @include respond-to(sm) {
      width: auto;
      min-width: 200px;
    }

    @include respond-to(md) {
      min-height: 44px;
    }

    &:focus-visible {
      outline: 3px solid $color-danger;
      outline-offset: 3px;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  &__body {
    background-color: $white;
    border-radius: 8px;
    padding: 0 24px;
    max-width: 500px;
    width: 100%;

    @include respond-to(md) {
      padding: 0 32px;
    }
  }

  &__modal-title {
    @include text-base;
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
    color: $color-foreground;
    line-height: 1.3;

    @include respond-to(md) {
      font-size: 1.375rem;
    }
  }

  &__modal-description {
    @include text-base;
    color: $color-text-secondary;
    margin: 0 0 1.5rem 0;
    line-height: 1.5;
    font-size: 0.9375rem;
  }

  &__confirmation-wrapper {
    margin-bottom: 1.5rem;
  }

  &__confirmation-label {
    @include form-label;
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.875rem;
    color: $color-foreground;

    strong {
      color: $color-danger;
      font-weight: 600;
    }
  }

  &__confirmation-input {
    @include input-base;
    width: 100%;
    font-size: 1rem;

    &--error {
      border-color: $color-error;

      &:focus-visible {
        border-color: $color-error;
        box-shadow: 0 0 0 4px rgba($color-error, 0.2);
      }
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
  }

  &__confirmation-hint {
    display: block;
    margin-top: 0.5rem;
    font-size: 0.8125rem;
    color: $color-text-secondary;
    line-height: 1.4;

    &--error {
      color: $color-error;
      font-weight: 500;
    }
  }

  &__modal-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width: 100%;

    @include respond-to(sm) {
      flex-direction: row;
      justify-content: flex-end;
    }
  }

  &__modal-button {
    min-height: 48px;
    width: 100%;
    transition: all 0.2s ease;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }

    @include respond-to(sm) {
      min-height: 44px;
      width: auto;
      min-width: 120px;
    }

    &--cancel {
      @include outline-button;
      order: 2;

      @include respond-to(sm) {
        order: 1;
      }

      &:focus-visible {
        outline: 2px solid $color-primary;
        outline-offset: 2px;
      }
    }

    &--confirm {
      @include danger-button;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      order: 1;

      @include respond-to(sm) {
        order: 2;
      }

      &:focus-visible {
        outline: 3px solid $color-danger;
        outline-offset: 3px;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.6;
      }
    }
  }

  &__spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba($white, 0.3);
    border-top-color: $white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  .delete-account {
    &__spinner {
      animation: none;
      opacity: 0.7;
    }

    &__modal-button,
    &__confirmation-input {
      transition: none;
    }
  }
}
</style>
