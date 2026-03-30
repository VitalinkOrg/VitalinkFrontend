<template>
  <UiAppointmentTableBase
    :items="appointments"
    :columns="TABLE_COLUMNS"
    title="Tabla de Citas Pacientes"
    aria-label="Lista de citas médicas del paciente"
    :items-per-page="itemsPerPage"
    default-sort-column="created_date"
    default-sort-direction="desc"
    empty-state-title="Aún no tienes actividad en tu tablero"
    empty-state-description="Muy pronto podrás administrar y verificar tu actividad."
    empty-state-action="Empezar"
    :show-pagination-info="false"
    @sort-changed="onSortChanged"
    @page-changed="onPageChanged"
    @empty-action="navigateToSearch"
  >
    <template #cell-doctor="{ item }">
      <span class="patient-table__text">
        {{ item.supplier?.name ?? "N/A" }}
      </span>
    </template>

    <template #cell-appointment_date="{ value }">
      <time
        :datetime="value ? formatDate(value) : '-'"
        class="patient-table__datetime"
      >
        {{ value ? formatDate(value) : "-" }}
        <span class="patient-table__time">
          a las
          {{ value ? formatTime(value) : "-" }}
        </span>
      </time>
    </template>

    <template #cell-appointment_hour="{ value }">
      <time v-if="isValidValue(value)" class="patient-table__text">
        {{ value }}
      </time>
      <span v-else class="patient-table__text patient-table__text--empty">
        —
      </span>
    </template>

    <template #cell-procedure="{ item }">
      <span class="patient-table__text">
        {{ item.package?.procedure?.name ?? "—" }}
      </span>
    </template>

    <template #cell-appointment_qr_code="{ value }">
      <span class="patient-table__text">
        {{ value ?? "—" }}
      </span>
    </template>

    <template #cell-reservation_type="{ item }">
      <span class="patient-table__text">
        {{ item.reservation_type?.name ?? "—" }}
      </span>
    </template>

    <template #cell-status="{ item }">
      <PacientesAccionesEstadoCita
        :appointment="item"
        :show-status="true"
        @refresh="onRefresh"
      />
    </template>

    <template #cell-primary_action="{ item }">
      <PacientesAccionesEstadoCita
        :appointment="item"
        :show-status="false"
        @refresh="onRefresh"
      />
    </template>

    <template #cell-contact="{ item }">
      <PacientesModalesContactoMedico :appointment="item" />
    </template>

    <template #cell-actions="{ item }">
      <div
        class="patient-table__actions"
        @keydown="dropdown.handleEscapeKey($event)"
      >
        <button
          class="patient-table__actions-trigger"
          type="button"
          :aria-expanded="dropdown.isOpen(item.id)"
          :aria-label="`Más acciones para cita de ${item.customer?.name ?? 'paciente'}`"
          aria-haspopup="menu"
          @click="dropdown.toggle(item.id)"
        >
          <AtomsIconsThreeDotsHorizontalIcon aria-hidden="true" />
        </button>

        <ul
          v-show="dropdown.isOpen(item.id)"
          class="patient-table__actions-menu"
          role="menu"
          :aria-label="`Acciones para cita ${item.appointment_qr_code ?? ''}`"
        >
          <li role="none">
            <button
              class="patient-table__actions-option"
              role="menuitem"
              type="button"
              @click="handleOpenModal('appointmentDetails', item.id)"
            >
              <AtomsIconsEyeIcon aria-hidden="true" />
              Ver más detalles
            </button>
          </li>

          <li v-if="isCancellable(item)" role="none">
            <button
              class="patient-table__actions-option patient-table__actions-option--danger"
              role="menuitem"
              type="button"
              @click="handleOpenModal('cancelAppointment', item.id)"
            >
              <AtomsIconsEyeIcon aria-hidden="true" />
              Anular Cita
            </button>
          </li>

          <li role="none">
            <button
              class="patient-table__actions-option"
              role="menuitem"
              type="button"
              :disabled="isDownloading"
              :aria-busy="isDownloading"
              @click="handleDownloadSummary(item)"
            >
              <AtomsIconsArrowDownToLineIcon aria-hidden="true" />
              {{ isDownloading ? "Descargando…" : "Descargar Resumen" }}
            </button>
          </li>
        </ul>
      </div>
    </template>

    <template #empty-state>
      <div class="patient-table__empty" role="status">
        <div class="patient-table__empty-icon" aria-hidden="true">
          <AtomsIconsChartVacio />
        </div>
        <div class="patient-table__empty-body">
          <p class="patient-table__empty-title">
            Aún no tienes actividad en tu tablero
          </p>
          <p class="patient-table__empty-description">
            Muy pronto podrás administrar y verificar tu actividad.
          </p>
          <button
            class="patient-table__empty-action"
            type="button"
            @click="navigateToSearch"
          >
            Empezar
          </button>
        </div>
      </div>
    </template>
  </UiAppointmentTableBase>

  <PacientesModalesDetallesCita
    v-if="modal.isActive('appointmentDetails')"
    :appointment="modal.activeItem.value!"
    :is-open="true"
    @open-modal="modal.open"
    @close-modal="modal.close"
  />

  <PacientesModalesAnularCita
    v-if="modal.isActive('cancelAppointment')"
    :appointment="modal.activeItem.value!"
    :is-open="true"
    @open-modal="modal.open"
    @close-modal="modal.close"
  />

  <PacientesModalesDejarValoracion
    v-if="modal.isActive('leaveReview')"
    :appointment="modal.activeItem.value!"
    :is-open="true"
    @open-modal="modal.open"
    @close-modal="modal.close"
  />

  <PacientesModalesDejarValoracionExitoso
    v-if="modal.isActive('leaveReviewSuccess')"
    :appointment="modal.activeItem.value!"
    :is-open="true"
    @open-modal="modal.open"
    @close-modal="modal.close"
  />
