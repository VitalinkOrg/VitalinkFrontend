<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    size="large"
    @close="handleCloseModal('applyCredit')"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
  >
    <template #title>
      <h2 class="apply-credit-modal__title">Solicitar Crédito</h2>
    </template>

    <div class="apply-credit-modal__content">
      <p class="apply-credit-modal__highlight">
        Para continuar con la reserva del procedimiento, solicita un crédito por
        un monto igual o menor al costo total de la cita.
      </p>

      <table class="apply-credit-modal__table">
        <tbody>
          <tr>
            <td class="apply-credit-modal__table--label">
              Monto total del procedimiento:
            </td>
            <td class="apply-credit-modal__table--value">
              <input
                type="text"
                class="apply-credit-modal__input"
                :value="
                  formatCurrency(appointment.price_procedure, {
                    decimalPlaces: 0,
                  })
                "
                :placeholder="formatCurrency(0, { decimalPlaces: 0 })"
                disabled
              />
            </td>
          </tr>
          <tr>
            <td class="apply-credit-modal__table--label">
              Monto del crédito al solicitar:
            </td>
            <td class="apply-credit-modal__table--value">
              <div class="apply-credit-modal__input-wrapper">
                <input
                  type="text"
                  class="apply-credit-modal__input"
                  :class="{
                    'apply-credit-modal__input--error': validationError,
                    'apply-credit-modal__input--disabled': isLoading,
                  }"
                  :placeholder="
                    formatCurrency(appointment.price_procedure, {
                      decimalPlaces: 0,
                    })
                  "
                  v-model="requestedAmountDisplay"
                  :disabled="isLoading"
                  @input="handleInput"
                  @blur="handleBlur"
                  :maxlength="15"
                />

                <small v-if="!validationError" class="apply-credit-modal__info">
                  <AtomsIconsInfoIcon size="12" />
                  El monto debe ser igual o menor a
                  {{
                    formatCurrency(appointment.price_procedure, {
                      decimalPlaces: 0,
                    })
                  }}
                </small>
                <small v-else class="apply-credit-modal__error">
                  <AtomsIconsAlertIcon size="12" />
                  {{ validationError }}
                </small>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <template #footer>
      <button
        class="apply-credit-modal__button--cancel"
        :disabled="isLoading"
        @click="handleCloseModal('applyCredit')"
      >
        Cancelar
      </button>
      <button
        class="apply-credit-modal__button--primary"
        :disabled="!isFormValid || isLoading"
        @click="handleSendRequest"
      >
        <span v-if="!isLoading">Enviar solicitud</span>
        <span v-else class="apply-credit-modal__loading">
          <span class="apply-credit-modal__spinner"></span>
          Enviando solicitud...
        </span>
      </button>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useFormat } from "~/composables/useFormat";
import type { ModalName } from "~/types";
import type { Appointment } from "~/types/appointment";

const { formatCurrency } = useFormat();

const token = useCookie("token");
const config = useRuntimeConfig();

const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");

interface Props {
  appointment: Appointment;
  isOpen: boolean;
}

