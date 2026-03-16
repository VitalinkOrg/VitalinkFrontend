<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    size="medium"
    @close="handleClose"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
    aria-labelledby="details-modal-title"
  >
    <template #title>
      <h2 id="details-modal-title" class="details-modal__title">
        Detalles {{ modalTitleSuffix }}
      </h2>
    </template>

    <div class="details-modal__body">
      <MedicosTablaDetallesCita
        :rows="detailRows"
        aria-label="Detalles de la cita médica"
      >
        <template #data-programar-cita>
          <div
            class="details-modal__scheduling"
            role="group"
            aria-labelledby="scheduling-heading"
          >
            <span id="scheduling-heading" class="visually-hidden">
              Programar fecha y hora de la cita
            </span>

            <div class="details-modal__scheduling-fields">
              <div class="details-modal__scheduling-field">
                <label
                  for="schedule-date"
                  class="details-modal__scheduling-label"
                >
                  Fecha
                </label>
                <UiDatePicker
                  id="schedule-date"
                  v-model="scheduledDate"
                  :min-date="new Date()"
                  custom-class="details-modal__date-picker"
                  @update:model-value="handleScheduledDateChange"
                />
              </div>

              <div class="details-modal__scheduling-field">
                <label
                  for="schedule-time"
                  class="details-modal__scheduling-label"
                >
                  Hora
                </label>
                <UiDropdownBase
                  id="schedule-time"
                  v-model="scheduledTime"
                  :items="availableTimeSlots"
                  :disabled="!scheduledDate"
                  placeholder="Seleccionar hora"
                  custom-class="details-modal__time-dropdown"
                  @select="handleScheduledTimeSelect"
                >
                  <template #icon>
                    <AtomsIconsClockIcon size="20" />
                  </template>
                </UiDropdownBase>
              </div>
            </div>
          </div>
        </template>

        <template #data-validacion-credito>
          <div
            v-if="!isCreditAlreadyUsed"
            class="credit-validation"
            role="group"
            aria-labelledby="credit-validation-heading"
          >
            <span id="credit-validation-heading" class="visually-hidden">
              Validación de código QR de crédito
            </span>

            <div class="credit-validation__input-group">
              <label for="qr-code-input" class="visually-hidden">
                Código QR
              </label>
              <input
                id="qr-code-input"
                v-model="qrCode"
                type="text"
                class="credit-validation__input"
                placeholder="Escanear código QR"
                :disabled="isValidatingQr"
                :aria-describedby="qrErrorMessage ? 'qr-error' : undefined"
              />
              <button
                v-if="!isQrValidated"
                class="credit-validation__button"
                :disabled="isValidatingQr || !qrCode.trim()"
                :aria-busy="isValidatingQr"
                @click="validateQrCode"
              >
                {{ isValidatingQr ? "Validando..." : "Validar QR" }}
              </button>
              <button
                v-if="isQrValidated && !isCreditConfirmed"
                class="credit-validation__button"
                :disabled="isValidatingQr"
                @click="openCreditConfirmation"
              >
                Confirmar uso de código
              </button>
            </div>

            <p
              v-if="qrErrorMessage"
              id="qr-error"
              class="credit-validation__error"
              role="alert"
            >
              {{ qrErrorMessage }}
            </p>

            <div
              v-if="isQrValidated"
              class="cost-breakdown"
              role="region"
              aria-label="Desglose de costos"
            >
              <h3 class="cost-breakdown__title">Desglose de Costos</h3>
              <div class="cost-breakdown__row">
                <span class="cost-breakdown__label"
                  >Costo del procedimiento:</span
                >
                <span class="cost-breakdown__value">
                  {{ formatCurrency(procedureCost, { decimalPlaces: 0 }) }}
                </span>
              </div>
              <div class="cost-breakdown__row">
                <span class="cost-breakdown__label">Crédito pre-aprobado:</span>
                <span
                  class="cost-breakdown__value cost-breakdown__value--credit"
                >
                  {{
                    formatCurrency(approvedCreditAmount, { decimalPlaces: 0 })
                  }}
                </span>
              </div>
              <hr class="cost-breakdown__divider" aria-hidden="true" />
              <div class="cost-breakdown__row cost-breakdown__row--total">
                <span class="cost-breakdown__label"
                  >Saldo pendiente a pagar:</span
                >
                <span
                  class="cost-breakdown__value cost-breakdown__value--total"
                >
                  {{ formatCurrency(pendingBalance, { decimalPlaces: 0 }) }}
                </span>
              </div>
              <p v-if="pendingBalance > 0" class="cost-breakdown__note">
                El paciente deberá pagar el saldo pendiente no cubierto por el
                crédito.
              </p>
            </div>
          </div>

          <div
            v-else
            class="cost-breakdown"
            role="region"
            aria-label="Desglose de costos"
          >
            <h3 class="cost-breakdown__title">Desglose de Costos</h3>
            <div class="cost-breakdown__row">
              <span class="cost-breakdown__label"
                >Costo del procedimiento:</span
              >
              <span class="cost-breakdown__value">
                {{ formatCurrency(procedureCost, { decimalPlaces: 0 }) }}
              </span>
            </div>
            <div class="cost-breakdown__row">
              <span class="cost-breakdown__label">Crédito pre-aprobado:</span>
              <span class="cost-breakdown__value cost-breakdown__value--credit">
                {{ formatCurrency(approvedCreditAmount, { decimalPlaces: 0 }) }}
              </span>
            </div>
            <hr class="cost-breakdown__divider" aria-hidden="true" />
            <div class="cost-breakdown__row cost-breakdown__row--total">
              <span class="cost-breakdown__label"
                >Saldo pendiente a pagar:</span
              >
              <span class="cost-breakdown__value cost-breakdown__value--total">
                {{ formatCurrency(pendingBalance, { decimalPlaces: 0 }) }}
              </span>
            </div>
            <p v-if="pendingBalance > 0" class="cost-breakdown__note">
              El paciente deberá pagar el saldo pendiente no cubierto por el
              crédito.
            </p>
          </div>
        </template>

        <template #data-costo>
          <div
            v-if="shouldShowPaidCostBreakdown"
            class="cost-breakdown cost-breakdown--compact"
            role="region"
            aria-label="Desglose de costos"
          >
            <div class="cost-breakdown__row">
              <span class="cost-breakdown__label"
                >Costo del procedimiento:</span
              >
              <span class="cost-breakdown__value">
                {{ formatCurrency(procedureCost, { decimalPlaces: 0 }) }}
              </span>
            </div>
            <div class="cost-breakdown__row">
              <span class="cost-breakdown__label">Crédito pre-aprobado:</span>
              <span class="cost-breakdown__value cost-breakdown__value--credit">
                {{ formatCurrency(0, { decimalPlaces: 0 }) }}
              </span>
            </div>
            <hr class="cost-breakdown__divider" aria-hidden="true" />
            <div class="cost-breakdown__row cost-breakdown__row--total">
              <span class="cost-breakdown__label"
                >Saldo pagado por el paciente:</span
              >
              <span class="cost-breakdown__value cost-breakdown__value--total">
                {{ formatCurrency(procedureCost, { decimalPlaces: 0 }) }}
              </span>
            </div>
          </div>
          <span v-else class="details-modal__cost-pending">
            A confirmar en la cita
          </span>
        </template>

        <template #data-estado-cita>
          <span :class="statusBadgeClass">
            {{ appointment?.appointment_status?.value1 }}
          </span>
        </template>
      </MedicosTablaDetallesCita>

      <div
        v-if="isPendingConfirmation"
        class="details-modal__reminder"
        role="note"
        aria-labelledby="coordination-note"
      >
        <div class="details-modal__reminder-content">
          <AtomsIconsInfoIcon width="12" height="12" aria-hidden="true" />
          <p id="coordination-note" class="details-modal__reminder-text">
            Asegúrate de coordinar con el paciente antes de confirmar la cita
          </p>
        </div>
      </div>
    </div>

    <template #footer v-if="hasFooterActions">
      <div
        class="details-modal__actions"
        role="group"
        aria-label="Acciones de la cita"
      >
        <template v-if="isPendingConfirmation">
          <button
            v-if="appointment.appointment_status.code === 'PENDING_PROCEDURE'"
            class="details-modal__action details-modal__action--outline details-modal__action--full"
            @click="openReschedule"
          >
            <AtomsIconsSquarePenIcon size="20" />
            Editar Fecha y Hora
          </button>
          <button
            class="details-modal__action details-modal__action--primary details-modal__action--full"
            :disabled="!canConfirmReservation"
            @click="openReservationConfirmation"
          >
            Confirmar reserva
          </button>
        </template>

        <template v-else>
          <button
            class="details-modal__action details-modal__action--danger"
            @click="openCancellation"
          >
            Anular cita
          </button>
          <button
            class="details-modal__action details-modal__action--outline"
            @click="openReschedule"
          >
            Reprogramar
          </button>
          <button
            class="details-modal__action details-modal__action--primary"
            :disabled="isCompletionBlocked"
            @click="openReservationConfirmation"
          >
            Marcar como concretado
          </button>
        </template>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useAppointmentCredit } from "@/composables/api";
