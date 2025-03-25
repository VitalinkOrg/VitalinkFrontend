<template>
  <div
    class="modal fade"
    id="appointment.id"
    :class="open ? 'show' : ''"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
    v-if="appointment"
  >
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-header border-0 align-items-center d-flex">
          <button
            type="button"
            class="btn-close btn btn-light me-2"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="closeModal"
          ></button>
        </div>
        <!-- Modal Body -->
        <div class="modal-body">
          <!-- Step 1: Appointment Details -->
          <div v-if="localStep === 1">
            <h5 class="fw-bold">Detalles de la solicitud</h5>
            <table class="table table-borderless">
              <tbody>
                <tr>
                  <td class="text-muted">Paciente:</td>
                  <td>{{ appointment.patient_name }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Tipo de servicio:</td>
                  <td>Cita de valoración</td>
                </tr>
                <tr>
                  <td class="text-muted">Fecha de la cita:</td>
                  <td>{{ formatDate(appointment.date) }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Hora de la cita:</td>
                  <td>{{ appointment.hour }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Procedimiento:</td>
                  <td>{{ appointment.service_name }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Motivo:</td>
                  <td>{{ appointment.professional_name }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Procedimiento:</td>
                  <td>{{ appointment.notes }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Costo del servicio:</td>
                  <td>{{ appointment.cost }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Fecha de solicitud:</td>
                  <td>{{ appointment.cost }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Tipo de reserva:</td>
                  <td class="text-capitalize">
                    {{ appointment.appointment_type }}
                  </td>
                </tr>
                <tr>
                  <td class="text-muted">Estado:</td>
                  <td>
                    <span
                      class="badge rounded-5 text-dark"
                      :class="statusClass(appointment.status)"
                    >
                      {{ appointment.status }}
                    </span>
                  </td>
                </tr>
                <tr v-if="appointment.status == 'Valorado'">
                  <td class="text-muted">Proforma:</td>
                  <td>
                    <button
                      class="btn btn-outline-dark d-flex gap-2"
                      @click="localStep = 6"
                    >
                      <img
                        src="@/src/assets/cloud-upload.svg"
                        width="20"
                        class="mr-2"
                        alt="Vitalink"
                      />
                      Adjuntar Proforma
                    </button>
                  </td>
                </tr>
                <tr v-if="appointment.status == 'Valorado'">
                  <td class="text-muted">Valor del procedimiento:</td>
                  <td>
                    <input
                      type="text"
                      :value="appointment.procedure_value"
                      disabled
                    />
                  </td>
                </tr>
                <tr v-if="appointment.status == 'Valorado'">
                  <td class="text-muted">Recomendaciones Post-Cita:</td>
                  <td>
                    <textarea
                      v-model="description"
                      class="form-control mb-4"
                      rows="3"
                      placeholder="Escribe las recomendaciones médicas..."
                    ></textarea>
                  </td>
                </tr>
              </tbody>
            </table>
            <span
              class="d-flex gap-2 badge align-items-center bg-primary-subtle text-primary my-2 rounded-5"
            >
              <p class="m-0">
                Asegúrate de coordinar con el paciente antes de confirmar con la
                cita
              </p>
            </span>
            <div
              v-if="appointment.appointment_type == 'pre-reserva'"
              class="d-flex justify-content-between gap-2"
            >
              <button class="btn btn-outline-dark w-50" @click="localStep = 6">
                <Icon name="fa6-regular:calendar" class="text-primary" />
                Editar fecha y hora
              </button>
              <button class="btn btn-primary w-50" @click="localStep = 2">
                Confirmar reserva
              </button>
            </div>
            <div v-else class="d-flex justify-content-between gap-2">
              <button
                v-if="appointment.status !== 'Valorado'"
                class="btn text-danger"
                @click="localStep = 4"
              >
                Anular cita
              </button>
              <button
                v-if="appointment.status !== 'Valorado'"
                class="btn btn-outline-dark"
                @click="localStep = 6"
              >
                Reprogramar
              </button>
              <button
                v-if="appointment.status !== 'Valorado'"
                class="btn btn-primary"
                @click="localStep = 2"
              >
                Marcar concretada
              </button>
              <button
                v-if="appointment.status == 'Valorado'"
                class="btn btn-outline-dark w-50"
                @click="localStep = 6"
                disabled
              >
                Cancelar
              </button>
              <button
                v-if="appointment.status == 'Valorado'"
                class="btn btn-primary w-50"
                @click="localStep = 2"
                disabled
              >
                Guardar
              </button>
            </div>
          </div>

          <!-- Step 2: Payment Details -->
          <div v-if="localStep === 2">
            <h5 class="fw-bold">¿Confirmar reserva?</h5>
            <p class="fw-bold">
              {{
                appointment.appointment_type == "pre-reserva"
                  ? "Con estos cambios el estado de la solicitud de reserva pasará de: pendiente a Confirmada"
                  : "Con estos cambios el estado de la solicitud de reserva pasará de: pendiente a Valorada"
              }}
            </p>
            <p
              v-if="appointment.appointment_type == 'pre-reserva'"
              class="text-muted"
            >
              Le enviaremos una notificación al paciente para que acuda a la
              cita de valoración en la fecha que has confirmado
            </p>
            <div
              v-if="appointment.appointment_type == 'pre-reserva'"
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
              <button class="btn btn-outline-dark w-50" @click="localStep = 1">
                Cancelar
              </button>
              <button class="btn btn-primary w-50" @click="confirmAppointment">
                Confirmar
              </button>
            </div>
          </div>

          <!-- Step 3: Confirmation -->
          <div v-if="localStep === 3">
            <h4 class="confirmation-title text-primary text-center">
              {{
                appointment.appointment_type == "pre-reserva"
                  ? "¡Felicitaciones!"
                  : "¡Bien hecho!"
              }}
            </h4>
            <p class="mb-4 text-muted text-center">
              {{
                appointment.appointment_type == "pre-reserva"
                  ? "Acabas de confirmar la cita de valoración para tu paciente."
                  : "El cambio de estado de la cita se ha realizado con éxito:"
              }}
            </p>
            <table class="table table-borderless">
              <tbody>
                <tr>
                  <td class="text-muted">Paciente:</td>
                  <td>{{ appointment.patient_name }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Tipo de servicio:</td>
                  <td>Cita de valoración</td>
                </tr>
                <tr>
                  <td class="text-muted">Fecha de la cita:</td>
                  <td>{{ formatDate(appointment.date) }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Hora de la cita:</td>
                  <td>{{ appointment.hour }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Procedimiento:</td>
                  <td>{{ appointment.service_name }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Motivo:</td>
                  <td>{{ appointment.professional_name }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Procedimiento:</td>
                  <td>{{ appointment.notes }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Costo del servicio:</td>
                  <td>{{ appointment.cost }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Fecha de solicitud:</td>
                  <td>{{ appointment.cost }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Tipo de reserva:</td>
                  <td class="text-capitalize">
                    {{ appointment.appointment_type }}
                  </td>
                </tr>
                <tr>
                  <td class="text-muted">Estado:</td>
                  <td>
                    <span
                      class="badge rounded-5 text-dark"
                      :class="statusClass('Confirmada')"
                    >
                      Confirmada
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <div
              v-if="appointment.appointment_type == 'pre-reserva'"
              class="col-12 d-flex justify-content-between gap-2"
            >
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
            <div v-else class="col-12 d-flex justify-content-between gap-2">
              <button
                class="btn btn-outline-dark me-2 text-sm w-50"
                @click="goToStep(1)"
              >
                No apto para procedimiento
              </button>
              <button class="btn btn-primary w-50" @click="open = false">
                Subir proforma
              </button>
            </div>
          </div>

          <!-- Step 4: Cancellation Confirmation -->
          <div v-if="localStep === 4">
            <h5 class="fw-bold">¿Seguro que quieres cancelar esta cita?</h5>
            <p class="text-muted">
              Se le enviará un correo electrónico automático al usuario
              avisándole que su cita ha sido cancelada.
            </p>
            <div class="d-flex justify-content-between gap-2">
              <button class="btn btn-outline-dark w-50" @click="localStep = 1">
                No, volver
              </button>
              <button class="btn btn-danger w-50" @click="cancelAppointment">
                Sí, cancelar
              </button>
            </div>
          </div>

          <div v-if="localStep === 5">
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

          <div v-if="localStep === 6">
            <h5 class="fw-bold">Detalles de la solicitud</h5>
            <table class="table table-borderless">
              <tbody>
                <tr>
                  <td class="text-muted">Paciente:</td>
                  <td>{{ appointment.patient_name }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Tipo de servicio:</td>
                  <td>Cita de valoración</td>
                </tr>
                <tr>
                  <td class="text-muted">Fecha de la cita:</td>
                  <td>
                    <div class="dropdown">
                      <button
                        class="btn btn-outline-secondary dropdown-toggle gap-2 d-flex align-items-center"
                        type="button"
                        id="dateDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <div class="d-flex align-items-center gap-2">
                          <img
                            src="@/src/assets/calendar.svg"
                            alt="Busca centro medico"
                            class="img-fluid"
                          />
                          <p class="m-0">
                            {{ selectedDate || "Seleccionar fecha" }}
                          </p>
                        </div>
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
                  <td class="text-muted">Hora de la cita:</td>
                  <td>
                    <div class="dropdown">
                      <button
                        class="btn btn-outline-secondary dropdown-toggle gap-2 d-flex align-items-center"
                        type="button"
                        id="timeDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        :disabled="!selectedDate"
                      >
                        <div class="d-flex align-items-center gap-2">
                          <img
                            src="@/src/assets/clock.svg"
                            alt="Busca centro medico"
                            class="img-fluid"
                          />
                          <p class="m-0">
                            {{ selectedTime || "Seleccionar hora" }}
                          </p>
                        </div>
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
                <tr>
                  <td class="text-muted">Procedimiento:</td>
                  <td>{{ appointment.service_name }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Motivo:</td>
                  <td>{{ appointment.professional_name }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Procedimiento:</td>
                  <td>{{ appointment.notes }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Costo del servicio:</td>
                  <td>{{ appointment.cost }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Fecha de solicitud:</td>
                  <td>{{ appointment.cost }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Tipo de reserva:</td>
                  <td class="text-capitalize">
                    {{ appointment.appointment_type }}
                  </td>
                </tr>
                <tr>
                  <td class="text-muted">Estado:</td>
                  <td>
                    <span
                      class="badge rounded-5 text-dark"
                      :class="statusClass(appointment.status)"
                    >
                      {{ appointment.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
            <span
              class="d-flex gap-2 badge align-items-center bg-primary-subtle text-primary my-2 rounded-5"
            >
              <p class="m-0">
                Asegúrate de coordinar con el paciente antes de confirmar con la
                cita
              </p>
            </span>
            <div class="d-flex justify-content-between gap-2">
              <button
                class="btn btn-outline-dark text-danger w-50"
                @click="localStep = 1"
              >
                Cancelar
              </button>
              <button class="btn btn-primary w-50" @click="localStep = 2">
                Guardar cambios
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
import { ref, watch, toRef } from "vue";

const selectedDate = ref("");
const selectedTime = ref("");

// Mock data for available dates and times
const availableDates = ref(["2023-10-19", "2023-10-20", "2023-10-21"]);
const availableTimes = ref([]);

const props = defineProps({
  appointment: Object,
  open: Boolean,
  step: {
    // Now properly defined for v-model
    type: Number,
    default: 1,
  },
});

const emit = defineEmits([
  "update:step", // Required for v-model
  "close-modal",
]);

// Local ref that syncs with the prop
const localStep = ref(props.step);

// Sync when prop changes
watch(
  () => props.step,
  (newVal) => {
    localStep.value = newVal;
  }
);

// Create a reactive reference to the prop
const step = toRef(props, "step");

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const selectTime = (time) => {
  selectedTime.value = time;
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

const confirmAppointment = async () => {
  localStep.value = 3; // This will update both local and parent
};

const selectDate = (date) => {
  selectedDate.value = date;
  availableTimes.value = ["09:00", "10:00", "11:00", "15:30"];
};

const resetSteps = () => {
  localStep.value = 1;
};

// Function to close the modal and reset steps
const closeModal = () => {
  resetSteps(); // Reset steps
  emit("close-modal"); // Emit close event
};
</script>

<style lang="scss" scoped>
.show {
  display: block;
}

.modal-header {
  padding: 1rem 1rem 0 1rem; /* Adjust padding to match the first modal */
}

.modal-body {
  padding: 1rem; /* Adjust padding to match the first modal */
}

.modal-footer {
  border-top: none; /* Remove border to match the first modal */
  padding: 1rem; /* Adjust padding to match the first modal */
}

.table {
  margin-bottom: 1.5rem; /* Add spacing below the table */
}

.fw-bold {
  font-weight: 600; /* Match the bold font weight */
}

.text-muted {
  color: #6c757d; /* Match the muted text color */
}
</style>
