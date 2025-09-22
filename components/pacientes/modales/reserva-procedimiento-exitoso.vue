<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    size="medium"
    @close="handleCloseModal('scheduleProcedureSuccess')"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
  >
    <div class="schedule-procedure-success-modal__content">
      <div class="schedule-procedure-success-modal__icon-wrapper">
        <AtomsIconsCheckIcon
          size="24"
          class="schedule-procedure-success-modal__icon"
        />
      </div>
      <h2 class="schedule-procedure-success-modal__title">
        ¡Solicitud de reserva enviada!
      </h2>
      <p class="schedule-procedure-success-modal__message">
        <span class="schedule-procedure-success-modal__text">
          Una vez que el médico confirme la reserva te enviaremos un correo
          electrónico de confirmación
        </span>
        <span class="schedule-procedure-success-modal__text">
          Te hemos enviado un váucher de descuento para la cita.
        </span>
      </p>
    </div>

    <template #footer>
      <div class="schedule-procedure-success-modal__footer">
        <button
          class="schedule-procedure-success-modal__button--outline"
          @click="handleNavigateToHome"
        >
          Ir a home
        </button>
        <button
          class="schedule-procedure-success-modal__button--primary"
          @click="handleCloseModal('scheduleProcedureSuccess')"
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
    if (!value) {
      handleCloseModal("scheduleProcedureSuccess");
    }
  },
});

const handleCloseModal = (modalName: ModalName): void => {
  emit("close-modal", modalName);
};

const handleNavigateToHome = () => {
  handleCloseModal("scheduleProcedureSuccess");
  useRouter().push("/pacientes/inicio");
};
</script>

<style lang="scss" scoped>
.schedule-procedure-success-modal {
  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px;
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
    padding: 6px;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 24px;
    line-height: 32px;
    text-align: center;
    color: $color-foreground;
  }

  &____message {
    display: flex;
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }

  &__text {
    @include label-base;
    display: block;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0;
    text-align: center;
    color: #6d758f;
  }

  &__footer {
    width: 100%;
    display: flex;
    gap: 12px;
  }

  &__button {
    &--primary {
      @include primary-button;
      width: 100%;
      padding: 12px 12px;
    }

    &--outline {
      @include outline-button;
      width: 100%;
      padding: 12px 12px;
    }
  }
}
</style>
