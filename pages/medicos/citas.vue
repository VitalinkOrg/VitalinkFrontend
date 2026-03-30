<script lang="ts" setup>
useSeoMeta({
  title: "Seguimiento de Citas — Vitalink",
  description: "Gestiona tus citas médicas en Vitalink.",
  ogTitle: "Seguimiento de Citas — Vitalink",
  ogDescription: "Consulta y gestiona tus citas médicas.",
});

definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});

const {
  isLoading,
  hasError,
  searchQuery,
  activeSortCriterion,
  visibleStatusBadges,
  filteredAppointments,
  appointmentCount,
  hasAppointments,
  sortOptions,
  statusFilters,
  fetchAppointments,
  isStatusActive,
  toggleStatusFilter,
  removeStatusFilter,
  applySortCriterion,
} = useAppointmentsPage();

const { generateReport } = useAppointmentReport();

const tableKey = computed(() => activeSortCriterion.value);

function handleDownloadReport(): void {
  generateReport(filteredAppointments.value);
}

async function handleRefresh(): Promise<void> {
  await fetchAppointments();
}

provide("refreshAppointments", handleRefresh);

onMounted(fetchAppointments);
</script>

<template>
  <NuxtLayout name="medicos-dashboard">
    <header class="page-header">
      <nav class="breadcrumb" aria-label="Navegación de migas de pan">
        <ol class="breadcrumb__list">
          <li class="breadcrumb__item">
            <NuxtLink to="/medicos/inicio" class="breadcrumb__link">
              Inicio
            </NuxtLink>
          </li>
          <li class="breadcrumb__item" aria-current="page">
            <span class="breadcrumb__current">Citas</span>
          </li>
        </ol>
      </nav>

      <h1 class="page-header__title">Seguimiento de Citas</h1>
    </header>

    <main class="page-body">
      <section class="toolbar" aria-label="Herramientas de filtrado y búsqueda">
        <UiSearchInput
          v-model="searchQuery"
          placeholder="Buscar"
          aria-label="Buscar en mis citas"
          max-width="320px"
        />

        <div class="toolbar__actions">
          <button
            type="button"
            class="toolbar__download-btn"
            :disabled="!hasAppointments"
            :aria-label="`Descargar reporte de ${appointmentCount} citas`"
            @click="handleDownloadReport"
          >
            <AtomsIconsDownloadIcon
              size="20"
              aria-hidden="true"
              focusable="false"
            />
            <span class="toolbar__download-label">Descargar</span>
          </button>

          <WebsiteBaseDropdown>
            <template #button>
              <span class="toolbar__dropdown-text">Ordenar por</span>
              <span class="icon-chevron-down" aria-hidden="true" />
            </template>
            <template #menu>
              <li
                v-for="option in sortOptions"
                :key="option.value"
                class="toolbar__menu-item"
              >
                <button
                  type="button"
                  role="menuitem"
                  class="toolbar__menu-action"
                  :aria-pressed="activeSortCriterion === option.value"
                  @click="applySortCriterion(option.value)"
                >
                  {{ option.label }}
                </button>
              </li>
            </template>
          </WebsiteBaseDropdown>

          <WebsiteBaseDropdown>
            <template #button>
              <span class="toolbar__dropdown-text">Estado de solicitud:</span>
              <div class="badge-group" aria-live="polite">
                <span
                  v-for="status in visibleStatusBadges"
                  :key="status"
                  class="badge"
                  :aria-label="`Filtro activo: ${status}`"
                >
                  {{ status }}
                  <button
                    v-if="status !== 'Todos'"
                    type="button"
                    class="badge__dismiss"
                    :aria-label="`Remover filtro ${status}`"
                    @click.stop="removeStatusFilter(status)"
                  >
                    <AtomsIconsXIcon size="14" aria-hidden="true" />
                  </button>
                </span>
              </div>
            </template>
            <template #menu>
              <li
                v-for="status in statusFilters"
                :key="status"
                class="toolbar__menu-item"
                role="none"
              >
                <label class="toolbar__checkbox">
                  <input
                    type="checkbox"
                    class="toolbar__checkbox-input"
                    :checked="isStatusActive(status)"
                    :aria-label="`${isStatusActive(status) ? 'Deseleccionar' : 'Seleccionar'} filtro ${status}`"
                    @change="toggleStatusFilter(status)"
                  />
                  <span
                    class="toolbar__checkbox-indicator"
                    aria-hidden="true"
                  />
                </label>
                <button
                  type="button"
                  role="menuitem"
                  class="toolbar__menu-action"
                  :aria-pressed="isStatusActive(status)"
                  @click="toggleStatusFilter(status)"
                >
                  {{ status }}
                </button>
              </li>
            </template>
          </WebsiteBaseDropdown>
        </div>
      </section>

      <section class="appointment-list" aria-label="Lista de citas médicas">
        <div class="appointment-list__card">
          <div
            v-if="isLoading"
            class="appointment-list__placeholder"
            role="status"
            aria-live="polite"
          >
            <span class="sr-only">Cargando citas…</span>
          </div>

          <div
            v-else-if="hasError"
            class="appointment-list__error"
            role="alert"
            aria-live="assertive"
          >
            <p class="appointment-list__error-text">
              No se pudieron cargar las citas.
            </p>
            <button
              type="button"
              class="appointment-list__retry-btn"
              @click="fetchAppointments"
            >
              Reintentar
            </button>
          </div>

          <div
            v-else-if="!hasAppointments"
            class="appointment-list__empty"
            role="status"
          >
            <p class="appointment-list__empty-text">
              No se encontraron citas que coincidan con los filtros aplicados.
            </p>
          </div>

          <MedicosCitasTable
            v-else
            :key="tableKey"
            :appointments="filteredAppointments"
            :use-dropdown="true"
          />
        </div>
      </section>
    </main>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.sr-only {
  @include visually-hidden;
}

