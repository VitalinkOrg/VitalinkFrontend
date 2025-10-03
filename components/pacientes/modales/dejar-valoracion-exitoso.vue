<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    size="small"
    @close="handleCloseModal('leaveReviewSuccess')"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
  >
    <div class="leave-rating-success-modal__content">
      <div class="leave-rating-success-modal__icon-wrapper">
        <AtomsIconsCheckIcon
          size="24"
          class="leave-rating-success-modal__icon"
        />
      </div>

      <div>
        <h2 class="leave-rating-success-modal__title">
          ¡Gracias por dejarnos tu reseña!
        </h2>
        <p class="leave-rating-success-modal__message">
          <span class="leave-rating-success-modal__text">
            Esto nos ayudará a mejorar el servicio
          </span>
        </p>
      </div>
    </div>

    <template #footer>
      <div class="leave-rating-success-modal__footer">
        <button
          class="leave-rating-success-modal__button--outline"
          @click="handleNavigateToHome"
        >
          Ir al home
        </button>
        <button
          class="leave-rating-success-modal__button--primary"
          @click="handleCloseModal('leaveReviewSuccess')"
        >
          Seguir en citas
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

const handleCloseModal = (modalName: ModalName): void => {
  emit("close-modal", modalName);
};

const isModalOpen = computed({
  get: () => props.isOpen,
  set: (value: boolean) => {
    if (!value) {
      emit("close-modal", "leaveReview");
    }
  },
});

const handleNavigateToHome = () => {
  handleCloseModal("scheduleProcedureSuccess");
  useRouter().push("/pacientes/inicio");
};
</script>

<style lang="scss" scoped>
.leave-rating-success-modal {
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
    margin-bottom: 0.5rem;
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
    justify-content: space-between;
    align-items: center;
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
