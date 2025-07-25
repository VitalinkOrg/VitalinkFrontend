<!-- page/medicos/citas.vue -->
<script setup>
import { useRefreshToken } from "#imports";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { computed, ref, watch } from "vue";

definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});

const config = useRuntimeConfig();
const token = useCookie("token");
const role = useCookie("role");
const tab = ref(1);
const searchQuery = ref("");
const sortOption = ref("date");

// Multiple status selection
const selectedStatuses = ref(new Set(["Todos"]));

// Status mapping
const statusMapping = {
  Pendiente: "Pendiente",
  Completada: "Concretado",
  Cancelada: "Cancelada",
  Todos: "Todos",
};

// Enhanced loading states
const loading = ref(false);
const isRefreshing = ref(false);
const previousAppointments = ref([]);

// First declare appointmentsResponse
const allAppointmentsData = ref(null);

// Then declare computed property for appointments data
const appointmentsData = computed(() => {
  return allAppointmentsData.value || previousAppointments.value;
});

// Determine URL based on role
let url;
if (role.value == "R_HOS") {
  url = "/hospital_dashboard/history_appointments";
} else {
  url = "/doctor_dashboard/history_appointments";
}

// Original useFetch for initial data load
const { data: appointmentsResponse } = await useFetch(
  config.public.API_BASE_URL + "/appointment/get_all",
  {
    headers: { Authorization: token.value },
    transform: (_appointments) => _appointments.data,
  }
);

// Initialize data
if (appointmentsResponse.value) {
  allAppointmentsData.value = appointmentsResponse.value;
  previousAppointments.value = appointmentsResponse.value;
  useRefreshToken();
}

