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
              {{ appointment.professional_name || appointment.hospital_name }}
            </td>
            <td>{{ new Date(appointment.date).toLocaleDateString() }}</td>
            <td>{{ appointment.hour }}</td>
            <td>{{ appointment.notes }}</td>
            <td>{{ appointment.id }}</td>
            <td>{{ appointment.type }}</td>
            <td>
              <span class="badge rounded-5 text-dark" :class="statusClass(appointment.status)">
                {{ appointment.status }}
              </span>
            </td>
            <td>
              <PacientesCancelarCitaModal
                v-if="appointment.status !== 'Cancelada'"
                :appointment="appointment"
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
            <button class="page-link border-0 text-nowrap text-muted" @click="getCitas()" aria-label="Previous">
              <span aria-hidden="true">&laquo; Anterior</span>
            </button>
          </li>
          <li class="page-item">
            <button class="border-0  mx-1 btn btn-primary" @click="getCitas()">
              1
            </button>
          </li>
          <li class="page-item">
            <button class="page-link border-0  mx-1 text-muted" @click="getCitas()">
              2
            </button>
          </li>
          <li class="page-item">
            <button class="page-link border-0  mx-1 text-muted" @click="getCitas()">
              3
            </button>
          </li>
          <li class="page-item">
            <button class="page-link border-0 text-nowrap text-muted" @click="getCitas()" aria-label="Next">
              <span aria-hidden="true">Siguiente &raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>

<script setup> // Import your component

const props = defineProps(["appointments"]);

const statusClass = (status) => {  // statusClass as a function
  switch (status) {
    case "Cancelada":
      return "bg-danger-subtle";
    case "Pendiente":
      return "bg-warning-subtle";
    case "Confirmada":
      return "bg-primary-subtle";
    default:
      return "";
  }
};

const getCitas = () => {
  // Your logic to get citas (appointments)
  console.log("Getting citas...");
};
</script>