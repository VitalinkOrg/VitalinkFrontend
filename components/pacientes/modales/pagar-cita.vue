<template>
  <AtomsModalBase
    :is-open="isModalVisible"
    title="Pagar Cita"
    size="large"
    :show-close-button="false"
    @close="handleDismiss"
  >
    <template #title>
      <AtomsIconsCreditCardIcon
        size="24"
        class="pay-appointment__header-icon"
        aria-hidden="true"
      />
    </template>

    <section
      class="pay-appointment"
      role="dialog"
      aria-labelledby="pay-appointment-title"
      aria-describedby="pay-appointment-description"
    >
      <header class="pay-appointment__header">
        <h2 id="pay-appointment-title" class="pay-appointment__title">
          Detalles del pago
        </h2>
        <p
          id="pay-appointment-description"
          class="pay-appointment__description"
        >
          Confirma los datos de tu cita médica y procede al pago de forma
          segura.
        </p>
      </header>

      <h3 class="pay-appointment__section-title">Resumen de pago</h3>

      <table
        class="pay-appointment__summary"
        aria-label="Desglose del monto a pagar"
      >
        <tbody>
          <tr class="pay-appointment__summary-row">
            <th scope="row" class="pay-appointment__summary-label">
              Subtotal:
            </th>
            <td class="pay-appointment__summary-value">
              {{ displaySubtotal }}
            </td>
          </tr>

          <tr class="pay-appointment__summary-row">
            <th scope="row" class="pay-appointment__summary-label">
              Descuento:
            </th>
            <td class="pay-appointment__summary-value">
              {{ displayDiscount }}
            </td>
          </tr>

          <tr v-if="isCreditApproved" class="pay-appointment__summary-row">
            <th scope="row" class="pay-appointment__summary-label">
              Monto del crédito:
            </th>
            <td class="pay-appointment__summary-value">
              -{{ displayCreditAmount }}
            </td>
          </tr>

          <tr
            class="pay-appointment__summary-row pay-appointment__summary-row--total"
          >
            <th scope="row" class="pay-appointment__summary-label">
              Saldo a pagar:
            </th>
            <td class="pay-appointment__summary-value">
              {{ displayBalanceDue }}
            </td>
          </tr>
        </tbody>
      </table>

      <div
        v-if="errorMessage"
        class="pay-appointment__alert"
        role="alert"
        aria-live="assertive"
      >
        <p class="pay-appointment__alert-text">{{ errorMessage }}</p>
        <button
          type="button"
          class="pay-appointment__alert-action"
          @click="clearError"
        >
          Cerrar
        </button>
      </div>

      <nav
        class="pay-appointment__actions"
        role="group"
        aria-label="Acciones de pago"
      >
        <button
          type="button"
          class="pay-appointment__button pay-appointment__button--secondary"
          :disabled="isSubmitting"
          @click="handleDismiss"
        >
          Atrás
        </button>

        <button
          type="button"
          class="pay-appointment__button pay-appointment__button--primary"
          :disabled="isSubmitting || !canProceedWithPayment"
          :aria-busy="isSubmitting"
          @click="handleConfirmPayment"
        >
          <span v-if="!isSubmitting">Confirmar pago</span>
          <span v-else class="pay-appointment__loader" aria-live="polite">
            <span class="pay-appointment__loader-spinner" aria-hidden="true" />
            Procesando...
          </span>
        </button>
      </nav>
    </section>
  </AtomsModalBase>
</template>

<script setup lang="ts">
interface Props {
  appointment: IAppointment;
  isOpen: boolean;
}

interface Emits {
  (event: "open-modal", modalName: ModalName, payload?: unknown): void;
  (event: "close-modal", modalName: ModalName): void;
  (event: "refresh"): void;
}

const CREDIT_APPROVED_STATUSES = new Set(["APPROVED", "APPROVED_PERCENTAGE"]);

const VALORATION_TYPE_CODE = "VALORATION_APPOINTMENT";

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const config = useRuntimeConfig();
const { getToken } = useAuthToken();
const { formatCurrency } = useFormat();
const logger = useLogger("PayAppointmentModal");
const toast = useToast();
const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");

const isSubmitting = ref(false);
const errorMessage = ref("");

const isModalVisible = computed(() => props.isOpen);

const isValoration = computed(
  () => props.appointment.appointment_type.code === VALORATION_TYPE_CODE,
);

const subtotal = computed(() =>
  isValoration.value
    ? Number(props.appointment.package.product.value2)
    : Number(props.appointment.price_procedure),
);

const approvedCreditAmount = computed(
  () => Number(props.appointment.appointment_credit?.approved_amount) || 0,
);

const isCreditApproved = computed(() => {
  if (isValoration.value) return false;
  const statusCode = props.appointment.appointment_credit?.credit_status.code;
  return statusCode ? CREDIT_APPROVED_STATUSES.has(statusCode) : false;
});

const balanceDue = computed(() => {
  if (isValoration.value) {
    return Number(props.appointment.package.discount ?? 0);
  }

  return Number(props.appointment.price_procedure) - approvedCreditAmount.value;
});

const canProceedWithPayment = computed(
  () => balanceDue.value > 0 && Number.isFinite(balanceDue.value),
);

const displaySubtotal = computed(() =>
  formatCurrency(subtotal.value, { decimalPlaces: 0 }),
);

const displayDiscount = computed(() => {
  if (props.appointment.appointment_type.code === "PROCEDURE_APPOINTMENT") {
    return formatCurrency(0, { decimalPlaces: 0 });
  }

  const value2 = Number(props.appointment.package.product.value2 ?? 0);
  const vitalink = Number(props.appointment.package.discount ?? 0);

  const discount = value2 - vitalink;

  return formatCurrency(discount, { decimalPlaces: 0 });
});

