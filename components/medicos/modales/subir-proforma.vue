<template>
  <slot name="trigger" :open="handleOpenModal"></slot>

  <AtomsModalBase
    :is-open="isModalOpen"
    size="small"
    class="upload-proforma"
    :close-on-backdrop="false"
    @close="handleCloseModal"
  >
    <div class="upload-proforma__content">
      <h2 class="upload-proforma__content-title">¡Bien hecho!</h2>
      <p class="upload-proforma__description">
        El cambio de estado de la cita se ha realizado con éxito:
      </p>

      <div class="upload-proforma__table-wrapper">
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
      <div class="upload-proforma__actions">
        <MedicosModalesConfirmacionNoApto :appointment="appointment">
          <template #trigger="{ open }">
            <button
              :disabled="isLoading"
              class="upload-proforma__button--outline"
              @click="open"
            >
              No apto para procedimiento
            </button>
          </template>
        </MedicosModalesConfirmacionNoApto>
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

  <MedicosModalesDetallesValoracion
    ref="valorationDetailsRef"
    :appointment="appointment"
  />
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

const isModalOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);

const valorationDetailsRef = ref();

const handleOpenModal = () => {
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
};

const openValorationDetails = () => {
  valorationDetailsRef.value?.handleOpenModal();
  handleCloseModal();
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
.upload-proforma {
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

  &__content-title {
    font-family: $font-family-main;
    font-weight: 600;
    font-size: 24px;
    line-height: 20px;
    letter-spacing: 0;
    color: #027a48;
  }

  &__table-wrapper {
    padding: 20px;
    background-color: #f8faff;
    border-radius: 20px;
  }

  &__description {
    font-family: $font-family-main;
    font-weight: 400;
    font-size: 16px;
    line-height: 20px;
    letter-spacing: 0;
    color: #19213d;
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
