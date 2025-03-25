<template>
  <div v-if="!showStatus" role="button" class="d-flex gap-2" @click="openModal">
    <img src="@/src/assets/success.svg" class="mr-2" alt="Success" />
    <p class="text-success mb-0">Pagado</p>
  </div>
  <span
    v-else
    @click="openModal"
    role="button"
    class="badge rounded-5 text-dark"
    :class="statusClass(appointment.status)"
  >
    {{ appointment.status }}
  </span>
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
            <table class="table table-borderless">
              <tbody>
                <tr>
                  <td><strong>Tipo de servicio:</strong></td>
                  <td>Procedimiento Medico</td>
                </tr>
                <tr>
                  <td><strong>Fecha de la cita:</strong></td>
                  <td>{{ selectedDate }}</td>
                </tr>
                <tr>
                  <td><strong>Hora de la cita:</strong></td>
                  <td>{{ selectedTime }}</td>
                </tr>
                <tr>
                  <td><strong>Paciente titular:</strong></td>
                  <td>Ana Pérez</td>
                </tr>
                <tr>
                  <td><strong>Profesional Médico:</strong></td>
                  <td>María Pérez</td>
                </tr>
                <tr>
                  <td><strong>Costo del servicio:</strong></td>
                  <td>💤1.800</td>
                </tr>
              </tbody>
            </table>
            <div class="d-flex justify-content-between gap-2">
              <button class="btn btn-outline-dark w-50" @click="step = 4">
                Reservar el procedimiento
              </button>
              <button class="btn btn-primary w-50" @click="step = 2">
                Solicitar crédito
              </button>
            </div>
          </div>

          <!-- Step 2: Payment Details -->
          <div v-if="step === 2">
            <div class="d-flex flex-column">
              <h5 class="fw-bold">Solicitar crédito</h5>
            </div>
            <p class="text-muted">
              Para continuar con la reserva del procedimiento, solicita un
              crédito por un monto igual o menor al costo total de la cita.
            </p>
            <form>
              <div class="row mb-3">
                <div class="col-8 d-flex w-100 mb-2">
                  <label
                    for="procedureAmount"
                    class="form-label col-4 text-muted"
                    >Monto total del procedimiento:</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="procedureAmount"
                    v-model="procedureAmount"
                  />
                </div>
                <div class="col-8 d-flex w-100">
                  <label for="loanAmount" class="form-label col-4 text-muted"
                    >Monto del crédito al solicitar:</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="loanAmount"
                    v-model="loanAmount"
                  />
                </div>
              </div>
              <div class="d-flex justify-content-between gap-2">
                <button class="btn btn-outline-dark w-50" @click="step = 1">
                  Cancelar
                </button>
                <button
                  class="btn btn-primary w-50"
                  @click.prevent="processRequest"
                >
                  Enviar solicitud
                </button>
              </div>
            </form>
          </div>

          <!-- Step 3: Confirmation -->
          <div v-if="step === 3">
            <div class="d-flex flex-column align-items-center">
              <img
                src="@/src/assets/check.svg"
                width="48"
                class="mr-2"
                alt="Vitalink"
              />
              <h2 class="text-center">¡Felicidades!</h2>
              <p class="mb-4 text-center">
                Tu solicitud se ha enviado con éxito
              </p>
            </div>
            <div class="col-12 d-flex justify-content-between gap-2">
              <button
                class="btn btn-outline-dark me-2 text-sm w-50"
                @click="goToStep(1)"
              >
                Ir al home
              </button>
              <button class="btn btn-primary w-50" @click="open = false">
                Ver en Citas
              </button>
            </div>
          </div>

          <div v-if="step === 6">
            <div class="d-flex flex-column align-items-center">
              <img
                src="@/src/assets/check.svg"
                width="48"
                class="mr-2"
                alt="Vitalink"
              />
              <h2 class="text-center">¡Solicitud de reserva enviada!</h2>
              <p class="mb-4 text-center">
                Una vez que el médico confirme la reserva te enviaremos un
                correo electrónico de confirmación
              </p>
            </div>
            <div class="col-12 d-flex justify-content-between gap-2">
              <button
                class="btn btn-outline-dark me-2 text-sm w-50"
                @click="goToStep(1)"
              >
                Ir al home
              </button>
              <button class="btn btn-primary w-50" @click="open = false">
                Ver en Citas
              </button>
            </div>
          </div>

          <!-- Step 4: Reservation Confirmation -->
          <div v-if="step === 4">
            <h5 class="fw-bold">Confirmar Reserva</h5>
            <table class="table table-borderless">
              <tbody>
                <tr>
                  <td><strong>Paciente titular:</strong></td>
                  <td>Ana Pérez</td>
                </tr>
                <tr>
                  <td><strong>Doctor:</strong></td>
                  <td>María Pérez</td>
                </tr>
                <tr>
                  <td><strong>Costo del servicio:</strong></td>
                  <td>💤1.800</td>
                </tr>
                <tr>
                  <td><strong>Fecha de la cita:</strong></td>
                  <td>
                    <div class="dropdown">
                      <button
                        class="btn btn-outline-secondary dropdown-toggle gap-2"
                        type="button"
                        id="dateDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <img
                          src="@/src/assets/calendar.svg"
                          alt="Busca centro medico"
                          class="img-fluid"
                        />{{ selectedDate || "Seleccionar fecha" }}
                      </button>
                      <ul class="dropdown-menu" aria-labelledby="dateDropdown">
                        <li v-for="date in availableDates" :key="date">
                          <a
                            class="dropdown-item"
                            href="#"
                            @click="selectDate(date)"
                            >{{ date }}</a
                          >
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><strong>Hora de la cita:</strong></td>
                  <td>
                    <div class="dropdown">
                      <button
                        class="btn btn-outline-secondary dropdown-toggle gap-2"
                        type="button"
                        id="timeDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        :disabled="!selectedDate"
                      >
                        <img
                          src="@/src/assets/clock.svg"
                          alt="Busca centro medico"
                          class="img-fluid"
                        />{{ selectedTime || "Seleccionar hora" }}
                      </button>
                      <ul class="dropdown-menu" aria-labelledby="timeDropdown">
                        <li v-for="time in availableTimes" :key="time">
                          <a
                            class="dropdown-item"
                            href="#"
                            @click="selectTime(time)"
                            >{{ time }}</a
                          >
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="d-flex justify-content-between gap-2">
              <button class="btn btn-outline-dark w-50" @click="step = 1">
                Cancelar
              </button>
              <button class="btn btn-primary w-50" @click="confirmReservation">
                Confirmar Reserva
              </button>
            </div>
          </div>

          <!-- Step 5: Cancellation Confirmation -->
          <div v-if="step === 5">
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
const props = defineProps(["appointment", "showStatus"]);

const open = ref(false);
const step = ref(1);
const errorText = ref("");
const procedureAmount = ref(null);
const loanAmount = ref(null);
const selectedDate = ref("");
const selectedTime = ref("");

// Mock data for available dates and times
const availableDates = ref(["2023-10-19", "2023-10-20", "2023-10-21"]);
const availableTimes = ref([]);

const openModal = () => {
  open.value = true;
  step.value = 1;
};

const selectDate = (date) => {
  selectedDate.value = date;
  // Mock available times based on the selected date
  availableTimes.value = ["09:00", "10:00", "11:00", "15:30"];
};

const selectTime = (time) => {
  selectedTime.value = time;
};

const processRequest = () => {
  if (procedureAmount.value && loanAmount.value) {
    step.value = 3;
    errorText.value = "";
  } else {
    errorText.value = "Por favor, complete todos los campos.";
  }
};

const confirmReservation = () => {
  // Simulate reservation confirmation
  step.value = 6;
};

const cancelAppointment = async () => {
  step.value = 1;
  open.value = false;
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
.dropdown-toggle {
  display: flex;
  align-items: center;
}
.bi {
  font-size: 1.2rem;
}
</style>
