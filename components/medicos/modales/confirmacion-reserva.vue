<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    size="extra-small"
    @close="handleClose"
    aria-labelledby="confirm-modal-title"
  >
    <div v-if="showPaymentWarning" class="payment-warning__content">
      <h2 id="confirm-modal-title" class="payment-warning__title">
        ¿Continuar sin pago registrado?
      </h2>
      <p class="payment-warning__description">
        El paciente podrá realizar el pago directamente contigo durante la
        consulta.
      </p>

      <div class="payment-warning__alert" role="alert">
        <p class="payment-warning__alert-title">Sin registro de pago</p>
        <p class="payment-warning__alert-text">
          No tenemos registro del pago del paciente. ¿Desea continuar con la
          valoración de todas formas?
        </p>
      </div>
    </div>

    <template v-if="showPaymentWarning" #footer>
      <div class="payment-warning__actions">
        <button
          :disabled="isProcessing"
          class="payment-warning__action payment-warning__action--outline"
          @click="handleClose"
        >
          No, cancelar
        </button>
        <button
          :disabled="isProcessing"
          class="payment-warning__action payment-warning__action--primary"
          @click="dismissPaymentWarning"
        >
          Sí, continuar
        </button>
      </div>
    </template>

    <div v-if="!showPaymentWarning" class="confirm-modal__content">
      <h2 id="confirm-modal-title" class="confirm-modal__title">
        {{ title }}
      </h2>

      <div class="confirm-modal__description">
        <p class="confirm-modal__status-text">
          {{ statusChangeDescription }}
        </p>
        <p v-if="isPendingValoration" class="confirm-modal__notification-text">
          Le enviaremos una notificación al paciente para que acuda a la cita de
          valoración en la fecha que has confirmado
        </p>
      </div>

      <div
        v-if="isPendingValoration"
        class="confirm-modal__warning"
        role="alert"
      >
        <div class="confirm-modal__warning-icon" aria-hidden="true">
          <AtomsIconsTriangleAlertIcon size="24" />
        </div>
        <p class="confirm-modal__warning-text">
          Asegúrate de que la fecha y hora de la cita sean correctos.
        </p>
      </div>
    </div>

    <template v-if="!showPaymentWarning" #footer>
      <div class="confirm-modal__actions">
        <button
          :disabled="isProcessing"
          class="confirm-modal__action confirm-modal__action--outline"
          @click="handleClose"
        >
          Cancelar
        </button>
        <button
          :disabled="isProcessing"
          class="confirm-modal__action confirm-modal__action--primary"
          :aria-busy="isProcessing"
          @click="handleConfirm"
        >
          {{ isProcessing ? "Procesando..." : "Confirmar" }}
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useAppointment } from "@/composables/api";
import { useFormat } from "@/composables/useFormat";
import { useLogger } from "@/composables/useLogger";
import { useMedicalModalManager } from "@/composables/useMedicalModalManager";

interface ConfirmModalData {
  appointment: IAppointment;
  scheduledDate?: Date | null;
  scheduledTime?: string;
}

const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");

const logger = useLogger("ConfirmacionReserva");
const toast = useToast();
const { formatDate, formatTime } = useFormat();

const { isOpen, closeModal, getSharedData, openModal } =
  useMedicalModalManager();

const {
  confirmProcedure,
  setProcedureRealized,
  confirmValorationAppointment,
  updateAppointment,
} = useAppointment();

const isModalOpen = computed(() => isOpen.confirmacionReserva);

const modalData = computed(() =>
  getSharedData<ConfirmModalData>("confirmacionReserva"),
);

const appointment = computed(() => modalData.value?.appointment);

const scheduledDate = computed(() => modalData.value?.scheduledDate ?? null);

const scheduledTime = computed(() => modalData.value?.scheduledTime ?? "");

const hasScheduledDateTime = computed(
  () => scheduledDate.value !== null && scheduledTime.value !== "",
);

const formattedScheduledDate = computed(() =>
  scheduledDate.value ? formatDate(scheduledDate.value, "full") : "",
);

const formattedScheduledTime = computed(() =>
  scheduledTime.value ? formatTime(scheduledTime.value, "hs") : "",
);

const statusCode = computed(
  () => appointment.value?.appointment_status?.code ?? "",
);

const paymentCode = computed(
  () => appointment.value?.payment_status?.code ?? "",
);

