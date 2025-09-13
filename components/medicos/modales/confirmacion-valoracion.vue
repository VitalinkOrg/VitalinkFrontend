<template>
  <slot name="trigger" :open="handleOpenModal"></slot>

  <AtomsModalBase
    :is-open="isModalOpen"
    size="extra-small"
    class="confirm-valoration"
    :close-on-backdrop="false"
    @close="handleCloseModal"
  >
    <template #title>
      <div class="confirm-valoration__title-icon">
        <AtomsIconsTriangleAlertIcon />
      </div>
    </template>

    <div class="confirm-valoration__content">
      <h2 class="confirm-valoration__content-title">
        ¿Está seguro de continuar?
      </h2>
      <p class="confirm-valoration__description">
        Con estos cambios el estado de la
        <strong>reserva de la cita pasará de:</strong> pendiente a
        <strong>“Valorado”</strong>
      </p>
    </div>

    <template #footer>
      <div class="confirm-valoration__actions">
        <button
          :disabled="isLoading"
          class="confirm-valoration__button--outline"
          @click="handleCloseModal"
        >
          No, volver
        </button>
        <button
          :disabled="isLoading"
          class="confirm-valoration__button--primary"
          @click="handleConfirmValoration"
        >
          {{ isLoading ? "Procesando..." : "Continuar" }}
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import type { Appointment } from "~/types";

interface Props {
  appointment: Appointment;
  recommendation: string;
  diagnostic: string;
  priceProcedure: string;
  proformaFileName: string;
}

const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");
const closeValorationDetailsModal = inject<() => void>(
  "closeValorationDetailsModal"
);

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

const handleConfirmValoration = async () => {
  if (!token.value) {
    console.error("No token found - User not authenticated");
    return;
  }

  const payload = {
    price_procedure: props.priceProcedure,
    recommendation_post_appointment: props.recommendation,
    diagnostic: props.diagnostic,
    appointment_result_code: "FIT_FOR_PROCEDURE",
    proforma_file_code: "PERSONAL_DOCUMENT____6__DOC__652025134811",
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
    closeValorationDetailsModal?.();
    handleCloseModal();
  }

  if (error) {
    console.error("Error:", error);
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
.confirm-valoration {
  &__title-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 48px;
    height: 48px;
    border: 8px solid #fffaeb;
    background-color: #fef0c7;
    border-radius: 50%;

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
