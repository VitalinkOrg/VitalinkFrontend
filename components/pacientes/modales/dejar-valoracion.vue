<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    title="Dejar una reseña"
    size="medium"
    @close="handleCloseModal('leaveReview')"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
  >
    <div class="leave-rating-modal__content">
      <p class="leave-rating-modal__highlight">
        ¿Como te sentiste con esta experiencia?
      </p>
      <h2 class="leave-rating-modal__title">
        <template v-if="currentStep === 1">
          Dejanos una valoración sobre tu experiencia con tu Doctora
        </template>
        <template v-else>
          Dejanos una valoración sobre tu experiencia con tu Vitalink
        </template>
      </h2>

      <div class="leave-rating-modal__stars">
        <button
          v-for="n in 5"
          :key="n"
          type="button"
          class="leave-rating-modal__star-button"
          :disabled="isLoading"
          @click="setRating(n)"
          :aria-label="`Calificar con ${n} estrella${n > 1 ? 's' : ''}`"
        >
          <AtomsIconsStarFilled
            v-if="n <= selectedRating"
            class="leave-rating-modal__stars--icon leave-rating-modal__stars--filled"
            :class="{ 'leave-rating-modal__stars--disabled': isLoading }"
          />
          <AtomsIconsStarOutline
            v-else
            class="leave-rating-modal__stars--icon leave-rating-modal__stars--outline"
            :class="{ 'leave-rating-modal__stars--disabled': isLoading }"
          />
        </button>
      </div>

      <textarea
        v-model="reviewText"
        name="review"
        id="review"
        class="leave-rating-modal__textarea"
        :class="{ 'leave-rating-modal__textarea--disabled': isLoading }"
        :disabled="isLoading"
        placeholder="Describe tu experiencia"
      ></textarea>
    </div>

    <template #footer>
      <div class="leave-rating-modal__footer">
        <div class="leave-rating-modal__step">
          <p class="leave-rating-modal__step--text">{{ currentStep }} de 2</p>
        </div>
        <div class="leave-rating-modal__buttons">
          <button
            class="leave-rating-modal__button--outline"
            :disabled="currentStep === 1 || isLoading"
            @click="goToPreviousStep"
          >
            Atras
          </button>
          <button
            v-if="currentStep === 1"
            class="leave-rating-modal__button--primary"
            :disabled="isLoading"
            @click="goToNextStep"
          >
            Siguiente
          </button>
          <button
            v-else
            class="leave-rating-modal__button--primary"
            :disabled="isLoading"
            @click="handleSubmit"
          >
            <span v-if="!isLoading">Confirmar</span>
            <span v-else class="leave-rating-modal__loading">
              <span class="leave-rating-modal__spinner"></span>
              Enviando reseña...
            </span>
          </button>
        </div>
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

const currentStep = ref<number>(1);
const isLoading = ref<boolean>(false);

const doctorRating = ref<number>(5);
const doctorReview = ref<string>("");
const vitalinkRating = ref<number>(5);
const vitalinkReview = ref<string>("");

const selectedRating = computed({
  get: () =>
    currentStep.value === 1 ? doctorRating.value : vitalinkRating.value,
  set: (value: number) => {
    if (currentStep.value === 1) {
      doctorRating.value = value;
    } else {
      vitalinkRating.value = value;
    }
  },
});

const reviewText = computed({
  get: () =>
    currentStep.value === 1 ? doctorReview.value : vitalinkReview.value,
  set: (value: string) => {
    if (currentStep.value === 1) {
      doctorReview.value = value;
    } else {
      vitalinkReview.value = value;
    }
  },
});

const setRating = (rating: number): void => {
  if (!isLoading.value) {
    selectedRating.value = rating;
  }
};

const goToNextStep = (): void => {
  if (currentStep.value < 2 && !isLoading.value) {
    currentStep.value++;
  }
};

const goToPreviousStep = (): void => {
  if (currentStep.value > 1 && !isLoading.value) {
    currentStep.value--;
  }
};

