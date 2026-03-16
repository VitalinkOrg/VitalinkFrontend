<template>
  <AtomsModalBase
    :is-open="isVisible"
    title="Pagar Cita"
    size="large"
    :show-close-button="false"
    @close="dismissModal"
  >
    <template #title>
      <AtomsIconsCreditCardIcon
        size="24"
        class="payment-modal__header-icon"
        aria-hidden="true"
      />
    </template>

    <section
      class="payment-modal"
      role="dialog"
      aria-labelledby="payment-modal-title"
      aria-describedby="payment-modal-description"
    >
      <div v-if="!isPaymentGatewayActive" class="payment-modal__summary">
        <header class="payment-modal__summary-header">
          <h2 id="payment-modal-title" class="payment-modal__title">
            Detalles del pago
          </h2>
          <p id="payment-modal-description" class="payment-modal__description">
            Procederás al pago de tu cita médica de forma segura a través de
            Cybersource.
          </p>
        </header>

        <h3 class="payment-modal__section-heading">Resumen de pago</h3>

        <table
          class="payment-modal__breakdown"
          aria-label="Desglose del monto a pagar"
        >
          <tbody>
            <tr class="payment-modal__breakdown-row">
              <th scope="row" class="payment-modal__breakdown-label">
                Subtotal:
              </th>
              <td class="payment-modal__breakdown-value">
                {{ formattedSubtotal }}
              </td>
            </tr>
            <tr class="payment-modal__breakdown-row">
              <th scope="row" class="payment-modal__breakdown-label">
                Descuento:
              </th>
              <td class="payment-modal__breakdown-value">
                {{ formattedDiscount }}
              </td>
            </tr>
            <tr v-if="hasCreditApproved" class="payment-modal__breakdown-row">
              <th scope="row" class="payment-modal__breakdown-label">
                Monto del crédito:
              </th>
              <td class="payment-modal__breakdown-value">
                -{{ formattedCreditAmount }}
              </td>
            </tr>
            <tr
              class="payment-modal__breakdown-row payment-modal__breakdown-row--total"
            >
              <th scope="row" class="payment-modal__breakdown-label">
                Saldo a pagar:
              </th>
              <td class="payment-modal__breakdown-value">
                {{ formattedBalanceDue }}
              </td>
            </tr>
          </tbody>
        </table>

        <div
          class="payment-modal__actions"
          role="group"
          aria-label="Acciones de pago"
        >
          <button
            type="button"
            class="payment-modal__action payment-modal__action--secondary"
            :disabled="isProcessing"
            @click="dismissModal"
          >
            Atrás
          </button>
          <button
            type="button"
            class="payment-modal__action payment-modal__action--primary"
            :disabled="isProcessing || !isPayableAmount"
            :aria-busy="isProcessing"
            @click="beginPaymentFlow"
          >
            <span v-if="!isProcessing">Continuar al pago</span>
            <span
              v-else
              class="payment-modal__loading-indicator"
              aria-live="polite"
            >
              <span class="payment-modal__spinner" aria-hidden="true" />
              Cargando...
            </span>
          </button>
        </div>
      </div>

      <div
        v-else
        class="payment-modal__gateway-container"
        role="region"
        aria-label="Formulario de pago seguro"
      >
        <iframe
          ref="gatewayIframeRef"
          :src="gatewayUrl"
          :title="'Formulario de pago seguro para la cita #' + appointment.id"
          class="payment-modal__gateway-frame"
          allow="payment"
          sandbox="allow-same-origin allow-scripts allow-forms allow-top-navigation allow-top-navigation-by-user-activation allow-popups allow-popups-to-escape-sandbox allow-modals"
        />
      </div>

      <div
        v-if="userFacingError"
        class="payment-modal__error"
        role="alert"
        aria-live="assertive"
      >
        <p class="payment-modal__error-message">{{ userFacingError }}</p>
        <button
          v-if="isPaymentGatewayActive && !isProcessing"
          type="button"
          class="payment-modal__action payment-modal__action--retry"
          @click="retryPayment"
        >
          Intentar nuevamente
        </button>
      </div>
    </section>
  </AtomsModalBase>
</template>

<script setup lang="ts">
interface Props {
  appointment: IAppointment;
  isOpen: boolean;
}

interface PaymentGatewayMessage {
  type: "PAYMENT_RESULT";
  status: PaymentOutcome;
  reference: string;
  timestamp: string;
}

type PaymentOutcome = "success" | "declined" | "error" | "canceled";

interface Emits {
  (e: "open-modal", modalName: ModalName, data?: unknown): void;
  (e: "close-modal", modalName: ModalName): void;
  (e: "refresh"): void;
}

