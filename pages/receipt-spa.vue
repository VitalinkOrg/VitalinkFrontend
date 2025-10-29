<template>
  <div class="receipt-spa">
    <div class="receipt-spa__container">
      <div class="receipt-spa__header">
        <h1 class="receipt-spa__title">Validación de Pago</h1>
      </div>

      <div v-if="state === 'validating'" class="receipt-spa__loading">
        <div class="receipt-spa__spinner"></div>
        <p class="receipt-spa__loading-text">Esperando validación...</p>
        <p class="receipt-spa__loading-subtext">Verificando su transacción</p>
      </div>

      <div
        v-else-if="state === 'accepted'"
        class="receipt-spa__result receipt-spa__result--success"
      >
        <div class="receipt-spa__icon receipt-spa__icon--success">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2 class="receipt-spa__result-title">¡Pago Exitoso!</h2>
        <p class="receipt-spa__result-message">
          Su transacción ha sido procesada correctamente
        </p>

        <div class="receipt-spa__details">
          <div class="receipt-spa__detail-row">
            <span class="receipt-spa__detail-label">Referencia:</span>
            <span class="receipt-spa__detail-value">{{ reference }}</span>
          </div>
        </div>
      </div>

      <div
        v-else-if="state === 'declined' || state === 'error'"
        class="receipt-spa__result receipt-spa__result--error"
      >
        <div class="receipt-spa__icon receipt-spa__icon--error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        </div>
        <h2 class="receipt-spa__result-title">
          Pago {{ state === "declined" ? "Rechazado" : "Con Error" }}
        </h2>
        <p class="receipt-spa__result-message">
          {{
            state === "declined"
              ? "La transacción fue rechazada"
              : "Ocurrió un error al procesar el pago"
          }}
        </p>

        <div class="receipt-spa__details" v-if="reference">
          <div class="receipt-spa__detail-row">
            <span class="receipt-spa__detail-label">Referencia:</span>
            <span class="receipt-spa__detail-value">{{ reference }}</span>
          </div>
        </div>

        <div v-if="errorDetails" class="receipt-spa__error-details">
          <p class="receipt-spa__error-text">{{ errorDetails }}</p>
        </div>
      </div>

      <div
        v-else-if="state === 'canceled'"
        class="receipt-spa__result receipt-spa__result--warning"
      >
        <div class="receipt-spa__icon receipt-spa__icon--warning">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h2 class="receipt-spa__result-title">Pago Cancelado</h2>
        <p class="receipt-spa__result-message">La transacción fue cancelada</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";

type PaymentStatus = "created" | "pending" | "accepted" | "declined" | "error";
type PaymentDecision = "ACCEPT" | "REJECT" | "ERROR" | "REVIEW";
type ComponentState =
  | "validating"
  | "accepted"
  | "declined"
  | "error"
  | "canceled";

interface PaymentStatusResponse {
  success: boolean;
  data: {
    reference: string;
    status: PaymentStatus;
    decision: PaymentDecision;
    amount?: number;
    currency?: string;
    timestamp?: string;
  };
  message?: string;
}

const route = useRoute();
const config = useRuntimeConfig();
const { getToken } = useAuthToken();

const state = ref<ComponentState>("validating");
const reference = ref<string>("");
const sigValid = ref<boolean>(false);
const hint = ref<string>("");
const canceled = ref<boolean>(false);
const pollAttempts = ref<number>(0);
const errorDetails = ref<string>("");
const pollingTimeoutId = ref<ReturnType<typeof setTimeout> | null>(null);

const maxPollAttempts = 30;
const POLL_INTERVAL = 3000;

const getParentOrigin = (): string => {
  try {
    if (process.dev) {
      return window.location.origin;
    }

    if (document.referrer) {
      const url = new URL(document.referrer);
      return url.origin;
    }

    return window.location.origin;
  } catch (error) {
    console.error("[Receipt] Error determining parent origin:", error);
    return "*";
  }
};

const parentOrigin = getParentOrigin();

const fetchPaymentStatus = async (
  ref: string
): Promise<PaymentStatusResponse | null> => {
  try {
    const token = getToken();
    if (!token) {
      errorDetails.value = "Token de autenticación no encontrado";
      return null;
    }

    let apiUrl = config.public.API_BASE_URL;

    if (window.location.protocol === "https:" && apiUrl.startsWith("http://")) {
      apiUrl = apiUrl.replace("http://", "https://");
    }

    const url = `${apiUrl}/payment/status`;

    const data = await $fetch<PaymentStatusResponse>(url, {
      method: "GET",
      query: {
        reference: ref,
      },
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 30000,
      retry: 1,
      retryDelay: 1000,
    });

    if (!data.success) {
      errorDetails.value = data.message || "Respuesta inválida del servidor";
      return null;
    }

    return data;
  } catch (error: any) {
    if (error.statusCode === 400) {
      errorDetails.value = "Solicitud inválida";
    } else if (error.statusCode === 401) {
      errorDetails.value = "No autorizado. Por favor, inicie sesión nuevamente";
    } else if (error.statusCode === 404) {
      errorDetails.value = "Transacción no encontrada";
    } else if (error.statusCode >= 500) {
      errorDetails.value = "Error del servidor. Intente nuevamente";
    } else if (error.message?.includes("timeout")) {
      errorDetails.value = "Tiempo de espera agotado";
    } else if (error.message?.includes("fetch")) {
      errorDetails.value = "Error de red. Verifique su conexión";
    } else {
      errorDetails.value = error.message || "Error desconocido";
    }

    return null;
  }
};