import { useFormat } from "@/composables/useFormat";
import { useLogger } from "@/composables/useLogger";
import { useMedicalModalManager } from "@/composables/useMedicalModalManager";
import type { TablaBaseRow } from "../tabla-detalles-cita.vue";

interface DropdownItem {
  value: string | number;
  label: string;
}

const { isOpen, closeModal, getSharedData, openModal } =
  useMedicalModalManager();
const { getAllAppointmentCreditByQrCode } = useAppointmentCredit();
const { formatDate, formatTime, formatCurrency } = useFormat();
const logger = useLogger("DetallesCita");

const isModalOpen = computed(() => isOpen.detallesCita);

const modalData = computed(() =>
  getSharedData<{ appointment: IAppointment }>("detallesCita"),
);

const appointment = computed(() => modalData.value?.appointment);

const qrCode = ref("");
const isValidatingQr = ref(false);
const isQrValidated = ref(false);
const isCreditConfirmed = ref(false);
const validatedCreditId = ref<number | null>(null);
const validatedCreditAmount = ref(0);
const qrErrorMessage = ref("");

const scheduledDate = ref<Date | null>(null);
const scheduledTime = ref<string>("");

const availableTimeSlots: DropdownItem[] = [
  { value: "08:00", label: "08:00" },
  { value: "08:30", label: "08:30" },
  { value: "09:00", label: "09:00" },
  { value: "09:30", label: "09:30" },
  { value: "10:00", label: "10:00" },
  { value: "10:30", label: "10:30" },
  { value: "11:00", label: "11:00" },
  { value: "11:30", label: "11:30" },
  { value: "12:00", label: "12:00" },
  { value: "13:00", label: "13:00" },
  { value: "13:30", label: "13:30" },
  { value: "14:00", label: "14:00" },
  { value: "14:30", label: "14:30" },
  { value: "15:00", label: "15:00" },
  { value: "15:30", label: "15:30" },
  { value: "16:00", label: "16:00" },
  { value: "16:30", label: "16:30" },
  { value: "17:00", label: "17:00" },
];

