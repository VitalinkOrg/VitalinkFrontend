<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    size="medium"
    @close="handleCloseModal"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
  >
    <template #title>
      <h1 id="appointment-modal-title" class="appointment-details__title">
        Detalles
        {{
          currentAppointment?.appointment_type?.code ===
          "VALORATION_APPOINTMENT"
            ? "de la Cita de valoración"
            : currentAppointment?.appointment_status?.code ===
                "WAITING_PROCEDURE"
              ? "del procedimiento"
              : "de la reserva"
        }}
      </h1>
    </template>

    <div class="appointment-details__body">
      <MedicosTablaDetallesCita
        :rows="appointmentRowsWithData"
        aria-label="Detalles de la cita médica"
      >
        <template #data-validacion-credito>
          <div
            v-if="!creditAlreadyBeenUsed"
            class="appointment-details__validate-qr-wrapper"
          >
            <div class="appointment-details__validate-qr-group">
              <label for="validate-qr" class="visually-hidden"
                >Validar QR</label
              >
              <input
                v-model="qrCodeInput"
                type="text"
                id="validate-qr"
                class="appointment-details__input"
                placeholder="Escanear código QR"
                :disabled="isLoading"
              />
              <button
                v-if="!qrValidated"
                class="appointment-details__button appointment-details__button--nowrap appointment-details__button--primary"
                :disabled="isLoading || !qrCodeInput.trim()"
                @click="handleValidateQRCode"
              >
                {{ isLoading ? "Validando..." : "Validar QR" }}
              </button>
              <button
                v-if="qrValidated && !creditUsed"
                class="appointment-details__button--nowrap appointment-details__button appointment-details__button--primary"
                :disabled="isLoading"
                @click="openConfirmarCodigo"
              >
                Confirmar uso de código
              </button>
            </div>

            <div v-if="errorMessage" class="appointment-details__error-message">
              {{ errorMessage }}
            </div>

            <div v-if="qrValidated" class="appointment-details__cost-breakdown">
              <h3 class="appointment-details__breakdown-title">
                Desglose de Costos
              </h3>
              <div class="appointment-details__breakdown-item">
                <span class="appointment-details__breakdown-label"
                  >Costo del procedimiento:</span
                >
                <span class="appointment-details__breakdown-value">
                  {{ formatCurrency(procedureCost, { decimalPlaces: 0 }) }}
                </span>
              </div>
              <div class="appointment-details__breakdown-item">
                <span class="appointment-details__breakdown-label"
                  >Crédito pre-aprobado:</span
                >
                <span
                  class="appointment-details__breakdown-value appointment-details__breakdown-value--credit"
                >
                  {{
                    formatCurrency(
                      currentAppointment?.appointment_credit?.approved_amount ??
                        0,
                      { decimalPlaces: 0 }
                    )
                  }}
                </span>
              </div>
              <div class="appointment-details__breakdown-divider"></div>
              <div
                class="appointment-details__breakdown-item appointment-details__breakdown-item--total"
              >
                <span class="appointment-details__breakdown-label"
                  >Saldo pendiente a pagar:</span
                >
                <span
                  class="appointment-details__breakdown-value appointment-details__breakdown-value--total"
                >
                  {{ formatCurrency(pendingBalance, { decimalPlaces: 0 }) }}
                </span>
              </div>
              <p
                v-if="pendingBalance > 0"
                class="appointment-details__breakdown-note"
              >
                El paciente deberá pagar el saldo pendiente no cubierto por el
                crédito.
              </p>
            </div>
          </div>

          <div v-else class="appointment-details__cost-breakdown">
            <h3 class="appointment-details__breakdown-title">
              Desglose de Costos
            </h3>
            <div class="appointment-details__breakdown-item">
              <span class="appointment-details__breakdown-label"
                >Costo del procedimiento:</span
              >
              <span class="appointment-details__breakdown-value">
                {{ formatCurrency(procedureCost, { decimalPlaces: 0 }) }}
              </span>
            </div>
            <div class="appointment-details__breakdown-item">
              <span class="appointment-details__breakdown-label"
                >Crédito pre-aprobado:</span
              >
              <span
                class="appointment-details__breakdown-value appointment-details__breakdown-value--credit"
              >
                {{
                  formatCurrency(
                    currentAppointment?.appointment_credit?.approved_amount ??
                      0,
                    { decimalPlaces: 0 }
                  )
                }}
              </span>
            </div>
            <div class="appointment-details__breakdown-divider"></div>
            <div
              class="appointment-details__breakdown-item appointment-details__breakdown-item--total"
            >
              <span class="appointment-details__breakdown-label"
                >Saldo pendiente a pagar:</span
              >
              <span
                class="appointment-details__breakdown-value appointment-details__breakdown-value--total"
              >
                {{ formatCurrency(pendingBalance, { decimalPlaces: 0 }) }}
              </span>
            </div>
            <p
              v-if="pendingBalance > 0"
              class="appointment-details__breakdown-note"
            >
              El paciente deberá pagar el saldo pendiente no cubierto por el
              crédito.
            </p>
          </div>
        </template>

        <template #data-costo>
          <div
            v-if="shouldShowCostBreakdown"
            class="appointment-details__cost-breakdown appointment-details__cost-breakdown--compact"
          >
            <div class="appointment-details__breakdown-item">
              <span class="appointment-details__breakdown-label"
                >Costo del procedimiento:</span
              >
              <span class="appointment-details__breakdown-value">
                {{ formatCurrency(procedureCost, { decimalPlaces: 0 }) }}
              </span>
            </div>
            <div class="appointment-details__breakdown-item">
              <span class="appointment-details__breakdown-label"
                >Crédito pre-aprobado:</span
              >
              <span
                class="appointment-details__breakdown-value appointment-details__breakdown-value--credit"
              >
                {{ formatCurrency(0, { decimalPlaces: 0 }) }}
              </span>
            </div>
            <div class="appointment-details__breakdown-divider"></div>
            <div
              class="appointment-details__breakdown-item appointment-details__breakdown-item--total"
            >
              <span class="appointment-details__breakdown-label"
                >Saldo pagado por el paciente:</span
              >
              <span
                class="appointment-details__breakdown-value appointment-details__breakdown-value--total"
              >
                {{ formatCurrency(procedureCost, { decimalPlaces: 0 }) }}
              </span>
            </div>
          </div>
          <span v-else>A confirmar en la cita</span>
        </template>

        <template #data-estado-cita>
          <span
            :class="
              getStatusClass(currentAppointment?.appointment_status?.code)
            "
          >
            {{ currentAppointment?.appointment_status?.value1 }}
          </span>
        </template>
      </MedicosTablaDetallesCita>

      <div
        v-if="shouldShowCoordinationReminder"
        class="appointment-details__information-banner"
      >
        <div
          class="appointment-details__info-alert"
          role="note"
          aria-labelledby="coordination-reminder"
        >
          <AtomsIconsInfoIcon width="12" height="12" aria-hidden="true" />
          <p id="coordination-reminder" class="appointment-details__info-text">
            Asegúrate de coordinar con el paciente antes de confirmar con la
            cita
          </p>
        </div>
      </div>
    </div>

    <template
      #footer
      v-if="
        currentAppointment?.appointment_status?.code !== 'CANCEL_APPOINTMENT' &&
        currentAppointment?.appointment_status?.code !== 'CONCRETED_APPOINTMENT'
      "
    >
      <div
        v-if="
          currentAppointment?.appointment_status.code ===
            'PENDING_VALORATION_APPOINTMENT' ||
          currentAppointment?.appointment_status.code === 'PENDING_PROCEDURE'
        "
        class="appointment-details__actions"
      >
        <button
          class="appointment-details__button--outline appointment-details__button--full"
          @click="openEditorFechaHora"
        >
          <AtomsIconsSquarePenIcon size="20" />
          Editar Fecha y Hora
        </button>
        <button
          class="appointment-details__button--primary appointment-details__button--full"
          @click="openConfirmacionReserva"
        >
          Confirmar reserva
        </button>
      </div>
      <div v-else class="appointment-details__actions">
        <button
          class="appointment-details__button--danger"
          @click="openAnularCita"
        >
          Anular cita
        </button>
        <button
          class="appointment-details__button--outline"
          @click="openEditorFechaHora"
        >
          Reprogramar
        </button>
        <button
          class="appointment-details__button--primary"
          @click="openConfirmacionReserva"
          :disabled="canMarkAsCompleted"
        >
          Marcar como concretado
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useAppointmentCredit } from "@/composables/api";
import { useMedicalModalManager } from "@/composables/useMedicalModalManager";
import type { Appointment, AppointmentStatusCode } from "~/types";
import type { TablaBaseRow } from "../tabla-detalles-cita.vue";

