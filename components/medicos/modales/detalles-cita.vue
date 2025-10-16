<template>
  <slot name="trigger" :open="handleOpenModal"></slot>

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
          appointment.appointment_type.code == "VALORATION_APPOINTMENT"
            ? "de la Cita de valoración"
            : appointment.appointment_status.code == "WAITING_PROCEDURE"
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
                @click="useCredit"
              >
                {{ isLoading ? "Usando..." : "Usar crédito" }}
              </button>
            </div>
            <div v-if="errorMessage" class="appointment-details__error-message">
              {{ errorMessage }}
            </div>
          </div>
          <div v-else class="appointment-details__credit-info">
            <span class="appointment-details__used-label"
              >Ya fue utilizado el crédito</span
            >
            <div class="appointment-details__credit-details">
              <p class="appointment-details__credit-amount">
                Crédito pre-aprobado:
                {{
                  formatCurrency(
                    appointment.appointment_credit?.approved_amount ?? 0,
                    { decimalPlaces: 0 }
                  )
                }}
              </p>
              <p class="appointment-details__pending-balance">
                Saldo pendiente: {{ calculatePendingBalance() }}
              </p>
            </div>
          </div>
        </template>

        <template #data-estado-cita>
          <span :class="getStatusClass(appointment.appointment_status.code)">
            {{ appointment.appointment_status.value1 }}
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
        appointment.appointment_status.code !== 'CANCEL_APPOINTMENT' &&
        appointment.appointment_status.code !== 'CONCRETED_APPOINTMENT'
      "
    >
      <div
        v-if="
          appointment.appointment_status.code ===
            'PENDING_VALORATION_APPOINTMENT' ||
          appointment.appointment_status.code === 'PENDING_PROCEDURE'
        "
        class="appointment-details__actions"
      >
        <MedicosModalesEditorFechaHora :appointment="appointment">
          <template #trigger="{ open }">
            <button
              class="appointment-details__button--outline appointment-details__button--full"
              @click="open"
            >
              <AtomsIconsSquarePenIcon size="20" />
              Editar Fecha y Hora
            </button>
          </template>
        </MedicosModalesEditorFechaHora>
        <MedicosModalesConfirmacionReserva
          ref="confirmReservationRef"
          :appointment="appointment"
        >
          <template #trigger="{ open }">
            <button
              class="appointment-details__button--primary appointment-details__button--full"
              @click="open"
            >
              Confirmar reserva
            </button>
          </template>
        </MedicosModalesConfirmacionReserva>
      </div>
      <div v-else class="appointment-details__actions">
        <MedicosModalesAnularCita :appointment="appointment">
          <template #trigger="{ open }">
            <button class="appointment-details__button--danger" @click="open">
              Anular cita
            </button>
          </template>
        </MedicosModalesAnularCita>
        <MedicosModalesEditorFechaHora :appointment="appointment">
          <template #trigger="{ open }">
            <button class="appointment-details__button--outline" @click="open">
              Reprogramar
            </button>
          </template>
        </MedicosModalesEditorFechaHora>
        <button
          class="appointment-details__button--primary"
          @click="openConfirmReservationModal"
        >
          Marcar como concretado
        </button>
      </div>
    </template>
  </AtomsModalBase>

  <MedicosModalesConfirmacionReserva
    ref="confirmReservationRef"
    :appointment="appointment"
  />

  <MedicosModalesExitoConfirmacion
    ref="successModalRef"
    :appointment="appointment"
  />
</template>

<script lang="ts" setup>
import { useAppointmentCredit } from "@/composables/api";
import type { Appointment, AppointmentStatusCode } from "~/types";
import type { TablaBaseRow } from "../tabla-detalles-cita.vue";

const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");
const { updateAppointmentCredit, fetchAllAppointmentCreditByQrCode } =
  useAppointmentCredit();

const isModalOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const qrCodeInput = ref<string>("");
const qrValidated = ref<boolean>(false);
const creditAmount = ref(0);
const creditUsed = ref(false);
const creditId = ref<number | null>(null);
const errorMessage = ref<string>("");

const confirmReservationRef = ref();
const successModalRef = ref();
const paymentWarningModalRef = ref();

interface Props {
  appointment: Appointment;
}

const props = defineProps<Props>();

