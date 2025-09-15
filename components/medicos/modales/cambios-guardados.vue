<template>
  <slot name="trigger" :open="handleOpenModal"></slot>

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
          :rows="appointmentRowsWithData"
          :hidden-title="true"
          :aria-label="`Detalles de la cita de ${appointment.customer.name}`"
        >
          <template #data-estado-cita>
            <span
              class="status-badge"
              :class="getStatusClass(appointment.appointment_status.code)"
            >
              {{ appointment.appointment_status.value1 }}
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
import { useFormat } from "~/composables/useFormat";
import type { Appointment, AppointmentStatusCode } from "~/types";
import type { TablaBaseRow } from "../tabla-detalles-cita.vue";

const { formatDate } = useFormat();

interface Props {
  appointment: Appointment;
}

const props = defineProps<Props>();

const isModalOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);

const handleOpenModal = () => {
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
};

const closeAppointmentDetailsModal = inject<() => void>(
  "closeAppointmentDetailsModal"
);

const appointmentRowsWithData = computed((): TablaBaseRow[] => [
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
  },
  {
    key: "paciente",
    header: "Paciente:",
    value: props.appointment.customer.name,
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
    key: "estado-cita",
    header: "Estado de la cita:",
    value: props.appointment.appointment_status.code,
  },
]);

const handleNavigateToHome = () => {
  handleCloseModal();
  closeAppointmentDetailsModal?.();
  useRouter().push("/medicos/inicio");
};

const handleNavigateToAppointments = () => {
  handleCloseModal();
  closeAppointmentDetailsModal?.();
  useRouter().push("/medicos/citas");
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

defineExpose({
  handleOpenModal,
  handleCloseModal,
  isOpen: readonly(isModalOpen),
  isLoading: readonly(isLoading),
});
</script>

<style lang="scss" scoped>
.success-confirmation {
  &__title-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border: 6.5px solid #fac6d0;
    background-color: #ff2d46;
    border-radius: 50%;
    padding: 6px;

    svg {
      color: $white;
    }
  }

  &__content {
    padding: 20px 24px 0px 24px;
  }

  &__table-wrapper {
    padding: 20px;
    background-color: #f8faff;
    border-radius: 20px;
  }

  &__content-title {
    font-family: $font-family-montserrat-alt;
    font-family: Montserrat Alternates;
    font-weight: 700;
    font-size: 28px;
    line-height: 29.5px;
    letter-spacing: 0;
    text-align: center;
    color: #3541b4;
  }

  &__description {
    font-family: $font-family-main;
    font-weight: 500;
    font-size: 18px;
    line-height: 26px;
    letter-spacing: 0;
    text-align: center;
    color: #6d758f;
  }

  &__actions {
    width: 100%;
    display: flex;
    gap: 12px;
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
