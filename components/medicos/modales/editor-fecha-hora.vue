<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    size="medium"
    :close-on-backdrop="false"
    @close="handleClose"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
    aria-labelledby="reschedule-modal-title"
  >
    <template #title>
      <h2 id="reschedule-modal-title" class="reschedule-modal__title">
        {{ modalTitle }}
      </h2>
    </template>

    <div class="reschedule-modal__body">
      <MedicosTablaDetallesCita
        :rows="detailRows"
        :title="modalTitle"
        :hidden-title="true"
        :aria-label="`Detalles de la cita de ${appointment?.customer?.name}`"
      >
        <template #data-fecha>
          <div class="reschedule-modal__field">
            <UiDatePicker
              id="reschedule-date"
              v-model="selectedDate"
              :min-date="new Date()"
              custom-class="reschedule-modal__date-picker"
              @update:model-value="handleDateChange"
            />
            <p
              v-if="dateError"
              class="reschedule-modal__field-error"
              role="alert"
              aria-live="polite"
            >
              {{ dateError }}
            </p>
          </div>
        </template>

        <template #data-hora>
          <div class="reschedule-modal__field">
            <UiDropdownBase
              id="reschedule-time"
              v-model="selectedTime"
              :items="timeSlotOptions"
              :disabled="!selectedDate"
              placeholder="Seleccionar hora"
              custom-class="reschedule-modal__time-dropdown"
              @select="handleTimeSelect"
            >
              <template #icon>
                <AtomsIconsClockIcon size="20" />
              </template>
            </UiDropdownBase>
            <p
              v-if="timeError"
              class="reschedule-modal__field-error"
              role="alert"
              aria-live="polite"
            >
              {{ timeError }}
            </p>
          </div>
        </template>

        <template #data-estado-cita>
          <span v-if="appointment" :class="statusBadgeClass">
            {{ appointment.appointment_status.value1 }}
          </span>
        </template>
      </MedicosTablaDetallesCita>

      <div v-if="isPendingConfirmation" class="reschedule-modal__reminder">
        <div
          class="reschedule-modal__banner reschedule-modal__banner--info"
          role="note"
          aria-labelledby="coordination-reminder"
        >
          <AtomsIconsInfoIcon width="12" height="12" aria-hidden="true" />
          <p id="coordination-reminder" class="reschedule-modal__banner-text">
            Asegúrate de coordinar con el paciente antes de confirmar la cita
          </p>
        </div>
      </div>

      <div v-if="apiError" class="reschedule-modal__api-error">
        <div
          class="reschedule-modal__banner reschedule-modal__banner--error"
          role="alert"
          aria-live="polite"
        >
          <AtomsIconsErrorIcon width="16" height="16" aria-hidden="true" />
          <p class="reschedule-modal__banner-text">{{ apiError }}</p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="reschedule-modal__actions">
        <button
          :disabled="isSaving"
          class="reschedule-modal__action reschedule-modal__action--cancel"
          @click="handleClose"
        >
          Cancelar
        </button>
        <button
          :disabled="isSaving || !isFormComplete"
          :aria-busy="isSaving"
          class="reschedule-modal__action reschedule-modal__action--primary"
          @click="handleSave"
        >
          {{ isSaving ? "Guardando..." : "Guardar cambios" }}
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import type { TablaBaseRow } from "@/components/medicos/tabla-detalles-cita.vue";
import { useAppointment } from "@/composables/api";
import { useFormat } from "@/composables/useFormat";
import { useLogger } from "@/composables/useLogger";
import { useMedicalModalManager } from "@/composables/useMedicalModalManager";

interface DropdownItem {
  value: string | number;
  label: string;
}

const { isOpen, closeModal, getSharedData, openModal } =
  useMedicalModalManager();
const { updateAppointment, getAppointmentById } = useAppointment();
const { formatDate, formatCurrency } = useFormat();
const logger = useLogger("EditorFechaHora");
const toast = useToast();

const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");

const isModalOpen = computed(() => isOpen.editorFechaHora);

const modalData = computed(() =>
  getSharedData<{ appointment: IAppointment }>("editorFechaHora"),
);

const appointment = computed(() => modalData.value?.appointment);

const statusCode = computed(
  () => appointment.value?.appointment_status?.code ?? "",
);

const isSaving = ref(false);
const selectedDate = ref<Date | null>(null);
const selectedTime = ref("");
const dateError = ref("");
const timeError = ref("");
const apiError = ref("");

const TIME_SLOTS = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

const timeSlotOptions = computed((): DropdownItem[] =>
  TIME_SLOTS.map((time) => ({ value: time, label: `${time}hs` })),
);

const isFormComplete = computed(
  () => selectedDate.value !== null && selectedTime.value !== "",
);

const PENDING_STATUSES = [
  "PENDING_VALORATION_APPOINTMENT",
  "PENDING_PROCEDURE",
];
const PROCEDURE_STATUSES = ["WAITING_PROCEDURE", "CONFIRM_PROCEDURE"];

const isPendingConfirmation = computed(() =>
  PENDING_STATUSES.includes(statusCode.value),
);

const isInProcedurePhase = computed(() =>
  PROCEDURE_STATUSES.includes(statusCode.value),
);

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

