<template>
  <AtomsModalBase
    :is-open="props.isOpen"
    title="Anular Cita"
    size="extra-small"
    @close="handleCloseModal('cancelAppointment')"
  >
    <template #title>
      <div
        class="cancel-modal__icon"
        role="img"
        aria-label="Ícono de cancelación"
      >
        <AtomsIconsCircleXIcon size="15" aria-hidden="true" />
      </div>
    </template>

    <div class="cancel-modal__body">
      <h2 id="cancel-modal-heading" class="cancel-modal__title">
        ¿Seguro que quieres anular la cita?
      </h2>
      <p class="cancel-modal__description">Esta acción no puede deshacerse.</p>
    </div>

    <template #footer>
      <div class="cancel-modal__footer" role="group" aria-label="Acciones">
        <button
          class="cancel-modal__btn cancel-modal__btn--outline"
          type="button"
          :disabled="isSubmitting"
          @click="handleCloseModal('cancelAppointment')"
        >
          No, volver
        </button>
        <button
          class="cancel-modal__btn cancel-modal__btn--danger"
          type="button"
          :disabled="isSubmitting"
          :aria-busy="isSubmitting"
          @click="confirmCancellation"
        >
          <template v-if="isSubmitting">
            <span class="cancel-modal__spinner" aria-hidden="true" />
            Cancelando…
          </template>
          <template v-else> Sí, cancelar </template>
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useAppointment } from "@/composables/api";

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

const { updateAppointment } = useAppointment();
const logger = useLogger("CancelAppointmentModal");
const toast = useToast();

const refreshAppointments = inject<(() => Promise<void>) | undefined>(
  "refreshAppointments",
  undefined,
);

const isSubmitting = ref(false);

const handleCloseModal = (modalName: ModalName): void => {
  emit("close-modal", modalName);
};

async function confirmCancellation(): Promise<void> {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    const { data, error } = await updateAppointment(props.appointment.id, {
      appointment_status_code: "CANCEL_APPOINTMENT",
    });

    if (error) {
      throw new Error(error.info || "Error al anular la cita");
    }

    toast.success("Cita anulada correctamente.");
    await refreshAppointments?.();
    handleCloseModal("cancelAppointment");
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Error al anular la cita";
    logger.error(message, { appointmentId: props.appointment.id });
    toast.error(message);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.cancel-modal {
  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.4375rem;
    height: 2.4375rem;
    border-radius: 50%;
    background: $color-danger;
    border: 0.40625rem solid $color-cancel;
    color: $white;
  }

  &__body {
    max-width: 19.5rem;
    padding: 1.25rem 1.5rem 0;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 1.25rem;
    line-height: 1.875rem;
    color: $color-foreground;
  }

  &__description {
    @include label-base;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: $color-text-secondary;
  }

  &__footer {
    display: flex;
    width: 100%;
    gap: 0.75rem;
  }

  &__btn {
    &--outline {
      @include outline-button;
      width: 100%;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    &--danger {
      @include primary-button;
      width: 100%;
      background-color: $color-danger;
      border-color: $color-danger;

      &:hover:not(:disabled) {
        background-color: darken($color-danger, 8%);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }

  &__spinner {
    display: inline-block;
    width: 0.875rem;
    height: 0.875rem;
    border: 0.125rem solid rgba(255, 255, 255, 0.3);
    border-top-color: $white;
    border-radius: 50%;
    animation: cancel-modal-spin 0.8s linear infinite;
    vertical-align: middle;
    margin-right: 0.375rem;
  }
}

@keyframes cancel-modal-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
