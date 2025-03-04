<template>
  <!-- Button trigger modal -->
  <button class="btn btn-outline-dark text-nowrap me-2" @click="open = true">
               Pagar ahora
            </button>
  <!-- Modal -->
  <div
    class="modal fade"
    id="appointment.id"
    :class="open ? 'show' : ''"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header border-0 align-items-center d-flex">
          <img v-if="step === 2" src="@/src/assets/trash.svg" alt="Alerta" style="height: 3rem" />
          <button
            type="button"
            class="btn-close btn btn-light me-2"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="open = false"
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
                    <td>Jueves, 5 de Octubre</td>
                  </tr>
                  <tr>
                    <td><strong>Hora de la cita:</strong></td>
                    <td>11:00 hs</td>
                  </tr>
                  <tr>
                    <td><strong>Paciente titular:</strong></td>
                    <td>Ana Pérez</td>
                  </tr>
                  <tr>
                    <td><strong>Teléfono de Contacto:</strong></td>
                    <td>0000000</td>
                  </tr>
                  <tr>
                    <td><strong>Profesional Médico:</strong></td>
                    <td>María Pérez</td>
                  </tr>
                  <tr>
                    <td><strong>Procedimiento:</strong></td>
                    <td>Operación de cataratas</td>
                  </tr>
                  <tr>
                    <td><strong>Costo del servicio:</strong></td>
                    <td>€18.000</td>
                  </tr>
                </tbody>
              </table>
            <div class="mb-3">
              <p class="mb-1"><strong>Información de métodos de Pago:</strong></p>
              <p>Pagar en línea con tarjeta.</p>
              <p>Paga ahora de forma segura con tu tarjeta.</p>
              <p>Pagar en consulta.</p>
              <p>Pagaras directamente el día de tu cita.</p>
            </div>
            <div class="modal-footer">
              <div class="col">
                <button
                  type="button"
                  class="btn btn-white border w-100"
                  data-bs-dismiss="modal"
                  @click="open = false"
                >
                  Volver
                </button>
              </div>
              <div class="col">
                <button
                  type="button"
                  class="btn btn-primary border w-100"
                  @click="step = 2"
                >
                  Cancelar cita
                </button>
              </div>
            </div>
          </div>

          <!-- Step 2: Cancellation Confirmation -->
          <div v-if="step === 2">
            <h5 class="fw-bold">¿Seguro que quieres cancelar esta cita?</h5>
            <p class="text-muted">
              Se le enviará un correo electrónico automático al usuario avisándole
              que su cita ha sido cancelada.
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
import { ref, defineProps } from "vue";
const props = defineProps(["appointment"]);
const config = useRuntimeConfig();
const token = useCookie("token");
const open = ref(false);
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
    open.value = false;
    step.value = 1; // Reset to step 1 after cancellation
  }
  if (error.value) {
    console.log(error.value, "data");
    errorText.value = error.value.data.info;
  }
};
</script>

<style lang="scss" scoped>
.show {
  display: block;
  background-color: rgba(0, 0, 0, 0.1);
}
.stepper {
  &-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 2rem;
    &-icon {
      font-size: 2rem;
    }
  }
}
</style>
