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
// const { data: patients, loading } = await useFetch(
//   "https://stg.vitalink.cr" + url,
//   {
//     headers: { Authorization: token.value },
//     transform: (_patients) => _patients.data,
//   },
// );
const patients = [
  {
    patient_id: 1,
    patient_name: "Juan Pérez",
    date: "2023-10-01",
    time_from: "10:00",
    time_to: "11:00",
    service_name: "Consulta General",
    patient_address: "Calle Falsa 123",
    code: "ABC123",
    status: "Confirmado",
  },
  {
    patient_id: 2,
    patient_name: "María López",
    date: "2023-10-02",
    time_from: "12:00",
    time_to: "13:00",
    service_name: "Odontología",
    patient_address: "Avenida Siempre Viva 742",
    code: "DEF456",
    status: "Pendiente",
  },
  {
    patient_id: 3,
    patient_name: "Carlos García",
    date: "2023-10-03",
    time_from: "14:00",
    time_to: "15:00",
    service_name: "Cardiología",
    patient_address: "Calle Luna 456",
    code: "GHI789",
    status: "Cancelado",
  },
];
</script>

<template>
  <NuxtLayout name="medicos-dashboard">
    <nav style="--bs-breadcrumb-divider: &quot;/&quot;" aria-label="breadcrumb">
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
