<template>
  <div class="reservation-confirmation">
    <header class="reservation-confirmation__header">
      <button
        type="button"
        class="reservation-confirmation__close-button"
        aria-label="Cerrar modal de detalles de cita"
        @click="closeModal"
      >
        <AtomsIconsXIcon width="24" height="24" aria-hidden="true" />
      </button>
    </header>

    <main class="reservation-confirmation__body">
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

      <h5
        v-if="
          appointment.appointment_status.code ===
            'PENDING_VALORATION_APPOINTMENT' ||
          appointment.appointment_status.code ===
            'CONFIRM_VALIDATION_APPOINTMENT'
        "
        class="reservation-confirmation__body--title"
      >
        {{
          showPaymentWarning
            ? "¿Continuar sin pago registrado?"
            : "¿Confirmar valoración?"
        }}
      </h5>

      <h5
        v-else-if="
          appointment.appointment_status.code == 'WAITING_PROCEDURE' ||
          appointment.appointment_status.code == 'CONFIRM_PROCEDURE' ||
          appointment.appointment_status.code == 'CONCRETED_APPOINTMENT'
        "
        class="reservation-confirmation__body--title"
      >
        {{
          showPaymentWarning
            ? "Confirmar reserva sin pago registrado?"
            : "¿Confirmar procedimiento?"
        }}
      </h5>

      <h5 v-else class="reservation-confirmation__body--title">
        {{
          showPaymentWarning
            ? "Confirmar reserva sin pago registrado?"
            : "¿Confirmar reserva?"
        }}
      </h5>

      <p
        class="reservation-confirmation__body--text"
        v-if="
          appointment.appointment_status.code ===
            'PENDING_VALORATION_APPOINTMENT' ||
          appointment.appointment_status.code ===
            'CONFIRM_VALIDATION_APPOINTMENT'
        "
      >
        {{
          showPaymentWarning
            ? "El paciente podrá realizar el pago directamente contigo durante la consulta."
            : appointment.appointment_status.code ==
                  "PENDING_VALORATION_APPOINTMENT" ||
                appointment.appointment_status.code == "PENDING_PROCEDURE"
              ? "Con estos cambios el estado de la solicitud de valoración pasará de: Pendiente a Confirmada"
              : appointment.appointment_status.code == "WAITING_PROCEDURE" ||
                  appointment.appointment_status.code == "CONFIRM_PROCEDURE" ||
                  appointment.appointment_status.code == "CONCRETED_APPOINTMENT"
                ? "Con estos cambios el estado de la solicitud de valoración pasará de: Pendiente a Concretada"
                : "Con estos cambios el estado de la solicitud de valoración pasará de: Pendiente a Valorada"
        }}
      </p>

      <p v-else class="reservation-confirmation__body--text">
        {{
          showPaymentWarning
            ? "El paciente podrá realizar el pago directamente contigo durante la consulta."
            : appointment.appointment_status.code ==
                  "PENDING_VALORATION_APPOINTMENT" ||
                appointment.appointment_status.code == "PENDING_PROCEDURE"
              ? "Con estos cambios el estado de la solicitud de valoración pasará de: Pendiente a Confirmada"
              : appointment.appointment_status.code == "WAITING_PROCEDURE" ||
                  appointment.appointment_status.code == "CONFIRM_PROCEDURE" ||
                  appointment.appointment_status.code == "CONCRETED_APPOINTMENT"
                ? "Con estos cambios el estado de la solicitud de procedimiento pasará de: Pendiente a Concretada"
                : "Con estos cambios el estado de la solicitud de reserva pasará de: Pendiente a Valorada"
        }}
      </p>

      <div
        v-if="showPaymentWarning"
        class="reservation-confirmation__body--payment-warning-wrapper"
      >
        <div class="reservation-confirmation__body--payment-warning-content">
          <p class="reservation-confirmation__body--payment-warning-title">
            Sin registro de pago
          </p>
          <p class="reservation-confirmation__body--payment-warning-text">
            No tenemos registro del pago del paciente. ¿Desea continuar con la
            valoración de todas formas?
          </p>
        </div>
      </div>

      <p
        v-if="
          appointment.appointment_status.code ==
            'PENDING_VALORATION_APPOINTMENT' && !showPaymentWarning
        "
        class="reservation-confirmation__body--subtext"
      >
        Le enviaremos una notificación al paciente para que acuda a la cita de
        valoración en la fecha que has confirmado
      </p>

      <div
        v-if="
          appointment.appointment_status.code ==
            'PENDING_VALORATION_APPOINTMENT' && !showPaymentWarning
        "
        class="reservation-confirmation__body--warning-wrapper"
      >
        <div class="reservation-confirmation__body--warning-icon">
          <AtomsIconsTriangleAlertIcon size="24" />
        </div>
        <p class="reservation-confirmation__body--warning-text">
          Asegúrate de que la fecha y hora de la cita sean correctos.
        </p>
      </div>
    </main>

    <footer class="reservation-confirmation__footer">
      <button
        class="reservation-confirmation__footer--button-outline"
        :disabled="isLoading"
        @click="handleCancel"
      >
        {{ showPaymentWarning ? "No, cancelar" : "Cancelar" }}
      </button>

      <button
        v-if="showPaymentWarning"
        class="reservation-confirmation__footer--button-primary"
        :disabled="isLoading"
        @click="handleContinueWithoutPayment"
      >
        {{ isLoading ? "Guardando" : "Sí, continuar" }}
      </button>

      <button
        v-else-if="
          appointment.appointment_status.code ==
          'PENDING_VALORATION_APPOINTMENT'
        "
        aria-label="Valoración pendiente"
        class="reservation-confirmation__footer--button-primary"
        :disabled="isLoading"
        @click="handleConfirmAppointment"
      >
        {{ isLoading ? "Procesando..." : "Confirmar" }}
      </button>

      <button
        v-else-if="appointment.appointment_status.code == 'PENDING_PROCEDURE'"
        aria-label="Procedimiento pendiente"
        :disabled="isLoading"
        class="reservation-confirmation__footer--button-primary"
        @click="handleConfirmAppointment"
      >
        {{ isLoading ? "Procesando..." : "Confirmar" }}
      </button>

      <button
        v-else-if="
          appointment.appointment_status.code == 'WAITING_PROCEDURE' ||
          appointment.appointment_status.code == 'CONFIRM_PROCEDURE' ||
          appointment.appointment_status.code == 'CONCRETED_APPOINTMENT'
        "
        aria-label="Finalizar procedimiento"
        class="reservation-confirmation__footer--button-primary"
        :disabled="isLoading"
        @click="handleFinishProcedure"
      >
        {{ isLoading ? "Procesando..." : "Confirmar" }}
      </button>

      <button
        v-else
        aria-label="Confirmar valoración"
        class="reservation-confirmation__footer--button-primary"
        :disabled="isLoading"
        @click="handleConfirmValoration"
      >
        {{ isLoading ? "Procesando..." : "Confirmar" }}
      </button>
    </footer>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  appointment: Object,
  closeModal: Function,
  isLoading: Boolean,
});

