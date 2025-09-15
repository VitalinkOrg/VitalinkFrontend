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
import type { Appointment } from "~/types";

interface Props {
  appointment: Appointment;
  appointmentDate: string;
  appointmentHour: string;
}

const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");
const closeReschedulingModal = inject<() => void>("closeReschedulingModal");

const props = defineProps<Props>();

const config = useRuntimeConfig();
const token = useCookie("token");

const { withErrorHandling } = useErrorHandler();

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
  if (!token.value) {
    console.error("No token found - User not authenticated");
    return;
  }

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

  const { data, error } = await withErrorHandling(
    $fetch(config.public.API_BASE_URL + "/appointment/edit", {
      method: "PUT",
      headers: { Authorization: token.value },
      params: {
        id: props.appointment.id,
      },
      body: payload,
    }),
    isLoading,
    {
      customMessage: "Error al guardar la cita. Por favor intenta nuevamente.",
      logError: true,
      redirectOn401: true,
    }
  );

  if (data) {
    await refreshAppointments?.();
    handleCloseModal();
    closeReschedulingModal?.();
    savedChangesRef.value?.handleOpenModal();
  }

  if (error) {
    console.error("Error saving changes:", error);
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
    width: 40px;
    height: 40px;
    border: 6.5px solid #fffaeb;
    background-color: #fef0c7;
    border-radius: 50%;
    padding: 6px;

    svg {
      color: #dc6803;
    }
  }

  &__content {
    padding: 20px 24px 0px 24px;
  }

  &__content-title {
    @include label-base;
    font-weight: 600;
    font-size: 20px;
    line-height: 30px;
    color: #19213d;
  }

  &__description {
    @include label-base;
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
    color: #6d758f;
    margin-bottom: 16px;
  }

  &__actions {
    width: 100%;
    display: flex;
    gap: 12px;
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