const startPolling = async () => {
  if (!reference.value) {
    state.value = "error";
    errorDetails.value = "Referencia de pago no proporcionada";
    notifyParent("error", "");
    return;
  }

  pollAttempts.value++;

  const statusData = await fetchPaymentStatus(reference.value);

  if (!statusData || !statusData.success) {
    if (pollAttempts.value < maxPollAttempts) {
      pollingTimeoutId.value = setTimeout(startPolling, POLL_INTERVAL);
    } else {
      state.value = "error";
      if (!errorDetails.value) {
        errorDetails.value = "No se pudo verificar el estado del pago";
      }
      notifyParent("error", reference.value);
    }
    return;
  }

  const { status: paymentStatus, decision } = statusData.data;

  if (paymentStatus === "created" || paymentStatus === "pending") {
    if (pollAttempts.value < maxPollAttempts) {
      pollingTimeoutId.value = setTimeout(startPolling, POLL_INTERVAL);
    } else {
      state.value = "error";
      errorDetails.value =
        "Tiempo de espera agotado para la validación del pago";
      notifyParent("error", reference.value);
    }
    return;
  }

  if (decision === "ACCEPT" && paymentStatus === "accepted") {
    state.value = "accepted";
    notifyParent("success", reference.value);
  } else if (decision === "REJECT" || paymentStatus === "declined") {
    state.value = "declined";
    notifyParent("declined", reference.value);
  } else {
    state.value = "error";
    errorDetails.value = "Estado de pago no reconocido";
    notifyParent("error", reference.value);
  }
};

const notifyParent = (status: string, ref: string) => {
  if (window.parent && window.parent !== window) {
    const message = {
      type: "PAYMENT_RESULT",
      status: status,
      reference: ref,
      timestamp: new Date().toISOString(),
    };

    try {
      window.parent.postMessage(message, parentOrigin);

      if (process.dev) {
        window.parent.postMessage(message, "*");
      }
    } catch (error: any) {
      console.error("Error sending message to parent:", error);
    }
  }
};

const cleanup = () => {
  if (pollingTimeoutId.value) {
    clearTimeout(pollingTimeoutId.value);
    pollingTimeoutId.value = null;
  }
};

onMounted(() => {
  reference.value = (route.query.reference as string) || "";
  sigValid.value = route.query.sig === "1";
  hint.value = (route.query.hint as string) || "";
  canceled.value = route.query.canceled === "1";

  if (canceled.value) {
    state.value = "canceled";
    notifyParent("canceled", reference.value);
    return;
  }

  if (!sigValid.value) {
    state.value = "error";
    errorDetails.value = "Firma de validación inválida";
    notifyParent("error", reference.value);
    return;
  }

  if (!reference.value) {
    state.value = "error";
    errorDetails.value = "Referencia de pago no encontrada";
    notifyParent("error", "");
    return;
  }

  const token = getToken();
  if (!token) {
    state.value = "error";
    errorDetails.value = "Sesión no válida";
    notifyParent("error", reference.value);
    return;
  }

  startPolling();
});

onUnmounted(() => {
  cleanup();
});
</script>

<style lang="scss" scoped>
.receipt-spa {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  font-family:
    system-ui,
    -apple-system,
    "Segoe UI",
    Roboto,
    sans-serif;
  background: #f7fafc;

  &__container {
    width: 100%;
    max-width: 600px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 32px;
  }

  &__header {
    text-align: center;
    margin-bottom: 24px;
  }

  &__title {
    font-size: 24px;
    font-weight: 600;
    color: #1a202c;
    margin: 0;
  }

  &__loading {
    text-align: center;
    padding: 40px 20px;
  }

  &__spinner {
    width: 48px;
    height: 48px;
    margin: 0 auto 24px;
    border: 4px solid #e2e8f0;
    border-top-color: #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  &__loading-text {
    font-size: 18px;
    font-weight: 500;
    color: #2d3748;
    margin: 0 0 8px;
  }

  &__loading-subtext {
    font-size: 14px;
    color: #718096;
    margin: 0;
  }

  &__result {
    text-align: center;
    padding: 20px;

    &--success {
      .receipt-spa__icon {
        color: #10b981;
      }
    }

    &--error {
      .receipt-spa__icon {
        color: #ef4444;
      }
    }

    &--warning {
      .receipt-spa__icon {
        color: #f59e0b;
      }
    }
  }

  &__icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 20px;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  &__result-title {
    font-size: 22px;
    font-weight: 600;
    color: #1a202c;
    margin: 0 0 8px;
  }

  &__result-message {
    font-size: 15px;
    color: #718096;
    margin: 0 0 24px;
  }

  &__details {
    background: #f7fafc;
    border-radius: 8px;
    padding: 16px;
    margin-top: 20px;
  }

  &__detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;

    &:not(:last-child) {
      margin-bottom: 12px;
    }
  }

  &__detail-label {
    font-size: 14px;
    font-weight: 500;
    color: #4a5568;
  }

  &__detail-value {
    font-size: 14px;
    font-family: "Courier New", monospace;
    color: #2d3748;
    background: #edf2f7;
    padding: 4px 8px;
    border-radius: 4px;
    word-break: break-all;
    max-width: 60%;
    text-align: right;
  }

  &__error-details {
    background: #fff5f5;
    border: 1px solid #feb2b2;
    border-radius: 8px;
    padding: 12px;
    margin-top: 16px;
  }

  &__error-text {
    font-size: 13px;
    color: #c53030;
    margin: 0;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .receipt-spa {
    padding: 16px;

    &__container {
      padding: 24px;
    }

    &__title {
      font-size: 20px;
    }

    &__result-title {
      font-size: 20px;
    }

    &__detail-value {
      max-width: 50%;
      font-size: 12px;
    }
  }
}
</style>
