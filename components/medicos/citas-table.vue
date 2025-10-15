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

    <UiAppointmentTableBase
      :items="appointments"
      :columns="dynamicColumns"
      title="Tabla de Citas Médicas"
      aria-label="Lista de citas médicas"
      :items-per-page="itemsPerPage"
      default-sort-column="appointment_date"
      default-sort-direction="asc"
      empty-state-title="Aún no tienes actividad en tu tablero"
      empty-state-description="Muy pronto podrás administrar y verificar tu actividad."
      empty-state-action="Empezar"
      :show-pagination-info="false"
      @sort-changed="handleSortChange"
      @page-changed="handlePageChange"
      @empty-action="handleEmptyAction"
    >
      <template #cell-checkbox="{ item }">
        <label class="appointments-table__checkbox-label">
          <input
            type="checkbox"
            class="appointments-table__checkbox"
            :checked="selectedAppointments.has(item.id)"
            @change="toggleAppointmentSelection(item.id)"
            :aria-label="`${selectedAppointments.has(item.id) ? 'Deseleccionar' : 'Seleccionar'} cita de ${item.customer.name}`"
          />
          <span class="appointments-table__checkbox-custom"></span>
        </label>
      </template>

      <template #header-checkbox>
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
      </template>

      <template #cell-patient_name="{ item }">
        <span class="appointments-table__patient-name">
          {{ item.customer.name }}
        </span>
      </template>

      <template #cell-appointment_date="{ item }">
        <time
          :datetime="item.appointment_date"
          class="appointments-table__datetime"
        >
          {{ formatDate(item.appointment_date) }}
          <span class="appointments-table__time">
            a las {{ formatTime(item.appointment_hour) }}
          </span>
        </time>
      </template>

      <template #cell-procedure_name="{ item }">
        <span class="appointments-table__procedure">
          {{ item.package?.procedure?.name }}
        </span>
      </template>

      <template #cell-reservation_type="{ item }">
        <span class="appointments-table__reservation-type">
          {{ item.reservation_type.name }}
        </span>
      </template>

      <template #cell-appointment_status="{ item }">
        <span
          class="appointments-table__status"
          :class="statusClass(item.appointment_status.code)"
        >
          {{ item.appointment_status.value1 }}
        </span>
      </template>

      <template #cell-main_action="{ item }">
        <MedicosModalesDetallesCita :appointment="item">
          <template #trigger="{ open }">
            <button
              v-if="
                item.appointment_status.code ===
                'PENDING_VALORATION_APPOINTMENT'
              "
              class="appointments-table__action-btn appointments-table__action-btn--primary"
              @click="open"
              :aria-label="`Confirmar cita de valoración de ${item.customer.name}`"
            >
              Confirmar
            </button>

            <button
              v-else-if="
                [
                  'VALUATION_PENDING_VALORATION_APPOINTMENT',
                  'CONFIRM_VALIDATION_APPOINTMENT',
                ].includes(item.appointment_status.code)
              "
              class="appointments-table__action-btn appointments-table__action-btn--warning"
              @click="open"
              :aria-label="`Realizar valoración de ${item.customer.name}`"
            >
              Valoración
            </button>

            <button
              v-else-if="item.appointment_status.code === 'PENDING_PROCEDURE'"
              class="appointments-table__action-btn appointments-table__action-btn--success"
              @click="open"
              :aria-label="`Confirmar procedimiento de ${item.customer.name}`"
            >
              Confirmar Procedimiento
            </button>

            <button
              v-else-if="item.appointment_status.code === 'WAITING_PROCEDURE'"
              class="appointments-table__action-btn appointments-table__action-btn--complete"
              @click="open"
              :aria-label="`Marcar como concretado procedimiento de ${item.customer.name}`"
            >
              Marcar como Concretado
            </button>

            <span v-else class="appointments-table__no-action"> — </span>
          </template>
        </MedicosModalesDetallesCita>
      </template>

      <template #cell-contact="{ item }">
        <MedicosModalesContactModal :appointment="item" />
      </template>

      <template #cell-actions="{ item }">
        <div v-if="useDropdown" class="appointments-table__dropdown">
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
              <MedicosModalesDetallesValoracion
                v-if="
                  item.appointment_status.code ===
                  'VALUED_VALORATION_APPOINTMENT'
                "
                :appointment="item"
              >
                <template #trigger="{ open }">
                  <button class="dropdown-item" role="menuitem" @click="open">
                    <AtomsIconsEyeIcon />
                    Ver más detalles
                  </button>
                </template>
              </MedicosModalesDetallesValoracion>
              <MedicosModalesDetallesCita v-else :appointment="item">
                <template #trigger="{ open }">
                  <button class="dropdown-item" role="menuitem" @click="open">
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
                ].includes(item.appointment_status.code)
              "
            >
              <MedicosModalesConfirmacionReserva :appointment="item">
                <template #trigger="{ open }">
                  <button class="dropdown-item" role="menuitem" @click="open">
                    <AtomsIconsCalendarDaysIcon />
                    Confirmar reserva
                  </button>
                </template>
              </MedicosModalesConfirmacionReserva>
            </li>

            <li
              role="none"
              v-if="
                item.appointment_status.code ===
                'PENDING_VALORATION_APPOINTMENT'
              "
            >
              <MedicosModalesEditorFechaHora :appointment="item">
                <template #trigger="{ open }">
                  <button class="dropdown-item" role="menuitem" @click="open">
                    <Icon
                      :name="
                        item.appointment_type.name == 'pre-reserva'
                          ? 'lucide:square-pen'
                          : 'lucide:undo-2'
                      "
                    />
                    {{
                      item.appointment_type.name == "pre-reserva"
                        ? "Editar fecha y hora"
                        : "Reprogramar cita"
                    }}
                  </button>
                </template>
              </MedicosModalesEditorFechaHora>
            </li>

            <li role="none">
              <MedicosModalesInformacionUsuario :appointment="item">
                <template #trigger="{ open }">
                  <button class="dropdown-item" role="menuitem" @click="open">
                    <AtomsIconsUserRoundIcon />
                    Perfil del Paciente
                  </button>
                </template>
              </MedicosModalesInformacionUsuario>
            </li>

            <li
              role="none"
              v-if="
                !['CONCRETED_APPOINTMENT', 'CANCEL_APPOINTMENT'].includes(
                  item.appointment_status.code
                )
              "
            >
              <MedicosModalesAnularCita :appointment="item">
                <template #trigger="{ open }">
                  <button class="dropdown-item" role="menuitem" @click="open">
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
                @click="downloadSummary(item)"
              >
                <AtomsIconsArrowDownToLineIcon />
                Descargar Resumen
              </button>
            </li>
          </ul>
        </div>

        <div v-else class="appointments-table__actions">
          <MedicosModalesInformacionUsuario :appointment="item">
            <template #trigger="{ open }">
              <button
                class="appointments-table__action-btn--view custom-stroke"
                @click="open"
                :aria-label="`Ver detalles de ${item.customer.name}`"
              >
                <Icon name="lucide:file-search" size="20" stroke-width="1" />
              </button>
            </template>
          </MedicosModalesInformacionUsuario>

          <MedicosModalesDetallesCita :appointment="item">
            <template #trigger="{ open }">
              <button
                class="appointments-table__action-btn--edit custom-stroke"
                @click="open"
                :aria-label="`Editar cita de ${item.customer.name}`"
              >
                <AtomsIconsPenLineIcon size="20" />
              </button>
            </template>
          </MedicosModalesDetallesCita>

          <MedicosModalesAnularCita :appointment="item">
            <template #trigger="{ open }">
              <button
                class="appointments-table__action-btn--cancel custom-stroke"
                @click="open"
                :aria-label="`Cancelar cita de ${item.customer.name}`"
              >
                <AtomsIconsTrashIcon size="20" />
              </button>
            </template>
          </MedicosModalesAnularCita>
        </div>
      </template>

      <template #empty-state>
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
            <button
              class="appointments-table__empty-cta"
              @click="handleEmptyAction"
            >
              Empezar
            </button>
          </div>
        </div>
      </template>
    </UiAppointmentTableBase>
  </section>
