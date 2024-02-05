<script>
export default {
  props: ["data"],
};
</script>
<template>
  <div class="row row-cols-3 gx-3">
    <div class="col" v-for="servicio in data" :key="servicio.id">
      <div class="card border shadow-sm rounded-4">
        <div class="card-body px-2">
          <p class="card-text fs-6 text-primary fw-medium text-center mb-2">
            {{ servicio.doctor_service_id || servicio.hospital_service_id }} - {{ servicio.service }}
          </p>
          <p class="lh-sm fw-light text-muted mb-2">
            <small>{{ servicio.CPT }}</small>
          </p>
          <!-- <ul class="text-muted list-unstyled border-top border-bottom py-1 mb-0">
            <li v-for="amenidad in servicio.amenidades" class="text-muted fw-light"><small>[I] {{ amenidad.nombre
            }}</small>
            </li>
          </ul> -->
          <p
            v-if="servicio.hospital_name"
            class="card-text text-center text-success fs-6 fw-semibold border-bottom py-2"
          >
            <small>{{ servicio.hospital_name }}</small>
          </p>
          <div class="text-center border-bottom pb-2" v-if="servicio.schedule">
            <small
              v-for="horario in servicio.schedule"
              :key="horario.length"
              class="me-2 text-nowrap"
              ><strong class="fw-semibold me-1">{{ horario.day }}</strong>
              <span class="fw-light">{{ horario.open }} - {{ horario.close }}</span></small
            >
          </div>
          <div class="d-flex flex-column align-items-center pt-2">
            <small class="text-muted fw-light">Precio a partir de:</small>
            <span class="fw-semibold fs-5 text-primary"
              >{{ parseFloat(servicio.price).toLocaleString() }} {{ servicio.currency }}</span
            >
          </div>
          <button class="btn btn-primary w-100 btn-sm mt-2 rounded-2">
            Reservar una cita
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