const { isOpen, closeModal, getSharedData, openModal } =
  useMedicalModalManager();

const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");

const { fetchAllAppointmentCreditByQrCode } = useAppointmentCredit();

const isModalOpen = computed(() => isOpen.detallesCita);

const modalData = computed(() =>
  getSharedData<{ appointment: Appointment }>("detallesCita")
);
const currentAppointment = computed(() => modalData.value?.appointment);

const isLoading = ref<boolean>(false);
const qrCodeInput = ref<string>("");
const qrValidated = ref<boolean>(false);
const creditAmount = ref(0);
const creditUsed = ref(false);
const creditId = ref<number | null>(null);
const errorMessage = ref<string>("");

const { formatDate, formatTime, formatCurrency } = useFormat();

const procedureCost = computed(() => {
  return parseFloat(currentAppointment.value?.price_procedure ?? "0");
});

const pendingBalance = computed(() => {
  const appointment = currentAppointment.value;

  if (!appointment) return 0;

  const price = Number(appointment.price_procedure);
  const approvedAmount = Number(
    appointment.appointment_credit?.approved_amount
  );

  return Math.max(0, price - approvedAmount);
});

const appointmentRowsWithData = computed((): TablaBaseRow[] => {
  if (!currentAppointment.value) return [];

  return [
    {
      key: "paciente",
      header: "Paciente:",
      value: currentAppointment.value.customer.name,
    },
    {
      key: "tipo-servicio",
      header: "Tipo de servicio:",
      value: currentAppointment.value.appointment_type.name,
    },
    {
      key: "fecha",
      header: "Fecha de la cita:",
      value: formatDate(currentAppointment.value.appointment_date),
    },
    {
      key: "hora",
      header: "Hora de la cita:",
      value: formatTime(currentAppointment.value.appointment_hour, "hs"),
      isEndRow: true,
    },
    {
      key: "procedimiento",
      header: "Procedimiento:",
      value: currentAppointment.value.package?.procedure?.name,
    },
    {
      key: "motivo",
      header: "Motivo:",
      value: currentAppointment.value.user_description,
    },
    {
      key: "costo",
      header: "Costo del servicio:",
      value: shouldShowCostBreakdown.value
        ? undefined
        : "A confirmar en la cita",
    },
    {
      key: "fecha-solicitud",
      header: "Fecha de la solicitud:",
      value: formatDate(currentAppointment.value.application_date, "short"),
    },
    {
      key: "tipo-reserva",
      header: "Tipo de reserva:",
      value: currentAppointment.value.reservation_type.value1,
    },
    {
      key: "estado-cita",
      header: "Estado de la cita:",
      value: currentAppointment.value.appointment_status.value1,
    },
    {
      key: "validacion-credito",
      header: "Validación de Crédito:",
      show: shouldShowCreditRow.value,
    },
  ];
});

