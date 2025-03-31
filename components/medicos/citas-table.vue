<script>
import { jsPDF } from "jspdf";
export default {
  props: {
    appointments: {
      type: Object,
      default: [],
    },
    useDropdown: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      openUserModal: false,
      openDateModal: false,
      openContactModal: false,
      openDateCancelModal: false,
      modalData: null,
      currentStep: 1,
    };
  },
  methods: {
    showUserDetails(appointment) {
      this.modalData = appointment;
      this.openUserModal = true;
    },
    showContactDetails(appointment) {
      this.modalData = appointment;
      this.openContactModal = true;
    },
    showDateDetails(appointment, step) {
      this.modalData = appointment;
      this.openDateModal = true;
      this.currentStep = step;
    },
    statusClass(status) {
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
    },
    showDateCancel(appointment) {
      this.modalData = appointment;
      this.openDateCancelModal = true;
    },
    downloadSummary(appointment) {
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
      addField(
        "Fecha de la cita",
        new Date(appointment.date).toLocaleDateString()
      );
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
    },
    closeModal() {
      this.modalData = null;
      this.openUserModal = false;
      this.openDateModal = false;
      this.openDateCancelModal = false;
    },
  },
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
            <td>{{ appointment.patient_name }}</td>
            <td>
              {{ new Date(appointment.date).toLocaleDateString() }} a las
              {{ appointment.time_from }}
            </td>
            <td>{{ appointment.service_name }}</td>
            <td>
              <small class="text-capitalize">{{
                appointment.appointment_type
              }}</small>
            </td>
            <td>
              <span
                class="badge bg-success-subtle rounded-5 text-dark text-center"
                :class="statusClass(appointment.status)"
                >{{ appointment.status }}
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
                      @click="showDateDetails(appointment, 1)"
                    >
                      <Icon name="fa6-regular:eye" class="text-primary" />
                      Ver más detalles
                    </button>
                  </li>
                  <li
                    v-if="
                      appointment.status == 'Pendiente' &&
                      appointment.appointment_type == 'pre-reserva'
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
                  <li v-if="appointment.status == 'Pendiente'">
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
    />
    <MedicosCitaModal
      :open="openDateModal"
      :appointment="modalData"
      v-model:step="currentStep"
      @close-modal="closeModal"
    />
    <MedicosCitaCancelModal
      :open="openDateCancelModal"
      :appointment="modalData"
      @close-modal="closeModal"
    />
    <MedicosCitaContactModal
      :open="openContactModal"
      :appointment="modalData"
      @close-modal="closeModal"
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
