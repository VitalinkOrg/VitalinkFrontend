<script lang="ts" setup>
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
import { Bar, Doughnut } from "vue-chartjs";
import type { Appointment, Supplier } from "~/types";

definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});

const config = useRuntimeConfig();
const token = useCookie("token");
const role = useCookie("role");
const { formatNumber } = useFormat();

interface Procedures {
  pending_appointments: number;
  completed_appointments: number;
  reviews_count: number;
  unique_service_codes_count: number;
}

const appointmentsData = ref<Appointment[]>([]);
const procedures = ref<Procedures>({
  pending_appointments: 0,
  completed_appointments: 0,
  reviews_count: 0,
  unique_service_codes_count: 0,
});
const appointments = ref<Appointment[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const user_info = ref<Supplier | null>(null);

const selectedTimeFilter = ref("30");
const timeFilterOptions = [
  { value: "7", label: "Últimos 7 días" },
  { value: "30", label: "Últimos 30 días" },
  { value: "60", label: "Últimos 60 días" },
  { value: "90", label: "Últimos 90 días" },
];
const isDropdownOpen = ref(false);

const loadDashboardData = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const response = await $fetch<{ data: Appointment[] }>(
      config.public.API_BASE_URL + "/appointment/get_all",
      {
        headers: { Authorization: token.value ?? "" },
        params: { customer_id: user_info.value?.id },
      }
    );

    const appointmentsList = response.data || [];

    const pendingStatuses = new Set([
      "PENDING_VALORATION_APPOINTMENT",
      "PENDING_PROCEDURE",
      "CONFIRM_VALIDATION_APPOINTMENT",
      "CONFIRM_PROCEDURE",
      "WAITING_PROCEDURE",
    ]);

    const completedStatuses = new Set([
      "CONCRETED_APPOINTMENT",
      "VALUED_VALORATION_APPOINTMENT",
    ]);

    let pending = 0;
    let completed = 0;
    let reviewed = 0;
    const uniqueProcedures = new Set<string>();

    appointmentsList.forEach((apt) => {
      const status = apt.appointment_status?.code;
      const result = apt.appointment_result;

      if (status === "CANCEL_APPOINTMENT") return;

      if (pendingStatuses.has(status)) {
        pending++;
      }
      if (completedStatuses.has(status)) {
        completed++;
      }
      if (result) {
        reviewed++;
      }
      if (apt.package?.procedure?.code) {
        uniqueProcedures.add(apt.package?.procedure?.code);
      }
    });

    procedures.value = {
      pending_appointments: pending,
      completed_appointments: completed,
      reviews_count: reviewed,
      unique_service_codes_count: uniqueProcedures.size,
    };

    appointmentsData.value = appointmentsList;

    appointments.value = appointmentsList.filter((apt) =>
      [
        "CONCRETED_APPOINTMENT",
        "VALUED_VALORATION_APPOINTMENT",
        "CANCEL_APPOINTMENT",
      ].includes(apt.appointment_status?.code)
    );

    useRefreshToken();
  } catch (err: any) {
    console.error("Error al cargar los datos del dashboard:", err);
    error.value = "Error al cargar los datos del dashboard";
  } finally {
    isLoading.value = false;
  }
};

const chartData = computed(() => ({
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
      label: "Referencia 1",
      data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)),
      backgroundColor: "rgba(53, 65, 180, 0.8)",
      borderColor: "#3541B4",
      borderWidth: 0,
      borderRadius: 8,
      barPercentage: 0.4,
      categoryPercentage: 0.7,
      hoverBackgroundColor: "#3541B4",
    },
    {
      label: "Referencia 2",
      data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 100)),
      backgroundColor: "rgba(12, 173, 187, 0.8)",
      borderColor: "#0CADBB",
      borderWidth: 0,
      borderRadius: 8,
      barPercentage: 0.4,
      categoryPercentage: 0.7,
      hoverBackgroundColor: "#0CADBB",
    },
  ],
}));

const legendSpacingPlugin = {
  id: "legendSpacing",
  beforeInit(chart: any) {
    const originalFit = chart.legend.fit.bind(chart.legend);

    chart.legend.fit = function fit() {
      originalFit();
      this.height += 40;
    };
  },
};

