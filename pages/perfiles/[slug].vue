<script setup>
const { clinicas } = useClinica();
const tab = 1 // 1 Disponibilidad, 2 Servicios , 3 Ubicacion, 4 Galeria, 5 Reseñas, 6 Perfil
</script>

<template>
  <NuxtLayout name="web">

    <main class="pt-2 pb-5">
      <div class="container-fluid">
        <div class="d-flex align-items-center ">
          <button class="btn btn-link text-dark fw-light me-0 text-decoration-none">[A] Volver</button>
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb m-0">
              <li class="breadcrumb-item ">
                <NuxtLink href="/" class="text-decoration-none">Inicio</NuxtLink>
              </li>
              <li class="breadcrumb-item">Resultados de búsqueda</li>
              <li class="breadcrumb-item active" aria-current="page">Perfil medico</li>
            </ol>
          </nav>
        </div>


        <div class="row" v-for="clinica in clinicas">
          <div class="col-sm-4">
            <div class="card shadow border-0">
              <div class="card-body text-center">
                <img src="@/src/assets/img-clinica-thumbnail-md.png" alt="" class="img-fluid mb-3">
                <small>
                  <span class="fw-semibold me-2">{{ clinica.rating || '' }} [S]</span>
                  <span class="text-muted">({{ clinica.reviews || 0 }} Reseñas)</span>
                </small>
                <h2 class="h5 fw-semibold my-2">{{ clinica.nombre }}</h2>
                <span class="badge bg-primary text-primary me-2 rounded-5 text-capitalize" style="--bs-bg-opacity: .07"
                  v-for=" servicio in
                        clinica.servicios">{{
                          servicio.nombre
                        }}</span>
                <div class="my-2">
                  <span class="badge bg-success rounded-4 mx-1 p-2">[P]</span>
                  <span class="badge bg-success rounded-4 mx-1 p-2">[E]</span>
                </div>
                <p class="card-text py-2 text-muted fw-light">
                  <small>[I] {{ clinica.direccion.texto }}</small>
                </p>
                <div class="row row-cols-2">
                  <div class="col">
                    <div class="card bg-primary rounded-4 border-0" style="--bs-bg-opacity: .05">
                      <div class="card-body py-2">
                        <span class="text-muted">Experiencia</span><br>
                        <span class="fw-semibold text-primary fs-5">+{{ clinica.experiencia }} años</span>
                      </div>
                    </div>
                  </div>
                  <div class="col">
                    <div class="card bg-primary rounded-4 border-0" style="--bs-bg-opacity: .05">
                      <div class="card-body py-2">
                        <span class="text-muted">Pacientes</span><br>
                        <span class="fw-semibold text-primary fs-5">+{{ clinica.pacientes }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="card bg-primary rounded-4 border-0 mt-3" style="--bs-bg-opacity: .05">
                  <div class="card-body">
                    <div class="row row-cols-4 gx-2 mb-2">
                      <div class="col">
                        <img src="@/src/assets/img-clinica-thumbnail-xs.png" class="img-fluid" alt="">
                      </div>
                      <div class="col">
                        <img src="@/src/assets/img-clinica-thumbnail-xs.png" class="img-fluid" alt="">
                      </div>
                      <div class="col">
                        <img src="@/src/assets/img-clinica-thumbnail-xs.png" class="img-fluid" alt="">
                      </div>
                      <div class="col">
                        <img src="@/src/assets/img-clinica-thumbnail-xs.png" class="img-fluid" alt="">
                      </div>
                    </div>
                    <button class="btn btn-light border-dark-subtle w-100 bg-white">Ver más fotos</button>
                  </div>
                </div>

              </div>
            </div>
          </div>
          <div class="col">
            <div class="card shadow border-0">
              <div class="card-body">
                <h3 class="fw-semibold fs-6">Detalles y Agenda</h3>
                <p class="fw-light text-muted">Descubre el perfil completo de esta clínica, encuentra toda
                  la información
                  relevante
                  y reserva citas
                  fácilmente para tu atención médica personalizada.</p>

                <WebsiteClinicaNav :clinica="clinica" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>




  </NuxtLayout>
</template>