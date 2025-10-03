<template>
  <slot name="trigger" :open="handleOpenModal"></slot>

  <AtomsModalBase
    :is-open="isModalOpen"
    size="extra-small"
    class="cancel-appointment"
    @close="handleCloseModal"
  >
    <template #title>
      <div class="cancel-appointment__title-icon">
        <AtomsIconsCircleXIcon />
      </div>
    </template>

    <div class="cancel-appointment__content">
      <h2 class="cancel-appointment__content-title">
        Seguro que quieres cancelar la programación de esta cita?
      </h2>
      <p class="cancel-appointment__description">
        Se le enviará un correo electrónico automático al usuario avisándole que
        su cita ha sido cancelada.
      </p>
    </div>

    <template #footer>
      <div class="cancel-appointment__actions">
        <button
          :disabled="isLoading"
          class="cancel-appointment__button--outline"
          @click="handleCloseModal"
        >
          No, volver
        </button>
        <button
          :disabled="isLoading"
          class="cancel-appointment__button--danger"
          @click="handleCancelAppointment"
        >
          {{ isLoading ? "Procesando..." : "Sí, cancelar" }}
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useAppointment } from "@/composables/api";
import type { Appointment } from "@/types";

interface Props {
  appointment: Appointment;
}

const { updateAppointment } = useAppointment();

const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");
const closeParentModal = inject<() => void>("closeParentModal");

const props = defineProps<Props>();

const isModalOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);

const handleOpenModal = () => {
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
};

const handleCancelAppointment = async () => {
  try {
    isLoading.value = true;

    const payload = {
      appointment_status_code: "CANCEL_APPOINTMENT",
    };

    const api = updateAppointment(payload, props.appointment.id);
    await api.request();

    const response = api.response.value;
    const error = api.error.value;

    if (response?.data) {
      await refreshAppointments?.();
      handleCloseModal();
      closeParentModal?.();
    }

    if (error) {
      throw new Error("Error cancelling appointment:" + error.info);
    }
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

defineExpose({
  handleOpenModal,
  handleCloseModal,
  isOpen: readonly(isModalOpen),
  isLoading: readonly(isLoading),
});
</script>

<style lang="scss" scoped>
.cancel-appointment {
  &__title-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 2.5rem;
    height: 2.5rem;
    border: 0.40625rem solid $color-cancel;
    background-color: $color-danger;
    border-radius: 50%;
    padding: 0.375rem;

    svg {
      color: $white;
    }
  }

  &__content {
    padding: 1.25rem 1.5rem 0 1.5rem;
  }

  &__content-title {
    @include label-base;
    font-weight: 600;
    font-size: 1.25rem;
    line-height: 1.875rem;
    color: $color-foreground;
  }

  &__description {
    @include label-base;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: $color-text-secondary;
  }

  &__actions {
    width: 100%;
    display: flex;
    gap: 0.75rem;
  }

  &__button {
    &--outline {
      @include outline-button;
      width: 100%;
    }

    &--danger {
      @include danger-button;
      width: 100%;
    }
  }
}
</style>