// Create refresh function
const fetchAppointments = async (isRefresh = false) => {
  if (isRefresh) {
    isRefreshing.value = true;
  } else {
    loading.value = true;
  }

  try {
    const { data } = await useFetch(
      config.public.API_BASE_URL + "/appointment/get_all",
      {
        headers: { Authorization: token.value },
        transform: (_appointments) => _appointments.data,
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

// Watch for changes and store previous data
watch(
  allAppointmentsData,
  (newVal, oldVal) => {
    if (oldVal && newVal !== oldVal) {
      previousAppointments.value = oldVal;
    }
  },
  { deep: true }
);

// Refresh function to expose
const refreshAppointments = async () => {
  await fetchAppointments(true);
};

provide("refreshAppointments", refreshAppointments);

// Handle refresh events from child components
const handleRefresh = async () => {
  await refreshAppointments();
};

provide("handleRefresh", handleRefresh);

// Computed property for all appointments
const allAppointments = computed(() => {
  return appointmentsData.value || [];
});

// Computed property for filtered appointments - MEJORADO
const filteredAppointments = computed(() => {
  let filtered = allAppointments.value;

  // Apply status filter - multiple selection
  if (!selectedStatuses.value.has("Todos")) {
    const mappedStatuses = Array.from(selectedStatuses.value).map(
      (status) => statusMapping[status]
    );
    filtered = filtered.filter((appointment) => {
      // Verificar diferentes posibles campos de estado
      const appointmentStatus =
        appointment.status ||
        appointment.appointment_status?.name ||
        appointment.appointment_status?.value1 ||
        "";

      return mappedStatuses.includes(appointmentStatus);
    });
  }

  // Apply search filter - MEJORADO
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter((appointment) => {
      // Buscar en múltiples campos posibles
      const patientName =
        appointment.patient_name ||
        appointment.customer?.name ||
        appointment.customer?.first_name +
          " " +
          (appointment.customer?.last_name || "") ||
        "";

      const serviceName =
        appointment.service_name ||
        appointment.procedure?.name ||
        appointment.product?.name ||
        "";

      const appointmentCode =
        appointment.code ||
        appointment.procedure?.code ||
        appointment.id?.toString() ||
        "";

      return (
        patientName.toLowerCase().includes(query) ||
        serviceName.toLowerCase().includes(query) ||
        appointmentCode.toLowerCase().includes(query)
      );
    });
  }

  // Apply sorting
  filtered = [...filtered].sort((a, b) => {
    if (sortOption.value === "date" || sortOption.value === "fecha") {
      const dateA = new Date(a.date || a.appointment_date || "");
      const dateB = new Date(b.date || b.appointment_date || "");
      return dateA - dateB;
    } else if (sortOption.value === "name" || sortOption.value === "nombre") {
      const nameA = (
        a.patient_name ||
        a.customer?.name ||
        a.customer?.first_name + " " + (a.customer?.last_name || "") ||
        ""
      ).toLowerCase();

      const nameB = (
        b.patient_name ||
        b.customer?.name ||
        b.customer?.first_name + " " + (b.customer?.last_name || "") ||
        ""
      ).toLowerCase();

      return nameA.localeCompare(nameB);
    }
    return 0;
  });

  return filtered;
});

// Status filter functions
const toggleStatusFilter = (status) => {
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

const isStatusSelected = (status) => {
  return selectedStatuses.value.has(status);
};

const removeStatusBadge = (status) => {
  const newSelectedStatuses = new Set(selectedStatuses.value);
  newSelectedStatuses.delete(status);

  if (newSelectedStatuses.size === 0) {
    newSelectedStatuses.add("Todos");
  }

  selectedStatuses.value = newSelectedStatuses;
};

const selectedStatusBadges = computed(() => {
  if (selectedStatuses.value.has("Todos")) {
    return ["Todos"];
  }
  return Array.from(selectedStatuses.value);
});

const downloadAllAppointments = () => {
  if (!allAppointments.value || allAppointments.value.length === 0) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPosition = 20;

  // Add title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Reporte de Citas Médicas", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 10;

  // Add date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generado el: ${new Date().toLocaleDateString("es-ES")}`,
    pageWidth / 2,
    yPosition,
    { align: "center" }
  );
  yPosition += 15;

  // Table headers
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  const headers = ["Paciente", "Fecha", "Hora", "Servicio", "Tipo", "Estado"];
  const columnWidths = [40, 30, 25, 45, 25, 25];
  let xPosition = margin;

  // Draw headers
  headers.forEach((header, i) => {
    doc.text(header, xPosition, yPosition);
    xPosition += columnWidths[i];
  });
  yPosition += 8;

  // Draw line under headers
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Table content - MEJORADO para usar datos reales de la API
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  allAppointments.value.forEach((appointment, index) => {
    // Check if we need a new page
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    // Extraer datos con fallbacks
    const patientName =
      appointment.patient_name ||
      appointment.customer?.name ||
      appointment.customer?.first_name +
        " " +
        (appointment.customer?.last_name || "") ||
      "N/A";

    const appointmentDate =
      appointment.date || appointment.appointment_date || "N/A";

    const timeFrom =
      appointment.time_from || appointment.appointment_hour || "";
    const timeTo = appointment.time_to || "";
    const timeRange = timeTo ? `${timeFrom} - ${timeTo}` : timeFrom;

    const serviceName =
      appointment.service_name ||
      appointment.procedure?.name ||
      appointment.product?.name ||
      "N/A";

    const appointmentType =
      appointment.appointment_type ||
      appointment.reservation_type?.name ||
      "N/A";

    const status =
      appointment.status || appointment.appointment_status?.name || "N/A";

    const row = [
      patientName,
      appointmentDate,
      timeRange,
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

    // Add light gray line between rows
    if (index < allAppointments.value.length - 1) {
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
      doc.setDrawColor(0, 0, 0); // Reset to black
      yPosition += 4;
    }
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(`Total citas: ${allAppointments.value.length}`, margin, 280);
  doc.text("Sistema de Gestión Médica - Vitalink", pageWidth / 2, 280, {
    align: "center",
  });

  // Save the PDF
  doc.save(`Reporte_Citas_${new Date().toISOString().slice(0, 10)}.pdf`);
};

const tabFilters = [
  { label: "Citas de valoración", value: "ALL", aria: "all-appointments-tab" },
  {
    label: "Procedimientos",
    value: "PROCEDURES",
    aria: "all-procedures-tab",
  },
];

const sortOptions = [
  { label: "Fecha", value: "fecha" },
  { label: "Nombre", value: "nombre" },
];

const setSort = (value) => {
  sortOption.value = value;
};

provide("refreshAppointments", refreshAppointments);
</script>

<template>
  <NuxtLayout name="medicos-dashboard">
    <header class="appointment-tracking__header">
      <nav class="breadcrumb-nav" aria-label="Breadcrumb">
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
            :aria-selected="true"
            :aria-controls="filter.aria"
            @click="tab = index + 1"
          >
            <span class="visually-hidden">Mostrar </span>{{ filter.label }}
            <span class="visually-hidden">, pestaña activa</span>
          </button>
        </li>
      </ul>
    </nav>

    <section class="appointments-toolbar">
      <form class="appointments-toolbar__search" role="search" @submit.prevent>
        <div class="search-input">
          <label for="search-field" class="search-input__icon" id="search-icon">
            <AtomsIconsSearchIcon
              size="20"
              aria-hidden="true"
              focusable="false"
            />
            <span class="visually-hidden">Buscar</span>
          </label>
          <input
            type="text"
            id="search-field"
            class="search-input__field"
            placeholder="Buscar"
            aria-label="Buscar"
            aria-describedby="search-icon"
            v-model="searchQuery"
          />
        </div>
      </form>

      <div class="appointments-toolbar__actions">
        <button
          type="button"
          class="button button--outline"
          @click="downloadAllAppointments"
        >
          <AtomsIconsDownloadIcon
            size="20"
            aria-hidden="true"
            focusable="false"
          />
          Descargar
        </button>

        <WebsiteBaseDropdown>
          <template #button>
            Ordenar por <span class="icon-chevron-down" />
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
              >
                {{ option.label }}
              </button>
            </li>
          </template>
        </WebsiteBaseDropdown>

        <WebsiteBaseDropdown>
          <template #button>
            Estado de solicitud:
            <div class="badges-container">
              <span
                v-for="status in selectedStatusBadges"
                :key="status"
                class="badge"
              >
                {{ status }}
                <button
                  v-if="status !== 'Todos'"
                  type="button"
                  class="badge__remove"
                  @click.stop="removeStatusBadge(status)"
                  :aria-label="`Remover filtro ${status}`"
                >
                  <AtomsIconsXIcon size="14" />
                </button>
              </span>
            </div>
          </template>
          <template #menu>
            <li
              v-for="status in Object.keys(statusMapping)"
              :key="status"
              class="appointments-toolbar__dropdown-item"
            >
              <label class="appointments-toolbar__checkbox-label">
                <input
                  type="checkbox"
                  class="appointments-toolbar__checkbox"
                  :checked="isStatusSelected(status)"
                  @change="toggleStatusFilter(status)"
                  :aria-label="`${isStatusSelected(status) ? 'Deseleccionar' : 'Seleccionar'} filtro ${status}`"
                />
                <span class="appointments-toolbar__checkbox-custom"></span>
              </label>
              <button
                type="button"
                role="menuitem"
                class="dropdown__item"
                @click="toggleStatusFilter(status)"
              >
                {{ status }}
              </button>
            </li>
          </template>
        </WebsiteBaseDropdown>
      </div>
    </section>

    <div class="card">
      <MedicosCitasTable
        :appointments="filteredAppointments"
        :useDropdown="true"
      />
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.appointment-tracking {
  &__header {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__title {
    font-family: $font-family-main;
    font-weight: 600;
    font-size: 20px;
    line-height: 1.2;
    color: #19213d;
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

    li + li::before {
      content: var(--breadcrumb-divider);
      padding: 0 0.5rem;
      color: #6c757d;
    }
  }

  &__item {
    font-size: 0.875rem;

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

    &:hover {
      text-decoration: underline;
    }
  }

  &__text {
    color: inherit;
  }
}

.appointments-tabs {
  margin-top: 24px;

  &__list {
    display: flex;
    list-style: none;
    padding: 0;
    gap: 12px;
    border-bottom: 2px solid #e1e4ed;
  }

  &__button {
    width: 100%;
    padding: 10px 0;
    font-weight: 300;
    font-size: 16px;
    color: #6d758f;
    background: none;
    border: none;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transform: translateY(2px);

    &--active {
      font-weight: 600;
      color: #3541b4;
      border-bottom-color: #3541b4;
    }
  }
}

.appointments-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;

  &__search {
    display: flex;
    align-items: center;
  }

  &__actions {
    display: flex;
    align-items: center;
    margin-left: auto;
    gap: 0.75rem;
  }
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;

  &__icon {
    position: absolute;
    left: 12px;
    display: flex;
    align-items: center;
    color: #6c757d;
    pointer-events: none;
  }

  &__field {
    padding: 10px 14px 10px 40px;
    font-weight: 300;
    font-size: 16px;
    color: #6d758f;
    border-radius: 8px;
    border: 1px solid #f1f3f7;
    box-shadow: 0 1px 2px #1018280d;
    background-color: #fff;
    width: 100%;
  }
}

.button--outline {
  @include outline-button;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: #344054;
}

.badges-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-left: 8px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 16px;
  padding: 2px 8px;
  background-color: #f2f4f7;
  font-weight: 500;
  font-size: 12px;
  line-height: 18px;
  color: #344054;

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

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
      color: #344054;
    }
  }
}

.appointments-toolbar {
  &__dropdown-item {
    display: flex;
    gap: 12px;
    padding: 10px 16px;
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

    &:focus + &-custom {
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

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  border: 0;
}
</style>
