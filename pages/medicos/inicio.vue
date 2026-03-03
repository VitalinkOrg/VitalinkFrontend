<script lang="ts" setup>
import { Bar } from "vue-chartjs";
import { useDashboardCharts } from "@/composables/useDashboardCharts";

definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});

const { formatNumber } = useFormat();

const {
  isLoading,
  hasError,
  state,
  selectedFilter,
  selectedFilterLabel,
  hasAppointments,
  timeFilterOptions,
  loadData,
  changeFilter,
} = useDashboardData();

const { registerPlugins, barChartData, barChartOptions, legendSpacingPlugin } =
  useDashboardCharts();

const isFilterOpen = ref(false);
const filterTriggerRef = ref<HTMLElement>();
const filterMenuRef = ref<HTMLElement>();

interface StatCard {
  key: string;
  value: number;
  label: string;
  icon: string;
  ariaLabel: string;
}

const statCards = computed<StatCard[]>(() => {
  const s = state.value.stats;
  return [
    {
      key: "pending",
      value: s.pendingAppointments,
      label: "Citas Pendientes",
      icon: "fa6-solid:address-book",
      ariaLabel: `${s.pendingAppointments} citas pendientes`,
    },
    {
      key: "completed",
      value: s.completedAppointments,
      label: "Pacientes Atendidos",
      icon: "ic:round-favorite",
      ariaLabel: `${s.completedAppointments} pacientes atendidos`,
    },
    {
      key: "reviews",
      value: s.reviewsCount,
      label: "Reseñas Recibidas",
      icon: "mdi:star-shooting",
      ariaLabel: `${s.reviewsCount} reseñas recibidas`,
    },
    {
      key: "procedures",
      value: s.uniqueProceduresCount,
      label: "Procedimientos",
      icon: "ph:calendar-plus-fill",
      ariaLabel: `${s.uniqueProceduresCount} procedimientos`,
    },
  ];
});

function toggleFilter(): void {
  isFilterOpen.value = !isFilterOpen.value;
}

function selectFilter(option: (typeof timeFilterOptions)[number]): void {
  isFilterOpen.value = false;
  changeFilter(option.value);
}

function handleFilterKeydown(
  event: KeyboardEvent,
  option: (typeof timeFilterOptions)[number],
): void {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    selectFilter(option);
  }
}

function handleClickOutside(event: Event): void {
  const target = event.target as Node;
  if (
    filterTriggerRef.value?.contains(target) ||
    filterMenuRef.value?.contains(target)
  ) {
    return;
  }
  isFilterOpen.value = false;
}

