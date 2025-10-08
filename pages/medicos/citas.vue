<script lang="ts" setup>
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { computed, ref, watch, type Ref } from "vue";
import type { Appointment } from "~/types";

definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});

const config = useRuntimeConfig();
const token = useCookie("token");
const role = useCookie("role");
const { formatDate } = useFormat();

const tab: Ref<number> = ref(1);
const searchQuery: Ref<string> = ref("");
const sortOption: Ref<string> = ref("date");
const selectedStatuses: Ref<Set<string>> = ref(new Set(["Todos"]));

const statusMapping: Record<string, string> = {
  Pendiente: "Pendiente",
  Completada: "Concretado",
  Cancelada: "Cancelada",
  Todos: "Todos",
};

const valorationAppointmentStates = [
  "PENDING_VALORATION_APPOINTMENT",
  "CONFIRM_VALIDATION_APPOINTMENT",
  "VALUATION_PENDING_VALORATION_APPOINTMENT",
  "VALUED_VALORATION_APPOINTMENT",
];

const procedureStates = [
  "PENDING_PROCEDURE",
  "CONFIRM_PROCEDURE",
  "WAITING_PROCEDURE",
  "CONCRETED_APPOINTMENT",
  "CANCEL_APPOINTMENT",
];

const loading: Ref<boolean> = ref(false);
const isRefreshing: Ref<boolean> = ref(false);
const previousAppointments: Ref<Appointment[]> = ref([]);
const allAppointmentsData: Ref<Appointment[] | null> = ref(null);

const appointmentsData = computed(() => {
  return allAppointmentsData.value || previousAppointments.value;
});

let url: string;
if (role.value == "R_HOS") {
  url = "/hospital_dashboard/history_appointments";
} else {
  url = "/doctor_dashboard/history_appointments";
}

try {
  const { data: appointmentsResponse } = await useFetch<Appointment[]>(
    config.public.API_BASE_URL + "/appointment/get_all",
    {
      headers: { Authorization: token.value ?? "" },
      transform: (_appointments: any) => _appointments.data,
    }
  );

  if (appointmentsResponse.value) {
    allAppointmentsData.value = appointmentsResponse.value;
    previousAppointments.value = appointmentsResponse.value;
    useRefreshToken();
  }
} catch (error) {
  console.error("Initial fetch error:", error);
}

const fetchAppointments = async (isRefresh: boolean = false): Promise<void> => {
  if (isRefresh) {
    isRefreshing.value = true;
  } else {
    loading.value = true;
  }

  try {
    const { data } = await useFetch<Appointment[]>(
      config.public.API_BASE_URL + "/appointment/get_all",
      {
        headers: { Authorization: token.value ?? "" },
        transform: (_appointments: any) => _appointments.data,
        server: false,
        key: isRefresh ? `appointments-${Date.now()}` : "appointments",
      }
    );

    if (data.value) {
      if (allAppointmentsData.value) {
        previousAppointments.value = allAppointmentsData.value;
      }

      allAppointmentsData.value = data.value;
      useRefreshToken();
    }
  } catch (error) {
    console.error("Fetch error:", error);
  } finally {
    loading.value = false;
    isRefreshing.value = false;
  }
};

watch(
  allAppointmentsData,
  (newVal, oldVal) => {
    if (oldVal && newVal !== oldVal) {
      previousAppointments.value = oldVal;
    }
  },
  { deep: true }
);

const refreshAppointments = async (): Promise<void> => {
  await fetchAppointments(true);
};

provide("refreshAppointments", refreshAppointments);

const handleRefresh = async (): Promise<void> => {
  await refreshAppointments();
};

provide("handleRefresh", handleRefresh);

const allAppointments = computed((): Appointment[] => {
  return appointmentsData.value || [];
});

const getAppointmentState = (appointment: Appointment): string => {
  return appointment.appointment_status.code;
};