const handleSubmit = async (): Promise<void> => {
  if (isLoading.value) return;

  isLoading.value = true;

  try {
    // Simular envío de reseña con setTimeout
    await new Promise((resolve) => {
      setTimeout(() => {
        const reviewData = {
          doctor: {
            rating: doctorRating.value,
            review: doctorReview.value,
          },
          vitalink: {
            rating: vitalinkRating.value,
            review: vitalinkReview.value,
          },
        };

        console.log("submit-reviews", reviewData);
        resolve(true);
      }, 2500); // Simular 2.5 segundos de espera
    });

    // Resetear formulario
    resetForm();

    // Cerrar modal y abrir el de éxito
    handleCloseModal("leaveReview");
    handleOpenModal("leaveReviewSuccess");
  } catch (error) {
    console.error("Error al enviar reseña:", error);
    // Aquí podrías mostrar un mensaje de error al usuario
  } finally {
    isLoading.value = false;
  }
};

const resetForm = (): void => {
  currentStep.value = 1;
  doctorRating.value = 5;
  doctorReview.value = "";
  vitalinkRating.value = 5;
  vitalinkReview.value = "";
  isLoading.value = false;
};

const handleOpenModal = (modalName: ModalName) => {
  emit("open-modal", modalName);
};

const handleCloseModal = (modalName: ModalName): void => {
  if (!isLoading.value) {
    resetForm();
    emit("close-modal", modalName);
  }
};

const isModalOpen = computed({
  get: () => props.isOpen,
  set: (value: boolean) => {
    if (!value && !isLoading.value) {
      emit("close-modal", "leaveReview");
    }
  },
});

// Resetear formulario cuando se abre el modal
watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      resetForm();
    }
  }
);
</script>

<style lang="scss" scoped>
.leave-rating-modal {
  &__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 20px 24px;
  }

  &__highlight {
    @include label-base;
    font-weight: 600;
    font-size: 16px;
    line-height: 28px;
    color: #3541b4;
    text-align: center;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 24px;
    line-height: 37px;
    letter-spacing: -1px;
    text-align: center;
    color: #353e5c;
    max-width: 360px;
  }

  &__stars {
    display: flex;
    justify-content: center;
    gap: 8px;
    max-width: 360px;
    width: 100%;
    margin: 10px 0;
  }

  &__star-button {
    background: none;
    border: none;
    padding: 8px;
    cursor: pointer;
    border-radius: 4px;
    transition: transform 0.2s ease;

    &:hover:not(:disabled) {
      transform: scale(1.1);
    }

    &:focus:not(:disabled) {
      outline: 2px solid #3541b4;
      outline-offset: 2px;
    }

    &:active:not(:disabled) {
      transform: scale(0.95);
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__stars--icon {
    width: 40px;
    height: 40px;
    transition:
      color 0.2s ease,
      opacity 0.2s ease;

    &.leave-rating-modal__stars--filled {
      color: #fdb022;
    }

    &.leave-rating-modal__stars--outline {
      color: #d0d5dd;
    }

    &.leave-rating-modal__stars--disabled {
      opacity: 0.5;
    }
  }

  &__rating-text {
    @include label-base;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    color: #667085;
    text-align: center;
    margin: 5px 0 10px 0;
    min-height: 24px; // Para evitar saltos de layout
  }

  &__textarea {
    width: 100%;
    height: 128px;
    padding: 10px 14px;
    border: 1px solid #d0d5dd;
    border-radius: 8px;
    font-family: inherit;
    font-size: 16px;
    line-height: 24px;
    color: $color-foreground;
    box-shadow: 0px 1px 2px 0px #1018280d;
    resize: vertical;
    transition:
      opacity 0.2s ease,
      border-color 0.2s ease;

    &::placeholder {
      color: #667085;
    }

    &:focus:not(:disabled) {
      outline: none;
      border-color: #3541b4;
      box-shadow: 0 0 0 4px rgba(53, 65, 180, 0.1);
    }

    &--disabled {
      opacity: 0.6;
      cursor: not-allowed;
      background-color: #f9fafb;
    }
  }

  &__footer {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__step {
    &--text {
      @include label-base;
      font-weight: 400;
      font-size: 16px;
      line-height: 24px;
      color: #667085;
    }
  }

  &__buttons {
    display: flex;
    gap: 12px;
  }

  &__loading {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  &__button {
    &--outline {
      @include outline-button;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    &--primary {
      @include primary-button;

      &:disabled {
        opacity: 0.8;
        cursor: not-allowed;
      }
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