const VALID_STATUS_CODES = ["CONFIRM_PROCEDURE", "WAITING_PROCEDURE"];

const hasCredit = computed(() => {
  return Boolean(currentAppointment.value?.appointment_credit);
});

const hasValidStatus = computed(() => {
  const statusCode = currentAppointment.value?.appointment_status?.code ?? "";
  return VALID_STATUS_CODES.includes(statusCode);
});

const shouldShowCreditRow = computed(() => {
  return hasCredit.value && hasValidStatus.value;
});

const creditAlreadyBeenUsed = computed(() => {
  return currentAppointment.value?.appointment_credit?.already_been_used === 1;
});

const shouldShowCoordinationReminder = computed(() => {
  const status = currentAppointment.value?.appointment_status?.code;
  return (
    status === "PENDING_VALORATION_APPOINTMENT" ||
    status === "PENDING_PROCEDURE"
  );
});

const shouldShowCostBreakdown = computed(() => {
  const appointment = currentAppointment.value;
  if (!appointment) return false;

  const status = appointment.appointment_status?.code;
  const paymentStatus = appointment.payment_status?.code;
  const hasProcedurePrice = Number(appointment.price_procedure ?? 0) > 0;

  const hasPaid =
    paymentStatus === "PAYMENT_STATUS_PAID_VALORATION_APPOINTMENT" ||
    paymentStatus === "PAYMENT_STATUS_PAID_PROCEDURE";

  const isInProcedureStatus =
    status === "CONFIRM_PROCEDURE" || status === "WAITING_PROCEDURE";

  const hasNoCredit = !appointment.appointment_credit;
  const hasCreditZero =
    Number(appointment.appointment_credit?.approved_amount ?? 0) === 0;

  return (
    hasProcedurePrice &&
    isInProcedureStatus &&
    hasPaid &&
    (hasNoCredit || hasCreditZero)
  );
});

