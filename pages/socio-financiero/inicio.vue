<script lang="ts" setup>
import { useAppointmentCredit } from "@/composables/api";
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Colors,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { ref } from "vue";
import { Bar } from "vue-chartjs";
import type { Credit } from "~/types";

definePageMeta({
  middleware: ["auth-insurances"],
});

const { fetchAllAppointmentCredit } = useAppointmentCredit();

const creditsData = ref<Credit[]>([]);
const isLoading = ref<boolean>(false);

const loadAppointmentCredit = async () => {
  try {
    isLoading.value = true;

    const api = fetchAllAppointmentCredit();
    await api.request();

    const response = api.response.value;

    if (response?.data) {
      creditsData.value = response.data;
      useRefreshToken();
    }
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
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

const chartData: ChartData<"bar"> = {
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
    "Nov",
    "Dic",
  ],
  datasets: [
    {
      label: "Aprobados",
      data: Array.from(
        { length: 12 },
        () => Math.floor(Math.random() * 50) + 20
      ),
      backgroundColor: "#D3F2DD",
      borderWidth: 1,
      borderRadius: 10,
      barPercentage: 0.6,
    },
    {
      label: "Pendientes",
      data: Array.from(
        { length: 12 },
        () => Math.floor(Math.random() * 30) + 10
      ),
      backgroundColor: "#FAC6D0",
      stack: "Stack 1",
      borderWidth: 1,
      borderRadius: 10,
      barPercentage: 0.6,
    },
    {
      label: "Cancelados",
      data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 20)),
      backgroundColor: "#FAEDBF",
      stack: "Stack 1",
      borderWidth: 1,
      borderRadius: 10,
      barPercentage: 0.6,
    },
  ],
};

const chartOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: {
        usePointStyle: true,
        pointStyle: "rect",
        color: "#6D758F",
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
      stacked: true,
      ticks: {
        color: "#6D758F",
      },
      grid: {
        display: false,
      },
    },
    y: {
      stacked: true,
      ticks: {
        color: "#6D758F",
      },
      grid: {
        display: false,
      },
    },
  },
};

onMounted(async () => {
  await loadAppointmentCredit();
});
</script>

