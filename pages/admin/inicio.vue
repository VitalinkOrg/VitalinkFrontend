<script setup>
import { Bar, Doughnut, Line } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  LineElement, // Add this
  PointElement, // Add this
  CategoryScale,
  LinearScale,
  Colors,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  LineElement, // Register this
  PointElement, // Register this
  CategoryScale,
  LinearScale,
  Colors
);

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

// Add this in your script setup section
const itemsDoughnutData = {
  labels: ["Item 1", "Item 2", "Item 3"],
  datasets: [
    {
      data: [3124213, 1523151, 948213], // Actual values from your items
      backgroundColor: ["#3541B4", "#0CADBB", "#C2C6E9"],
      borderWidth: 0,
    },
  ],
};

const itemsDoughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // We'll use our custom legend
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          return `${context.label}: ${context.raw.toLocaleString()}`;
        },
      },
    },
  },
  cutout: "70%",
};

const userListData = {
  items: [
    { name: "Item 1", value: "3,124,213" },
    { name: "Item 2", value: "1,523,151" },
    { name: "Item 3", value: "948,213" },
  ],
};

// Update the chart data to match the image
const chartData = {
  labels: ["Verso", "Volt", "Mgr", "Avg", "Mgr", "Avg", "Avg", "Avg", "Gas"],
  datasets: [
    {
      label: "Utilizados",
      data: [120, 190, 90, 150, 120, 160, 140, 100, 110],
      backgroundColor: "#3541B4",
      borderColor: "#3541B4",
      borderWidth: 1,
      borderRadius: 10,
      barPercentage: 0.5,
    },
    {
      label: "Vauchers de aprobación",
      data: [80, 120, 70, 100, 90, 120, 100, 80, 90],
      backgroundColor: "#0CADBB",
      borderColor: "#0CADBB",
      borderWidth: 1,
      borderRadius: 10,
      barPercentage: 0.5,
    },
    {
      label: "Cancelados",
      data: [40, 70, 40, 50, 30, 40, 40, 20, 20],
      backgroundColor: "#C2C6E9",
      borderColor: "#C2C6E9",
      borderWidth: 1,
      borderRadius: 10,
      barPercentage: 0.5,
    },
  ],
};

// Update chart options
const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "bottom",
      align: "center",
      labels: {
        usePointStyle: true,
        pointStyle: "circle",
        padding: 20,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        display: true,
      },
    },
  },
};