const isProcessing = ref(false);
const showPaymentWarning = ref(false);
const warningDismissed = ref(false);

const isPendingValoration = computed(
  () => statusCode.value === "PENDING_VALORATION_APPOINTMENT",
);

const UNPAID_STATUS_MAP: Record<string, string> = {
  CONFIRM_VALIDATION_APPOINTMENT:
    "PAYMENT_STATUS_NOT_PAID_VALORATION_APPOINTMENT",
  CONFIRM_PROCEDURE: "PAYMENT_STATUS_NOT_PAID_PROCEDURE",
};

const requiresPaymentWarning = computed(() => {
  const expectedPaymentCode = UNPAID_STATUS_MAP[statusCode.value];
  if (!expectedPaymentCode) return false;
  return paymentCode.value === expectedPaymentCode;
});

watch(
  [isModalOpen, appointment],
  ([open, apt]) => {
    if (open && apt && !warningDismissed.value) {
      showPaymentWarning.value = requiresPaymentWarning.value;
    }
  },
  { immediate: true },
);

const dismissPaymentWarning = () => {
  showPaymentWarning.value = false;
  warningDismissed.value = true;
};

const TITLE_MAP: Record<string, string> = {
  PENDING_VALORATION_APPOINTMENT: "¿Confirmar valoración?",
  PENDING_PROCEDURE: "¿Confirmar procedimiento?",
  WAITING_PROCEDURE: "¿Finalizar procedimiento?",
  CONFIRM_PROCEDURE: "¿Finalizar procedimiento?",
  CONCRETED_APPOINTMENT: "¿Finalizar procedimiento?",
  CONFIRM_VALIDATION_APPOINTMENT: "¿Confirmar valoración?",
};

const title = computed(
  () => TITLE_MAP[statusCode.value] ?? "¿Confirmar reserva?",
);

const statusChangeDescription = computed(() => {
  const status = statusCode.value;

  const isValoration =
    status === "PENDING_VALORATION_APPOINTMENT" ||
    status === "CONFIRM_VALIDATION_APPOINTMENT";

  const isProcedureFinish = [
    "WAITING_PROCEDURE",
    "CONFIRM_PROCEDURE",
    "CONCRETED_APPOINTMENT",
  ].includes(status);

  if (isValoration || status === "PENDING_PROCEDURE") {
    return "Con estos cambios el estado de la solicitud de valoración pasará de: Pendiente a Confirmada";
  }

  if (isProcedureFinish) {
    return "Con estos cambios el estado de la solicitud de procedimiento pasará de: Pendiente a Concretada";
  }

  return "Con estos cambios el estado de la solicitud de reserva pasará de: Pendiente a Valorada";
});

const ACTION_MAP: Record<string, string> = {
  PENDING_VALORATION_APPOINTMENT: "confirmValoration",
  PENDING_PROCEDURE: "confirmProcedure",
  WAITING_PROCEDURE: "finishProcedure",
  CONFIRM_PROCEDURE: "finishProcedure",
  CONCRETED_APPOINTMENT: "finishProcedure",
  CONFIRM_VALIDATION_APPOINTMENT: "uploadProforma",
  VALUATION_PENDING_VALORATION_APPOINTMENT: "uploadProforma",
};

const handleConfirm = async () => {
  const action = ACTION_MAP[statusCode.value] ?? "confirmValoration";

  const handlers: Record<string, () => Promise<void>> = {
    confirmValoration: executeConfirmValoration,
    confirmProcedure: executeConfirmProcedure,
    finishProcedure: executeFinishProcedure,
    uploadProforma: navigateToProforma,
  };

  await handlers[action]();
};

const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const executeConfirmValoration = async () => {
  const apt = appointment.value;
  if (!apt) return;

  isProcessing.value = true;

  try {
    if (
      isPendingValoration.value &&
      scheduledDate.value &&
      scheduledTime.value
    ) {
      const { error: updateError } = await updateAppointment(apt.id, {
        appointment_date: formatDateForApi(scheduledDate.value),
        appointment_hour: scheduledTime.value,
      });

      if (updateError) {
        logger.error("Failed to update appointment schedule", {
          appointmentId: apt.id,
          error: updateError.info,
        });
        toast.error(
          "No se pudo actualizar la fecha y hora de la cita. Intenta de nuevo.",
        );
        return;
      }
    }

    const { error } = await confirmValorationAppointment(apt.id);

    if (error) {
      logger.error("Failed to confirm valoration", {
        appointmentId: apt.id,
        error: error.info,
      });
      toast.error(
        "Hubo un problema al confirmar la cita. Vuelve a intentarlo más tarde.",
      );
      return;
    }

    await onSuccess();
  } catch (err) {
    logger.error("Unexpected error confirming valoration", {
      error: err instanceof Error ? err.message : String(err),
    });
    toast.error("Ocurrió un error inesperado. Intenta de nuevo.");
  } finally {
    isProcessing.value = false;
  }
};

