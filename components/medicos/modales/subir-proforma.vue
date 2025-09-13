<template>
  <slot name="trigger" :open="handleOpenModal"></slot>

  <AtomsModalBase
    :is-open="isModalOpen"
    size="small"
    class="upload-proforma"
    :close-on-backdrop="false"
    @close="handleCloseModal"
  >
    <div class="upload-proforma__content">
      <h2 class="upload-proforma__content-title">¡Bien hecho!</h2>
      <p class="upload-proforma__description">
        El cambio de estado de la cita se ha realizado con éxito:
      </p>
    </div>

    <template #footer>
      <div class="upload-proforma__actions">
        <MedicosModalesConfirmacionNoApto :appointment="appointment">
          <template #trigger="{ open }">
            <button
              :disabled="isLoading"
              class="upload-proforma__button--outline"
              @click="open"
            >
              No apto para procedimiento
            </button>
          </template>
        </MedicosModalesConfirmacionNoApto>
        <button
          :disabled="isLoading"
          class="upload-proforma__button--primary"
          @click="openValorationDetails"
        >
          <AtomsIconsFileTextIcon size="20" />
          Subir Proforma
        </button>
      </div>
    </template>
  </AtomsModalBase>

  <MedicosModalesDetallesValoracion
    ref="valorationDetailsRef"
    :appointment="appointment"
  />
</template>

<script lang="ts" setup>
import type { Appointment } from "~/types";

interface Props {
  appointment: Appointment;
}

const props = defineProps<Props>();

const isModalOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);

const valorationDetailsRef = ref();

const handleOpenModal = () => {
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
};

const openValorationDetails = () => {
  valorationDetailsRef.value?.handleOpenModal();
  handleCloseModal();
};

defineExpose({
  handleOpenModal,
  handleCloseModal,
  isOpen: readonly(isModalOpen),
  isLoading: readonly(isLoading),
});
</script>

<style lang="scss" scoped>
.upload-proforma {
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
    font-family: $font-family-main;
    font-weight: 600;
    font-size: 24px;
    line-height: 20px;
    letter-spacing: 0;
    color: #027a48;
  }

  &__description {
    font-family: $font-family-main;
    font-weight: 400;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0;
    color: #19213d;
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
      padding: 0;
      text-wrap: nowrap;
    }

    &--primary {
      @include primary-button;
      text-wrap: nowrap;
    }
  }
}
</style>
