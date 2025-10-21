<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    size="extra-small"
    class="confirm-reservation"
    @close="handleCloseModal"
  >
    <div v-if="continueWithoutPayment" class="no-payment-recorded__content">
      <h2 class="no-payment-recorded__title">
        ¿Continuar sin pago registrado?
      </h2>
      <p class="no-payment-recorded__description">
        El paciente podrá realizar el pago directamente contigo durante la
        consulta.
      </p>

      <div class="no-payment-recorded__payment-warning">
        <p class="no-payment-recorded__payment-warning--title">
          Sin registro de pago
        </p>
        <p class="no-payment-recorded__payment-warning--text">
          No tenemos registro del pago del paciente. ¿Desea continuar con la
          valoración de todas formas?
        </p>
      </div>
    </div>

    <template #footer v-if="continueWithoutPayment">
      <div class="no-payment-recorded__actions">
        <button
          :disabled="isLoading"
          class="no-payment-recorded__button--outline"
          @click="handleCloseModal"
        >
          No, cancelar
        </button>
        <button
          :disabled="isLoading"
          class="no-payment-recorded__button--primary"
          @click="handleContinueWithoutPayment"
        >
          Sí, continuar
        </button>
      </div>
    </template>

    <div v-if="!continueWithoutPayment" class="confirm-reservation__content">
      <h2 class="confirm-reservation__title">
        {{ modalTitle }}
      </h2>

      <p class="confirm-reservation__description">
        <span class="confirm-reservation__text">
          {{ statusChangeText }}
        </span>
        <span
          v-if="shouldShowNotificationText"
          class="confirm-reservation__highlight"
        >
          Le enviaremos una notificación al paciente para que acuda a la cita de
          valoración en la fecha que has confirmado
        </span>
      </p>

      <div v-if="shouldShowWarning" class="confirm-reservation__warning">
        <div class="confirm-reservation__warning-icon">
          <AtomsIconsTriangleAlertIcon size="24" />
        </div>
        <p class="confirm-reservation__warning-text">
          Asegúrate de que la fecha y hora de la cita sean correctos.
        </p>
      </div>
    </div>

    <template v-if="!continueWithoutPayment" #footer>
      <div class="confirm-reservation__actions">
        <button
          :disabled="isLoading"
          class="confirm-reservation__button confirm-reservation__button--outline"
          @click="handleCloseModal"
        >
          Cancelar
        </button>
        <button
          :disabled="isLoading"
          class="confirm-reservation__button confirm-reservation__button--primary"
          @click="handleConfirmAction"
        >
          {{ isLoading ? "Procesando..." : "Confirmar" }}
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useAppointment } from "@/composables/api";
import type { Appointment, AppointmentStatusCode } from "@/types";
import { computed, inject, ref } from "vue";

const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");

const { isOpen, closeModal, getSharedData, openModal } =
  useMedicalModalManager();

const modalData = computed(() =>
  getSharedData<{ appointment: Appointment }>("confirmacionReserva")
);

const currentAppointment = computed(() => modalData.value?.appointment);

const isModalOpen = computed(() => isOpen.confirmacionReserva);

const { confirmProcedure, setProcedureRealized, confirmValorationAppointment } =
  useAppointment();

const isLoading = ref<boolean>(false);
const continueWithoutPayment = ref<boolean>(false);

const appointmentStatus = computed(
  () => currentAppointment.value?.appointment_status.code
);

const modalTitle = computed(() => {
  const titleMap: Record<AppointmentStatusCode, string> = {
    PENDING_VALORATION_APPOINTMENT: "¿Confirmar valoración?",
    PENDING_PROCEDURE: "¿Confirmar procedimiento?",
    WAITING_PROCEDURE: "¿Finalizar procedimiento?",
    CONFIRM_PROCEDURE: "¿Finalizar procedimiento?",
    CONCRETED_APPOINTMENT: "¿Finalizar procedimiento?",
    CONFIRM_VALIDATION_APPOINTMENT: "¿Confirmar valoración?",
    CANCEL_APPOINTMENT: "¿Confirmar reserva?",
    VALUED_VALORATION_APPOINTMENT: "¿Confirmar reserva?",
    VALUATION_PENDING_VALORATION_APPOINTMENT: "¿Confirmar reserva?",
  };

  const status = appointmentStatus.value as AppointmentStatusCode | undefined;
  return status
    ? (titleMap[status] ?? "¿Confirmar reserva?")
    : "¿Confirmar reserva?";
});

const PAYMENT_WARNING_CONFIG: Record<string, string> = {
  CONFIRM_VALIDATION_APPOINTMENT:
    "PAYMENT_STATUS_NOT_PAID_VALORATION_APPOINTMENT",
  CONFIRM_PROCEDURE: "PAYMENT_STATUS_NOT_PAID_PROCEDURE",
};

const showPaymentWarningModal = computed(() => {
  const status = currentAppointment.value?.appointment_status.code;
  const paymentStatus = currentAppointment.value?.payment_status.code;
  return status && paymentStatus
    ? PAYMENT_WARNING_CONFIG[status] === paymentStatus
    : false;
});

continueWithoutPayment.value = showPaymentWarningModal.value;

const handleContinueWithoutPayment = () => {
  continueWithoutPayment.value = false;
};

