<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    size="small"
    :close-on-backdrop="false"
    @close="handleClose"
    aria-labelledby="saved-modal-title"
  >
    <div class="saved-modal__content">
      <h2 id="saved-modal-title" class="saved-modal__title">
        Cambios guardados
      </h2>
      <p class="saved-modal__description">
        Acabas de reprogramar la cita de valoración para tu paciente.
      </p>

      <div class="saved-modal__summary" v-if="appointment">
        <MedicosTablaDetallesCita
          :rows="summaryRows"
          :hidden-title="true"
          :aria-label="`Resumen de la cita de ${appointment.customer?.name}`"
        >
          <template #data-estado-cita>
            <span :class="statusBadgeClass">
              {{ appointment.appointment_status?.value1 }}
            </span>
          </template>
        </MedicosTablaDetallesCita>
      </div>
    </div>

    <template #footer>
      <div class="saved-modal__actions">
        <button
          class="saved-modal__action saved-modal__action--outline"
          @click="navigateToHome"
        >
          Ir a inicio
        </button>
        <button
          class="saved-modal__action saved-modal__action--primary"
          @click="navigateToAppointments"
        >
          Ver en Citas
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import type { TablaBaseRow } from "@/components/medicos/tabla-detalles-cita.vue";
import { useFormat } from "@/composables/useFormat";
import { useMedicalModalManager } from "@/composables/useMedicalModalManager";

const { isOpen, closeModal, getSharedData } = useMedicalModalManager();
const { formatDate, formatTime } = useFormat();
const router = useRouter();

const isModalOpen = computed(() => isOpen.cambiosGuardados);

const modalData = computed(() =>
  getSharedData<{ appointment: IAppointment }>("cambiosGuardados"),
);

const appointment = computed(() => modalData.value?.appointment);

const statusCode = computed(
  () => appointment.value?.appointment_status?.code ?? "",
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

const summaryRows = computed((): TablaBaseRow[] => {
  const apt = appointment.value;
  if (!apt) return [];

  return [
    {
      key: "tipo-servicio",
      header: "Tipo de servicio:",
      value: apt.appointment_type?.name ?? "",
    },
    {
      key: "fecha",
      header: "Fecha de la cita:",
      value: apt.appointment_date ? formatDate(apt.appointment_date) : "-",
      class: "saved-modal__row--highlight",
    },
    {
      key: "hora",
      header: "Hora de la cita:",
      value: apt.appointment_hour
        ? formatTime(apt.appointment_hour, "hs")
        : "-",
      class: "saved-modal__row--highlight",
    },
    {
      key: "paciente",
      header: "Paciente:",
      value: apt.customer?.name ?? "",
      isEndRow: true,
    },
    {
      key: "procedimiento",
      header: "Procedimiento:",
      value: apt.package?.procedure?.name ?? "",
    },
    {
      key: "motivo",
      header: "Motivo:",
      value: apt.user_description ?? "",
    },
    {
      key: "costo-servicio",
      header: "Costo del servicio:",
      value: "A confirmar en la cita",
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
});

const handleClose = () => {
  closeModal("cambiosGuardados");
};

const navigateToHome = () => {
  handleClose();
  router.push("/medicos/inicio");
};

const navigateToAppointments = () => {
  handleClose();
  router.push("/medicos/citas");
};
</script>

<style lang="scss" scoped>
.saved-modal {
  &__content {
    padding: 1.25rem 1.5rem 0 1.5rem;
  }

  &__title {
    font-family: $font-family-montserrat-alt;
    font-weight: 700;
    font-size: 1.75rem;
    line-height: 1.85rem;
    text-align: center;
    color: $color-primary;
    margin: 0;
  }

  &__description {
    font-family: $font-family-main;
    font-weight: 500;
    font-size: 1.125rem;
    line-height: 1.625rem;
    text-align: center;
    color: $color-text-secondary;
    margin: 0.75rem 0 0 0;
  }

  &__summary {
    margin-top: 1.25rem;
    padding: 1.25rem;
    background-color: #f8faff;
    border-radius: 1.25rem;
  }

  &__row--highlight {
    background-color: rgba($color-primary, 0.04);
  }

  &__actions {
    width: 100%;
    display: flex;
    gap: 0.75rem;
  }

  &__action {
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
