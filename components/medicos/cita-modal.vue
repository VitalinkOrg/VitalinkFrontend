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
            <h5 class="fw-bold">
              Detalles
              {{
                appointment.appointment_type.code == "VALORATION_APPOINTMENT"
                  ? "de la valoración"
                  : appointment.appointment_status.code == "WAITING_PROCEDURE"
                    ? "del procedimiento"
                    : "de la reserva"
              }}
            </h5>
            <table class="table table-borderless">
              <tbody>
                <tr>
                  <td class="text-muted">Paciente:</td>
                  <td>{{ appointment.customer.name }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Tipo de servicio:</td>
                  <td>
                    {{
                      appointment.appointment_type.code ==
                      "VALORATION_APPOINTMENT"
                        ? "Cita de valoración"
                        : "Procedimiento médico"
                    }}
                  </td>
                </tr>
                <tr>
                  <td class="text-muted">Fecha de la cita:</td>
                  <td>
                    {{
                      new Date(
                        appointment.appointment_date
                      ).toLocaleDateString()
                    }}
                  </td>
                </tr>
                <tr>
                  <td class="text-muted">Hora de la cita:</td>
                  <td>{{ appointment.appointment_hour }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Procedimiento:</td>
                  <td>{{ appointment.package?.procedure.name }}</td>
                </tr>

                <tr>
                  <td class="text-muted">Motivo:</td>
                  <td>{{ appointment.user_description }}</td>
                </tr>

                <tr>
                  <td class="text-muted">Fecha de solicitud:</td>
                  <td>
                    {{
                      new Date(
                        appointment.application_date
                      ).toLocaleDateString()
                    }}
                  </td>
                </tr>

                <tr>
                  <td class="text-muted">Estado:</td>
                  <td>
                    <span
                      class="badge rounded-5 text-dark"
                      :class="statusClass(appointment.appointment_status.code)"
                    >
                      {{ appointment.appointment_status.value1 }}
                    </span>
                  </td>
                </tr>
                <tr
                  v-if="
                    appointment.appointment_status.code ==
                    'VALUED_VALORATION_APPOINTMENT'
                  "
                >
                  <td class="text-muted">Procedimiento:</td>
                  <td>
                    <input
                      type="text"
                      :value="appointment.package?.procedure.name"
                    />
                  </td>
                </tr>
                <tr
                  v-if="
                    appointment.appointment_status.code ==
                    'VALUED_VALORATION_APPOINTMENT'
                  "
                >
                  <td class="text-muted">Proforma:</td>
                  <td>
                    <div>
                      <input
                        type="file"
                        ref="proformaFile"
                        style="display: none"
                        @change="handleProformaUpload"
                        accept=".pdf,.doc,.docx"
                      />
                      <button
                        class="btn btn-outline-dark d-flex gap-2"
                        @click="$refs.proformaFile.click()"
                        :disabled="proformaGuardado"
                      >
                        <img
                          src="@/src/assets/cloud-upload.svg"
                          width="20"
                          class="mr-2"
                          alt="Vitalink"
                        />
                        Adjuntar Proforma
                      </button>
                      <div
                        v-if="proformaFileName"
                        class="mt-2 text-primary fw-bold"
                      >
                        {{ proformaFileName }}
                      </div>
                    </div>
                  </td>
                </tr>
                <tr
                  v-if="
                    appointment.appointment_status.code ==
                    'VALUED_VALORATION_APPOINTMENT'
                  "
                >
                  <td class="text-muted">Valor del procedimiento:</td>
                  <td>
                    <input type="text" :value="appointment.price_procedure" />
                  </td>
                </tr>
                <tr
                  v-if="
                    appointment.appointment_status.code ==
                    'VALUED_VALORATION_APPOINTMENT'
                  "
                >
                  <td class="text-muted">Recomendaciones Post-Cita:</td>
                  <td>
                    <textarea
                      v-model="description"
                      class="form-control mb-4"
                      rows="3"
                      placeholder="Escribe las recomendaciones médicas..."
                      :disabled="proformaGuardado"
                    ></textarea>
                  </td>
                </tr>
                <tr>
                  <td class="text-muted">Validación de Crédito:</td>
                  <td>
                    <div v-if="!qrValidated">
                      <input
                        type="text"
                        v-model="qrCodeInput"
                        placeholder="Escanear código QR"
                        class="form-control mb-2"
                      />
                      <button
                        class="btn btn-primary"
                        @click="validateQRCode"
                        :disabled="!qrCodeInput"
                      >
                        Validar QR
                      </button>
                    </div>
                    <div v-else>
                      <div class="alert alert-success mb-2">
                        Crédito pre-aprobado válido: {{ creditAmount }}
                      </div>
                      <button
                        class="btn btn-success"
                        @click="useCredit"
                        :disabled="creditUsed"
                      >
                        {{ creditUsed ? "Crédito utilizado" : "Usar crédito" }}
                      </button>
                    </div>
                  </td>
                  <div v-if="errorText" class="alert alert-danger mt-2">
                    {{ errorText }}
                  </div>
                </tr>
              </tbody>
            </table>
            <div
              class="d-flex p-2 badge align-items-center bg-primary-subtle text-primary my-2 rounded-5"
            >
              <img src="@/src/assets/info.svg" class="mr-2" alt="Vitalink" />
              <p class="m-0 text-wrap">
                <!-- Added text-wrap class -->
                Asegúrate de coordinar con el paciente antes de confirmar con la
                cita
              </p>
            </div>
            <div
              v-if="
                appointment.appointment_status.code ==
                  'PENDING_VALORATION_APPOINTMENT' ||
                appointment.appointment_status.code == 'PENDING_PROCEDURE'
              "
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
            <div
              v-else
              class="d-flex justify-content-between align-items-center gap-2"
            >
              <div
                class="d-flex justify-content-between align-items-center w-100"
                v-if="
                  appointment.appointment_status.code !==
                  'VALUED_VALORATION_APPOINTMENT'
                "
              >
                <button class="btn text-danger" @click="localStep = 4">
                  Anular cita
                </button>
                <button class="btn btn-outline-dark" @click="localStep = 6">
                  Reprogramar
                </button>
                <button class="btn btn-primary" @click="localStep = 2">
                  Marcar concretada
                </button>
              </div>
              <div
                class="d-flex justify-content-between align-items-center w-100"
                v-if="
                  appointment.appointment_status.code ==
                  'VALUED_VALORATION_APPOINTMENT'
                "
              >
                <span
                  class="d-flex align-items-center gap-2"
                  :style="{
                    visibility: proformaGuardado ? 'visible' : 'hidden',
                  }"
                >
                  <img src="@/src/assets/check.svg" width="20" alt="Vitalink" />
                  <p class="text-success fw-bold m-0">Cambios guardados</p>
                </span>
                <div class="d-flex justify-content-between gap-2">
                  <button
                    class="btn btn-outline-dark"
                    @click="editRecommendations"
                    :disabled="!proformaFileName"
                  >
                    <AtomsIconsEditPencilIcon v-if="proformaGuardado" />
                    {{ proformaGuardado ? "Editar" : "Cancelar" }}
                  </button>
                  <button
                    class="btn btn-primary"
                    @click="saveRecommendations"
                    :disabled="!proformaFileName"
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Payment Details -->
          <div v-if="localStep === 2">
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
                appointment.appointment_status.code ==
                'PENDING_VALORATION_APPOINTMENT'
              "
              class="text-muted"
            >
              Le enviaremos una notificación al paciente para que acuda a la
              cita de valoración en la fecha que has confirmado
            </p>
            <div
              v-if="
                appointment.appointment_status.code ==
                'PENDING_VALORATION_APPOINTMENT'
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
              <button class="btn btn-outline-dark w-50" @click="localStep = 1">
                Cancelar
              </button>
              <button
                v-if="
                  appointment.appointment_status.code ==
                  'PENDING_VALORATION_APPOINTMENT'
                "
                class="btn btn-primary w-50"
                @click="confirmAppointment"
              >
                Confirmar
              </button>
              <button
                v-else-if="
                  appointment.appointment_status.code == 'PENDING_PROCEDURE'
                "
                class="btn btn-primary w-50"
                @click="confirmProcedure"
              >
                Confirmar
              </button>
              <button
                v-else-if="
                  appointment.appointment_status.code == 'WAITING_PROCEDURE'
                "
                class="btn btn-primary w-50"
                @click="finishProcedure"
              >
                Confirmar
              </button>
              <button
                v-else
                class="btn btn-primary w-50"
                @click="confirmValoration"
              >
                Confirmar
              </button>
            </div>
          </div>

          <!-- Step 3: Confirmation -->
          <div v-if="localStep === 3">
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
              class="confirmation-title text-primary"
              :class="
                appointment.appointment_status.code ==
                'VALUED_VALORATION_APPOINTMENT'
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
              class="mb-4 text-muted"
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
            <div
              v-if="
                appointment.appointment_status.code ==
                  'PENDING_VALORATION_APPOINTMENT' ||
                appointment.appointment_status.code == 'PENDING_PROCEDURE' ||
                appointment.appointment_status.code == 'WAITING_PROCEDURE'
              "
              class="col-12 d-flex justify-content-between gap-2"
            >
              <button
                class="btn btn-outline-dark me-2 text-sm w-50"
                @click="localStep = 1"
              >
                Ir al inicio
              </button>
              <button class="btn btn-primary w-50" @click="open = false">
                Ver en Citas
              </button>
            </div>
            <div v-else class="col-12 d-flex justify-content-between gap-2">
              <button
                class="btn btn-outline-dark me-2 text-sm w-50"
                @click="localStep = 1"
              >
                No apto para procedimiento
              </button>
              <button
                class="btn btn-primary w-50"
                @click="updateAppointmentStatus()"
              >
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
                  <td class="text-muted">Paciente:</td>
                  <td>{{ appointment.customer.name }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Tipo de servicio:</td>
                  <td>Cita de valoración</td>
                </tr>
                <tr>
                  <td class="text-muted">Fecha de la cita:</td>
                  <td>
                    {{
                      new Date(
                        appointment.appointment_date
                      ).toLocaleDateString()
                    }}
                  </td>
                </tr>
                <tr>
                  <td class="text-muted">Hora de la cita:</td>
                  <td>{{ appointment.appointment_hour }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Procedimiento:</td>
                  <td>{{ appointment.service_name }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Motivo:</td>
                  <td>{{ appointment.user_description }}</td>
                </tr>
                <tr>
                  <td class="text-muted">Procedimiento:</td>
                  <td>{{ appointment.notes }}</td>
                </tr>

                <tr>
                  <td class="text-muted">Fecha de solicitud:</td>
                  <td>
                    {{
                      new Date(
                        appointment.application_date
                      ).toLocaleDateString()
                    }}
                  </td>
                </tr>
                <tr>
                  <td class="text-muted">Tipo de reserva:</td>
                  <td class="text-capitalize">
                    {{ appointment.appointment_type.name }}
                  </td>
                </tr>
                <tr>
                  <td class="text-muted">Estado:</td>
                  <td>
                    <span
                      class="badge rounded-5 text-dark"
                      :class="statusClass(appointment.appointment_status.code)"
                    >
                      {{ appointment.appointment_status.value1 }}
                    </span>
                  </td>
                </tr>
                <tr
                  v-if="
                    appointment.appointment_status.code ==
                    'VALUED_VALORATION_APPOINTMENT'
                  "
                >
                  <td class="text-muted">Proforma:</td>
                  <td>
                    <div>
                      <input
                        type="file"
                        ref="proformaFile"
                        style="display: none"
                        @change="handleProformaUpload"
                        accept=".pdf,.doc,.docx"
                      />
                      <button
                        class="btn btn-outline-dark d-flex gap-2"
                        @click="$refs.proformaFile.click()"
                        :disabled="proformaGuardado"
                      >
                        <img
                          src="@/src/assets/cloud-upload.svg"
                          width="20"
                          class="mr-2"
                          alt="Vitalink"
                        />
                        Adjuntar Proforma
                      </button>
                      <div
                        v-if="proformaFileName"
                        class="mt-2 text-primary fw-bold"
                      >
                        {{ proformaFileName }}
                      </div>
                    </div>
                  </td>
                </tr>
                <tr
                  v-if="
                    appointment.appointment_status.code ==
                    'VALUED_VALORATION_APPOINTMENT'
                  "
                >
                  <td class="text-muted">Valor del procedimiento:</td>
                  <td>
                    <input type="text" :value="appointment.procedure_value" />
                  </td>
                </tr>
                <tr
                  v-if="
                    appointment.appointment_status.code ==
                    'VALUED_VALORATION_APPOINTMENT'
                  "
                >
                  <td class="text-muted">Recomendaciones Post-Cita:</td>
                  <td>
                    <textarea
                      v-model="description"
                      class="form-control mb-4"
                      rows="3"
                      placeholder="Escribe las recomendaciones médicas..."
                      :disabled="proformaGuardado"
                    ></textarea>
                  </td>
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
                    <VDatePicker
                      v-model="selectedDate"
                      :attributes="attrs"
                      :min-date="new Date()"
                      is-required
                      trim-weeks
                      locale="es"
                    >
                      <template #default="{ inputValue, inputEvents }">
                        <div
                          class="d-flex align-items-center gap-2 btn btn-outline-secondary"
                        >
                          <img
                            src="@/src/assets/calendar.svg"
                            alt="Busca centro medico"
                            class="img-fluid"
                          />
                          <input
                            :value="
                              formatDisplayDate(selectedDate) ||
                              'Seleccionar fecha'
                            "
                            class="text-muted border-0 bg-transparent w-100"
                            v-on="inputEvents"
                            readonly
                          />
                        </div>
                      </template>
                    </VDatePicker>
                  </td>
                </tr>
                <tr>
                  <td class="text-muted">Hora de la cita:</td>
                  <td>
                    <div class="dropdown">
                      <button
                        class="btn btn-outline-secondary dropdown-toggle gap-2 d-flex align-items-center w-100"
                        type="button"
                        id="timeDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        :disabled="!selectedDate"
                      >
                        <div class="d-flex align-items-center gap-2 w-100">
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
const config = useRuntimeConfig();
const token = useCookie("token");

const selectedDate = ref("");
const selectedTime = ref("");
const proformaFileName = ref("");
const proformaGuardado = ref(false);
const qrCodeInput = ref("");
const qrValidated = ref(false);
const creditAmount = ref(0);
const creditUsed = ref(false);
const creditId = ref(null);
const errorText = ref("");

// Mock data for available dates and times
const availableDates = ref(["2023-10-19", "2023-10-20", "2023-10-21"]);
const availableTimes = ref([]);

const attrs = ref([
  {
    key: "today",
    dot: true,
    dates: new Date(),
  },
]);

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

const availableTimesByDate = {
  "2025-04-01": ["09:00", "10:00", "11:00", "15:30"],
  "2023-10-20": ["10:30", "14:00", "16:00"],
  "2023-10-21": ["09:30", "11:30", "15:00"],
  // Add more dates as needed
};

watch(selectedDate, (newDate) => {
  if (newDate) {
    // Format the date as YYYY-MM-DD for the mock data lookup
    const formattedDate = formatDateForLookup(newDate);

    // Get available times for this date (or empty array if none)
    availableTimes.value = availableTimesByDate[formattedDate] || [];

    // Reset selected time when date changes
    selectedTime.value = "";
  }
});

// Helper function to format date for lookup
const formatDateForLookup = (date) => {
  const d = new Date(date);
  let month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

const formatDisplayDate = (date) => {
  if (!date) return "Seleccionar fecha";

  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const handleProformaUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Here you would typically upload the file to your server
    // For now, we'll just store the filename
    proformaFileName.value = file.name;

    // Example of how you might handle the actual upload:
    // const formData = new FormData();
    // formData.append('proforma', file);
    // axios.post('/api/upload-proforma', formData)
    //     .then(response => {
    //         this.proformaFileName = file.name;
    //     })
    //     .catch(error => {
    //         console.error('Upload failed:', error);
    //     });
  }
};

const editRecommendations = async () => {
  try {
    // Here you would typically make an API call to save the recommendations
    // For example:
    // await axios.post('/api/save-recommendations', {
    //   appointmentId: props.appointment.id,
    //   description: description.value,
    //   proforma: proformaFileName.value
    // });

    if (proformaGuardado.value) {
      proformaGuardado.value = false;
    } else {
      proformaFileName.value = "";
    }

    // For now, we'll just update the local state
  } catch (error) {
    console.error("Error saving recommendations:", error);
    errorText.value = "Error al guardar los cambios";
  }
};

const saveRecommendations = async () => {
  try {
    // Here you would typically make an API call to save the recommendations
    // For example:
    // await axios.post('/api/save-recommendations', {
    //   appointmentId: props.appointment.id,
    //   description: description.value,
    //   proforma: proformaFileName.value
    // });

    // For now, we'll just update the local state
    proformaGuardado.value = true;
  } catch (error) {
    console.error("Error saving recommendations:", error);
    errorText.value = "Error al guardar los cambios";
  }
};

const updateAppointmentStatus = async () => {
  try {
    // Here you would typically make an API call to update the status
    // For example:
    // const response = await axios.put(`/api/appointments/${props.appointment.id}`, {
    //   status: 'Valorado'
    // });

    // For now, we'll just update the local appointment object
    props.appointment.status = "VALUED_VALORATION_APPOINTMENT";

    // Go back to step 1 to show the updated status
    localStep.value = 1;
  } catch (error) {
    console.error("Error updating appointment status:", error);
    errorText.value = "Error al actualizar el estado de la cita";
  }
};

const selectTime = (time) => {
  selectedTime.value = time;
};
const statusClass = (status) => {
  switch (status) {
    case "CANCEL_APPOINTMENT":
      return "bg-danger-subtle";
    case "PENDING_VALORATION_APPOINTMENT":
      return "bg-warning-subtle";
    case "PENDING_PROCEDURE":
      return "bg-warning-subtle";
    case "CONFIRM_PROCEDURE":
      return "bg-primary-subtle";
    case "CONCRETED_APPOINTMENT":
      return "bg-primary-subtle";
    case "VALUED_VALORATION_APPOINTMENT":
      return "bg-success-subtle";
    case "CONFIRM_VALIDATION_APPOINTMENT":
      return "bg-success-subtle";
    case "VALUATION_PENDING_VALORATION_APPOINTMENT":
      return "bg-primary-subtle";
    default:
      return "";
  }
};

const confirmAppointment = async () => {
  const { data, error } = await useFetch(
    config.public.API_BASE_URL + "/appointment/confirm_valoration_appointment",
    {
      method: "PUT",
      headers: { Authorization: token.value },
      params: {
        id: props.appointment.id,
      },
    }
  );
  if (data) {
    localStep.value = 3;
  }
  if (error.value) {
    console.log(error.value, "data");
  }
};

const confirmValoration = async () => {
  const { data, error } = await useFetch(
    config.public.API_BASE_URL + "/appointment/upload_proforma",
    {
      method: "PUT",
      headers: { Authorization: token.value },
      params: {
        id: props.appointment.id,
      },
      body: {
        appointment_result_code: "FIT_FOR_PROCEDURE",
        proforma_file_code: "PERSONAL_DOCUMENT____6__DOC__652025134811",
      },
    }
  );
  if (data) {
    localStep.value = 3;
  }
  if (error.value) {
    console.log(error.value, "data");
  }
};

const confirmProcedure = async () => {
  const { data, error } = await useFetch(
    config.public.API_BASE_URL + "/appointment/confirm_procedure",
    {
      method: "PUT",
      headers: { Authorization: token.value },
      params: {
        id: props.appointment.id,
      },
    }
  );
  if (data) {
    localStep.value = 3;
  }
  if (error.value) {
    console.log(error.value, "data");
  }
};

const finishProcedure = async () => {
  const { data, error } = await useFetch(
    config.public.API_BASE_URL + "/appointment/set_procedure_realized",
    {
      method: "PUT",
      headers: { Authorization: token.value },
      params: {
        id: props.appointment.id,
      },
    }
  );
  if (data) {
    localStep.value = 3;
  }
  if (error.value) {
    console.log(error.value, "data");
  }
};

const validateQRCode = async () => {
  try {
    errorText.value = "";
    const { data, error } = await useFetch(
      `${config.public.API_BASE_URL}/appointmentcredit/get_all`,
      {
        method: "GET",
        headers: { Authorization: token.value },
        params: {
          appointment_qr_code: qrCodeInput.value,
        },
      }
    );

    if (error.value) {
      throw new Error(
        error.value.data?.message || "Error al validar el código QR"
      );
    }

    if (!data.value || data.value.length === 0) {
      throw new Error("No se encontró crédito asociado a este código QR");
    }

    const credit = data.value.data[0];

    if (credit.already_been_used) {
      throw new Error("Este crédito ya ha sido utilizado");
    }

    // If we get here, the credit is valid
    qrValidated.value = true;
    creditAmount.value = credit.approved_amount;
    creditId.value = credit.id;
  } catch (err) {
    errorText.value = err.message;
    qrValidated.value = false;
  }
};

const useCredit = async () => {
  try {
    errorText.value = "";
    const { data, error } = await useFetch(
      `${config.public.API_BASE_URL}/appointmentcredit/edit`,
      {
        method: "PUT",
        headers: { Authorization: token.value },
        params: {
          id: creditId.value,
        },
        body: {
          already_been_used: true,
        },
      }
    );

    if (error.value) {
      throw new Error(
        error.value.data?.message || "Error al utilizar el crédito"
      );
    }

    // Mark as used locally
    creditUsed.value = true;

    // You might want to update the appointment price here
    // For example:
    // appointment.value.price_procedure -= creditAmount.value;
  } catch (err) {
    errorText.value = err.message;
  }
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
