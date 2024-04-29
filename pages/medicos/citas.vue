<script setup>
import { useStore } from "~/store";
import { ref } from "vue";
import { useRefreshToken } from "#imports";
definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});
const store = useStore();
const config = useRuntimeConfig();
const token = useCookie("token");
const role = useCookie("role");
const tab = ref(1);
const allAppointments = ref();

let url;
if (role.value == "R_HOS") {
  url = "/hospital_dashboard/history_appointments";
} else {
  url = "/doctor_dashboard/history_appointments";
}

const { data: appointments, loading } = await useFetch(
  config.public.API_BASE_URL + url,
  {
    headers: { Authorization: token.value },
    transform: (_appointments) => _appointments.data,
  }
);
if (appointments) {
  store.user = [];
  store.user.appointments = appointments;
  allAppointments.value = appointments.value;
  useRefreshToken();
}

const applyFilter = (statusFilter, tabNumber) => {
  let filteredAppointments = allAppointments.value;
  if (statusFilter !== "ALL") {
    filteredAppointments = filteredAppointments.filter(
      (appointment) => appointment.status === statusFilter
    );
  }
  appointments.value = filteredAppointments;
  tab.value = tabNumber;
};
</script>

<template>
  <NuxtLayout name="medicos-dashboard">
    <nav style="--bs-breadcrumb-divider: '/'" aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink href="/medicos/inicio" class="text-muted">Inicio</NuxtLink>
        </li>
        <li class="breadcrumb-item active fw-semibold" aria-current="page">
          Citas
        </li>
      </ol>
    </nav>
    <p>
      <span class="fw-medium fs-4">Seguimiento de Citas</span>
    </p>

    <div class="d-flex align-items-end justify-content-between mb-4">
      <ul class="nav nav-underline d-flex flex-row w-100">
        <li class="nav-item">
          <button
            class="nav-link"
            :class="tab === 1 ? 'active' : ''"
            @click="applyFilter('ALL', 1)"
          >
            Todas las citas
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            :class="tab === 2 ? 'active' : ''"
            @click="applyFilter('COMPLETED', 2)"
          >
            Citas Concretadas
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            :class="tab === 3 ? 'active' : ''"
            @click="applyFilter('PENDING', 3)"
          >
            Citas Pendientes
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            :class="tab === 4 ? 'active' : ''"
            @click="applyFilter('CANCELED', 4)"
          >
            Citas Canceladas
          </button>
        </li>
      </ul>
    </div>

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
      <MedicosCitasTable :appointments="appointments" />
    </div>
  </NuxtLayout>
</template>