const chartOptions: ChartOptions<"bar"> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: "index" as const,
    intersect: false,
  },
  plugins: {
    legend: {
      position: "top" as const,
      align: "start" as const,

      labels: {
        usePointStyle: true,
        pointStyle: "circle" as const,
        padding: 25,
        font: {
          size: 12,
          family: "'Montserrat', sans-serif",
        },
        color: "#353E5C",
        boxWidth: 8,
        boxHeight: 8,
      },
    },

    tooltip: {
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      titleColor: "#fff",
      bodyColor: "#fff",
      borderColor: "rgba(255, 255, 255, 0.1)",
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      titleFont: {
        size: 14,
      },
      bodyFont: {
        size: 13,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      border: {
        display: false,
      },
      ticks: {
        color: "#9CA3AF",
        font: {
          size: 12,
          family: "'Montserrat', sans-serif",
        },
        maxRotation: 0,
        padding: 10,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: "rgba(156, 163, 175, 0.1)",
      },
      border: {
        display: false,
      },
      ticks: {
        color: "#9CA3AF",
        font: {
          size: 12,
          family: "'Montserrat', sans-serif",
        },

        padding: 15,
        stepSize: 20,
      },
    },
  },
  elements: {
    bar: {
      borderSkipped: false,
    },
  },
};

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const selectTimeFilter = (option: (typeof timeFilterOptions)[0]) => {
  selectedTimeFilter.value = option.value;
  isDropdownOpen.value = false;
  loadDashboardData();
};

const getSelectedLabel = computed(() => {
  return (
    timeFilterOptions.find(
      (option) => option.value === selectedTimeFilter.value
    )?.label || "Últimos 30 días"
  );
});

const dropdownRef = ref<HTMLElement>();
onMounted(() => {
  const handleClickOutside = (event: Event) => {
    if (
      dropdownRef.value &&
      !dropdownRef.value.contains(event.target as Node)
    ) {
      isDropdownOpen.value = false;
    }
  };
  document.addEventListener("click", handleClickOutside);
  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
  });
});

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

const overlappingSegmentsPlugin = {
  id: "overlappingSegments",
  afterDatasetDraw(chart: any, args: any, plugins: any) {
    const { ctx, data } = chart;

    data.datasets.forEach((dataset: any, datasetIndex: number) => {
      const meta = chart.getDatasetMeta(datasetIndex);

      meta.data.forEach((segment: any, index: number) => {
        const x = segment.x;
        const y = segment.y;
        const angle = Math.PI / 180;
        const length = data.labels.length - 1;

        if (index < length && chart.getDataVisibility(index)) {
          const innerRadius = segment.innerRadius;
          const outerRadius = segment.outerRadius;
          const endAngle = segment.endAngle;
          const radius = (outerRadius - innerRadius) / 2;

          const coordinates = [];

          for (let i = -0.05; i <= 0.05; i += 0.02) {
            const xCoor =
              (innerRadius + radius) * Math.cos(endAngle + Math.PI + i);
            const yCoor = (innerRadius + radius) * Math.sin(endAngle + i);
            coordinates.push({ x: xCoor, y: yCoor });
          }

          ctx.save();

          let fillColor = dataset.backgroundColor[index];

          const hoveredElements = chart.getActiveElements();
          const isHovered = hoveredElements.some(
            (el: any) => el.datasetIndex === datasetIndex && el.index === index
          );

          if (isHovered && dataset.hoverBackgroundColor) {
            fillColor = dataset.hoverBackgroundColor[index];
          }

          ctx.fillStyle = fillColor;
          ctx.translate(x, y);
          ctx.beginPath();

          coordinates.forEach(({ x: coordX, y: coordY }) => {
            ctx.arc(-coordX, coordY, radius - 0, 0, angle * 360, false);
          });

          ctx.fill();
          ctx.restore();
        }
      });
    });
  },
};

