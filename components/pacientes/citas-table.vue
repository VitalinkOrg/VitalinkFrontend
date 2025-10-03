<template>
  <section
    class="appointments-table"
    role="region"
    aria-labelledby="appointments-heading"
  >
    <h2 id="appointments-heading" class="sr-only">Tabla de Citas Pacientes</h2>

    <div class="appointments-table__container" v-if="hasAppointments">
      <div class="appointments-table__wrapper">
        <table
          class="appointments-table__table"
          role="table"
          aria-label="Lista de citas médicas"
        >
          <thead class="appointments-table__header">
            <tr class="appointments-table__header-row" role="row">
              <th scope="col" class="appointments-table__header-cell">
                <button
                  class="appointments-table__sort-button"
                  @click="sortBy('doctor_name')"
                  :aria-label="
                    'Ordenar por nombre del doctor ' +
                    (sortColumn === 'doctor_name' && sortDirection === 'asc'
                      ? 'descendente'
                      : 'ascendente')
                  "
                >
                  <span class="appointments-table__header-text">Doctor</span>
                  <AtomsIconsChevronsUpDown
                    size="16"
                    :class="[
                      'appointments-table__sort-icon',
                      {
                        'appointments-table__sort-icon--active':
                          sortColumn === 'doctor_name',
                        'appointments-table__sort-icon--asc':
                          sortColumn === 'doctor_name' &&
                          sortDirection === 'asc',
                        'appointments-table__sort-icon--desc':
                          sortColumn === 'doctor_name' &&
                          sortDirection === 'desc',
                      },
                    ]"
                  />
                </button>
              </th>
              <th scope="col" class="appointments-table__header-cell">
                <button
                  class="appointments-table__sort-button"
                  @click="sortBy('appointment_date')"
                  :aria-label="
                    'Ordenar por fecha de cita ' +
                    (sortColumn === 'appointment_date' &&
                    sortDirection === 'asc'
                      ? 'descendente'
                      : 'ascendente')
                  "
                >
                  <span class="appointments-table__header-text"
                    >Fecha de cita</span
                  >
                  <AtomsIconsChevronsUpDown
                    size="16"
                    :class="[
                      'appointments-table__sort-icon',
                      {
                        'appointments-table__sort-icon--active':
                          sortColumn === 'appointment_date',
                        'appointments-table__sort-icon--asc':
                          sortColumn === 'appointment_date' &&
                          sortDirection === 'asc',
                        'appointments-table__sort-icon--desc':
                          sortColumn === 'appointment_date' &&
                          sortDirection === 'desc',
                      },
                    ]"
                  />
                </button>
              </th>
              <th scope="col" class="appointments-table__header-cell">
                <button
                  class="appointments-table__sort-button"
                  @click="sortBy('appointment_hour')"
                  :aria-label="
                    'Ordenar por hora ' +
                    (sortColumn === 'appointment_hour' &&
                    sortDirection === 'asc'
                      ? 'descendente'
                      : 'ascendente')
                  "
                >
                  <span class="appointments-table__header-text">Hora</span>
                  <AtomsIconsChevronsUpDown
                    size="16"
                    :class="[
                      'appointments-table__sort-icon',
                      {
                        'appointments-table__sort-icon--active':
                          sortColumn === 'appointment_hour',
                        'appointments-table__sort-icon--asc':
                          sortColumn === 'appointment_hour' &&
                          sortDirection === 'asc',
                        'appointments-table__sort-icon--desc':
                          sortColumn === 'appointment_hour' &&
                          sortDirection === 'desc',
                      },
                    ]"
                  />
                </button>
              </th>
              <th scope="col" class="appointments-table__header-cell">
                <button
                  class="appointments-table__sort-button"
                  @click="sortBy('procedure_name')"
                  :aria-label="
                    'Ordenar por procedimiento ' +
                    (sortColumn === 'procedure_name' && sortDirection === 'asc'
                      ? 'descendente'
                      : 'ascendente')
                  "
                >
                  <span class="appointments-table__header-text"
                    >Procedimiento</span
                  >
                  <AtomsIconsChevronsUpDown
                    size="16"
                    :class="[
                      'appointments-table__sort-icon',
                      {
                        'appointments-table__sort-icon--active':
                          sortColumn === 'procedure_name',
                        'appointments-table__sort-icon--asc':
                          sortColumn === 'procedure_name' &&
                          sortDirection === 'asc',
                        'appointments-table__sort-icon--desc':
                          sortColumn === 'procedure_name' &&
                          sortDirection === 'desc',
                      },
                    ]"
                  />
                </button>
              </th>
              <th scope="col" class="appointments-table__header-cell">
                <button
                  class="appointments-table__sort-button"
                  @click="sortBy('appointment_qr_code')"
                  :aria-label="
                    'Ordenar por Codigo de la reserva ' +
                    (sortColumn === 'appointment_qr_code' &&
                    sortDirection === 'asc'
                      ? 'descendente'
                      : 'ascendente')
                  "
                >
                  <span class="appointments-table__header-text"
                    >Codigo de reserva</span
                  >
                  <AtomsIconsChevronsUpDown
                    size="16"
                    :class="[
                      'appointments-table__sort-icon',
                      {
                        'appointments-table__sort-icon--active':
                          sortColumn === 'appointment_qr_code',
                        'appointments-table__sort-icon--asc':
                          sortColumn === 'appointment_qr_code' &&
                          sortDirection === 'asc',
                        'appointments-table__sort-icon--desc':
                          sortColumn === 'appointment_qr_code' &&
                          sortDirection === 'desc',
                      },
                    ]"
                  />
                </button>
              </th>
              <th scope="col" class="appointments-table__header-cell">
                <button
                  class="appointments-table__sort-button"
                  @click="sortBy('reservation_type')"
                  :aria-label="
                    'Ordenar por tipo de reserva ' +
                    (sortColumn === 'reservation_type' &&
                    sortDirection === 'asc'
                      ? 'descendente'
                      : 'ascendente')
                  "
                >
                  <span class="appointments-table__header-text"
                    >Tipo de reserva</span
                  >
                  <AtomsIconsChevronsUpDown
                    size="16"
                    :class="[
                      'appointments-table__sort-icon',
                      {
                        'appointments-table__sort-icon--active':
                          sortColumn === 'reservation_type',
                        'appointments-table__sort-icon--asc':
                          sortColumn === 'reservation_type' &&
                          sortDirection === 'asc',
                        'appointments-table__sort-icon--desc':
                          sortColumn === 'reservation_type' &&
                          sortDirection === 'desc',
                      },
                    ]"
                  />
                </button>
              </th>
              <th scope="col" class="appointments-table__header-cell">
                <button
                  class="appointments-table__sort-button"
                  @click="sortBy('appointment_status')"
                  :aria-label="
                    'Ordenar por estado ' +
                    (sortColumn === 'appointment_status' &&
                    sortDirection === 'asc'
                      ? 'descendente'
                      : 'ascendente')
                  "
                >
                  <span class="appointments-table__header-text"
                    >Estado de cita</span
                  >
                  <AtomsIconsChevronsUpDown
                    size="16"
                    :class="[
                      'appointments-table__sort-icon',
                      {
                        'appointments-table__sort-icon--active':
                          sortColumn === 'appointment_status',
                        'appointments-table__sort-icon--asc':
                          sortColumn === 'appointment_status' &&
                          sortDirection === 'asc',
                        'appointments-table__sort-icon--desc':
                          sortColumn === 'appointment_status' &&
                          sortDirection === 'desc',
                      },
                    ]"
                  />
                </button>
              </th>
              <th scope="col" class="appointments-table__header-cell">
                <span class="appointments-table__header-text"
                  >Accion Principal</span
                >
              </th>
              <th scope="col" class="appointments-table__header-cell">
                <span class="appointments-table__header-text">Contacto</span>
              </th>

              <th scope="col" class="appointments-table__header-cell">
                <span class="appointments-table__header-text"></span>
              </th>
            </tr>
          </thead>
          <tbody class="appointments-table__body">
            <tr
              v-for="appointment in paginatedAppointments"
              :key="appointment.id"
              class="appointments-table__row"
            >
              <td class="appointments-table__cell">
                <span class="appointments-table__patient-name">
                  {{ appointment.supplier?.name || appointment.hospital_name }}
                </span>
              </td>
              <td class="appointments-table__cell">
                <span class="appointments-table__datetime">
                  {{
                    new Date(appointment.appointment_date).toLocaleDateString()
                  }}
                </span>
              </td>
              <td class="appointments-table__cell">
                <time class="appointments-table__datetime">
                  {{ appointment.appointment_hour }}
                </time>
              </td>
              <td class="appointments-table__cell">
                <span class="appointments-table__procedure">
                  {{ appointment.package?.procedure?.name }}
                </span>
              </td>
              <td class="appointments-table__cell">
                <span class="appointments-table__procedure">
                  {{ appointment.appointment_qr_code }}
                </span>
              </td>
              <td class="appointments-table__cell">
                <span class="appointments-table__reservation-type">
                  {{ appointment.reservation_type?.name }}
                </span>
              </td>
              <td class="appointments-table__cell">
                <PacientesAccionesEstadoCita
                  :appointment="appointment"
                  :showStatus="true"
                  @refresh="refreshAppointments"
                />
              </td>
              <td class="appointments-table__cell--center">
                <PacientesAccionesEstadoCita
                  :appointment="appointment"
                  :showStatus="false"
                  @refresh="refreshAppointments"
                />
              </td>
              <td class="appointments-table__cell--center">
                <PacientesModalesContactoMedico :appointment="appointment" />
              </td>

              <td class="appointments-table__cell">
                <div class="appointments-table__dropdown">
                  <button
                    class="appointments-table__dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    :aria-label="`Más acciones para ${appointment.customer.name}`"
                  >
                    <AtomsIconsThreeDotsHorizontalIcon />
                  </button>

                  <ul class="dropdown-menu" role="menu">
                    <li role="none">
                      <PacientesModalesDetallesCita
                        :appointment="appointment"
                        :is-open="modals.appointmentDetails === appointment.id"
                        @open-modal="openModal"
                        @close-modal="closeModal"
                      />
                      <PacientesModalesDejarValoracion
                        :appointment="appointment"
                        :is-open="modals.leaveReview === appointment.id"
                        @open-modal="openModal"
                        @close-modal="closeModal"
                      />
                      <PacientesModalesDejarValoracionExitoso
                        :appointment="appointment"
                        :is-open="modals.leaveReviewSuccess === appointment.id"
                        @open-modal="openModal"
                        @close-modal="closeModal"
                      />
                      <button
                        class="dropdown-item"
                        role="menuitem"
                        @click="openModal('appointmentDetails', appointment.id)"
                      >
                        <AtomsIconsEyeIcon />
                        Ver más detalles
                      </button>
                    </li>

                    <li
                      role="none"
                      v-if="
                        !['COMPLETED', 'CANCELED'].includes(appointment.status)
                      "
                    >
                      <PacientesModalesAnularCita
                        :appointment="appointment"
                        :is-open="modals.cancelAppointment === appointment.id"
                        @open-modal="openModal"
                        @close-modal="closeModal"
                      />
                      <button
                        class="dropdown-item"
                        role="menuitem"
                        @click="openModal('cancelAppointment', appointment.id)"
                      >
                        <AtomsIconsEyeIcon />
                        Anular Cita
                      </button>
                    </li>

                    <li role="none">
                      <button
                        class="dropdown-item"
                        role="menuitem"
                        @click="downloadSummary(appointment)"
                      >
                        <AtomsIconsArrowDownToLineIcon />
                        Descargar Resumen
                      </button>
                    </li>
                  </ul>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="card-body d-flex py-5">
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
        <button class="btn btn-primary border-danger">Empezar</button>
      </div>
    </div>

    <MedicosPaginacion
      v-if="hasAppointments && totalPages > 1"
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-items="totalItems"
      :items-per-page="itemsPerPage"
      :show-info="false"
      @page-changed="handlePageChange"
    />
  </section>
