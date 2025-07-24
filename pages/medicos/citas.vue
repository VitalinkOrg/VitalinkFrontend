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
const activeStatus = ref("Todos");

// Enhanced loading states
const loading = ref(false);
const isRefreshing = ref(false); // Separate loading state for refresh
const previousAppointments = ref([]); // Initialize previous data store

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
  previousAppointments.value = appointmentsResponse.value; // Store initial data
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
        // Add a unique key to prevent caching during refresh
        key: isRefresh ? `appointments-${Date.now()}` : "appointments",
      }
    );

    if (data.value) {
      // Store previous data before updating
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

// Refresh function to expose (optimized for smooth refresh)
const refreshAppointments = async () => {
  await fetchAppointments(true); // Pass true to indicate this is a refresh
};

// Provide the refresh function to child components
provide("refreshAppointments", refreshAppointments);

// Handle refresh events from child components
const handleRefresh = async () => {
  await refreshAppointments();
};

// Expose handler for child components
provide("handleRefresh", handleRefresh);

// Computed property for all appointments (using the enhanced data source)
const allAppointments = computed(() => {
  return appointmentsData.value || [];
});

// Computed property for filtered appointments
const filteredAppointments = computed(() => {
  let filtered = allAppointments.value;

  // Apply status filter
  if (activeStatus.value !== "Todos") {
    filtered = filtered.filter(
      (appointment) => appointment.status === activeStatus.value
    );
  }

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(
      (appointment) =>
        appointment.patient_name.toLowerCase().includes(query) ||
        appointment.service_name.toLowerCase().includes(query) ||
        appointment.code.toLowerCase().includes(query)
    );
  }

  // Apply sorting
  filtered = [...filtered].sort((a, b) => {
    if (sortOption.value === "date") {
      return new Date(a.date) - new Date(b.date);
    } else if (sortOption.value === "name") {
      return a.patient_name.localeCompare(b.patient_name);
    }
    return 0;
  });

  return filtered;
});

// PDF download function (unchanged)
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

  // Table content
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  allAppointments.value.forEach((appointment, index) => {
    // Check if we need a new page
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    const row = [
      appointment.patient_name,
      appointment.date,
      `${appointment.time_from} - ${appointment.time_to}`,
      appointment.service_name,
      appointment.appointment_type,
      appointment.status,
    ];

    xPosition = margin;
    row.forEach((cell, i) => {
      doc.text(cell, xPosition, yPosition);
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

// Filter functions (unchanged)
const applyFilter = (statusFilter, tabNumber) => {
  if (statusFilter === "ALL") {
    activeStatus.value = "Todos";
  } else if (statusFilter === "COMPLETED") {
    activeStatus.value = "Completada";
  } else if (statusFilter === "PENDING") {
    activeStatus.value = "Pendiente";
  } else if (statusFilter === "CANCELED") {
    activeStatus.value = "Cancelada";
  } else if (statusFilter === "VALORADO") {
    activeStatus.value = "Valorado";
  }
  tab.value = tabNumber;
};

const setStatusFilter = (status) => {
  activeStatus.value = status;

  // Update the tab to match the status
  if (status === "Todos") {
    tab.value = 1;
  } else if (status === "Completada") {
    tab.value = 2;
  } else if (status === "Pendiente") {
    tab.value = 3;
  } else if (status === "Cancelada") {
    tab.value = 4;
  } else if (status === "Valorado") {
    tab.value = 1; // or create tab.value = 5 if you want a separate tab
  }
};

const tabFilters = [
  { label: "Todas las citas", value: "ALL", aria: "all-appointments-tab" },
  {
    label: "Citas Concretadas",
    value: "COMPLETED",
    aria: "completed-appointments-tab",
  },
  {
    label: "Citas Pendientes",
    value: "PENDING",
    aria: "pending-appointments-tab",
  },
  {
    label: "Citas Canceladas",
    value: "CANCELED",
    aria: "canceled-appointments-tab",
  },
];

const sortOptions = [
  { label: "Fecha", value: "fecha" },
  { label: "Nombre", value: "nombre" },
];

const statusOptions = [
  "Todos",
  "Pendiente",
  "Valorado",
  "Completada",
  "Cancelada",
];

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
            role="tab"
            :aria-selected="tab === index + 1"
            :aria-controls="filter.aria"
            :class="{ 'appointments-tabs__button--active': tab === index + 1 }"
            @click="applyFilter(filter.value, index + 1)"
            @keydown.enter="applyFilter(filter.value, index + 1)"
            @keydown.space.prevent="applyFilter(filter.value, index + 1)"
          >
            <span class="visually-hidden">Mostrar </span>{{ filter.label
            }}<span class="visually-hidden" v-if="tab === index + 1"
              >, pestaña activa</span
            >
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
            <li v-for="option in sortOptions" :key="option.value">
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
            <span class="badge">
              {{ activeStatus }}
              <AtomsIconsTimesXIcon />
            </span>
          </template>
          <template #menu>
            <li v-for="status in statusOptions" :key="status">
              <button
                type="button"
                role="menuitem"
                class="dropdown__item"
                @click="setStatusFilter(status)"
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
        :appointments="allAppointmentsData"
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
    font-family: Montserrat, sans-serif;
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

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: 16px;
  padding: 2px 6px;
  background-color: #f2f4f7;
  font-weight: 500;
  font-size: 12px;
  line-height: 18px;
  color: #344054;
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
