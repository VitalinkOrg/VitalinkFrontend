<script setup>
import { ref } from "vue";
import { useRefreshToken } from "#imports";
definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});
const config = useRuntimeConfig();
const token = useCookie("token");
const role = useCookie("role");
const tab = ref(1);
const allAppointments = ref();
let url;
if (role.value == "R_HOS") {
  url = "/hospital_dashboard/get_patients";
} else {
  url = "/doctor_dashboard/get_patients";
}
const { data: patients, loading } = await useFetch(
  config.public.API_BASE_URL + url,
  {
    headers: { Authorization: token.value },
    transform: (_patients) => _patients.data,
  }
);
</script>

<template>
  <NuxtLayout name="medicos-dashboard">
    <nav style="--bs-breadcrumb-divider: '/'" aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink href="/medicos/inicio" class="text-muted">Inicio</NuxtLink>
        </li>
        <li class="breadcrumb-item active fw-semibold" aria-current="page">
          Pacientes
        </li>
      </ol>
    </nav>
    <p>
      <span class="fw-medium fs-4">Seguimiento de Pacientes</span>
    </p>

    <div class="row mb-4">
      <div class="col-auto">
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
      <div class="col-auto ms-auto d-flex">
        <button class="btn btn-outline-dark text-nowrap me-2">
          <AtomsIconsDownloadIcon /> Descargar
        </button>
        <div class="dropdown">
          <button
            class="btn btn-outline-dark dropdown-toggle"
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

    <div class="card">
      <MedicosPatientsTable :patients="patients" />
    </div>
  </NuxtLayout>
</template>