<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    size="extra-small"
    class="no-payment-recorded"
    @close="handleClose"
  >
    <div class="no-payment-recorded__content">
      <h2 class="no-payment-recorded__title">
        ¿Continuar sin pago registrado?
      </h2>
      <p class="no-payment-recorded__description">
        El paciente podrá realizar el pago directamente contigo durante la
        consulta.
      </p>

      <div class="no-payment-recorded__payment-warning">
        <p class="no-payment-recorded__payment-warning--title">
          Sin registro de pago
        </p>
        <p class="no-payment-recorded__payment-warning--text">
          No tenemos registro del pago del paciente. ¿Desea continuar con la
          valoración de todas formas?
        </p>
      </div>
    </div>

    <template #footer>
      <div class="no-payment-recorded__actions">
        <button
          class="no-payment-recorded__button--outline"
          @click="handleClose"
        >
          No, cancelar
        </button>
        <button
          class="no-payment-recorded__button--primary"
          @click="handleContinue"
        >
          Sí, continuar
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import type { Appointment } from "~/types";

const { isOpen, closeModal, getSharedData, openModal } =
  useMedicalModalManager();

const isModalOpen = computed(() => isOpen.advertenciaPago);

interface SharedData {
  appointment: Appointment;
}

const modalData = computed(() =>
  getSharedData<SharedData>("confirmValoration")
);

const sharedData = computed(() => ({
  appointment: modalData.value.appointment,
}));

const handleClose = () => {
  closeModal("advertenciaPago");
};

const handleContinue = () => {
  closeModal("detallesCita");
  openModal("subirProforma", { appointment: sharedData.value.appointment });
  closeModal("advertenciaPago");
};
</script>

<style lang="scss" scoped>
.no-payment-recorded {
  &__content {
    padding: 0 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 1.5rem;
    color: $color-foreground;
  }

  &__description {
    @include label-base;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: $color-text-secondary;
  }

  &__payment-warning {
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.75rem;
    background-color: $color-warning;

    &--title {
      @include label-base;
      font-weight: 600;
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: #dc6803;
      margin: 0 0 0.25rem 0;
    }

    &--text {
      @include label-base;
      font-weight: 500;
      font-size: 0.8125rem;
      line-height: 1.125rem;
      color: #dc6803;
      margin: 0;
    }
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