const handleScheduledDateChange = (_date: Date | null) => {
  scheduledTime.value = "";
};

const handleScheduledTimeSelect = (item: DropdownItem) => {
  scheduledTime.value = String(item.value);
};

const statusCode = computed(
  () => appointment.value?.appointment_status?.code ?? "",
);

const procedureCost = computed(() =>
  parseFloat(appointment.value?.price_procedure ?? "0"),
);

const approvedCreditAmount = computed(() =>
  Number(appointment.value?.appointment_credit?.approved_amount ?? 0),
);

const pendingBalance = computed(() =>
  Math.max(0, procedureCost.value - approvedCreditAmount.value),
);

const isCreditAlreadyUsed = computed(
  () => appointment.value?.appointment_credit?.already_been_used === 1,
);

const hasCredit = computed(() =>
  Boolean(appointment.value?.appointment_credit),
);

const PENDING_STATUSES: string[] = [
  "PENDING_VALORATION_APPOINTMENT",
  "PENDING_PROCEDURE",
];

const PROCEDURE_STATUSES: string[] = ["CONFIRM_PROCEDURE", "WAITING_PROCEDURE"];

const TERMINAL_STATUSES: string[] = [
  "CANCEL_APPOINTMENT",
  "CONCRETED_APPOINTMENT",
];

const isPendingConfirmation = computed(() =>
  PENDING_STATUSES.includes(statusCode.value),
);

const isPendingValoration = computed(
  () => statusCode.value === "PENDING_VALORATION_APPOINTMENT",
);

const isInProcedurePhase = computed(() =>
  PROCEDURE_STATUSES.includes(statusCode.value),
);

const isTerminal = computed(() => TERMINAL_STATUSES.includes(statusCode.value));

const hasScheduleCompleted = computed(
  () => scheduledDate.value !== null && scheduledTime.value !== "",
);

const canConfirmReservation = computed(() => {
  if (isPendingValoration.value) return hasScheduleCompleted.value;
  return true;
});

const isCompletionBlocked = computed(() => {
  if (!hasCredit.value || !isInProcedurePhase.value) return false;
  return !isCreditAlreadyUsed.value && !isCreditConfirmed.value;
});

const hasFooterActions = computed(() => !isTerminal.value);

const modalTitleSuffix = computed(() => {
  const typeCode = appointment.value?.appointment_type?.code;
  if (typeCode === "VALORATION_APPOINTMENT") return "de la Cita de valoración";
  if (statusCode.value === "WAITING_PROCEDURE") return "del procedimiento";
  return "de la reserva";
});

