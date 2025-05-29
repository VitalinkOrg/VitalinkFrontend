<template>
  <div class="card">
    <div class="table-responsive" v-if="appointments !== null">
      <table class="table fw-light">
        <thead>
          <tr>
            <th scope="col" class="text-muted fw-normal">Doctor</th>
            <th scope="col" class="text-muted fw-normal">Fecha de cita</th>
            <th scope="col" class="text-muted fw-normal">Hora</th>
            <th scope="col" class="text-muted fw-normal">Procedimiento</th>
            <th scope="col" class="text-muted fw-normal">Código de reserva</th>
            <th scope="col" class="text-muted fw-normal">Tipo de reserva</th>
            <th scope="col" class="text-muted fw-normal">Estado de cita</th>
            <th scope="col" class="text-muted fw-normal"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appointment in appointments" :key="appointment.id">
            <td>
              {{ appointment.supplier.name || appointment.hospital_name }}
            </td>
            <td>
              {{ new Date(appointment.appointment_date).toLocaleDateString() }}
            </td>
            <td>{{ appointment.appointment_hour }}</td>
            <td>{{ appointment.package?.procedure.name }}</td>
            <td>{{ appointment.appointment_qr_code }}</td>
            <td>{{ appointment.reservation_type.name }}</td>
            <td>
              <PacientesPagarCitaModal
                v-if="
                  (appointment.appointment_status.code !==
                    'VALUED_VALORATION_APPOINTMENT' &&
                    appointment.appointment_status.code !==
                      'PENDING_PROCEDURE') ||
                  (appointment.appointment_status.code ===
                    'CONFIRM_PROCEDURE' &&
                    appointment.payment_status.code ===
                      'PAYMENT_STATUS_NOT_PAID_PROCEDURE')
                "
                :appointment="appointment"
                :showStatus="true"
                @refresh="refreshAppointments"
              />
              <PacientesProcedimientoCitaModal
                v-else
                :appointment="appointment"
                :showStatus="true"
                @refresh="refreshAppointments"
              />
            </td>
            <td>
              <PacientesPagarCitaModal
                v-if="
                  (appointment.appointment_status.code !==
                    'VALUED_VALORATION_APPOINTMENT' &&
                    appointment.appointment_status.code !==
                      'PENDING_PROCEDURE') ||
                  (appointment.appointment_status.code ===
                    'CONFIRM_PROCEDURE' &&
                    appointment.payment_status.code ===
                      'PAYMENT_STATUS_NOT_PAID_PROCEDURE')
                "
                :appointment="appointment"
                :showStatus="false"
                @refresh="refreshAppointments"
              />
              <PacientesProcedimientoCitaModal
                v-else
                :appointment="appointment"
                :showStatus="false"
                @refresh="refreshAppointments"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="card-body d-flex py-5">
      <div class="col-sm-5 text-end">
        <AtomsIconsChartVacio />
      </div>
      <div class="col-sm-7">
        <p class="fs-5 text-muted fw-medium">
          Aún no tienes actividad en tu tablero
        </p>
        <p class="fw-light text-secondary">
          Muy pronto podrás administrar y verificar tu actividad.
        </p>
        <button class="btn btn-primary border-danger">Empezar</button>
      </div>
    </div>

    <div class="card-footer bg-transparent justify-content-end d-flex">
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
  </div>
</template>

<script setup>
import { ref, inject } from "vue";
const { emit } = defineEmits(["refreshed"]);
const refreshAppointments = inject("refreshAppointments");

const props = defineProps(["appointments"]);
const activeAppointment = ref(null);

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

const openModal = (appointment) => {
  if (appointment.status === "Pendiente") {
    activeAppointment.value = appointment; // Set the active appointment
  }
};

const closeModal = () => {
  activeAppointment.value = null; // Reset the active appointment
};
</script>
