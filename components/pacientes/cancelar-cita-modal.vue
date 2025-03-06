<template>
  <!-- Modal -->
  <div
    v-if="isVisible"
    class="modal fade show"
    tabindex="-1"
    style="display: block; background-color: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header border-0 align-items-center d-flex">
          <img
            v-if="step === 2"
            src="@/src/assets/trash.svg"
            alt="Alerta"
            style="height: 3rem"
          />
          <button
            type="button"
            class="btn-close btn btn-light me-2"
            aria-label="Close"
            @click="closeModal"
          ></button>
        </div>
        <div class="modal-body">
          <!-- Step 1: Appointment Details -->
          <div v-if="step === 1">
            <h5 class="fw-bold">Detalles de la cita</h5>
            <p class="text-muted">
              Te avisaremos cuando tu solicitud de cita sea aceptada.
            </p>
            <table class="table table-borderless">
              <tbody>
                <tr>
                  <td><strong>Tipo de servicio:</strong></td>
                  <td>Cita de valoración</td>
                </tr>
                <tr>
                  <td><strong>Fecha de la cita:</strong></td>
                  <td>{{ formatDate(appointment.date) }}</td>
                </tr>
                <tr>
                  <td><strong>Hora de la cita:</strong></td>
                  <td>{{ appointment.hour }}</td>
                </tr>
                <tr>
                  <td><strong>Paciente titular:</strong></td>
                  <td>{{ appointment.patient_name }}</td>
                </tr>
                <tr>
                  <td><strong>Teléfono de Contacto:</strong></td>
                  <td>{{ appointment.phone }}</td>
                </tr>
                <tr>
                  <td><strong>Profesional Médico:</strong></td>
                  <td>{{ appointment.professional_name }}</td>
                </tr>
                <tr>
                  <td><strong>Procedimiento:</strong></td>
                  <td>{{ appointment.notes }}</td>
                </tr>
                <tr>
                  <td><strong>Costo del servicio:</strong></td>
                  <td>{{ appointment.cost }}</td>
                </tr>
              </tbody>
            </table>
            <div class="mb-3">
              <p class="mb-1 fw-bold">
                <strong>Información de métodos de Pago:</strong>
              </p>
              <p class="fw-bold mb-0">
                <img
                  src="@/src/assets/check.svg"
                  class="mr-2"
                  alt="Vitalink"
                />Pagar en línea con tarjeta.
              </p>
              <p>Paga ahora de forma segura con tu tarjeta.</p>
              <p class="fw-bold mb-0">
                <img
                  src="@/src/assets/check.svg"
                  class="mr-2"
                  alt="Vitalink"
                />Pagar en consulta.
              </p>
              <p>Pagaras directamente el día de tu cita.</p>
            </div>
            <div class="modal-footer">
              <div class="col">
                <button
                  type="button"
                  class="btn btn-outline-danger border w-100"
                  @click="step = 2"
                >
                  Anular cita
                </button>
              </div>
            </div>
          </div>

          <!-- Step 2: Cancellation Confirmation -->
          <div v-if="step === 2">
            <h5 class="fw-bold">¿Seguro que quieres cancelar esta cita?</h5>
            <p class="text-muted">
              Se le enviará un correo electrónico automático al usuario
              avisándole que su cita ha sido cancelada.
            </p>
            <div class="modal-footer">
              <div class="col">
                <button
                  type="button"
                  class="btn btn-white border w-100"
                  @click="step = 1"
                >
                  No, volver
                </button>
              </div>
              <div class="col">
                <button
                  type="button"
                  class="btn btn-danger border w-100"
                  @click="cancelAppointment"
                >
                  Sí, cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer justify-content-center" v-if="errorText">
          <p class="text-danger">{{ errorText }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  appointment: Object,
  isVisible: Boolean, // Prop to control modal visibility
});

const emit = defineEmits(["close"]);

const step = ref(1); // 1: Details, 2: Cancellation Confirmation
const errorText = ref(null);

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const cancelAppointment = async () => {
  const { data, error } = await useFetch(
    config.public.API_BASE_URL + "/appointments/" + props.appointment.id,
    {
      method: "PUT",
      headers: { Authorization: token.value },
      body: {
        status: "CANCELED",
      },
    }
  );
  if (data.value) {
    closeModal();
    step.value = 1; // Reset to step 1 after cancellation
  }
  if (error.value) {
    console.log(error.value, "data");
    errorText.value = error.value.data.info;
  }
};

const closeModal = () => {
  emit("close"); // Emit close event to parent
};
</script>

<style lang="scss" scoped>
.modal {
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
