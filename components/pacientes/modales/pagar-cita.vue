<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    title="Pagar Cita"
    size="small"
    :show-close-button="false"
    @close="handleCloseModal('payAppointment')"
  >
    <template #title
      ><AtomsIconsCreditCardIcon size="24" class="pay-appointment-modal__icon"
    /></template>

    <div class="pay-appointment-modal__content">
      <div class="d-flex flex-column">
        <h5 class="pay-appointment-modal__content__title">Detalles del pago</h5>
      </div>
      <p class="pay-appointment-modal__content__subtext">
        Rellena los datos de tu tarjeta.
      </p>
      <form>
        <div class="pay-appointment-modal__form-row">
          <div
            class="pay-appointment-modal__form-group pay-appointment-modal__form-group--large"
          >
            <label for="cardName" class="pay-appointment-modal__label"
              >Nombre</label
            >
            <input
              type="text"
              class="pay-appointment-modal__input"
              :class="{
                'pay-appointment-modal__input--error': errors.cardName,
                'pay-appointment-modal__input--disabled': isLoading,
              }"
              id="cardName"
              placeholder="Nombre como aparece en la tarjeta"
              v-model="cardName"
              :disabled="isLoading"
              @input="clearError('cardName')"
            />
            <p
              v-if="errors.cardName"
              class="pay-appointment-modal__field-error"
            >
              {{ errors.cardName }}
            </p>
          </div>
          <div
            class="pay-appointment-modal__form-group pay-appointment-modal__form-group--small"
          >
            <label for="expiryDate" class="pay-appointment-modal__label"
              >Vence</label
            >
            <input
              type="text"
              class="pay-appointment-modal__input"
              :class="{
                'pay-appointment-modal__input--error': errors.expiryDate,
                'pay-appointment-modal__input--disabled': isLoading,
              }"
              id="expiryDate"
              placeholder="MM/AA"
              v-model="expiryDate"
              :disabled="isLoading"
              @input="handleExpiryDateInput"
            />
            <p
              v-if="errors.expiryDate"
              class="pay-appointment-modal__field-error"
            >
              {{ errors.expiryDate }}
            </p>
          </div>
        </div>

        <div class="pay-appointment-modal__form-row">
          <div
            class="pay-appointment-modal__form-group pay-appointment-modal__form-group--large"
          >
            <label for="cardNumber" class="pay-appointment-modal__label"
              >Número de tarjeta</label
            >
            <div class="pay-appointment-modal__input-wrapper">
              <input
                type="text"
                class="pay-appointment-modal__input pay-appointment-modal__input--with-icon"
                :class="{
                  'pay-appointment-modal__input--error': errors.cardNumber,
                  'pay-appointment-modal__input--disabled': isLoading,
                }"
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                v-model="cardNumber"
                :disabled="isLoading"
                @input="formatCardNumber"
              />
              <div class="pay-appointment-modal__card-icon">
                <img
                  v-if="cardType === 'visa'"
                  src="@/src/assets/visa-icon.svg"
                  class="pay-appointment-modal__card-svg"
                />
                <img
                  v-else-if="cardType === 'mastercard'"
                  src="@/src/assets/mastercard-icon.svg"
                  class="pay-appointment-modal__card-svg"
                />
                <AtomsIconsCreditCardIcon v-else size="20" />
              </div>
            </div>
            <p
              v-if="errors.cardNumber"
              class="pay-appointment-modal__field-error"
            >
              {{ errors.cardNumber }}
            </p>
          </div>
          <div
            class="pay-appointment-modal__form-group pay-appointment-modal__form-group--small"
          >
            <label for="cvv" class="pay-appointment-modal__label">CVV</label>
            <input
              type="text"
              class="pay-appointment-modal__input"
              :class="{
                'pay-appointment-modal__input--error': errors.cvv,
                'pay-appointment-modal__input--disabled': isLoading,
              }"
              id="cvv"
              placeholder="123"
              maxlength="4"
              v-model="cvv"
              :disabled="isLoading"
              @input="clearError('cvv')"
            />
            <p v-if="errors.cvv" class="pay-appointment-modal__field-error">
              {{ errors.cvv }}
            </p>
          </div>
        </div>

        <div class="pay-appointment-modal__form-row">
          <div
            class="pay-appointment-modal__form-group pay-appointment-modal__form-group--full"
          >
            <label for="email" class="pay-appointment-modal__label"
              >Correo electrónico</label
            >
            <input
              type="email"
              class="pay-appointment-modal__input"
              :class="{
                'pay-appointment-modal__input--error': errors.email,
                'pay-appointment-modal__input--disabled': isLoading,
              }"
              id="email"
              placeholder="ejemplo@correo.com"
              v-model="email"
              :disabled="isLoading"
              @input="clearError('email')"
            />
            <p v-if="errors.email" class="pay-appointment-modal__field-error">
              {{ errors.email }}
            </p>
          </div>
        </div>
        <p class="pay-appointment-modal__content__payment-summary">
          Resumen de pago
        </p>
        <table class="pay-appointment-modal__table">
          <tbody>
            <tr class="pay-appointment-modal__table--row">
              <td class="pay-appointment-modal__table--header">Subtotal:</td>
              <td class="pay-appointment-modal__table--cell">
                {{
                  appointment.appointment_type.code == "VALORATION_APPOINTMENT"
                    ? formatCurrency(appointment.price_valoration_appointment)
                    : formatCurrency(appointment.price_procedure)
                }}
              </td>
            </tr>
            <tr class="pay-appointment-modal__table--row">
              <td class="pay-appointment-modal__table--header">Descuento:</td>
              <td class="pay-appointment-modal__table--cell">-</td>
            </tr>
            <tr
              class="pay-appointment-modal__table--row"
              v-if="
                appointment.appointment_type.code !== 'VALORATION_APPOINTMENT'
              "
            >
              <td class="pay-appointment-modal__table--header">
                Monto del credito:
              </td>
              <td class="pay-appointment-modal__table--cell">
                {{
                  appointment.appointment_credit?.credit_status.code ==
                    "APPROVED" ||
                  appointment.appointment_credit?.credit_status.code ==
                    "APPROVED_PERCENTAGE"
                    ? "-" +
                      formatCurrency(
                        appointment.appointment_credit?.approved_amount || 0
                      )
                    : formatCurrency(0)
                }}
              </td>
            </tr>
            <tr class="total">
              <td class="pay-appointment-modal__table--header">
                Saldo a pagar:
              </td>
              <td class="pay-appointment-modal__table--cell">
                {{ formatCurrency(balanceToPay(appointment)) }}
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
            v-if="
              appointment.appointment_status.code ===
              'CONFIRM_VALIDATION_APPOINTMENT'
            "
            class="pay-appointment-modal__button--primary"
            :disabled="isLoading"
            @click.prevent="processPayment"
          >
            <span v-if="!isLoading">Pagar</span>
            <span v-else class="pay-appointment-modal__loading">
              <span class="pay-appointment-modal__spinner"></span>
              Procesando pago...
            </span>
          </button>
          <button
            v-else-if="
              appointment.appointment_status.code === 'CONFIRM_PROCEDURE' ||
              appointment.appointment_status.code === 'PENDING_PROCEDURE'
            "
            class="pay-appointment-modal__button--primary"
            :disabled="isLoading"
            @click.prevent="processPaymentProcedure"
          >
            <span v-if="!isLoading">Pagar</span>
            <span v-else class="pay-appointment-modal__loading">
              <span class="pay-appointment-modal__spinner"></span>
              Procesando pago...
            </span>
          </button>
          <button
            v-if="balanceToPay(appointment) === 0"
            class="pay-appointment-modal__button--primary"
            :disabled="isLoading"
          >
            <span v-if="!isLoading">Confirmar Reserva</span>
            <span v-else class="pay-appointment-modal__loading">
              <span class="pay-appointment-modal__spinner"></span>
              Confirmando...
            </span>
          </button>
        </div>
      </form>
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

