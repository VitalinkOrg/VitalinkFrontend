<template>
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
          @click="handleConfirmNotSuitable"
        >
          {{ isLoading ? "Procesando..." : "Sí, confirmar" }}
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useAppointment } from "@/composables/api";
import type { Appointment } from "@/types";

const { uploadProforma } = useAppointment();

const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");

const { isOpen, closeModal, getSharedData } = useMedicalModalManager();
const modalData = computed(() =>
  getSharedData<{ appointment: Appointment }>("confirmacionNoApto")
);

const currentAppointment = computed(() => modalData.value.appointment);

const isModalOpen = computed(() => isOpen.confirmacionNoApto);
const isLoading = ref<boolean>(false);

const handleCloseModal = () => {
  closeModal("confirmacionNoApto");
};

const handleConfirmNotSuitable = async () => {
  const payload = {
    recommendation_post_appointment: "Paciente no apto para procedimiento",
    appointment_result_code: "NOT_FIT_FOR_PROCEDURE",
  };

  try {
    isLoading.value = true;

    const api = uploadProforma(payload, currentAppointment.value.id);
    await api.request();

    const response = api.response.value;
    const error = api.error.value;

    if (response?.data) {
      await refreshAppointments?.();
      handleCloseModal();
      closeModal("subirProforma");
    }

    if (error) {
      console.error(error.raw);
    }
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.confirmation-not-suitable {
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

  &__title {
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

    &--primary {
      @include primary-button;
      width: 100%;
    }
  }
}
</style>
