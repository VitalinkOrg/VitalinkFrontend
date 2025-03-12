<template>
  <div>
    <!-- Confirmed and not paid -->
    <div v-if="appointment.status === 'Confirmada' && !appointment.payed">
      <button
        v-if="!showStatus"
        role="button"
        class="btn btn-outline-dark text-nowrap me-2"
        @click="open = true"
      >
        Pagar ahora
      </button>
      <span
        v-else
        role="button"
        @click="open = true"
        class="badge rounded-5 text-dark"
        :class="statusClass(appointment.status)"
      >
        {{ appointment.status }}
      </span>
    </div>

    <!-- Paid -->
    <div v-else-if="appointment.payed" role="button">
      <div v-if="!showStatus" class="d-flex gap-2">
        <img src="@/src/assets/success.svg" class="mr-2" alt="Success" />
        <p class="text-success mb-0">Pagado</p>
      </div>
      <span
        v-else
        role="button"
        class="badge rounded-5 text-dark"
        :class="statusClass(appointment.status)"
      >
        {{ appointment.status }}
      </span>
    </div>

    <!-- Pending -->
    <div v-else-if="appointment.status === 'Pendiente'">
      <button
        v-if="!showStatus"
        role="button"
        class="btn btn-outline-dark text-nowrap me-2"
        @click="open = true"
      >
        Cancelar cita
      </button>
      <span
        v-else
        role="button"
        @click="open = true"
        class="badge rounded-5 text-dark"
        :class="statusClass(appointment.status)"
      >
        {{ appointment.status }}
      </span>
    </div>
    <!-- Cancelled -->
    <div v-else-if="appointment.status === 'Cancelada'">
      <span
        v-if="showStatus"
        role="button"
        class="badge rounded-5 text-dark"
        :class="statusClass(appointment.status)"
      >
        {{ appointment.status }}
      </span>
    </div>
  </div>
  <div
    class="modal fade"
    :class="{ show: open }"
    v-if="open"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
    style="display: block; background-color: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div
          class="modal-header border-0 align-items-center d-flex justify-content-between"
        >
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
                  <td><strong>Estado:</strong></td>
                  <td>
                    <span
                      class="badge rounded-5 text-dark"
                      :class="statusClass(appointment.status)"
                    >
                      {{ appointment.status }}
                    </span>
                  </td>
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
              <div class="d-flex gap-2">
                <img
                  src="@/src/assets/check.svg"
                  width="20px"
                  class="mr-2"
                  alt="Vitalink"
                />
                <p class="ml-2 fw-bold mb-0">Pagar en línea con tarjeta.</p>
              </div>
              <p>Paga ahora de forma segura con tu tarjeta.</p>
              <div class="d-flex gap-2">
                <img src="@/src/assets/check.svg" class="mr-2" alt="Vitalink" />
                <p class="ml-2 fw-bold mb-0">Pagar en consulta.</p>
              </div>
              <p>Pagaras directamente el día de tu cita.</p>
            </div>
            <div class="d-flex justify-content-between gap-2">
              <button class="btn btn-outline-dark w-50" @click="step = 4">
                Anular cita
              </button>
              <button
                v-if="appointment.status === 'Confirmada'"
                class="btn btn-primary w-50"
                @click="step = 2"
              >
                Continuar
              </button>
            </div>
          </div>

          <!-- Step 2: Payment Details -->
          <div v-if="step === 2">
            <div class="d-flex flex-column">
              <img
                src="@/src/assets/card.svg"
                width="24"
                class="mr-2"
                alt="Vitalink"
              />
              <h5 class="fw-bold">Detalles del pago</h5>
            </div>
            <p class="text-muted">Rellena los datos de tu tarjeta.</p>
            <form>
              <!-- Nombre de tarjeta and Vence on the same row -->
              <div class="row mb-3">
                <div class="col-8">
                  <label for="cardName" class="form-label">Nombre</label>
                  <input
                    type="text"
                    class="form-control"
                    id="cardName"
                    v-model="cardName"
                  />
                </div>
                <div class="col-4">
                  <label for="expiryDate" class="form-label">Vence</label>
                  <input
                    type="text"
                    class="form-control"
                    id="expiryDate"
                    v-model="expiryDate"
                  />
                </div>
              </div>

              <!-- Número de tarjeta and CVV on the same row -->
              <div class="row mb-3">
                <div class="col-8">
                  <label for="cardNumber" class="form-label"
                    >Número de tarjeta</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="cardNumber"
                    v-model="cardNumber"
                  />
                </div>
                <div class="col-4">
                  <label for="cvv" class="form-label">CVV</label>
                  <input
                    type="text"
                    class="form-control"
                    id="cvv"
                    v-model="cvv"
                  />
                </div>
              </div>

              <!-- Correo electrónico takes a whole row -->
              <div class="row mb-3">
                <div class="col-12">
                  <label for="email" class="form-label"
                    >Correo electrónico</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="email"
                    v-model="email"
                  />
                </div>
              </div>
              <p class="fw-bold mb-0">Resumen de pago</p>
              <table class="table table-borderless">
                <tbody>
                  <tr>
                    <td><strong>Subtotal:</strong></td>
                    <td>€18.000</td>
                  </tr>
                  <tr>
                    <td><strong>Descuento:</strong></td>
                    <td>€0</td>
                  </tr>
                  <tr class="total">
                    <td><strong>Total:</strong></td>
                    <td class="fw-bold">€18.000</td>
                  </tr>
                </tbody>
              </table>

              <div class="d-flex justify-content-between gap-2">
                <button class="btn btn-outline-dark w-50" @click="step = 1">
                  Atrás
                </button>
                <button
                  class="btn btn-primary w-50"
                  @click.prevent="processPayment"
                >
                  Pagar
                </button>
              </div>
            </form>
          </div>

          <!-- Step 3: Confirmation -->
          <div v-if="step === 3">
            <img
              src="@/src/assets/check.svg"
              width="48"
              class="mr-2"
              alt="Vitalink"
            />
            <h2>¡Pago Exitoso y Cita Confirmada!</h2>
            <p class="mb-4">¡Todo está listo para tu consulta!</p>
            <p><strong>Tipo de servicio:</strong> Cita de valoración</p>
            <p><strong>Fecha de la cita:</strong> Jueves, 5 de Octubre</p>
            <p><strong>Hora de la cita:</strong> 1h00 hs</p>
            <p><strong>Paciente titular:</strong> Ana Pérez</p>
            <p><strong>Teléfono de Contacto:</strong> 0000000</p>
            <p><strong>Profesional Médico:</strong> María Pérez</p>
            <p><strong>Procedimiento:</strong> Operación de cataratas</p>
            <p><strong>Costo del servicio:</strong> €18.000</p>
            <p><strong>Monto Pagado:</strong> €18.000</p>
            <div class="col-12 d-flex justify-content-between gap-2">
              <button
                class="btn btn-outline-dark me-2 text-sm w-50"
                @click="goToStep(1)"
              >
                Descargar comprobante
              </button>
              <button class="btn btn-primary w-50" @click="open = false">
                Ver en Citas
              </button>
            </div>
          </div>

          <!-- Step 4: Cancellation Confirmation -->
          <div v-if="step === 4">
            <h5 class="fw-bold">¿Seguro que quieres cancelar esta cita?</h5>
            <p class="text-muted">
              Se le enviará un correo electrónico automático al usuario
              avisándole que su cita ha sido cancelada.
            </p>
            <div class="d-flex justify-content-between gap-2">
              <button class="btn btn-outline-dark w-50" @click="step = 1">
                No, volver
              </button>
              <button class="btn btn-danger w-50" @click="cancelAppointment">
                Sí, cancelar
              </button>
            </div>
          </div>

          <div v-if="step === 5">
            <h5 class="fw-bold">Detalles de la cita</h5>
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
                  <td><strong>Estado:</strong></td>
                  <td>
                    <span
                      class="badge rounded-5 text-dark"
                      :class="statusClass('Cancelada')"
                    >
                      Cancelada
                    </span>
                  </td>
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
          </div>
          <div class="modal-footer justify-content-center" v-if="errorText">
            <p class="text-danger">{{ errorText }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from "vue";
const props = defineProps(["appointment", "step", "showStatus"]);

console.log(props);

const open = ref(false);
const step = ref(1);
const errorText = ref("");
const cardName = ref("");
const cardNumber = ref("");
const expiryDate = ref("");
const cvv = ref("");
const email = ref("");

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const processPayment = () => {
  // Simulate payment processing
  if (cardName.value && cardNumber.value && expiryDate.value && cvv.value) {
    step.value = 3;
    errorText.value = "";
  } else {
    errorText.value = "Por favor, complete todos los campos.";
  }
};

const statusClass = (status) => {
  switch (status) {
    case "Cancelada":
      return "bg-danger-subtle";
    case "Pendiente":
      return "bg-warning-subtle";
    case "Confirmada":
      return "bg-primary-subtle";
    case "Valorado":
      return "bg-success-subtle";
    default:
      return "";
  }
};

const cancelAppointment = async () => {
  // Simulate cancellation
  step.value = 5;
};
</script>

<style scoped>
.modal-content {
  border-radius: 10px;
}
.modal-header {
  padding: 1rem;
}
.modal-body {
  padding: 2rem;
}
.modal-footer {
  padding: 1rem;
}
.total {
  border-top: 1px solid #e1e4ed;
}
</style>