const filteredAppointments = computed((): Appointment[] => {
  let filtered = allAppointments.value;

  if (tab.value === 1) {
    filtered = filtered.filter((appointment) => {
      const state = getAppointmentState(appointment);
      return valorationAppointmentStates.includes(state);
    });
  } else if (tab.value === 2) {
    filtered = filtered.filter((appointment) => {
      const state = getAppointmentState(appointment);
      return procedureStates.includes(state);
    });
  }

  if (!selectedStatuses.value.has("Todos")) {
    const mappedStatuses = Array.from(selectedStatuses.value).map(
      (status) => statusMapping[status]
    );
    filtered = filtered.filter((appointment) => {
      const appointmentStatus = getAppointmentState(appointment);
      return mappedStatuses.includes(appointmentStatus);
    });
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((appointment) => {
      const patientName =
        appointment.customer?.name ||
        `${appointment.customer?.name || ""} ${appointment.customer?.name || ""}`.trim() ||
        "";

      const serviceName =
        appointment.package?.product?.name ||
        appointment.package?.procedure?.name ||
        "";

      const appointmentCode =
        appointment.id?.toString() ||
        appointment.package?.procedure?.code ||
        "";

      return (
        patientName.toLowerCase().includes(query) ||
        serviceName.toLowerCase().includes(query) ||
        appointmentCode.toLowerCase().includes(query)
      );
    });
  }

  filtered = [...filtered].sort((a, b) => {
    if (sortOption.value === "date" || sortOption.value === "fecha") {
      const dateA = new Date(a.appointment_date || "");
      const dateB = new Date(b.appointment_date || "");
      return dateA.getTime() - dateB.getTime();
    } else if (sortOption.value === "name" || sortOption.value === "nombre") {
      const nameA = (
        a.customer?.name ||
        `${a.customer?.name || ""} ${a.customer?.name || ""}`.trim() ||
        ""
      ).toLowerCase();

      const nameB = (
        b.customer?.name ||
        `${b.customer?.name || ""} ${b.customer?.name || ""}`.trim() ||
        ""
      ).toLowerCase();

      return nameA.localeCompare(nameB);
    }
    return 0;
  });

  return filtered;
});

const changeTab = (newTab: number): void => {
  tab.value = newTab;
  selectedStatuses.value = new Set(["Todos"]);
};

const toggleStatusFilter = (status: string): void => {
  const newSelectedStatuses = new Set(selectedStatuses.value);

  if (status === "Todos") {
    if (newSelectedStatuses.has("Todos")) {
      return;
    } else {
      newSelectedStatuses.clear();
      newSelectedStatuses.add("Todos");
    }
  } else {
    newSelectedStatuses.delete("Todos");

    if (newSelectedStatuses.has(status)) {
      newSelectedStatuses.delete(status);
      if (newSelectedStatuses.size === 0) {
        newSelectedStatuses.add("Todos");
      }
    } else {
      newSelectedStatuses.add(status);
    }
  }

  selectedStatuses.value = newSelectedStatuses;
};

const isStatusSelected = (status: string): boolean => {
  return selectedStatuses.value.has(status);
};

const removeStatusBadge = (status: string): void => {
  const newSelectedStatuses = new Set(selectedStatuses.value);
  newSelectedStatuses.delete(status);

  if (newSelectedStatuses.size === 0) {
    newSelectedStatuses.add("Todos");
  }

  selectedStatuses.value = newSelectedStatuses;
};

const selectedStatusBadges = computed((): string[] => {
  if (selectedStatuses.value.has("Todos")) {
    return ["Todos"];
  }
  return Array.from(selectedStatuses.value);
});