<template>
  <NuxtLayout name="aseguradoras-dashboard">
    <div v-if="isLoading"></div>
    <div v-else>
      <div class="dashboard">
        <div class="dashboard__row">
          <div class="dashboard__column">
            <div class="section-header">
              <span class="section-header__title">Solicitudes Activas</span>
              <NuxtLink
                class="section-header__link"
                href="/socio-financiero/inicio"
              >
                Ver Todo
                <AtomsIconsArrowRightIcon />
              </NuxtLink>
            </div>

            <div class="card">
              <div
                v-if="creditsData !== null"
                class="card__body card__body--flex"
              >
                <div class="chart-container">
                  <div class="chart-container__wrapper">
                    <UiDoughnutChart
                      :attended-value="50"
                      :total-value="100"
                      center-label="de solicitudes activas"
                      cutout="75%"
                    />
                  </div>
                </div>

                <div class="stats-box">
                  <div class="stats-box__content">
                    <div class="stats-box__label">Total de</div>
                    <div class="stats-box__value">{{ creditsData.length }}</div>
                  </div>
                  <span class="stats-box__description">
                    Créditos <br />aprobados y <br />confirmados
                  </span>
                </div>
              </div>

              <div class="card__body card__body--empty" v-else>
                <AtomsIconsChartVacio />
                <div class="empty-state">
                  <span class="empty-state__title"
                    >Aún no tienes actividad en tu tablero</span
                  >
                  <span class="empty-state__description">
                    Muy pronto podrás administrar y verificar tu actividad.
                  </span>
                  <button class="empty-state__button">Empezar</button>
                </div>
              </div>
            </div>
          </div>

          <div class="dashboard__column">
            <div class="section-header">
              <span class="section-header__title"
                >Resumen Anual de créditos</span
              >
              <NuxtLink
                class="section-header__link"
                href="/socio-financiero/inicio"
              >
                Ver Todo
                <AtomsIconsArrowRightIcon />
              </NuxtLink>
            </div>

            <div class="card">
              <div v-if="creditsData !== null" class="card__body">
                <div class="chart-area">
                  <Bar :data="chartData" :options="chartOptions" />
                </div>

                <div class="summary">
                  <div class="summary__stats">
                    <div class="summary-stats">
                      <div class="summary-stats__total">
                        <div class="summary-stats__label">Total de</div>
                        <div class="summary-stats__value">
                          {{ creditsData.length }}
                        </div>
                      </div>
                      <span class="summary-stats__description">
                        Créditos aprobados y confirmados
                      </span>
                    </div>
                  </div>

                  <div class="summary__legend">
                    <ul class="legend">
                      <li class="legend__item">
                        <span
                          class="legend__square legend__square--approved"
                        ></span>
                        Aprobados
                      </li>
                      <li class="legend__item">
                        <span
                          class="legend__square legend__square--pending"
                        ></span>
                        Pendientes
                      </li>
                      <li class="legend__item">
                        <span
                          class="legend__square legend__square--canceled"
                        ></span>
                        Cancelados
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div class="card__body card__body--empty" v-else>
                <AtomsIconsChartVacio />
                <div class="empty-state">
                  <span class="empty-state__title"
                    >Aún no tienes actividad en tu tablero</span
                  >
                  <span class="empty-state__description">
                    Muy pronto podrás administrar y verificar tu actividad.
                  </span>
                  <button class="empty-state__button">Empezar</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard__history">
          <div class="section-header">
            <span class="section-header__title">Historial</span>
            <NuxtLink
              class="section-header__link"
              href="/socio-financiero/inicio"
            >
              Ver Todo
              <AtomsIconsArrowRightIcon />
            </NuxtLink>
          </div>

          <div v-if="creditsData !== null" class="dashboard__history-table">
            <AseguradorasCreditoTable :credits="creditsData" />
          </div>

          <div class="card card--history" v-else>
            <div class="card__body card__body--empty">
              <span class="empty-state__icon">
                <AtomsIconsChartVacio />
              </span>
              <div class="empty-state">
                <span class="empty-state__title"
                  >Aún no tienes actividad en tu tablero</span
                >
                <span class="empty-state__description">
                  Muy pronto podrás administrar y verificar tu actividad.
                </span>
                <button class="empty-state__button">Empezar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>

  <AseguradorasRegistroOnboarding />
</template>

<style lang="scss" scoped>
.dashboard {
  &__row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }

  &__column {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  &__history {
    display: flex;
    flex-direction: column;
  }

  &__history-table {
    background-color: #fff;
    border: 1px solid rgba(0, 0, 0, 0.125);
    border-radius: 0.25rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 0.5rem 1.5rem;

  &__title {
    font-weight: 600;
    font-size: 18px;
    line-height: 100%;
    letter-spacing: 0px;
    color: #353e5c;
  }

  &__link {
    display: inline-flex;
    align-items: center;
    font-weight: 600;
    font-style: Semi Bold;
    font-size: 13px;
    line-height: 18px;
    letter-spacing: 0;
    text-align: center;
    text-decoration: none;
    color: #6d758f;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.8;
    }
  }
}

.card {
  background-color: #ffffff;
  border: none;
  border-radius: 1rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  flex: 1;
  display: flex;
  flex-direction: column;

  &--history {
    padding: 1.5rem 0;
  }

  &__body {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;

    &--flex {
      display: flex;
      flex-direction: row;
      gap: 1.5rem;
    }

    &--empty {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 5rem;
    }
  }
}

.chart-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  &__wrapper {
    position: relative;
  }

  &__center-text {
    position: absolute;
    top: 70%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
  }

  &__percentage {
    display: block;
    font-size: 3rem;
    font-weight: bold;
    color: #0dcaf0;
  }

  &__label {
    display: block;
    color: #6c757d;
  }
}

