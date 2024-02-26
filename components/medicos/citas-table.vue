<script setup>
const props = defineProps(["appointments"]);
</script>
<template>
  <div class="card">
    <table v-if="appointments !== null" class="table fw-light">
      <thead>
        <tr>
          <th scope="col"></th>
          <th scope="col" class="text-muted">Nombre del paciente</th>
          <th scope="col" class="text-muted">Fecha</th>
          <th scope="col" class="text-muted">Hora</th>
          <th scope="col" class="text-muted">Procedimiento</th>
          <th scope="col" class="text-muted">Lugar</th>
          <th scope="col" class="text-muted">Váucher</th>
          <th scope="col" class="text-muted">Estado</th>
          <th scope="col" class="text-muted"></th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="appointment in appointments" :key="appointment.id">
          <td>
            <div class="form-check">
              <input class="form-check-input border-dark" type="checkbox" value="" :id="appointment.id">
              <!-- <label class="form-check-label" for="flexCheckDefault"></label> -->
            </div>
          </td>
          <td>{{ appointment.patient_name }}</td>
          <td>{{ new Date(appointment.date).toLocaleDateString() }}</td>
          <td>{{ appointment.time_from + " - " + appointment.time_to }}</td>
          <td>{{ appointment.service_name }}</td>
          <td><small>{{ appointment.patient_address }}</small></td>
          <td><span class="badge text-muted bg-white border rounded-5 w-100">{{ appointment.code }}</span></td>
          <td>
            <span class="badge bg-success-subtle rounded-5 text-dark w-100">{{ appointment.status }}
              <AtomsIconsChevronDown />
            </span>
          </td>
          <td>
            <AtomsIconsThreeDotsHorizontalIcon />
          </td>

        </tr>
      </tbody>
    </table>

    <div class="card-footer bg-transparent justify-content-end d-flex border-0">
      <nav>
        <ul class="pagination m-0">
          <li class="page-item">
            <button class="page-link border-0 text-nowrap" @click="getCitas()" aria-label="Previous">
              <span aria-hidden="true">&laquo; Anterior</span>
            </button>
          </li>
          <li class="page-item"><button class="page-link border-0 shadow-sm mx-1  bg-light" @click="getCitas()">1</button>
          </li>
          <li class="page-item"><button class="page-link border-0 shadow-sm mx-1  bg-light" @click="getCitas()">2</button>
          </li>
          <li class="page-item"><button class="page-link border-0 shadow-sm mx-1  bg-light" @click="getCitas()">3</button>
          </li>
          <li class="page-item">
            <button class="page-link border-0 text-nowrap" @click="getCitas()" aria-label="Next">
              <span aria-hidden="true">Siguiente &raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>