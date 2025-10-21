<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    size="small"
    class="success-confirmation"
    :close-on-backdrop="false"
    @close="handleCloseModal"
  >
    <div class="success-confirmation__content">
      <h2 class="success-confirmation__content-title">Cambios guardados</h2>
      <p class="success-confirmation__description">
        Acabas de reprogramar la cita de valoración para tu paciente.
      </p>

      <div class="success-confirmation__table-wrapper">
        <MedicosTablaDetallesCita
          v-if="appointmentRowsWithData"
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
      <div class="success-confirmation__actions">
        <button
          :disabled="isLoading"
          class="success-confirmation__button--outline"
          @click="handleNavigateToHome"
        >
          Ir a inicio
        </button>
        <button
          :disabled="isLoading"
          class="success-confirmation__button--primary"
          @click="handleNavigateToAppointments"
        >
          Ver en Citas
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useFormat } from "~/composables/useFormat";
import type { Appointment, AppointmentStatusCode } from "~/types";
import type { TablaBaseRow } from "../tabla-detalles-cita.vue";

const { isOpen, closeModal } = useMedicalModalManager();
const { formatDate, formatTime } = useFormat();
const router = useRouter();

const modalData = computed(() =>
  useMedicalModalManager().getSharedData<{ appointment: Appointment }>(
    "cambiosGuardados"
  )
);

const currentAppointment = computed(() => modalData.value.appointment);

const isModalOpen = computed(() => isOpen.cambiosGuardados);
const isLoading = ref<boolean>(false);

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

const appointmentRowsWithData = computed((): TablaBaseRow[] => {
  if (!currentAppointment.value) return [];

  const appt = currentAppointment.value;
  return [
    {
      key: "tipo-servicio",
      header: "Tipo de servicio:",
      value: appt.appointment_type.name,
    },
    {
      key: "fecha",
      header: "Fecha de la cita:",
      value: formatDate(appt.appointment_date),
      class: "appointment-editor__details-row--editable",
    },
    {
      key: "hora",
      header: "Hora de la cita:",
      value: formatTime(appt.appointment_hour, "hs"),
      class: "appointment-editor__details-row--editable",
    },
    {
      key: "paciente",
      header: "Paciente:",
      value: appt.customer.name,
      isEndRow: true,
    },
    {
      key: "procedimiento",
      header: "Procedimiento:",
      value: appt.package?.procedure?.name ?? "",
    },
    {
      key: "motivo",
      header: "Motivo:",
      value: appt.user_description ?? "",
    },
    {
      key: "costo-servicio",
      header: "Costo del servicio:",
      value: "A confirmar en la cita",
    },
    {
      key: "fecha-solicitud",
      header: "Fecha de la solicitud:",
      value: formatDate(appt.application_date, "short"),
    },
    {
      key: "tipo-reserva",
      header: "Tipo de reserva:",
      value: appt.reservation_type.value1,
    },
    {
      key: "estado-cita",
      header: "Estado de la cita:",
      value: appt.appointment_status.code,
    },
  ];
});

const handleCloseModal = () => {
  closeModal("cambiosGuardados");
};

const handleNavigateToHome = () => {
  router.push("/medicos/inicio");
  handleCloseModal();
};

const handleNavigateToAppointments = () => {
  router.push("/medicos/citas");
  handleCloseModal();
};
</script>

<style lang="scss" scoped>
.success-confirmation {
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

  &__table-wrapper {
    padding: 1.25rem;
    background-color: #f8faff;
    border-radius: 1.25rem;
  }

  &__content-title {
    font-family: $font-family-montserrat-alt;
    font-weight: 700;
    font-size: 1.75rem;
    line-height: 1.84375rem;
    letter-spacing: 0;
    text-align: center;
    color: $color-primary;
  }

  &__description {
    font-family: $font-family-main;
    font-weight: 500;
    font-size: 1.125rem;
    line-height: 1.625rem;
    letter-spacing: 0;
    text-align: center;
    color: $color-text-secondary;
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
