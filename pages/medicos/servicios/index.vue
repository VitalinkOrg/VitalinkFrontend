<script setup>
import { ref, defineProps } from "vue";
const open = ref(false);
definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});
const config = useRuntimeConfig();
//const user_info = useCookie("user_info");
const user_info = {
  services: [
    { id: 101, name: "Mock Service A" },
    { id: 102, name: "Mock Service B" },
  ],
  specialties: [
    { id: 201, name: "Mock Specialty X" },
    { id: 202, name: "Mock Specialty Y" },
  ],
  hospitals: [
    { id: 301, name: "Mock Hospital 1" },
    { id: 302, name: "Mock Hospital 2" },
  ],
  first_name: "MockFirstName",
  name: "FallbackMockFirstName", // If first_name is undefined
  last_name: "MockLastName",
  phone_number: "123-456-7890",
  phone_number_1: "987-654-3210", // If phone_number is undefined
  address: "Mock Address 123",
  city: "Mock City",
  country_iso_code: "MCK",
  postal_code: "12345",
  description: "Mock Description of User",
  medical_license_number: "MLN-123",
  medical_number: "MN-456", // If medical_license_number is undefined
};
const { data: services } = await useFetch(
  config.public.API_BASE_URL + "/services",
  {
    transform: (_services) => _services.data,
  }
);
const filteredArray = [];
</script>

<template>
  <NuxtLayout name="medicos-dashboard">
    <nav style="--bs-breadcrumb-divider: &quot;/&quot;" aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink href="/medicos/inicio" class="text-muted">Inicio</NuxtLink>
        </li>
        <li class="breadcrumb-item active fw-semibold" aria-current="page">
          Servicios
        </li>
      </ol>
    </nav>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <p>
        <span class="fw-medium fs-4">Mis servicios</span>
      </p>

      <button class="btn btn-primary" @click="open = true">
        <small> + Añadir servicio</small>
      </button>
    </div>

    <div class="row mb-4">
      <div class="col-10">
        <div class="input-group shadow-sm">
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
      </div>
      <div class="col-2 ms-auto d-flex">
        <div class="dropdown me-2 w-100">
          <button
            class="btn btn-outline-dark dropdown-toggle w-100"
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
    <WebsiteClinicaServiciosTab :services="filteredArray" />
    <WebsiteAgregarServicioModal
      :isOpen="open"
      @close="open = false"
      :specialties="user_info.specialties"
    />
  </NuxtLayout>
</template>
