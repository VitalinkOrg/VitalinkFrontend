<script setup>
definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});
const config = useRuntimeConfig();
const user_info = useCookie("user_info");

const { data: hospitals, pending: pendingHospitals } = await useFetch(
  config.public.API_BASE_URL + "/hospitals",
  {
    transform: (_hospitals) => _hospitals.data,
  }
);
const filteredArray = hospitals.value.filter((item) =>
  user_info.value.hospitals.includes(item.id)
);
</script>

<template>
  <NuxtLayout name="medicos-dashboard">
    <div v-if="pendingHospitals"></div>
    <div v-else>
      <nav style="--bs-breadcrumb-divider: '/'" aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <NuxtLink href="/aseguradoras/inicio" class="text-muted"
              >Inicio</NuxtLink
            >
          </li>
          <li class="breadcrumb-item active fw-semibold" aria-current="page">
            Hospitales
          </li>
        </ol>
      </nav>
      <p>
        <span class="fw-medium fs-4">Hospitales</span>
      </p>

      <div class="d-flex justify-content-between align-items-center mb-4">
        <span v-if="filteredArray"
          >Mostrando
          <span class="fw-semibold"
            >{{ filteredArray.length }} hospitales</span
          ></span
        >
        <div class="d-flex">
          <div class="input-group shadow-sm me-3">
            <span
              class="input-group-text bg-transparent border-end-0 rounded-start-3"
              id="basic-addon1"
            >
              <AtomsIconsSearchIcon />
            </span>
            <input
              type="text"
              class="form-control border-start-0 rounded-end-3"
              placeholder="Buscar"
              aria-label="Buscar"
              aria-describedby="basic-addon1"
            />
          </div>
          <div class="dropdown">
            <button
              class="btn btn-outline-dark dropdown-toggle fw-light bg-white"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Ordenar por
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#">Action</a></li>
              <li><a class="dropdown-item" href="#">Another action</a></li>
              <li><a class="dropdown-item" href="#">Something else here</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="row" v-if="filteredArray !== null">
        <div class="col">
          <div
            class="card shadow border-0 rounded-4 mb-4"
            v-for="hospital in filteredArray"
            :key="hospital.id"
          >
            <div class="card-body p-4">
              <div class="row">
                <div class="col-sm-4" style="cursor: pointer">
                  <img
                    src="@/src/assets/img-clinica-thumbnail.png"
                    class="img-fluid rounded-4"
                    alt="clinica"
                  />
                </div>
                <div class="col d-flex flex-column justify-content-between">
                  <div>
                    <h2 class="h5 fw-semibold my-2">{{ hospital.name }}</h2>
                    <!-- <span class="badge bg-primary text-primary me-2 rounded-5 text-capitalize p-2"
                  style="--bs-bg-opacity: 0.07" v-for="specialty in clinica.specialty_name" :key="specialty.length">{{
                    specialty }}</span> -->
                    <!-- <div class="d-flex my-3" v-if="clinica.service_name">
                    <span
                      class="badge rounded-circle bg-success text-success me-2"
                      v-for="service in clinica.service_name"
                      style="--bs-bg-opacity: 0.1"
                      >{{ service.name }}</span
                    >
                  </div> -->
                  </div>
                  <p class="fw-light text-muted d-flex align-items-center">
                    <span class="text-info me-2" style="--bs-bg-opacity: 0.05">
                      <AtomsIconsMapPointerIcon /> </span
                    >{{
                      hospital.address +
                      ", " +
                      hospital.city +
                      ", " +
                      hospital.country_iso_code
                    }}
                  </p>
                  <p class="fw-light text-muted d-flex align-items-center">
                    <span class="text-info me-2" style="--bs-bg-opacity: 0.05">
                      <AtomsIconsMapPointerIcon /> </span
                    >+5 Hospitales diferentes
                  </p>
                  <div
                    class="d-flex align-items-center justify-content-between"
                  >
                    <button class="btn btn-primary">Ir a la página web</button>
                    <div>
                      <a
                        :href="`tel:${hospital.phone_number_1}`"
                        class="btn btn-light border fw-light bg-white"
                      >
                        <span class="fs-5"><AtomsIconsPhoneIcon /></span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col">
          <AtomsMapaInteractivo />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
