<script setup>
import { ref } from "vue";
import { useRefreshToken } from "#imports";
definePageMeta({
  middleware: "auth-pacientes",
});
const config = useRuntimeConfig();
const token = useCookie("token");
const tab = ref(1);
const sort = ref(false);
const allAppointments = ref();

const { data: appointments, loading } = await useFetch(
  config.public.API_BASE_URL + "/internal_patient_dashboard/appointments",
  {
    headers: { Authorization: token.value },
    transform: (_appointments) => _appointments.data,
  }
);
if (appointments) {
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
  <NuxtLayout name="pacientes-dashboard">
    <div v-if="loading"></div>
    <main v-else class="bg-light" style="min-height: 100vh">
      <section class="p-5">
        <p>
          <span class="fw-semibold fs-5">Mis Citas</span>
        </p>

        <div class="row align-items-end justify-content-between mb-4">
          <ul class="nav nav-underline row col-md-8">
            <li class="col-auto nav-item">
              <button
                class="nav-link"
                :class="tab === 1 ? 'active' : ''"
                @click="applyFilter('ALL', 1)"
              >
                Todas las citas
              </button>
            </li>
            <li class="col-auto nav-item">
              <button
                class="nav-link"
                :class="tab === 2 ? 'active' : ''"
                @click="applyFilter('COMPLETED', 2)"
              >
                Concretadas
              </button>
            </li>
            <li class="col-auto nav-item">
              <button
                class="nav-link"
                :class="tab === 3 ? 'active' : ''"
                @click="applyFilter('CREATED', 3)"
              >
                Pendientes
              </button>
            </li>
            <li class="col-auto nav-item">
              <button
                class="nav-link"
                :class="tab === 4 ? 'active' : ''"
                @click="applyFilter('CANCELED', 4)"
              >
                Canceladas
              </button>
            </li>
          </ul>
          <NuxtLink
            href="/buscar"
            class="col-12 col-md-auto btn btn-primary text-nowrap px-4"
          >
            <AtomsIconsPlusIcon /> Nueva Cita
          </NuxtLink>
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
                @click="sort = !sort"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Ordenar por
              </button>
              <ul class="dropdown-menu" :class="sort ? 'show' : ''">
                <li><a class="dropdown-item" href="#">Action</a></li>
                <li><a class="dropdown-item" href="#">Another action</a></li>
                <li>
                  <a class="dropdown-item" href="#">Something else here</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="card">
          <PacientesCitasTable :appointments="appointments" />
        </div>
      </section>
    </main>
  </NuxtLayout>
</template>