onMounted(() => {
  registerPlugins();
  loadData();
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <NuxtLayout name="medicos-dashboard">
    <div class="dashboard">
      <WebsitePerfilDoctorPantallaCarga v-if="isLoading" />

      <div
        v-else-if="hasError"
        class="dashboard__error"
        role="alert"
        aria-live="assertive"
      >
        <p class="dashboard__error-message">
          Error al cargar los datos del dashboard
        </p>
        <button class="dashboard__error-retry" type="button" @click="loadData">
          Reintentar
        </button>
      </div>

      <div v-else class="dashboard__content">
        <section class="dashboard__section" aria-labelledby="stats-heading">
          <h2 id="stats-heading" class="sr-only">Estadísticas del dashboard</h2>

          <ul class="stat-grid" role="list">
            <li
              v-for="card in statCards"
              :key="card.key"
              class="stat-grid__item"
            >
              <div
                v-if="card.value === 0"
                class="stat-card stat-card--empty"
                :aria-label="`${card.label}: sin actividad`"
              >
                <div class="stat-card__body">
                  <AtomsIconsNoActivityIcon aria-hidden="true" />
                  <div class="stat-card__content">
                    <p class="stat-card__placeholder">
                      Aún no tienes actividad
                    </p>
                    <button class="stat-card__action" type="button">
                      Empezar
                    </button>
                  </div>
                </div>
              </div>

              <div
                v-else
                class="stat-card"
                role="group"
                :aria-label="card.ariaLabel"
              >
                <div class="stat-card__body">
                  <span class="stat-card__icon" aria-hidden="true">
                    <Icon :name="card.icon" />
                  </span>
                  <div class="stat-card__content">
                    <span class="stat-card__number">
                      {{ formatNumber(card.value) }}
                    </span>
                    <span class="stat-card__label">{{ card.label }}</span>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </section>

        <section class="dashboard__section" aria-labelledby="charts-heading">
          <h2 id="charts-heading" class="sr-only">
            Gráficos y visualizaciones
          </h2>

          <div class="chart-layout">
            <div class="chart-layout__main">
              <div class="chart-layout__header">
                <h3 class="chart-layout__title">Próximas Citas</h3>
                <NuxtLink class="chart-layout__link" to="/medicos/citas">
                  Ver Todo
                  <AtomsIconsArrowRightIcon aria-hidden="true" />
                </NuxtLink>
              </div>

              <div class="chart-panel chart-panel--bar">
                <div class="chart-panel__toolbar">
                  <div class="filter-dropdown">
                    <button
                      ref="filterTriggerRef"
                      class="filter-dropdown__trigger"
                      :class="{
                        'filter-dropdown__trigger--active': isFilterOpen,
                      }"
                      type="button"
                      :aria-expanded="isFilterOpen"
                      aria-haspopup="listbox"
                      aria-label="Filtrar por período de tiempo"
                      @click="toggleFilter"
                    >
                      <span class="filter-dropdown__label">
                        {{ selectedFilterLabel }}
                      </span>
                      <Icon
                        name="mdi:chevron-down"
                        class="filter-dropdown__chevron"
                        :class="{
                          'filter-dropdown__chevron--open': isFilterOpen,
                        }"
                        aria-hidden="true"
                      />
                    </button>

                    <ul
                      v-show="isFilterOpen"
                      ref="filterMenuRef"
                      class="filter-dropdown__menu"
                      role="listbox"
                      :aria-label="'Opciones de período'"
                    >
                      <li
                        v-for="option in timeFilterOptions"
                        :key="option.value"
                        class="filter-dropdown__option"
                        :class="{
                          'filter-dropdown__option--selected':
                            selectedFilter === option.value,
                        }"
                        role="option"
                        :aria-selected="selectedFilter === option.value"
                        tabindex="0"
                        @click="selectFilter(option)"
                        @keydown="handleFilterKeydown($event, option)"
                      >
                        {{ option.label }}
                      </li>
                    </ul>
                  </div>
                </div>

                <div class="chart-panel__canvas">
                  <Bar
                    :data="barChartData"
                    :options="barChartOptions"
                    :plugins="[legendSpacingPlugin]"
                    role="img"
                    aria-label="Gráfico de barras de citas por mes"
                  />
                </div>
              </div>
            </div>

            <div class="chart-layout__sidebar">
              <div class="chart-layout__header">
                <h3 class="chart-layout__title">Pacientes</h3>
                <NuxtLink class="chart-layout__link" to="/medicos/pacientes">
                  Ver Todo
                  <AtomsIconsArrowRightIcon aria-hidden="true" />
                </NuxtLink>
              </div>

              <div class="chart-panel chart-panel--doughnut">
                <div class="chart-panel__canvas chart-panel__canvas--centered">
                  <UiDoughnutChart
                    :attended-value="50"
                    :total-value="100"
                    :chart-size="400"
                    title="Nuevos Pacientes"
                    description="Lorem ipsum"
                    center-label="Incremento"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="dashboard__section" aria-labelledby="history-heading">
          <div class="history-panel">
            <div class="history-panel__header">
              <h3 id="history-heading" class="history-panel__title">
                Historial
              </h3>
              <NuxtLink class="history-panel__link" to="/medicos/citas">
                Ver Todo
                <AtomsIconsArrowRightIcon aria-hidden="true" />
              </NuxtLink>
            </div>

            <div class="history-panel__body">
              <MedicosCitasTable
                v-if="hasAppointments"
                :appointments="JSON.parse(JSON.stringify(state.allAppointments))"
                :use-dropdown="false"
                aria-label="Tabla de historial de citas"
              />
              <div v-else class="history-panel__empty" role="status">
                <p>No hay datos de historial disponibles</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </NuxtLayout>
