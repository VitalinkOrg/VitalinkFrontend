<script setup>
import { Bar, Doughnut } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Colors,
} from "chart.js";

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

// real function
// const { data: procedures, pending: pendingProcedures } = await useFetch(
//   "https://stg.vitalink.cr" + url + "count_procedures",
//   {
//     headers: { Authorization: token.value },
//     transform: (_procedures) => _procedures.data[0],
//   }
// );
const procedures = {
  pending_appointments: 10,
  completed_appointments: 2,
  reviews_count: 8,
  unique_service_codes_count: 4,
};

// original function
// const { data: appointments, loading } = await useFetch(
//   "https://stg.vitalink.cr" + url + "history_appointments",
//   {
//     headers: { Authorization: token.value },
//     transform: (_appointments) => _appointments.data,
//   },
// );
const appointments = [
  {
    id: 1,
    patient_name: "Juan Perez",
    date: "2023-10-01",
    time_from: "10:00",
    time_to: "11:00",
    service_name: "Consulta General",
    patient_address: "Calle Falsa 123",
    code: "ABC123",
    status: "PENDING",
  },
  {
    id: 2,
    patient_name: "Maria Lopez",
    date: "2023-10-02",
    time_from: "12:00",
    time_to: "13:00",
    service_name: "Odontología",
    patient_address: "Avenida Siempre Viva 742",
    code: "DEF456",
    status: "COMPLETED",
  },
  {
    id: 3,
    patient_name: "Carlos Sanchez",
    date: "2023-10-03",
    time_from: "14:00",
    time_to: "15:00",
    service_name: "Cardiología",
    patient_address: "Calle Luna 456",
    code: "GHI789",
    status: "CANCELED",
  },
];
if (appointments) {
  useRefreshToken();
}

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Colors,
);
const chartData = {
  labels: [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ],
  datasets: [
    {
      label: "Citas por Mes",
      data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)),
      backgroundColor: [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
      ],
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Citas por Mes",
    },
  },
};

const doughnutData = {
  labels: ["Valor Único"],
  datasets: [
    {
      label: "Doughnut Chart",
      data: [100],
      backgroundColor: ["#FF6384"],
    },
  ],
};

const singleValueOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: true,
      text: "Valor Único",
    },
  },
};
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
            <!-- <AtomsIconsChartVacio /> -->
            <!-- <p class="d-flex flex-column align-items-start ms-3"> -->
            <!--   <span class="fw-medium text-muted fs-5" -->
            <!--     >Aún no tienes actividad en tu tablero</span -->
            <!--   > -->
            <!--   <span class="fw-light text-muted" -->
            <!--     >Muy pronto podrás administrar y verificar tu actividad.</span -->
            <!--   > -->
            <!--   <button class="btn btn-primary btn-sm mt-2 rounded-3"> -->
            <!--     Empezar -->
            <!--   </button> -->
            <!-- </p> -->
            <Bar :data="chartData" :options="chartOptions" />
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
            <!-- <span class="w-75 mx-auto"> -->
            <!--   <AtomsIconsChartVacio /> -->
            <!-- </span> -->
            <!-- <p class="d-flex flex-column align-items-start ms-3"> -->
            <!--   <span class="fw-medium text-muted fs-6" -->
            <!--     >Aún no tienes actividad en tu tablero</span -->
            <!--   > -->
            <!--   <span class="fw-light text-muted fs-6" -->
            <!--     >Muy pronto podrás administrar y verificar tu actividad.</span -->
            <!--   > -->
            <!--   <button class="btn btn-primary btn-sm mt-2 rounded-3 mx-auto"> -->
            <!--     Empezar -->
            <!--   </button> -->
            <!-- </p> -->
            <Doughnut :data="doughnutData" :options="singleValueOptions" />
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