interface Emits {
  (e: "open-modal", modalName: ModalName): void;
  (e: "close-modal", modalName: ModalName): void;
  (e: "refresh"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleOpenModal = (modalName: ModalName): void => {
  emit("open-modal", modalName);
};

const handleCloseModal = (modalName: ModalName): void => {
  if (!isLoading.value) {
    resetModalData();
    emit("close-modal", modalName);
  }
};

const isModalOpen = computed({
  get: () => props.isOpen,
  set: (value: boolean) => {
    if (!value) {
      emit("close-modal", "successfulPayment");
    }
  },
});

const resetModalData = () => {
  cardName.value = "";
  cardNumber.value = "";
  expiryDate.value = "";
  cvv.value = "";
  email.value = "";
  cardType.value = "";
  isLoading.value = false;

  errors.value = {
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    email: "",
  };
};

const token = useCookie("token");
const config = useRuntimeConfig();

const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");

const isOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const cardName = ref("");
const cardNumber = ref("");
const expiryDate = ref("");
const cvv = ref("");
const email = ref("");
const cardType = ref("");

const errors = ref({
  cardName: "",
  cardNumber: "",
  expiryDate: "",
  cvv: "",
  email: "",
});

const detectCardType = (number: string): string => {
  const cleanNumber = number.replace(/\D/g, "");

  if (cleanNumber.startsWith("4")) {
    return "visa";
  } else if (cleanNumber.startsWith("5") || cleanNumber.startsWith("2")) {
    return "mastercard";
  }
  return "";
};

const formatCardNumber = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  let value = target.value.replace(/\D/g, "");

  cardType.value = detectCardType(value);

  value = value.replace(/(\d{4})(?=\d)/g, "$1 ");

  if (value.length > 19) {
    value = value.substring(0, 19);
  }

  cardNumber.value = value;

  clearError("cardNumber");
};

const clearError = (field: keyof typeof errors.value): void => {
  if (errors.value[field]) {
    errors.value[field] = "";
  }
};

const handleExpiryDateInput = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  let value = target.value.replace(/\D/g, "");