const emit = defineEmits([
  "cancel",
  "confirmAppointment",
  "confirmProcedure",
  "finishProcedure",
  "confirmValoration",
]);

const showPaymentWarning = ref(false);

const hasPatientPaid = computed(() => {
  return (
    props.appointment?.payment_status === "PAYMENT_STATUS_NOT_PAID_PROCEDURE" ||
    props.appointment?.has_paid === true
  );
});

const handleConfirmAppointment = () => {
  if (
    props.appointment.appointment_status.code ===
      "CONFIRM_VALIDATION_APPOINTMENT" &&
    !hasPatientPaid.value
  ) {
    showPaymentWarning.value = true;
    return;
  }

  if (
    props.appointment.appointment_status.code ===
      "CONFIRM_VALIDATION_APPOINTMENT" ||
    props.appointment.appointment_status.code ===
      "PENDING_VALORATION_APPOINTMENT"
  ) {
    emit("confirmAppointment");
    return;
  }

  if (props.appointment.appointment_status.code === "PENDING_PROCEDURE") {
    emit("confirmProcedure");
    return;
  }
};

const handleFinishProcedure = () => {
  if (props.appointment.appointment_status.code === "CONFIRM_PROCEDURE") {
    showPaymentWarning.value = true;
    return;
  }

  emit("confirmProcedure");
};

const handleConfirmValoration = () => {
  if (
    props.appointment.appointment_status.code ===
      "CONFIRM_VALIDATION_APPOINTMENT" &&
    !hasPatientPaid.value
  ) {
    showPaymentWarning.value = true;
    return;
  }

  emit("confirmValoration");
};

const handleContinueWithoutPayment = () => {
  if (props.appointment.appointment_status.code === "CONFIRM_PROCEDURE") {
    emit("confirmProcedure");
    return;
  }

  if (
    props.appointment.appointment_status.code ===
    "CONFIRM_VALIDATION_APPOINTMENT"
  ) {
    emit("confirmValoration");
    return;
  }
};

const handleCancel = () => {
  if (showPaymentWarning.value) {
    showPaymentWarning.value = false;
  } else {
    emit("cancel");
  }
};
</script>

<style lang="scss" scoped>
.reservation-confirmation {
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: 400px;
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

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg;
    background-color: $white;
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
    padding: 0px 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    &--title {
      @include label-base;
      font-weight: 600;
      font-size: 24px;
      line-height: 24px;
      color: #19213d;
      margin: 0;
    }

    &--text {
      @include label-base;
      font-weight: 600;
      font-size: 14px;
      line-height: 24px;
      color: #353e5c;
      margin: 0;
    }

    &--subtext {
      @include label-base;
      font-weight: 500;
      font-size: 14px;
      line-height: 24px;
      color: #6d758f;
      margin: 0;
    }

    &--warning-wrapper {
      display: flex;
      align-items: center;
      width: 100%;
      gap: 10px;
      padding: 10px;
      border-radius: 12px;
      background-color: #fffaeb;
    }

    &--warning-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: #fef0c7;
      color: #dc6803;
      flex: 0 0 auto;
    }

    &--warning-text {
      @include label-base;
      font-weight: 500;
      font-size: 14px;
      line-height: 24px;
      color: #dc6803;
    }

    &--payment-warning-wrapper {
      display: flex;
      align-items: flex-start;
      width: 100%;
      gap: 12px;
      padding: 16px;
      border-radius: 12px;
      background-color: #fef2f2;
      border: 1px solid #fecaca;
      margin-bottom: 8px;
    }

    &--payment-warning-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #fee2e2;
      color: #dc6803;
      flex: 0 0 auto;
    }

    &--payment-warning-content {
      flex: 1;
    }

    &--payment-warning-title {
      @include label-base;
      font-weight: 600;
      font-size: 14px;
      line-height: 20px;
      color: #dc6803;
      margin: 0 0 4px 0;
    }

    &--payment-warning-text {
      @include label-base;
      font-weight: 500;
      font-size: 13px;
      line-height: 18px;
      color: #dc6803;
      margin: 0;
    }
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    padding: 24px;
    gap: 12px;

    &--button-outline {
      @include outline-button;
      width: 100%;
    }

    &--button-primary {
      @include primary-button;
      width: 100%;
    }
  }
}
</style>
