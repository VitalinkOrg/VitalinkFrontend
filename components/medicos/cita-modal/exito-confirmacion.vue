<template>
  <div class="success-confirmation">
    <!-- Modal Header -->
    <header class="success-confirmation__header">
      <button
        type="button"
        class="success-confirmation__close-button"
        aria-label="Cerrar modal de detalles de la cita"
        @click="closeModal"
      >
        <AtomsIconsXIcon width="24" height="24" aria-hidden="true" />
      </button>
    </header>

    <main class="success-confirmation__body">
      <span
        v-if="appointment.appointment_type == 'reserva'"
        class="d-flex justify-content-start"
      >
        <img
          src="@/src/assets/check.svg"
          width="48"
          class="mb-3"
          alt="Vitalink"
        />
      </span>

      <h4
        class="success-confirmation__body--title"
        :class="
          appointment.appointment_status.code == 'VALUED_VALORATION_APPOINTMENT'
            ? 'text-success text-left fw-bold'
            : 'text-primary text-center'
        "
      >
        {{
          appointment.appointment_status.code ==
          "PENDING_VALORATION_APPOINTMENT"
            ? "¡Felicitaciones!"
            : "¡Bien hecho!"
        }}
      </h4>

      <p
        class="success-confirmation__body--subtitle"
        :class="
          appointment.appointment_status.code ==
          'PENDING_VALORATION_APPOINTMENT'
            ? 'text-center'
            : 'text-left'
        "
      >
        {{
          appointment.appointment_status.code ==
          "PENDING_VALORATION_APPOINTMENT"
            ? "Acabas de confirmar la cita de valoración para tu paciente."
            : "El cambio de estado de la cita se ha realizado con éxito"
        }}
      </p>

      <table class="table table-borderless"></table>
    </main>

    <!-- Botones para citas confirmadas -->

    <footer class="success-confirmation__footer">
      <div
        v-if="
          appointment.appointment_status.code ==
            'PENDING_VALORATION_APPOINTMENT' ||
          appointment.appointment_status.code == 'PENDING_PROCEDURE' ||
          appointment.appointment_status.code == 'WAITING_PROCEDURE' ||
          appointment.appointment_status.code == 'CONFIRM_PROCEDURE' ||
          appointment.appointment_status.code == 'CONCRETED_APPOINTMENT'
        "
        class="col-12 d-flex justify-content-between gap-2"
      >
        <button
          class="success-confirmation__footer--button-outline"
          @click="$emit('goToStart')"
        >
          Ir al inicio
        </button>
        <button
          class="success-confirmation__footer--button-primary"
          @click="$emit('viewAppointments')"
        >
          Ver en Citas
        </button>
      </div>

      <!-- Botones para valoración -->
      <div v-else class="col-12 d-flex justify-content-between gap-2">
        <button
          class="success-confirmation__footer--button-outline"
          @click="$emit('notSuitableProcedure')"
        >
          No apto para procedimiento
        </button>
        <button
          class="success-confirmation__footer--button-primary"
          @click="$emit('uploadProforma')"
        >
          Subir proforma
        </button>
      </div>
    </footer>
  </div>
</template>

<script setup>
const props = defineProps({
  appointment: Object,
  closeModal: Function,
});

const emit = defineEmits([
  "goToStart",
  "viewAppointments",
  "uploadProforma",
  "notSuitableProcedure",
]);
</script>

<style lang="scss" scoped>
.success-confirmation {
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: 536px;
  width: 100%;
  max-height: calc(100vh - 3rem);
  pointer-events: auto;
  background-color: $white;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  outline: 0;
  overflow: hidden;
  box-shadow:
    0px 8px 8px -4px #1018280a,
    0px 20px 24px -4px #1018281a;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg;
    border-bottom: 1px solid #e4e7ec;
    background-color: $white;
  }

  &__title {
    font-family: $font-family-main;
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    color: #353e5c;
    margin: 0;
  }

  &__close-button {
    @include button-base;
    background-color: transparent;
    border: none;
    padding: $spacing-sm;
    color: #353e5c;
    border-radius: 50%;
    margin-left: auto;
    transition: all 0.15s ease-in-out;

    &:hover {
      color: $black;
      background-color: #f5f5f5;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }

  &__body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;

    &--title {
      @include label-base;
      font-family: $font-family-montserrat-alt;
      font-weight: 700;
      font-size: 28px;
      line-height: 29.5px;
      text-align: center;
      color: #3541b4;
    }

    &--subtitle {
      @include label-base;
      font-weight: 500;
      font-size: 18px;
      line-height: 26px;
      text-align: center;
      color: #6d758f;
    }
  }

  &__footer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    padding: 24px;

    &--button-outline {
      @include outline-button;
      font-weight: 600;
      font-size: 16px;
      line-height: 24px;
      width: 100%;
    }

    &--button-primary {
      @include primary-button;
      font-weight: 600;
      font-size: 16px;
      line-height: 24px;
      width: 100%;
    }
  }
}
</style>
