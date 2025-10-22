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

        <div class="receipt-spa__details">
          <div class="receipt-spa__detail-row">
            <span class="receipt-spa__detail-label">Referencia:</span>
            <span class="receipt-spa__detail-value">{{ reference }}</span>
          </div>
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
import { onMounted, ref } from "vue";
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
const maxPollAttempts = 30;

const POLL_INTERVAL = 3000;

const fetchPaymentStatus = async (
  ref: string
): Promise<PaymentStatusResponse | null> => {
  try {
    const token = getToken();
    if (!token) {
      console.error("No authentication token found");
      return null;
    }

    const url = `${config.public.API_BASE_URL}/payment/status?reference=${ref}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 400) {
        const errorData = await response.json().catch(() => null);
        console.error("Bad Request (400):", errorData);
      } else if (response.status === 401) {
        console.error("Unauthorized (401): Invalid or expired token");
      }
      return null;
    }

    const data: PaymentStatusResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.error("Request timeout after 10 seconds");
    } else {
      console.error("Error fetching payment status:", error);
    }
    return null;
  }
};

const startPolling = async () => {
  if (!reference.value) {
    state.value = "error";
    return;
  }

  pollAttempts.value++;

  const statusData = await fetchPaymentStatus(reference.value);

  if (!statusData || !statusData.success) {
    if (pollAttempts.value < maxPollAttempts) {
      setTimeout(startPolling, POLL_INTERVAL);
    } else {
      state.value = "error";
      notifyParent("error", reference.value);
    }
    return;
  }

  const { status: paymentStatus, decision } = statusData.data;

  if (paymentStatus === "created" || paymentStatus === "pending") {
    if (pollAttempts.value < maxPollAttempts) {
      setTimeout(startPolling, POLL_INTERVAL);
    } else {
      state.value = "error";
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
    notifyParent("error", reference.value);
  }
};

const notifyParent = (status: string, ref: string) => {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(
      {
        type: "PAYMENT_RESULT",
        status: status,
        reference: ref,
        timestamp: new Date().toISOString(),
      },
      "*"
    );
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
    notifyParent("error", reference.value);
    return;
  }

  startPolling();
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

  &__container {
    width: 100%;
    max-width: 480px;
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    padding: 32px;
  }

  &__header {
    text-align: center;
    margin-bottom: 32px;
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
  }
}
</style>
