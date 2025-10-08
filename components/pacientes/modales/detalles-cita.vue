<template>
  <AtomsModalBase
    :isOpen="isOpen"
    size="medium"
    @close="handleCloseModal('appointmentDetails')"
    header-class="header-border-bottom"
    :footer-class="
      appointment.appointment_status.code !== 'CANCEL_APPOINTMENT'
        ? 'footer-border-top'
        : 'padding-0'
    "
  >
    <div class="appointment-details-modal__content">
      <h2 class="appointment-details-modal__title">
        {{
          isProcedureDetails
            ? "Detalles de la cita"
            : "Detalles del procedimiento"
        }}
      </h2>

      <PacientesTablaDetallesCita :appointment="appointment" />

      <div
        v-if="canShowPaymentMethods"
        class="appointment-details-modal__payment-information"
      >
        <p class="appointment-details-modal__payment-information--title">
          Información de métodos de Pago:
        </p>
        <div class="appointment-details-modal__payment-information--content">
          <AtomsIconsCircleCheckBigIcon
            size="12"
            class="appointment-details-modal__payment-information--icon"
          />
          <div class="appointment-details-modal__payment-information--wrapper">
            <p class="appointment-details-modal__payment-information--subtitle">
              Pagar en línea con tarjeta.
            </p>
            <p class="appointment-details-modal__payment-information--subtext">
              Paga ahora de forma segura con tu tarjeta.
            </p>
          </div>
        </div>
        <div class="appointment-details-modal__payment-information--content">
          <AtomsIconsCircleCheckBigIcon
            size="12"
            class="appointment-details-modal__payment-information--icon"
          />
          <div class="appointment-details-modal__payment-information--wrapper">
            <p class="appointment-details-modal__payment-information--subtitle">
              Pagar en consulta.
            </p>
            <p class="appointment-details-modal__payment-information--subtext">
              Pagaras directamente el día de tu cita.
            </p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div
        v-if="appointment.appointment_status.code === 'CANCEL_APPOINTMENT'"
      ></div>
      <div
        v-else-if="canLeaveRating"
        class="appointment-details-modal__footer appointment-details-modal__footer--full-width"
      >
        <button
          class="appointment-details-modal__button--outline"
          @click="
            () => {
              handleOpenModal('leaveReview', props.appointment.id);
              handleCloseModal('appointmentDetails');
            }
          "
        >
          Dejar una reseña
        </button>
      </div>

      <div
        v-else-if="
          appointment.appointment_credit?.credit_status?.code === 'REQUIRED'
        "
        class="appointment-details-modal__footer appointment-details-modal__footer--full-width"
      >
        <p class="appointment-details-modal__credit-information">
          <span class="appointment-details-modal__credit-information--text"
            >Esperando respuesta de crédito</span
          >
          <span class="appointment-details-modal__credit-information--subtext">
            Tu solicitud está siendo evaluada por la asociación solidarista.
          </span>
        </p>
      </div>

      <div
        v-else-if="
          appointment.appointment_status.code !==
          'VALUED_VALORATION_APPOINTMENT'
        "
        class="appointment-details-modal__footer"
      >
        <button
          class="appointment-details-modal__button--danger"
          @click="handleOpenModal('cancelAppointment')"
        >
          Anular cita
        </button>
        <button
          v-if="hasOutstandingBalance && shouldShowContinueButton"
          class="appointment-details-modal__button--primary"
          @click="handleOpenModal('payAppointment')"
        >
          Pagar ahora
        </button>
      </div>
      <div
        v-else-if="!waitingForCreditResponse"
        class="appointment-details-modal__footer appointment-details-modal__footer--full-width"
      >
        <button
          class="appointment-details-modal__button--outline"
          @click="handleOpenModal('scheduleProcedure')"
        >
          Reservar procedimiento
        </button>
        <button
          v-if="canRequestCredit"
          class="appointment-details-modal__button--primary"
          @click="handleOpenModal('applyCredit')"
        >
          Solicitar Crédito
        </button>
      </div>
      <div
        v-else
        class="appointment-details-modal__footer appointment-details-modal__footer--full-width"
      >
        <button
          class="appointment-details-modal__button--primary"
          @click="handleOpenModal('scheduleProcedure')"
        >
          Reservar procedimiento
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import type { ModalName } from "~/types";
import type { Appointment } from "~/types/appointment";

interface Props {
  appointment: Appointment;
  isOpen: boolean;
}

