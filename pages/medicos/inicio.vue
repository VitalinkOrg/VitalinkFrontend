<script setup>
definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});
const config = useRuntimeConfig();
const token = useCookie("token");
const role = useCookie("role");
const user_info = useCookie("user_info");

let url;
if (role.value == "R_HOS") {
  url = "/hospital_dashboard/";
} else {
  url = "/doctor_dashboard/";
}

const { data: procedures, pending: pendingProcedures } = await useFetch(
  config.public.API_BASE_URL + url + "count_procedures",
  {
    headers: { Authorization: token.value },
    transform: (_procedures) => _procedures.data[0],
  }
);

const { data: appointments, loading } = await useFetch(
  config.public.API_BASE_URL + url + "history_appointments",
  {
    headers: { Authorization: token.value },
    transform: (_appointments) => _appointments.data,
  }
);
if (appointments) {
  useRefreshToken();
}
</script>
<template>
  <NuxtLayout name="medicos-dashboard">
    <div class="row row-cols-4 mb-3">
      <div class="col">
        <!-- Citas Pendientes  -->
        <!-- Vacio  -->
        <div
          v-if="procedures.pending_appointments == 0"
          class="card rounded-3 border-0 shadow-sm"
        >
          <div class="card-body d-flex align-items-center px-1">
            <AtomsIconsNoActivityIcon />
            <p class="d-flex flex-column ms-3 mb-0">
              Aún no tienes actividad
              <button class="btn btn-primary btn-sm mt-2 rounded-3">
                Empezar
              </button>
            </p>
          </div>
        </div>
        <!-- con Data  -->
        <div v-else class="card rounded-3 border-0 shadow-sm">
          <div class="card-body d-flex align-items-center">
            <!-- <AtomsIconsNoActivityIcon /> -->
            <span class="icon-indicator bg-warning-subtle text-warning">
              <Icon name="fa6-solid:address-book" />
            </span>
            <p class="d-flex flex-column ms-3 mb-0">
              <span class="fs-5 fw-semibold">{{
                procedures.pending_appointments
              }}</span>
              <small class="text-muted">Citas Pendientes</small>
            </p>
          </div>
        </div>
      </div>
      <div class="col">
        <!-- Pacientes Atendidos  -->
        <div
          v-if="procedures.completed_appointments == 0"
          class="card rounded-3 border-0 shadow-sm"
        >
          <div class="card-body d-flex align-items-center px-1">
            <AtomsIconsNoActivityIcon />
            <p class="d-flex flex-column ms-3 mb-0">
              Aún no tienes actividad
              <button class="btn btn-primary btn-sm mt-2 rounded-3">
                Empezar
              </button>
            </p>
          </div>
        </div>
        <!-- con Data  -->
        <div v-else class="card rounded-3 border-0 shadow-sm">
          <div class="card-body d-flex align-items-center">
            <!-- <AtomsIconsNoActivityIcon /> -->
            <span class="icon-indicator bg-warning-subtle text-warning">
              <Icon name="ic:round-favorite" />
            </span>
            <p class="d-flex flex-column ms-3 mb-0">
              <span class="fs-5 fw-semibold">{{
                procedures.completed_appointments
              }}</span>
              <small class="text-muted">Pacientes Atendidos</small>
            </p>
          </div>
        </div>
      </div>
      <div class="col">
        <!-- Reseñas Recibidas  -->
        <div
          v-if="procedures.reviews_count == 0"
          class="card rounded-3 border-0 shadow-sm"
        >
          <div class="card-body d-flex align-items-center px-1">
            <AtomsIconsNoActivityIcon />
            <p class="d-flex flex-column ms-3 mb-0">
              Aún no tienes actividad
              <button class="btn btn-primary btn-sm mt-2 rounded-3">
                Empezar
              </button>
            </p>
          </div>
        </div>
        <!-- con Data  -->
        <div v-else class="card rounded-3 border-0 shadow-sm">
          <div class="card-body d-flex align-items-center">
            <!-- <AtomsIconsNoActivityIcon /> -->
            <span class="icon-indicator bg-warning-subtle text-warning">
              <Icon name="mdi:star-shooting" />
            </span>
            <p class="d-flex flex-column ms-3 mb-0">
              <span class="fs-5 fw-semibold">{{
                procedures.reviews_count
              }}</span>
              <small class="text-muted">Reseñas Recibidas</small>
            </p>
          </div>
        </div>
      </div>
      <div class="col">
        <!-- Procedimientos  -->
        <div
          v-if="procedures.unique_service_codes_count == 0"
          class="card rounded-3 border-0 shadow-sm"
        >
          <div class="card-body d-flex align-items-center px-1">
            <AtomsIconsNoActivityIcon />
            <p class="d-flex flex-column ms-3 mb-0">
              Aún no tienes actividad
              <button class="btn btn-primary btn-sm mt-2 rounded-3">
                Empezar
              </button>
            </p>
          </div>
        </div>
        <!-- con Data  -->
        <div v-else class="card rounded-3 border-0 shadow-sm">
          <div class="card-body d-flex align-items-center">
            <!-- <AtomsIconsNoActivityIcon /> -->
            <span class="icon-indicator bg-warning-subtle text-warning">
              <Icon name="ph:calendar-plus-fill" />
            </span>
            <p class="d-flex flex-column ms-3 mb-0">
              <span class="fs-5 fw-semibold">{{
                procedures.unique_service_codes_count
              }}</span>
              <small class="text-muted">Procedimientos</small>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-sm-8">
        <p class="mx-2 d-flex align-items-center justify-content-between">
          <span class="fw-medium fs-5">Próximas Citas</span>
          <NuxtLink class="btn btn-link text-dark" href="/medicos/citas"
            >Ver Todo
            <AtomsIconsArrowRightIcon />
          </NuxtLink>
        </p>
        <div class="card border-0 shadow rounded-3 py-5 h-100">
          <div class="card-body d-flex align-items-center p-5">
            <AtomsIconsChartVacio />
            <p class="d-flex flex-column align-items-start ms-3">
              <span class="fw-medium text-muted fs-5"
                >Aún no tienes actividad en tu tablero</span
              >
              <span class="fw-light text-muted"
                >Muy pronto podrás administrar y verificar tu actividad.</span
              >
              <button class="btn btn-primary btn-sm mt-2 rounded-3">
                Empezar
              </button>
            </p>
          </div>
        </div>
      </div>
      <div class="col">
        <p class="mx-2 d-flex align-items-center justify-content-between">
          <span class="fw-medium fs-5">Pacientes</span>
          <NuxtLink class="btn btn-link text-dark" href="/medicos/pacientes"
            >Ver Todo
            <AtomsIconsArrowRightIcon />
          </NuxtLink>
        </p>
        <div class="card border-0 shadow rounded-3 h-100">
          <div class="card-body d-flex flex-column text-center p-5">
            <span class="w-75 mx-auto">
              <AtomsIconsChartVacio />
            </span>
            <p class="d-flex flex-column align-items-start ms-3">
              <span class="fw-medium text-muted fs-6"
                >Aún no tienes actividad en tu tablero</span
              >
              <span class="fw-light text-muted fs-6"
                >Muy pronto podrás administrar y verificar tu actividad.</span
              >
              <button class="btn btn-primary btn-sm mt-2 rounded-3 mx-auto">
                Empezar
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <p class="mx-2 d-flex align-items-center justify-content-between">
        <span class="fw-medium fs-5">Historial</span>
        <NuxtLink class="btn btn-link text-dark" href="/medicos/citas"
          >Ver Todo
          <AtomsIconsArrowRightIcon />
        </NuxtLink>
      </p>
      <div>
        <MedicosCitasTable :appointments="appointments" />
      </div>
    </div>
    <MedicosOnboardingModal :data="user_info" />
  </NuxtLayout>
</template>

<style scoped lang="scss">
.icon-indicator {
  height: 3rem;
  width: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50rem;
  font-size: 1.5rem;
}
</style>
