<template>
  <AtomsModalBase
    :is-open="isModalVisible"
    title="Dejar una reseña"
    size="medium"
    :close-on-backdrop="!isSubmitting"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
    role="dialog"
    aria-modal="true"
    aria-labelledby="leave-review-heading"
    @close="dismissModal"
  >
    <section class="leave-review__body" aria-live="polite">
      <p class="leave-review__prompt">
        ¿Cómo te sentiste con esta experiencia?
      </p>

      <h2 id="leave-review-heading" class="leave-review__heading">
        {{ stepHeading }}
      </h2>

      <fieldset
        class="leave-review__star-group"
        :aria-label="`Valoración de ${activeStepLabel}: ${activeRating} de 5 estrellas`"
      >
        <legend class="sr-only">
          Selecciona tu valoración para {{ activeStepLabel }}
        </legend>

        <button
          v-for="star in TOTAL_STARS"
          :key="star"
          type="button"
          class="leave-review__star-btn"
          :disabled="isSubmitting"
          :aria-label="`Calificar con ${star} estrella${star > 1 ? 's' : ''}`"
          :aria-pressed="star <= activeRating"
          @click="updateRating(star)"
        >
          <AtomsIconsStarFilled
            v-if="star <= activeRating"
            class="leave-review__star-icon leave-review__star-icon--filled"
            :class="{ 'leave-review__star-icon--disabled': isSubmitting }"
            aria-hidden="true"
          />
          <AtomsIconsStarOutline
            v-else
            class="leave-review__star-icon leave-review__star-icon--outline"
            :class="{ 'leave-review__star-icon--disabled': isSubmitting }"
            aria-hidden="true"
          />
        </button>
      </fieldset>

      <label for="review-textarea" class="sr-only">
        Describe tu experiencia con {{ activeStepLabel }}
      </label>
      <textarea
        id="review-textarea"
        v-model="activeReviewText"
        name="review"
        class="leave-review__textarea"
        :class="{ 'leave-review__textarea--disabled': isSubmitting }"
        :disabled="isSubmitting"
        placeholder="Describe tu experiencia"
        rows="5"
      ></textarea>
    </section>

    <template #footer>
      <div class="leave-review__footer">
        <p class="leave-review__step-indicator" aria-live="polite">
          <span class="sr-only">Paso </span>{{ activeStep }} de
          {{ TOTAL_STEPS }}
        </p>

        <div class="leave-review__actions">
          <button
            class="leave-review__btn leave-review__btn--outline"
            :disabled="isFirstStep || isSubmitting"
            :aria-label="'Volver al paso anterior'"
            @click="retreatStep"
          >
            Atrás
          </button>

          <button
            v-if="isFirstStep"
            class="leave-review__btn leave-review__btn--primary"
            :disabled="isSubmitting"
            @click="advanceStep"
          >
            Siguiente
          </button>

          <button
            v-else
            class="leave-review__btn leave-review__btn--primary"
            :disabled="isSubmitting"
            :aria-busy="isSubmitting"
            @click="submitReviews"
          >
            <span v-if="!isSubmitting">Confirmar</span>
            <span v-else class="leave-review__loading-label">
              <span
                class="leave-review__spinner"
                role="status"
                aria-label="Enviando reseña"
              ></span>
              Enviando reseña...
            </span>
          </button>
        </div>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useLogger } from "@/composables/useLogger";
import { useToast } from "@/composables/useToast";

const logger = useLogger("LeaveReviewModal");
const toast = useToast();

const TOTAL_STARS = 5;
const TOTAL_STEPS = 2;
const DEFAULT_RATING = 5;

interface Props {
  appointment: IAppointment;
  isOpen: boolean;
}