const APPROVED_CREDIT_STATUSES = new Set(["APPROVED", "APPROVED_PERCENTAGE"]);
const VALORATION_TYPE_CODE = "VALORATION_APPOINTMENT";

const PAYMENT_ERROR_MESSAGES: Record<PaymentOutcome, string> = {
  success: "",
  declined:
    "El pago fue rechazado. Por favor, verifica tus datos e intenta nuevamente.",
  canceled: "El pago fue cancelado.",
  error: "Error al procesar el pago. Por favor, intenta nuevamente.",
};

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const config = useRuntimeConfig();
const { getToken } = useAuthToken();
const { formatCurrency } = useFormat();
const logger = useLogger("PaymentModal");
const toast = useToast();
const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");

const isProcessing = ref(false);
const isPaymentGatewayActive = ref(false);
const gatewayUrl = ref("");
const userFacingError = ref("");
const gatewayIframeRef = ref<HTMLIFrameElement | null>(null);
const transactionReference = ref("");
const isMessageListenerAttached = ref(false);

const isVisible = computed(() => props.isOpen);

const isValorationAppointment = computed(
  () => props.appointment.appointment_type.code === VALORATION_TYPE_CODE,
);

const subtotal = computed(() =>
  isValorationAppointment.value
    ? Number(props.appointment.package.product.value2)
    : Number(props.appointment.price_procedure),
);

const creditAmount = computed(
  () => Number(props.appointment.appointment_credit?.approved_amount) || 0,
);

const hasCreditApproved = computed(() => {
  if (isValorationAppointment.value) return false;
  const statusCode = props.appointment.appointment_credit?.credit_status.code;
  return statusCode ? APPROVED_CREDIT_STATUSES.has(statusCode) : false;
});

const balanceDue = computed(() => {
  if (isValorationAppointment.value) {
    return Number(props.appointment.price_valoration_appointment);
  }
  return Number(props.appointment.price_procedure) - creditAmount.value;
});

const isPayableAmount = computed(
  () => balanceDue.value > 0 && Number.isFinite(balanceDue.value),
);

const formattedSubtotal = computed(() =>
  formatCurrency(subtotal.value, { decimalPlaces: 0 }),
);

const formattedDiscount = computed(() => {
  const formatted = formatCurrency(props.appointment.package.discount, {
    decimalPlaces: 0,
  });
  return formatted || "-";
});

const formattedCreditAmount = computed(() =>
  formatCurrency(creditAmount.value, { decimalPlaces: 0 }),
);

const formattedBalanceDue = computed(() =>
  formatCurrency(balanceDue.value, { decimalPlaces: 0 }),
);

function extractUserIdFromToken(): string {
  const token = getToken();
  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    throw new Error("Token de autenticación inválido");
  }

  const userId = payload.userId || payload.sub || payload.id;
  if (!userId) {
    throw new Error("No se pudo obtener el ID del usuario");
  }

  return String(userId);
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch {
    logger.error("Error al decodificar el token JWT");
    return null;
  }
}

function openModal(modalName: ModalName, data?: unknown): void {
  emit("open-modal", modalName, data);
}

function closeModal(modalName: ModalName): void {
  emit("close-modal", modalName);
}

function dismissModal(): void {
  if (isProcessing.value) return;
  teardownMessageListener();
  closeModal("payAppointment");
}

function buildGatewayUrl(userId: string): string {
  const baseUrl = config.public.API_BASE_URL;
  if (!baseUrl) {
    throw new Error("Configuración de API no disponible");
  }

  const params = new URLSearchParams({
    userId,
    appointmentId: String(props.appointment.id),
    amount: String(balanceDue.value),
  });

  return `${baseUrl}/payment/go?${params.toString()}`;
}

async function beginPaymentFlow(): Promise<void> {
  try {
    userFacingError.value = "";
    isProcessing.value = true;

    if (!isPayableAmount.value) {
      throw new Error("El monto a pagar no es válido");
    }

    const userId = extractUserIdFromToken();
    gatewayUrl.value = buildGatewayUrl(userId);

    logger.info("Iniciando flujo de pago", {
      appointmentId: props.appointment.id,
      amount: balanceDue.value,
    });

    isPaymentGatewayActive.value = true;
    isProcessing.value = false;

    await nextTick();
    attachMessageListener();
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Error al iniciar el proceso de pago";

    logger.error("Error al iniciar el pago", { error: message });
    userFacingError.value = message;
    isProcessing.value = false;
    isPaymentGatewayActive.value = false;
  }
}

function attachMessageListener(): void {
  if (isMessageListenerAttached.value) return;

  window.addEventListener("message", onGatewayMessage);
  isMessageListenerAttached.value = true;

  if (gatewayIframeRef.value) {
    gatewayIframeRef.value.onerror = () => {
      logger.error("Error al cargar el iframe del gateway");
      userFacingError.value = "Error al cargar el formulario de pago";
      isProcessing.value = false;
    };
  }
}