</template>

<script setup lang="ts">
import { useAppointmentSummary } from "~/composables/useAppointmentSummary";
import { useModalController } from "~/composables/useModalController";
import type { TableColumn } from "../ui/appointment-table-base.vue";

const { formatDate, formatTime } = useFormat();

const NON_CANCELLABLE_STATUSES: ReadonlySet<string> = new Set([
  "CONCRETED_APPOINTMENT",
  "CANCEL_APPOINTMENT",
]);

const PROCEDURE_CONFIRMED_STATUSES: ReadonlySet<string> = new Set([
  "CONFIRM_PROCEDURE",
  "WAITING_PROCEDURE",
  "CONCRETED_APPOINTMENT",
]);

const TABLE_COLUMNS: TableColumn[] = [
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
    key: "appointment_qr_code",
    label: "Código de reserva",
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
    label: "Acción Principal",
    width: "8.125rem",
    sortable: false,
    cellClass: "patient-table__cell--center",
  },
  {
    key: "contact",
    label: "Contacto",
    width: "5rem",
    sortable: false,
    cellClass: "patient-table__cell--center",
  },
  {
    key: "actions",
    label: "",
    width: "3.75rem",
    sortable: false,
    cellClass: "patient-table__cell--actions",
  },
];

interface Props {
  appointments: IAppointment[];
  itemsPerPage?: number;
}

const props = withDefaults(defineProps<Props>(), {
  itemsPerPage: 10,
});

const logger = useLogger("PatientCitasTable");
const router = useRouter();

const refreshAppointments = inject<(() => void) | undefined>(
  "refreshAppointments",
  undefined,
);

const appointmentsRef = computed(() => props.appointments);
const modal = useModalController(appointmentsRef);
const dropdown = useDropdownController();
const { isDownloading, download: downloadSummary } = useAppointmentSummary();

function isValidValue(value: unknown): value is string | Date {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (value instanceof Date) return !isNaN(value.getTime());
  return false;
}

function formatDisplayDate(value: string | Date | null | undefined): string {
  if (!isValidValue(value)) return "—";
  try {
    return new Date(value).toLocaleDateString("es-ES");
  } catch {
    return "—";
  }
}

