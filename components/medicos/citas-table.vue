<script setup>
import { jsPDF } from "jspdf";
import { computed, inject, ref, watch } from "vue";

const emit = defineEmits(["refreshed"]);

const props = defineProps({
  appointments: {
    type: Array,
    default: () => [],
  },
  useDropdown: {
    type: Boolean,
    default: false,
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
});

const refreshAppointments = inject("refreshAppointments");

const openUserModal = ref(false);
const openDateModal = ref(false);
const openContactModal = ref(false);
const openDateCancelModal = ref(false);
const modalData = ref(null);
const currentStep = ref(1);
const selectedAppointments = ref(new Set());
const allSelected = ref(false);
const sortColumn = ref(null);
const sortDirection = ref("asc");

const currentPage = ref(1);

const hasAppointments = computed(
  () =>
    props.appointments &&
    Array.isArray(props.appointments) &&
    props.appointments.length > 0
);

const sortedAppointments = computed(() => {
  if (!hasAppointments.value || !sortColumn.value) return props.appointments;

  return [...props.appointments].sort((a, b) => {
    let aValue = a[sortColumn.value];
    let bValue = b[sortColumn.value];

    if (sortColumn.value === "patient_name") {
      aValue = a.customer?.name || "";
      bValue = b.customer?.name || "";
    } else if (sortColumn.value === "procedure_name") {
      aValue = a.package?.procedure?.name || "";
      bValue = b.package?.procedure?.name || "";
    }

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection.value === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
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

watch(
  () => props.appointments,
  () => {
    currentPage.value = 1;
    selectedAppointments.value.clear();
    allSelected.value = false;
  }
);

watch([sortColumn, sortDirection], () => {
  currentPage.value = 1;
});

const showUserDetails = (appointment) => {
  closeModal();
  modalData.value = appointment;
  openUserModal.value = true;
};

const showContactDetails = (appointment) => {
  closeModal();
  modalData.value = appointment;
  openContactModal.value = true;
};

const showDateDetails = (appointment, step = 1) => {
  closeModal();
  modalData.value = appointment;
  currentStep.value = step;
  openDateModal.value = true;
};

const showDateCancel = (appointment) => {
  closeModal();
  modalData.value = appointment;
  openDateCancelModal.value = true;
};

const statusClass = (status) => {
  const statusMap = {
    CANCEL_APPOINTMENT: "appointments-table__status--cancelled",
    PENDING_VALORATION_APPOINTMENT: "appointments-table__status--warning",
    PENDING_PROCEDURE: "appointments-table__status--warning",
    CONFIRM_PROCEDURE: "appointments-table__status--primary",
    CONCRETED_APPOINTMENT: "appointments-table__status--primary",
    VALUED_VALORATION_APPOINTMENT: "appointments-table__status--success",
    CONFIRM_VALIDATION_APPOINTMENT: "appointments-table__status--success",
    VALUATION_PENDING_VALORATION_APPOINTMENT:
      "appointments-table__status--primary",
    WAITING_PROCEDURE: "appointments-table__status--warning",
  };
  return statusMap[status] || "";
};

const toggleAppointmentSelection = (appointmentId) => {
  if (selectedAppointments.value.has(appointmentId)) {
    selectedAppointments.value.delete(appointmentId);
  } else {
    selectedAppointments.value.add(appointmentId);
  }
  updateAllSelectedState();
};

const toggleAllAppointments = () => {
  if (allSelected.value) {
    selectedAppointments.value.clear();
  } else {
    paginatedAppointments.value.forEach((appointment) => {
      selectedAppointments.value.add(appointment.id);
    });
  }
  allSelected.value = !allSelected.value;
};

const updateAllSelectedState = () => {
  const currentPageIds = paginatedAppointments.value.map((app) => app.id);
  allSelected.value =
    currentPageIds.length > 0 &&
    currentPageIds.every((id) => selectedAppointments.value.has(id));
};

const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortColumn.value = column;
    sortDirection.value = "asc";
  }
};

const downloadSummary = (appointment) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Detalles de la Cita Médica", 105, 20, { align: "center" });

  doc.setDrawColor(200, 200, 200);
  doc.line(20, 25, 190, 25);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");

  doc.setFontSize(14);
  doc.text("Información del Paciente", 20, 35);
  doc.setFontSize(12);

  let yPosition = 45;

  const addField = (label, value) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 20, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(value, 60, yPosition);
    yPosition += 7;
  };

  addField("Paciente", appointment.customer.name);
  addField("Tipo de Reserva", appointment.reservation_type.name);
  addField(
    "Fecha de la cita",
    new Date(appointment.appointment_date).toLocaleDateString()
  );
  addField("Hora de la cita", appointment.appointment_hour);
  addField("Procedimiento", appointment.package?.procedure.name);
  addField("Estado", appointment.appointment_status.value1);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Documento generado el: " + new Date().toLocaleDateString(),
    20,
    280
  );
  doc.text("Vitalink - Sistema de Gestión Médica", 105, 280, {
    align: "center",
  });

  doc.save(
    `Cita_${appointment.customer.name}_${appointment.appointment_date}.pdf`
  );
};

