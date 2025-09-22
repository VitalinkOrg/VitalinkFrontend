<template>
  <slot name="trigger" :open="handleOpenModal"></slot>

  <AtomsModalBase
    :is-open="isModalOpen"
    size="extra-small"
    class="confirmation-not-suitable"
    :close-on-backdrop="false"
    @close="handleCloseModal"
  >
    <div class="confirmation-not-suitable__content">
      <h2 class="confirmation-not-suitable__title">
        ¿Está seguro que desea finalizar con la valoración?
      </h2>
      <p class="confirmation-not-suitable__description">
        Esta acción marcará la valoración como completada indicando que el
        paciente no es candidato para el procedimiento solicitado.
      </p>
    </div>

    <template #footer>
      <div class="confirmation-not-suitable__actions">
        <button
          :disabled="isLoading"
          class="confirmation-not-suitable__button--outline"
          @click="handleCloseModal"
        >
          No, volver
        </button>
        <button
          :disabled="isLoading"
          class="confirmation-not-suitable__button--primary"
          @click="handleCancelAppointment"
        >
          {{ isLoading ? "Procesando..." : "Sí, confirmar" }}
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
    recommendation_post_appointment: "Paciente no apto para procedimiento",
    appointment_result_code: "NOT_FIT_FOR_PROCEDURE",
  };

  const { data, error } = await withErrorHandling(
    $fetch(config.public.API_BASE_URL + "/appointment/upload_proforma", {
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
.confirmation-not-suitable {
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

  &__title {
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

    &--primary {
      @include primary-button;
      width: 100%;
    }
  }
}
</style>
