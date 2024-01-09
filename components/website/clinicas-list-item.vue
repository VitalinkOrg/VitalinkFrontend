<script>
export default {
  props: ['clinica'],
  data: () => ({
    panel: false
  })
}
</script>

<template>
  <div class="card shadow border-0 rounded-4 mb-4">
    <div class="card-body">
      <div class="row">
        <div class="col-sm-3">
          <img src="@/src/assets/img-clinica-thumbnail.png" class="img-fluid rounded-4" alt="clinica">
        </div>
        <div class="col">
          <small>
            <span class="fw-semibold me-2">{{ clinica.rating || '' }} STAR</span>
            <span class="text-muted">({{ clinica.reviews || 0 }} Reseñas)</span>
          </small>
          <h2 class="h5 fw-semibold my-2">{{ clinica.nombre }}</h2>
          <span class="badge bg-primary text-primary me-2 rounded-5 text-capitalize" style="--bs-bg-opacity: .07" v-for=" servicio in
                        clinica.servicios">{{
                          servicio.nombre
                        }}</span>
          <p class="fw-light text-muted mt-3">
            <span class="badge rounded-circle bg-primary text-primary me-2 " style="--bs-bg-opacity: .05">I</span>Cirugia
            de Cataratas
          </p>
          <p class="fw-light text-muted">
            <span class="badge rounded-circle bg-primary text-primary me-2 " style="--bs-bg-opacity: .05">I</span>+5
            Hospitales diferentes
          </p>
          <div class="d-flex justify-content-between align-items-center">
            <div class="card bg-light rounded-4 border-0">
              <div class="card-body py-2">
                <span class="text-muted">Disponibilidad:</span><br>
                <span class="fw-normal">[I] 5 de Octubre de 2023 [I] 11:00 am</span>
              </div>
            </div>
            <div class="d-flex flex-column align-items-end justify-content-end" @click="panel = !panel">
              <span class="text-muted">A partir de</span>
              <span class="fw-bold">23.200 USD</span>
            </div>
          </div>

        </div>
      </div>

      <div class="row" v-if="panel">
        Hey
      </div>
    </div>
  </div>
</template>