<script setup>
/*definePageMeta({
  middleware: ["auth-insurances"],
});*/
import { ref, watch, computed } from "vue";
import { jsPDF } from "jspdf";
import "jspdf-autotable";
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

const activeStatus = ref("Todos"); // Default filter
const filteredVouchers = ref(vouchers); // Initially show all vouchers

const setStatusFilter = (status) => {
  activeStatus.value = status;

  if (status === "Todos") {
    filteredVouchers.value = vouchers;
  } else {
    filteredVouchers.value = vouchers.filter((voucher) => {
      // Handle different status labels if needed
      if (status === "Completada") return voucher.status === "Confirmada";
      if (status === "Cancelada") return voucher.status === "Rechazada";
      return voucher.status === status;
    });
  }
};

const downloadAllCredits = () => {
  if (!vouchers || vouchers.length === 0) return;

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

  vouchers.forEach((credit, index) => {
    // Check if we need a new page
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    const originalY = yPosition;
    let maxLines = 1;

    // Process each cell with text wrapping
    const cells = [
      { text: credit.patient_name, width: columnWidths[0] },
      { text: credit.reason_for_request, width: columnWidths[1] },
      { text: `$${credit.requested_amount}`, width: columnWidths[2] },
      { text: credit.status, width: columnWidths[3] },
      { text: credit.service_provider, width: columnWidths[4] },
      { text: new Date().toLocaleDateString("es-ES"), width: columnWidths[5] },
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
    if (index < vouchers.length - 1) {
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
      doc.setDrawColor(0, 0, 0);
      yPosition += 4;
    }
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(`Total solicitudes: ${vouchers.length}`, margin, 280);
  doc.text("Sistema de Gestión Médica - Vitalink", pageWidth / 2, 280, {
    align: "center",
  });

  doc.save(`Reporte_Creditos_${new Date().toISOString().slice(0, 10)}.pdf`);
};
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
        v-if="filteredVouchers !== null"
        :vouchers="filteredVouchers"
      />
    </div>
  </NuxtLayout>
</template>