const displayCreditAmount = computed(() =>
  formatCurrency(approvedCreditAmount.value, { decimalPlaces: 0 }),
);

const displayBalanceDue = computed(() =>
  formatCurrency(balanceDue.value, { decimalPlaces: 0 }),
);

function resolveEndpoint(): string {
  return isValoration.value
    ? "/appointment/success_payment_valoration_appointment"
    : "/appointment/success_payment_procedure";
}

function clearError(): void {
  errorMessage.value = "";
}

function emitOpenModal(modalName: ModalName, payload?: unknown): void {
  emit("open-modal", modalName, payload);
}

function emitCloseModal(modalName: ModalName): void {
  emit("close-modal", modalName);
}

function handleDismiss(): void {
  if (isSubmitting.value) return;
  clearError();
  emitCloseModal("payAppointment");
}

async function handleConfirmPayment(): Promise<void> {
  if (!canProceedWithPayment.value) {
    errorMessage.value = "El monto a pagar no es válido.";
    return;
  }

  try {
    isSubmitting.value = true;
    clearError();

    await submitPaymentUpdate();

    if (refreshAppointments) {
      await refreshAppointments();
    }

    emitCloseModal("appointmentDetails");
    emitCloseModal("payAppointment");
    emitOpenModal("successfulPayment", {
      amountPaid: balanceDue.value,
    });

    toast.success("Pago realizado exitosamente.");
  } catch (error: unknown) {
    const fallback = "Ocurrió un error inesperado. Intenta nuevamente.";
    errorMessage.value = error instanceof Error ? error.message : fallback;

    logger.error("Error al confirmar el pago", {
      appointmentId: props.appointment.id,
      error: errorMessage.value,
    });
  } finally {
    isSubmitting.value = false;
  }
}

async function submitPaymentUpdate(): Promise<void> {
  const token = getToken();
  if (!token) {
    throw new Error("Tu sesión ha expirado. Inicia sesión nuevamente.");
  }

  const baseUrl = config.public.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("No se pudo conectar con el servidor.");
  }

  const endpoint = resolveEndpoint();
  const url = `${baseUrl}${endpoint}`;

  const { error } = await useFetch(url, {
    method: "PUT",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    params: { id: props.appointment.id },
    body: {
      payment_method_code: "CREDIT_CARD",
    },
  });

  if (error.value) {
    const serverDetail = (error.value as any).data?.message;
    throw new Error(
      serverDetail || "No se pudo procesar el pago. Intenta nuevamente.",
    );
  }

  logger.info("Pago actualizado exitosamente", {
    appointmentId: props.appointment.id,
    amount: balanceDue.value,
  });
}

watch(isModalVisible, (open) => {
  if (!open) {
    isSubmitting.value = false;
    clearError();
  }
});
</script>

<style lang="scss" scoped>
.pay-appointment {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  gap: 1.25rem;

  &__header-icon {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background: #f4ebff;
    border: 0.5rem solid #f9f5ff;
    color: $color-primary;
  }

  &__header {
    display: flex;
    flex-direction: column;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 1.125rem;
    line-height: 1.75rem;
    color: #101828;
    margin: 0;
  }

  &__description {
    @include label-base;
    font-family: Montserrat, sans-serif;
    font-weight: 400;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: $color-text-muted;
    margin-top: 0.25rem;
  }

  &__section-title {
    @include label-base;
    font-weight: 700;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #353e5c;
    margin-top: 1rem;
    margin-bottom: 0;
  }

  &__summary {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  &__summary-row {
    td,
    th {
      padding: 0.625rem 0;
      border-bottom: 1px solid #f3f4f6;
    }

    &--total {
      border-top: 2px solid #e4e7ec;

      td,
      th {
        padding-top: 1rem;
        padding-bottom: 0.5rem;
        font-weight: 700;
        border-bottom: none;
      }
    }
  }

  &__summary-label {
    font-family: $font-family-main;
    font-weight: 400;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: $color-text-secondary;
    vertical-align: middle;
    text-align: left;
  }

  &__summary-value {
    font-family: $font-family-main;
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.25rem;
    text-align: right;
    vertical-align: middle;
    color: $color-foreground;
  }

  &__alert {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  &__alert-text {
    color: $color-error;
    font-size: 0.875rem;
    font-weight: 500;
    margin: 0;
    text-align: center;
    padding: 0.875rem;
    background: rgba(239, 68, 68, 0.08);
    border-radius: 0.5rem;
    border: 1px solid rgba(239, 68, 68, 0.2);
    width: 100%;
  }

  &__alert-action {
    @include outline-button;
    flex: initial;
    padding: 0.375rem 1rem;
    font-size: 0.8125rem;
    color: $color-error;
    border-color: rgba(239, 68, 68, 0.3);

    &:hover {
      background: rgba(239, 68, 68, 0.05);
    }
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  &__button {
    flex: 1;
    padding: 0.625rem 1.125rem;
    font-size: 0.9375rem;
    cursor: pointer;
    transition: opacity 0.2s ease;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &--primary {
      @include primary-button;
    }

    &--secondary {
      @include outline-button;
    }
  }

  &__loader {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  &__loader-spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 0.125rem solid rgba(155, 81, 224, 0.2);
    border-top-color: $color-primary;
    border-radius: 50%;
    animation: pay-appointment-spin 1s linear infinite;
  }
}

@keyframes pay-appointment-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .pay-appointment {
    padding: 1rem;
  }
}
</style>