.stats-box {
  display: flex;
  justify-content: center;
  flex-direction: column;
  background-color: #f1f3f7;
  border-radius: 1rem;
  padding: 1.5rem;
  max-width: 168px;
  gap: 17px;
  flex: 1;

  &__content {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    @include space-y(17px);
  }

  &__label {
    display: block;
    font-weight: 400;
    font-size: 16.86px;
    line-height: 22.72px;
    letter-spacing: 0px;
    color: #353e5c;
  }

  &__value {
    display: block;
    font-weight: 800;
    font-size: 48px;
    line-height: 22.72px;
    letter-spacing: 0px;
    color: #0cadbb;
  }

  &__description {
    font-weight: 500;
    font-style: Medium;
    font-size: 14px;
    line-height: 20.72px;
    letter-spacing: 0px;
    color: #353e5c;
  }
}

.chart-area {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0;
  color: #6c757d;
  width: 100%;
  flex: 1;
  min-height: 262px;
}

.summary {
  display: flex;
  gap: 1rem;

  &__stats {
    display: flex;
    align-items: center;
  }

  &__legend {
    display: flex;
    align-items: center;
  }
}

.summary-stats {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-radius: 1rem;
  gap: 1.5rem;

  &__total {
    font-size: 1.5rem;
    text-align: center;
    padding-right: 1.5rem;
    border-right: 1px solid #e1e4ed;
    color: #0cadbb;
  }

  &__label {
    white-space: nowrap;
    font-weight: 400;
    font-size: 14px;
    line-height: 22.72px;
    letter-spacing: 0px;
  }

  &__value {
    font-weight: 800;
    font-size: 32px;
    line-height: 22.72px;
    letter-spacing: 0px;
    text-align: center;
  }

  &__description {
    max-width: 141px;
    font-weight: 500;
    font-style: Medium;
    font-size: 13px;
    line-height: 19.72px;
    letter-spacing: 0px;
    color: #353e5c;
  }
}

