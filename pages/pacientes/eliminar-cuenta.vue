<script setup lang="ts">
import { useAuth } from "@/composables/api";
import { ref } from "vue";

definePageMeta({
  middleware: ["auth-pacientes"],
});

const router = useRouter();
const { deleteUser, logout } = useAuth();
const { getUserInfo } = useUserInfo();

const isDeleting = ref(false);
const errorMessage = ref<string | null>(null);
const showConfirmation = ref(false);

const handleDeleteAccount = async () => {
  const userInfo = getUserInfo();

  if (!userInfo?.id) {
    errorMessage.value = "No se pudo obtener la información del usuario";
    return;
  }

  isDeleting.value = true;
  errorMessage.value = null;

  try {
    const { request, error } = deleteUser(userInfo.id);
    await request();

    if (error.value) {
      errorMessage.value = error.value.message || "Error al eliminar la cuenta";
      return;
    }

    logout();
    router.push("/pacientes/login");
  } catch (err) {
    errorMessage.value =
      err instanceof Error
        ? err.message
        : "Error inesperado al eliminar la cuenta";
    console.error("Error deleting account:", err);
  } finally {
    isDeleting.value = false;
    showConfirmation.value = false;
  }
};

const openConfirmation = () => {
  showConfirmation.value = true;
};

const closeConfirmation = () => {
  showConfirmation.value = false;
};
</script>

<template>
  <NuxtLayout name="pacientes-dashboard-perfil">
    <div class="delete-account">
      <h4 class="delete-account__title">
        ¿Quieres borrar tu cuenta de Vitalink?
      </h4>
      <p class="delete-account__description">
        Al eliminar la cuenta se borrará la totalidad de los contenidos y datos
        asociados a ella.
      </p>

      <div
        v-if="errorMessage"
        class="delete-account__message delete-account__message--error"
        role="alert"
      >
        {{ errorMessage }}
      </div>

      <div class="delete-account__actions">
        <button
          type="button"
          class="delete-account__button"
          :disabled="isDeleting"
          @click="openConfirmation"
          aria-label="Eliminar cuenta de usuario"
        >
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
      >
        <h5 id="modal-title" class="delete-account__modal-title">
          Confirmar eliminación
        </h5>
        <p id="modal-description" class="delete-account__modal-description">
          ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se
          puede deshacer.
        </p>
      </div>

      <template #footer>
        <div class="delete-account__modal-actions">
          <button
            type="button"
            class="delete-account__modal-button delete-account__modal-button--cancel"
            :disabled="isDeleting"
            @click="closeConfirmation"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="delete-account__modal-button delete-account__modal-button--confirm"
            :disabled="isDeleting"
            @click="handleDeleteAccount"
          >
            <span
              v-if="isDeleting"
              class="delete-account__spinner"
              aria-hidden="true"
            ></span>
            {{ isDeleting ? "Eliminando..." : "Sí, eliminar" }}
          </button>
        </div>
      </template>
    </AtomsModalBase>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.delete-account {
  margin-top: 1rem;
  padding: 0 1rem;

  @include respond-to(md) {
    margin-top: 1.5rem;
    padding: 0;
  }

  &__title {
    @include text-base;
    font-weight: 500;
    font-size: 18px;
    line-height: 100%;
    margin: 0 0 0.75rem 0;
    color: $color-foreground;

    @include respond-to(md) {
      font-size: 18px;
    }
  }

  &__description {
    @include text-base;
    color: $color-text-secondary;
    margin: 0 0 1.5rem 0;
    font-weight: 500;
    font-size: 16px;
    line-height: 100%;
  }

  &__message {
    padding: 0.75rem 1rem;
    border-radius: 6px;
    margin-bottom: 1rem;
    font-family: $font-family-main;
    font-size: 14px;

    &--error {
      background-color: $color-cancel;
      color: $color-error;
      border: 1px solid $color-error;
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

    @include respond-to(sm) {
      width: auto;
      min-width: 180px;
    }

    @include respond-to(md) {
      min-height: auto;
    }

    &:focus-visible {
      outline: 2px solid $color-danger;
      outline-offset: 2px;
    }
  }

  &__body {
    background-color: $white;
    border-radius: 8px;
    padding: 0 24px;
    max-width: 400px;
    width: 100%;

    @include respond-to(md) {
      padding: 0 24px;
    }
  }

  &__modal-title {
    @include text-base;
    font-size: 1.125rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    color: $color-foreground;
  }

  &__modal-description {
    @include text-base;
    color: $color-text-secondary;
    margin: 0 0 1.5rem 0;
    line-height: 1.5;
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
    min-height: 44px;
    width: 100%;

    @include respond-to(sm) {
      min-height: auto;
    }

    &--cancel {
      @include outline-button;
      order: 2;

      @include respond-to(sm) {
        order: 1;
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
        outline: 2px solid $color-danger;
        outline-offset: 2px;
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
    }
  }
}
</style>
