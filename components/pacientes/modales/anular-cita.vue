<template>
  <AtomsModalBase
    :isOpen="isModalOpen"
    title="Anular Cita"
    size="extra-small"
    @close="handleCloseModal('cancelAppointment')"
  >
    <template #title>
      <div class="cancel-appointment-modal__icon">
        <AtomsIconsCircleXIcon size="15" />
      </div>
    </template>
    <div class="cancel-appointment-modal__content">
      <h2 class="cancel-appointment-modal__title">
        Seguro que quieres anular la cita?
      </h2>
      <p class="cancel-appointment-modal__subtext">
        Esta acción no puede deshacerse.
      </p>
    </div>
    <template #footer>
      <div class="cancel-appointment-modal__footer">
        <button
          class="cancel-appointment-modal__button--outline"
          :disabled="isLoading"
          @click="handleCloseModal('cancelAppointment')"
        >
          No, volver
        </button>
        <button
          class="cancel-appointment-modal__button--danger"
          :disabled="isLoading"
          @click="handleCancelAppointment"
        >
          <span v-if="!isLoading">Sí, cancelar</span>
          <span v-else class="cancel-appointment-modal__loading">
            <span class="cancel-appointment-modal__spinner"></span>
            Cancelando...
          </span>
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import type { ModalName } from "~/types";
import type { Appointment } from "~/types/appointment";

interface Props {
  appointment: Appointment;
  isOpen: boolean;
}

interface Emits {
  (e: "open-modal", modalName: ModalName): void;
  (e: "close-modal", modalName: ModalName): void;
  (e: "refresh"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const token = useCookie("token");
const config = useRuntimeConfig();
const isLoading = ref(false);

const isModalOpen = computed({
  get: () => props.isOpen,
  set: (value: boolean) => {
    if (!value) {
      handleCloseModal("scheduleProcedure");
    }
  },
});

const handleCloseModal = (modalName: ModalName): void => {
  emit("close-modal", modalName);
};

const handleCancelAppointment = async () => {
  isLoading.value = true;

  try {
    const { data, error } = await useFetch(
      config.public.API_BASE_URL + "/appointment/edit",
      {
        method: "PUT",
        headers: { Authorization: token.value ?? "" },
        params: {
          id: props.appointment.id,
        },
        body: {
          appointment_status_code: "CANCEL_APPOINTMENT",
        },
      }
    );

    if (data) {
      emit("refresh");
      handleCloseModal("appointmentDetails");
      handleCloseModal("cancelAppointment");
    }
    if (error.value) {
      console.log(error.value, "data");
    }
  } catch (error) {
    console.error("Error canceling appointment:", error);
  } finally {
    isLoading.value = false;
    emit("refresh");
    handleCloseModal("cancelAppointment");
    handleCloseModal("appointmentDetails");
  }
};
</script>

<style lang="scss" scoped>
.cancel-appointment-modal {
  &__trigger {
    @include outline-danger-button;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 39px;
    height: 39px;
    border-radius: 22.75px;
    background: #ff2d46;
    border: 6.5px solid #fac6d0;
    color: $white;
  }

  &__content {
    max-width: 312px;
    padding: 20px 24px 0px 24px;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 20px;
    line-height: 30px;
    color: #19213d;
  }

  &__subtext {
    @include label-base;
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
    color: #6d758f;
  }

  &__footer {
    display: flex;
    width: 100%;
    gap: 12px;
  }

  &__button {
    @include button-base;

    &--outline {
      @include outline-button;
      width: 100%;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    &--danger {
      @include primary-button;
      width: 100%;
      background-color: #ff2d46;

      &:hover:not(:disabled) {
        background-color: darken(#ff2d46, 0.8);
      }

      &:disabled {
        background-color: darken(#ff2d46, 0.8);
        opacity: 0.6;
        cursor: not-allowed;

        &:hover {
          opacity: 0.6;
          background-color: darken(#ff2d46, 0.8);
        }
      }
    }
  }

  &__loading {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
