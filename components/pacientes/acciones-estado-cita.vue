<template>
  <div class="appointment-pay-modal">
    <div v-if="buttonConfig">
      <button
        v-if="buttonConfig.type === 'button'"
        role="button"
        :class="buttonConfig.class"
        :disabled="buttonConfig.disabled"
        @click="buttonConfig.action"
      >
        {{ buttonConfig.text }}
      </button>

      <div
        v-else-if="buttonConfig.type === 'paid-status'"
        role="button"
        :class="buttonConfig.class"
        @click="buttonConfig.action"
      >
        <img src="@/src/assets/success.svg" class="mr-2" alt="Success" />
        <p class="text-success mb-0">{{ buttonConfig.text }}</p>
      </div>

      <span
        v-else-if="buttonConfig.type === 'status'"
        role="button"
        class="appointment-pay-modal__status"
        :class="buttonConfig.class"
        @click="buttonConfig.action"
      >
        {{ buttonConfig.text }}
      </span>

      <span
        v-else-if="buttonConfig.type === 'empty'"
        class="appointment-pay-modal__empty-status"
        >—</span
      >
    </div>

    <PacientesModalesDetallesCita
      :appointment="appointment"
      :is-open="modals.appointmentDetails"
      @open-modal="openModal"
      @close-modal="closeModal"
    />

    <PacientesModalesPagarCita
      :appointment="appointment"
      :is-open="modals.payAppointment"
      @open-modal="openModal"
      @close-modal="closeModal"
    />

    <PacientesModalesPagoExistoso
      :appointment="appointment"
      :is-open="modals.successfulPayment"
      @open-modal="openModal"
      @close-modal="closeModal"
    />

    <PacientesModalesReservarProcedimiento
      :appointment="appointment"
      :is-open="modals.scheduleProcedure"
      @open-modal="openModal"
      @close-modal="closeModal"
    />

    <PacientesModalesAnularCita
      :appointment="appointment"
      :is-open="modals.cancelAppointment"
      @open-modal="openModal"
      @close-modal="closeModal"
    />

    <PacientesModalesReservaProcedimientoExitoso
      :appointment="appointment"
      :is-open="modals.scheduleProcedureSuccess"
      @open-modal="openModal"
      @close-modal="closeModal"
    />

    <PacientesModalesSolicitarCredito
      :appointment="appointment"
      :is-open="modals.applyCredit"
      @open-modal="openModal"
      @close-modal="closeModal"
    />

    <PacientesModalesSolicitarCreditoExitoso
      :appointment="appointment"
      :is-open="modals.applyCreditSuccess"
      @open-modal="openModal"
      @close-modal="closeModal"
    />

    <PacientesModalesDejarValoracion
      :appointment="appointment"
      :is-open="modals.leaveReview"
      @open-modal="openModal"
      @close-modal="closeModal"
    />

    <PacientesModalesDejarValoracionExitoso
      :appointment="appointment"
      :is-open="modals.leaveReviewSuccess"
      @open-modal="openModal"
      @close-modal="closeModal"
    />
  </div>
</template>

<script lang="ts" setup>
import type { ModalName } from "~/types";
import type { Appointment } from "~/types/appointment";

interface Props {
  appointment: Appointment;
  step?: string;
  showStatus?: boolean;
}
const props = defineProps<Props>();

type ModalState = Record<ModalName, boolean>;

const modals = reactive<ModalState>({
  appointmentDetails: false,
  cancelAppointment: false,
  successfulPayment: false,
  payAppointment: false,
  scheduleProcedure: false,
  scheduleProcedureSuccess: false,
  leaveReview: false,
  leaveReviewSuccess: false,
  applyCredit: false,
  applyCreditSuccess: false,
});

type ButtonType = "button" | "paid-status" | "status" | "empty";

interface ButtonConfig {
  type: ButtonType;
  text: string;
  class: string;
  action: () => void;
  disabled?: boolean;
}

type AppointmentStatusCode =
  | "CANCEL_APPOINTMENT"
  | "PENDING_VALORATION_APPOINTMENT"
  | "PENDING_PROCEDURE"
  | "CONFIRM_PROCEDURE"
  | "CONCRETED_APPOINTMENT"
  | "VALUED_VALORATION_APPOINTMENT"
  | "CONFIRM_VALIDATION_APPOINTMENT"
  | "VALUATION_PENDING_VALORATION_APPOINTMENT"
  | "WAITING_PROCEDURE";

type PaymentStatusCode =
  | "PAYMENT_STATUS_NOT_PAID_VALORATION_APPOINTMENT"
  | "PAYMENT_STATUS_NOT_PAID_PROCEDURE"
  | "PAYMENT_STATUS_PAID_PROCEDURE"
  | "PAYMENT_STATUS_PENDING";

const closeModal = (modalName: ModalName) => {
  modals[modalName] = false;
};

const openModal = (modalName: ModalName) => {
  modals[modalName] = true;
};

const openAppointmentDetails = () => {
  openModal("appointmentDetails");
};

const remainingAmount = computed(() => {
  const procedurePrice = Number(props.appointment.price_procedure) || 0;
  const approvedCredit = Number(
    props.appointment.appointment_credit?.approved_amount || 0
  );
  return procedurePrice - approvedCredit;
});

