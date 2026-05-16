<script lang="ts" setup>
import { jwtDecode } from "jwt-decode";
import { useAuth } from "@/composables/api";

useSeoMeta({
  title: "Eliminar Cuenta — Vitalink Seguros",
  description:
    "Solicita la eliminación permanente de tu cuenta de socio financiero en Vitalink.",
  ogTitle: "Eliminar Cuenta — Vitalink Seguros",
  ogDescription:
    "Solicita la eliminación permanente de tu cuenta de socio financiero en Vitalink.",
});

definePageMeta({
  middleware: ["auth-insurances"],
});

const { deleteUser, logout } = useAuth();
const { getToken } = useAuthToken();
const { show: showToast } = useToast();
const logger = useLogger("SocioEliminarCuenta");
const router = useRouter();

const { id: userId } = jwtDecode<DecodedToken>(getToken()!);

const isConfirming = ref(false);
const isDeleting = ref(false);

const deleteAccount = async () => {
  if (!userId) {
    showToast("No se encontró la información del usuario", "error");
    return;
  }

  isDeleting.value = true;
  try {
    logger.debug("deleteUser", { userId });

    const { error } = await deleteUser(userId);

    if (error) {
      showToast(error.info || "Error al eliminar la cuenta", "error");
      return;
    }

    await logout();
    router.push("/auth/login");
  } catch {
    showToast("Error inesperado al eliminar la cuenta", "error");
  } finally {
    isDeleting.value = false;
  }
};
</script>

<template>
  <NuxtLayout name="socio-dashboard-perfil">
    <h4 class="delete-account__title">
      Eliminar Cuenta
    </h4>

    <div class="delete-account">
      <div class="delete-account__warning">
        <svg
          class="delete-account__warning-icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <div>
          <p class="delete-account__warning-title">
            Esta acción es permanente e irreversible
          </p>
          <p class="delete-account__warning-text">
            Al eliminar tu cuenta se borrarán la totalidad de los contenidos y
            datos asociados a ella. No podrás recuperar tu información una vez
            confirmada la eliminación.
          </p>
        </div>
      </div>

      <template v-if="!isConfirming">
        <div class="delete-account__actions">
          <button
            type="button"
            class="delete-account__button delete-account__button--danger"
            @click="isConfirming = true"
          >
            Eliminar cuenta
          </button>
        </div>
      </template>

      <template v-else>
        <div class="delete-account__confirm">
          <p class="delete-account__confirm-text">
            ¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se
            puede deshacer.
          </p>
          <div class="delete-account__actions">
            <button
              type="button"
              class="delete-account__button delete-account__button--secondary"
              :disabled="isDeleting"
              @click="isConfirming = false"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="delete-account__button delete-account__button--danger"
              :disabled="isDeleting"
              :aria-busy="isDeleting"
              @click="deleteAccount"
            >
              <template v-if="isDeleting">
                <span
                  class="delete-account__spinner"
                  aria-hidden="true"
                />
                Eliminando...
              </template>
              <template v-else>
                Confirmar eliminación
              </template>
            </button>
          </div>
        </div>
      </template>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.delete-account {
  margin-top: 1.5rem;

  @include respond-to-max(md) {
    margin-top: 1.25rem;
  }

  &__title {
    font-weight: 400;
    font-size: 1.5rem;
    line-height: 1.75rem;
    margin-bottom: 1rem;
    color: #212529;
    font-family: $font-family-main;

    @include respond-to-max(md) {
      font-size: 1.375rem;
    }

    @include respond-to-max(sm) {
      font-size: 1.25rem;
    }
  }

  &__warning {
    display: flex;
    gap: 1rem;
    padding: 1rem 1.25rem;
    background: #fff7ed;
    border: 1px solid #fed7aa;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    align-items: flex-start;
  }

  &__warning-icon {
    color: #ea580c;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }

  &__warning-title {
    font-weight: 600;
    font-size: 0.9375rem;
    color: #9a3412;
    margin-bottom: 0.375rem;
  }

  &__warning-text {
    font-size: 0.875rem;
    color: #c2410c;
    line-height: 1.5rem;
    margin: 0;
  }

  &__confirm {
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 0.5rem;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
  }

  &__confirm-text {
    font-size: 0.9375rem;
    color: #991b1b;
    margin-bottom: 1rem;
    line-height: 1.5rem;
  }

  &__actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;

    @include respond-to-max(sm) {
      flex-direction: column;
    }
  }

  &__button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 0.5rem;
    font-size: 0.9375rem;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.2s ease;

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    @include respond-to-max(sm) {
      width: 100%;
    }

    &--danger {
      background: #dc2626;
      color: #ffffff;
      border-color: #dc2626;

      &:hover:not(:disabled) {
        background: #b91c1c;
        border-color: #b91c1c;
      }

      &:focus-visible {
        outline: 2px solid #dc2626;
        outline-offset: 2px;
      }
    }

    &--secondary {
      background: #ffffff;
      color: #374151;
      border-color: #d0d5dd;

      &:hover:not(:disabled) {
        background: #f9fafb;
        border-color: #98a2b3;
      }

      &:focus-visible {
        outline: 2px solid $color-primary;
        outline-offset: 2px;
      }
    }
  }

  &__spinner {
    display: inline-block;
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #ffffff;
    border-radius: 50%;
    animation: rotate-spinner 0.6s linear infinite;
    vertical-align: middle;
  }
}

@keyframes rotate-spinner {
  to {
    transform: rotate(360deg);
  }
}
</style>
