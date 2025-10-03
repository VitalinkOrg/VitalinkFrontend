<template>
  <slot name="trigger" :open="handleOpenModal"></slot>

  <AtomsModalBase
    :is-open="isModalOpen"
    size="extra-small"
    class="confirmation-rescheduling"
    @close="handleCloseModal"
  >
    <template #title>
      <div class="confirmation-rescheduling__title-icon">
        <AtomsIconsTriangleAlertIcon size="20" />
      </div>
    </template>

    <div class="confirmation-rescheduling__content">
      <h2 class="confirmation-rescheduling__content-title">
        ¿Estás seguro de continuar?
      </h2>
      <p class="confirmation-rescheduling__description">
        Le enviaremos una notificación al paciente para que acuda a la cita de
        valoración en la fecha que has confirmado
      </p>
    </div>

    <template #footer>
      <div class="confirmation-rescheduling__actions">
        <button
          :disabled="isLoading"
          class="confirmation-rescheduling__button--outline"
          @click="handleCloseModal"
        >
          Cancelar
        </button>
        <button
          :disabled="isLoading"
          class="confirmation-rescheduling__button--primary"
          @click="handleSaveChanges"
        >
          {{ isLoading ? "Procesando..." : "Continuar" }}
        </button>
      </div>
    </template>
  </AtomsModalBase>

  <MedicosModalesCambiosGuardados
    ref="savedChangesRef"
    :appointment="appointment"
  />
</template>

<script lang="ts" setup>
import { useAppointment } from "@/composables/api";
import type { Appointment } from "@/types";

interface Props {
  appointment: Appointment;
  appointmentDate: string;
  appointmentHour: string;
}

const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");
const closeReschedulingModal = inject<() => void>("closeReschedulingModal");

const props = defineProps<Props>();

const { confirmValorationAppointment, updateAppointment, confirmProcedure } =
  useAppointment();

const isModalOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);

const savedChangesRef = ref();

const handleOpenModal = () => {
  if (!props.appointmentDate || !props.appointmentHour) {
    console.warn("Cannot proceed without date and time selection");
    return;
  }

  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
};

const handleSaveChanges = async () => {
  if (!props.appointmentDate || !props.appointmentHour) {
    console.error("Missing appointment date or hour");
    return;
  }

  const payload = {
    customer_id: props.appointment.customer.id,
    appointment_date: props.appointmentDate,
    appointment_hour: props.appointmentHour,
    reservation_type: props.appointment.reservation_type.type,
    supplier_id: props.appointment.supplier.id,
  };

  try {
    isLoading.value = true;

    const api = updateAppointment(payload, props.appointment.id);
    await api.request();

    const response = api.response.value;
    const error = api.error.value;

    if (response?.data) {
      if (
        props.appointment.appointment_status.code ===
        "CONFIRM_VALIDATION_APPOINTMENT"
      ) {
        await refreshAppointments?.();
        savedChangesRef.value?.handleOpenModal();
        return;
      }

      if (props.appointment.appointment_status.code === "PENDING_PROCEDURE") {
        await handleConfirmProcedure();
      } else {
        await handleConfirmValorationAppointment();
      }
    }

    if (error) {
      console.error("Error saving changes:", error);
    }
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const handleConfirmValorationAppointment = async () => {
  const api = confirmValorationAppointment(props.appointment.id);
  await api.request();

  const response = api.response.value;
  const error = api.error.value;

  if (response?.data) {
    await refreshAppointments?.();
    handleCloseModal();
    closeReschedulingModal?.();
    savedChangesRef.value?.handleOpenModal();
  }

  if (error) {
    console.error(error);
  }
};

const handleConfirmProcedure = async () => {
  const api = confirmProcedure(props.appointment.id);
  await api.request();

  const response = api.response.value;
  const error = api.error.value;

  if (response?.data) {
    await refreshAppointments?.();
    handleCloseModal();
    closeReschedulingModal?.();
    savedChangesRef.value?.handleOpenModal();
  }

  if (error) {
    console.error(error);
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
.confirmation-rescheduling {
  &__title-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 2.5rem;
    height: 2.5rem;
    border: 0.40625rem solid $color-warning;
    background-color: #fef0c7;
    border-radius: 50%;
    padding: 0.375rem;

    svg {
      color: #dc6803;
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
    margin-bottom: 1rem;
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

    &--primary {
      @include primary-button;
      width: 100%;
    }
  }
}
</style>