const lineChartData = {
  labels: [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
  ],
  datasets: [
    {
      label: "Ventas",
      data: [1800, 1900, 2100, 2200, 2300, 2400, 2600, 2500, 2678, 2700],
      borderColor: "#3541B4",
      backgroundColor: "rgba(53, 65, 180, 0.1)",
      borderWidth: 2,
      tension: 0.4,
      fill: true,
      pointBackgroundColor: "#3541B4",
      pointBorderColor: "#fff",
      pointBorderWidth: 2,
      pointRadius: 5, // Increase point size
      pointHoverRadius: 7, // Slightly larger on hover
      pointHitRadius: 10, // Makes it easier to hover
    },
  ],
};

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      mode: "index",
      intersect: false,
    },
  },
  scales: {
    x: {
      display: false,
      grid: {
        display: false,
      },
    },
    y: {
      display: false,
      grid: {
        display: true,
      },
      beginAtZero: false,
    },
  },
  elements: {
    line: {
      tension: 0.4, // Smooth line
    },
  },
};
</script>
<template>
  <NuxtLayout name="admin-dashboard">
    <span class="fw-medium fs-5">Números Generales</span>
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
            <span class="icon-indicator bg-primary-subtle text-primary">
              <Icon name="material-symbols-light:bar-chart-4-bars" />
            </span>
            <p class="d-flex flex-column ms-3 mb-0">
              <span class="fs-5 fw-semibold">{{
                procedures.pending_appointments
              }}</span>
              <small class="text-muted">Ingresos Generados</small>
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
            <span class="icon-indicator bg-primary-subtle text-primary">
              <Icon name="fa6-solid:user" />
            </span>
            <p class="d-flex flex-column ms-3 mb-0">
              <span class="fs-5 fw-semibold">{{
                procedures.completed_appointments
              }}</span>
              <small class="text-muted">Nuevos Usuarios</small>
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
            <span class="icon-indicator bg-primary-subtle text-primary">
              <Icon name="material-symbols:home-work-rounded" />
            </span>
            <p class="d-flex flex-column ms-3 mb-0">
              <span class="fs-5 fw-semibold">{{
                procedures.reviews_count
              }}</span>
              <small class="text-muted">Nuevos Proveedores</small>
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
            <span class="icon-indicator bg-primary-subtle text-primary">
              <Icon name="material-symbols:home-work-rounded" />
            </span>
            <p class="d-flex flex-column ms-3 mb-0">
              <span class="fs-5 fw-semibold">{{
                procedures.unique_service_codes_count
              }}</span>
              <small class="text-muted">Nuevos Proveedores</small>
            </p>
          </div>
        </div>
      </div>
    </div>

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
            <span class="icon-indicator bg-primary-subtle text-primary">
              <Icon name="teenyicons:receipt-solid" />
            </span>
            <p class="d-flex flex-column ms-3 mb-0">
              <span class="fs-5 fw-semibold">{{
                procedures.pending_appointments
              }}</span>
              <small class="text-muted">Creditos Utilizados</small>
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
            <span class="icon-indicator bg-primary-subtle text-primary">
              <Icon name="mdi:star-shooting" />
            </span>
            <p class="d-flex flex-column ms-3 mb-0">
              <span class="fs-5 fw-semibold">{{
                procedures.completed_appointments
              }}</span>
              <small class="text-muted">Total de reseñas</small>
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
            <span class="icon-indicator bg-primary-subtle text-primary">
              <Icon name="material-symbols-light:book-ribbon" />
            </span>
            <p class="d-flex flex-column ms-3 mb-0">
              <span class="fs-5 fw-semibold">{{
                procedures.reviews_count
              }}</span>
              <small class="text-muted">Total de reclamos</small>
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
            <span class="icon-indicator bg-primary-subtle text-primary">
              <Icon name="material-symbols:home-work-rounded" />
            </span>
            <p class="d-flex flex-column ms-3 mb-0">
              <span class="fs-5 fw-semibold">{{
                procedures.unique_service_codes_count
              }}</span>
              <small class="text-muted">Nuevas Solicitudes</small>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-sm-8">
        <p class="mx-2 d-flex align-items-center justify-content-between">
          <span class="fw-medium fs-5">Listado de Usuarios</span>
          <NuxtLink class="btn btn-link text-dark" href="#">
            Ver Todo →
          </NuxtLink>
        </p>
        <div class="card border-0 shadow rounded-3 h-100">
          <div class="card-body">
            <div
              class="row d-flex justify-content-center align-items-center h-100"
            >
              <!-- Left side - Doughnut chart -->
              <div
                class="col-md-6 d-flex flex-column align-items-center justify-content-center"
              >
                <div style="position: relative; width: 500px; height: 500px">
                  <Doughnut
                    :data="itemsDoughnutData"
                    :options="itemsDoughnutOptions"
                  />
                  <div
                    class="position-absolute top-50 start-50 translate-middle text-center"
                  >
                    <span class="fs-3 fw-bold text-xl">+80</span><br />
                    <span class="text-muted text-xl">Usuarios</span>
                  </div>
                </div>
                <!-- Right side - User stats -->
                <div class="col-md-6 mt-2">
                  <div
                    class="d-flex flex-row gap-4 h-100 justify-content-center"
                  >
                    <div class="mb-3">
                      <div class="d-flex align-items-center mb-2">
                        <span class="bullet bg-primary me-2"></span>
                        <span class="small">Item 1</span>
                      </div>
                      <h4 class="fw-bold">3,124,213</h4>
                    </div>
                    <div class="mb-3">
                      <div class="d-flex align-items-center mb-2">
                        <span class="bullet bg-info me-2"></span>
                        <span class="small">Item 2</span>
                      </div>
                      <h4 class="fw-bold">1,523,151</h4>
                    </div>
                    <div class="mb-3">
                      <div class="d-flex align-items-center mb-2">
                        <span class="bullet bg-secondary me-2"></span>
                        <span class="small">Item 3</span>
                      </div>
                      <h4 class="fw-bold">948,213</h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col">
        <p class="mx-2 d-flex align-items-center justify-content-between">
          <span class="fw-medium fs-5">Órdenes generadas por mes</span>
          <NuxtLink class="btn btn-link text-dark" href="#">
            Ver Todo →
          </NuxtLink>
        </p>
        <div class="card border-0 shadow rounded-3 mb-3">
          <div class="card-body">
            <Bar :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <p class="mx-2 d-flex align-items-center justify-content-between">
          <span class="fw-medium fs-5">Resumen de informes</span>
          <NuxtLink class="btn btn-link text-dark" href="#">
            Ver Todo →
          </NuxtLink>
        </p>
        <div class="card border-0 shadow rounded-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <div>
                <span class="text-muted">Ventas</span>
                <h3 class="fw-bold mb-0">2,678</h3>
              </div>
            </div>

            <div style="height: 200px; position: relative">
              <Line :data="lineChartData" :options="lineChartOptions" />
            </div>

            <div class="d-flex justify-content-between mt-2 text-muted small">
              <span>Ene</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Abr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Ago</span>
              <span>Sep</span>
              <span>Oct</span>
            </div>
          </div>
        </div>
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

.card {
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
  }
}

// Add this for the user list items
.border-primary {
  border-color: var(--bs-primary) !important;
}

// Make sure cards have consistent height
.h-100 {
  height: 100% !important;
}

// Add some spacing between sections
.mb-3 {
  margin-bottom: 1rem !important;
}

.mb-4 {
  margin-bottom: 1.5rem !important;
}

// Style for the "Ver Todo" link
.btn-link {
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}

.user-list-container {
  display: flex;
  align-items: center;
}

.user-list-chart {
  flex: 0 0 40%;
  max-width: 40%;
  position: relative;
  height: 200px;
}

.user-list-stats {
  flex: 0 0 60%;
  max-width: 60%;
  padding-left: 1.5rem;
}

// Make sure the chart container has proper height
.chart-container {
  position: relative;
  height: 200px;
  width: 100%;
}

// Adjust the doughnut chart size
.doughnut-chart {
  max-height: 180px;
  max-width: 180px;
  margin: 0 auto;
}

.bullet {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
</style>
