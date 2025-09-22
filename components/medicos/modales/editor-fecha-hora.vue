<template>
  <slot name="trigger" :open="handleOpenModal"></slot>

  <AtomsModalBase
    :is-open="isModalOpen"
    size="medium"
    class="appointment-editor"
    :close-on-backdrop="false"
    @close="handleCloseModal"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
  >
    <template #title>
      <h1 id="appointment-modal-title" class="appointment-editor__title">
        {{ appointmentTitle }}
      </h1>
    </template>

    <div class="appointment-editor__content">
      <MedicosTablaDetallesCita
        :rows="appointmentRowsWithData"
        :title="appointmentTitle"
        :hidden-title="true"
        :aria-label="`Detalles de la cita de ${appointment.customer.name}`"
      >
        <template #data-fecha>
          <UiDatePicker
            v-model="selectedDate"
            :min-date="new Date()"
            custom-class="appointment-editor__date-picker"
            @confirm="handleDateConfirm"
            @update:model-value="handleDateChange"
          />
          <div
            v-if="dateError"
            class="appointment-editor__error"
            role="alert"
            aria-live="polite"
          >
            {{ dateError }}
          </div>
        </template>

        <template #data-hora>
          <UiDropdownBase
            v-model="selectedTime"
            :items="timeOptions"
            :disabled="!selectedDate"
            placeholder="Seleccionar hora"
            custom-class="appointment-editor__time-dropdown"
            @select="handleTimeSelect"
          >
            <template #icon>
              <AtomsIconsClockIcon size="20" />
            </template>
          </UiDropdownBase>
          <div
            v-if="timeError"
            class="appointment-editor__error"
            role="alert"
            aria-live="polite"
          >
            {{ timeError }}
          </div>
        </template>

        <template #data-estado-cita>
          <span
            class="status-badge"
            :class="getStatusClass(appointment.appointment_status.code)"
          >
            {{ appointment.appointment_status.value1 }}
          </span>
        </template>
      </MedicosTablaDetallesCita>

      <div
        v-if="shouldShowCoordinationReminder"
        class="appointment-editor__reminder"
      >
        <div
          class="appointment-editor__alert appointment-editor__alert--info"
          role="note"
          aria-labelledby="coordination-reminder"
        >
          <AtomsIconsInfoIcon
            width="12"
            height="12"
            class="appointment-editor__alert-icon"
            aria-hidden="true"
          />
          <p id="coordination-reminder" class="appointment-editor__alert-text">
            Asegúrate de coordinar con el paciente antes de confirmar con la
            cita
          </p>
        </div>
      </div>

      <div
        v-if="apiError"
        class="appointment-editor__api-error"
        role="alert"
        aria-live="polite"
      >
        <div class="appointment-editor__alert appointment-editor__alert--error">
          <AtomsIconsErrorIcon
            width="16"
            height="16"
            class="appointment-editor__alert-icon"
            aria-hidden="true"
          />
          <p class="appointment-editor__alert-text">
            {{ apiError }}
          </p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="appointment-editor__actions">
        <button
          :disabled="isLoading"
          class="appointment-editor__button appointment-editor__button--cancel"
          @click="handleCloseModal"
        >
          Cancelar
        </button>
        <button
          :disabled="isLoading || !canProceed"
          class="appointment-editor__button appointment-editor__button--primary"
          @click="handleSaveChanges"
        >
          {{ isLoading ? "Guardando..." : "Guardar cambios" }}
        </button>
      </div>
    </template>
  </AtomsModalBase>

  <MedicosModalesConfirmacionReprogramacion
    ref="confirmationModalRef"
    :appointment="appointment"
    :appointment-date="formattedSelectedDate"
    :appointment-hour="formattedSelectedHour"
  />
</template>

<script lang="ts" setup>
import type { TablaBaseRow } from "~/components/medicos/tabla-detalles-cita.vue";
import { useFormat } from "~/composables/useFormat";
import type { Appointment, AppointmentStatusCode } from "~/types";

interface Props {
  appointment: Appointment;
}

const props = defineProps<Props>();

const { formatDate, formatCurrency } = useFormat();

const isModalOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const selectedDate = ref<Date | null>(null);
const selectedTime = ref<string>("");
const dateError = ref<string>("");
const timeError = ref<string>("");
const apiError = ref<string>("");

const confirmationModalRef = ref();

const availableTimes = ref<string[]>([
  "08:30",
  "09:00",
  "10:00",
  "11:30",
  "14:00",
  "15:30",
  "16:00",
  "17:00",
]);

const timeOptions = computed(() =>
  availableTimes.value.map((time) => ({
    value: time,
    label: `${time}hs`,
  }))
);

const canProceed = computed(() => {
  return selectedDate.value !== null && selectedTime.value !== "";
});

