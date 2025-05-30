<script setup>
import { ref, inject } from "vue";
import { jsPDF } from "jspdf";

// Define emits - this is the correct way in script setup
const emit = defineEmits(["refreshed"]);

// Define props
const props = defineProps({
  appointments: {
    type: Object,
    default: [],
  },
  useDropdown: {
    type: Boolean,
    default: false,
  },
});

// Inject refresh function from parent
const refreshAppointments = inject("refreshAppointments");

// Reactive data
const openUserModal = ref(false);
const openDateModal = ref(false);
const openContactModal = ref(false);
const openDateCancelModal = ref(false);
const modalData = ref(null);
const currentStep = ref(1);

// Log appointments (equivalent to your console.log in data())
console.log(props.appointments);

// Methods
const showUserDetails = (appointment) => {
  modalData.value = appointment;
  openUserModal.value = true;
};

const showContactDetails = (appointment) => {
  modalData.value = appointment;
  openContactModal.value = true;
};

const showDateDetails = (appointment, step) => {
  modalData.value = appointment;
  openDateModal.value = true;
  currentStep.value = step;
};

const statusClass = (status) => {
  console.log(status);
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

const showDateCancel = (appointment) => {
  modalData.value = appointment;
  openDateCancelModal.value = true;
};

const downloadSummary = (appointment) => {
  const doc = new jsPDF();

  // Add logo or header
  // doc.addImage(logo, 'JPEG', 10, 10, 50, 20);

  // Title
  doc.setFontSize(18);
  doc.text("Detalles de la Cita Médica", 105, 20, { align: "center" });

  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 25, 190, 25);

  // Reset font for content
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  // Patient information section
  doc.setFontSize(14);
  doc.text("Información del Paciente", 20, 35);
  doc.setFontSize(12);

  let yPosition = 45;

  // Function to add field to PDF
  const addField = (label, value) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 20, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(value, 60, yPosition);
    yPosition += 7;
  };

  // Add all appointment details
  addField("Paciente", appointment.patient_name);
  addField("Tipo de Reserva", appointment.appointment_type);
  addField("Fecha de la cita", new Date(appointment.date).toLocaleDateString());
  addField("Hora de la cita", appointment.time_from);
  addField("Procedimiento", appointment.service_name);
  addField("Estado", appointment.status);

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Documento generado el: " + new Date().toLocaleDateString(),
    20,
    280
  );
  doc.text("Vitalink - Sistema de Gestión Médica", 105, 280, {
    align: "center",
  });

  // Save the PDF
  doc.save(`Cita_${appointment.patient_name}_${appointment.date}.pdf`);
};

const closeModal = () => {
  modalData.value = null;
  openUserModal.value = false;
  openDateModal.value = false;
  openDateCancelModal.value = false;
};

// Example of how to use the emit
const handleRefresh = async () => {
  if (refreshAppointments) {
    await refreshAppointments();
    // Emit the refreshed event to parent
    emit("refreshed");
  }
};

