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
    margin-bottom: 8px;
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
    justify-content: space-between;
    align-items: center;
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