const doughnutCenterTextPlugin = {
  id: "doughnutCenterText",
  afterDatasetsDraw: (chart: any) => {
    const { ctx } = chart;
    if (chart.config.type !== "doughnut") return;

    const meta = chart.getDatasetMeta(0);
    const firstArc = meta.data[0];
    if (!firstArc || !firstArc.endAngle) return;

    const centerX = firstArc.x;
    const centerY = firstArc.y;

    const dataset = chart.data.datasets[0];
    const value = dataset.data[0];
    const total = dataset.data.reduce((a: number, b: number) => a + b, 0);
    const percentage = Math.round((value / total) * 100);

    ctx.save();
    ctx.font = "bold 34px Arial";
    ctx.fillStyle = "#0CADBB";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${percentage}%`, centerX, centerY - 10);

    ctx.font = "16px Arial";
    ctx.fillStyle = "#C2C6E9";
    ctx.fillText("Incremento", centerX, centerY + 15);
    ctx.restore();
  },
};

const registerCustomPlugins = () => {
  if (process.client) {
    if (!ChartJS.registry.plugins.get("overlappingSegments")) {
      ChartJS.register(overlappingSegmentsPlugin);
    }

    if (!ChartJS.registry.plugins.get("doughnutCenterText")) {
      ChartJS.register(doughnutCenterTextPlugin);
    }
  }
};

const doughnutData = ref<ChartData<"doughnut">>({
  labels: ["Atendidos", "Restantes"],
  datasets: [
    {
      label: "Pacientes",
      data: [50, 50],
      backgroundColor: ["#0CADBB", "#F3F4FB"],
      hoverBackgroundColor: ["#0A9AA7", "#EAEBF2"],
      borderColor: "transparent",
      borderRadius: [
        {
          outerStart: 30,
          outerEnd: 0,
          innerStart: 30,
          innerEnd: 0,
        },
        {
          outerStart: 0,
          outerEnd: 30,
          innerStart: 0,
          innerEnd: 30,
        },
      ],
      spacing: 0,
      order: 1,
    },
  ],
});

const singleValueOptions = ref<ChartOptions<"doughnut">>({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 300,
  },
  interaction: {
    intersect: false,
    mode: "index",
  },
  hover: {
    mode: "index",
    intersect: false,
  },
  onHover: (event: any, elements: any, chart: any) => {
    chart.update("none");
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      backgroundColor: "#333",
      titleColor: "#fff",
      bodyColor: "#fff",
      borderColor: "#666",
      borderWidth: 1,
      cornerRadius: 8,
      callbacks: {
        label: (context: any) => {
          const label = context.label || "";
          const value = context.parsed;
          const total = context.dataset.data.reduce(
            (a: number, b: number) => a + b,
            0
          );
          const percentage = Math.round((value / total) * 100);
          return `${label}: ${value} (${percentage}%)`;
        },
      },
    },
    title: {
      display: false,
    },
  },
  circumference: 270,
  rotation: -134,
  cutout: "65%",
  elements: {
    arc: {
      borderWidth: 0,
      hoverBorderWidth: 0,
    },
  },
  layout: {
    padding: 0,
  },
});

onMounted(() => {
  registerCustomPlugins();
  loadDashboardData();
});
</script>

<template>
  <NuxtLayout name="medicos-dashboard">
    <div class="dashboard">
      <WebsitePerfilDoctorPantallaCarga v-if="isLoading" />

      <div v-else-if="error" class="dashboard__error" role="alert">
        <p class="dashboard__error-message">{{ error }}</p>
        <button
          class="dashboard__error-retry"
          @click="loadDashboardData"
          aria-label="Reintentar carga de datos"
        >
          Reintentar
        </button>
      </div>

      <div v-else class="dashboard__content">
        <section
          class="dashboard__stats"
          aria-label="Estadísticas del dashboard"
        >
          <div class="stats">
            <div class="stats__item">
              <div
                v-if="procedures.pending_appointments === 0"
                class="stats__card stats__card--empty"
              >
                <div class="stats__card-body">
                  <AtomsIconsNoActivityIcon aria-hidden="true" />
                  <div class="stats__card-content">
                    <p class="stats__card-text">Aún no tienes actividad</p>
                    <button
                      class="stats__card-button"
                      aria-label="Empezar a usar el dashboard"
                    >
                      Empezar
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="stats__card">
                <div class="stats__card-body">
                  <span
                    class="stats__icon stats__icon--warning"
                    aria-hidden="true"
                  >
                    <Icon name="fa6-solid:address-book" />
                  </span>
                  <div class="stats__card-content">
                    <span class="stats__card-number">
                      {{ formatNumber(procedures.pending_appointments) }}
                    </span>
                    <span class="stats__card-label">Citas Pendientes</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="stats__item">
              <div
                v-if="procedures.completed_appointments === 0"
                class="stats__card stats__card--empty"
              >
                <div class="stats__card-body">
                  <AtomsIconsNoActivityIcon aria-hidden="true" />
                  <div class="stats__card-content">
                    <p class="stats__card-text">Aún no tienes actividad</p>
                    <button
                      class="stats__card-button"
                      aria-label="Empezar a usar el dashboard"
                    >
                      Empezar
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="stats__card">
                <div class="stats__card-body">
                  <span
                    class="stats__icon stats__icon--warning"
                    aria-hidden="true"
                  >
                    <Icon name="ic:round-favorite" />
                  </span>
                  <div class="stats__card-content">
                    <span class="stats__card-number">
                      {{ formatNumber(procedures.completed_appointments) }}
                    </span>
                    <span class="stats__card-label">Pacientes Atendidos</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="stats__item">
              <div
                v-if="procedures.reviews_count === 0"
                class="stats__card stats__card--empty"
              >
                <div class="stats__card-body">
                  <AtomsIconsNoActivityIcon aria-hidden="true" />
                  <div class="stats__card-content">
                    <p class="stats__card-text">Aún no tienes actividad</p>
                    <button
                      class="stats__card-button"
                      aria-label="Empezar a usar el dashboard"
                    >
                      Empezar
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="stats__card">
                <div class="stats__card-body">
                  <span
                    class="stats__icon stats__icon--warning"
                    aria-hidden="true"
                  >
                    <Icon name="mdi:star-shooting" />
                  </span>
                  <div class="stats__card-content">
                    <span class="stats__card-number">
                      {{ formatNumber(procedures.reviews_count) }}
                    </span>
                    <span class="stats__card-label">Reseñas Recibidas</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="stats__item">
              <div
                v-if="procedures.unique_service_codes_count === 0"
                class="stats__card stats__card--empty"
              >
                <div class="stats__card-body">
                  <AtomsIconsNoActivityIcon aria-hidden="true" />
                  <div class="stats__card-content">
                    <p class="stats__card-text">Aún no tienes actividad</p>
                    <button
                      class="stats__card-button"
                      aria-label="Empezar a usar el dashboard"
                    >
                      Empezar
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="stats__card">
                <div class="stats__card-body">
                  <span
                    class="stats__icon stats__icon--warning"
                    aria-hidden="true"
                  >
                    <Icon name="ph:calendar-plus-fill" />
                  </span>
                  <div class="stats__card-content">
                    <span class="stats__card-number">
                      {{ formatNumber(procedures.unique_service_codes_count) }}
                    </span>
                    <span class="stats__card-label">Procedimientos</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="dashboard__charts">
          <div class="charts">
            <div class="charts__main">
              <!-- Header fuera del card -->
              <div class="charts__header">
                <h2 class="charts__title">Próximas Citas</h2>
                <div class="charts__actions">
                  <NuxtLink
                    class="charts__link"
                    href="/medicos/citas"
                    aria-label="Ver todas las citas"
                  >
                    Ver Todo
                    <AtomsIconsArrowRightIcon aria-hidden="true" />
                  </NuxtLink>
                </div>
              </div>

              <div class="charts__card charts__card--bar">
                <div class="charts__card-header">
                  <div class="dropdown" ref="dropdownRef">
                    <button
                      class="dropdown__trigger dropdown__trigger--card"
                      @click="toggleDropdown"
                      :class="{
                        'dropdown__trigger--active': isDropdownOpen,
                      }"
                      aria-label="Filtrar por período de tiempo"
                    >
                      <span class="dropdown__trigger-text">{{
                        getSelectedLabel
                      }}</span>
                      <Icon
                        name="mdi:chevron-down"
                        class="dropdown__trigger-icon"
                        :class="{
                          'dropdown__trigger-icon--rotated': isDropdownOpen,
                        }"
                      />
                    </button>
                    <div
                      class="dropdown__menu"
                      :class="{ 'dropdown__menu--active': isDropdownOpen }"
                    >
                      <button
                        v-for="option in timeFilterOptions"
                        :key="option.value"
                        class="dropdown__item"
                        :class="{
                          'dropdown__item--selected':
                            selectedTimeFilter === option.value,
                        }"
                        @click="selectTimeFilter(option)"
                      >
                        {{ option.label }}
                      </button>
                    </div>
                  </div>
                </div>

                <div class="charts__card-body charts__card-body--bar">
                  <Bar
                    :data="chartData"
                    :options="chartOptions"
                    :plugins="[legendSpacingPlugin]"
                    aria-label="Gráfico de barras mostrando citas por mes"
                  />
                </div>
              </div>
            </div>

            <div class="charts__sidebar">
              <div class="charts__header">
                <h2 class="charts__title">Pacientes</h2>
                <NuxtLink
                  class="charts__link"
                  href="/medicos/pacientes"
                  aria-label="Ver todos los pacientes"
                >
                  Ver Todo
                  <AtomsIconsArrowRightIcon aria-hidden="true" />
                </NuxtLink>
              </div>
              <div class="charts__card charts__card--centered">
                <div class="charts__card-body charts__card-body--centered">
                  <Doughnut
                    class="doughnut-chart"
                    :data="doughnutData"
                    :options="singleValueOptions"
                    aria-label="Gráfico circular mostrando incremento de pacientes"
                  />
                  <h3 class="charts__subtitle">Nuevos Pacientes</h3>
                  <p class="charts__description">Lorem Ipsum</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="dashboard__history">
          <div class="history">
            <div class="history__header">
              <h2 class="history__title">Historial</h2>
              <NuxtLink
                class="history__link"
                href="/medicos/citas"
                aria-label="Ver todo el historial"
              >
                Ver Todo
                <AtomsIconsArrowRightIcon aria-hidden="true" />
              </NuxtLink>
            </div>
            <div class="history__content">
              <MedicosCitasTable
                v-if="appointmentsData.length > 0"
                :appointments="appointmentsData"
                :useDropdown="false"
                aria-label="Tabla de historial de citas"
              />
              <div v-else class="history__empty" role="status">
                <p>No hay datos de historial disponibles</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </NuxtLayout>

  <MedicosRegistroOnboarding />
</template>

<style scoped lang="scss">
.dashboard {
  width: 100%;

  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 400px;
    gap: $spacing-md;
    padding: $spacing-lg;
    background-color: #ffeaa7;
    border: 1px solid #fdcb6e;
    border-radius: $border-radius-md;
  }

  &__error-message {
    color: #e17055;
    font-weight: 500;
    text-align: center;
    margin: 0;
  }

  &__error-retry {
    @include primary-button;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
  }

  &__stats {
    margin-bottom: $spacing-lg;
  }

  &__charts {
    margin-bottom: $spacing-lg;
  }

  &__history {
    width: 100%;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-md;

  @include respond-to-max(lg) {
    grid-template-columns: repeat(2, 1fr);
  }

  @include respond-to-max(sm) {
    grid-template-columns: 1fr;
  }

  &__item {
    width: 100%;
  }

  &__card {
    background: $white;
    border: none;
    border-radius: 10px;
    padding: 20px;
    height: 100%;

    &--empty {
      .stats__card-body {
        padding: $spacing-xs;
      }
    }
  }

  &__card-body {
    display: flex;
    align-items: center;
    padding: $spacing-md;
    height: 100%;
  }

  &__card-content {
    display: flex;
    flex-direction: column;
    margin-left: $spacing-md;
    flex: 1;
  }

  &__card-number {
    @include label-base;
    font-weight: 700;
    font-size: 20px;
    line-height: 100%;
    letter-spacing: -0.39px;
    color: $color-foreground;
  }

  &__card-label {
    font-size: 14px;
    color: #353e5c;
    margin-top: 2px;
  }

  &__card-text {
    margin: 0;
    font-size: 14px;
    color: $color-text-secondary;
  }

  &__card-button {
    @include primary-button;
    padding: 8px 16px;
    font-size: 12px;
    margin-top: $spacing-sm;
    align-self: flex-start;
  }

  &__icon {
    height: 48px;
    width: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    font-size: 24px;
    flex-shrink: 0;

    &--warning {
      background-color: #fefcf3;
      color: #f2cf63;
    }
  }
}

.charts {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: $spacing-lg;

  @include respond-to-max(lg) {
    grid-template-columns: 1fr;
  }

  &__main,
  &__sidebar {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0;
    padding: 0 $spacing-xs;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 18px;
    line-height: 100%;
    letter-spacing: 0px;
    color: #353e5c;
  }

  &__link {
    @include link-base;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: 14px;
    color: #6d758f;
    font-weight: 400;
    font-size: 13px;
    line-height: 18px;
    text-align: center;

    &:hover {
      color: $color-primary;
    }
  }

  &__card {
    position: relative;
    background: $white;
    border: none;
    border-radius: $border-radius-md;
    overflow: hidden;
    height: 100%;
    max-height: 350px;

    &--centered {
      display: flex;
      align-items: center;
      justify-content: center;

      @include respond-to-max(md) {
        height: 300px;
      }
    }

    &--bar {
      display: flex;
      flex-direction: column;

      @include respond-to-max(lg) {
        height: 400px;
        min-height: 350px;
      }

      @include respond-to-max(md) {
        height: 350px;
        min-height: 300px;
      }

      @include respond-to-max(sm) {
        height: 320px;
        min-height: 280px;
      }
    }
  }

  &__card-header {
    position: absolute;
    z-index: 100;
    top: 10px;
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: $spacing-md $spacing-lg $spacing-sm;
    flex-shrink: 0;

    @include respond-to-max(sm) {
      padding: $spacing-sm $spacing-md;
    }
  }

  &__card-body {
    position: relative;
    display: flex;
    align-items: center;
    padding: $spacing-lg;

    &--centered {
      flex-direction: column;
      justify-content: center;
      text-align: center;
      height: 100%;
      max-height: none;
    }

    &--bar {
      flex: 1;
      flex-direction: column;
      justify-content: center;
      padding: $spacing-md $spacing-lg $spacing-lg;
      min-height: 0;

      @include respond-to-max(sm) {
        padding: $spacing-sm $spacing-md $spacing-md;
      }

      > * {
        width: 100%;
        height: 100%;
        max-height: 100%;
      }
    }
  }

  &__subtitle {
    @include label-base;
    font-weight: 600;
    font-size: 16px;
    line-height: 100%;
    color: #353e5c;
    margin: $spacing-md 0 $spacing-xs;
  }

  &__description {
    @include label-base;
    font-weight: 300;
    font-size: 14px;
    line-height: 100%;
    color: #6d758f;
    margin: 0;
  }
}

.dropdown {
  position: relative;
  display: inline-block;

  &__trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px;
    background: #f8faff;
    border: 1px solid #f8faff;
    border-radius: 33px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: $font-family-main;
    font-weight: 400;
    color: #6d758f;

    &:hover {
      background: #f1f5f9;
      border-color: #d1d5db;
    }

    &--active {
      background: $white;
      border-color: #3541b4;
    }

    &--card {
      background: #f8faff;
      border: 1px solid #f8faff;
      padding: 12px;
      font-size: 13px;

      @include respond-to-max(sm) {
        padding: 5px 10px;
        font-size: 12px;
      }

      &.dropdown__trigger--active {
        background: $white;
        border-color: #3541b4;
      }
    }
  }

  &__trigger-text {
    white-space: nowrap;
  }

  &__trigger-icon {
    font-size: 16px;
    color: #9ca3af;
    transition: transform 0.2s ease;

    &--rotated {
      transform: rotate(180deg);
    }
  }

  &__menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    min-width: 180px;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-8px);
    transition: all 0.2s ease;

    &--active {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
  }

  &__item {
    display: block;
    width: 100%;
    padding: 12px 16px;
    text-align: left;
    background: none;
    border: none;
    font-size: 14px;
    color: #374151;
    cursor: pointer;
    transition: background-color 0.15s ease;
    font-family: $font-family-main;

    &:first-child {
      border-radius: 8px 8px 0 0;
    }

    &:last-child {
      border-radius: 0 0 8px 8px;
    }

    &:hover {
      background: #f8f9fc;
    }

    &--selected {
      background: #eff6ff;
      color: #3541b4;
      font-weight: 500;

      &:hover {
        background: #dbeafe;
      }
    }
  }
}

.history {
  width: 100%;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 $spacing-sm $spacing-md;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 18px;
    line-height: 100%;
    letter-spacing: 0px;
    color: #353e5c;
  }

  &__link {
    @include link-base;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: 14px;
    color: #6d758f;
    font-weight: 400;
    font-size: 13px;
    line-height: 18px;
    text-align: center;

    &:hover {
      color: $color-primary;
    }
  }

  &__content {
    width: 100%;
  }

  &__empty {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: $spacing-lg * 3;
    background: $white;
    border-radius: $border-radius-md;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    p {
      color: $color-text-muted;
      margin: 0;
      font-size: 16px;
    }
  }
}

.charts__card-body--centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-height: 228px;
  position: relative;
}
</style>