const isProcedureEligible = computed(() => {
  return (
    props.appointment.appointment_status.code ===
      "VALUED_VALORATION_APPOINTMENT" &&
    props.appointment.appointment_result?.code === "FIT_FOR_PROCEDURE"
  );
});

const isProcedureButtonDisabled = computed(() => {
  return (
    props.appointment.appointment_credit?.credit_status_code === "REQUIRED" &&
    !props.appointment.appointment_credit.approved_amount
  );
});

const statusClassMap: Record<AppointmentStatusCode, string> = {
  CANCEL_APPOINTMENT: "appointment-pay-modal__status--cancelled width-full",
  PENDING_VALORATION_APPOINTMENT:
    "appointment-pay-modal__status--warning width-full",
  PENDING_PROCEDURE: "appointment-pay-modal__status--warning width-full",
  CONFIRM_PROCEDURE: "appointment-pay-modal__status--primary width-full",
  CONCRETED_APPOINTMENT: "appointment-pay-modal__status--primary width-full",
  VALUED_VALORATION_APPOINTMENT:
    "appointment-pay-modal__status--success width-full",
  CONFIRM_VALIDATION_APPOINTMENT:
    "appointment-pay-modal__status--success width-full",
  VALUATION_PENDING_VALORATION_APPOINTMENT:
    "appointment-pay-modal__status--primary width-full",
  WAITING_PROCEDURE: "appointment-pay-modal__status--warning width-full",
};

const getStatusClass = (statusCode: AppointmentStatusCode): string => {
  return statusClassMap[statusCode] || "";
};

const buttonConfig = computed((): ButtonConfig | null => {
  const { appointment_status, payment_status } = props.appointment;
  const appointmentCode = appointment_status.code as AppointmentStatusCode;
  const paymentCode = payment_status?.code as PaymentStatusCode;

  if (props.showStatus) {
    return {
      type: "status",
      text: appointment_status.value1,
      class: getStatusClass(appointmentCode),
      action: openAppointmentDetails,
    };
  }

  if (
    (appointmentCode === "CONFIRM_VALIDATION_APPOINTMENT" &&
      (paymentCode === "PAYMENT_STATUS_NOT_PAID_VALORATION_APPOINTMENT" ||
        paymentCode === "PAYMENT_STATUS_NOT_PAID_PROCEDURE")) ||
    (appointmentCode === "CONFIRM_PROCEDURE" &&
      paymentCode === "PAYMENT_STATUS_NOT_PAID_PROCEDURE")
  ) {
    if (remainingAmount.value !== 0) {
      return {
        type: "button",
        text: "Pagar ahora",
        class: "appointment-pay-modal__button--outline",
        action: openAppointmentDetails,
      };
    } else {
      return {
        type: "paid-status",
        text: "Pagado",
        class: "appointment-pay-modal__button-item",
        action: openAppointmentDetails,
      };
    }
  }

  if (isProcedureEligible.value) {
    return {
      type: "button",
      text: "Solicitar Procedimiento",
      class: "appointment-pay-modal__button--outline",
      action: openAppointmentDetails,
      disabled: isProcedureButtonDisabled.value,
    };
  }

  if (
    appointmentCode === "VALUATION_PENDING_VALORATION_APPOINTMENT" ||
    paymentCode === "PAYMENT_STATUS_PAID_PROCEDURE" ||
    appointmentCode === "CONCRETED_APPOINTMENT"
  ) {
    return {
      type: "paid-status",
      text: "Pagado",
      class: "appointment-pay-modal__button-item",
      action: openAppointmentDetails,
    };
  }

  if (appointmentCode === "PENDING_VALORATION_APPOINTMENT") {
    return {
      type: "button",
      text: "Cancelar cita",
      class: "appointment-pay-modal__button--outline",
      action: openAppointmentDetails,
    };
  }

  if (
    (appointmentCode === "VALUED_VALORATION_APPOINTMENT" &&
      !isProcedureEligible.value) ||
    (appointmentCode === "PENDING_PROCEDURE" &&
      paymentCode === "PAYMENT_STATUS_NOT_PAID_PROCEDURE") ||
    appointmentCode === "CANCEL_APPOINTMENT"
  ) {
    return {
      type: "empty",
      text: "—",
      class: "",
      action: () => {},
    };
  }

  return {
    type: "status",
    text: appointment_status.value1,
    class: getStatusClass(appointmentCode),
    action: openAppointmentDetails,
  };
});
</script>

<style lang="scss" scoped>
.appointment-pay-modal {
  &__empty-status {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  &__button {
    &--outline {
      @include outline-button;
      font-weight: 600;
      font-size: 0.75rem;
      line-height: 1.125rem;
      padding: 0.5rem 1rem;
      width: 100%;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }

  &__status {
    text-align: center;
    text-wrap: nowrap;
    padding: 0.375rem 0.625rem;
    cursor: pointer;
    border-radius: 1.875rem;
    font-family: $font-family-main;
    font-weight: 500;
    font-style: normal;
    font-size: 0.75rem;
    line-height: 1.125rem;
    letter-spacing: 0;
    text-align: center;
    color: $color-foreground;

    &--success {
      background-color: $color-success;
    }

    &--warning {
      background-color: $color-warning;
    }

    &--primary {
      background-color: rgba($color-primary, 0.1);
    }

    &--cancelled {
      background-color: $color-cancel;
    }
  }

  &__button-item {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.8;
    }
  }
}

.width-full {
  display: block;
  width: 100%;
}
</style>
