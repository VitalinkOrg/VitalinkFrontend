<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    title="Pagar Cita"
    size="large"
    :show-close-button="false"
    @close="handleCloseModal('payAppointment')"
  >
    <template #title>
      <AtomsIconsCreditCardIcon size="24" class="pay-appointment-modal__icon" />
    </template>

    <div class="pay-appointment-modal__content">
      <div v-if="!showIframe">
        <div class="d-flex flex-column">
          <h5 class="pay-appointment-modal__content__title">
            Detalles del pago
          </h5>
        </div>

        <p class="pay-appointment-modal__content__subtext">
          Procederás al pago de tu cita médica de forma segura a través de
          Cybersource.
        </p>

        <p class="pay-appointment-modal__content__payment-summary">
          Resumen de pago
        </p>
        <table class="pay-appointment-modal__table">
          <tbody>
            <tr class="pay-appointment-modal__table--row">
              <td class="pay-appointment-modal__table--header">Subtotal:</td>
              <td class="pay-appointment-modal__table--cell">
                {{ formatCurrency(Number(calculateSubtotal())) }}
              </td>
            </tr>
            <tr class="pay-appointment-modal__table--row">
              <td class="pay-appointment-modal__table--header">Descuento:</td>
              <td class="pay-appointment-modal__table--cell">-</td>
            </tr>
            <tr
              class="pay-appointment-modal__table--row"
              v-if="hasCreditAmount()"
            >
              <td class="pay-appointment-modal__table--header">
                Monto del crédito:
              </td>
              <td class="pay-appointment-modal__table--cell">
                -{{ formatCurrency(Number(getCreditAmount())) }}
              </td>
            </tr>
            <tr class="total">
              <td class="pay-appointment-modal__table--header">
                Saldo a pagar:
              </td>
              <td class="pay-appointment-modal__table--cell">
                {{ formatCurrency(Number(balanceToPay(appointment))) }}
              </td>
            </tr>
          </tbody>
        </table>

        <div class="pay-appointment-modal__buttons">
          <button
            type="button"
            class="pay-appointment-modal__button--outline"
            :disabled="isLoading"
            @click="handleCloseModal('payAppointment')"
          >
            Atrás
          </button>
          <button
            class="pay-appointment-modal__button--primary"
            @click="initiatePayment"
          >
            <span v-if="!isLoading">Continuar al pago</span>
            <span v-else class="pay-appointment-modal__loading">
              <span class="pay-appointment-modal__spinner"></span>
              Cargando...
            </span>
          </button>
        </div>
      </div>

      <div v-else class="pay-appointment-modal__iframe-container">
        <iframe
          ref="paymentIframe"
          :src="iframeUrl"
          class="pay-appointment-modal__iframe"
          frameborder="0"
          allow="payment"
          sandbox="allow-same-origin allow-scripts allow-forms allow-top-navigation allow-top-navigation-by-user-activation allow-popups allow-popups-to-escape-sandbox allow-modals"
        ></iframe>
      </div>

      <div v-if="errorMessage" class="pay-appointment-modal__error-container">
        <p class="pay-appointment-modal__error">{{ errorMessage }}</p>
        <button
          v-if="showIframe && !isLoading"
          class="pay-appointment-modal__retry-button"
          @click="resetAndRetry"
        >
          Intentar nuevamente
        </button>
      </div>
    </div>
  </AtomsModalBase>
</template>

<script setup lang="ts">
import type { ModalName } from "~/types";
import type { Appointment } from "~/types/appointment";

interface Props {
  appointment: Appointment;
  isOpen: boolean;
}

interface PaymentResultMessage {
  type: "PAYMENT_RESULT";
  status: "success" | "declined" | "error" | "canceled";
  reference: string;
  timestamp: string;
}