interface Emits {
  (e: "open-modal", modalName: ModalName, appointmentId?: number): void;
  (e: "close-modal", modalName: ModalName): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleOpenModal = (modalName: ModalName, appointmentId?: number) => {
  emit("open-modal", modalName, appointmentId);
};

const handleCloseModal = (modalName: ModalName) => {
  emit("close-modal", modalName);
};

const hasOutstandingBalance = computed(() => {
  const creditAmount = props.appointment.appointment_credit
    ? Number(props.appointment.appointment_credit.approved_amount)
    : 0;
  return Number(props.appointment.price_procedure) - creditAmount !== 0;
});

const shouldShowContinueButton = computed(() => {
  const { code: statusCode } = props.appointment.appointment_status;
  const { code: paymentCode } = props.appointment.payment_status;

  return (
    (statusCode === "CONFIRM_VALIDATION_APPOINTMENT" &&
      (paymentCode === "PAYMENT_STATUS_NOT_PAID_VALORATION_APPOINTMENT" ||
        paymentCode === "PAYMENT_STATUS_NOT_PAID_PROCEDURE")) ||
    (statusCode === "CONFIRM_PROCEDURE" &&
      paymentCode === "PAYMENT_STATUS_NOT_PAID_PROCEDURE")
  );
});

const isProcedureDetails = computed(() => {
  return (
    props.appointment.appointment_type.code === "VALORATION_APPOINTMENT" &&
    props.appointment.appointment_status.code !==
      "VALUED_VALORATION_APPOINTMENT"
  );
});

const waitingForCreditResponse = computed(
  () => props.appointment.appointment_credit?.credit_status_code === "REQUIRED"
);
const canRequestCredit = computed(() => !props.appointment.appointment_credit);

const canShowPaymentMethods = computed(() => {
  const paymentStatusCode = props.appointment.payment_status.code;
  const appointmentStatusCode = props.appointment.appointment_status.code;

  if (
    paymentStatusCode === "PAYMENT_STATUS_NOT_PAID_VALORATION_APPOINTMENT" ||
    paymentStatusCode === "PAYMENT_STATUS_NOT_PAID_PROCEDURE"
  ) {
    if (
      appointmentStatusCode === "CONFIRM_VALIDATION_APPOINTMENT" ||
      appointmentStatusCode == "PENDING_VALORATION_APPOINTMENT"
    ) {
      return true;
    }
  }

  return false;
});

const canLeaveRating = computed(() => {
  if (props.appointment.appointment_result?.code === "NOT_FIT_FOR_PROCEDURE") {
    return true;
  }

  if (props.appointment.appointment_status.code === "CONCRETED_APPOINTMENT") {
    return true;
  }

  return false;
});
</script>

<style lang="scss">
.appointment-details-modal {
  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 1.125rem;
    line-height: 1.75rem;
    color: $color-foreground;
  }

  &__content {
    padding: 1.5rem;
  }

  &__payment-information {
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: #f8faff;
    border-radius: 1.25rem;
    gap: 0.625rem;
    padding: 0.625rem 1.25rem;

    &--content {
      display: flex;
      gap: 0.625rem;
    }

    &--icon {
      width: 1.4375rem;
      height: 1.4375rem;
      border: 0.25rem solid #d1fadf;
      color: #039855;
      border-radius: 50%;
      padding: 0.0625rem;
    }

    &--title {
      @include label-base;
      font-weight: 600;
      font-size: 0.875rem;
      line-height: 1.5rem;
      color: $black;
    }

    &--subtitle {
      @include label-base;
      font-family: $font-family-main;
      font-weight: 600;
      font-size: 0.875rem;
      line-height: 1.5rem;
      color: $black;
    }

    &--subtext {
      @include label-base;
      font-weight: 500;
      font-size: 0.875rem;
      line-height: 1.5rem;
      color: $color-text-secondary;
    }
  }

  &__credit-information {
    width: 100%;
    &--text {
      @include label-base;
      font-weight: 600;
      font-size: 1rem;
      line-height: 1.5rem;
      color: $color-foreground;
      text-align: center;
      display: block;
    }

    &--subtext {
      @include label-base;
      font-weight: 500;
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: $color-text-secondary;
      display: block;
      text-align: center;
      margin-top: 0.25rem;
    }
  }

  &__button {
    &--primary {
      @include primary-button;
      padding: 0.75rem 0;
    }

    &--outline {
      @include outline-button;
      padding: 0.75rem 0;
    }

    &--danger {
      @include outline-danger-button;
    }
  }

  &__footer {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    gap: 0.75rem;
    width: 100%;

    &:has(button:only-child) {
      grid-template-columns: auto;
      justify-content: flex-start;
    }

    &--full-width {
      &:has(button:only-child) {
        grid-template-columns: 1fr;
        justify-content: stretch;
      }
    }
  }
}
</style>
