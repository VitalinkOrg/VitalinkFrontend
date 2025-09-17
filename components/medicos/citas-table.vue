<script lang="ts" setup>
import { jsPDF } from "jspdf";
import { computed, ref, watch } from "vue";
import type { Appointment, AppointmentStatusCode } from "~/types";

interface Props {
  appointments: Appointment[];
  useDropdown: boolean;
  itemsPerPage: number;
}

const props = withDefaults(defineProps<Props>(), {
  appointments: () => [],
  useDropdown: false,
  itemsPerPage: 10,
});

const { formatDate, formatTime } = useFormat();

const selectedAppointments = ref<Set<number>>(new Set());
const allSelected = ref<boolean>(false);
const sortColumn = ref<string | null>(null);
const sortDirection = ref<"asc" | "desc">("asc");
const currentPage = ref<number>(1);

const hasAppointments = computed<boolean>(
  () =>
    props.appointments &&
    Array.isArray(props.appointments) &&
    props.appointments.length > 0
);

const sortedAppointments = computed<Appointment[]>(() => {
  if (!hasAppointments.value || !sortColumn.value) return props.appointments;

  return [...props.appointments].sort((a: Appointment, b: Appointment) => {
    let aValue: any = a[sortColumn.value as keyof Appointment];
    let bValue: any = b[sortColumn.value as keyof Appointment];

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

const totalItems = computed<number>(() => sortedAppointments.value.length);

const totalPages = computed<number>(() =>
  Math.ceil(totalItems.value / props.itemsPerPage)
);

const paginatedAppointments = computed<Appointment[]>(() => {
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

const statusClass = (status: AppointmentStatusCode): string => {
  const statusMap: Record<AppointmentStatusCode, string> = {
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

const toggleAppointmentSelection = (appointmentId: number): void => {
  if (selectedAppointments.value.has(appointmentId)) {
    selectedAppointments.value.delete(appointmentId);
  } else {
    selectedAppointments.value.add(appointmentId);
  }
  updateAllSelectedState();
};

const toggleAllAppointments = (): void => {
  if (allSelected.value) {
    selectedAppointments.value.clear();
  } else {
    paginatedAppointments.value.forEach((appointment: Appointment) => {
      selectedAppointments.value.add(appointment.id);
    });
  }
  allSelected.value = !allSelected.value;
};

const updateAllSelectedState = (): void => {
  const currentPageIds = paginatedAppointments.value.map(
    (app: Appointment) => app.id
  );
  allSelected.value =
    currentPageIds.length > 0 &&
    currentPageIds.every((id: number) => selectedAppointments.value.has(id));
};

const sortBy = (column: string): void => {
  if (sortColumn.value === column) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortColumn.value = column;
    sortDirection.value = "asc";
  }
};

const downloadSummary = (appointment: Appointment): void => {
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

  const addField = (label: string, value: string): void => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, 20, yPosition);
    doc.setFont("helvetica", "normal");
    doc.text(value, 60, yPosition);
    yPosition += 7;
  };

  addField("Paciente", appointment.customer.name);
  addField("Tipo de Reserva", appointment.reservation_type.name);
  addField("Fecha de la cita", formatDate(appointment.appointment_date));
  addField("Hora de la cita", formatTime(appointment.appointment_hour));
  addField("Procedimiento", appointment.package?.procedure?.name || "N/A");
  addField("Estado", appointment.appointment_status.value1);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Documento generado el: " + formatDate(new Date().toISOString()),
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

const handlePageChange = (page: number): void => {
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
    :class="{
      'appointments-table--with-dropdown': useDropdown,
      'appointments-table--without-dropdown': !useDropdown,
    }"
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
                v-if="useDropdown"
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

              <th
                scope="col"
                class="appointments-table__header-cell appointments-table__header-cell--patient"
              >
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

              <th
                scope="col"
                class="appointments-table__header-cell appointments-table__header-cell--datetime"
              >
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

              <th
                scope="col"
                class="appointments-table__header-cell appointments-table__header-cell--procedure"
              >
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

              <th
                scope="col"
                class="appointments-table__header-cell appointments-table__header-cell--reservation-type"
                v-if="useDropdown"
              >
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

              <th
                scope="col"
                class="appointments-table__header-cell appointments-table__header-cell--status"
              >
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
                class="appointments-table__header-cell appointments-table__header-cell--center appointments-table__header-cell--main-action"
                v-if="useDropdown"
              >
                <span class="appointments-table__header-text"
                  >Acción Principal</span
                >
              </th>

              <th
                scope="col"
                class="appointments-table__header-cell appointments-table__header-cell--contact"
                v-if="useDropdown"
              >
                <span class="appointments-table__header-text">Contacto</span>
              </th>

              <th
                scope="col"
                class="appointments-table__header-cell appointments-table__header-cell--actions"
              >
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
                v-if="useDropdown"
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

              <td
                class="appointments-table__cell appointments-table__cell--patient"
              >
                <span class="appointments-table__patient-name">
                  {{ appointment.customer.name }}
                </span>
              </td>

              <td
                class="appointments-table__cell appointments-table__cell--datetime"
              >
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

              <td
                class="appointments-table__cell appointments-table__cell--procedure"
              >
                <span class="appointments-table__procedure">
                  {{ appointment.package?.procedure?.name }}
                </span>
              </td>

              <td
                class="appointments-table__cell appointments-table__cell--reservation-type"
                v-if="useDropdown"
              >
                <span class="appointments-table__reservation-type">
                  {{ appointment.reservation_type.name }}
                </span>
              </td>

              <td
                class="appointments-table__cell appointments-table__cell--status"
              >
                <span
                  class="appointments-table__status"
                  :class="statusClass(appointment.appointment_status.code)"
                >
                  {{ appointment.appointment_status.value1 }}
                </span>
              </td>

              <td
                class="appointments-table__cell appointments-table__cell--actions appointments-table__cell--main-action"
                v-if="useDropdown"
              >
                <MedicosModalesDetallesCita :appointment="appointment">
                  <template #trigger="{ open }">
                    <button
                      v-if="
                        appointment.appointment_status.code ===
                        'PENDING_VALORATION_APPOINTMENT'
                      "
                      class="appointments-table__action-btn appointments-table__action-btn--primary"
                      @click="open"
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
                      @click="open"
                      :aria-label="`Realizar valoración de ${appointment.customer.name}`"
                      :disabled="
                        appointment.appointment_status.code ===
                        'VALUED_VALORATION_APPOINTMENT'
                      "
                    >
                      Valoración
                    </button>

                    <button
                      v-if="
                        appointment.appointment_status.code ===
                        'PENDING_PROCEDURE'
                      "
                      class="appointments-table__action-btn appointments-table__action-btn--success"
                      @click="open"
                      :aria-label="`Confirmar procedimiento de ${appointment.customer.name}`"
                    >
                      Confirmar Procedimiento
                    </button>

                    <button
                      v-if="
                        appointment.appointment_status.code ===
                        'WAITING_PROCEDURE'
                      "
                      class="appointments-table__action-btn appointments-table__action-btn--complete"
                      @click="open"
                      :aria-label="`Marcar como concretado procedimiento de ${appointment.customer.name}`"
                    >
                      Marcar como Concretado
                    </button>
                  </template>
                </MedicosModalesDetallesCita>
                <span
                  v-if="
                    ![
                      'PENDING_VALORATION_APPOINTMENT',
                      'VALUATION_PENDING_VALORATION_APPOINTMENT',
                      'CONFIRM_VALIDATION_APPOINTMENT',
                      'PENDING_PROCEDURE',
                      'WAITING_PROCEDURE',
                    ].includes(appointment.appointment_status.code)
                  "
                  class="appointments-table__no-action"
                >
                  —
                </span>
              </td>

              <td
                class="appointments-table__cell appointments-table__cell--center appointments-table__cell--contact"
                v-if="useDropdown"
              >
                <MedicosModalesContactModal :appointment="appointment" />
              </td>

              <td
                class="appointments-table__cell appointments-table__cell--actions"
              >
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
                      <MedicosModalesDetallesValoracion
                        v-if="
                          appointment.appointment_status.code ===
                          'VALUED_VALORATION_APPOINTMENT'
                        "
                        :appointment="appointment"
                      >
                        <template #trigger="{ open }">
                          <button
                            class="dropdown-item"
                            role="menuitem"
                            @click="open"
                          >
                            <AtomsIconsEyeIcon />
                            Ver más detalles
                          </button>
                        </template>
                      </MedicosModalesDetallesValoracion>
                      <MedicosModalesDetallesCita
                        v-else
                        :appointment="appointment"
                      >
                        <template #trigger="{ open }">
                          <button
                            class="dropdown-item"
                            role="menuitem"
                            @click="open"
                          >
                            <AtomsIconsEyeIcon />
                            Ver más detalles
                          </button>
                        </template>
                      </MedicosModalesDetallesCita>
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
                      <MedicosModalesConfirmacionReserva
                        :appointment="appointment"
                      >
                        <template #trigger="{ open }">
                          <button
                            class="dropdown-item"
                            role="menuitem"
                            @click="open"
                          >
                            <AtomsIconsCalendarDaysIcon />
                            Confirmar reserva
                          </button>
                        </template>
                      </MedicosModalesConfirmacionReserva>
                    </li>
                    <li
                      role="none"
                      v-if="
                        appointment.appointment_status.code ===
                        'PENDING_VALORATION_APPOINTMENT'
                      "
                    >
                      <MedicosModalesEditorFechaHora :appointment="appointment">
                        <template #trigger="{ open }">
                          <button
                            class="dropdown-item"
                            role="menuitem"
                            @click="open"
                          >
                            <Icon
                              :name="
                                appointment.appointment_type.name ==
                                'pre-reserva'
                                  ? 'lucide:square-pen'
                                  : 'lucide:undo-2'
                              "
                            />
                            {{
                              appointment.appointment_type.name == "pre-reserva"
                                ? "Editar fecha y hora"
                                : "Reprogramar cita"
                            }}
                          </button>
                        </template>
                      </MedicosModalesEditorFechaHora>
                    </li>

                    <li role="none">
                      <MedicosModalesInformacionUsuario
                        :appointment="appointment"
                      >
                        <template #trigger="{ open }">
                          <button
                            class="dropdown-item"
                            role="menuitem"
                            @click="open"
                          >
                            <AtomsIconsUserRoundIcon />
                            Perfil del Paciente
                          </button>
                        </template>
                      </MedicosModalesInformacionUsuario>
                    </li>

                    <li
                      role="none"
                      v-if="
                        ![
                          'CONCRETED_APPOINTMENT',
                          'CANCEL_APPOINTMENT',
                        ].includes(appointment.appointment_status.code)
                      "
                    >
                      <MedicosModalesAnularCita :appointment="appointment">
                        <template #trigger="{ open }">
                          <button
                            class="dropdown-item"
                            role="menuitem"
                            @click="open"
                          >
                            <AtomsIconsCircleXIcon />
                            Anular cita
                          </button>
                        </template>
                      </MedicosModalesAnularCita>
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
                  <MedicosModalesInformacionUsuario :appointment="appointment">
                    <template #trigger="{ open }">
                      <button
                        class="appointments-table__action-btn--view custom-stroke"
                        @click="open"
                        :aria-label="`Ver detalles de ${appointment.customer.name}`"
                      >
                        <Icon
                          name="lucide:file-search"
                          size="20"
                          stroke-width="1"
                        />
                      </button>
                    </template>
                  </MedicosModalesInformacionUsuario>

                  <MedicosModalesDetallesCita :appointment="appointment">
                    <template #trigger="{ open }">
                      <button
                        class="appointments-table__action-btn--edit custom-stroke"
                        @click="open"
                        :aria-label="`Editar cita de ${appointment.customer.name}`"
                      >
                        <AtomsIconsPenLineIcon size="20" />
                      </button>
                    </template>
                  </MedicosModalesDetallesCita>

                  <MedicosModalesAnularCita :appointment="appointment">
                    <template #trigger="{ open }">
                      <button
                        class="appointments-table__action-btn--cancel custom-stroke"
                        @click="open"
                        :aria-label="`Cancelar cita de ${appointment.customer.name}`"
                      >
                        <AtomsIconsTrashIcon size="20" />
                      </button>
                    </template>
                  </MedicosModalesAnularCita>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

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
      v-if="useDropdown"
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-items="totalItems"
      :items-per-page="itemsPerPage"
      :show-info="false"
      @page-changed="handlePageChange"
    />
  </section>
</template>

<style lang="scss" scoped>
.custom-stroke {
  &:deep(.icon g) {
    stroke-width: 1.5px !important;
  }

  &:deep(.icon path) {
    stroke-width: 1.5px !important;
  }
}

.sr-only {
  @include visually-hidden;
}

.appointments-table {
  --col-checkbox-width: 60px;
  --col-patient-width: 170px;
  --col-datetime-width: 140px;
  --col-procedure-width: 180px;
  --col-reservation-width: 130px;
  --col-status-width: 160px;
  --col-main-action-width: 150px;
  --col-contact-width: 80px;
  --col-actions-width: 80px;

  &--with-dropdown {
    --col-patient-width: 160px;
    --col-datetime-width: 120px;
    --col-procedure-width: 150px;
  }

  &--without-dropdown {
    --col-patient-width: 200px;
    --col-datetime-width: 160px;
    --col-procedure-width: 200px;
    --col-actions-width: 120px;
  }

  &__container {
    background: $white;
    border-radius: 10px;
    overflow: hidden;
  }

  &__wrapper {
    overflow-x: auto;
    min-height: 800px;
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

    &--checkbox {
      width: var(--col-checkbox-width);
      text-align: center;
    }

    &--patient {
      width: var(--col-patient-width);
    }

    &--datetime {
      width: var(--col-datetime-width);
    }

    &--procedure {
      width: var(--col-procedure-width);
    }

    &--reservation-type {
      width: var(--col-reservation-width);
    }

    &--status {
      width: var(--col-status-width);
    }

    &--main-action {
      width: var(--col-main-action-width);
    }

    &--contact {
      width: var(--col-contact-width);
    }

    &--actions {
      width: var(--col-actions-width);
      min-width: var(--col-actions-width);
    }

    &--center {
      font-weight: 500;
      text-align: center;
      font-size: 12px;
      color: #6d758f;
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

  &__action-btn {
    @include outline-button;
    font-weight: 600;
    font-size: 12px;
    line-height: 18px;
    padding: 8px 16px;
    width: 100%;

    &--view,
    &--edit,
    &--cancel {
      background: none;
      border: none;
      margin: auto;
      color: #353e5c;

      &:hover {
        filter: brightness(0);
      }

      svg {
        width: 20px;
        height: 20px;
      }
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

@media (max-width: 1200px) {
  .appointments-table {
    --col-patient-width: 140px;
    --col-procedure-width: 130px;
    --col-reservation-width: 110px;
    --col-status-width: 130px;
    --col-main-action-width: 120px;
  }
}

@media (max-width: 768px) {
  .appointments-table {
    --col-patient-width: 120px;
    --col-datetime-width: 100px;
    --col-procedure-width: 100px;
    --col-status-width: 100px;
    --col-main-action-width: 100px;
    --col-actions-width: 60px;

    &__container {
      border-radius: 0;
      box-shadow: none;
      border: 1px solid #dee2e6;
    }

    &__table {
      font-size: 0.75rem;
      table-layout: auto;
    }

    &__header-cell,
    &__cell {
      padding: 0.5rem;
    }

    &__header-cell {
      &--reservation-type {
        display: none;
      }
    }

    &__cell {
      &--reservation-type {
        display: none;
      }
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