const formattedSelectedDate = computed(() => {
  if (!selectedDate.value) return "";

  const year = selectedDate.value.getFullYear();
  const month = String(selectedDate.value.getMonth() + 1).padStart(2, "0");
  const day = String(selectedDate.value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
});

const formattedSelectedHour = computed(() => {
  if (!selectedTime.value) return "";

  return selectedTime.value.includes(":")
    ? selectedTime.value.split(":").length === 2
      ? `${selectedTime.value}:00`
      : selectedTime.value
    : `${selectedTime.value}:00:00`;
});

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
    value: props.appointment.appointment_date,
    class: "appointment-editor__details-row--editable",
  },
  {
    key: "hora",
    header: "Hora de la cita:",
    value: props.appointment.appointment_hour,
    class: "appointment-editor__details-row--editable",
    isEndRow: true,
  },
  {
    key: "motivo",
    header: "Motivo:",
    value: props.appointment.user_description,
  },
  {
    key: "procedimiento",
    header: "Procedimiento:",
    value: props.appointment.package?.procedure?.name,
  },
  {
    key: "costo-servicio",
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
    key: "apto-credito",
    header: "Apto para crédito:",
    value: "Sí",
    show:
      props.appointment.appointment_status.code === "WAITING_PROCEDURE" ||
      props.appointment.appointment_status.code === "CONFIRM_PROCEDURE",
  },
  {
    key: "costo-servicio",
    header: "Costo del servicio:",
    value: formatCurrency(props.appointment.price_procedure, {
      decimalPlaces: 0,
    }),
    show:
      props.appointment.appointment_status.code === "WAITING_PROCEDURE" ||
      props.appointment.appointment_status.code === "CONFIRM_PROCEDURE",
  },
  {
    key: "costo-servicio",
    header: "Costo del servicio:",
    value: "Cubierto por crédito",
    show:
      props.appointment.appointment_status.code === "WAITING_PROCEDURE" ||
      props.appointment.appointment_status.code === "CONFIRM_PROCEDURE",
  },
  {
    key: "estado-cita",
    header: "Estado de la cita:",
    value: props.appointment.appointment_status.code,
  },
]);

const appointmentTitle = computed(() => {
  const { code: typeCode } = props.appointment.appointment_type;
  const { code: statusCode } = props.appointment.appointment_status;

  if (typeCode === "VALORATION_APPOINTMENT")
    return "Detalles de la Cita de valoración";
  if (statusCode === "WAITING_PROCEDURE") return "Detalles del procedimiento";
  return "Detalles de la reserva";
});

const shouldShowCoordinationReminder = computed(() => {
  const { code } = props.appointment.appointment_status;
  return (
    code === "PENDING_VALORATION_APPOINTMENT" || code === "PENDING_PROCEDURE"
  );
});

const handleOpenModal = () => {
  isModalOpen.value = true;
  clearErrors();
};

const handleCloseModal = () => {
  isModalOpen.value = false;
  clearErrors();
  selectedDate.value = null;
  selectedTime.value = "";
};

const clearErrors = () => {
  dateError.value = "";
  timeError.value = "";
  apiError.value = "";
};

const validateForm = (): boolean => {
  clearErrors();
  let isValid = true;

  if (!selectedDate.value) {
    dateError.value = "Por favor selecciona una fecha";
    isValid = false;
  }

  if (!selectedTime.value) {
    timeError.value = "Por favor selecciona una hora";
    isValid = false;
  }

  return isValid;
};

const handleDateChange = (date: Date | null) => {
  selectedDate.value = date;
  selectedTime.value = "";
  if (dateError.value) {
    dateError.value = "";
  }
};

const handleTimeSelect = (item: {
  value: string | number;
  label: string;
  disabled?: boolean;
}) => {
  selectedTime.value = item.value as string;
  if (timeError.value) {
    timeError.value = "";
  }
};

const handleDateConfirm = (date: Date | null) => {
  console.log("Fecha confirmada:", date);
};

const handleSaveChanges = async () => {
  if (!validateForm()) {
    return;
  }

  confirmationModalRef.value?.handleOpenModal();
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

provide("closeReschedulingModal", handleCloseModal);

defineExpose({
  handleOpenModal,
  handleCloseModal,
  isOpen: readonly(isModalOpen),
  isLoading: readonly(isLoading),
});
</script>

<style lang="scss" scoped>
.appointment-editor {
  &__title {
    font-family: $font-family-main;
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    color: #353e5c;
    margin: 0;
  }

  &__content {
    padding: 24px;
  }

  &__date-picker {
    width: 100%;
  }

  &__time-dropdown {
    width: 100%;
  }

  &__datetime {
    color: inherit;
    text-decoration: none;
  }

  &__details-row--editable {
    background-color: #f8f9fa;
  }

  &__error {
    margin-top: 4px;
    font-size: 12px;
    line-height: 16px;
    color: #dc2626;
    font-weight: 500;
  }

  &__reminder {
    margin-top: 1rem;
  }

  &__api-error {
    margin-top: 1rem;
  }

  &__alert {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 16px;

    &--info {
      background-color: #dbeafe;
    }

    &--error {
      background-color: #fef2f2;
      padding: 8px 12px;
    }
  }

  &__alert-icon {
    flex-shrink: 0;
    color: #1d4ed8;

    .appointment-editor__alert--error & {
      color: #dc2626;
    }
  }

  &__alert-text {
    @include label-base;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    letter-spacing: 0;
    text-align: center;
    color: #1e40af;

    .appointment-editor__alert--error & {
      color: #dc2626;
      text-align: left;
    }
  }

  &__actions {
    width: 100%;
    display: flex;
    gap: 0.75rem;
  }

  &__button {
    &--cancel {
      @include outline-danger-button;
      width: 100%;
      border: none;
    }
    &--primary {
      @include primary-button;
      width: 100%;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}
</style>