interface Emits {
  (e: "open-modal", modalName: ModalName, appointmentId?: number): void;
  (e: "close-modal", modalName: ModalName): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const activeStep = ref(1);
const isSubmitting = ref(false);

const doctorRating = ref(DEFAULT_RATING);
const doctorReviewText = ref("");
const vitalinkRating = ref(DEFAULT_RATING);
const vitalinkReviewText = ref("");

const isFirstStep = computed(() => activeStep.value === 1);
const isLastStep = computed(() => activeStep.value === TOTAL_STEPS);

const activeStepLabel = computed(() =>
  isFirstStep.value ? "tu Doctora" : "tu Vitalink",
);

const stepHeading = computed(() =>
  isFirstStep.value
    ? "Déjanos una valoración sobre tu experiencia con tu Doctora"
    : "Déjanos una valoración sobre tu experiencia con tu Vitalink",
);

const activeRating = computed({
  get: () => (isFirstStep.value ? doctorRating.value : vitalinkRating.value),
  set: (value: number) => {
    if (isFirstStep.value) {
      doctorRating.value = value;
    } else {
      vitalinkRating.value = value;
    }
  },
});

const activeReviewText = computed({
  get: () =>
    isFirstStep.value ? doctorReviewText.value : vitalinkReviewText.value,
  set: (value: string) => {
    if (isFirstStep.value) {
      doctorReviewText.value = value;
    } else {
      vitalinkReviewText.value = value;
    }
  },
});

const isModalVisible = computed({
  get: () => props.isOpen,
  set: (value: boolean) => {
    if (!value && !isSubmitting.value) {
      emit("close-modal", "leaveReview");
    }
  },
});

function updateRating(stars: number): void {
  if (isSubmitting.value) return;
  activeRating.value = stars;
}

function advanceStep(): void {
  if (isLastStep.value || isSubmitting.value) return;
  activeStep.value++;
}

function retreatStep(): void {
  if (isFirstStep.value || isSubmitting.value) return;
  activeStep.value--;
}

function resetFormState(): void {
  activeStep.value = 1;
  doctorRating.value = DEFAULT_RATING;
  doctorReviewText.value = "";
  vitalinkRating.value = DEFAULT_RATING;
  vitalinkReviewText.value = "";
  isSubmitting.value = false;
}

function dismissModal(): void {
  if (isSubmitting.value) return;
  resetFormState();
  emit("close-modal", "leaveReview");
}

async function submitReviews(): Promise<void> {
  if (isSubmitting.value) return;

  isSubmitting.value = true;

  const payload = {
    appointmentId: props.appointment.id,
    doctor: {
      rating: doctorRating.value,
      review: doctorReviewText.value,
    },
    vitalink: {
      rating: vitalinkRating.value,
      review: vitalinkReviewText.value,
    },
  };

  try {
    // TODO: Reemplazar con llamada real al API de reseñas
    await new Promise((resolve) => setTimeout(resolve, 2500));

    logger.info("Reseñas enviadas exitosamente.", { payload });

    resetFormState();
    emit("close-modal", "leaveReview");
    emit("open-modal", "leaveReviewSuccess");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    logger.error("Error al enviar las reseñas.", {
      appointmentId: props.appointment.id,
      error: message,
    });

    toast.error("No se pudieron enviar las reseñas. Intenta nuevamente.");
  } finally {
    isSubmitting.value = false;
  }
}

watch(
  () => props.isOpen,
  (opened) => {
    if (opened) resetFormState();
  },
);
</script>

<style lang="scss" scoped>
.sr-only {
  @include visually-hidden;
}

.leave-review {
  &__body {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.625rem;
    padding: 1.25rem 1.5rem;
  }

  &__prompt {
    @include label-base;
    font-weight: 600;
    font-size: 1rem;
    line-height: 1.75rem;
    color: $color-primary;
    text-align: center;
  }

  &__heading {
    @include label-base;
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 2.3125rem;
    letter-spacing: -0.0625rem;
    text-align: center;
    color: #353e5c;
    max-width: 22.5rem;
  }

  &__star-group {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    max-width: 22.5rem;
    width: 100%;
    margin: 0.625rem 0;
    border: none;
    padding: 0;
  }

  &__star-btn {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    border-radius: 0.25rem;
    transition: transform 0.2s ease;

    &:hover:not(:disabled) {
      transform: scale(1.1);
    }

    &:focus-visible {
      outline: 0.125rem solid $color-primary;
      outline-offset: 0.125rem;
    }

    &:active:not(:disabled) {
      transform: scale(0.95);
    }

    &:disabled {
      cursor: not-allowed;
    }
  }

  &__star-icon {
    width: 2.5rem;
    height: 2.5rem;
    transition:
      color 0.2s ease,
      opacity 0.2s ease;

    &--filled {
      color: #fdb022;
    }

    &--outline {
      color: #d0d5dd;
    }

    &--disabled {
      opacity: 0.5;
    }
  }

  &__textarea {
    width: 100%;
    height: 8rem;
    padding: 0.625rem 0.875rem;
    border: 0.0625rem solid #d0d5dd;
    border-radius: 0.5rem;
    font-family: inherit;
    font-size: 1rem;
    line-height: 1.5rem;
    color: $color-foreground;
    box-shadow: 0 0.0625rem 0.125rem 0 rgba(16, 24, 40, 0.05);
    resize: vertical;
    transition:
      opacity 0.2s ease,
      border-color 0.2s ease;

    &::placeholder {
      color: $color-text-muted;
    }

    &:focus:not(:disabled) {
      outline: none;
      border-color: $color-primary;
      box-shadow: 0 0 0 0.25rem rgba(53, 65, 180, 0.1);
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

  &__step-indicator {
    @include label-base;
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.5rem;
    color: $color-text-muted;
  }

  &__actions {
    display: flex;
    gap: 0.75rem;
  }

  &__loading-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__spinner {
    width: 0.875rem;
    height: 0.875rem;
    border: 0.125rem solid rgba(255, 255, 255, 0.3);
    border-top-color: $white;
    border-radius: 50%;
    animation: leave-review-spin 1s linear infinite;
  }

  &__btn {
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

@keyframes leave-review-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
