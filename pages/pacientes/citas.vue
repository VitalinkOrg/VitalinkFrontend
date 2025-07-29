<script setup>
import { useRefreshToken } from "#imports";
import { computed, ref, watch } from "vue";

definePageMeta({
  middleware: "auth-pacientes",
});

const config = useRuntimeConfig();
const token = useCookie("token");
const user_info = useCookie("user_info");
const loading = ref(false);
const isRefreshing = ref(false);
const previousAppointments = ref([]);

const appointmentsResponse = ref(null);

const appointmentsData = computed(() => {
  return appointmentsResponse.value || previousAppointments.value;
});

const { data: fetchedData } = await useFetch(
  config.public.API_BASE_URL + "/appointment/get_all",
  {
    headers: { Authorization: token.value },
    params: {
      customer_id: user_info.id,
    },
    transform: (_appointments) => _appointments.data,
  }
);

if (fetchedData.value) {
  appointmentsResponse.value = fetchedData.value;
  previousAppointments.value = fetchedData.value;
  useRefreshToken();
}

const fetchAppointments = async (isRefresh = false) => {
  if (isRefresh) {
    isRefreshing.value = true;
  } else {
    loading.value = true;
  }

  try {
    const { data } = await useFetch(
      config.public.API_BASE_URL + "/appointment/get_all",
      {
        headers: { Authorization: token.value },
        params: { customer_id: user_info.id },
        transform: (_appointments) => _appointments.data,
        server: false,
        key: isRefresh ? `appointments-${Date.now()}` : "appointments",
      }
    );

    if (data.value) {
      if (appointmentsResponse.value) {
        previousAppointments.value = appointmentsResponse.value;
      }

      appointmentsResponse.value = data.value;
      useRefreshToken();
    }
  } catch (error) {
    console.error("Fetch error:", error);
  } finally {
    loading.value = false;
    isRefreshing.value = false;
  }
};

watch(
  appointmentsResponse,
  (newVal, oldVal) => {
    if (oldVal && newVal !== oldVal) {
      previousAppointments.value = oldVal;
    }
  },
  { deep: true }
);

fetchAppointments();

const refreshAppointments = async () => {
  await fetchAppointments(true);
};

provide("refreshAppointments", refreshAppointments);

const tab = ref(1);
const sort = ref(false);
const filteredAppointments = ref([]);

const displayAppointments = computed(() => {
  const sourceData = appointmentsData.value || [];
  let filtered = [...sourceData];

  if (tab.value === 2) {
    filtered = filtered.filter(
      (appointment) => appointment.type === "Procedimiento"
    );
  } else if (tab.value === 3) {
    filtered = filtered.filter(
      (appointment) => appointment.type === "Valoración"
    );
  }

  return filtered;
});

const applyFilter = (typeFilter, tabNumber) => {
  tab.value = tabNumber;
};

const handleRefresh = async () => {
  await refreshAppointments();
};

provide("handleRefresh", handleRefresh);
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
          <PacientesCitasTable :appointments="appointmentsData" />
        </div>
      </section>
    </main>
  </NuxtLayout>
</template>
