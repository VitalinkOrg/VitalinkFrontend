<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    size="medium"
    @close="handleCloseModal('applyCreditSuccess')"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
  >
    <template #title>
      <h2 class="apply-credit-success-modal__title">Solicitar Crédito</h2>
    </template>
    <div class="apply-credit-success-modal__content">
      <div class="apply-credit-success-modal__icon-wrapper">
        <AtomsIconsCheckIcon
          size="24"
          class="apply-credit-success-modal__icon"
        />
      </div>
      <div>
        <h3 class="apply-credit-success-modal__highlight">¡Felicidades!</h3>
        <p class="apply-credit-success-modal__text">
          Tu solicitud se ha enviado con éxito
        </p>
      </div>
    </div>
    <template #footer>
      <div class="apply-credit-success-modal__footer">
        <button
          @click="handleNavigateToHome"
          class="apply-credit-success-modal__button--outline"
        >
          Ir a home
        </button>
        <button
          @click="handleCloseModal('applyCreditSuccess')"
          class="apply-credit-success-modal__button--primary"
        >
          Ver en citas
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import type { ModalName } from "~/types";
import type { Appointment } from "~/types/appointment";

interface Props {
  appointment: Appointment;
  isOpen: boolean;
}

interface Emits {
  (e: "open-modal", modalName: ModalName): void;
  (e: "close-modal", modalName: ModalName): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isModalOpen = computed({
  get: () => props.isOpen,
  set: (value: boolean) => {
    if (!value) handleCloseModal("applyCredit");
  },
});

const handleCloseModal = (modalName: ModalName) => {
  emit("close-modal", modalName);
};

const handleNavigateToHome = () => {
  handleCloseModal("applyCreditSuccess");
  useRouter().push("/pacientes/inicio");
};
</script>

<style lang="scss" scoped>
.apply-credit-success-modal {
  &__content {
    display: flex;
    flex-direction: column;
    padding: 20px 24px;
    gap: 20px;
  }

  &__icon-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
  }

  &__icon {
    width: 48px;
    height: 48px;
    color: $white;
    border-radius: 50%;
    background: #0cadbb;
    border: 8px solid #c2ebee;
    padding: 4px;
  }
  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    color: #353e5c;
  }

  &__highlight {
    @include label-base;
    font-weight: 600;
    font-size: 24px;
    line-height: 32px;
    text-align: center;
    color: $color-foreground;
  }
  &__text {
    @include label-base;
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;
    text-align: center;
    color: #6d758f;
  }

  &__footer {
    display: flex;
    gap: 12px;
    width: 100%;
  }

  &__button {
    &--primary {
      @include primary-button;
      width: 100%;
    }
    &--outline {
      @include outline-button;
      width: 100%;
    }
  }
}
</style>