const shouldShowCreditRow = computed(
  () => hasCredit.value && isInProcedurePhase.value,
);

const shouldShowPaidCostBreakdown = computed(() => {
  const apt = appointment.value;
  if (!apt) return false;

  const paymentCode = apt.payment_status?.code ?? "";
  const hasPaid =
    paymentCode === "PAYMENT_STATUS_PAID_VALORATION_APPOINTMENT" ||
    paymentCode === "PAYMENT_STATUS_PAID_PROCEDURE";

  const noCreditOrZero =
    !apt.appointment_credit ||
    Number(apt.appointment_credit.approved_amount ?? 0) === 0;

  return (
    procedureCost.value > 0 &&
    isInProcedurePhase.value &&
    hasPaid &&
    noCreditOrZero
  );
});

const STATUS_BADGE_MAP: Record<string, string> = {
  CANCEL_APPOINTMENT: "status-badge--cancelled",
  PENDING_VALORATION_APPOINTMENT: "status-badge--warning",
  PENDING_PROCEDURE: "status-badge--warning",
  CONFIRM_PROCEDURE: "status-badge--primary",
  CONCRETED_APPOINTMENT: "status-badge--primary",
  VALUED_VALORATION_APPOINTMENT: "status-badge--success",
  CONFIRM_VALIDATION_APPOINTMENT: "status-badge--success",
  VALUATION_PENDING_VALORATION_APPOINTMENT: "status-badge--primary",
  WAITING_PROCEDURE: "status-badge--warning",
};

const statusBadgeClass = computed(
  () => STATUS_BADGE_MAP[statusCode.value] ?? "",
);

const detailRows = computed((): TablaBaseRow[] => {
  const apt = appointment.value;
  if (!apt) return [];

  const rows: TablaBaseRow[] = [
    {
      key: "paciente",
      header: "Paciente:",
      value: apt.customer.name,
    },
    {
      key: "tipo-servicio",
      header: "Tipo de servicio:",
      value: apt.appointment_type.name,
    },
    {
      key: "fecha",
      header: "Fecha de la cita:",
      value: apt.appointment_date ? formatDate(apt.appointment_date) : "—",
    },
    {
      key: "hora",
      header: "Hora de la cita:",
      value: apt.appointment_hour
        ? formatTime(apt.appointment_hour, "hs")
        : "—",
      isEndRow: true,
    },
    {
      key: "procedimiento",
      header: "Procedimiento:",
      value: apt.package?.procedure?.name,
    },
    {
      key: "motivo",
      header: "Motivo:",
      value: apt.user_description,
    },
    {
      key: "costo",
      header: "Costo del servicio:",
      value: shouldShowPaidCostBreakdown.value
        ? undefined
        : "A confirmar en la cita",
    },
    {
      key: "fecha-solicitud",
      header: "Fecha de la solicitud:",
      value: formatDate(apt.application_date, "short"),
    },
    {
      key: "tipo-reserva",
      header: "Tipo de reserva:",
      value: apt.reservation_type.value1,
    },
    {
      key: "estado-cita",
      header: "Estado de la cita:",
      value: apt.appointment_status.value1,
    },
    {
      key: "cedula-usuario",
      header: "Cédula:",
      value: apt.customer.card_id,
    },
  ];

  if (isPendingValoration.value) {
    rows.push({
      key: "programar-cita",
      header: "Programar cita:",
      value: " ",
    });
  }

  if (shouldShowCreditRow.value) {
    rows.push({
      key: "validacion-credito",
      header: "Validación de Crédito:",
      value: " ",
    });
  }

  return rows;
});

const validateQrCode = async (): Promise<void> => {
  const code = qrCode.value.trim();
  qrErrorMessage.value = "";

  if (!code) {
    qrErrorMessage.value = "Por favor ingrese un código QR válido.";
    return;
  }

  isValidatingQr.value = true;

  try {
    const { data, error } = await getAllAppointmentCreditByQrCode(code);

    if (error) {
      qrErrorMessage.value = error.info || "Error al validar el código QR.";
      logger.error("QR validation failed", { code, error: error.info });
      return;
    }

    if (!data || data.length === 0) {
      qrErrorMessage.value =
        "No se encontró crédito asociado a este código QR.";
      return;
    }

    const credit = data[0];

    if (credit.already_been_used === 1) {
      qrErrorMessage.value = "Este código QR ya fue utilizado.";
      return;
    }

    isQrValidated.value = true;
    validatedCreditAmount.value = parseFloat(credit.approved_amount);
    validatedCreditId.value = credit.id;

    logger.debug("QR validated successfully", { creditId: credit.id });
  } catch (err) {
    qrErrorMessage.value = "Error inesperado al validar el código QR.";
    logger.error("QR validation threw unexpectedly", {
      error: err instanceof Error ? err.message : String(err),
    });
  } finally {
    isValidatingQr.value = false;
  }
};