interface Emits {
  (e: "open-modal", modalName: ModalName, data?: any): void;
  (e: "close-modal", modalName: ModalName): void;
  (e: "refresh"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const config = useRuntimeConfig();
const { getToken } = useAuthToken();
const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");

const isModalOpen = computed(() => props.isOpen);
const isLoading = ref(false);
const showIframe = ref(false);
const iframeUrl = ref("");
const errorMessage = ref("");
const paymentIframe = ref<HTMLIFrameElement | null>(null);
const currentReference = ref("");
const messageListenerActive = ref(false);

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const parseJWT = (token: string): any => {
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
  } catch (error) {
    console.error("[Payment] Error parsing JWT:", error);
    return null;
  }
};

const getUserId = (): string => {
  const token = getToken();
  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const payload = parseJWT(token);
  if (!payload) {
    throw new Error("Token inválido");
  }

  const userId = payload.userId || payload.sub || payload.id;
  if (!userId) {
    throw new Error("No se pudo obtener el ID del usuario");
  }

  return userId;
};

const calculateSubtotal = () => {
  return props.appointment.appointment_type.code === "VALORATION_APPOINTMENT"
    ? props.appointment.price_valoration_appointment
    : props.appointment.price_procedure;
};

const hasCreditAmount = () => {
  if (props.appointment.appointment_type.code === "VALORATION_APPOINTMENT") {
    return false;
  }

  const creditStatus = props.appointment.appointment_credit?.credit_status.code;
  return creditStatus === "APPROVED" || creditStatus === "APPROVED_PERCENTAGE";
};

const getCreditAmount = () => {
  return props.appointment.appointment_credit?.approved_amount || 0;
};

const balanceToPay = (appointment: Appointment) => {
  if (appointment.appointment_type.code === "VALORATION_APPOINTMENT") {
    return appointment.price_valoration_appointment;
  }
  return (
    Number(appointment.price_procedure) -
    Number(appointment.appointment_credit?.approved_amount ?? 0)
  );
};

const canProceedToPayment = () => {
  const amount = balanceToPay(props.appointment);
  return Number(amount) > 0 && Number.isFinite(amount);
};

const handleOpenModal = (modalName: ModalName, data?: any): void => {
  emit("open-modal", modalName, data);
};

const handleCloseModal = (modalName: ModalName): void => {
  if (!isLoading.value) {
    cleanupMessageListener();
    emit("close-modal", modalName);
  }
};

const initiatePayment = async () => {
  try {
    errorMessage.value = "";
    isLoading.value = true;

    const userId = getUserId();
    const amount = balanceToPay(props.appointment);
    const appointmentId = props.appointment.id;

    if (!canProceedToPayment()) {
      throw new Error("Monto inválido para el pago");
    }

    const baseUrl = config.public.API_BASE_URL;
    if (!baseUrl) {
      throw new Error("Configuración de API no disponible");
    }

    const params = new URLSearchParams({
      userId: userId.toString(),
      appointmentId: appointmentId.toString(),
      amount: amount.toString(),
    });

    iframeUrl.value = `${baseUrl}/payment/go?${params.toString()}`;

    console.log("[Payment] Iniciando pago", {
      userId,
      appointmentId,
      amount,
      url: iframeUrl.value,
    });

    showIframe.value = true;
    isLoading.value = false;

    await nextTick();
    setupMessageListener();
  } catch (error: any) {
    console.error("[Payment] Error al iniciar:", error);
    errorMessage.value = error.message || "Error al iniciar el proceso de pago";
    isLoading.value = false;
    showIframe.value = false;
  }
};

const setupMessageListener = () => {
  if (messageListenerActive.value) {
    console.log("[Payment] Listener ya está activo");
    return;
  }

  console.log("[Payment] Configurando listener de mensajes");
  window.addEventListener("message", handleIframeMessage);
  messageListenerActive.value = true;

  if (paymentIframe.value) {
    paymentIframe.value.onload = () => {
      console.log("[Payment] Iframe cargado exitosamente");
    };

    paymentIframe.value.onerror = (error) => {
      console.error("[Payment] Error en iframe:", error);
      errorMessage.value = "Error al cargar el formulario de pago";
      isLoading.value = false;
    };
  }
};

const cleanupMessageListener = () => {
  if (messageListenerActive.value) {
    console.log("[Payment] Limpiando listener de mensajes");
    window.removeEventListener("message", handleIframeMessage);
    messageListenerActive.value = false;
  }
};

const handleIframeMessage = (event: MessageEvent) => {
  console.log("[Payment] Mensaje recibido del iframe");
  console.log("[Payment] Origen:", event.origin);
  console.log("[Payment] Data:", event.data);

  if (!event.data || typeof event.data !== "object") {
    console.log("[Payment] Ignorando mensaje - no es objeto válido");
    return;
  }

  const message = event.data as PaymentResultMessage;

  if (message.type !== "PAYMENT_RESULT") {
    console.log("[Payment] Ignorando mensaje - tipo:", message.type);
    return;
  }

  console.log("[Payment] Mensaje de pago válido:", message);

  currentReference.value = message.reference;

  handlePaymentResult(message.status, message.reference);
};

const handlePaymentResult = (
  status: "success" | "declined" | "error" | "canceled",
  reference: string,
) => {
  console.log(`[Payment] Procesando resultado: ${status}`);
  console.log("[Payment] Referencia:", reference);

  switch (status) {
    case "success":
      handleSuccessfulPayment(reference);
      break;

    case "declined":
      errorMessage.value =
        "El pago fue rechazado. Por favor, verifica tus datos e intenta nuevamente.";
      isLoading.value = false;
      break;

    case "canceled":
      errorMessage.value = "Pago cancelado";
      isLoading.value = false;
      break;

    case "error":
    default:
      errorMessage.value =
        "Error al procesar el pago. Por favor, intenta nuevamente.";
      isLoading.value = false;
      break;
  }
};

const handleSuccessfulPayment = async (reference: string) => {
  try {
    isLoading.value = true;
    errorMessage.value = "";

    console.log("[Payment] Procesando pago exitoso:", reference);

    const amountPaid = balanceToPay(props.appointment);

    const appointmentType =
      props.appointment.appointment_type.code === "VALORATION_APPOINTMENT"
        ? "VALORATION_APPOINTMENT"
        : "PROCEDURE";

    const endpoint =
      appointmentType === "VALORATION_APPOINTMENT"
        ? "/appointment/success_payment"
        : "/appointment/success_payment_procedure";

    const fullUrl = `${config.public.API_BASE_URL}${endpoint}`;

    console.log("[Payment] Llamando a:", fullUrl);

    const { data, error } = await useFetch(fullUrl, {
      method: "PUT",
      headers: {
        Authorization: getToken() ?? "",
        "Content-Type": "application/json",
      },
      params: {
        id: props.appointment.id,
      },
      body: {
        payment_method_code: "CREDIT_CARD",
        transaction_reference: reference,
      },
    });

    if (error.value) {
      console.error("[Payment] Error en API:", error.value);
      throw new Error(
        error.value.data?.message || "Error al actualizar la cita",
      );
    }

    console.log("[Payment] Pago actualizado exitosamente");

    if (refreshAppointments) {
      await refreshAppointments();
    }

    handleCloseModal("appointmentDetails");
    handleCloseModal("payAppointment");
    handleOpenModal("successfulPayment", {
      amountPaid,
      reference,
    });
  } catch (error: any) {
    console.error("[Payment] Error al actualizar cita:", error);
    errorMessage.value = `El pago fue exitoso pero hubo un error al actualizar la cita. Contacta a soporte con la referencia: ${reference}`;
  } finally {
    isLoading.value = false;
  }
};

const resetPaymentState = () => {
  showIframe.value = false;
  currentReference.value = "";
  iframeUrl.value = "";
  isLoading.value = false;
  cleanupMessageListener();
};

const resetAndRetry = () => {
  resetPaymentState();
  errorMessage.value = "";
  initiatePayment();
};

onUnmounted(() => {
  cleanupMessageListener();
});

watch(isModalOpen, (newValue) => {
  if (!newValue) {
    resetPaymentState();
    errorMessage.value = "";
  }
});
</script>

<style lang="scss" scoped>
.pay-appointment-modal {
  &__icon {
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background: #f4ebff;
    border: 0.5rem solid #f9f5ff;
    color: $color-primary;
  }

  &__content {
    display: flex;
    flex-direction: column;
    padding: 1.5rem;
    gap: 1.25rem;

    &__title {
      @include label-base;
      font-weight: 600;
      font-size: 1.125rem;
      line-height: 1.75rem;
      color: #101828;
    }

    &__subtext {
      @include label-base;
      font-family: Montserrat;
      font-weight: 400;
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: $color-text-muted;
    }

    &__payment-summary {
      @include label-base;
      font-weight: 700;
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: #353e5c;
      margin-top: 1rem;
    }
  }

  &__iframe-container {
    position: relative;
    width: 100%;
    height: 650px;
    min-height: 650px;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  &__iframe {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 0.5rem;
  }

  &__loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__spinner {
    width: 1rem;
    height: 1rem;
    border: 0.125rem solid rgba(155, 81, 224, 0.2);
    border-top: 0.125rem solid $color-primary;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;

    &--row {
      &:not(.total) {
        td {
          padding: 0.625rem 0;
          border-bottom: 1px solid #f3f4f6;
        }
      }

      &.total {
        border-top: 2px solid #e4e7ec;

        td {
          padding-top: 1rem;
          padding-bottom: 0.5rem;
          font-weight: 700;
        }
      }
    }

    &--header {
      font-family: $font-family-main;
      font-weight: 400;
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: $color-text-secondary;
      vertical-align: middle;
    }

    &--cell {
      font-family: $font-family-main;
      font-weight: 600;
      font-size: 0.875rem;
      line-height: 1.25rem;
      text-align: right;
      vertical-align: middle;
      color: $color-foreground;
    }
  }

  &__buttons {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  &__button {
    &--outline {
      @include outline-button;
      flex: 1;
      padding: 0.625rem 1.125rem;
      font-size: 0.9375rem;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    &--primary {
      @include primary-button;
      flex: 1;
      padding: 0.625rem 1.125rem;
      font-size: 0.9375rem;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }

  &__error-container {
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    align-items: center;
  }

  &__error {
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

  &__retry-button {
    @include outline-button;
    padding: 0.5rem 1.25rem;
    font-size: 0.875rem;
    color: $color-primary;
    border-color: $color-primary;

    &:hover {
      background: rgba(155, 81, 224, 0.05);
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

@media (max-width: 768px) {
  .pay-appointment-modal {
    &__iframe-container {
      height: 550px;
      min-height: 550px;
    }

    &__content {
      padding: 1rem;
    }
  }
}
</style>
