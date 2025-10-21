<template>
  <UiAppointmentTableBase
    :items="appointments"
    :columns="tableColumns"
    title="Tabla de Citas Pacientes"
    aria-label="Lista de citas médicas"
    :items-per-page="itemsPerPage"
    default-sort-column="created_date"
    default-sort-direction="desc"
    empty-state-title="Aún no tienes actividad en tu tablero"
    empty-state-description="Muy pronto podrás administrar y verificar tu actividad."
    empty-state-action="Empezar"
    :show-pagination-info="false"
    @sort-changed="handleSortChange"
    @page-changed="handlePageChange"
    @empty-action="handleEmptyAction"
  >
    <template #cell-doctor="{ item }">
      <span class="appointments-table__patient-name">
        {{ item.supplier?.name || item.hospital_name }}
      </span>
    </template>

    <template #cell-appointment_date="{ value }">
      <span class="appointments-table__datetime">
        {{ new Date(value).toLocaleDateString() }}
      </span>
    </template>

    <template #cell-appointment_hour="{ value }">
      <time class="appointments-table__datetime">
        {{ value }}
      </time>
    </template>

    <template #cell-procedure="{ item }">
      <span class="appointments-table__procedure">
        {{ item.package?.procedure?.name }}
      </span>
    </template>

    <template #cell-appointment_qr_code="{ value }">
      <span class="appointments-table__procedure">
        {{ value }}
      </span>
    </template>

    <template #cell-reservation_type="{ item }">
      <span class="appointments-table__reservation-type">
        {{ item.reservation_type?.name }}
      </span>
    </template>

    <template #cell-status="{ item }">
      <PacientesAccionesEstadoCita
        :appointment="item"
        :show-status="true"
        @refresh="refreshAppointments"
      />
    </template>

    <template #cell-primary_action="{ item }">
      <PacientesAccionesEstadoCita
        :appointment="item"
        :show-status="false"
        @refresh="refreshAppointments"
      />
    </template>

    <template #cell-contact="{ item }">
      <PacientesModalesContactoMedico :appointment="item" />
    </template>

    <template #cell-actions="{ item }">
      <div class="appointments-table__dropdown">
        <button
          class="appointments-table__dropdown-toggle"
          data-bs-toggle="dropdown"
          aria-expanded="false"
          :aria-label="`Más acciones para ${item.customer.name}`"
        >
          <AtomsIconsThreeDotsHorizontalIcon />
        </button>

        <ul class="dropdown-menu" role="menu">
          <li role="none">
            <PacientesModalesDetallesCita
              :appointment="item"
              :is-open="modals.appointmentDetails === item.id"
              @open-modal="openModal"
              @close-modal="closeModal"
            />
            <PacientesModalesDejarValoracion
              :appointment="item"
              :is-open="modals.leaveReview === item.id"
              @open-modal="openModal"
              @close-modal="closeModal"
            />
            <PacientesModalesDejarValoracionExitoso
              :appointment="item"
              :is-open="modals.leaveReviewSuccess === item.id"
              @open-modal="openModal"
              @close-modal="closeModal"
            />
            <button
              class="dropdown-item"
              role="menuitem"
              @click="openModal('appointmentDetails', item.id)"
            >
              <AtomsIconsEyeIcon />
              Ver más detalles
            </button>
          </li>

          <li
            role="none"
            v-if="
              !['CONCRETED_APPOINTMENT', 'CANCEL_APPOINTMENT'].includes(
                item.status
              )
            "
          >
            <PacientesModalesAnularCita
              :appointment="item"
              :is-open="modals.cancelAppointment === item.id"
              @open-modal="openModal"
              @close-modal="closeModal"
            />
            <button
              class="dropdown-item"
              role="menuitem"
              @click="openModal('cancelAppointment', item.id)"
            >
              <AtomsIconsEyeIcon />
              Anular Cita
            </button>
          </li>

          <li role="none">
            <button
              class="dropdown-item"
              role="menuitem"
              @click="downloadSummary(item)"
            >
              <AtomsIconsArrowDownToLineIcon />
              Descargar Resumen
            </button>
          </li>
        </ul>
      </div>
    </template>

    <template #empty-state>
      <div class="card-body d-flex py-5">
        <div class="col-sm-5 text-end">
          <AtomsIconsChartVacio />
        </div>
        <div class="col-sm-7">
          <p class="fs-5 text-muted fw-medium">
            Aún no tienes actividad en tu tablero
          </p>
          <p class="fw-light text-secondary">
            Muy pronto podrás administrar y verificar tu actividad.
          </p>
          <button
            class="btn btn-primary border-danger"
            @click="handleEmptyAction"
          >
            Empezar
          </button>
        </div>
      </div>
    </template>
  </UiAppointmentTableBase>
