<script setup>
const props = defineProps(["vouchers"]);
</script>
<template>
  <div class="card">
    <table v-if="vouchers !== null" class="table fw-light">
      <thead>
        <tr>
          <th scope="col"></th>
          <th scope="col" class="text-muted">Código</th>
          <th scope="col" class="text-muted">Fecha y hora de uso</th>
          <th scope="col" class="text-muted">Procedimiento</th>
          <th scope="col" class="text-muted">Lugar</th>
          <th scope="col" class="text-muted">Aseguradora</th>
          <th scope="col" class="text-muted">Estado</th>
          <th scope="col" class="text-muted">Costo</th>
          <th scope="col" class="text-muted"></th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="voucher in vouchers" :key="voucher.id">
          <td>
            <div class="form-check">
              <input class="form-check-input border-dark" type="checkbox" value="" :id="vaucher.code">
              <!-- <label class="form-check-label" for="flexCheckDefault"></label> -->
            </div>
          </td>
          <td>{{ vaucher.code }}</td>
          <!-- <td>{{ vaucher.fecha }} a las {{ vaucher.hora }}</td> -->
          <td>{{ vaucher.service_name }}</td>
          <td>{{ vaucher.description }}</td>
          <td>{{ vaucher.cpt_name }}</td>
          <td><span class="badge bg-success-subtle rounded-5 text-dark">{{ vaucher.status }} </span></td>
          <td><small>{{ vaucher.discount_percent }} USD</small></td>
          <td>
            <AtomsIconsDownloadIcon />
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