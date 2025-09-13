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
import type { Appointment } from "~/types";

interface Props {
  appointment: Appointment;
}

const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");
const closeParentModal = inject<() => void>("closeParentModal");

const props = defineProps<Props>();

const config = useRuntimeConfig();
const token = useCookie("token");

const { withErrorHandling } = useErrorHandler();

const isModalOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);

const handleOpenModal = () => {
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
};

const handleCancelAppointment = async () => {
  if (!token.value) {
    console.error("No token found - User not authenticated");
    return;
  }

  const payload = {
    appointment_status_code: "CANCEL_APPOINTMENT",
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
      customMessage: "Error al cancelar la cita. Por favor intenta nuevamente.",
      logError: true,
      redirectOn401: true,
    }
  );

  if (data) {
    await refreshAppointments?.();
    handleCloseModal();
    closeParentModal?.();
  }

  if (error) {
    console.error("Error cancelling appointment:", error);
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
    width: 40px;
    height: 40px;
    border: 6.5px solid #fac6d0;
    background-color: #ff2d46;
    border-radius: 50%;
    padding: 6px;

    svg {
      color: $white;
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

    &--danger {
      @include danger-button;
      width: 100%;
    }
  }
}
</style>