const openReservationConfirmation = () => {
  const payload: Record<string, unknown> = {
    appointment: appointment.value,
  };

  if (isPendingValoration.value && hasScheduleCompleted.value) {
    payload.scheduledDate = scheduledDate.value;
    payload.scheduledTime = scheduledTime.value;
  }

  openModal("confirmacionReserva", payload);
};

const openCancellation = () => {
  openModal("anularCita", { appointment: appointment.value });
};

const openEditorFechaHora = () => {
  openModal("editorFechaHora", { appointment: appointment.value });
};

const openReschedule = () => {
  openModal("editorFechaHora", { appointment: appointment.value });
};

const openCreditConfirmation = () => {
  openModal("confirmarCodigo", {
    creditId: validatedCreditId.value,
    creditAmount: validatedCreditAmount.value,
    onSuccess: () => {
      isCreditConfirmed.value = true;
    },
  });
};

const resetState = () => {
  qrCode.value = "";
  isValidatingQr.value = false;
  isQrValidated.value = false;
  isCreditConfirmed.value = false;
  validatedCreditId.value = null;
  validatedCreditAmount.value = 0;
  qrErrorMessage.value = "";
  scheduledDate.value = null;
  scheduledTime.value = "";
};

const handleClose = () => {
  closeModal("detallesCita");
  resetState();
};

watch(isModalOpen, (open) => {
  if (!open) resetState();
});
</script>

<style lang="scss" scoped>
.visually-hidden {
  @include visually-hidden;
}

.details-modal {
  &__title {
    font-family: $font-family-main;
    font-weight: 600;
    font-size: 1.25rem;
    line-height: 1.75rem;
    color: #353e5c;
    margin: 0;
  }

  &__body {
    padding: 1.5rem;
  }

  &__cost-pending {
    @include label-base;
    font-weight: 400;
    color: $color-text-secondary;
  }

  &__scheduling {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__scheduling-fields {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__scheduling-field {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  &__scheduling-label {
    @include label-base;
    font-weight: 500;
    font-size: 0.8125rem;
    color: $color-text-secondary;
    margin-bottom: 0.125rem;
  }

  &__reminder {
    margin-top: $spacing-md;
  }

  &__reminder-content {
    display: flex;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background-color: #eff8ff;
    color: #175cd3;
    border-radius: 1rem;
    gap: $spacing-xs;
  }

  &__reminder-text {
    @include label-base;
    margin: 0;
    font-weight: 500;
    font-size: 0.75rem;
    line-height: 1.125rem;
    color: #175cd3;
    flex: 1;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
  }

  &__action {
    &--danger {
      @include outline-danger-button;
      border: none;
    }

    &--outline {
      @include outline-button;
    }

    &--primary {
      @include primary-button;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    &--full {
      width: 100%;
    }
  }
}

.credit-validation {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  &__input-group {
    display: flex;
    gap: 0.75rem;
  }

  &__input {
    @include input-base;
    padding: 10px 14px;
    height: auto;
    min-width: 5rem;
    flex: 1;
  }

  &__button {
    @include primary-button;
    white-space: nowrap;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__error {
    @include label-base;
    color: $color-danger;
    font-size: 0.75rem;
    font-weight: 500;
    margin: 0;
  }
}

.cost-breakdown {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;

  &--compact {
    margin-top: 0;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.25rem;
    margin-bottom: 0.75rem;
    color: $color-foreground;
  }

  &__row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;

    &--total {
      padding-top: 0.75rem;

      .cost-breakdown__label {
        font-weight: 600;
        color: $color-foreground;
      }
    }
  }

  &__label {
    @include label-base;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: $color-text-secondary;
  }

  &__value {
    @include label-base;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: $color-foreground;

    &--credit {
      color: #28a745;
      font-weight: 600;
    }

    &--total {
      font-size: 1rem;
      line-height: 1.5rem;
      font-weight: 700;
      color: $color-foreground;
    }
  }

  &__divider {
    border: none;
    border-top: 1px solid #dee2e6;
    margin: 0.5rem 0;
  }

  &__note {
    @include label-base;
    margin-top: 0.75rem;
    font-weight: 400;
    font-size: 0.8125rem;
    line-height: 1.125rem;
    color: $color-text-secondary;
    font-style: italic;
  }
}
</style>
