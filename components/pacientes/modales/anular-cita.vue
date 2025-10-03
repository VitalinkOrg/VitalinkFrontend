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
import { useAppointment } from "@/composables/api";
import type { Appointment, ModalName } from "@/types";

const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");

interface Props {
  appointment: Appointment;
  isOpen: boolean;
}

interface Emits {
  (e: "open-modal", modalName: ModalName): void;
  (e: "close-modal", modalName: ModalName): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { updateAppointment } = useAppointment();
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
    const payload = {
      appointment_status_code: "CANCEL_APPOINTMENT",
    };

    const api = updateAppointment(payload, props.appointment.id);
    await api.request();

    const response = api.response.value;
    const error = api.error.value;

    if (response?.data) {
      await refreshAppointments?.();
      handleCloseModal("appointmentDetails");
      handleCloseModal("cancelAppointment");
    }
    if (error) {
      console.log(error.info);
    }
  } catch (error) {
    console.error("Error canceling appointment:", error);
  } finally {
    isLoading.value = false;
    await refreshAppointments?.();
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
    width: 2.4375rem;
    height: 2.4375rem;
    border-radius: 1.421875rem;
    background: $color-danger;
    border: 0.40625rem solid $color-cancel;
    color: $white;
  }

  &__content {
    max-width: 19.5rem;
    padding: 1.25rem 1.5rem 0 1.5rem;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 1.25rem;
    line-height: 1.875rem;
    color: $color-foreground;
  }

  &__subtext {
    @include label-base;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: $color-text-secondary;
  }

  &__footer {
    display: flex;
    width: 100%;
    gap: 0.75rem;
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
      background-color: $color-danger;

      &:hover:not(:disabled) {
        background-color: darken($color-danger, 0.8);
      }

      &:disabled {
        background-color: darken($color-danger, 0.8);
        opacity: 0.6;
        cursor: not-allowed;

        &:hover {
          opacity: 0.6;
          background-color: darken($color-danger, 0.8);
        }
      }
    }
  }

  &__loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__spinner {
    width: 0.875rem;
    height: 0.875rem;
    border: 0.125rem solid rgba(255, 255, 255, 0.3);
    border-top: 0.125rem solid $white;
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
