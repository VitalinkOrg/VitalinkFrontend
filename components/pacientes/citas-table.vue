<script setup>
const props = defineProps(["appointments"]);
</script>
<template>
  <div class="card">
    <table v-if="appointments !== null" class="table fw-light">
      <thead>
        <tr>
          <th scope="col" class="text-muted">Doctor</th>
          <th scope="col" class="text-muted">Fecha</th>
          <th scope="col" class="text-muted">Hora</th>
          <th scope="col" class="text-muted">Procedimiento</th>
          <th scope="col" class="text-muted">Lugar</th>
          <th scope="col" class="text-muted">Estado</th>
          <th scope="col" class="text-muted"></th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="appointment in appointments" :key="appointment.id">
          <td>{{ appointment.professional_name }}</td>
          <td>{{ new Date(appointment.date).toLocaleDateString() }}</td>
          <td>{{ appointment.time_from + " - " + appointment.time_to }}</td>
          <td>{{ appointment.service_name }}</td>
          <td>
            <small>{{ appointment.hospital_address }}</small>
          </td>
          <td>
            <span class="badge bg-success-subtle rounded-5 text-dark"
              >{{ appointment.status }} <AtomsIconsNotificationsIcon /></span
            >
          </td>
        </tr>
      </tbody>
    </table>
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
              class="page-link border-0 text-nowrap"
              @click="getCitas()"
              aria-label="Previous"
            >
              <span aria-hidden="true">&laquo; Anterior</span>
            </button>
          </li>
          <li class="page-item">
            <button
              class="page-link border-0 shadow-sm mx-1 bg-light"
              @click="getCitas()"
            >
              1
            </button>
          </li>
          <li class="page-item">
            <button
              class="page-link border-0 shadow-sm mx-1 bg-light"
              @click="getCitas()"
            >
              2
            </button>
          </li>
          <li class="page-item">
            <button
              class="page-link border-0 shadow-sm mx-1 bg-light"
              @click="getCitas()"
            >
              3
            </button>
          </li>
          <li class="page-item">
            <button
              class="page-link border-0 text-nowrap"
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