interface Emits {
  (e: "open-modal", modalName: ModalName): void;
  (e: "close-modal", modalName: ModalName): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const requestedAmount = ref<number | null>(null);
const requestedAmountDisplay = ref<string>("");

const validationError = ref("");
const isLoading = ref(false);

const isModalOpen = computed({
  get: () => props.isOpen,
  set: (value: boolean) => {
    if (!value) handleCloseModal("applyCredit");
  },
});

const isFormValid = computed(() => {
  return (
    requestedAmount.value !== null &&
    requestedAmount.value > 0 &&
    requestedAmount.value <= Number(props.appointment.price_procedure) &&
    !validationError.value
  );
});

const handleInput = (event: Event) => {
  const input = (event.target as HTMLInputElement).value;

  const digitsOnly = input.replace(/\D/g, "");

  if (!digitsOnly) {
    requestedAmount.value = null;
    requestedAmountDisplay.value = "";
    return;
  }

  const amount = parseInt(digitsOnly, 10);

  requestedAmount.value = amount;

  requestedAmountDisplay.value = formatCurrency(amount, { decimalPlaces: 0 });
};

const handleBlur = () => {
  if (requestedAmount.value !== null) {
    requestedAmountDisplay.value = formatCurrency(requestedAmount.value, {
      decimalPlaces: 0,
    });
  }
  validateAmount();
};

const validateAmount = () => {
  validationError.value = "";

  if (!requestedAmount.value) {
    validationError.value = "El monto es requerido";
    return;
  }
  if (requestedAmount.value <= 0) {
    validationError.value = "El monto debe ser mayor a 0";
    return;
  }
  if (requestedAmount.value > Number(props.appointment.price_procedure)) {
    validationError.value = `El monto no puede ser mayor a ${formatCurrency(
      props.appointment.price_procedure
    )}`;
    return;
  }
};

watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      requestedAmount.value = null;
      requestedAmountDisplay.value = "";
      validationError.value = "";
      isLoading.value = false;
    }
  }
);

const handleOpenModal = (modalName: ModalName) => {
  emit("open-modal", modalName);
};

const handleCloseModal = (modalName: ModalName) => {
  emit("close-modal", modalName);
};

const handleSendRequest = async () => {
  validateAmount();

  if (!isFormValid.value) {
    return;
  }

  isLoading.value = true;

  try {
    const { data, error } = await useFetch(
      config.public.API_BASE_URL + "/appointmentcredit/add",
      {
        method: "POST",
        headers: { Authorization: token.value ?? "" },
        body: {
          appointment: props.appointment.id,
          requested_amount: requestedAmount.value,
        },
      }
    );

    if (error.value) {
      throw new Error(
        error.value.data?.message || "Error al solicitar el crédito"
      );
    }

    if (data) {
      await refreshAppointments?.();
      handleCloseModal("applyCredit");
      handleCloseModal("appointmentDetails");
      handleOpenModal("applyCreditSuccess");
    }
  } catch (err: any) {
    console.error("Error requesting credit:", err);
    validationError.value = err.message || "Error al enviar la solicitud";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.apply-credit-modal {
  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    color: #353e5c;
  }

  &__content {
    display: flex;
    flex-direction: column;
    padding: 20px 24px;
    gap: 20px;
  }

  &__input {
    @include input-base;
    width: 320px;

    transition: border-color 0.2s ease;

    &--error {
      border-color: #dc3545;
      box-shadow: 0 0 0 0.1rem rgba(220, 53, 69, 0.25);
    }

    &--disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 0.1rem rgba(0, 123, 255, 0.25);
    }

    &--error:focus {
      border-color: #dc3545;
      box-shadow: 0 0 0 0.1rem rgba(220, 53, 69, 0.25);
    }
  }

  &__highlight {
    @include label-base;
    font-weight: 300;
    font-size: 16px;
    line-height: 20px;
    color: #353e5c;
  }

  &__table {
    border-collapse: separate;
    gap: 5px;
    border-spacing: 0;

    td {
      padding: 6px 0px;
      vertical-align: middle;
    }

    &--label {
      font-family: $font-family-main;
      font-weight: 300;
      font-size: 16px;
      line-height: 20px;
      color: #6d758f;
      padding: 10px 0px;
    }

    &--value {
      font-family: $font-family-main;
      font-weight: 500;
      font-size: 16px;
      line-height: 20px;
      color: $color-foreground;
      padding: 10px 0px;
    }
  }

  &__input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  &__info {
    @include label-base;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    color: #6d758f;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__error {
    @include label-base;
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    color: #dc3545;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  &__loading {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  &__button {
    &--cancel {
      @include secondary-button;
      width: 100%;
      color: #b42318;
      background-color: #fffafa;

      &:hover:not(:disabled) {
        background: darken(#fffafa, 1.25);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    &--primary {
      @include primary-button;
      width: 100%;

      &:disabled {
        opacity: 0.8;
        cursor: not-allowed;
      }
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
</style>
