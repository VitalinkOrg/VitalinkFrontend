<template>
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
        :aria-label="`Detalles de la cita de ${currentAppointment?.customer.name}`"
      >
        <template #data-fecha>
          <UiDatePicker
            v-model="selectedDate"
            :min-date="new Date()"
            custom-class="appointment-editor__date-picker"
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
            v-if="currentAppointment"
            class="status-badge"
            :class="getStatusClass(currentAppointment.appointment_status.code)"
          >
            {{ currentAppointment?.appointment_status.value1 }}
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
</template>

<script lang="ts" setup>
import type { TablaBaseRow } from "~/components/medicos/tabla-detalles-cita.vue";
import { useFormat } from "~/composables/useFormat";
import type { Appointment, AppointmentStatusCode } from "~/types";

const { isOpen, closeModal, getSharedData, openModal } =
  useMedicalModalManager();

const modalData = computed(() =>
  getSharedData<{ appointment: Appointment }>("editorFechaHora")
);

const currentAppointment = computed(() => modalData.value?.appointment);

const isModalOpen = computed(() => isOpen.editorFechaHora);

const { formatDate, formatCurrency } = useFormat();

const isLoading = ref<boolean>(false);
const selectedDate = ref<Date | null>(null);
const selectedTime = ref<string>("");
const dateError = ref<string>("");
const timeError = ref<string>("");
const apiError = ref<string>("");

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
    value: currentAppointment.value?.customer?.name ?? "",
  },
  {
    key: "tipo-servicio",
    header: "Tipo de servicio:",
    value: currentAppointment.value?.appointment_type?.name ?? "",
  },
  {
    key: "fecha",
    header: "Fecha de la cita:",
    value: currentAppointment.value?.appointment_date ?? "",
    class: "appointment-editor__details-row--editable",
  },
  {
    key: "hora",
    header: "Hora de la cita:",
    value: currentAppointment.value?.appointment_hour ?? "",
    class: "appointment-editor__details-row--editable",
    isEndRow: true,
  },
  {
    key: "motivo",
    header: "Motivo:",
    value: currentAppointment.value?.user_description ?? "",
  },
  {
    key: "procedimiento",
    header: "Procedimiento:",
    value: currentAppointment.value?.package?.procedure?.name ?? "",
  },
  {
    key: "costo-servicio",
    header: "Costo del servicio:",
    value: "A confirmar en la cita",
  },
  {
    key: "fecha-solicitud",
    header: "Fecha de la solicitud:",
    value: formatDate(
      currentAppointment.value?.application_date ?? "",
      "short"
    ),
  },
  {
    key: "tipo-reserva",
    header: "Tipo de reserva:",
    value: currentAppointment.value?.reservation_type?.value1 ?? "",
  },
  {
    key: "apto-credito",
    header: "Apto para crédito:",
    value: "Sí",
    show:
      currentAppointment.value?.appointment_status?.code ===
        "WAITING_PROCEDURE" ||
      currentAppointment.value?.appointment_status?.code ===
        "CONFIRM_PROCEDURE",
  },
  {
    key: "costo-servicio",
    header: "Costo del servicio:",
    value: formatCurrency(currentAppointment.value?.price_procedure ?? 0, {
      decimalPlaces: 0,
    }),
    show:
      currentAppointment.value?.appointment_status?.code ===
        "WAITING_PROCEDURE" ||
      currentAppointment.value?.appointment_status?.code ===
        "CONFIRM_PROCEDURE",
  },
  {
    key: "costo-servicio",
    header: "Costo del servicio:",
    value: "Cubierto por crédito",
    show:
      currentAppointment.value?.appointment_status?.code ===
        "WAITING_PROCEDURE" ||
      currentAppointment.value?.appointment_status?.code ===
        "CONFIRM_PROCEDURE",
  },
  {
    key: "estado-cita",
    header: "Estado de la cita:",
    value: currentAppointment.value?.appointment_status?.code ?? "",
  },
]);

const appointmentTitle = computed(() => {
  if (!currentAppointment.value) return;

  const { code: typeCode } = currentAppointment.value.appointment_type;
  const { code: statusCode } = currentAppointment.value.appointment_status;

  if (typeCode === "VALORATION_APPOINTMENT")
    return "Detalles de la Cita de valoración";
  if (statusCode === "WAITING_PROCEDURE") return "Detalles del procedimiento";
  return "Detalles de la reserva";
});

const shouldShowCoordinationReminder = computed(() => {
  if (!currentAppointment.value) return;
  const { code } = currentAppointment.value.appointment_status;
  return (
    code === "PENDING_VALORATION_APPOINTMENT" || code === "PENDING_PROCEDURE"
  );
});

const handleCloseModal = () => {
  closeModal("editorFechaHora");
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

const handleSaveChanges = async () => {
  console.log({
    appointment: currentAppointment,
    appointmentDate: formattedSelectedDate.value,
    appointmentHour: formattedSelectedHour.value,
  });
  if (!validateForm()) {
    return;
  }

  openModal("confirmacionReprogramacion", {
    appointment: currentAppointment,
    appointmentDate: formattedSelectedDate.value,
    appointmentHour: formattedSelectedHour.value,
  });
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
</script>

<style lang="scss" scoped>
.appointment-editor {
  &__title {
    font-family: $font-family-main;
    font-weight: 600;
    font-size: 1.25rem;
    line-height: 1.75rem;
    color: #353e5c;
    margin: 0;
  }

  &__content {
    padding: 1.5rem;
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
    margin-top: 0.25rem;
    font-size: 0.75rem;
    line-height: 1rem;
    color: $color-error;
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
    gap: 0.25rem;
    padding: 0.125rem 0.5rem;
    border-radius: 1rem;

    &--info {
      background-color: #dbeafe;
    }

    &--error {
      background-color: #fef2f2;
      padding: 0.5rem 0.75rem;
    }
  }

  &__alert-icon {
    flex-shrink: 0;
    color: #1d4ed8;

    .appointment-editor__alert--error & {
      color: $color-error;
    }
  }

  &__alert-text {
    @include label-base;
    font-weight: 500;
    font-size: 0.75rem;
    line-height: 1.125rem;
    letter-spacing: 0;
    text-align: center;
    color: #1e40af;

    .appointment-editor__alert--error & {
      color: $color-error;
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
