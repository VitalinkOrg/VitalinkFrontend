<template>
  <div class="date-time-editor">
    <header class="date-time-editor__header">
      <h1 id="appointment-modal-title" class="date-time-editor__title">
        Reprogramar reserva de cita
      </h1>
      <button
        type="button"
        class="date-time-editor__close-button"
        aria-label="Cerrar modal de detalles de la cita"
        @click="$emit('cancel')"
      >
        <AtomsIconsXIcon width="24" height="24" aria-hidden="true" />
      </button>
    </header>

    <!-- Modal Content -->
    <main class="date-time-editor__content">
      <table class="table table-borderless">
        <tbody class="date-time-editor__table-body">
          <tr class="date-time-editor__table-row">
            <th scope="row" class="date-time-editor__table-header">
              Paciente:
            </th>
            <td class="date-time-editor__table-data">
              {{ appointment.customer.name }}
            </td>
          </tr>
          <tr class="date-time-editor__table-row">
            <th scope="row" class="date-time-editor__table-header">
              Tipo de servicio:
            </th>
            <td class="date-time-editor__table-data">Cita de valoración</td>
          </tr>
          <tr class="date-time-editor__table-row">
            <th scope="row" class="date-time-editor__table-header">
              Fecha de la cita:
            </th>
            <td class="date-time-editor__table-data">
              <VDatePicker
                :model-value="selectedDate"
                @update:model-value="$emit('update:selectedDate', $event)"
                :attributes="attrs"
                :min-date="new Date()"
                is-required
                trim-weeks
                locale="es"
              >
                <template #default="{ inputValue, inputEvents }">
                  <div class="date-time-editor__button--outline-datetime">
                    <AtomsIconsCalendarIcon size="20" />
                    <input
                      :value="
                        formatDisplayDate(selectedDate) || 'Seleccionar fecha'
                      "
                      class="text-muted border-0 bg-transparent w-100"
                      v-on="inputEvents"
                      readonly
                    />
                    <AtomsIconsChevronDown size="20" />
                  </div>
                </template>
              </VDatePicker>
            </td>
          </tr>
          <tr class="date-time-editor__table-row">
            <th scope="row" class="date-time-editor__table-header">
              Hora de la cita:
            </th>
            <td class="date-time-editor__table-data">
              <div class="date-time-editor__time-dropdown dropdown">
                <button
                  class="date-time-editor__button--outline-datetime"
                  type="button"
                  id="timeDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  :disabled="!selectedDate"
                >
                  <div class="d-flex align-items-center gap-2 w-100">
                    <AtomsIconsClockIcon size="20" class="text-muted" />
                    <p class="m-0">
                      {{
                        selectedTime ? `${selectedTime}hs` : "Seleccionar hora"
                      }}
                    </p>
                  </div>
                </button>
                <ul class="dropdown-menu" aria-labelledby="timeDropdown">
                  <li v-for="time in availableTimes" :key="time">
                    <a class="dropdown-item" href="#" @click="selectTime(time)">
                      {{ time }}
                    </a>
                  </li>
                </ul>
              </div>
            </td>
          </tr>
          <tr class="date-time-editor__table-row">
            <th scope="row" class="date-time-editor__table-header">Motivo:</th>
            <td class="date-time-editor__table-data">
              {{ appointment.user_description }}
            </td>
          </tr>
          <tr class="date-time-editor__table-row">
            <th scope="row" class="date-time-editor__table-header">
              Procedimiento:
            </th>
            <td class="date-time-editor__table-data">
              {{ appointment.package?.procedure?.name }}
            </td>
          </tr>

          <tr class="date-time-editor__table-row">
            <th scope="row" class="date-time-editor__table-header">
              Fecha de solicitud:
            </th>
            <td class="date-time-editor__table-data">
              <time :datetime="appointment.application_date">
                {{
                  new Date(appointment.application_date).toLocaleDateString()
                }}
              </time>
            </td>
          </tr>
          <tr class="date-time-editor__table-row">
            <th scope="row" class="date-time-editor__table-header">
              Tipo de reserva:
            </th>
            <td class="text-capitalize">
              {{ appointment.appointment_type.name }}
            </td>
          </tr>
          <tr class="date-time-editor__table-row">
            <th scope="row" class="date-time-editor__table-header">Estado:</th>
            <td class="date-time-editor__table-data">
              <span
                class="date-time-editor__status-badge"
                :class="statusClass(appointment.appointment_status.code)"
                :aria-label="`Estado de la cita: ${appointment.appointment_status.value1}`"
              >
                {{ appointment.appointment_status.value1 }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="date-time-editor__information-banner">
        <div
          class="date-time-editor__info-alert"
          role="note"
          aria-labelledby="coordination-reminder"
        >
          <AtomsIconsInfoIcon width="12" height="12" aria-hidden="true" />
          <p id="coordination-reminder" class="date-time-editor__info-text">
            Asegúrate de coordinar con el paciente antes de confirmar con la
            cita
          </p>
        </div>
      </div>
    </main>

    <footer class="date-time-editor__footer">
      <div class="date-time-editor__action-group" role="group">
        <button
          class="date-time-editor__button date-time-editor__button--danger"
          @click="$emit('cancel')"
        >
          Cancelar
        </button>
        <button
          class="date-time-editor__button date-time-editor__button--primary"
          @click="$emit('saveChanges')"
        >
          Guardar cambios
        </button>
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import type { Appointment, AppointmentStatusCode } from "@/types/appointment";

interface Props {
  appointment: Appointment;
  selectedDate: string | Date;
  selectedTime: string;
  availableTimes: string[];
  attrs: Array<{ date: Date; disabled?: boolean }>;
}

const props = defineProps<Props>();

const emit = defineEmits([
  "update:selectedDate",
  "update:selectedTime",
  "cancel",
  "saveChanges",
]);

const formatDisplayDate = (date: string | Date) => {
  if (!date) return "Seleccionar fecha";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "Seleccionar fecha";
  return d.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const selectTime = (time: any) => {
  emit("update:selectedTime", time);
};

const statusClass = (status: AppointmentStatusCode) => {
  switch (status) {
    case "CANCEL_APPOINTMENT":
      return "bg-danger-subtle";
    case "PENDING_VALORATION_APPOINTMENT":
      return "bg-warning-subtle";
    case "PENDING_PROCEDURE":
      return "bg-warning-subtle";
    case "CONFIRM_PROCEDURE":
      return "bg-primary-subtle";
    case "CONCRETED_APPOINTMENT":
      return "bg-primary-subtle";
    case "VALUED_VALORATION_APPOINTMENT":
      return "bg-success-subtle";
    case "CONFIRM_VALIDATION_APPOINTMENT":
      return "bg-success-subtle";
    case "VALUATION_PENDING_VALORATION_APPOINTMENT":
      return "bg-primary-subtle";
    default:
      return "";
  }
};
</script>

<style lang="scss" scoped>
.date-time-editor {
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: 718px;
  width: 100%;
  max-height: calc(100vh - 3rem);
  pointer-events: auto;
  background-color: $white;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  outline: 0;
  overflow: hidden;
  box-shadow:
    0px 8px 8px -4px #1018280a,
    0px 20px 24px -4px #1018281a;

  // Header Section
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg;
    border-bottom: 1px solid #e4e7ec;
    background-color: $white;
  }

  &__title {
    font-family: $font-family-main;
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    color: #353e5c;
    margin: 0;
  }

  &__close-button {
    @include button-base;
    background-color: transparent;
    border: none;
    padding: $spacing-sm;
    color: #353e5c;
    border-radius: 50%;
    transition: all 0.15s ease-in-out;

    &:hover {
      color: $black;
      background-color: #f5f5f5;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }

  // Content Section
  &__content {
    padding: $spacing-lg;
    overflow-y: auto;
    flex: 1;
  }

  &__information-section {
    margin-bottom: 0px;
  }

  &__information-table {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
  }

  &__table-row {
    width: 100%;

    &--end-row {
      border-bottom: 1px solid #e1e4ed;
    }
  }

  &__table-header {
    @include form-label;
    font-family: $font-family-main;
    font-weight: 300;
    font-size: 16px;
    line-height: 20px;
    color: $color-text-secondary;
    padding: 19px 0;
    text-align: left;
    vertical-align: top;
  }

  &__table-data {
    padding: 19px 0;
    vertical-align: top;
    font-family: $font-family-main;
    font-weight: 500;
    font-size: 18px;
    line-height: 20px;
    color: $color-foreground;
    width: 60%;
  }

  &__form-input {
    @include input-base;
    width: 100%;

    &--qr {
      margin-bottom: $spacing-sm;
    }

    &:disabled,
    &[readonly] {
      background-color: #f9fafb;
      color: $color-text-muted;
      cursor: not-allowed;
      border-color: #e4e7ec;
    }
  }

  &__form-textarea {
    @include input-base;
    width: 100%;
    min-height: 128px;
    resize: vertical;
    margin-bottom: $spacing-md;
    font-family: $font-family-main;

    &:disabled {
      background-color: #f9fafb;
      color: $color-text-muted;
      cursor: not-allowed;
      border-color: #e4e7ec;
    }
  }

  // Status Badge
  &__status-badge {
    display: inline-block;
    text-align: center;
    font-family: $font-family-main;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    border-radius: 30px;
    padding: 6px 10px;
    white-space: nowrap;
    color: #19213d;

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

  // File Upload
  &__file-upload-container {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  &__file-input {
    @include visually-hidden;
  }

  &__file-display {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $spacing-sm;
  }

  &__file-name {
    @include label-base;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    color: $color-foreground;
    display: flex;
    gap: $spacing-sm;
    align-items: center;
    flex: 1;
  }

  &__file-success-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: #d1fadf;
    color: #039855;
    flex-shrink: 0;
  }

  &__file-remove-button {
    @include button-base;
    background: transparent;
    border: none;
    color: $color-text-muted;
    padding: $spacing-xs;
    border-radius: $border-radius-md;

    &:hover:not(:disabled) {
      color: $color-error;
      background-color: #fef2f2;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__file-upload-button {
    @include outline-button;
    font-weight: 600;
    gap: $spacing-sm;
    padding: 10px 16px;
    border-radius: $border-radius-md;
    justify-content: center;
  }

  &__time-dropdown {
    position: relative;
    width: 100%;
  }

  // Buttons
  &__button {
    @include button-base;

    &--primary {
      @include primary-button;
    }

    &--outline-datetime,
    &--outline {
      @include outline-button;
    }

    &--outline-datetime {
      width: 100%;
    }

    &--danger {
      @include button-base;
      background-color: transparent;
      color: $color-error;
      border: 1px solid transparent;

      &:hover:not(:disabled) {
        color: darken($color-error, 10%);
        background-color: #fef2f2;
      }

      &:focus-visible {
        outline: 2px solid $color-error;
        outline-offset: 2px;
      }
    }

    &--success {
      @include button-base;
      background-color: #10b981;
      border: 1px solid #10b981;
      color: $white;

      &:hover:not(:disabled) {
        background-color: darken(#10b981, 10%);
        border-color: darken(#10b981, 10%);
      }

      &:disabled {
        background-color: #d1fae5;
        border-color: #d1fae5;
        color: #065f46;
        cursor: not-allowed;
      }
    }
  }

  // Credit Validation
  &__credit-validation {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  &__credit-information {
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  // Alerts
  &__alert {
    padding: 12px 16px;
    border-radius: $border-radius-md;
    font-family: $font-family-main;
    font-size: 14px;
    line-height: 20px;
    font-weight: 500;
    border: 1px solid transparent;

    &--success {
      color: #065f46;
      background-color: #d1fae5;
      border-color: #a7f3d0;
    }

    &--error {
      color: #991b1b;
      background-color: #fef2f2;
      border-color: #fecaca;
    }
  }

  // Information Banner
  &__information-banner {
    margin-top: $spacing-md;
    display: flex;
  }

  &__info-alert {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: #eff8ff;
    color: #175cd3;
    border-radius: 16px;
    gap: $spacing-xs;
  }

  &__info-text {
    @include label-base;
    margin: 0;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    color: #175cd3;
    flex: 1;
  }

  // Footer Section
  &__footer {
    border-top: 1px solid #e4e7ec;
    background-color: $white;
    padding: $spacing-lg;
  }

  &__action-group {
    display: flex;
    gap: 12px;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    width: 100%;

    & > .date-time-editor__button {
      flex: 1;
      min-width: 120px;
    }

    @include respond-to-max(sm) {
      flex-direction: column;

      & > .date-time-editor__button {
        width: 100%;
        flex: none;
      }
    }
  }

  &__action-subgroup {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    flex: 1;
    flex-wrap: wrap;

    @include respond-to-max(sm) {
      flex-direction: column;
      width: 100%;
    }
  }

  // Save Indicator
  &__save-indicator {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-sm 12px;
    border-radius: $border-radius-md;
    color: #12b76a;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    margin-right: auto;

    &--visible {
      opacity: 1;
      transform: translateY(0);

      svg {
        width: 20px;
        height: 20px;
        padding: 2px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #d1fadf;
      }
    }
  }

  &__save-text {
    @include label-base;
    margin: 0;
    font-weight: 600;
    font-size: 16px;
    color: #12b76a;
  }

  &__valuation-buttons {
    display: flex;
    gap: 12px;
    align-items: center;

    @include respond-to-max(sm) {
      flex-direction: column;
      width: 100%;

      & > .date-time-editor__button {
        width: 100%;
      }
    }
  }
}

// Utility Classes
.visually-hidden {
  @include visually-hidden;
}

// Responsive Design
@include respond-to-max(md) {
  .date-time-editor {
    max-width: 100%;
    margin: 0;
    border-radius: 0;
    height: 100vh;
    max-height: 100vh;

    &__header {
      padding: $spacing-md;
    }

    &__content {
      padding: $spacing-md;
    }

    &__footer {
      padding: $spacing-md;
    }

    &__table-header,
    &__table-data {
      padding: $spacing-sm 0;
      font-size: 16px;
    }

    &__table-header {
      width: 35%;
    }

    &__table-data {
      width: 65%;
    }
  }
}

@include respond-to-max(sm) {
  .date-time-editor {
    &__table-row {
      display: flex;
      flex-direction: column;
      gap: $spacing-xs;
      padding: $spacing-sm 0;
      border-bottom: 1px solid #f2f4f7;
    }

    &__table-header,
    &__table-data {
      display: block;
      width: 100%;
      padding: 0;
    }

    &__table-header {
      font-size: 14px;
      margin-bottom: $spacing-xs;
    }

    &__table-data {
      font-size: 16px;
    }

    &__file-display {
      flex-direction: column;
      gap: $spacing-sm;
      align-items: flex-start;
    }

    &__file-name {
      width: 100%;
    }

    &__file-remove-button {
      align-self: flex-end;
    }
  }
}

// Focus Management
.date-time-editor {
  &__form-input:focus-visible,
  &__form-textarea:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
    border-color: $color-primary;
  }

  &__button:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  &__file-upload-button:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }
}

// High Contrast Mode Support
@media (prefers-contrast: high) {
  .date-time-editor {
    border: 2px solid $black;

    &__status-badge {
      border: 1px solid currentColor;
    }

    &__alert {
      border: 2px solid currentColor;
    }

    &__button {
      border: 2px solid currentColor;
    }
  }
}

// Reduced Motion Support
@media (prefers-reduced-motion: reduce) {
  .date-time-editor {
    &__save-indicator {
      transition: none;
    }

    &__button {
      transition: none;
    }

    &__close-button {
      transition: none;
    }
  }
}
</style>
