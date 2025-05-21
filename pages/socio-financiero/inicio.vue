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
  middleware: ["auth-insurances"],
});

const config = useRuntimeConfig();
const token = useCookie("token");

// const { data: vouchers, pending: pendingVouchers } = await useFetch(
//   config.public.API_BASE_URL + "/insurance_dashboard/list_vouchers",
//   {
//     headers: { Authorization: token.value },
//     transform: (_vouchers) => _vouchers.data,
//   },
// );
const vouchers = [
  {
    voucher_id: 1,
    patient_name: "Juan Pérez",
    reason_for_request: "Oftalmología - Cirugía de cataratas",
    status: "Pendiente",
    address: "Calle Falsa 123",
    phone_number: "+506 1234-5678",
    city: "San José",
    postal_code: "10101",
    comment_by_insurance:
      "Se requiere evaluación adicional del especialista antes de aprobar el procedimiento.",
    requested_amount: 1200,
    service_provider: "Hospital CIMA",
    service_cost: 2300,
    provider_phone: "+506 2208-2000",
    provider_address: "San José, Autop. Próspero Fernández, San Rafael",
    patient_message:
      "Solicito un voucher para cubrir la operación de cataratas en ambos ojos, recomendada por mi oftalmólogo para mejorar mi visión.",
  },
  {
    voucher_id: 2,
    patient_name: "María Gómez",
    reason_for_request: "Cardiología - Prueba de esfuerzo",
    status: "Aprobada",
    address: "Avenida Siempre Viva 742",
    phone_number: "+506 8765-4321",
    city: "Cartago",
    postal_code: "20101",
    comment_by_insurance: "Aprobado según cobertura del plan básico.",
    requested_amount: 500,
    service_provider: "Clínica Bíblica",
    service_cost: 750,
    provider_phone: "+506 2522-1000",
    provider_address: "San José, Calle 1, Avenida 14",
    patient_message:
      "Necesito realizar una prueba de esfuerzo como seguimiento a mi condición cardíaca.",
  },
  {
    voucher_id: 3,
    patient_name: "Carlos Rodríguez",
    reason_for_request: "Ortopedia - Reemplazo de cadera",
    status: "Confirmada",
    address: "Boulevard de los Sueños Rotos 456",
    phone_number: "+506 2345-6789",
    city: "Alajuela",
    postal_code: "30101",
    comment_by_insurance: "Procedimiento confirmado para el 15 de noviembre.",
    requested_amount: 3000,
    service_provider: "Hospital Metropolitano",
    service_cost: 4500,
    provider_phone: "+506 2436-1000",
    provider_address: "San José, Lindora, Santa Ana",
    patient_message:
      "Requiero cirugía de reemplazo de cadera debido a artritis severa.",
  },
  {
    voucher_id: 4,
    patient_name: "Ana Fernández",
    reason_for_request: "Dermatología - Remoción de lunar",
    status: "Rechazada",
    address: "Calle de la Amargura 789",
    phone_number: "+506 3456-7890",
    city: "Heredia",
    postal_code: "40101",
    comment_by_insurance:
      "No cumple con los criterios de cobertura para procedimiento cosmético.",
    requested_amount: 800,
    service_provider: "Hospital La Católica",
    service_cost: 1200,
    provider_phone: "+506 2246-3000",
    provider_address: "San José, Guadalupe",
    patient_message:
      "Necesito remover un lunar que ha cambiado de apariencia recientemente.",
  },
  {
    voucher_id: 5,
    patient_name: "Luis Martínez",
    reason_for_request: "Neurología - Resonancia magnética",
    status: "Activo",
    address: "Avenida Central 101",
    phone_number: "+506 4567-8901",
    city: "Puntarenas",
    postal_code: "60101",
    comment_by_insurance:
      "Aprobado con prioridad debido a síntomas reportados.",
    requested_amount: 1500,
    service_provider: "Hospital San Juan de Dios",
    service_cost: 1800,
    provider_phone: "+506 2542-5000",
    provider_address: "San José, Calle 14, Avenida 6",
    patient_message:
      "Presento dolores de cabeza persistentes y el médico recomienda una resonancia.",
  },
];

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

const semiDoughnutData = {
  labels: ["Valor Único"],
  datasets: [
    {
      label: "Doughnut Chart",
      data: [75, 25], // Example data: 75% and 25%
      backgroundColor: ["#0CADBB", "#C2C6E9"],
    },
  ],
};

