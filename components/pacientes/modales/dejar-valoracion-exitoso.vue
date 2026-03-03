<template>
  <AtomsModalBase
    :is-open="isModalVisible"
    size="small"
    :close-on-backdrop="false"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
    role="dialog"
    aria-modal="true"
    aria-labelledby="review-success-heading"
    aria-describedby="review-success-description"
    @close="emitCloseModal('leaveReviewSuccess')"
  >
    <section class="review-success__body">
      <div class="review-success__icon-container">
        <AtomsIconsCheckIcon
          size="24"
          class="review-success__icon"
          aria-hidden="true"
        />
      </div>

      <div class="review-success__message-group">
        <h2 id="review-success-heading" class="review-success__heading">
          ¡Gracias por dejarnos tu reseña!
        </h2>
        <p id="review-success-description" class="review-success__description">
          Esto nos ayudará a mejorar el servicio
        </p>
      </div>
    </section>

    <template #footer>
      <nav
        class="review-success__actions"
        aria-label="Opciones tras enviar reseña"
      >
        <button
          class="review-success__btn review-success__btn--outline"
          @click="navigateToHome"
        >
          Ir al home
        </button>
        <button
          class="review-success__btn review-success__btn--primary"
          @click="emitCloseModal('leaveReviewSuccess')"
        >
          Seguir en citas
        </button>
      </nav>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useLogger } from "@/composables/useLogger";

const router = useRouter();
const logger = useLogger("ReviewSuccessModal");

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

const isModalVisible = computed({
  get: () => props.isOpen,
  set: (value: boolean) => {
    if (!value) {
      emitCloseModal("leaveReviewSuccess");
    }
  },
});

function emitCloseModal(modalName: ModalName): void {
  emit("close-modal", modalName);
}

async function navigateToHome(): Promise<void> {
  try {
    emitCloseModal("leaveReviewSuccess");
    await router.push("/pacientes/inicio");
  } catch (error) {
    logger.error("Error al navegar al inicio tras reseña exitosa.", {
      appointmentId: props.appointment.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
</script>

<style lang="scss" scoped>
.review-success {
  &__body {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1.5rem;
    gap: 1.25rem;
  }

  &__icon-container {
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

  &__message-group {
    text-align: center;
  }

  &__heading {
    @include label-base;
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 2rem;
    text-align: center;
    color: $color-foreground;
    margin-bottom: 0.5rem;
  }

  &__description {
    @include label-base;
    display: block;
    font-weight: 500;
    font-size: 1rem;
    line-height: 1.5rem;
    text-align: center;
    color: $color-text-secondary;
  }

  &__actions {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.75rem;
  }

  &__btn {
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
