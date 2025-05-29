<script setup>
import { ref, watch, computed } from "vue";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { useRefreshToken } from "#imports";

definePageMeta({
  middleware: ["auth-insurances"],
});

const config = useRuntimeConfig();
const token = useCookie("token");

// Enhanced loading states
const loading = ref(false);
const isRefreshing = ref(false); // Separate loading state for refresh
const previousCredits = ref([]); // Initialize previous data store

// First declare creditsResponse
const creditsData = ref(null);

// Then declare computed property for credits data
const creditsDataComputed = computed(() => {
  return creditsData.value || previousCredits.value;
});

// Original useFetch for initial data load
const { data: vouchersResponse, pending: pendingVouchers } = await useFetch(
  config.public.API_BASE_URL + "/appointmentcredit/get_all",
  {
    headers: { Authorization: token.value },
    transform: (_vouchers) => _vouchers.data,
  }
);

// Initialize data
if (vouchersResponse.value) {
  creditsData.value = vouchersResponse.value;
  previousCredits.value = vouchersResponse.value; // Store initial data
  useRefreshToken();
} else {
  // Initialize with empty array if no data
  creditsData.value = [];
  previousCredits.value = [];
}

// Create refresh function
const fetchCredits = async (isRefresh = false) => {
  if (isRefresh) {
    isRefreshing.value = true;
  } else {
    loading.value = true;
  }

  try {
    const { data } = await useFetch(
      config.public.API_BASE_URL + "/appointmentcredit/get_all",
      {
        headers: { Authorization: token.value },
        transform: (_vouchers) => _vouchers.data,
        server: false,
        // Add a unique key to prevent caching during refresh
        key: isRefresh ? `credits-${Date.now()}` : "credits",
      }
    );

    if (data.value) {
      // Store previous data before updating
      if (creditsData.value) {
        previousCredits.value = creditsData.value;
      }

      creditsData.value = data.value;
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
  creditsData,
  (newVal, oldVal) => {
    if (oldVal && newVal !== oldVal) {
      previousCredits.value = oldVal;
    }
  },
  { deep: true }
);

// Refresh function to expose (optimized for smooth refresh)
const refreshCredits = async () => {
  await fetchCredits(true); // Pass true to indicate this is a refresh
};

// Provide the refresh function to child components
provide("refreshCredits", refreshCredits);

// Handle refresh events from child components
const handleRefresh = async () => {
  await refreshCredits();
};

// Expose handler for child components
provide("handleRefresh", handleRefresh);

// Computed property for vouchers (using the enhanced data source)
const vouchers = computed(() => {
  return creditsDataComputed.value || [];
});

// Filter logic
const activeStatus = ref("Todos"); // Default filter

const filteredVouchers = computed(() => {
  let filtered = vouchers.value;

  if (activeStatus.value === "Todos") {
    return filtered;
  } else {
    return filtered.filter((voucher) => {
      // Handle different status labels if needed
      if (activeStatus.value === "Completada")
        return voucher.status === "Confirmada";
      if (activeStatus.value === "Cancelada")
        return voucher.status === "Rechazada";
      return voucher.status === activeStatus.value;
    });
  }
});

const setStatusFilter = (status) => {
  activeStatus.value = status;
};

const downloadAllCredits = () => {
  const currentVouchers = vouchers.value;
  if (!currentVouchers || currentVouchers.length === 0) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPosition = 20;

  // Add title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Reporte de Solicitudes de Crédito", pageWidth / 2, yPosition, {
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

  // Table headers - Adjusted column widths
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  const headers = [
    "Paciente",
    "Procedimiento",
    "Monto",
    "Estado",
    "Proveedor",
    "Fecha",
  ];
  const columnWidths = [30, 40, 20, 25, 45, 25]; // More space for provider
  const columnPositions = [margin];
  for (let i = 1; i < columnWidths.length; i++) {
    columnPositions[i] = columnPositions[i - 1] + columnWidths[i - 1];
  }

  // Draw headers
  headers.forEach((header, i) => {
    doc.text(header, columnPositions[i], yPosition);
  });
  yPosition += 8;

  // Draw line under headers
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Table content
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  currentVouchers.forEach((credit, index) => {
    // Check if we need a new page
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    const originalY = yPosition;
    let maxLines = 1;

    // Process each cell with text wrapping
    const cells = [
      { text: credit.patient_name || "N/A", width: columnWidths[0] },
      { text: credit.reason_for_request || "N/A", width: columnWidths[1] },
      { text: `$${credit.requested_amount || 0}`, width: columnWidths[2] },
      { text: credit.status || "N/A", width: columnWidths[3] },
      { text: credit.service_provider || "N/A", width: columnWidths[4] },
      {
        text: credit.created_at
          ? new Date(credit.created_at).toLocaleDateString("es-ES")
          : new Date().toLocaleDateString("es-ES"),
        width: columnWidths[5],
      },
    ];

    // First pass to calculate needed lines
    cells.forEach((cell, i) => {
      if (i !== 2 && i !== 3 && i !== 5) {
        // Skip wrapping for amount, status and date
        const lines = doc.splitTextToSize(cell.text, cell.width - 2);
        maxLines = Math.max(maxLines, lines.length);
      }
    });

    // Draw cells
    cells.forEach((cell, i) => {
      doc.setFontSize(10);
      if (i === 2) doc.setTextColor(40, 100, 40); // Green for amounts

      if (i !== 2 && i !== 3 && i !== 5) {
        // Wrap these columns
        const lines = doc.splitTextToSize(cell.text, cell.width - 2);
        doc.text(
          lines,
          columnPositions[i],
          yPosition + (maxLines - lines.length) * 5
        );
      } else {
        doc.text(cell.text, columnPositions[i], yPosition);
      }

      if (i === 2) doc.setTextColor(0); // Reset color
    });

    yPosition += maxLines * 6;

    // Add light gray line between rows
    if (index < currentVouchers.length - 1) {
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
      doc.setDrawColor(0, 0, 0);
      yPosition += 4;
    }
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(`Total solicitudes: ${currentVouchers.length}`, margin, 280);
  doc.text("Sistema de Gestión Médica - Vitalink", pageWidth / 2, 280, {
    align: "center",
  });

  doc.save(`Reporte_Creditos_${new Date().toISOString().slice(0, 10)}.pdf`);
};
provide("refreshAppointments", refreshCredits);
</script>

<template>
  <NuxtLayout name="aseguradoras-dashboard">
    <nav style="--bs-breadcrumb-divider: &quot;/&quot;" aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink href="/socio-financiero/inicio" class="text-muted"
            >Inicio</NuxtLink
          >
        </li>
      </ol>
    </nav>
    <p>
      <span class="fw-medium fs-4">Solicitudes de Crédito de Pacientes</span>
    </p>

    <div class="row mb-4">
      <div class="col-auto">
        <div class="input-group shadow-sm">
          <span
            class="input-group-text bg-transparent border-end-0 rounded-start-3"
            id="basic-addon1"
          >
            <AtomsIconsSearchIcon />
          </span>
          <input
            type="text"
            class="form-control border-start-0 rounded-end-3"
            placeholder="Buscar"
            aria-label="Buscar"
            aria-describedby="basic-addon1"
          />
        </div>
      </div>
      <div class="col-auto ms-auto d-flex">
        <button
          class="btn btn-outline-dark text-nowrap me-2"
          @click="downloadAllCredits"
        >
          <AtomsIconsDownloadIcon /> Descargar
        </button>
        <div class="dropdown me-2">
          <button
            class="btn btn-outline-dark dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Ordenar por
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#">Action</a></li>
            <li><a class="dropdown-item" href="#">Another action</a></li>
            <li><a class="dropdown-item" href="#">Something else here</a></li>
          </ul>
        </div>
        <div class="dropdown">
          <button
            class="btn btn-outline-dark dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Estado de solicitud:
            <span class="badge text-muted">{{ activeStatus }}</span>
          </button>
          <ul class="dropdown-menu">
            <li>
              <a
                class="dropdown-item"
                href="#"
                @click="setStatusFilter('Todos')"
                >Todos</a
              >
            </li>
            <li>
              <a
                class="dropdown-item"
                href="#"
                @click="setStatusFilter('Pendiente')"
                >Pendiente</a
              >
            </li>
            <li>
              <a
                class="dropdown-item"
                href="#"
                @click="setStatusFilter('Aprobada')"
                >Aprobada</a
              >
            </li>
            <li>
              <a
                class="dropdown-item"
                href="#"
                @click="setStatusFilter('Completada')"
                >Confirmado</a
              >
            </li>
            <li>
              <a
                class="dropdown-item"
                href="#"
                @click="setStatusFilter('Cancelada')"
                >Cancelada</a
              >
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="card">
      <AseguradorasCreditoTable
        v-if="creditsData !== null"
        :vouchers="creditsData"
      />
    </div>
  </NuxtLayout>
</template>