const modalTitle = computed(() => {
  if (!appointment.value) return "";
  const typeCode = appointment.value.appointment_type?.code;
  if (typeCode === "VALORATION_APPOINTMENT")
    return "Reprogramar cita de valoración";
  if (statusCode.value === "WAITING_PROCEDURE")
    return "Reprogramar procedimiento";
  return "Reprogramar reserva";
});

const detailRows = computed((): TablaBaseRow[] => {
  const apt = appointment.value;
  if (!apt) return [];

  const rows: TablaBaseRow[] = [
    {
      key: "paciente",
      header: "Paciente:",
      value: apt.customer?.name ?? "",
    },
    {
      key: "tipo-servicio",
      header: "Tipo de servicio:",
      value: apt.appointment_type?.name ?? "",
    },
    {
      key: "fecha",
      header: "Fecha de la cita:",
      value: " ",
      class: "reschedule-modal__row--editable",
    },
    {
      key: "hora",
      header: "Hora de la cita:",
      value: " ",
      class: "reschedule-modal__row--editable",
      isEndRow: true,
    },
    {
      key: "motivo",
      header: "Motivo:",
      value: apt.user_description ?? "",
    },
    {
      key: "procedimiento",
      header: "Procedimiento:",
      value: apt.package?.procedure?.name ?? "",
    },
    {
      key: "costo-servicio",
      header: "Costo del servicio:",
      value: isInProcedurePhase.value
        ? formatCurrency(apt.price_procedure ?? 0, { decimalPlaces: 0 })
        : "A confirmar en la cita",
    },
    {
      key: "fecha-solicitud",
      header: "Fecha de la solicitud:",
      value: formatDate(apt.application_date ?? "", "short"),
    },
    {
      key: "tipo-reserva",
      header: "Tipo de reserva:",
      value: apt.reservation_type?.value1 ?? "",
    },
    {
      key: "estado-cita",
      header: "Estado de la cita:",
      value: apt.appointment_status?.value1 ?? "",
    },
  ];

  if (isInProcedurePhase.value) {
    rows.splice(rows.length - 1, 0, {
      key: "apto-credito",
      header: "Apto para crédito:",
      value: "Sí",
    });
  }

  return rows;
});

const formatDateForApi = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTimeForApi = (time: string): string => {
  if (!time) return "";
  return time.split(":").length === 2 ? `${time}:00` : time;
};

const clearErrors = () => {
  dateError.value = "";
  timeError.value = "";
  apiError.value = "";
};

const validate = (): boolean => {
  clearErrors();
  let valid = true;

  if (!selectedDate.value) {
    dateError.value = "Por favor selecciona una fecha";
    valid = false;
  }

  if (!selectedTime.value) {
    timeError.value = "Por favor selecciona una hora";
    valid = false;
  }

  return valid;
};

const handleDateChange = (_date: Date | null) => {
  selectedTime.value = "";
  dateError.value = "";
};

const handleTimeSelect = (item: DropdownItem) => {
  selectedTime.value = String(item.value);
  timeError.value = "";
};

const handleSave = async () => {
  if (!validate()) return;

  const apt = appointment.value;
  if (!apt) return;

  isSaving.value = true;
  apiError.value = "";

  try {
    const { error } = await updateAppointment(apt.id, {
      appointment_date: formatDateForApi(selectedDate.value!),
      appointment_hour: formatTimeForApi(selectedTime.value),
    });

    if (error) {
      apiError.value =
        error.info || "No se pudo reprogramar la cita. Intenta de nuevo.";
      logger.error("Failed to reschedule appointment", {
        appointmentId: apt.id,
        error: error.info,
      });
      return;
    }

    const { data: updatedAppointment } = await getAppointmentById(apt.id);

    await refreshAppointments?.();

    closeModal("editorFechaHora");
    closeModal("detallesCita");

    openModal("cambiosGuardados", {
      appointment: updatedAppointment ?? apt,
    });
  } catch (err) {
    apiError.value = "Ocurrió un error inesperado. Intenta de nuevo.";
    logger.error("Unexpected error rescheduling appointment", {
      error: err instanceof Error ? err.message : String(err),
    });
  } finally {
    isSaving.value = false;
  }
};

const resetState = () => {
  selectedDate.value = null;
  selectedTime.value = "";
  clearErrors();
};

const handleClose = () => {
  closeModal("editorFechaHora");
  resetState();
};

watch(isModalOpen, (open) => {
  if (!open) resetState();
});
</script>

<style lang="scss" scoped>
.reschedule-modal {
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

  &__row--editable {
    background-color: #f8f9fa;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    width: 100%;
  }

  &__field-error {
    font-family: $font-family-alt;
    font-size: 0.75rem;
    line-height: 1rem;
    font-weight: 500;
    color: $color-danger;
    margin: 0;
  }

  &__reminder {
    margin-top: 1rem;
  }

  &__api-error {
    margin-top: 1rem;
  }

  &__banner {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.375rem 0.75rem;
    border-radius: 1rem;

    &--info {
      background-color: #dbeafe;
      color: #1e40af;
    }

    &--error {
      background-color: #fef2f2;
      color: $color-danger;
      padding: 0.5rem 0.75rem;
    }
  }

  &__banner-text {
    @include label-base;
    font-weight: 500;
    font-size: 0.75rem;
    line-height: 1.125rem;
    color: inherit;
    margin: 0;
  }

  &__actions {
    width: 100%;
    display: flex;
    gap: 0.75rem;
  }

  &__action {
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
