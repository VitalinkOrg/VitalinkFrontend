<template>
  <div class="reservation-confirmation">
    <header class="appointment-modal__header">
      <button
        type="button"
        class="appointment-modal__close-btn"
        aria-label="Cerrar modal de detalles de cita"
        @click="closeModal"
      >
        <AtomsIconsXIcon width="24" height="24" aria-hidden="true" />
      </button>
    </header>

    <span
      v-if="appointment.appointment_status.code == 'PENDING_PROCEDURE'"
      style="max-width: max-content"
      class="d-flex justify-content-between gap-2 rounded-circle bg-warning-subtle text-warning p-3 my-3"
    >
      <img
        src="@/src/assets/warning.svg"
        width="20"
        class="mr-2"
        alt="Vitalink"
      />
    </span>

    <h5 class="fw-bold">¿Confirmar reserva?</h5>

    <p class="fw-bold">
      {{
        appointment.appointment_status.code ==
          "PENDING_VALORATION_APPOINTMENT" ||
        appointment.appointment_status.code == "PENDING_PROCEDURE"
          ? "Con estos cambios el estado de la solicitud de reserva pasará de: Pendiente a Confirmada"
          : appointment.appointment_status.code == "WAITING_PROCEDURE"
            ? "Con estos cambios el estado de la solicitud de reserva pasará de: Pendiente a Concretada"
            : "Con estos cambios el estado de la solicitud de reserva pasará de: Pendiente a Valorada"
      }}
    </p>

    <p
      v-if="
        appointment.appointment_status.code == 'PENDING_VALORATION_APPOINTMENT'
      "
      class="text-muted"
    >
      Le enviaremos una notificación al paciente para que acuda a la cita de
      valoración en la fecha que has confirmado
    </p>

    <div
      v-if="
        appointment.appointment_status.code == 'PENDING_VALORATION_APPOINTMENT'
      "
      class="d-flex align-items-center justify-content-between gap-2 bg-warning-subtle text-warning p-3 my-3"
    >
      <img
        src="@/src/assets/warning.svg"
        width="48"
        class="mr-2"
        alt="Vitalink"
      />
      <p class="m-0">
        Asegúrate de que la fecha y hora de la cita sean correctos.
      </p>
    </div>

    <div class="d-flex justify-content-between gap-2">
      <button class="btn btn-outline-dark w-50" @click="$emit('cancel')">
        Cancelar
      </button>

      <button
        v-if="
          appointment.appointment_status.code ==
          'PENDING_VALORATION_APPOINTMENT'
        "
        class="btn btn-primary w-50"
        @click="$emit('confirmAppointment')"
      >
        Confirmar
      </button>

      <button
        v-else-if="appointment.appointment_status.code == 'PENDING_PROCEDURE'"
        class="btn btn-primary w-50"
        @click="$emit('confirmProcedure')"
      >
        Confirmar
      </button>

      <button
        v-else-if="appointment.appointment_status.code == 'WAITING_PROCEDURE'"
        class="btn btn-primary w-50"
        @click="$emit('finishProcedure')"
      >
        Confirmar
      </button>

      <button
        v-else
        class="btn btn-primary w-50"
        @click="$emit('confirmValoration')"
      >
        Confirmar
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  appointment: Object,
});

const emit = defineEmits([
  "cancel",
  "confirmAppointment",
  "confirmProcedure",
  "finishProcedure",
  "confirmValoration",
]);
</script>

<style lang="scss" scoped>
.reservation-confirmation {
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: 718px;
  width: 100%;
  max-height: calc(100vh - 3rem);
  pointer-events: auto;
  background-color: $white;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  outline: 0;
  overflow: hidden;
  box-shadow: 0px 8px 8px -4px #1018280a;
  box-shadow: 0px 20px 24px -4px #1018281a;
}

.fw-bold {
  font-weight: 600;
}

.text-muted {
  color: #6c757d;
}
</style>
