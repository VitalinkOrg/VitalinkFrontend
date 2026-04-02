<template>
  <AtomsModalBase
    :is-open="isVisible"
    size="extra-small"
    class="code-redemption-dialog"
    role="alertdialog"
    aria-labelledby="code-redemption-dialog__title"
    aria-describedby="code-redemption-dialog__description"
    @close="handleDismiss"
  >
    <div class="code-redemption-dialog__body">
      <h2
        id="code-redemption-dialog__title"
        class="code-redemption-dialog__heading"
      >
        Confirmar uso de código
      </h2>

      <p
        id="code-redemption-dialog__description"
        class="code-redemption-dialog__message"
      >
        ¿Desea confirmar el canje del código válido por un crédito de
        <strong class="code-redemption-dialog__amount">
          {{ formatCurrency(creditAmount, { decimalPlaces: 0 }) }} </strong
        >?
      </p>

      <Transition name="fade">
        <div
          v-if="redemptionError"
          class="code-redemption-dialog__alert"
          role="alert"
          aria-live="assertive"
        >
          {{ redemptionError }}
        </div>
      </Transition>
    </div>

    <template #footer>
      <div
        class="code-redemption-dialog__actions"
        role="group"
        aria-label="Acciones de confirmación"
      >
        <button
          type="button"
          class="code-redemption-dialog__action code-redemption-dialog__action--cancel"
          :disabled="isSubmitting"
          aria-label="Cancelar confirmación"
          @click="handleDismiss"
        >
          No
        </button>
        <button
          type="button"
          class="code-redemption-dialog__action code-redemption-dialog__action--confirm"
          :disabled="isSubmitting"
          :aria-busy="isSubmitting"
          aria-label="Confirmar uso de código"
          @click="handleConfirmRedemption"
        >
          <template v-if="isSubmitting">Procesando...</template>
          <template v-else>Sí</template>
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useAppointmentCredit } from "@/composables/api";
import { useLogger } from "@/composables/useLogger";
import { useMedicalModalManager } from "@/composables/useMedicalModalManager";

interface CodeRedemptionPayload {
  creditId: number;
  creditAmount: number;
  onSuccess?: () => void;
}

const MODAL_KEY = "confirmarCodigo" as const;
const PARENT_MODAL_KEY = "detallesCita" as const;

const ERROR_MESSAGES = {
  missingCredit: "No se encontró el crédito a confirmar.",
  updateFailed: "Error al confirmar el uso del crédito.",
  unexpected: "Error inesperado al confirmar el crédito. Intente nuevamente.",
} as const;

const { isOpen, closeModal, getSharedData, setSharedData } =
  useMedicalModalManager();
const { updateAppointmentCredit } = useAppointmentCredit();
const { formatCurrency } = useFormat();
const toast = useToast();
const logger = useLogger("CodeRedemptionDialog");

const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");

const isVisible = computed(() => isOpen[MODAL_KEY]);

const payload = computed(() => getSharedData<CodeRedemptionPayload>(MODAL_KEY));

const targetCreditId = computed(() => payload.value?.creditId ?? null);
const creditAmount = computed(() => payload.value?.creditAmount ?? 0);

const isSubmitting = ref(false);
const redemptionError = ref("");

function clearInternalState(): void {
  isSubmitting.value = false;
  redemptionError.value = "";
}

function handleDismiss(): void {
  if (isSubmitting.value) return;

  closeModal(MODAL_KEY);
  clearInternalState();
}

function closeAllRelatedModals(): void {
  closeModal(MODAL_KEY);
  clearInternalState();
}

function setRedemptionError(message: string): void {
  redemptionError.value = message;
}

async function handleConfirmRedemption(): Promise<void> {
  setRedemptionError("");

  if (!targetCreditId.value) {
    setRedemptionError(ERROR_MESSAGES.missingCredit);
    logger.warn("Attempted redemption without a valid credit ID");
    return;
  }

  isSubmitting.value = true;

  try {
    const { error } = await updateAppointmentCredit(
      { already_been_used: 1 },
      targetCreditId.value,
    );

    if (error) {
      const serverMessage = error.info || ERROR_MESSAGES.updateFailed;
      setRedemptionError(serverMessage);
      logger.error("Credit redemption API error", {
        creditId: targetCreditId.value,
        serverInfo: error.info,
      });
      return;
    }

    const detallesData =
      getSharedData<{ appointment: IAppointment }>(PARENT_MODAL_KEY);
    if (detallesData?.appointment?.appointment_credit) {
      setSharedData(PARENT_MODAL_KEY, {
        ...detallesData,
        appointment: {
          ...detallesData.appointment,
          appointment_credit: {
            ...detallesData.appointment.appointment_credit,
            already_been_used: 1,
          },
        },
      });
    }

    await refreshAppointments?.();
    payload.value?.onSuccess?.();
    toast.success("Código confirmado exitosamente.");
    closeAllRelatedModals();
  } catch (thrown: unknown) {
    setRedemptionError(ERROR_MESSAGES.unexpected);
    logger.error("Unhandled exception during credit redemption", {
      creditId: targetCreditId.value,
      error: thrown instanceof Error ? thrown.message : String(thrown),
    });
  } finally {
    isSubmitting.value = false;
  }
}

watch(isVisible, (opened) => {
  if (!opened) {
    clearInternalState();
  }
});
</script>

<style lang="scss" scoped>
.code-redemption-dialog {
  &__body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__heading {
    @include label-base;
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 2rem;
    color: $color-foreground;
    margin: 0;
  }

  &__message {
    @include label-base;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: $color-text-secondary;
    margin: 0;
  }

  &__amount {
    font-weight: 600;
    color: $color-foreground;
  }

  &__alert {
    @include label-base;
    color: #dc2626;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.75rem;
    background-color: #fef2f2;
    border-radius: 0.375rem;
    border: 1px solid #fecaca;
    margin: 0;
  }

  &__actions {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__action {
    flex: 1;

    &--cancel {
      @include outline-button;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    &--confirm {
      @include primary-button;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