function teardownMessageListener(): void {
  if (!isMessageListenerAttached.value) return;

  window.removeEventListener("message", onGatewayMessage);
  isMessageListenerAttached.value = false;
}

function onGatewayMessage(event: MessageEvent): void {
  if (!event.data || typeof event.data !== "object") return;

  const message = event.data as PaymentGatewayMessage;
  if (message.type !== "PAYMENT_RESULT") return;

  logger.info("Resultado de pago recibido", {
    status: message.status,
    reference: message.reference,
  });

  transactionReference.value = message.reference;
  processPaymentOutcome(message.status, message.reference);
}

function processPaymentOutcome(
  outcome: PaymentOutcome,
  reference: string,
): void {
  if (outcome === "success") {
    confirmPaymentWithServer(reference);
    return;
  }

  userFacingError.value = PAYMENT_ERROR_MESSAGES[outcome];
  isProcessing.value = false;
}

async function confirmPaymentWithServer(reference: string): Promise<void> {
  try {
    isProcessing.value = true;
    userFacingError.value = "";

    const endpoint = isValorationAppointment.value
      ? "/appointment/success_payment"
      : "/appointment/success_payment_procedure";

    const fullUrl = `${config.public.API_BASE_URL}${endpoint}`;

    const { data, error } = await useFetch(fullUrl, {
      method: "PUT",
      headers: {
        Authorization: getToken() ?? "",
        "Content-Type": "application/json",
      },
      params: { id: props.appointment.id },
      body: {
        payment_method_code: "CREDIT_CARD",
        transaction_reference: reference,
      },
    });

    if (error.value) {
      const serverMessage = (error.value as any).data?.message;
      throw new Error(serverMessage || "Error al actualizar la cita");
    }

    logger.info("Pago confirmado exitosamente", { reference });

    if (refreshAppointments) {
      await refreshAppointments();
    }

    closeModal("appointmentDetails");
    closeModal("payAppointment");
    openModal("successfulPayment", {
      amountPaid: balanceDue.value,
      reference,
    });

    toast.success("Pago realizado exitosamente");
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error desconocido";

    logger.error("Error al confirmar pago en servidor", {
      reference,
      error: message,
    });

    userFacingError.value = `El pago fue exitoso pero hubo un error al actualizar la cita. Contacta a soporte con la referencia: ${reference}`;
  } finally {
    isProcessing.value = false;
  }
}

function resetPaymentState(): void {
  isPaymentGatewayActive.value = false;
  transactionReference.value = "";
  gatewayUrl.value = "";
  isProcessing.value = false;
  teardownMessageListener();
}

function retryPayment(): void {
  resetPaymentState();
  userFacingError.value = "";
  beginPaymentFlow();
}

onUnmounted(() => {
  teardownMessageListener();
});

watch(isVisible, (nowOpen) => {
  if (!nowOpen) {
    resetPaymentState();
    userFacingError.value = "";
  }
});
</script>

<style lang="scss" scoped>
.payment-modal {
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

  &__summary {
    display: flex;
    flex-direction: column;
  }

  &__summary-header {
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

  &__section-heading {
    @include label-base;
    font-weight: 700;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #353e5c;
    margin-top: 1rem;
    margin-bottom: 0;
  }

  &__breakdown {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }

  &__breakdown-row {
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

  &__breakdown-label {
    font-family: $font-family-main;
    font-weight: 400;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: $color-text-secondary;
    vertical-align: middle;
    text-align: left;
  }

  &__breakdown-value {
    font-family: $font-family-main;
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.25rem;
    text-align: right;
    vertical-align: middle;
    color: $color-foreground;
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  &__action {
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

    &--retry {
      @include outline-button;
      flex: initial;
      padding: 0.5rem 1.25rem;
      font-size: 0.875rem;
      color: $color-primary;
      border-color: $color-primary;

      &:hover {
        background: rgba(155, 81, 224, 0.05);
      }
    }
  }

  &__gateway-container {
    position: relative;
    width: 100%;
    height: 650px;
    min-height: 650px;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  &__gateway-frame {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 0.5rem;
  }

  &__loading-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  &__spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 0.125rem solid rgba(155, 81, 224, 0.2);
    border-top-color: $color-primary;
    border-radius: 50%;
    animation: payment-modal-spin 1s linear infinite;
  }

  &__error {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
  }

  &__error-message {
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
}

@keyframes payment-modal-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .payment-modal {
    padding: 1rem;

    &__gateway-container {
      height: 550px;
      min-height: 550px;
    }
  }
}
</style>
