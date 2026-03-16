<template>
  <AtomsModalBase
    :is-open="isVisible"
    size="extra-small"
    class="credit-confirmation"
    role="alertdialog"
    aria-labelledby="credit-confirmation-title"
    aria-describedby="credit-confirmation-description"
    @close="dismiss"
  >
    <div class="credit-confirmation__body">
      <h2 id="credit-confirmation-title" class="credit-confirmation__heading">
        Confirmar uso de código
      </h2>

      <p
        id="credit-confirmation-description"
        class="credit-confirmation__description"
      >
        ¿Desea confirmar el canje del código válido por un crédito de
        <strong class="credit-confirmation__amount">
          {{ formatCurrency(approvedAmount, { decimalPlaces: 0 }) }} </strong
        >?
      </p>

      <div
        v-if="errorFeedback"
        class="credit-confirmation__alert"
        role="alert"
        aria-live="assertive"
      >
        {{ errorFeedback }}
      </div>
    </div>

    <template #footer>
      <div class="credit-confirmation__actions">
        <button
          class="credit-confirmation__action credit-confirmation__action--secondary"
          :disabled="isProcessing"
          aria-label="Cancelar confirmación"
          @click="dismiss"
        >
          No
        </button>
        <button
          class="credit-confirmation__action credit-confirmation__action--primary"
          :disabled="isProcessing"
          :aria-busy="isProcessing"
          aria-label="Confirmar uso de código"
          @click="confirmCreditUsage"
        >
          {{ isProcessing ? "Procesando..." : "Sí" }}
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useAppointmentCredit } from "@/composables/api";
import { useMedicalModalManager } from "@/composables/useMedicalModalManager";

interface CreditConfirmationPayload {
  creditId: number;
  creditAmount: number;
  onSuccess?: () => void;
}

const MODAL_KEY = "confirmarCodigo" as const;

const { isOpen, closeModal, getSharedData } = useMedicalModalManager();
const { updateAppointmentCredit } = useAppointmentCredit();
const { formatCurrency } = useFormat();
const toast = useToast();

const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");

const isVisible = computed(() => isOpen[MODAL_KEY]);

const sharedPayload = computed(() =>
  getSharedData<CreditConfirmationPayload>(MODAL_KEY),
);

const creditId = computed(() => sharedPayload.value?.creditId ?? null);
const approvedAmount = computed(() => sharedPayload.value?.creditAmount ?? 0);

const isProcessing = ref(false);
const errorFeedback = ref("");

function resetInternalState(): void {
  isProcessing.value = false;
  errorFeedback.value = "";
}

function dismiss(): void {
  if (isProcessing.value) return;

  closeModal(MODAL_KEY);
  resetInternalState();
}

async function confirmCreditUsage(): Promise<void> {
  errorFeedback.value = "";

  if (!creditId.value) {
    errorFeedback.value = "No se encontró el crédito a confirmar.";
    return;
  }

  isProcessing.value = true;

  try {
    const { error } = await updateAppointmentCredit(
      { already_been_used: 1 },
      creditId.value,
    );

    if (error) {
      errorFeedback.value =
        error.info || "Error al confirmar el uso del crédito.";
      return;
    }

    await refreshAppointments?.();
    sharedPayload.value?.onSuccess?.();
    toast.success("Código confirmado exitosamente.");
    dismiss();
  } catch {
    errorFeedback.value =
      "Error inesperado al confirmar el crédito. Intente nuevamente.";
  } finally {
    isProcessing.value = false;
  }
}

watch(isVisible, (opened) => {
  if (!opened) {
    resetInternalState();
  }
});
</script>

<style lang="scss" scoped>
.credit-confirmation {
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

  &__description {
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

    &--secondary {
      @include outline-button;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    &--primary {
      @include primary-button;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
}
</style>