</template>

<script lang="ts" setup>
import { jsPDF } from "jspdf";
import { computed, ref, watch } from "vue";
import type { Appointment, AppointmentStatusCode } from "~/types";
import type { TableColumn } from "../ui/appointment-table-base.vue";

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

const dynamicColumns = computed<TableColumn[]>(() => {
  const baseColumns: TableColumn[] = [];

  if (props.useDropdown) {
    baseColumns.push({
      key: "checkbox",
      label: "",
      width: "60px",
      sortable: false,
      cellClass: "appointments-table__cell--checkbox",
      headerClass: "appointments-table__header-cell--checkbox",
    });
  }

  baseColumns.push(
    {
      key: "patient_name",
      label: "Nombre del paciente",
      width: props.useDropdown ? "160px" : "200px",
      sortField: "customer.name",
    },
    {
      key: "appointment_date",
      label: "Fecha y hora",
      width: props.useDropdown ? "120px" : "160px",
    },
    {
      key: "procedure_name",
      label: "Procedimiento",
      width: props.useDropdown ? "150px" : "200px",
      sortField: "package.procedure.name",
    }
  );

  if (props.useDropdown) {
    baseColumns.push({
      key: "reservation_type",
      label: "Tipo de reserva",
      width: "130px",
      sortField: "reservation_type.name",
    });
  }

  baseColumns.push({
    key: "appointment_status",
    label: "Estado de cita",
    width: "160px",
    sortField: "appointment_status.code",
  });

  if (props.useDropdown) {
    baseColumns.push({
      key: "main_action",
      label: "Acción Principal",
      width: "150px",
      sortable: false,
      cellClass: "appointments-table__cell--center",
      headerClass: "appointments-table__header-cell--center",
    });
  }

  if (props.useDropdown) {
    baseColumns.push({
      key: "contact",
      label: "Contacto",
      width: "80px",
      sortable: false,
      cellClass: "appointments-table__cell--center",
      headerClass: "appointments-table__header-cell--center",
    });
  }

  baseColumns.push({
    key: "actions",
    label: "",
    width: props.useDropdown ? "80px" : "120px",
    sortable: false,
    cellClass: "appointments-table__cell--actions",
    headerClass: "appointments-table__header-cell--actions",
  });

  return baseColumns;
});