const { formatDate, formatTime, formatCurrency } = useFormat();
const appointmentRowsWithData = computed((): TablaBaseRow[] => [
  {
    key: "paciente",
    header: "Paciente:",
    value: props.appointment.customer.name,
  },
  {
    key: "tipo-servicio",
    header: "Tipo de servicio:",
    value: props.appointment.appointment_type.name,
  },
  {
    key: "fecha",
    header: "Fecha de la cita:",
    value: formatDate(props.appointment.appointment_date),
  },
  {
    key: "hora",
    header: "Hora de la cita:",
    value: formatTime(props.appointment.appointment_hour, "hs"),
    isEndRow: true,
  },
  {
    key: "procedimiento",
    header: "Procedimiento:",
    value: props.appointment.package?.procedure?.name,
  },
  {
    key: "motivo",
    header: "Motivo:",
    value: props.appointment.user_description,
  },
  {
    key: "costo",
    header: "Costo del servicio:",
    value: "A confirmar en la cita",
  },
  {
    key: "fecha-solicitud",
    header: "Fecha de la solicitud:",
    value: formatDate(props.appointment.application_date, "short"),
  },
  {
    key: "tipo-reserva",
    header: "Tipo de reserva:",
    value: props.appointment.reservation_type.value1,
  },
  {
    key: "estado-cita",
    header: "Estado de la cita:",
    value: props.appointment.appointment_status.value1,
  },
  {
    key: "validacion-credito",
    header: "Validación de Crédito:",
    show: shouldShowCreditRow.value,
  },
]);

const handleOpenModal = () => {
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
  qrCodeInput.value = "";
  qrValidated.value = false;
  creditUsed.value = false;
  errorMessage.value = "";
};

const VALID_STATUS_CODES = ["CONFIRM_PROCEDURE", "WAITING_PROCEDURE"];

const hasCredit = computed(() => {
  return Boolean(props.appointment?.appointment_credit);
});

const hasValidStatus = computed(() => {
  const statusCode = props.appointment?.appointment_status?.code;
  return VALID_STATUS_CODES.includes(statusCode);
});

const shouldShowCreditRow = computed(() => {
  return hasCredit.value && hasValidStatus.value;
});

const creditAlreadyBeenUsed = computed(() => {
  return props.appointment.appointment_credit?.already_been_used === 1;
});

const shouldShowCoordinationReminder = computed(() => {
  const status = props.appointment.appointment_status.code;
  return (
    status === "PENDING_VALORATION_APPOINTMENT" ||
    status === "PENDING_PROCEDURE"
  );
});

const calculatePendingBalance = (): string => {
  if (!props.appointment.appointment_credit) return "0.00";

  const approvedAmount = parseFloat(
    props.appointment.appointment_credit.approved_amount
  );
  const procedurePrice = parseFloat(props.appointment.price_procedure);
  const pendingBalance = procedurePrice - approvedAmount;

  return formatCurrency(pendingBalance, { decimalPlaces: 0 });
};

const openConfirmReservationModal = () => {
  confirmReservationRef.value?.handleOpenModal();
};

const openSuccessModal = () => {
  successModalRef.value?.handleOpenModal();
};

const closePaymentWarningModal = () => {
  paymentWarningModalRef.value?.handleCloseModal();
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

const useCredit = async () => {
  try {
    isLoading.value = true;

    const payload = {
      already_been_used: 1,
    };

    if (!creditId.value) throw new Error("No credit found");

    const api = updateAppointmentCredit(payload, creditId.value);
    await api.request();

    if (api.error && api.error.value) {
      throw new Error(api.error.value.info);
    }

    creditUsed.value = true;
    await refreshAppointments?.();
  } catch (err: any) {
    errorMessage.value = "Error al utilizar el crédito";
    console.error("Error using credit:", err);
  } finally {
    isLoading.value = false;
  }
};

const getStatusClass = (status: AppointmentStatusCode) => {
  const statusClassMap = {
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

provide("openSuccessModal", openSuccessModal);
provide("closeAppointmentDetailsModal", handleCloseModal);
provide("closeNoPaymentRecordModal", closePaymentWarningModal);

defineExpose({
  handleOpenModal,
  handleCloseModal,
  isOpen: readonly(isModalOpen),
  isLoading: readonly(isLoading),
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

  &__credit-info {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__used-label {
    @include label-base;
    color: #6b7280;
    font-weight: 500;
    font-size: 0.875rem;
  }

  &__credit-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__credit-amount,
  &__pending-balance {
    @include label-base;
    margin: 0;
    font-size: 0.75rem;
    color: #374151;
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
}
</style>