  if (value.length >= 2) {
    value = value.substring(0, 2) + "/" + value.substring(2, 4);
  }

  expiryDate.value = value;
  clearError("expiryDate");
};

const validateFields = (): boolean => {
  errors.value = {
    cardName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    email: "",
  };

  let isValid = true;

  if (!cardName.value.trim()) {
    errors.value.cardName = "El nombre es requerido";
    isValid = false;
  }

  if (!cardNumber.value.trim()) {
    errors.value.cardNumber = "El número de tarjeta es requerido";
    isValid = false;
  } else if (cardNumber.value.replace(/\s/g, "").length < 16) {
    errors.value.cardNumber = "El número de tarjeta debe tener 16 dígitos";
    isValid = false;
  }

  if (!expiryDate.value.trim()) {
    errors.value.expiryDate = "La fecha de vencimiento es requerida";
    isValid = false;
  } else {
    const expiryPattern = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiryPattern.test(expiryDate.value)) {
      errors.value.expiryDate = "Formato inválido (MM/AA)";
      isValid = false;
    }
  }

  if (!cvv.value.trim()) {
    errors.value.cvv = "El CVV es requerido";
    isValid = false;
  } else if (cvv.value.length < 3) {
    errors.value.cvv = "El CVV debe tener al menos 3 dígitos";
    isValid = false;
  }

  if (!email.value.trim()) {
    errors.value.email = "El correo electrónico es requerido";
    isValid = false;
  } else {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.value)) {
      errors.value.email = "El formato del correo electrónico es inválido";
      isValid = false;
    }
  }

  return isValid;
};