const canMarkAsCompleted = computed(() => {
  if (shouldShowCreditRow.value) {
    return !creditAlreadyBeenUsed.value && !creditUsed.value;
  }

  return false;
});

const handleCloseModal = () => {
  closeModal("detallesCita");
  resetLocalState();
};

const resetLocalState = () => {
  qrCodeInput.value = "";
  qrValidated.value = false;
  creditUsed.value = false;
  errorMessage.value = "";
  creditAmount.value = 0;
  creditId.value = null;
};

const isPaidByCustomer = computed(() => {
  const appointment = currentAppointment.value;
  if (!appointment) return false;

  const approvedAmount = Number(
    appointment.appointment_credit?.approved_amount ?? 0
  );
  const price = Number(appointment.price_procedure);

  return approvedAmount < price;
});

const openEditorFechaHora = () => {
  openModal("editorFechaHora", { appointment: currentAppointment.value });
};

const openConfirmacionReserva = () => {
  openModal("confirmacionReserva", { appointment: currentAppointment.value });
};

const openAnularCita = () => {
  openModal("anularCita", { appointment: currentAppointment.value });
};

const handleValidateQRCode = async () => {
  errorMessage.value = "";

  if (!qrCodeInput.value.trim()) {
    errorMessage.value = "Por favor ingrese un código QR válido";
    return;
  }

  try {
    isLoading.value = true;

    const api = fetchAllAppointmentCreditByQrCode(qrCodeInput.value.trim());
    await api.request();

    const response = api.response.value;

    if (response?.data) {
      const credits = response.data;

      if (credits.length === 0) {
        errorMessage.value = "No se encontró crédito asociado a este código QR";
        return;
      }

      const credit = credits[0];

      if (credit.already_been_used === 1) {
        errorMessage.value = "El código ya fue usado";
        return;
      }

      qrValidated.value = true;
      creditAmount.value = parseFloat(credit.approved_amount);
      creditId.value = credit.id;
    }

    if (api.error && api.error.value) {
      throw new Error(api.error.value?.info);
    }
  } catch (err: any) {
    errorMessage.value = "Error al validar el código QR";
    console.error("Error validating QR code:", err);
  } finally {
    isLoading.value = false;
  }
};

const openConfirmarCodigo = () => {
  openModal("confirmarCodigo", {
    creditId: creditId.value,
    creditAmount: creditAmount.value,
    onSuccess: () => {
      creditUsed.value = true;
    },
  });
};

const getStatusClass = (status?: AppointmentStatusCode) => {
  if (!status) return "";
  const statusClassMap: Record<string, string> = {
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
  return statusClassMap[status] || "";
};

watch(isModalOpen, (newValue) => {
  if (!newValue) {
    resetLocalState();
  }
});
</script>

<style lang="scss" scoped>
.visually-hidden {
  @include visually-hidden;
}

.appointment-details {
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

  &__information-banner {
    margin-top: $spacing-md;
    display: flex;
  }

  &__validate-qr-wrapper {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__validate-qr-group {
    display: flex;
    gap: 0.75rem;
  }

  &__input {
    @include input-base;
    padding: 10px 14px;
    height: auto;
    min-width: 5rem;
  }

  &__error-message {
    @include label-base;
    color: #dc2626;
    font-size: 0.75rem;
    font-weight: 500;
    margin: 0;
  }

  &__info-alert {
    display: flex;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background-color: #eff8ff;
    color: #175cd3;
    border-radius: 1rem;
    gap: $spacing-xs;
  }

  &__info-text {
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

  &__button {
    &--nowrap {
      text-wrap: nowrap;
    }

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

  &__cost-breakdown {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 0.5rem;
  }

  &__breakdown-title {
    @include label-base;
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.25rem;
    margin-bottom: 0.75rem;
    color: $color-foreground;
  }

  &__breakdown-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;

    &--total {
      padding-top: 0.75rem;

      .appointment-details__breakdown-label {
        font-weight: 600;
        color: $color-foreground;
      }
    }
  }

  &__breakdown-label {
    @include label-base;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: $color-text-secondary;
  }

  &__breakdown-value {
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

  &__breakdown-divider {
    border-top: 1px solid #dee2e6;
    margin: 0.5rem 0;
  }

  &__breakdown-note {
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