const statusChangeText = computed(() => {
  const status = appointmentStatus.value;
  const isValoration =
    status === "PENDING_VALORATION_APPOINTMENT" ||
    status === "CONFIRM_VALIDATION_APPOINTMENT";

  const isProcedure = status
    ? [
        "WAITING_PROCEDURE",
        "CONFIRM_PROCEDURE",
        "CONCRETED_APPOINTMENT",
      ].includes(status)
    : false;

  if (isValoration) {
    return "Con estos cambios el estado de la solicitud de valoración pasará de: Pendiente a Confirmada";
  } else if (isProcedure) {
    return "Con estos cambios el estado de la solicitud de procedimiento pasará de: Pendiente a Concretada";
  } else if (status === "PENDING_PROCEDURE") {
    return "Con estos cambios el estado de la solicitud de valoración pasará de: Pendiente a Confirmada";
  }

  return "Con estos cambios el estado de la solicitud de reserva pasará de: Pendiente a Valorada";
});

const shouldShowNotificationText = computed(
  () => appointmentStatus.value === "PENDING_VALORATION_APPOINTMENT"
);

const shouldShowWarning = computed(
  () => appointmentStatus.value === "PENDING_VALORATION_APPOINTMENT"
);

const handleCloseModal = () => {
  closeModal("confirmacionReserva");
};

const handleConfirmAction = async () => {
  const status = appointmentStatus.value;

  const actionMap: Record<AppointmentStatusCode, () => Promise<void>> = {
    PENDING_VALORATION_APPOINTMENT: handleConfirmValorationAppointment,
    PENDING_PROCEDURE: handleConfirmProcedure,
    WAITING_PROCEDURE: handleFinishProcedure,
    CONFIRM_PROCEDURE: handleFinishProcedure,
    CONCRETED_APPOINTMENT: handleFinishProcedure,
    CONFIRM_VALIDATION_APPOINTMENT: confirmValoration,
    VALUATION_PENDING_VALORATION_APPOINTMENT: confirmValoration,
    CANCEL_APPOINTMENT: handleConfirmValorationAppointment,
    VALUED_VALORATION_APPOINTMENT: handleConfirmValorationAppointment,
  };

  if (status && status in actionMap) {
    await actionMap[status]();
  } else {
    await handleConfirmValorationAppointment();
  }
};

const handleConfirmValorationAppointment = async () => {
  await executeApiCall("confirm_valoration_appointment");
};

const handleConfirmProcedure = async () => {
  await executeApiCall("confirm_procedure");
};

const handleFinishProcedure = async () => {
  await executeApiCall("set_procedure_realized");
};

const confirmValoration = async () => {
  closeModal("detallesCita");
  openModal("subirProforma", { appointment: currentAppointment });
  handleCloseModal();
};

const executeApiCall = async (action: string) => {
  if (!currentAppointment.value) return;

  try {
    isLoading.value = true;

    let api;

    switch (action) {
      case "confirm_procedure":
        api = confirmProcedure(currentAppointment.value.id);
        break;
      case "set_procedure_realized":
        api = setProcedureRealized(currentAppointment.value.id);
        break;
      case "confirm_valoration_appointment":
        api = confirmValorationAppointment(currentAppointment.value.id);
        break;
      default:
        return;
    }

    if (!api) return;

    await api.request();

    const response = api.response.value;
    const error = api.error.value;

    if (response?.data) {
      await refreshAppointments?.();
      handleCloseModal();
      closeModal("detallesCita");
    }

    if (error) {
      console.error("Error en la operación:", error);
    }
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.confirm-reservation {
  &__content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 2rem;
    color: $color-foreground;
    margin: 0;
  }

  &__description {
    @include label-base;
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin: 0;
  }

  &__text {
    font-weight: 600;
    color: #353e5c;
  }

  &__highlight {
    font-weight: 500;
    color: $color-text-secondary;
  }

  &__warning {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border-radius: 0.75rem;
    background-color: $color-warning;
  }

  &__warning-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background-color: #fef0c7;
    color: #dc6803;
    flex-shrink: 0;
  }

  &__warning-text {
    @include label-base;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #dc6803;
    margin: 0;
  }

  &__actions {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-top: 0.0625rem solid #e5e7eb;
  }

  &__button {
    &--outline {
      @include outline-button;
      flex: 1;
    }

    &--primary {
      @include primary-button;
      flex: 1;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
}

.no-payment-recorded {
  &__content {
    padding: 0 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 1.5rem;
    color: $color-foreground;
  }

  &__description {
    @include label-base;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: $color-text-secondary;
  }

  &__payment-warning {
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.75rem;
    background-color: $color-warning;

    &--title {
      @include label-base;
      font-weight: 600;
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: #dc6803;
      margin: 0 0 0.25rem 0;
    }

    &--text {
      @include label-base;
      font-weight: 500;
      font-size: 0.8125rem;
      line-height: 1.125rem;
      color: #dc6803;
      margin: 0;
    }
  }

  &__actions {
    width: 100%;
    display: flex;
    gap: 0.75rem;
  }

  &__button {
    &--outline {
      @include outline-button;
      width: 100%;
    }
    &--primary {
      @include primary-button;
      width: 100%;
    }
  }
}
</style>
