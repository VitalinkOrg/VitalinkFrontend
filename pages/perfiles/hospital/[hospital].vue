<script setup>
const config = useRuntimeConfig();
const route = useRoute();

const { data: hospital, pending } = await useLazyFetch(
  config.public.API_BASE_URL + "/patient_dashboard/hospital_profile",
  {
    params: {
      hospital_id: route.params.hospital,
    },
    transform: (_hospital) => _hospital.data,
  }
);
</script>

<template>
  <NuxtLayout name="web">
    <main class="pt-2 pb-5">
      <div class="container-fluid">
        <div class="d-flex align-items-center mb-2">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb m-0">
              <li class="breadcrumb-item"></li>
              <li class="breadcrumb-item">
                <NuxtLink href="/" class="text-decoration-none"
                  >Inicio</NuxtLink
                >
              </li>
              <a
                href="javascript:history.back()"
                class="breadcrumb-item text-decoration-none"
                >Resultados de búsqueda</a
              >
              <li class="breadcrumb-item active" aria-current="page">
                Perfil médico
              </li>
            </ol>
          </nav>
        </div>
        <div v-if="pending">Loading clinicas...</div>
        <div v-else class="row">
          <div class="col-sm-4">
            <div class="card shadow border-0">
              <div class="card-body text-center">
                <img
                  src="@/src/assets/img-clinica-thumbnail-md.png"
                  alt=""
                  class="img-fluid mb-3"
                />
                <div>
                  <small>
                    <span class="fw-semibold me-2">
                      5.0

                      <AtomsIconsStarFilled />
                    </span>
                    <span class="text-muted">13 Reseñas</span>
                  </small>
                </div>
                <h2 class="h5 fw-semibold my-2">
                  {{ hospital.hospital_information.name }}
                </h2>

                <span
                  class="badge bg-primary text-primary me-2 rounded-5 text-capitalize"
                  style="--bs-bg-opacity: 0.07"
                  v-for="service in hospital.servicesResult"
                  :key="service.hospital_service_id"
                  >{{ service.specialty }}</span
                >
                <div class="my-2">
                  <a
                    :href="`tel:${hospital.hospital_information.phone_number_1}`"
                    class="badge bg-success rounded-4 mx-1 p-2"
                  >
                    <AtomsIconsPhoneIcon />
                  </a>
                  <a
                    :href="`mailto:${hospital.hospital_information.email}`"
                    class="badge bg-success rounded-4 mx-1 p-2"
                  >
                    <AtomsIconsMailIcon />
                  </a>
                </div>
                <p class="card-text py-2 text-muted fw-light">
                  <small v-if="hospital"
                    ><AtomsIconsMapPointerIcon />
                    {{
                      hospital.hospital_information.address +
                      ", " +
                      hospital.hospital_information.city +
                      ", " +
                      hospital.hospital_information.country_iso_code
                    }}
                  </small>
                </p>
                <div class="row row-cols-2">
                  <div class="col">
                    <div
                      class="card bg-primary rounded-4 border-0"
                      style="--bs-bg-opacity: 0.05"
                    >
                      <div class="card-body py-2">
                        <span class="text-muted">Experiencia</span><br />
                        <span class="fw-semibold text-primary fs-5"
                          >+10 años</span
                        >
                      </div>
                    </div>
                  </div>
                  <div class="col">
                    <div
                      class="card bg-primary rounded-4 border-0"
                      style="--bs-bg-opacity: 0.05"
                    >
                      <div class="card-body py-2">
                        <span class="text-muted">Pacientes</span><br />
                        <span class="fw-semibold text-primary fs-5">+1000</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- <div
                  class="card bg-primary rounded-4 border-0 mt-3"
                  style="--bs-bg-opacity: 0.05"
                >
                  <div class="card-body">
                    <div class="row row-cols-4 gx-2 mb-2">
                      <div class="col">
                        <img
                          src="@/src/assets/img-clinica-thumbnail-xs.png"
                          class="img-fluid"
                          alt=""
                        />
                      </div>
                      <div class="col">
                        <img
                          src="@/src/assets/img-clinica-thumbnail-xs.png"
                          class="img-fluid"
                          alt=""
                        />
                      </div>
                      <div class="col">
                        <img
                          src="@/src/assets/img-clinica-thumbnail-xs.png"
                          class="img-fluid"
                          alt=""
                        />
                      </div>
                      <div class="col">
                        <img
                          src="@/src/assets/img-clinica-thumbnail-xs.png"
                          class="img-fluid"
                          alt=""
                        />
                      </div>
                    </div>
                    <button
                      class="btn btn-light border-dark-subtle w-100 bg-white"
                    >
                      Ver más fotos
                    </button>
                  </div>
                </div> -->
              </div>
            </div>
          </div>
          <div class="col">
            <div class="card shadow border-0">
              <div class="card-body">
                <h3 class="fw-semibold fs-6">Detalles y Agenda</h3>
                <p class="fw-light text-muted">
                  Descubre el perfil completo de esta clínica, encuentra toda la
                  información relevante y reserva citas fácilmente para tu
                  atención médica personalizada.
                </p>
                <WebsiteHospitalNav :hospital="hospital" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </NuxtLayout>
</template>
