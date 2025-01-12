<script setup>
import { Bar } from "vue-chartjs";
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
    code: "001",
    patient_name: "Juan Pérez",
    insurance_number: "123456",
    reason_for_request: "Consulta General",
    due_date: "2023-12-31",
    status: "Activo",
    address: "Calle Falsa 123",
    phone_number: "+506 1234-5678",
    city: "San José",
    postal_code: "1000",
    comment_by_insurance: "Aprobado",
  },
  {
    voucher_id: 2,
    code: "002",
    patient_name: "María Gómez",
    insurance_number: "654321",
    reason_for_request: "Examen de Sangre",
    due_date: "2023-11-30",
    status: "Vencido",
    address: "Avenida Siempre Viva 742",
    phone_number: "+506 8765-4321",
    city: "Cartago",
    postal_code: "2000",
    comment_by_insurance: "Rechazado",
  },
  {
    voucher_id: 3,
    code: "003",
    patient_name: "Carlos Rodríguez",
    insurance_number: "789012",
    reason_for_request: "Radiografía",
    due_date: "2023-10-15",
    status: "Pendiente",
    address: "Boulevard de los Sueños Rotos 456",
    phone_number: "+506 2345-6789",
    city: "Alajuela",
    postal_code: "3000",
    comment_by_insurance: "En revisión",
  },
  {
    voucher_id: 4,
    code: "004",
    patient_name: "Ana Fernández",
    insurance_number: "345678",
    reason_for_request: "Cirugía",
    due_date: "2023-09-20",
    status: "Aprobado",
    address: "Calle de la Amargura 789",
    phone_number: "+506 3456-7890",
    city: "Heredia",
    postal_code: "4000",
    comment_by_insurance: "Aprobado con condiciones",
  },
  {
    voucher_id: 5,
    code: "005",
    patient_name: "Luis Martínez",
    insurance_number: "901234",
    reason_for_request: "Terapia Física",
    due_date: "2023-08-25",
    status: "Rechazado",
    address: "Avenida Central 101",
    phone_number: "+506 4567-8901",
    city: "Puntarenas",
    postal_code: "5000",
    comment_by_insurance: "Falta documentación",
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
</script>
<template>
  <NuxtLayout name="aseguradoras-dashboard">
    <div v-if="pendingVouchers"></div>
    <div v-else>
      <div class="row mb-3">
        <div class="col">
          <p class="mx-2 d-flex align-items-center justify-content-between">
            <span class="fw-medium fs-5">Váuchers Activos</span>
            <NuxtLink class="btn btn-link text-dark" href="/aseguradoras/inicio"
              >Ver Todo
              <AtomsIconsArrowRightIcon />
            </NuxtLink>
          </p>
          <div class="card border-0 shadow rounded-3 h-100">
            <div v-if="vouchers !== null" class="card-body d-flex">
              <div
                class="col text-center align-items-center d-flex justify-content-center"
              >
                <div class="d-flex flex-column">
                  <span class="fs-1 fw-bold text-primary">85%</span>
                  <span class="fs-4 text-muted"
                    >de váuchers <br />
                    activos</span
                  >
                </div>
              </div>
              <div
                class="col-auto bg-light d-flex flex-column rounded-4 px-3 py-5"
              >
                <span class="fs-4">
                  <div>Total de</div>
                  <div class="display-4 fw-bold text-info">
                    {{ vouchers.length }}
                  </div>
                </span>
                <span class="fw-light text-muted fs-4 text-wrap"
                  >Vauchers <br />generados y <br />
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
            <span class="fw-medium fs-5">Resumen Anual de Váuchers</span>
            <NuxtLink class="btn btn-link text-dark" href="/aseguradoras/inicio"
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
                        >Vauchers generados y confirmados</span
                      >
                    </div>
                  </div>
                  <div class="col-auto d-flex align-items-center">
                    <ul class="list-unstyled m-0">
                      <li class="d-flex align-items-center text-muted">
                        <span class="square me-2 bg-primary"></span>Utilizados
                      </li>
                      <li class="d-flex align-items-center text-muted">
                        <span class="square me-2 bg-info"></span>Vauchers de
                        aprobación
                      </li>
                      <li class="d-flex align-items-center text-muted">
                        <span class="square me-2 bg-warning"></span>Cancelados
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
          <NuxtLink class="btn btn-link text-dark" href="/aseguradoras/inicio"
            >Ver Todo
            <AtomsIconsArrowRightIcon />
          </NuxtLink>
        </p>
        <div
          class="table-responsive card border-0 py-4 rounded-3 shadow"
          v-if="vouchers !== null"
        >
          <table class="table fw-light">
            <thead>
              <tr>
                <th scope="col" class="text-muted">Código</th>
                <th scope="col" class="text-muted">Nombre del asegurado</th>
                <th scope="col" class="text-muted">Nº de Asegurado</th>
                <th scope="col" class="text-muted">Procedimiento</th>
                <th scope="col" class="text-muted">Vencimiento</th>
                <th scope="col" class="text-muted">Estado</th>
                <th scope="col" class="text-muted"></th>
              </tr>
            </thead>

            <tbody>
              <AseguradorasVaucherTableItem
                v-for="voucher in vouchers"
                :key="voucher.voucher_id"
                :voucher="voucher"
              />
            </tbody>
          </table>
        </div>
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