</template>

<script setup lang="ts">
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { TableColumn } from "../ui/appointment-table-base.vue";

defineEmits(["refreshed"]);

const refreshAppointments = inject<(() => void) | undefined>(
  "refreshAppointments"
);
const token = useCookie("token");
const config = useRuntimeConfig();

interface Props {
  appointments: any[];
  itemsPerPage?: number;
}

withDefaults(defineProps<Props>(), {
  itemsPerPage: 10,
});

const tableColumns: TableColumn[] = [
  {
    key: "doctor",
    label: "Doctor",
    width: "9.375rem",
    sortField: "supplier.name",
  },
  {
    key: "appointment_date",
    label: "Fecha de cita",
    width: "7.5rem",
  },
  {
    key: "appointment_hour",
    label: "Hora",
    width: "7.5rem",
  },
  {
    key: "procedure",
    label: "Procedimiento",
    width: "11.25rem",
    sortField: "package.procedure.name",
  },
  {
    key: "appointment_qr_code",
    label: "Codigo de reserva",
    width: "7.5rem",
  },
  {
    key: "reservation_type",
    label: "Tipo de reserva",
    width: "10rem",
    sortField: "reservation_type.name",
  },
  {
    key: "status",
    label: "Estado de cita",
    width: "9.375rem",
    sortField: "appointment_status.code",
  },
  {
    key: "primary_action",
    label: "Accion Principal",
    width: "8.125rem",
    sortable: false,
    cellClass: "appointments-table__cell--center",
  },
  {
    key: "contact",
    label: "Contacto",
    width: "5rem",
    sortable: false,
    cellClass: "appointments-table__cell--center",
  },
  {
    key: "actions",
    label: "",
    width: "3.75rem",
    sortable: false,
    cellClass: "appointments-table__cell--actions",
  },
];

const modals = reactive({
  appointmentDetails: null as number | null,
  cancelAppointment: null as number | null,
  successfulPayment: null as number | null,
  payAppointment: null as number | null,
  scheduleProcedure: null as number | null,
  scheduleProcedureSuccess: null as number | null,
  leaveReview: null as number | null,
  leaveReviewSuccess: null as number | null,
  applyCredit: null as number | null,
  applyCreditSuccess: null as number | null,
});

const closeModal = (modalName: keyof typeof modals) => {
  modals[modalName] = null;
};

const openModal = (
  modalName: keyof typeof modals,
  appointmentId: number | null = null
) => {
  modals[modalName] = appointmentId;
};

const handleSortChange = ({
  column,
  direction,
}: {
  column: string;
  direction: "asc" | "desc";
}) => {
  console.log(`Ordenando por ${column} en dirección ${direction}`);
};

const handlePageChange = (page: number) => {
  console.log(`Cambio a página ${page}`);
};

const handleEmptyAction = () => {
  console.log("Acción del estado vacío");
};

const downloadSummary = async (appointment: any) => {
  try {
    try {
      const { data, error } = await useFetch(
        `${config.public.API_BASE_URL}/appointment/summary/${appointment.id}`,
        {
          method: "GET",
          headers: { Authorization: token.value as string },
        }
      );

      if (data.value && !error.value) {
        downloadFile(
          data.value,
          `resumen-${appointment.appointment_qr_code}.pdf`
        );
        return;
      }
    } catch (apiError) {
      console.warn("API no disponible, generando resumen local:", apiError);
    }

    const summaryData = generateSummaryData(appointment);
    generateLocalSummary(summaryData);
  } catch (error) {
    console.error("Error al descargar resumen:", error);
    alert("Error al generar el resumen. Por favor, intenta nuevamente.");
  }
};

