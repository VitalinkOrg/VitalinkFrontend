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
                <PacientesPagarCitaModal
                  v-if="
                    (appointment.appointment_status?.code !==
                      'VALUED_VALORATION_APPOINTMENT' &&
                      appointment.appointment_status?.code !==
                        'PENDING_PROCEDURE') ||
                    (appointment.appointment_status?.code ===
                      'CONFIRM_PROCEDURE' &&
                      appointment.payment_status?.code ===
                        'PAYMENT_STATUS_NOT_PAID_PROCEDURE')
                  "
                  :appointment="appointment"
                  :showStatus="true"
                  @refresh="refreshAppointments"
                />
                <PacientesProcedimientoCitaModal
                  v-else
                  :appointment="appointment"
                  :showStatus="true"
                  @refresh="refreshAppointments"
                />
              </td>
              <td class="appointments-table__cell--center">
                <PacientesPagarCitaModal
                  v-if="
                    (appointment.appointment_status?.code !==
                      'VALUED_VALORATION_APPOINTMENT' &&
                      appointment.appointment_status?.code !==
                        'PENDING_PROCEDURE') ||
                    (appointment.appointment_status?.code ===
                      'CONFIRM_PROCEDURE' &&
                      appointment.payment_status?.code ===
                        'PAYMENT_STATUS_NOT_PAID_PROCEDURE')
                  "
                  :appointment="appointment"
                  :showStatus="false"
                  @refresh="refreshAppointments"
                />
                <PacientesProcedimientoCitaModal
                  v-else
                  :appointment="appointment"
                  :showStatus="false"
                  @refresh="refreshAppointments"
                />
              </td>
              <td class="appointments-table__cell--center">
                <button
                  class="appointments-table__contact-btn"
                  @click="openContactModal(appointment)"
                >
                  <AtomsIconsPhoneIcon size="20" />
                </button>
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
                      <button
                        class="dropdown-item"
                        role="menuitem"
                        @click="showDateDetails(appointment)"
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
                      <button
                        class="dropdown-item"
                        role="menuitem"
                        @click="showDateCancel(appointment)"
                      >
                        <AtomsIconsCircleXIcon />
                        Anular cita
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

  <!-- Modal de Contacto (Existente) -->
  <PacientesContactoMedicoModal
    v-if="selectedAppointment"
    :appointment="selectedAppointment"
    :open="isContactModalOpen"
    @close-modal="closeContactModal"
  />

  <!-- Modal de Detalles Genérico -->
  <div
    class="modal fade"
    :class="{ show: showDetailsModal }"
    v-if="showDetailsModal"
    tabindex="-1"
    aria-labelledby="detailsModalLabel"
    aria-hidden="true"
    style="display: block; background-color: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div
          class="modal-header border-0 align-items-center d-flex justify-content-between"
        >
          <h5 class="modal-title fw-bold" id="detailsModalLabel">
            Detalles de la Cita
          </h5>
          <button
            type="button"
            class="btn-close btn btn-light me-2"
            aria-label="Close"
            @click="closeDetailsModal"
          ></button>
        </div>
        <div class="modal-body" v-if="selectedAppointmentForAction">
          <table class="table table-borderless">
            <tbody>
              <tr>
                <td><strong>Código de Reserva:</strong></td>
                <td>{{ selectedAppointmentForAction.appointment_qr_code }}</td>
              </tr>
              <tr>
                <td><strong>Paciente:</strong></td>
                <td>{{ selectedAppointmentForAction.customer?.name }}</td>
              </tr>
              <tr>
                <td><strong>Doctor:</strong></td>
                <td>
                  {{
                    selectedAppointmentForAction.supplier?.name ||
                    selectedAppointmentForAction.hospital_name
                  }}
                </td>
              </tr>
              <tr>
                <td><strong>Fecha:</strong></td>
                <td>
                  {{
                    new Date(
                      selectedAppointmentForAction.appointment_date
                    ).toLocaleDateString()
                  }}
                </td>
              </tr>
              <tr>
                <td><strong>Hora:</strong></td>
                <td>{{ selectedAppointmentForAction.appointment_hour }}</td>
              </tr>
              <tr>
                <td><strong>Procedimiento:</strong></td>
                <td>
                  {{ selectedAppointmentForAction.package?.procedure?.name }}
                </td>
              </tr>
              <tr>
                <td><strong>Estado:</strong></td>
                <td>
                  <span
                    class="appointments-table__status"
                    :class="
                      getStatusClass(
                        selectedAppointmentForAction.appointment_status?.code
                      )
                    "
                  >
                    {{
                      selectedAppointmentForAction.appointment_status?.value1
                    }}
                  </span>
                </td>
              </tr>
              <tr>
                <td><strong>Tipo de Reserva:</strong></td>
                <td>
                  {{ selectedAppointmentForAction.reservation_type?.name }}
                </td>
              </tr>
              <tr>
                <td><strong>Teléfono:</strong></td>
                <td>
                  {{ selectedAppointmentForAction.customer?.phone_number }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary w-100"
            @click="closeDetailsModal"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal de Confirmación de Cancelación -->
  <div
    class="modal fade"
    :class="{ show: showCancelModal }"
    v-if="showCancelModal"
    tabindex="-1"
    aria-labelledby="cancelModalLabel"
    aria-hidden="true"
    style="display: block; background-color: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div
          class="modal-header border-0 align-items-center d-flex justify-content-between"
        >
          <button
            type="button"
            class="btn-close btn btn-light me-2"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="closeCancelModal"
          ></button>
        </div>
        <div class="modal-body">
          <h5 class="fw-bold">¿Seguro que quieres cancelar esta cita?</h5>
          <p class="text-muted">
            Se le enviará un correo electrónico automático al usuario avisándole
            que su cita ha sido cancelada.
          </p>
          <div class="d-flex justify-content-between gap-2">
            <button class="btn btn-outline-dark w-50" @click="closeCancelModal">
              No, volver
            </button>
            <button
              class="btn btn-danger w-50"
              @click="confirmCancelAppointment"
            >
              Sí, cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted, ref } from "vue";

