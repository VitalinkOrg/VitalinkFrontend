
<script setup>
const { servicios } = useServicios(214264);
</script>
<template>
  <div class="row row-cols-3">
    <div v-for="servicio in servicios" :key="servicio.id" class="card shadow border rounded-4">
      <div class="card-body px-1">
        <p class="card-text fs-6 text-primary fw-medium text-center mb-2"> {{ servicio.id }} - {{ servicio.nombre }}</p>
        <p class="lh-sm fw-light text-muted mb-2"><small>{{ servicio.descripcion }}</small></p>
        <ul class="text-muted list-unstyled border-top border-bottom py-1 mb-0">
          <li v-for="amenidad in servicio.amenidades" class="text-muted fw-light"><small>[I] {{ amenidad.nombre }}</small>
          </li>
        </ul>
        <p class="card-text text-center text-success fs-6 fw-semibold border-bottom py-2"><small>{{ servicio.clinica
        }}</small>
        </p>
        <div class="text-center border-bottom pb-2">
          <small v-for="horario in servicio.horario" class="me-2 text-nowrap"><strong class="fw-semibold me-1">{{
            horario.dia
          }}</strong>
            <span class="fw-light">{{ horario.horas
            }}</span></small>
        </div>
        <div class="d-flex flex-column align-items-center pt-2">
          <small class="text-muted fw-light">Precio a partir de:</small>

        </div>
      </div>
    </div>
  </div>
</template>