const generateSummaryData = (appointment: any) => {
  return {
    qrCode: appointment.appointment_qr_code,
    patientName: appointment.customer?.name,
    doctorName: appointment.supplier?.name || appointment.hospital_name,
    date: new Date(appointment.appointment_date).toLocaleDateString(),
    time: appointment.appointment_hour,
    procedure: appointment.package?.procedure?.name,
    status: appointment.appointment_status?.value1,
    reservationType: appointment.reservation_type?.name,
    cost:
      appointment.appointment_type?.code === "VALORATION_APPOINTMENT"
        ? appointment.price_valoration_appointment
        : appointment.price_procedure,
    phone: appointment.customer?.phone_number,
    paymentStatus: appointment.payment_status?.value1 || "Pendiente",
  };
};
const generateLocalSummary = (data: any) => {
  if (!process.client) return;

  const doc = new jsPDF();
  (doc as any).autoTable = autoTable;

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPosition = 20;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Resumen de Cita Médica", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generado el: ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    yPosition,
    { align: "center" }
  );
  yPosition += 15;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Información General", margin, yPosition);
  yPosition += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Código de Reserva: ${data.qrCode}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Estado: ${data.status}`, margin, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Datos del Paciente", margin, yPosition);
  yPosition += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Nombre: ${data.patientName}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Teléfono: ${data.phone || "No disponible"}`, margin, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Datos de la Cita", margin, yPosition);
  yPosition += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Doctor/Centro: ${data.doctorName}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Fecha: ${data.date}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Hora: ${data.time}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Procedimiento: ${data.procedure}`, margin, yPosition);
  yPosition += 6;
  doc.text(`Tipo de Reserva: ${data.reservationType}`, margin, yPosition);
  yPosition += 10;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Información Financiera", margin, yPosition);
  yPosition += 8;

  (doc as any).autoTable({
    startY: yPosition,
    head: [["Costo del Servicio", "Estado de Pago"]],
    body: [[`₡${data.cost || "No disponible"}`, data.paymentStatus]],
    theme: "grid",
    styles: { fontSize: 10, halign: "center" },
    headStyles: { fillColor: [41, 128, 185] },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(
    "Este documento es un resumen oficial de la cita médica registrada",
    pageWidth / 2,
    yPosition,
    { align: "center" }
  );
  yPosition += 5;
  doc.text("Sistema de Gestión Médica - Vitalink", pageWidth / 2, yPosition, {
    align: "center",
  });

  doc.save(`resumen-cita-${data.qrCode}.pdf`);
};

const downloadFile = (fileData: any, filename: string) => {
  if (!process.client) return;

  const blob = new Blob([fileData], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    const openModalKey = Object.keys(modals).find(
      (key) => modals[key as keyof typeof modals] !== null
    );
    if (openModalKey) {
      closeModal(openModalKey as keyof typeof modals);
    }
  }
};

onMounted(() => {
  if (process.client) {
    document.addEventListener("keydown", handleKeydown);
  }
});

onUnmounted(() => {
  if (process.client) {
    document.removeEventListener("keydown", handleKeydown);
  }
});
</script>

<style lang="scss" scoped>
.appointments-table {
  &__patient-name,
  &__procedure,
  &__reservation-type,
  &__datetime {
    font-family: $font-family-main;
    font-weight: 300;
    font-size: 0.75rem;
    color: $color-foreground;
    line-height: 1.25rem;
  }

  &__dropdown {
    position: relative;
  }

  &__dropdown-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: none;
    border-radius: 0.375rem;
    background: transparent;
    color: #6c757d;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: #f8f9fa;
      color: $color-primary;
    }

    &:focus-visible {
      outline: 0.125rem solid $color-primary;
      outline-offset: 0.125rem;
    }
  }
}
.dropdown-menu {
  padding: 0;
  margin: 0;
  overflow: hidden;
}

.dropdown-item {
  @include label-base;
  display: flex;
  align-items: center;
  gap: 0.9375rem;
  font-weight: 400;
  font-size: 0.875rem;
  line-height: 1.25rem;
  padding: 0.625rem 0.875rem;
  color: #353e5c;

  &:hover {
    background-color: #f1f3f7;
  }

  svg {
    color: $color-primary;
    width: 1rem;
    height: 1rem;
  }
}
</style>
