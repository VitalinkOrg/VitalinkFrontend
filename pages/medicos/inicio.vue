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

/*definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});*/
const config = useRuntimeConfig();
const token = useCookie("token");
const role = useCookie("role");
// const user_info = useCookie("user_info");
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

let url;
if (role.value == "R_HOS") {
  url = "/hospital_dashboard/";
} else {
  url = "/doctor_dashboard/";
}

// real function
// const { data: procedures, pending: pendingProcedures } = await useFetch(
//   config.public.API_BASE_URL + url + "count_procedures",
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
//   config.public.API_BASE_URL + url + "history_appointments",
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
    status: "Pendiente",
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
    status: "Completada",
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
    status: "Cancelada",
  },
];
if (appointments) {
  useRefreshToken();
}

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
      backgroundColor: "#3541B4", // Single color for all bars
      borderColor: "#3541B4", // Border color
      borderWidth: 1,
      borderRadius: 10, // Rounded borders
      barPercentage: 0.2, // Adjust the width of the bars
    },
    {
      label: "Citas Completadas", // Second set of bars
      data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)), // Random data for the second set
      backgroundColor: "#0CADBB", // Color for the second set of bars
      borderColor: "#0CADBB", // Border color for the second set
      borderWidth: 1,
      borderRadius: 10, // Rounded borders
      barPercentage: 0.2, // Adjust the width of the bars
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
      align: "start", // Align the legend to the left
      labels: {
        usePointStyle: true, // Use circles instead of squares for the legend
        pointStyle: "circle", // Set the point style to circle
        padding: 20, // Add padding to the legend labels
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false, // Hide grid lines on the x-axis
      },
    },
  },
};

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Colors
);

// Custom plugin to render percentage in the center of the Doughnut chart
// Custom plugin to render percentage in the center of the Doughnut chart
const doughnutCenterTextPlugin = {
  id: "doughnutCenterText",
  afterDraw: (chart) => {
    if (chart.config.type !== "doughnut") {
      return;
    }
    const { ctx } = chart;
    const { width, height } = chart;
    ctx.restore();

    // Get the first dataset's value (assuming only one dataset)
    const value = chart.data.datasets[0].data[0];
    const total = chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
    const percentage = ((value / total) * 100).toFixed(2) + "%";

    // Set font styles for the percentage
    ctx.font = "700 33.877px Arial"; // Font size and weight
    ctx.fillStyle = "#0CADBB"; // Color
    ctx.textAlign = "center"; // Text alignment
    ctx.textBaseline = "middle"; // Vertical alignment
    ctx.fontFeatureSettings = "'liga' off, 'clig' off"; // Font features

    // Draw the percentage text in the center
    ctx.fillText(percentage, width / 2, height - 120); // Adjusted y-position for percentage

    // Set font styles for the "Incremento" label
    ctx.font = "16px Arial"; // Smaller font size for the label
    ctx.fillStyle = "#000000"; // Color for the label (black in this case)

    // Draw the "Incremento" label below the percentage
    ctx.fillText("Incremento", width / 2, height - 90); // Adjusted y-position for label

    ctx.save();
  },
};

ChartJS.register(doughnutCenterTextPlugin);

const doughnutData = {
  labels: ["Valor Único"],
  datasets: [
    {
      label: "Doughnut Chart",
      data: [75, 25], // Example data: 75% and 25%
      backgroundColor: ["#0CADBB", "#C2C6E9"],
    },
  ],
};

const singleValueOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
      position: "top",
    },
    title: {
      display: false,
      text: "Valor Único",
    },
    doughnutCenterText: {
      display: true, // Enable the custom plugin
    },
  },
  circumference: 180, // 180 degrees for a semi-circle
  rotation: -90, // Start from the top
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
        <div class="card border-0 shadow rounded-3 h-100">
          <div class="card-body d-flex align-items-center p-2">
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
            <span class="fw-medium fs-5">Nuevos Pacientes</span>
            <span class="text-muted">Lorem Ipsum</span>
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
        <MedicosCitasTable :appointments="appointments" :useDropdown="false" />
      </div>
    </div>
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