const formatCurrency = (amount: number | string): string => {
  const numericAmount = Number(amount) || 0;
  return (
    "₡" +
    numericAmount.toLocaleString("es-CR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

const processPayment = async () => {
  /*
  Deshabilitado solo para MVP

  if (!validateFields()) {
    return;
  }
  */

  isLoading.value = true;

  try {
    const { data, error } = await useFetch(
      config.public.API_BASE_URL +
        "/appointment/success_payment_valoration_appointment",
      {
        method: "PUT",
        headers: { Authorization: token.value ?? "" },
        params: {
          id: props.appointment.id,
        },
        body: {
          payment_method_code: "ON_CONSULTATION",
        },
      }
    );

    if (error.value) {
      throw new Error(error.value.data?.message || "Error al procesar el pago");
    }

    if (data.value) {
      await refreshAppointments?.();
      handleCloseModal("appointmentDetails");
      handleCloseModal("payAppointment");
      handleOpenModal("successfulPayment");
    }
  } catch (err: any) {
    console.error("Error processing payment:", err);
  } finally {
    isLoading.value = false;
  }
};

const processPaymentProcedure = async () => {
  /*
  Deshabilitado solo para MVP

  if (!validateFields()) {
    return;
  }
  */

  isLoading.value = true;

  try {
    const { data, error } = await useFetch(
      config.public.API_BASE_URL + "/appointment/success_payment_procedure",
      {
        method: "PUT",
        headers: { Authorization: token.value ?? "" },
        params: {
          id: props.appointment.id,
        },
        body: {
          payment_method_code: "ON_CONSULTATION",
        },
      }
    );

    if (error.value) {
      throw new Error(
        error.value.data?.message ||
          "Error al procesar el pago del procedimiento"
      );
    }

    if (data.value) {
      await refreshAppointments?.();
      handleCloseModal("appointmentDetails");
      handleCloseModal("payAppointment");
      handleOpenModal("successfulPayment");
    }
  } catch (err: any) {
    console.error("Error processing procedure payment:", err);
  } finally {
    isLoading.value = false;
  }
};

const balanceToPay = (appointment: Appointment) => {
  if (appointment.appointment_type.code == "VALORATION_APPOINTMENT") {
    return appointment.price_valoration_appointment;
  }
  return (
    Number(appointment.price_procedure) -
    0 - // Descuento (siempre 0 para MVP)
    Number(appointment.appointment_credit?.approved_amount ?? 0)
  );
};
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
    }
  }

  &__form-row {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  &__form-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;

    &--large {
      width: 70%;
    }

    &--small {
      width: 30%;
    }

    &--full {
      width: 100%;
    }
  }

  &__label {
    @include label-base;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #344054;
  }

  &__input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
  }

  &__input {
    @include input-base;
    width: 100%;

    &--with-icon {
      padding-left: 2.5rem;
    }

    &--error {
      border-color: $color-error;
      box-shadow: 0 0 0 0.0625rem $color-error;
    }

    &--disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__field-error {
    color: $color-error;
    font-size: 0.75rem;
    font-weight: 400;
    margin: 0.125rem 0 0 0;
    line-height: 1rem;
  }

  &__card-icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }

  &__card-svg {
    width: 1.5rem;
    height: 1.5rem;
  }

  &__loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__spinner {
    width: 0.875rem;
    height: 0.875rem;
    border: 0.125rem solid rgba(255, 255, 255, 0.3);
    border-top: 0.125rem solid $white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;

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
      font-weight: 700;
      font-size: 0.875rem;
      line-height: 1.25rem;
      letter-spacing: 0%;
      text-align: right;
      vertical-align: middle;
      color: $color-foreground;
    }
  }

  &__buttons {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  &__button {
    &--outline {
      @include outline-button;
      flex: 1;
      padding: 0.625rem 1.125rem;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    &--primary {
      @include primary-button;
      flex: 1;
      padding: 0.625rem 1.125rem;

      &:disabled {
        opacity: 0.8;
        cursor: not-allowed;
      }
    }
  }

  &__footer {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }

  &__error {
    color: $color-error;
    font-size: 0.875rem;
    font-weight: 500;
    margin: 0;
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