const semiDoughnutOptions = {
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
  },
  circumference: 180, // 180 degrees for a semi-circle
  rotation: -90, // Start from the top
};
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
      label: "Aprobados",
      data: Array.from(
        { length: 12 },
        () => Math.floor(Math.random() * 50) + 20
      ),
      backgroundColor: "#36A2EB", // Blue for approved
      // No stack → appears as a separate bar
      borderWidth: 1,
      borderRadius: 10, // Rounded borders
      barPercentage: 0.6,
    },
    {
      label: "Pendientes",
      data: Array.from(
        { length: 12 },
        () => Math.floor(Math.random() * 30) + 10
      ),
      backgroundColor: "#FFCE56", // Yellow for pending
      stack: "Stack 1", // Groups with "Cancelados"
      borderWidth: 1,
      borderRadius: 10, // Rounded borders
      barPercentage: 0.6,
    },
    {
      label: "Cancelados",
      data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 20)),
      backgroundColor: "#FF6384", // Red for canceled
      stack: "Stack 1", // Stacks on top of "Pendientes"
      borderWidth: 1,
      borderRadius: 10, // Rounded borders
      barPercentage: 0.6,
    },
  ],
};

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
      labels: {
        usePointStyle: true,
        pointStyle: "rect",
      },
      display: false,
    },
    title: {
      display: false,
      text: "Váuchers por Mes",
    },
    tooltip: {
      mode: "index",
      intersect: false,
    },
  },
  scales: {
    x: {
      stacked: true, // Only stacks datasets with the same 'stack' ID
    },
    y: {
      stacked: true, // No vertical stacking (bars appear side by side)
    },
  },
};
</script>
<template>
  <NuxtLayout name="aseguradoras-dashboard">
    <div v-if="pendingVouchers"></div>
    <div v-else>
      <div class="row mb-3">
        <div class="col">
          <p class="mx-2 d-flex align-items-center justify-content-between">
            <span class="fw-medium fs-5">Solicitudes Activas</span>
            <NuxtLink
              class="btn btn-link text-dark"
              href="/socio-financiero/inicio"
              >Ver Todo
              <AtomsIconsArrowRightIcon />
            </NuxtLink>
          </p>
          <div class="card border-0 shadow rounded-3 h-100">
            <div v-if="vouchers !== null" class="card-body d-flex">
              <div
                class="col text-center align-items-center d-flex justify-content-center"
              >
                <div class="position-relative">
                  <!-- Semi-doughnut chart -->
                  <Doughnut
                    :data="semiDoughnutData"
                    :options="semiDoughnutOptions"
                    width="500"
                    height="500"
                  />

                  <!-- Center text -->
                  <div
                    class="position-absolute start-50 translate-middle text-center"
                    style="top: 70%"
                  >
                    <span class="fs-1 fw-bold text-info">85%</span><br />
                    <span class="text-muted">de solicitudes activas</span>
                  </div>
                </div>
              </div>
              <div
                class="col-auto bg-light d-flex flex-column justify-content-center rounded-4 px-3 py-5"
              >
                <span class="fs-4 text-center">
                  <div>Total de</div>
                  <div class="display-4 fw-bold text-info">
                    {{ vouchers.length }}
                  </div>
                </span>
                <span class="fw-light text-center text-muted fs-4 text-wrap"
                  >Créditos <br />aprobados y <br />
                  confirmados</span
                >
              </div>
            </div>
            <div class="card-body d-flex align-items-center p-5" v-else>
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
            <span class="fw-medium fs-5">Resumen Anual de créditos</span>
            <NuxtLink
              class="btn btn-link text-dark"
              href="/socio-financiero/inicio"
              >Ver Todo
              <AtomsIconsArrowRightIcon />
            </NuxtLink>
          </p>
          <div class="card border-0 shadow rounded-3 h-100">
            <div class="card border-0 shadow rounded-3 h-100">
              <div v-if="vouchers !== null" class="card-body">
                <div
                  class="d-flex align-items-center justify-content-center py-5 bg-light text-muted mb-3"
                >
                  <!-- <span class="py-4"> Chart Goes Here </span> -->
                  <Bar :data="chartData" :options="chartOptions" />
                </div>
                <div class="row">
                  <div class="col">
                    <div
                      class="bg-light p-3 d-flex align-items-center rounded-4"
                    >
                      <span
                        class="fs-4 text-center pe-3 me-3 border-end border-dark text-info"
                      >
                        <div class="text-nowrap fw-medium">Total de</div>
                        <div class="fs-1 fw-bold">{{ vouchers.length }}</div>
                      </span>
                      <span class="fw-semibold text-muted"
                        >Créditos aprobados y confirmados</span
                      >
                    </div>
                  </div>
                  <div class="col-auto d-flex align-items-center">
                    <ul class="list-unstyled m-0">
                      <li class="d-flex align-items-center text-muted">
                        <span
                          class="square me-2"
                          style="background-color: #36a2eb"
                        ></span
                        >Aprobados
                      </li>
                      <li class="d-flex align-items-center text-muted">
                        <span
                          class="square me-2"
                          style="background-color: #ffce56"
                        ></span
                        >Pendientes
                      </li>
                      <li class="d-flex align-items-center text-muted">
                        <span
                          class="square me-2"
                          style="background-color: #ff6384"
                        ></span
                        >Cancelados
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div class="card-body d-flex align-items-center p-5" v-else>
                <AtomsIconsChartVacio />
                <p class="d-flex flex-column align-items-start ms-3">
                  <span class="fw-medium text-muted fs-5"
                    >Aún no tienes actividad en tu tablero</span
                  >
                  <span class="fw-light text-muted"
                    >Muy pronto podrás administrar y verificar tu
                    actividad.</span
                  >
                  <button class="btn btn-primary btn-sm mt-2 rounded-3">
                    Empezar
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <p class="mx-2 d-flex align-items-center justify-content-between">
          <span class="fw-medium fs-5">Historial</span>
          <NuxtLink
            class="btn btn-link text-dark"
            href="/socio-financiero/inicio"
            >Ver Todo
            <AtomsIconsArrowRightIcon />
          </NuxtLink>
        </p>

        <AseguradorasCreditoTable
          v-if="vouchers !== null"
          :vouchers="vouchers"
        />

        <div class="card border-0 shadow rounded-3 py-4 h-100" v-else>
          <div class="card-body d-flex align-items-center p-5">
            <span class="w-50 text-center">
              <AtomsIconsChartVacio />
            </span>
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
    </div>
  </NuxtLayout>
</template>
<style lang="scss" scoped>
.square {
  display: inline-block;
  height: 1rem;
  width: 1rem;
  border-radius: 0.4rem;
}
</style>