</template>

<script setup>
import { jsPDF } from "jspdf";
import { computed, inject, onMounted, onUnmounted, ref } from "vue";

defineEmits(["refreshed"]);
const refreshAppointments = inject("refreshAppointments");

const token = useCookie("token");
const config = useRuntimeConfig();

const props = defineProps({
  appointments: {
    type: Array,
    default: () => [],
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
});

const isContactModalOpen = ref(false);
const selectedAppointment = ref(null);
const sortColumn = ref("created_date");
const sortDirection = ref("desc");
const currentPage = ref(1);

const showDetailsModal = ref(false);
const showCancelModal = ref(false);

const openContactModal = (appointment) => {
  selectedAppointment.value = appointment;
  isContactModalOpen.value = true;
  if (process.client) {
    document.body.style.overflow = "hidden";
  }
};

const closeContactModal = () => {
  isContactModalOpen.value = false;
  selectedAppointment.value = null;
  if (process.client) {
    document.body.style.overflow = "";
  }
};

const downloadSummary = async (appointment) => {
  try {
    try {
      const { data, error } = await useFetch(
        `${config.public.API_BASE_URL}/appointment/summary/${appointment.id}`,
        {
          method: "GET",
          headers: { Authorization: token.value },
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

const generateSummaryData = (appointment) => {
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

const generateLocalSummary = (data) => {
  if (!process.client) return;

  const doc = new jsPDF();
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

  doc.autoTable({
    startY: yPosition,
    head: [["Costo del Servicio", "Estado de Pago"]],
    body: [[`₡${data.cost || "No disponible"}`, data.paymentStatus]],
    theme: "grid",
    styles: { fontSize: 10, halign: "center" },
    headStyles: { fillColor: [41, 128, 185] },
  });

  yPosition = doc.lastAutoTable.finalY + 15;

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

const downloadFile = (fileData, filename) => {
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

const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortColumn.value = column;
    sortDirection.value = "asc";
  }

  currentPage.value = 1;
};

const getSortValue = (appointment, column) => {
  switch (column) {
    case "doctor_name":
      return appointment.supplier?.name || appointment.hospital_name || "";
    case "appointment_date":
      return new Date(appointment.appointment_date);
    case "appointment_hour":
      return appointment.appointment_hour || "";
    case "procedure_name":
      return appointment.package?.procedure?.name || "";
    case "appointment_qr_code":
      return appointment.appointment_qr_code || "";
    case "reservation_type":
      return appointment.reservation_type?.name || "";
    case "appointment_status":
      return appointment.appointment_status?.code || "";
    case "created_date":
    default:
      return new Date(appointment.created_date);
  }
};

const sortedAppointments = computed(() => {
  if (!props.appointments || !Array.isArray(props.appointments)) {
    return [];
  }

  return [...props.appointments].sort((a, b) => {
    const valueA = getSortValue(a, sortColumn.value);
    const valueB = getSortValue(b, sortColumn.value);

    let comparison = 0;

    if (valueA < valueB) {
      comparison = -1;
    } else if (valueA > valueB) {
      comparison = 1;
    }

    return sortDirection.value === "asc" ? comparison : -comparison;
  });
});

const totalItems = computed(() => sortedAppointments.value.length);
const totalPages = computed(() =>
  Math.ceil(totalItems.value / props.itemsPerPage)
);

const paginatedAppointments = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage;
  const end = start + props.itemsPerPage;
  return sortedAppointments.value.slice(start, end);
});

const hasAppointments = computed(
  () =>
    props.appointments &&
    Array.isArray(props.appointments) &&
    props.appointments.length > 0
);

const handlePageChange = (page) => {
  currentPage.value = page;
};

const handleKeydown = (event) => {
  if (event.key === "Escape") {
    if (isContactModalOpen.value) {
      closeContactModal();
    } else if (showDetailsModal.value) {
      closeModal("appointmentDetails");
    } else if (showCancelModal.value) {
      closeModal("cancelAppointment");
    }
  }
};

const modals = reactive({
  appointmentDetails: null,
  cancelAppointment: null,
  successfulPayment: null,
  payAppointment: null,
  scheduleProcedure: null,
  scheduleProcedureSuccess: null,
  leaveReview: null,
  leaveReviewSuccess: null,
  applyCredit: null,
  applyCreditSuccess: null,
});

const closeModal = (modalName) => {
  modals[modalName] = null;
};

const openModal = (modalName, appointmentId = null) => {
  modals[modalName] = appointmentId;
};

onMounted(() => {
  if (process.client) {
    document.addEventListener("keydown", handleKeydown);
  }
});

onUnmounted(() => {
  if (process.client) {
    document.removeEventListener("keydown", handleKeydown);

    if (
      isContactModalOpen.value ||
      showDetailsModal.value ||
      showCancelModal.value
    ) {
      document.body.style.overflow = "";
    }
  }
});
</script>

<style lang="scss" scoped>
.sr-only {
  @include visually-hidden;
}

.appointments-table {
  &__container {
    background: $white;
    border-radius: 0.625rem;
    overflow: hidden;
    min-height: 25rem;
    display: flex;
    flex-direction: column;
  }

  &__wrapper {
    overflow-x: auto;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
    table-layout: fixed;
  }

  &__header {
    background-color: #f8f9fa;
    border-bottom: 0.125rem solid #dee2e6;
  }

  &__header-row {
    border: none;
  }

  &__header-cell {
    padding: 1rem 0.75rem;
    text-align: left;
    font-size: 0.75rem;
    letter-spacing: 0;
    font-weight: 500;
    color: $color-text-secondary;
    border: none;
    background-color: $white;

    &:nth-child(1) {
      width: 9.375rem;
    }
    &:nth-child(2) {
      width: 7.5rem;
    }
    &:nth-child(3) {
      width: 7.5rem;
    }
    &:nth-child(4) {
      width: 11.25rem;
    }
    &:nth-child(5) {
      width: 7.5rem;
    }
    &:nth-child(6) {
      width: 10rem;
    }
    &:nth-child(7) {
      width: 9.375rem;
    }
    &:nth-child(8) {
      width: 8.125rem;
    }
    &:nth-child(9) {
      width: 5rem;
    }
    &:nth-child(10) {
      width: 3.75rem;
    }

    &--center {
      font-weight: 500;
      text-align: center;
      font-size: 0.75rem;
      color: $color-text-secondary;
    }

    &--checkbox {
      width: 3rem;
      text-align: center;
    }
  }

  &__header-text {
    font-family: $font-family-main;
    font-weight: 500;
    font-style: Medium;
    font-size: 0.75rem;
    line-height: 1rem;
    letter-spacing: 0;
    vertical-align: middle;
    text-align: start;
  }

  &__sort-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    font: inherit;
    padding: 0;

    &:hover {
      .appointments-table__sort-icon {
        transform: scale(110%);
        color: $color-primary;
      }
    }

    &:focus {
      outline: 0.125rem solid $color-primary;
      outline-offset: 0.125rem;
    }
  }

  &__sort-icon {
    color: #121212;
    transition:
      transform 0.2s ease,
      color 0.2s ease;

    &--active {
      color: $color-primary;
    }

    &--asc {
      transform: rotate(180deg);
    }

    &--desc {
      transform: rotate(0deg);
    }
  }

  &__body {
    background: $white;
  }

  &__row {
    border-bottom: 0.0625rem solid #dee2e6;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba($color-primary, 0.02);
    }

    &--selected {
      background-color: rgba($color-primary, 0.05);
    }
  }

  &__cell {
    padding: 1rem 0.75rem;
    vertical-align: middle;
    border: none;

    &--actions,
    &--center {
      text-align: center;
    }

    &--checkbox {
      text-align: center;
    }
  }

  &__patient-name,
  &__procedure,
  &__reservation-type,
  &__datetime {
    font-family: $font-family-main;
    font-weight: 300;
    font-style: Light;
    font-size: 0.75rem;
    color: $color-foreground;
    line-height: 1.25rem;
    letter-spacing: 0;
    vertical-align: middle;
  }

  &__status {
    display: block;
    width: 100%;
    text-align: center;
    text-wrap: nowrap;
    font-family: $font-family-main;
    font-weight: 500;
    font-style: Light;
    font-size: 0.75rem;
    color: $color-foreground;
    line-height: 1.125rem;
    letter-spacing: 0;
    border-radius: 1.875rem;
    padding: 0.375rem 0.625rem;
    width: 100%;

    &--success {
      background-color: $color-success;
    }

    &--warning {
      background-color: $color-warning;
    }

    &--primary {
      background-color: rgba($color-primary, 0.1);
    }

    &--cancelled {
      background-color: $color-cancel;
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
      outline: 0.125rem solid $color-primary;
      outline-offset: 0.125rem;
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
    border: 0.125rem solid #dee2e6;
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
      border-width: 0 0.125rem 0.125rem 0;
      transform: rotate(45deg);
      opacity: 0;
      transition: opacity 0.2s ease;
    }
  }

  &__contact-btn {
    @include button-base;
    border-radius: 0.5rem;
    padding: 0;
    color: $color-text-muted;

    svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    &:hover {
      background-color: #f9fafb;
    }
  }

  &__action-btn {
    @include outline-button;
    font-weight: 600;
    font-size: 0.75rem;
    line-height: 1.125rem;
    padding: 0.5rem 1rem;
    width: 100%;

    &--view {
      color: $color-primary;
    }

    &--edit {
      color: $color-warning;
    }

    &--cancel {
      color: $color-cancel;
    }
  }

  &__actions {
    display: flex;
    gap: 0.25rem;
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

    &:focus {
      outline: 0.125rem solid $color-primary;
      outline-offset: 0.125rem;
    }
  }

  &__empty-state {
    background: $white;
    border-radius: 0.5rem;
    padding: 3rem 2rem;
  }

  &__empty-content {
    display: flex;
    align-items: center;
    gap: 2rem;
    max-width: 37.5rem;
    margin: 0 auto;
  }

  &__empty-icon {
    flex-shrink: 0;
    width: 50%;
    text-align: center;
  }

  &__empty-text {
    flex: 1;
  }

  &__empty-title {
    font-size: 1.25rem;
    font-weight: 500;
    color: #6c757d;
    margin: 0 0 0.5rem 0;
  }

  &__empty-description {
    color: #6c757d;
    margin: 0 0 1rem 0;
    line-height: 1.5;
  }

  &__empty-cta {
    background: $color-primary;
    color: $white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: $color-primary-darkened-10;
    }

    &:focus {
      outline: 0.125rem solid $color-primary;
      outline-offset: 0.125rem;
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

  &__pagination {
    background: transparent;
    padding: 1rem;
    display: flex;
    justify-content: flex-end;
  }

  &__pagination-list {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 0.25rem;
  }

  &__pagination-item {
    display: flex;
  }

  &__pagination-btn {
    display: flex;
    align-items: center;
    gap: 0.3125rem;
    padding: 0.5rem 0.75rem;
    border: 0.0625rem solid transparent;
    background: transparent;
    color: #6c757d;
    text-decoration: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;

    &:hover {
      background-color: #f8f9fa;
      color: $color-primary;
    }

    &:focus {
      outline: 0.125rem solid $color-primary;
      outline-offset: 0.125rem;
    }

    &--active {
      background: $color-primary;
      color: $white;
      border-color: $color-primary;

      &:hover {
        background: $color-primary;
        color: $white;
      }
    }

    &--prev,
    &--next {
      white-space: nowrap;
    }
  }
}

@media (max-width: $breakpoint-md) {
  .appointments-table {
    &__container {
      border-radius: 0;
      box-shadow: none;
      border: 0.0625rem solid #dee2e6;
    }

    &__table {
      font-size: 0.75rem;
    }

    &__header-cell,
    &__cell {
      padding: 0.5rem;
    }

    &__empty-content {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }

    &__empty-icon {
      width: auto;
    }

    &__pagination {
      padding: 0.75rem;
    }

    &__pagination-btn {
      padding: 0.375rem 0.5rem;
      font-size: 0.75rem;
    }
  }
}

@media (max-width: $breakpoint-sm) {
  .appointments-table {
    &__header-text {
      font-size: 0.625rem;
    }

    &__action-btn {
      width: 1.75rem;
      height: 1.75rem;
      margin: 0 0.0625rem;
    }

    &__status {
      font-size: 0.625rem;
      padding: 0.25rem 0.5rem;
    }
  }
}

@media (prefers-contrast: high) {
  .appointments-table {
    &__container {
      border: 0.125rem solid #dee2e6;
    }

    &__status {
      border-width: 0.125rem;
    }

    &__checkbox-custom {
      border-width: 0.125rem;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .appointments-table {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
}

.appointments-table {
  button:focus:not(:focus-visible) {
    outline: none;
  }

  button:focus-visible {
    outline: 0.125rem solid $color-primary;
    outline-offset: 0.125rem;
  }
}
</style>
