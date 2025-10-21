<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    size="small"
    class="upload-proforma"
    :close-on-backdrop="false"
    @close="handleCloseModal"
  >
    <div class="upload-proforma__content">
      <div class="upload-proforma__icon-wrapper">
        <AtomsIconsCircleCheckBigIcon class="upload-proforma__icon" />
      </div>
      <h2 class="upload-proforma__content-title">¡Bien hecho!</h2>
      <p class="upload-proforma__description">
        El cambio de estado de la cita se ha realizado con éxito:
      </p>

      <div class="upload-proforma__table-wrapper">
        <MedicosTablaDetallesCita
          v-if="currentAppointment"
          :rows="appointmentRowsWithData"
          :hidden-title="true"
          :aria-label="`Detalles de la cita de ${currentAppointment.customer.name}`"
        >
          <template #data-estado-cita>
            <span
              class="status-badge"
              :class="
                getStatusClass(currentAppointment.appointment_status.code)
              "
            >
              {{ currentAppointment.appointment_status.value1 }}
            </span>
          </template>
        </MedicosTablaDetallesCita>
      </div>
    </div>

    <template #footer>
      <div class="upload-proforma__actions">
        <button
          :disabled="isLoading"
          class="upload-proforma__button--outline"
          @click="handleOpenNotSuitable"
        >
          No apto para procedimiento
        </button>
        <button
          :disabled="isLoading"
          class="upload-proforma__button--primary"
          @click="openValorationDetails"
        >
          <AtomsIconsFileTextIcon size="20" />
          Subir Proforma
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useFormat } from "~/composables/useFormat";
import type { Appointment, AppointmentStatusCode } from "~/types";
import type { TablaBaseRow } from "../tabla-detalles-cita.vue";

const { formatDate, formatTime } = useFormat();
const { isOpen, closeModal, getSharedData, openModal } =
  useMedicalModalManager();

const isLoading = ref<boolean>(false);

const modalData = computed(() =>
  getSharedData<{ appointment: Appointment }>("subirProforma")
);

const currentAppointment = computed(() => modalData.value?.appointment);

const appointmentRowsWithData = computed((): TablaBaseRow[] => {
  const appointment = currentAppointment.value;
  if (!appointment) return [];

  return [
    {
      key: "tipo-servicio",
      header: "Tipo de servicio:",
      value: appointment.appointment_type.name,
    },
    {
      key: "fecha",
      header: "Fecha de la cita:",
      value: formatDate(appointment.appointment_date),
      class: "appointment-editor__details-row--editable",
    },
    {
      key: "hora",
      header: "Hora de la cita:",
      value: formatTime(appointment.appointment_hour, "hs"),
      class: "appointment-editor__details-row--editable",
    },
    {
      key: "paciente",
      header: "Paciente:",
      value: appointment.customer.name,
      isEndRow: true,
    },
    {
      key: "procedimiento",
      header: "Procedimiento:",
      value: appointment.package?.procedure?.name ?? "—",
    },
    {
      key: "motivo",
      header: "Motivo:",
      value: appointment.user_description ?? "—",
    },
    {
      key: "costo-servicio",
      header: "Costo del servicio:",
      value: "A confirmar en la cita",
    },
    {
      key: "fecha-solicitud",
      header: "Fecha de la solicitud:",
      value: formatDate(appointment.application_date, "short"),
    },
    {
      key: "tipo-reserva",
      header: "Tipo de reserva:",
      value: appointment.reservation_type.value1,
    },
    {
      key: "estado-cita",
      header: "Estado de la cita:",
      value: appointment.appointment_status.code,
    },
  ];
});

const isModalOpen = computed(() => isOpen.subirProforma);

const handleCloseModal = () => {
  closeModal("subirProforma");
};

const handleOpenNotSuitable = () => {
  if (currentAppointment.value) {
    openModal("confirmacionNoApto", { appointment: currentAppointment.value });
    handleCloseModal();
  }
};

const openValorationDetails = () => {
  if (currentAppointment.value) {
    openModal("detallesValoracion", { appointment: currentAppointment.value });
    handleCloseModal();
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
</script>

<style lang="scss" scoped>
.upload-proforma {
  &__icon {
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    background: #d1fadf;
    border: 0.5rem solid #ecfdf3;
    color: #039855;
    margin-bottom: 0.75rem;
    padding: 0.225rem;
  }

  &__title-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 2.5rem;
    height: 2.5rem;
    border: 0.40625rem solid $color-cancel;
    background-color: $color-danger;
    border-radius: 50%;
    padding: 0.375rem;

    svg {
      color: $white;
    }
  }

  &__content {
    padding: 1.25rem 1.5rem 0 1.5rem;
  }

  &__content-title {
    font-family: $font-family-main;
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 1.25rem;
    letter-spacing: 0;
    color: #027a48;
  }

  &__table-wrapper {
    padding: 1.25rem;
    background-color: #f8faff;
    border-radius: 1.25rem;
  }

  &__description {
    font-family: $font-family-main;
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.25rem;
    letter-spacing: 0;
    color: $color-foreground;
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
      padding: 0;
      text-wrap: nowrap;
    }

    &--primary {
      @include primary-button;
      text-wrap: nowrap;
    }
  }
}
</style>