</template>

<style scoped lang="scss">
.sr-only {
  @include visually-hidden;
}

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

  &__section {
    margin-bottom: $spacing-lg;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: $spacing-md;
  list-style: none;
  margin: 0;
  padding: 0;

  @include respond-to-max(lg) {
    grid-template-columns: repeat(2, 1fr);
  }

  @include respond-to-max(sm) {
    grid-template-columns: 1fr;
  }

  &__item {
    width: 100%;
  }
}

.stat-card {
  background: $white;
  border: none;
  border-radius: 10px;
  padding: 20px;
  height: 100%;

  &--empty {
    .stat-card__body {
      padding: $spacing-xs;
    }
  }

  &__body {
    display: flex;
    align-items: center;
    padding: $spacing-md;
    height: 100%;
  }

  &__content {
    display: flex;
    flex-direction: column;
    margin-left: $spacing-md;
    flex: 1;
  }

  &__number {
    @include label-base;
    font-weight: 700;
    font-size: 20px;
    line-height: 100%;
    letter-spacing: -0.39px;
    color: $color-foreground;
  }

  &__label {
    font-size: 14px;
    color: #353e5c;
    margin-top: 2px;
  }

  &__placeholder {
    margin: 0;
    font-size: 14px;
    color: $color-text-secondary;
  }

  &__action {
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
    background-color: #fefcf3;
    color: #f2cf63;
  }
}

.chart-layout {
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
    padding: 0 $spacing-xs;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 18px;
    line-height: 100%;
    color: #353e5c;
  }

  &__link {
    @include link-base;
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: 13px;
    font-weight: 400;
    line-height: 18px;
    color: #6d758f;

    &:hover {
      color: $color-primary;
    }
  }
}

.chart-panel {
  position: relative;
  background: $white;
  border: none;
  border-radius: $border-radius-md;
  overflow: hidden;
  height: 100%;
  max-height: 350px;

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

  &--doughnut {
    display: flex;
    align-items: center;
    justify-content: center;

    @include respond-to-max(md) {
      height: 300px;
    }
  }

  &__toolbar {
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

  &__canvas {
    flex: 1;
    display: flex;
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

    &--centered {
      align-items: center;
      text-align: center;
      max-height: 228px;
    }
  }
}

.filter-dropdown {
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
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: $font-family-main;
    font-weight: 400;
    color: #6d758f;

    &:hover {
      background: #f1f5f9;
      border-color: #d1d5db;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }

    &--active {
      background: $white;
      border-color: $color-primary;
    }

    @include respond-to-max(sm) {
      padding: 5px 10px;
      font-size: 12px;
    }
  }

  &__label {
    white-space: nowrap;
  }

  &__chevron {
    font-size: 16px;
    color: #9ca3af;
    transition: transform 0.2s ease;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__menu {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    background: $white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    min-width: 180px;
    z-index: 1000;
    list-style: none;
    margin: 0;
    padding: 0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &__option {
    display: block;
    width: 100%;
    padding: 12px 16px;
    text-align: left;
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

    &:hover,
    &:focus-visible {
      background: #f8f9fc;
      outline: none;
    }

    &--selected {
      background: #eff6ff;
      color: $color-primary;
      font-weight: 500;

      &:hover,
      &:focus-visible {
        background: #dbeafe;
      }
    }
  }
}

.history-panel {
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
    color: #353e5c;
  }

  &__link {
    @include link-base;
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    font-size: 13px;
    font-weight: 400;
    line-height: 18px;
    color: #6d758f;

    &:hover {
      color: $color-primary;
    }
  }

  &__body {
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
</style>