function toISODate(value: string | Date | null | undefined): string {
  if (!isValidValue(value)) return "";
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

function isProcedureConfirmed(appointment: IAppointment): boolean {
  const code = appointment.appointment_status?.code;
  return !!code && PROCEDURE_CONFIRMED_STATUSES.has(code);
}

function isCancellable(appointment: IAppointment): boolean {
  const statusCode = appointment.appointment_status?.code;
  if (!statusCode) return true;
  return !NON_CANCELLABLE_STATUSES.has(statusCode);
}

function handleOpenModal(modalName: ModalName, appointmentId: number): void {
  dropdown.close();
  modal.open(modalName, appointmentId);
}

async function handleDownloadSummary(appointment: IAppointment): Promise<void> {
  dropdown.close();
  await downloadSummary(appointment);
}

function onRefresh(): void {
  refreshAppointments?.();
}

function navigateToSearch(): void {
  router.push("/buscar");
}

function onSortChanged(payload: {
  column: string;
  direction: "asc" | "desc";
}): void {
  logger.debug("Ordenamiento cambiado", {
    column: payload.column,
    direction: payload.direction,
  });
}

function onPageChanged(page: number): void {
  logger.debug("Página cambiada", { page });
}

function onGlobalKeydown(event: KeyboardEvent): void {
  if (event.key !== "Escape") return;

  if (modal.activeModal.value) {
    modal.close();
    return;
  }

  dropdown.close();
}

function onGlobalClick(event: MouseEvent): void {
  dropdown.handleClickOutside(event, ".patient-table__actions");
}

onMounted(() => {
  document.addEventListener("keydown", onGlobalKeydown);
  document.addEventListener("click", onGlobalClick);
});

onBeforeUnmount(() => {
  document.removeEventListener("keydown", onGlobalKeydown);
  document.removeEventListener("click", onGlobalClick);
});
</script>

<style lang="scss" scoped>
.patient-table {
  &__text {
    font-family: $font-family-main;
    font-weight: 300;
    font-size: 0.75rem;
    color: $color-foreground;
    line-height: 1.25rem;

    &--empty {
      color: $color-text-muted;
      font-style: italic;
    }
  }

  &__cell--center {
    text-align: center;
  }

  &__cell--actions {
    text-align: right;
  }

  &__actions {
    position: relative;
  }

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

  &__actions-trigger {
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

    &[aria-expanded="true"] {
      background-color: #f1f3f7;
      color: $color-primary;
    }
  }

  &__actions-menu {
    position: absolute;
    top: 100%;
    right: 0;
    z-index: 1000;
    min-width: 12rem;
    padding: 0.25rem 0;
    margin: 0.25rem 0 0;
    list-style: none;
    background-color: $white;
    border: 0.0625rem solid #d0d5dd;
    border-radius: 0.5rem;
    box-shadow: 0 0.375rem 0.75rem rgba(0, 0, 0, 0.15);
  }

  &__actions-option {
    @include label-base;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.625rem 0.875rem;
    border: none;
    background: transparent;
    font-weight: 400;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #353e5c;
    cursor: pointer;
    transition: background-color 0.15s ease;
    text-align: left;

    &:hover {
      background-color: #f1f3f7;
    }

    &:focus-visible {
      outline: 0.125rem solid $color-primary;
      outline-offset: -0.125rem;
      background-color: #f1f3f7;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    svg {
      color: $color-primary;
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
    }

    &--danger {
      color: $color-error;

      svg {
        color: $color-error;
      }

      &:hover {
        background-color: rgba($color-error, 0.06);
      }
    }
  }

  &__empty {
    display: flex;
    align-items: center;
    padding: 3rem 2rem;
    gap: 2rem;

    @include respond-to-max(sm) {
      flex-direction: column;
      text-align: center;
      padding: 2rem 1rem;
    }
  }

  &__empty-icon {
    flex-shrink: 0;
  }

  &__empty-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__empty-title {
    font-family: $font-family-main;
    font-size: 1.125rem;
    font-weight: 500;
    color: $color-text-muted;
    margin: 0;
  }

  &__empty-description {
    font-family: $font-family-main;
    font-weight: 300;
    font-size: 0.875rem;
    color: $color-text-secondary;
    margin: 0;
  }

  &__empty-action {
    @include primary-button;
    align-self: flex-start;
    margin-top: 0.5rem;
    padding: 0.5rem 1.25rem;

    @include respond-to-max(sm) {
      align-self: center;
    }
  }
}
</style>