const executeConfirmProcedure = async () => {
  const apt = appointment.value;
  if (!apt) return;

  isProcessing.value = true;

  try {
    if (scheduledDate.value && scheduledTime.value) {
      const { error: updateError } = await updateAppointment(apt.id, {
        appointment_date: formatDateForApi(scheduledDate.value),
        appointment_hour: scheduledTime.value,
      });

      if (updateError) {
        logger.error("Failed to update procedure schedule", {
          appointmentId: apt.id,
          error: updateError.info,
        });
        toast.error(
          "No se pudo actualizar la fecha y hora de la cita. Intenta de nuevo.",
        );
        return;
      }
    }

    const { error } = await confirmProcedure(apt.id);

    if (error) {
      logger.error("Failed to confirm procedure", {
        appointmentId: apt.id,
        error: error.info,
      });
      toast.error(
        "Hubo un problema al confirmar el procedimiento. Intenta de nuevo.",
      );
      return;
    }

    await onSuccess();
  } catch (err) {
    logger.error("Unexpected error confirming procedure", {
      error: err instanceof Error ? err.message : String(err),
    });
    toast.error("Ocurrió un error inesperado. Intenta de nuevo.");
  } finally {
    isProcessing.value = false;
  }
};

const executeFinishProcedure = async () => {
  const apt = appointment.value;
  if (!apt) return;

  isProcessing.value = true;

  try {
    const { error } = await setProcedureRealized(apt.id);

    if (error) {
      logger.error("Failed to finish procedure", {
        appointmentId: apt.id,
        error: error.info,
      });
      toast.error(
        "Hubo un problema al finalizar el procedimiento. Intenta de nuevo.",
      );
      return;
    }

    await onSuccess();
  } catch (err) {
    logger.error("Unexpected error finishing procedure", {
      error: err instanceof Error ? err.message : String(err),
    });
    toast.error("Ocurrió un error inesperado. Intenta de nuevo.");
  } finally {
    isProcessing.value = false;
  }
};

const navigateToProforma = async () => {
  closeModal("detallesCita");
  openModal("subirProforma", { appointment: appointment.value });
  handleClose();
};

const onSuccess = async () => {
  await refreshAppointments?.();
  handleClose();
  closeModal("detallesCita");
};

const handleClose = () => {
  closeModal("confirmacionReserva");
  showPaymentWarning.value = false;
  warningDismissed.value = false;
};
</script>

<style lang="scss" scoped>
.confirm-modal {
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
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__status-text {
    @include label-base;
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: #353e5c;
    margin: 0;
  }

  &__notification-text {
    @include label-base;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: $color-text-secondary;
    margin: 0;
  }

  &__schedule {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background-color: #f8f9fc;
    border-radius: 0.5rem;
    border: 1px solid #e4e7ec;
  }

  &__schedule-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__schedule-label {
    @include label-base;
    font-weight: 500;
    font-size: 0.875rem;
    color: $color-text-secondary;
  }

  &__schedule-value {
    @include label-base;
    font-weight: 600;
    font-size: 0.875rem;
    color: $color-foreground;
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
  }

  &__action {
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

.payment-warning {
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
    margin: 0;
  }

  &__description {
    @include label-base;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: $color-text-secondary;
    margin: 0;
  }

  &__alert {
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.75rem;
    background-color: $color-warning;
  }

  &__alert-title {
    @include label-base;
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #dc6803;
    margin: 0 0 0.25rem 0;
  }

  &__alert-text {
    @include label-base;
    font-weight: 500;
    font-size: 0.8125rem;
    line-height: 1.125rem;
    color: #dc6803;
    margin: 0;
  }

  &__actions {
    width: 100%;
    display: flex;
    gap: 0.75rem;
  }

  &__action {
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
