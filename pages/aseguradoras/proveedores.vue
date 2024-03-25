<script setup>
import { useStore } from "~/store";
definePageMeta({
  middleware: ["auth-insurances"],
});
const store = useStore();
const config = useRuntimeConfig();
const token = useCookie("token");

const { data: suppliers, pending: pendingSuppliers } = await useFetch(
  config.public.API_BASE_URL + "/insurance_dashboard/favorite_medical_list",
  {
    headers: { Authorization: token.value },
    transform: (_suppliers) => _suppliers.data,
  }
);
if (suppliers) {
  store.user = [];
  store.user.suppliers = suppliers;
}
</script>

<template>
  <NuxtLayout name="aseguradoras-dashboard">
    <div v-if="pendingSuppliers"></div>
    <div v-else>
      <nav style="--bs-breadcrumb-divider: '/'" aria-label="breadcrumb">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <NuxtLink href="/aseguradoras/inicio" class="text-muted"
              >Inicio</NuxtLink
            >
          </li>
          <li class="breadcrumb-item active fw-semibold" aria-current="page">
            Proveedores
          </li>
        </ol>
      </nav>
      <p>
        <span class="fw-medium fs-4">Proveedores</span>
      </p>

      <div class="d-flex justify-content-between align-items-center mb-4">
        <span
          >Mostrando
          <span class="fw-semibold"
            >{{ suppliers.length }} proveedores</span
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

      <div class="row">
        <div class="col">
          <div
            class="card shadow border-0 rounded-4 mb-4"
            v-for="supplier in suppliers"
            :key="supplier.id"
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
                    <small>
                      <span
                        class="fw-semibold me-2"
                        v-if="supplier.review_score"
                      >
                        <!-- {{ clinica.price || "" }} -->
                        {{ parseFloat(supplier.review_score).toFixed(1) || "" }}
                        <AtomsIconsStar />
                      </span>
                      <!-- <span class="text-muted">({{ clinica.rating.reviews || 0 }} Reseñas)</span> -->
                      <span class="text-muted"
                        >({{ supplier.review_count || 0 }} Reseñas)</span
                      >
                    </small>
                    <h2 class="h5 fw-semibold my-2">{{ supplier.name }}</h2>
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
                      supplier.address +
                      ", " +
                      supplier.city +
                      ", " +
                      supplier.country_iso_code
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
                        :href="`mailto:${supplier.email}`"
                        class="btn btn-light border fw-light bg-white me-2"
                      >
                        <span class="fs-5"><AtomsIconsMailIcon /></span>
                      </a>
                      <a
                        :href="`tel:${supplier.phone_number}`"
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