.legend {
  list-style: none;
  margin: 0;
  padding: 0;

  &__item {
    display: flex;
    align-items: center;
    color: #6d758f;
    margin-bottom: 8px;
    font-weight: 500;
    font-style: Medium;
    font-size: 13px;
    line-height: 14.72px;
    letter-spacing: 0px;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__square {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border-radius: 0.375rem;
    margin-right: 0.5rem;

    &--approved {
      background-color: #d3f2dd;
    }

    &--pending {
      background-color: #fac6d0;
    }

    &--canceled {
      background-color: #faedbf;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 1.5rem;

  &__icon {
    width: 50%;
    text-align: center;
  }

  &__title {
    font-weight: 500;
    color: #353e5c;
    font-size: 1.25rem;
  }

  &__description {
    font-weight: 300;
    color: #6c757d;
    margin-top: 0.5rem;
  }

  &__button {
    background-color: #0d6efd;
    color: #ffffff;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.75rem;
    margin-top: 0.5rem;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #0a58ca;
    }
  }
}

/* ========================================
   RESPONSIVE DESIGN
   ======================================== */

/* Tablets grandes y laptops pequeñas (1024px - 1200px) */
@media (max-width: 1200px) {
  .summary-stats {
    padding: 1rem;
    gap: 1rem;

    &__total {
      padding-right: 1rem;
    }

    &__value {
      font-size: 28px;
    }

    &__description {
      font-size: 12px;
      line-height: 18px;
    }
  }

  .stats-box {
    max-width: 150px;
    padding: 1.25rem;

    &__value {
      font-size: 42px;
    }
  }
}

/* Tablets (768px - 1024px) */
@media (max-width: 1024px) {
  .dashboard {
    &__row {
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }
  }

  .section-header {
    margin: 0 0.25rem 1.25rem;

    &__title {
      font-size: 16px;
    }

    &__link {
      font-size: 12px;
    }
  }

  .card__body {
    padding: 1.25rem;

    &--flex {
      gap: 1.25rem;
    }
  }

  .chart-area {
    min-height: 220px;
  }

  .summary {
    flex-direction: column;
    gap: 1rem;
  }

  .summary-stats {
    flex-direction: row;
    justify-content: center;

    &__total {
      border-right: 1px solid #e1e4ed;
      border-bottom: none;
      padding-right: 1rem;
      padding-bottom: 0;
      margin-right: 0;
      margin-bottom: 0;
    }
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;

    &__item {
      margin-bottom: 0;
    }
  }
}

/* Móviles grandes (576px - 768px) */
@media (max-width: 768px) {
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
    margin: 0 0.25rem 1rem;

    &__title {
      font-size: 16px;
    }

    &__link {
      align-self: flex-end;
    }
  }

  .card {
    border-radius: 0.75rem;

    &__body {
      padding: 1rem;

      &--flex {
        flex-direction: column;
        gap: 1rem;
      }

      &--empty {
        padding: 3rem 1.5rem;
        flex-direction: column;
        text-align: center;
      }
    }
  }

  .chart-container {
    &__wrapper {
      max-width: 200px;
      margin: 0 auto;
    }
  }

  .stats-box {
    max-width: 100%;
    padding: 1rem;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;

    &__content {
      margin-bottom: 0;
    }

    &__value {
      font-size: 36px;
    }

    &__description {
      text-align: right;
      br {
        display: none;
      }
    }
  }

  .chart-area {
    min-height: 180px;
    padding: 0.5rem 0;
  }

  .summary {
    gap: 0.75rem;
  }

  .summary-stats {
    flex-direction: column;
    padding: 1rem;
    gap: 1rem;
    text-align: center;

    &__total {
      border-right: none;
      border-bottom: 1px solid #e1e4ed;
      padding-right: 0;
      padding-bottom: 1rem;
      margin-right: 0;
      margin-bottom: 0;
    }

    &__value {
      font-size: 28px;
    }

    &__description {
      max-width: 100%;
    }
  }

  .legend {
    padding: 0.5rem;
  }

  .empty-state {
    align-items: center;
    margin-left: 0;
    margin-top: 1rem;

    &__icon {
      width: 100%;
    }

    &__title {
      font-size: 1.1rem;
      text-align: center;
    }

    &__description {
      text-align: center;
    }

    &__button {
      margin-top: 1rem;
    }
  }

  .dashboard__history-table {
    overflow-x: auto;
  }
}

/* Móviles pequeños (hasta 576px) */
@media (max-width: 576px) {
  .dashboard {
    &__row {
      gap: 1rem;
    }
  }

  .section-header {
    margin: 0 0 0.75rem;

    &__title {
      font-size: 15px;
    }

    &__link {
      font-size: 11px;
    }
  }

  .card {
    &__body {
      padding: 0.875rem;

      &--empty {
        padding: 2rem 1rem;
      }
    }
  }

  .stats-box {
    flex-direction: column;
    align-items: flex-start;
    padding: 0.875rem;

    &__value {
      font-size: 32px;
    }

    &__label {
      font-size: 14px;
    }

    &__description {
      text-align: left;
      font-size: 13px;
    }
  }

  .summary-stats {
    padding: 0.875rem;

    &__value {
      font-size: 24px;
    }

    &__label {
      font-size: 13px;
    }

    &__description {
      font-size: 12px;
      line-height: 18px;
    }
  }

  .legend {
    flex-direction: column;
    gap: 0.5rem;

    &__item {
      font-size: 12px;
    }
  }

  .empty-state {
    &__title {
      font-size: 1rem;
    }

    &__description {
      font-size: 0.875rem;
    }

    &__button {
      padding: 0.5rem 1.25rem;
      font-size: 0.813rem;
    }
  }

  .chart-area {
    min-height: 160px;
  }
}

/* Móviles muy pequeños (hasta 375px) */
@media (max-width: 375px) {
  .section-header {
    &__title {
      font-size: 14px;
    }
  }

  .stats-box {
    &__value {
      font-size: 28px;
    }

    &__label,
    &__description {
      font-size: 12px;
    }
  }

  .summary-stats {
    &__value {
      font-size: 22px;
    }

    &__label,
    &__description {
      font-size: 11px;
    }
  }

  .chart-area {
    min-height: 140px;
  }

  .empty-state {
    &__title {
      font-size: 0.938rem;
    }

    &__description {
      font-size: 0.813rem;
    }
  }
}
</style>