const downloadAllAppointments = (): void => {
  if (!filteredAppointments.value || filteredAppointments.value.length === 0)
    return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPosition = 20;

  // Título del reporte según el tab activo
  const reportTitle =
    tab.value === 1
      ? "Reporte de Citas de Valoración"
      : "Reporte de Procedimientos";

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(reportTitle, pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generado el: ${formatDate(new Date().toISOString())}`,
    pageWidth / 2,
    yPosition,
    { align: "center" }
  );
  yPosition += 15;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  const headers = ["Paciente", "Fecha", "Hora", "Servicio", "Tipo", "Estado"];
  const columnWidths = [40, 30, 25, 45, 25, 25];
  let xPosition = margin;

  headers.forEach((header, i) => {
    doc.text(header, xPosition, yPosition);
    xPosition += columnWidths[i];
  });
  yPosition += 8;

  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  filteredAppointments.value.forEach((appointment, index) => {
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    const patientName = appointment.customer?.name || "N/A";
    const appointmentDate = appointment.appointment_date || "N/A";
    const timeFrom = appointment.appointment_hour || "";
    const serviceName = appointment.package?.product?.name || "N/A";
    const appointmentType = appointment.appointment_type?.name || "N/A";
    const status = getAppointmentState(appointment) || "N/A";

    const row = [
      patientName,
      appointmentDate,
      timeFrom,
      serviceName,
      appointmentType,
      status,
    ];

    xPosition = margin;
    row.forEach((cell, i) => {
      doc.text(String(cell), xPosition, yPosition);
      xPosition += columnWidths[i];
    });

    yPosition += 8;

    if (index < filteredAppointments.value.length - 1) {
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
      doc.setDrawColor(0, 0, 0);
      yPosition += 4;
    }
  });

  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(`Total citas: ${filteredAppointments.value.length}`, margin, 280);
  doc.text("Sistema de Gestión Médica - Vitalink", pageWidth / 2, 280, {
    align: "center",
  });

  const fileName =
    tab.value === 1
      ? `Reporte_Citas_Valoracion_${new Date().toISOString().slice(0, 10)}.pdf`
      : `Reporte_Procedimientos_${new Date().toISOString().slice(0, 10)}.pdf`;

  doc.save(fileName);
};

interface TabFilter {
  label: string;
  value: string;
  aria: string;
}

const tabFilters: TabFilter[] = [
  {
    label: "Citas de valoración",
    value: "VALORATION",
    aria: "valoration-appointments-tab",
  },
  {
    label: "Procedimientos",
    value: "PROCEDURES",
    aria: "procedures-tab",
  },
];

interface SortOption {
  label: string;
  value: string;
}

const sortOptions: SortOption[] = [
  { label: "Fecha", value: "fecha" },
  { label: "Nombre", value: "nombre" },
];

const setSort = (value: string): void => {
  sortOption.value = value;
};

provide("refreshAppointments", refreshAppointments);
</script>

<template>
  <NuxtLayout name="medicos-dashboard">
    <header class="appointment-tracking__header">
      <nav class="breadcrumb-nav" aria-label="Navegación de migas de pan">
        <ol class="breadcrumb-nav__list">
          <li class="breadcrumb-nav__item">
            <NuxtLink
              href="/medicos/inicio"
              class="breadcrumb-nav__link breadcrumb-nav__link--muted"
            >
              Inicio
            </NuxtLink>
          </li>
          <li
            class="breadcrumb-nav__item breadcrumb-nav__item--active"
            aria-current="page"
          >
            <span class="breadcrumb-nav__text">Citas</span>
          </li>
        </ol>
      </nav>

      <h1 class="appointment-tracking__title">Seguimiento de Citas</h1>
    </header>

    <main class="appointment-tracking__main">
      <nav class="appointments-tabs" aria-label="Filtros de citas médicas">
        <ul class="appointments-tabs__list" role="tablist">
          <li
            class="appointments-tabs__item"
            role="presentation"
            v-for="(filter, index) in tabFilters"
            :key="filter.value"
          >
            <button
              class="appointments-tabs__button"
              :class="{
                'appointments-tabs__button--active': tab === index + 1,
              }"
              role="tab"
              :aria-selected="tab === index + 1"
              :aria-controls="filter.aria"
              :tabindex="tab === index + 1 ? 0 : -1"
              @click="changeTab(index + 1)"
              @keydown.enter="changeTab(index + 1)"
              @keydown.space.prevent="changeTab(index + 1)"
            >
              {{ filter.label }}
            </button>
          </li>
        </ul>
      </nav>

      <section
        class="appointments-toolbar"
        aria-label="Herramientas de filtrado y búsqueda"
      >
        <form
          class="appointments-toolbar__search"
          role="search"
          @submit.prevent
        >
          <div class="search-input">
            <label
              for="search-field"
              class="search-input__icon"
              id="search-icon"
            >
              <AtomsIconsSearchIcon
                size="20"
                aria-hidden="true"
                focusable="false"
              />
              <span class="visually-hidden">Buscar</span>
            </label>
            <input
              type="search"
              id="search-field"
              class="search-input__field"
              placeholder="Buscar"
              aria-label="Buscar citas por paciente, servicio o código"
              aria-describedby="search-icon"
              v-model="searchQuery"
              autocomplete="off"
            />
          </div>
        </form>

        <div class="appointments-toolbar__actions">
          <button
            type="button"
            class="button button--outline"
            @click="downloadAllAppointments"
            :disabled="!filteredAppointments.length"
            :aria-label="`Descargar reporte de ${filteredAppointments.length} citas`"
          >
            <AtomsIconsDownloadIcon
              size="20"
              aria-hidden="true"
              focusable="false"
            />
            <span class="button__text">Descargar</span>
          </button>

          <WebsiteBaseDropdown>
            <template #button>
              <span class="dropdown-button__text">Ordenar por</span>
              <span
                class="dropdown-button__icon icon-chevron-down"
                aria-hidden="true"
              />
            </template>
            <template #menu>
              <li
                v-for="option in sortOptions"
                :key="option.value"
                class="appointments-toolbar__dropdown-item"
              >
                <button
                  type="button"
                  role="menuitem"
                  class="dropdown__item"
                  @click="setSort(option.value)"
                  :aria-pressed="sortOption === option.value"
                >
                  {{ option.label }}
                </button>
              </li>
            </template>
          </WebsiteBaseDropdown>

          <WebsiteBaseDropdown>
            <template #button>
              <span class="dropdown-button__text">Estado de solicitud:</span>
              <div class="badges-container" aria-live="polite">
                <span
                  v-for="status in selectedStatusBadges"
                  :key="status"
                  class="badge"
                  :aria-label="`Filtro activo: ${status}`"
                >
                  {{ status }}
                  <button
                    v-if="status !== 'Todos'"
                    type="button"
                    class="badge__remove"
                    @click.stop="removeStatusBadge(status)"
                    :aria-label="`Remover filtro ${status}`"
                  >
                    <AtomsIconsXIcon size="14" aria-hidden="true" />
                  </button>
                </span>
              </div>
            </template>
            <template #menu>
              <li
                v-for="status in Object.keys(statusMapping)"
                :key="status"
                class="appointments-toolbar__dropdown-item"
                role="none"
              >
                <label class="appointments-toolbar__checkbox-label">
                  <input
                    type="checkbox"
                    class="appointments-toolbar__checkbox"
                    :checked="isStatusSelected(status)"
                    @change="toggleStatusFilter(status)"
                    :aria-label="`${isStatusSelected(status) ? 'Deseleccionar' : 'Seleccionar'} filtro ${status}`"
                  />
                  <span
                    class="appointments-toolbar__checkbox-custom"
                    aria-hidden="true"
                  ></span>
                </label>
                <button
                  type="button"
                  role="menuitem"
                  class="dropdown__item"
                  @click="toggleStatusFilter(status)"
                  :aria-pressed="isStatusSelected(status)"
                >
                  {{ status }}
                </button>
              </li>
            </template>
          </WebsiteBaseDropdown>
        </div>
      </section>

      <section class="appointments-content" aria-label="Lista de citas médicas">
        <div class="card">
          <div v-if="loading" class="loading-state" aria-live="polite">
            <span class="visually-hidden">Cargando citas...</span>
          </div>

          <div
            v-else-if="!filteredAppointments.length"
            class="empty-state"
            role="status"
          >
            <p class="empty-state__message">
              No se encontraron
              {{ tab === 1 ? "citas de valoración" : "procedimientos" }} que
              coincidan con los filtros aplicados.
            </p>
          </div>

          <MedicosCitasTable
            v-else
            :appointments="filteredAppointments"
            :useDropdown="true"
            :aria-label="`Tabla con ${filteredAppointments.length} ${tab === 1 ? 'citas de valoración' : 'procedimientos'}`"
          />
        </div>
      </section>
    </main>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.appointment-tracking {
  &__header {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 1.5rem;

    @include respond-to(md) {
      margin-bottom: 2rem;
    }
  }

  &__title {
    font-family: $font-family-main;
    font-weight: 600;
    font-size: 20px;
    line-height: 20px;
    letter-spacing: 0;
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 1rem;

    @include respond-to(md) {
      gap: 1.5rem;
      margin-bottom: 3rem;
    }
  }
}

.breadcrumb-nav {
  display: flex;
  align-items: center;
  --breadcrumb-divider: "/";

  &__list {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    flex-wrap: wrap;
    gap: 0.25rem;

    li + li::before {
      content: var(--breadcrumb-divider);
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

    &--active .breadcrumb-nav__text {
      color: #6c757d;
    }
  }

  &__link {
    text-decoration: none;
    color: inherit;

    &--muted {
      color: #6c757d;
    }

    &:hover,
    &:focus-visible {
      text-decoration: underline;
      outline: 2px solid transparent;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
      border-radius: 2px;
    }
  }

  &__text {
    color: inherit;
  }
}

.appointments-tabs {
  margin-top: 1rem;

  @include respond-to(md) {
    margin-top: 1.5rem;
  }

  &__list {
    display: flex;
    list-style: none;
    padding: 0;
    gap: 0.5rem;
    border-bottom: 2px solid #e1e4ed;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    @include respond-to(sm) {
      gap: 0.75rem;
    }

    @include respond-to(md) {
      gap: 1rem;
      overflow-x: visible;
    }
  }

  &__item {
    flex-shrink: 0;
  }

  &__button {
    width: 100%;
    min-width: max-content;
    padding: 0.625rem 0;
    font-weight: 300;
    font-size: 0.875rem;
    color: #6d758f;
    background: none;
    border: none;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transform: translateY(2px);
    transition: all 0.2s ease;
    white-space: nowrap;

    @include respond-to(sm) {
      font-size: 1rem;
      padding: 0.75rem 0;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }

    &--active {
      font-weight: 600;
      color: #3541b4;
      border-bottom-color: #3541b4;
    }

    &:hover:not(&--active) {
      color: #3541b4;
    }
  }
}

.appointments-toolbar {
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

  &__search {
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 0;

    @include respond-to(sm) {
      max-width: 20rem;
    }
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

  &__dropdown-item {
    display: flex;
    gap: 0.75rem;
    padding: 0.625rem 1rem;
    align-items: center;

    &:hover {
      background-color: #f1f3f7;
    }
  }

  &__checkbox-label {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  &__checkbox {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;

    &:focus-visible + &-custom {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }

    &:checked + &-custom {
      background-color: $color-primary;
      border-color: $color-primary;

      &::after {
        opacity: 1;
      }
    }
  }

  &__checkbox-custom {
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

.search-input {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;

  &__icon {
    position: absolute;
    left: 0.75rem;
    display: flex;
    align-items: center;
    color: #6c757d;
    pointer-events: none;
    z-index: 1;
  }

  &__field {
    padding: 0.625rem 0.875rem 0.625rem 2.5rem;
    font-weight: 300;
    font-size: 0.875rem;
    color: #6d758f;
    border-radius: 8px;
    border: 1px solid #f1f3f7;
    box-shadow: 0 1px 2px #1018280d;
    background-color: #fff;
    width: 100%;
    transition: all 0.2s ease;

    @include respond-to(sm) {
      font-size: 1rem;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
      border-color: $color-primary;
      box-shadow: 0 0 0 3px rgba($color-primary, 0.2);
    }

    &::placeholder {
      @include respond-to-max(sm) {
        font-size: 0.875rem;
      }
    }
  }
}

.button--outline {
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

  &__text {
    @include respond-to-max(sm) {
      display: none;
    }
  }
}

.dropdown-button {
  &__text {
    @include respond-to-max(sm) {
      font-size: 0.875rem;
    }
  }

  &__icon {
    margin-left: 0.25rem;

    @include respond-to-max(sm) {
      margin-left: 0.125rem;
    }
  }
}

.badges-container {
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

  &__remove {
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

.appointments-content {
  flex: 1;
  min-height: 20rem;
}

.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.loading-state {
  padding: 3rem 1rem;
  text-align: center;
  color: #6c757d;
}

.empty-state {
  padding: 3rem 1rem;
  text-align: center;

  &__message {
    color: #6c757d;
    font-size: 1rem;
    margin: 0;
  }
}

.visually-hidden {
  @include visually-hidden;
}

.dropdown__item {
  width: 100%;
  text-align: left;
  padding: 0.5rem 0;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;

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

@include respond-to-max(sm) {
  .appointments-toolbar {
    &__search {
      order: -1;
      width: 100%;
    }

    &__actions {
      width: 100%;
      justify-content: space-between;
    }
  }

  .card {
    border-radius: 0;
    box-shadow: none;
    border-top: 1px solid #e1e4ed;
    border-bottom: 1px solid #e1e4ed;
  }

  .loading-state {
    padding: 2rem 1rem;
  }

  .empty-state {
    padding: 2rem 1rem;

    &__message {
      font-size: 0.875rem;
    }
  }
}

@include respond-to-max(xs) {
  .appointment-tracking {
    &__header {
      padding: 0 1rem;
    }
  }

  .appointments-tabs {
    margin: 0 -1rem 1rem;
    padding: 0 1rem;
  }

  .appointments-toolbar {
    padding: 0 1rem;
    margin: 0 -1rem 1rem;
  }

  .appointments-content {
    margin: 0 -1rem;
  }
}
</style>