const toggleAppointmentSelection = (appointmentId: number): void => {
  if (selectedAppointments.value.has(appointmentId)) {
    selectedAppointments.value.delete(appointmentId);
  } else {
    selectedAppointments.value.add(appointmentId);
  }
};

const toggleAllAppointments = (): void => {
  if (allSelected.value) {
    selectedAppointments.value.clear();
  } else {
    props.appointments.forEach((appointment: Appointment) => {
      selectedAppointments.value.add(appointment.id);
    });
  }
  allSelected.value = !allSelected.value;
};

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
  selectedAppointments.value.clear();
  allSelected.value = false;
};

const handleEmptyAction = () => {
  console.log("Acción del estado vacío");
};

watch(
  () => props.appointments,
  () => {
    selectedAppointments.value.clear();
    allSelected.value = false;
  }
);
</script>

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

.appointments-table__status {
  width: 100%;
}

.appointments-table {
  &__patient-name,
  &__procedure,
  &__reservation-type,
  &__datetime {
    font-family: $font-family-main;
    font-weight: 300;
    font-size: 12px;
    color: #19213d;
    line-height: 20px;
  }

  &__time {
    display: block;
    color: #6d758f;
    font-size: 11px;
  }

  &__status {
    display: inline-block;
    text-align: center;
    white-space: nowrap;
    font-family: $font-family-main;
    font-weight: 500;
    font-size: 12px;
    color: #19213d;
    line-height: 18px;
    border-radius: 30px;
    padding: 6px 10px;

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
    justify-content: center;
  }

  &__no-action {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6c757d;
    font-size: 1.25rem;
  }

  &__dropdown {
    position: relative;
    display: flex;
    justify-content: center;
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
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }

  :deep(.dropdown-menu) {
    padding: 0;
    margin: 0;
    overflow: hidden;
    min-width: 200px;
  }

  :deep(.dropdown-item) {
    @include label-base;
    display: flex;
    align-items: center;
    gap: 15px;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    padding: 10px 14px;
    color: #353e5c;
    border: none;
    background: transparent;
    width: 100%;
    text-align: left;

    &:hover {
      background-color: #f1f3f7;
    }

    svg {
      color: #3541b4;
      width: 16px;
      height: 16px;
      flex-shrink: 0;
    }
  }

  &__empty-content {
    display: flex;
    align-items: center;
    gap: 2rem;
    max-width: 600px;
    margin: 0 auto;
    padding: 3rem 2rem;
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

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }
}

@media (max-width: 768px) {
  .appointments-table {
    &__empty-content {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }

    &__empty-icon {
      width: auto;
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
