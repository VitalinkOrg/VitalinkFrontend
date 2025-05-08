<script setup>
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { ref } from "vue";
import { useRefreshToken } from "#imports";
definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});
const config = useRuntimeConfig();
const token = useCookie("token");
const role = useCookie("role");
const tab = ref(1);
const allAppointments = ref();

let url;
if (role.value == "R_HOS") {
  url = "/hospital_dashboard/get_patients";
} else {
  url = "/doctor_dashboard/get_patients";
}
// const { data: patients, loading } = await useFetch(
//   config.public.API_BASE_URL + url,
//   {
//     headers: { Authorization: token.value },
//     transform: (_patients) => _patients.data,
//   },
// );
const patients = [
  {
    patient_id: 1,
    patient_name: "Juan Pérez",
    date: "2023-10-01",
    time_from: "10:00",
    time_to: "11:00",
    service_name: "Consulta General",
    patient_address: "Calle Falsa 123",
    patient_phone: "4444565756",
    patient_email: "Andreamorales@gmail.com",
    code: "ABC123",
    status: "Confirmado",
  },
  {
    patient_id: 2,
    patient_name: "María López",
    date: "2023-10-02",
    time_from: "12:00",
    time_to: "13:00",
    service_name: "Odontología",
    patient_address: "Avenida Siempre Viva 742",
    patient_phone: "4444565756",
    patient_email: "Andreamorales@gmail.com",
    code: "DEF456",
    status: "Pendiente",
  },
  {
    patient_id: 3,
    patient_name: "Carlos García",
    date: "2023-10-03",
    time_from: "14:00",
    time_to: "15:00",
    service_name: "Cardiología",
    patient_address: "Calle Luna 456",
    patient_phone: "4444565756",
    patient_email: "Andreamorales@gmail.com",
    code: "GHI789",
    status: "Cancelado",
  },
];

const downloadAllPatients = () => {
  if (!patients || patients.length === 0) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPosition = 20;

  // Add title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Reporte de Pacientes", pageWidth / 2, yPosition, {
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
  const headers = ["Paciente", "Direccion", "Telefono", "Correo"];
  const columnWidths = [40, 50, 40, 40];
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

  patients.forEach((patient, index) => {
    // Check if we need a new page
    if (yPosition > 270) {
      doc.addPage();
      yPosition = 20;
    }

    const row = [
      patient.patient_name,
      patient.patient_address,
      patient.patient_phone,
      patient.patient_email,
    ];

    xPosition = margin;
    row.forEach((cell, i) => {
      doc.text(cell, xPosition, yPosition);
      xPosition += columnWidths[i];
    });

    yPosition += 8;

    // Add light gray line between rows
    if (index < patients.length - 1) {
      doc.setDrawColor(220, 220, 220);
      doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
      doc.setDrawColor(0, 0, 0); // Reset to black
      yPosition += 4;
    }
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(`Total pacientes: ${patients.length}`, margin, 280);
  doc.text("Sistema de Gestión Médica - Vitalink", pageWidth / 2, 280, {
    align: "center",
  });

  // Save the PDF
  doc.save(`Reporte_Pacientes_${new Date().toISOString().slice(0, 10)}.pdf`);
};
</script>

<template>
  <NuxtLayout name="medicos-dashboard">
    <nav style="--bs-breadcrumb-divider: &quot;/&quot;" aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink href="/medicos/inicio" class="text-muted">Inicio</NuxtLink>
        </li>
        <li class="breadcrumb-item active fw-semibold" aria-current="page">
          Pacientes
        </li>
      </ol>
    </nav>
    <p>
      <span class="fw-medium fs-4">Mis Pacientes</span>
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
        <button disabled class="btn btn-outline-dark text-nowrap me-2">
          + Nuevo Paciente
        </button>
        <button
          class="btn btn-outline-dark text-nowrap me-2"
          @click="downloadAllPatients"
        >
          <AtomsIconsDownloadIcon /> Descargar
        </button>
        <div class="dropdown">
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
      </div>
    </div>

    <div class="card">
      <MedicosPatientsTable :patients="patients" />
    </div>
  </NuxtLayout>
</template>