const closeModal = () => {
  modalData.value = null;
  openUserModal.value = false;
  openDateModal.value = false;
  openContactModal.value = false;
  openDateCancelModal.value = false;
  currentStep.value = 1;
};

const handleRefresh = async () => {
  if (refreshAppointments) {
    await refreshAppointments();
    emit("refreshed");
  }
};

const handleAppointmentUpdate = (appointmentData) => {
  emit("refreshed", appointmentData);
};

const canRequestProcedure = (appointment) => {
  if (
    !appointment.appointment_result ||
    appointment.appointment_result.code !== "FIT_FOR_PROCEDURE"
  ) {
    return false;
  }

  if (appointment.appointment_type.code === "PROCEDURE_APPOINTMENT") {
    return false;
  }

  if (
    appointment.appointment_credit &&
    appointment.appointment_credit.credit_status_code === "REQUIRED" &&
    !appointment.appointment_credit.approved_amount
  ) {
    return false;
  }

  return true;
};

const handlePageChange = (page) => {
  currentPage.value = page;
  selectedAppointments.value.clear();
  allSelected.value = false;
};

watch(currentPage, () => {
  updateAllSelectedState();
});

watch(paginatedAppointments, () => {
  updateAllSelectedState();
});
</script>

<template>
  <section
    class="appointments-table"
    role="region"
    aria-labelledby="appointments-heading"
  >
    <h2 id="appointments-heading" class="sr-only">Tabla de Citas Médicas</h2>

    <div class="appointments-table__container" v-if="hasAppointments">
      <div class="appointments-table__wrapper">
        <table
          class="appointments-table__table"
          role="table"
          aria-label="Lista de citas médicas"
        >
          <thead class="appointments-table__header">
            <tr class="appointments-table__header-row" role="row">
              <th
                scope="col"
                class="appointments-table__header-cell appointments-table__header-cell--checkbox"
              >
                <label class="appointments-table__checkbox-label">
                  <input
                    type="checkbox"
                    class="appointments-table__checkbox"
                    :checked="allSelected"
                    @change="toggleAllAppointments"
                    :aria-label="
                      allSelected
                        ? 'Deseleccionar todas las citas'
                        : 'Seleccionar todas las citas'
                    "
                  />
                  <span class="appointments-table__checkbox-custom"></span>
                </label>
              </th>

              <th scope="col" class="appointments-table__header-cell">
                <button
                  class="appointments-table__sort-button"
                  @click="sortBy('patient_name')"
                  :aria-label="
                    'Ordenar por nombre del paciente ' +
                    (sortColumn === 'patient_name' && sortDirection === 'asc'
                      ? 'descendente'
                      : 'ascendente')
                  "
                >
                  <span class="appointments-table__header-text"
                    >Nombre del paciente</span
                  >
                  <AtomsIconsChevronsUpDown
                    size="16"
                    class="appointments-table__sort-icon"
                  />
                </button>
              </th>

              <th scope="col" class="appointments-table__header-cell">
                <button
                  class="appointments-table__sort-button"
                  @click="sortBy('appointment_date')"
                  :aria-label="
                    'Ordenar por fecha y hora ' +
                    (sortColumn === 'appointment_date' &&
                    sortDirection === 'asc'
                      ? 'descendente'
                      : 'ascendente')
                  "
                >
                  <span class="appointments-table__header-text"
                    >Fecha y hora</span
                  >
                  <AtomsIconsChevronsUpDown
                    size="16"
                    class="appointments-table__sort-icon"
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
                    class="appointments-table__sort-icon"
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
                    class="appointments-table__sort-icon"
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
                    class="appointments-table__sort-icon"
                  />
                </button>
              </th>

              <th
                scope="col"
                class="appointments-table__header-cell appointments-table__header-cell--center"
              >
                <span class="appointments-table__header-text"
                  >Acción Principal</span
                >
              </th>

              <th
                scope="col"
                class="appointments-table__header-cell"
                v-if="useDropdown"
              >
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
              role="row"
              :class="{
                'appointments-table__row--selected': selectedAppointments.has(
                  appointment.id
                ),
              }"
            >
              <td
                class="appointments-table__cell appointments-table__cell--checkbox"
              >
                <label class="appointments-table__checkbox-label">
                  <input
                    type="checkbox"
                    class="appointments-table__checkbox"
                    :checked="selectedAppointments.has(appointment.id)"
                    @change="toggleAppointmentSelection(appointment.id)"
                    :aria-label="`${selectedAppointments.has(appointment.id) ? 'Deseleccionar' : 'Seleccionar'} cita de ${appointment.customer.name}`"
                  />
                  <span class="appointments-table__checkbox-custom"></span>
                </label>
              </td>

              <td class="appointments-table__cell">
                <span class="appointments-table__patient-name">
                  {{ appointment.customer.name }}
                </span>
              </td>

              <td class="appointments-table__cell">
                <time
                  :datetime="appointment.appointment_date"
                  class="appointments-table__datetime"
                >
                  {{
                    new Date(appointment.appointment_date).toLocaleDateString()
                  }}
                  <span class="appointments-table__time"
                    >a las {{ appointment.appointment_hour }}</span
                  >
                </time>
              </td>

              <td class="appointments-table__cell">
                <span class="appointments-table__procedure">
                  {{ appointment.package?.procedure.name }}
                </span>
              </td>

              <td class="appointments-table__cell">
                <span class="appointments-table__reservation-type">
                  {{ appointment.reservation_type.name }}
                </span>
              </td>

              <td class="appointments-table__cell">
                <span
                  class="appointments-table__status"
                  :class="statusClass(appointment.appointment_status.code)"
                >
                  {{ appointment.appointment_status.value1 }}
                </span>
              </td>

              <td
                class="appointments-table__cell appointments-table__cell--actions"
              >
                <button
                  v-if="
                    appointment.appointment_status.code ===
                    'PENDING_VALORATION_APPOINTMENT'
                  "
                  class="appointments-table__action-btn appointments-table__action-btn--primary"
                  @click="showDateDetails(appointment)"
                  :aria-label="`Confirmar cita de valoración de ${appointment.customer.name}`"
                >
                  Confirmar
                </button>

                <button
                  v-if="
                    [
                      'VALUATION_PENDING_VALORATION_APPOINTMENT',
                      'CONFIRM_VALIDATION_APPOINTMENT',
                    ].includes(appointment.appointment_status.code)
                  "
                  class="appointments-table__action-btn appointments-table__action-btn--warning"
                  @click="showDateDetails(appointment)"
                  :aria-label="`Realizar valoración de ${appointment.customer.name}`"
                >
                  Valoración
                </button>

                <button
                  v-if="
                    appointment.appointment_status.code === 'PENDING_PROCEDURE'
                  "
                  class="appointments-table__action-btn appointments-table__action-btn--success"
                  @click="showDateDetails(appointment)"
                  :aria-label="`Confirmar procedimiento de ${appointment.customer.name}`"
                >
                  Confirmar Procedimiento
                </button>

                <button
                  v-if="
                    appointment.appointment_status.code === 'WAITING_PROCEDURE'
                  "
                  class="appointments-table__action-btn appointments-table__action-btn--complete"
                  @click="showDateDetails(appointment)"
                  :aria-label="`Marcar como concretado procedimiento de ${appointment.customer.name}`"
                >
                  Marcar como Concretado
                </button>

                <button
                  v-if="
                    appointment.appointment_status.code ===
                    'VALUED_VALORATION_APPOINTMENT'
                  "
                  class="appointments-table__action-btn appointments-table__action-btn--complete"
                  @click="showDateDetails(appointment)"
                  :aria-label="`Marcar como concretado procedimiento de ${appointment.customer.name}`"
                  :disabled="!canRequestProcedure(appointment)"
                >
                  Solicitar procedimiento
                </button>
                <span
                  v-if="
                    ![
                      'PENDING_VALORATION_APPOINTMENT',
                      'VALUATION_PENDING_VALORATION_APPOINTMENT',
                      'PENDING_PROCEDURE',
                      'WAITING_PROCEDURE',
                      'VALUED_VALORATION_APPOINTMENT',
                      'CONFIRM_VALIDATION_APPOINTMENT',
                    ].includes(appointment.appointment_status.code)
                  "
                  class="appointments-table__no-action"
                >
                  —
                </span>
              </td>

              <td class="appointments-table__cell--center" v-if="useDropdown">
                <button
                  class="appointments-table__contact-btn"
                  @click="showContactDetails(appointment)"
                  :aria-label="`Contactar a ${appointment.customer.name}`"
                >
                  <AtomsIconsPhoneIcon size="20" />
                </button>
              </td>

              <td class="appointments-table__cell">
                <div v-if="useDropdown" class="appointments-table__dropdown">
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
                        [
                          'PENDING_VALORATION_APPOINTMENT',
                          'PENDING_PROCEDURE',
                        ].includes(appointment.appointment_status.code)
                      "
                    >
                      <button
                        class="dropdown-item"
                        role="menuitem"
                        @click="showDateDetails(appointment, 2)"
                      >
                        <AtomsIconsCalendarDaysIcon />
                        Confirmar reserva
                      </button>
                    </li>

                    <li
                      role="none"
                      v-if="
                        appointment.appointment_status.code ===
                        'PENDING_VALORATION_APPOINTMENT'
                      "
                    >
                      <button
                        class="dropdown-item"
                        role="menuitem"
                        @click="showDateDetails(appointment, 6)"
                      >
                        <Icon
                          :name="
                            appointment.appointment_type == 'pre-reserva'
                              ? 'lucide:square-pen'
                              : 'lucide:undo-2'
                          "
                        />
                        {{
                          appointment.appointment_type == "pre-reserva"
                            ? "Editar fecha y hora"
                            : "Reprogramar cita"
                        }}
                      </button>
                    </li>

                    <li role="none">
                      <button
                        class="dropdown-item"
                        role="menuitem"
                        @click="showUserDetails(appointment)"
                      >
                        <AtomsIconsUserRoundIcon />
                        Perfil del Paciente
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

                <div v-else class="appointments-table__actions">
                  <button
                    class="appointments-table__action-btn appointments-table__action-btn--view"
                    @click="showUserDetails(appointment)"
                    :aria-label="`Ver detalles de ${appointment.customer.name}`"
                  >
                    <Icon name="fa6-regular:eye" />
                  </button>

                  <button
                    class="appointments-table__action-btn appointments-table__action-btn--edit"
                    @click="showDateDetails(appointment)"
                    :aria-label="`Editar cita de ${appointment.customer.name}`"
                  >
                    <Icon name="fa6-regular:edit" />
                  </button>

                  <button
                    v-if="
                      !['COMPLETED', 'CANCELED'].includes(appointment.status)
                    "
                    class="appointments-table__action-btn appointments-table__action-btn--cancel"
                    @click="showDateCancel(appointment)"
                    :aria-label="`Cancelar cita de ${appointment.customer.name}`"
                  >
                    <Icon name="fa6-regular:trash" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="appointments-table__empty-state"
      role="status"
      aria-live="polite"
    >
      <div class="appointments-table__empty-content">
        <div class="appointments-table__empty-icon">
          <AtomsIconsChartVacio />
        </div>
        <div class="appointments-table__empty-text">
          <h3 class="appointments-table__empty-title">
            Aún no tienes actividad en tu tablero
          </h3>
          <p class="appointments-table__empty-description">
            Muy pronto podrás administrar y verificar tu actividad.
          </p>
          <button class="appointments-table__empty-cta">Empezar</button>
        </div>
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

    <!-- Modals -->
    <MedicosUserModal
      v-if="openUserModal"
      :open="openUserModal"
      :appointment="modalData"
      @close-modal="closeModal"
      @refresh="refreshAppointments"
    />

    <MedicosCitaModal
      v-if="openDateModal"
      :open="openDateModal"
      :appointment="modalData"
      v-model:step="currentStep"
      @close-modal="closeModal"
      @refresh="refreshAppointments"
    />

    <MedicosCitaCancelModal
      v-if="openDateCancelModal"
      :open="openDateCancelModal"
      :appointment="modalData"
      @close-modal="closeModal"
      @refresh="refreshAppointments"
    />

    <MedicosCitaContactModal
      v-if="openContactModal"
      :open="openContactModal"
      :appointment="modalData"
      @close-modal="closeModal"
      @refresh="refreshAppointments"
    />
  </section>
</template>

<style lang="scss">
// Screen reader only utility
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

// Main component
.appointments-table {
  &__container {
    background: $white;
    border-radius: 10px;
    overflow: hidden;
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

  // Header
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
      width: 50px;
    }
    &:nth-child(2) {
      width: 170px;
    }
    &:nth-child(3) {
      width: 120px;
    }
    &:nth-child(4) {
      width: 160px;
    }
    &:nth-child(5) {
      width: 120px;
    }
    &:nth-child(6) {
      width: 160px;
    }
    &:nth-child(7) {
      width: 140px;
    }
    &:nth-child(8) {
      width: 80px;
    }
    &:nth-child(9) {
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
      svg {
        transform: scale(110%);
      }
    }

    &:focus {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }

  &__sort-icon {
    color: #121212;
    transition: transform 0.2s ease;
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

  // Content styling
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

  // Status styling
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

  // Checkbox styling
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

  // Action buttons
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

  // Dropdown
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

  // Empty state
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

  // Pagination
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

// Responsive design
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

// High contrast mode support
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