.page-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 1.5rem;

  @include respond-to(md) {
    margin-bottom: 2rem;
  }

  &__title {
    font-family: $font-family-main;
    font-weight: 600;
    font-size: 20px;
    line-height: 20px;
    letter-spacing: 0;
    margin: 0;
  }
}

.breadcrumb {
  display: flex;
  align-items: center;

  &__list {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    flex-wrap: wrap;
    gap: 0.25rem;

    li + li::before {
      content: "/";
      padding: 0 0.5rem;
      color: #6c757d;

      @include respond-to-max(sm) {
        padding: 0 0.25rem;
      }
    }
  }

  &__item {
    font-size: 0.75rem;

    @include respond-to(sm) {
      font-size: 0.875rem;
    }
  }

  &__link {
    text-decoration: none;
    color: #6c757d;

    &:hover,
    &:focus-visible {
      text-decoration: underline;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
      border-radius: 2px;
    }
  }

  &__current {
    color: #6c757d;
  }
}

.page-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @include respond-to(md) {
    gap: 1.5rem;
    margin-bottom: 3rem;
  }
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;

  @include respond-to(sm) {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: flex-start;
  }

  @include respond-to(lg) {
    margin-bottom: 1.5rem;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;

    @include respond-to(sm) {
      margin-left: auto;
      gap: 0.75rem;
    }
  }

  &__download-btn {
    @include outline-button;
    font-weight: 400;
    font-size: 0.75rem;
    line-height: 1.25;
    color: #344054;
    padding: 0.5rem 0.75rem;
    gap: 0.375rem;

    @include respond-to(sm) {
      font-size: 0.875rem;
      padding: 0.625rem 1rem;
      gap: 0.5rem;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__download-label {
    @include respond-to-max(sm) {
      @include visually-hidden;
    }
  }

  &__dropdown-text {
    @include respond-to-max(sm) {
      font-size: 0.875rem;
    }
  }

  &__menu-item {
    display: flex;
    gap: 0.75rem;
    padding: 0.625rem 1rem;
    align-items: center;

    &:hover {
      background-color: #f1f3f7;
    }
  }

  &__menu-action {
    width: 100%;
    text-align: left;
    padding: 0.5rem 0;
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 0.875rem;
    font-family: $font-family-main;
    transition: color 0.2s ease;

    @include respond-to-max(sm) {
      font-size: 0.8125rem;
      padding: 0.625rem 0;
    }

    &:hover,
    &:focus-visible {
      color: $color-primary;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }

    &[aria-pressed="true"] {
      font-weight: 600;
      color: $color-primary;
    }
  }

  &__checkbox {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  &__checkbox-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;

    &:focus-visible + .toolbar__checkbox-indicator {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }

    &:checked + .toolbar__checkbox-indicator {
      background-color: $color-primary;
      border-color: $color-primary;

      &::after {
        opacity: 1;
      }
    }
  }

  &__checkbox-indicator {
    width: 1.125rem;
    height: 1.125rem;
    border: 2px solid #dee2e6;
    border-radius: 0.25rem;
    background: $white;
    position: relative;
    transition: all 0.2s ease;

    &::after {
      content: "";
      position: absolute;
      left: 0.25rem;
      top: 0.0625rem;
      width: 0.375rem;
      height: 0.625rem;
      border: solid $white;
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
      opacity: 0;
      transition: opacity 0.2s ease;
    }
  }
}

.badge-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-left: 0.5rem;

  @include respond-to-max(sm) {
    margin-left: 0.25rem;
  }
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 1rem;
  padding: 0.125rem 0.5rem;
  background-color: #f2f4f7;
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 1.125rem;
  color: #344054;

  @include respond-to-max(sm) {
    font-size: 0.625rem;
    padding: 0.125rem 0.375rem;
  }

  &__dismiss {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin: 0;
    background: none;
    border: none;
    color: #6c757d;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover,
    &:focus-visible {
      background-color: rgba(0, 0, 0, 0.05);
      color: #344054;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 1px;
    }
  }
}

.appointment-list {
  flex: 1;
  min-height: 20rem;

  &__card {
    background: $white;
    border-radius: $border-radius-md;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  &__placeholder {
    padding: 3rem 1rem;
    text-align: center;
    color: #6c757d;
  }

  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-md;
    padding: 3rem 1rem;
    text-align: center;
  }

  &__error-text {
    color: #e17055;
    font-weight: 500;
    margin: 0;
  }

  &__retry-btn {
    @include primary-button;
    padding: 8px 20px;
    font-size: 14px;
  }

  &__empty {
    padding: 3rem 1rem;
    text-align: center;
  }

  &__empty-text {
    color: #6c757d;
    font-size: 1rem;
    margin: 0;
  }
}

@include respond-to-max(sm) {
  .toolbar {
    &__actions {
      width: 100%;
      justify-content: space-between;
    }
  }

  .appointment-list__card {
    border-radius: 0;
    box-shadow: none;
    border-top: 1px solid #e1e4ed;
    border-bottom: 1px solid #e1e4ed;
  }

  .appointment-list__placeholder {
    padding: 2rem 1rem;
  }

  .appointment-list__empty {
    padding: 2rem 1rem;

    .appointment-list__empty-text {
      font-size: 0.875rem;
    }
  }
}

@include respond-to-max(xs) {
  .page-header {
    padding: 0 1rem;
  }

  .toolbar {
    padding: 0 1rem;
    margin: 0 -1rem 1rem;
  }

  .appointment-list {
    margin: 0 -1rem;
  }
}
</style>
