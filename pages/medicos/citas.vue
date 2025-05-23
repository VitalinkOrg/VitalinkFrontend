<script setup>
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { ref, computed } from "vue";
import { useRefreshToken } from "#imports";
definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});
const config = useRuntimeConfig();
const token = useCookie("token");
const role = useCookie("role");
const tab = ref(1);
const allAppointments = ref();
const allAppointmentsData = ref();
const searchQuery = ref("");
const sortOption = ref("date");
const activeStatus = ref("Todos");

let url;
if (role.value == "R_HOS") {
  url = "/hospital_dashboard/history_appointments";
} else {
  url = "/doctor_dashboard/history_appointments";
}

const { data: appointmentsResponse, loading } = await useFetch(
  config.public.API_BASE_URL + "/appointment/get_all",
  {
    headers: { Authorization: token.value },
    transform: (_appointments) => _appointments.data,
  }
);
if (appointmentsResponse) {
  allAppointmentsData.value = appointmentsResponse.value;
  useRefreshToken();
}

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

// const { data: appointments, loading } = await useFetch(
//   config.public.API_BASE_URL + url,
//   {
//     headers: { Authorization: token.value },
//     transform: (_appointments) => _appointments.data,
//   }
// );
const appointments = ref([
  {
    id: 1,
    patient_name: "Juan Perez",
    date: "2023-10-01",
    time_from: "10:00",
    time_to: "11:00",
    service_name: "Consulta General",
    patient_address: "Calle Falsa 123",
    appointment_type: "reserva",
    code: "ABC123",
    status: "Pendiente",
  },
  {
    id: 2,
    patient_name: "Maria Lopez",
    date: "2023-10-02",
    time_from: "12:00",
    time_to: "13:00",
    service_name: "Odontología",
    patient_address: "Avenida Siempre Viva 742",
    appointment_type: "pre-reserva",
    code: "DEF456",
    status: "Completada",
  },
  {
    id: 3,
    patient_name: "Carlos Sanchez",
    date: "2023-10-03",
    time_from: "14:00",
    time_to: "15:00",
    service_name: "Cardiología",
    patient_address: "Calle Luna 456",
    appointment_type: "pre-reserva",
    code: "GHI789",
    status: "Cancelada",
  },
  {
    id: 4,
    patient_name: "Carlos Sanchez",
    date: "2023-10-03",
    time_from: "14:00",
    time_to: "15:00",
    service_name: "Cardiología",
    patient_address: "Calle Luna 456",
    appointment_type: "pre-reserva",
    code: "GHI789",
    status: "Pendiente",
  },
  {
    id: 4,
    patient_name: "Carlos Sanchez",
    date: "2023-10-03",
    time_from: "14:00",
    time_to: "15:00",
    service_name: "Cardiología",
    patient_address: "Calle Luna 456",
    appointment_type: "reserva",
    code: "GHI789",
    status: "Valorado",
  },
]);
if (appointments) {
  allAppointments.value = appointments.value;
  useRefreshToken();
}

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
    // You might want to add a 5th tab for "Valorado" if needed
    tab.value = 1;
  }
};
</script>

<template>
  <NuxtLayout name="medicos-dashboard">
    <nav style='--bs-breadcrumb-divider: "/&quot' aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink href="/medicos/inicio" class="text-muted">Inicio</NuxtLink>
        </li>
        <li class="breadcrumb-item active fw-semibold" aria-current="page">
          Citas
        </li>
      </ol>
    </nav>
    <p>
      <span class="fw-medium fs-4">Seguimiento de Citas</span>
    </p>

    <div class="d-flex align-items-end justify-content-between mb-4">
      <ul class="nav nav-underline d-flex flex-row w-100">
        <li class="nav-item">
          <button
            class="nav-link"
            :class="tab === 1 ? 'active text-primary' : 'text-muted'"
            @click="applyFilter('ALL', 1)"
          >
            Todas las citas
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            :class="tab === 2 ? 'active text-primary' : 'text-muted'"
            @click="applyFilter('COMPLETED', 2)"
          >
            Citas Concretadas
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            :class="tab === 3 ? 'active text-primary' : 'text-muted'"
            @click="applyFilter('PENDING', 3)"
          >
            Citas Pendientes
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link"
            :class="tab === 4 ? 'active text-primary' : 'text-muted'"
            @click="applyFilter('CANCELED', 4)"
          >
            Citas Canceladas
          </button>
        </li>
      </ul>
    </div>

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
          @click="downloadAllAppointments"
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
                @click="setStatusFilter('Valorado')"
                >Valorado</a
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
      <MedicosCitasTable
        :appointments="allAppointmentsData"
        :useDropdown="true"
      />
    </div>
  </NuxtLayout>
</template>
