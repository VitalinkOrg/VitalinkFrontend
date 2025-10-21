<template>
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
const { isOpen, closeModal, getSharedData, openModal } =
  useMedicalModalManager();

const modalData = computed(() =>
  getSharedData<{
    appointment: Appointment;
    appointmentDate: string;
    appointmentHour: string;
  }>("confirmacionReprogramacion")
);

const currentAppointment = computed(() => modalData.value?.appointment);
const newAppointmentDate = computed(() => modalData.value?.appointmentDate);
const newAppointmentHour = computed(() => modalData.value?.appointmentHour);

const { confirmValorationAppointment, updateAppointment, confirmProcedure } =
  useAppointment();

const isModalOpen = computed(() => isOpen.confirmacionReprogramacion);
const isLoading = ref<boolean>(false);

const savedChangesRef = ref();

const handleCloseModal = () => {
  closeModal("confirmacionReprogramacion");
};

const handleSaveChanges = async () => {
  if (!currentAppointment.value) {
    console.error("Appointment not found");
    return;
  }

  if (!newAppointmentDate.value || !newAppointmentHour.value) {
    console.error("Missing appointment date or hour");
    return;
  }

  const payload = {
    customer_id: currentAppointment.value.customer.id,
    appointment_date: newAppointmentDate.value as string,
    appointment_hour: newAppointmentHour.value as string,
    reservation_type: currentAppointment.value.reservation_type.type,
    supplier_id: currentAppointment.value.supplier.id,
  };

  try {
    isLoading.value = true;

    const api = updateAppointment(payload, currentAppointment.value.id);
    await api.request();

    const response = api.response.value;
    const error = api.error.value;

    if (response?.data) {
      if (
        currentAppointment.value?.appointment_status.code ===
        "CONFIRM_VALIDATION_APPOINTMENT"
      ) {
        await refreshAppointments?.();
        closeModal("detallesCita");
        closeModal("editorFechaHora");
        closeModal("confirmacionReprogramacion");
        openModal("cambiosGuardados", {
          appointment: currentAppointment.value,
        });
        return;
      }

      if (
        currentAppointment.value?.appointment_status.code ===
        "PENDING_PROCEDURE"
      ) {
        await handleConfirmProcedure();
      } else {
        await handleConfirmValorationAppointment();
      }
      await refreshAppointments?.();
      closeModal("detallesCita");
      closeModal("editorFechaHora");
      closeModal("confirmacionReprogramacion");
      openModal("cambiosGuardados", { appointment: currentAppointment.value });
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
  if (!currentAppointment.value) return;

  const api = confirmValorationAppointment(currentAppointment.value.id);
  await api.request();

  const response = api.response.value;
  const error = api.error.value;

  if (response?.data) {
    await refreshAppointments?.();
    handleCloseModal();
  }

  if (error) {
    console.error(error);
  }
};

const handleConfirmProcedure = async () => {
  try {
    if (!currentAppointment.value) throw new Error("No appointment found");
    const api = confirmProcedure(currentAppointment.value?.id);
    await api.request();

    const response = api.response.value;
    const error = api.error.value;

    if (response?.data) {
      await refreshAppointments?.();
      handleCloseModal();
      savedChangesRef.value?.handleOpenModal();
    }

    if (error) throw new Error(error.info);
  } catch (error) {
    console.error(error);
  }
};
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
