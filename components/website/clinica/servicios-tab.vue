<script>
export default {
  props: ["services"],
};
</script>
<template>
  <div v-if="services.length" class="row row-cols-3 gx-3">
    <div class="col" v-for="service in services" :key="service.id">
      <div class="card border shadow-sm rounded-4">
        <div class="card-body px-2">
          <p class="card-text fs-6 text-primary fw-medium text-center mb-2">
            {{ service.doctor_service_id || service.hospital_service_id }} - {{ service.service }}
          </p>
          <p class="lh-sm fw-light text-muted mb-2">
            <small>{{ service.cpt }}</small>
          </p>
          <!-- <ul class="text-muted list-unstyled border-top border-bottom py-1 mb-0">
            <li v-for="amenidad in service.amenidades" class="text-muted fw-light"><small>[I] {{ amenidad.nombre
            }}</small>
            </li>
          </ul> -->
          <p v-if="service.hospital_name" class="card-text text-center text-success fs-6 fw-semibold border-bottom py-2">
            <small>{{ service.hospital_name }}</small>
          </p>
          <div class="text-center border-bottom pb-2" v-if="service.schedule">
            <small v-for="horario in service.schedule" :key="horario.length" class="me-2 text-nowrap"><strong
                class="fw-semibold me-1">{{ horario.day }}</strong>
              <span class="fw-light">{{ horario.open }} - {{ horario.close }}</span></small>
          </div>
          <div class="d-flex flex-column align-items-center pt-2">
            <small class="text-muted fw-light">Precio a partir de:</small>
            <span class="fw-semibold fs-5 text-primary">{{ parseFloat(service.price).toLocaleString() }} {{
              service.currency }}</span>
          </div>



          <WebsiteReservarCitaModal :service="service" />
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <p>No hay servicios disponibles.</p>
  </div>
</template>