const { emit } = defineEmits(["refreshed"]);
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

const activeAppointment = ref(null);
const isContactModalOpen = ref(false);
const selectedAppointment = ref(null);
const sortColumn = ref("created_date");
const sortDirection = ref("desc");
const currentPage = ref(1);

const showDetailsModal = ref(false);
const showCancelModal = ref(false);
const selectedAppointmentForAction = ref(null);
const modalStep = ref(1);

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

const showDateDetails = (appointment, step = 1) => {
  selectedAppointmentForAction.value = appointment;
  modalStep.value = step;

  showDetailsModal.value = true;
  if (process.client) {
    document.body.style.overflow = "hidden";
  }
};

const showDateCancel = (appointment) => {
  selectedAppointmentForAction.value = appointment;
  showCancelModal.value = true;
  if (process.client) {
    document.body.style.overflow = "hidden";
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

const getStatusClass = (statusCode) => {
  const statusClasses = {
    PENDING_VALORATION_APPOINTMENT: "appointments-table__status--warning",
    CONFIRM_VALIDATION_APPOINTMENT: "appointments-table__status--success",
    VALUED_VALORATION_APPOINTMENT: "appointments-table__status--success",
    PENDING_PROCEDURE: "appointments-table__status--warning",
    CONFIRM_PROCEDURE: "appointments-table__status--primary",
    CONCRETED_APPOINTMENT: "appointments-table__status--success",
    CANCEL_APPOINTMENT: "appointments-table__status--cancelled",
    COMPLETED: "appointments-table__status--success",
    CANCELED: "appointments-table__status--cancelled",
  };

  return statusClasses[statusCode] || "appointments-table__status--primary";
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

  const content = `
==============================================
           RESUMEN DE CITA MÉDICA
==============================================

INFORMACIÓN GENERAL
Código de Reserva: ${data.qrCode}
Fecha de Emisión: ${new Date().toLocaleDateString()}

DATOS DEL PACIENTE
Nombre: ${data.patientName}
Teléfono: ${data.phone || "No disponible"}

DATOS DE LA CITA
Doctor/Centro: ${data.doctorName}
Fecha: ${data.date}
Hora: ${data.time}
Procedimiento: ${data.procedure}
Estado: ${data.status}
Tipo de Reserva: ${data.reservationType}

INFORMACIÓN FINANCIERA
Costo del Servicio: ₡${data.cost || "No disponible"}
Estado de Pago: ${data.paymentStatus}

==============================================
    Este documento es un resumen oficial
         de la cita médica registrada
==============================================
  `;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `resumen-cita-${data.qrCode}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
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

const closeDetailsModal = () => {
  showDetailsModal.value = false;
  selectedAppointmentForAction.value = null;
  modalStep.value = 1;
  if (process.client) {
    document.body.style.overflow = "";
  }
};

const closeCancelModal = () => {
  showCancelModal.value = false;
  selectedAppointmentForAction.value = null;
  if (process.client) {
    document.body.style.overflow = "";
  }
};

const confirmCancelAppointment = async () => {
  if (!selectedAppointmentForAction.value) return;

  try {
    const { data, error } = await useFetch(
      config.public.API_BASE_URL + "/appointment/cancel",
      {
        method: "PUT",
        headers: { Authorization: token.value },
        params: {
          id: selectedAppointmentForAction.value.id,
        },
      }
    );

    if (data.value && !error.value) {
      refreshAppointments();
      closeCancelModal();

      alert("Cita cancelada exitosamente");
    } else {
      throw new Error(
        error.value?.data?.message || "Error al cancelar la cita"
      );
    }
  } catch (err) {
    console.error("Error al cancelar cita:", err);
    alert("Error al cancelar la cita. Por favor, intenta nuevamente.");
  }
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
      closeDetailsModal();
    } else if (showCancelModal.value) {
      closeCancelModal();
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

<style lang="scss">
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

.appointments-table {
  &__container {
    background: $white;
    border-radius: 10px;
    overflow: hidden;
    min-height: 400px;
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
    border-bottom: 2px solid #dee2e6;
  }

  &__header-row {
    border: none;
  }

  &__header-cell {
    padding: 1rem 0.75rem;
    text-align: left;
    font-size: 12px;
    letter-spacing: 0;
    font-weight: 500;
    color: #6d758f;
    border: none;
    background-color: $white;

    &:nth-child(1) {
      width: 150px;
    }
    &:nth-child(2) {
      width: 120px;
    }
    &:nth-child(3) {
      width: 120px;
    }
    &:nth-child(4) {
      width: 180px;
    }
    &:nth-child(5) {
      width: 120px;
    }
    &:nth-child(6) {
      width: 160px;
    }
    &:nth-child(7) {
      width: 150px;
    }
    &:nth-child(8) {
      width: 130px;
    }
    &:nth-child(9) {
      width: 80px;
    }
    &:nth-child(10) {
      width: 60px;
    }

    &--center {
      font-weight: 500;
      text-align: center;
      font-size: 12px;
      color: #6d758f;
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
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0px;
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
      outline: 2px solid $color-primary;
      outline-offset: 2px;
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
    border-bottom: 1px solid #dee2e6;
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
    font-size: 12px;
    color: #19213d;
    line-height: 20px;
    letter-spacing: 0px;
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
    font-size: 12px;
    color: #19213d;
    line-height: 18px;
    letter-spacing: 0px;
    border-radius: 30px;
    padding: 6px 10px;
    width: 100%;

    &--success {
      background-color: #d3f2dd;
    }

    &--warning {
      background-color: #faedbf;
    }

    &--primary {
      background-color: rgba($color-primary, 0.1);
    }

    &--cancelled {
      background-color: #fac6d0;
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

  &__contact-btn {
    @include button-base;
    border-radius: 8px;
    padding: 0;
    color: #667085;

    svg {
      width: 20px;
      height: 20px;
    }

    &:hover {
      background-color: #f9fafb;
    }
  }

  &__action-btn {
    @include outline-button;
    font-weight: 600;
    font-size: 12px;
    line-height: 18px;
    padding: 8px 16px;
    width: 100%;

    &--view {
      color: $color-primary;
    }

    &--edit {
      color: #faedbf;
    }

    &--cancel {
      color: #fac6d0;
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
      outline: 2px solid $color-primary;
      outline-offset: 2px;
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
    max-width: 600px;
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
      background: darken($color-primary, 10%);
    }

    &:focus {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
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
    gap: 15px;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    padding: 10px 14px;
    color: #353e5c;

    &:hover {
      background-color: #f1f3f7;
    }

    svg {
      color: #3541b4;
      width: 16px;
      height: 16px;
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
    gap: 5px;
    padding: 0.5rem 0.75rem;
    border: 1px solid transparent;
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
      outline: 2px solid $color-primary;
      outline-offset: 2px;
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

.modal-content {
  border-radius: 10px;
}

.modal-header {
  padding: 1rem;
}

.modal-body {
  padding: 2rem;
}

.modal-footer {
  padding: 1rem;
}

@media (max-width: 768px) {
  .appointments-table {
    &__container {
      border-radius: 0;
      box-shadow: none;
      border: 1px solid #dee2e6;
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

@media (max-width: 576px) {
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
      border: 2px solid #dee2e6;
    }

    &__status {
      border-width: 2px;
    }

    &__checkbox-custom {
      border-width: 2px;
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
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }
}
</style>
