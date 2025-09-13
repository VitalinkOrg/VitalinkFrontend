<template>
  <slot name="trigger" :open="handleOpenModal"></slot>

  <AtomsModalBase
    :is-open="isModalOpen"
    size="small"
    class="success-confirmation"
    :close-on-backdrop="false"
    @close="handleCloseModal"
  >
    <div class="success-confirmation__content">
      <h2 class="success-confirmation__content-title">Felicidades</h2>
      <p class="success-confirmation__description">
        Acabas de confirmar la cita de valoración para tu paciente.
      </p>
    </div>

    <template #footer>
      <div class="success-confirmation__actions">
        <button
          :disabled="isLoading"
          class="success-confirmation__button--outline"
          @click="handleCloseModal"
        >
          Ir a inicio
        </button>
        <button
          :disabled="isLoading"
          class="success-confirmation__button--primary"
          @click="handleCloseModal"
        >
          Ver en Citas
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

const props = defineProps<Props>();

const isModalOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);

const handleOpenModal = () => {
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
};

defineExpose({
  handleOpenModal,
  handleCloseModal,
  isOpen: readonly(isModalOpen),
  isLoading: readonly(isLoading),
});
</script>

<style lang="scss" scoped>
.success-confirmation {
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
    font-family: $font-family-montserrat-alt;
    font-family: Montserrat Alternates;
    font-weight: 700;
    font-size: 28px;
    line-height: 29.5px;
    letter-spacing: 0;
    text-align: center;
    color: #3541b4;
  }

  &__description {
    font-family: $font-family-main;
    font-weight: 500;
    font-size: 18px;
    line-height: 26px;
    letter-spacing: 0;
    text-align: center;
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