// Example of emitting with data
const handleAppointmentUpdate = (appointmentData) => {
  // Emit with payload
  emit("refreshed", appointmentData);
};
</script>
<template>
  <div class="card shadow rounded-3 border-0 p-3">
    <div class="table-responsive" v-if="appointments !== null">
      <table class="table fw-light">
        <thead>
          <tr>
            <th scope="col" class="text-muted">Nombre del paciente</th>
            <th scope="col" class="text-muted">Fecha y hora</th>
            <th scope="col" class="text-muted">Procedimiento</th>
            <th scope="col" class="text-muted">Tipo de reserva</th>
            <th scope="col" class="text-muted">Estado de cita</th>
            <th scope="col" class="text-muted"></th>
            <th scope="col" class="text-muted"></th>
            <th scope="col" class="text-muted" v-if="!useDropdown"></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="appointment in appointments" :key="appointment.id">
            <td>{{ appointment.customer.name }}</td>
            <td>
              {{ new Date(appointment.appointment_date).toLocaleDateString() }}
              a las
              {{ appointment.appointment_hour }}
            </td>
            <td>{{ appointment.package?.procedure.name }}</td>
            <td>
              <small class="text-capitalize">{{
                appointment.reservation_type.name
              }}</small>
            </td>
            <td>
              <span
                class="badge bg-success-subtle rounded-5 text-dark text-center"
                :class="statusClass(appointment.appointment_status.code)"
                >{{ appointment.appointment_status.value1 }}
              </span>
            </td>
            <td v-if="useDropdown">
              <button
                class="btn btn-link p-0"
                @click="showContactDetails(appointment)"
              >
                <img src="@/src/assets/call.svg" alt="Ver Usuario" />
              </button>
            </td>
            <td v-if="useDropdown">
              <div class="dropdown">
                <AtomsIconsThreeDotsHorizontalIcon
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  class="cursor-pointer"
                />
                <ul class="dropdown-menu">
                  <li>
                    <button
                      class="dropdown-item"
                      @click="showDateDetails(appointment)"
                    >
                      <Icon name="fa6-regular:eye" class="text-primary" />
                      Ver más detalles
                    </button>
                  </li>
                  <li
                    v-if="
                      appointment.appointment_status.code ==
                        'PENDING_VALORATION_APPOINTMENT' ||
                      appointment.appointment_status.code == 'PENDING_PROCEDURE'
                    "
                  >
                    <button
                      class="dropdown-item"
                      @click="showDateDetails(appointment, 2)"
                    >
                      <Icon name="fa6-regular:calendar" class="text-primary" />
                      Confirmar reserva
                    </button>
                  </li>
                  <li
                    v-if="
                      appointment.appointment_status.code ==
                      'PENDING_VALORATION_APPOINTMENT'
                    "
                  >
                    <button
                      class="dropdown-item"
                      @click="showDateDetails(appointment, 6)"
                    >
                      <Icon
                        :name="
                          appointment.appointment_type == 'pre-reserva'
                            ? 'fa6-regular:calendar'
                            : 'fa6-regular:circle-left'
                        "
                        class="text-primary"
                      />
                      {{
                        appointment.appointment_type == "pre-reserva"
                          ? "Editar fecha y hora"
                          : "Reprogramar cita"
                      }}
                    </button>
                  </li>
                  <li class="d-flex gap-2 align-items-center">
                    <button
                      class="dropdown-item"
                      @click="showUserDetails(appointment)"
                    >
                      <Icon name="fa6-solid:user" class="text-primary" />
                      Perfil del Paciente
                    </button>
                  </li>

                  <li
                    v-if="
                      appointment.status !== 'COMPLETED' &&
                      appointment.status !== 'CANCELED'
                    "
                  >
                    <button
                      class="dropdown-item w-100"
                      @click="showDateCancel(appointment)"
                    >
                      <Icon
                        name="fa6-regular:circle-xmark"
                        class="text-primary"
                      />
                      Anular cita
                    </button>
                  </li>
                  <li class="d-flex gap-2 align-items-center">
                    <button
                      class="dropdown-item"
                      @click="downloadSummary(appointment)"
                    >
                      <Icon name="fa6-solid:download" class="text-primary" />
                      Descargar Resumen
                    </button>
                  </li>
                  <!-- <li>
                  <a class="dropdown-item" href="#">Descargar Resumen</a>
                </li> -->
                </ul>
              </div>
            </td>

            <td v-if="!useDropdown">
              <button
                class="btn btn-link p-0"
                @click="showUserDetails(appointment)"
              >
                <img src="@/src/assets/search.svg" alt="Ver Usuario" />
              </button>
            </td>
            <td v-if="!useDropdown">
              <button
                class="btn btn-link p-0"
                @click="showDateDetails(appointment)"
              >
                <img src="@/src/assets/edit.svg" alt="Ver Cita" />
              </button>
            </td>
            <td v-if="!useDropdown">
              <button
                v-if="
                  appointment.status !== 'COMPLETED' &&
                  appointment.status !== 'CANCELED'
                "
                class="btn btn-link p-0"
                @click="showDateCancel(appointment)"
              >
                <img src="@/src/assets/remove.svg" alt="Cancelar Cita" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="card border-0 shadow rounded-3 py-4 h-100">
      <div class="card-body d-flex align-items-center p-5">
        <span class="w-50 text-center">
          <AtomsIconsChartVacio />
        </span>
        <p class="d-flex flex-column align-items-start ms-3">
          <span class="fw-medium text-muted fs-5"
            >Aún no tienes actividad en tu tablero</span
          >
          <span class="fw-light text-muted"
            >Muy pronto podrás administrar y verificar tu actividad.</span
          >
          <button class="btn btn-primary btn-sm mt-2 rounded-3">Empezar</button>
        </p>
      </div>
    </div>

    <div class="card-footer bg-transparent justify-content-end d-flex border-0">
      <nav>
        <ul class="pagination m-0">
          <li class="page-item">
            <button
              class="page-link border-0 text-nowrap text-muted"
              @click="getCitas()"
              aria-label="Previous"
            >
              <span aria-hidden="true">&laquo; Anterior</span>
            </button>
          </li>
          <li class="page-item">
            <button class="border-0 mx-1 btn btn-primary" @click="getCitas()">
              1
            </button>
          </li>
          <li class="page-item">
            <button
              class="page-link border-0 mx-1 text-muted"
              @click="getCitas()"
            >
              2
            </button>
          </li>
          <li class="page-item">
            <button
              class="page-link border-0 mx-1 text-muted"
              @click="getCitas()"
            >
              3
            </button>
          </li>
          <li class="page-item">
            <button
              class="page-link border-0 text-nowrap text-muted"
              @click="getCitas()"
              aria-label="Next"
            >
              <span aria-hidden="true">Siguiente &raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
    <MedicosUserModal
      :open="openUserModal"
      :appointment="modalData"
      @close-modal="closeModal"
      @refresh="refreshAppointments"
    />
    <MedicosCitaModal
      :open="openDateModal"
      :appointment="modalData"
      v-model:step="currentStep"
      @close-modal="closeModal"
      @refresh="refreshAppointments"
    />
    <MedicosCitaCancelModal
      :open="openDateCancelModal"
      :appointment="modalData"
      @close-modal="closeModal"
      @refresh="refreshAppointments"
    />
    <MedicosCitaContactModal
      :open="openContactModal"
      :appointment="modalData"
      @close-modal="closeModal"
      @refresh="refreshAppointments"
    />
  </div>
</template>
<style>
.cursor-pointer:hover {
  cursor: pointer;
}
</style>
<style>
.cursor-pointer:hover {
  cursor: pointer;
}
</style>
