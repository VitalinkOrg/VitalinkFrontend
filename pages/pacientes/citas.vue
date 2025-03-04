<script setup>
import { ref } from "vue";
import { useRefreshToken } from "#imports";

// Define page meta with middleware
definePageMeta({
  middleware: "auth-pacientes",
});

/*const config = useRuntimeConfig();
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
} */

// Mocked data for appointments
const mockedAppointments = {
  data: [
    {
      id: 1,
      date: "2023-10-15T10:00:00Z",
      hour: "10:00",
      professional_name: "Dr. John Doe",
      specialty: "Cardiology",
      type: "Procedimiento",
      status: "Confirmada",
      notes: "Routine checkup"
    },
    {
      id: 2,
      date: "2023-10-16T11:00:00Z",
      hour: "10:00",
      type: "Valoración",
      professional_name: "Dr. Jane Smith",
      specialty: "Dermatology",
      status: "Pendiente",
      notes: "Skin allergy consultation"
    },
    {
      id: 3,
      date: "2023-10-17T09:00:00Z",
      hour: "10:00",
      type: "Valoración",
      professional_name: "Dr. Emily Davis",
      specialty: "Orthopedics",
      status: "Cancelada",
      notes: "Knee pain evaluation"
    },
    {
      id: 4,
      date: "2023-10-18T14:00:00Z",
      hour: "10:00",
      professional_name: "Dr. Michael Brown",
      specialty: "Neurology",
      status: "Confirmada",
      type: "Valoración",
      notes: "Migraine follow-up"
    },
    {
      id: 5,
      date: "2023-10-19T16:00:00Z",
      professional_name: "Dr. Sarah Wilson",
      hour: "10:00",
      specialty: "Pediatrics",
      status: "Pendiente",
      type: "Procedimiento",
      notes: "Child vaccination"
    }
  ]
};

// Refs for state management
const tab = ref(1); // Active tab
const sort = ref(false); // Sort dropdown state
const allAppointments = ref(mockedAppointments.data); // All appointments
const appointments = ref(mockedAppointments.data); // Filtered appointments
const loading = ref(false); // Loading state (not used here since we're using mocked data)

// Function to apply filters based on status and tab number
const applyFilter = (typeFilter, tabNumber) => {
  let filteredAppointments = allAppointments.value;
  if (typeFilter !== "ALL") {
    filteredAppointments = filteredAppointments.filter(
      (appointment) => appointment.type === typeFilter
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
                :class="tab === 1 ? 'active text-primary' : 'text-muted'"
                @click="applyFilter('ALL', 1)"
              >
                Todas las citas
              </button>
            </li>
            <li class="col-auto nav-item">
              <button
                class="nav-link"
                :class="tab === 2 ? 'active text-primary' : 'text-muted'"
                @click="applyFilter('Procedimiento', 2)"
              >
                Procedimientos
              </button>
            </li>
            <li class="col-auto nav-item">
              <button
                class="nav-link"
                :class="tab === 3 ? 'active text-primary' : 'text-muted'"
                @click="applyFilter('Valoración', 3)"
              >
                Valoraciones
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
