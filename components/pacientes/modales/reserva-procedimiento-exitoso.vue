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
    padding: 1.5rem;
    gap: 1.25rem;
  }

  &__icon-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 1.25rem;
  }

  &__icon {
    width: 3rem;
    height: 3rem;
    color: $white;
    border-radius: 50%;
    background: $primary-aqua;
    border: 0.5rem solid $primary-aqua-light;
    padding: 0.375rem;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 2rem;
    text-align: center;
    color: $color-foreground;
  }

  &____message {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    text-align: center;
  }

  &__text {
    @include label-base;
    display: block;
    font-weight: 500;
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0;
    text-align: center;
    color: $color-text-secondary;
  }

  &__footer {
    width: 100%;
    display: flex;
    gap: 0.75rem;
  }

  &__button {
    &--primary {
      @include primary-button;
      width: 100%;
      padding: 0.75rem 0.75rem;
    }

    &--outline {
      @include outline-button;
      width: 100%;
      padding: 0.75rem 0.75rem;
    }
  }
}
</style>
