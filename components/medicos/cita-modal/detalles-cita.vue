<template>
  <div class="appointment-details">
    <!-- Modal Header -->
    <header class="appointment-details__header">
      <h1 id="appointment-modal-title" class="appointment-details__title">
        Detalles
        {{
          appointment.appointment_type.code == "VALORATION_APPOINTMENT"
            ? "de la Cita de valoración"
            : appointment.appointment_status.code == "WAITING_PROCEDURE"
              ? "del procedimiento"
              : "de la reserva"
        }}
      </h1>
      <button
        type="button"
        class="appointment-details__close-button"
        aria-label="Cerrar modal de detalles de la cita"
        @click="closeModal"
      >
        <AtomsIconsXIcon width="24" height="24" aria-hidden="true" />
      </button>
    </header>

    <!-- Modal Content -->
    <main class="appointment-details__content">
      <section
        class="appointment-details__information-section"
        aria-labelledby="appointment-info-heading"
      >
        <h2 id="appointment-info-heading" class="visually-hidden">
          Información de la cita
        </h2>

        <table
          class="appointment-details__information-table"
          role="table"
          aria-label="Información detallada de la cita médica"
        >
          <tbody class="appointment-details__table-body">
            <tr class="appointment-details__table-row">
              <th scope="row" class="appointment-details__table-header">
                Tipo de servicio:
              </th>
              <td class="appointment-details__table-data">
                {{
                  appointment.appointment_type.code == "VALORATION_APPOINTMENT"
                    ? "Cita de valoración"
                    : "Procedimiento médico"
                }}
              </td>
            </tr>

            <tr class="appointment-details__table-row">
              <th scope="row" class="appointment-details__table-header">
                Fecha de la cita:
              </th>
              <td class="appointment-details__table-data">
                <time :datetime="appointment.appointment_date">
                  {{
                    new Date(appointment.appointment_date).toLocaleDateString()
                  }}
                </time>
              </td>
            </tr>

            <tr class="appointment-details__table-row">
              <th scope="row" class="appointment-details__table-header">
                Hora de la cita:
              </th>
              <td class="appointment-details__table-data">
                {{ appointment.appointment_hour }}
              </td>
            </tr>

            <tr class="appointment-details__table-row--end-row">
              <th scope="row" class="appointment-details__table-header">
                Paciente:
              </th>
              <td class="appointment-details__table-data">
                {{ appointment.customer.name }}
              </td>
            </tr>

            <tr class="appointment-details__table-row">
              <th scope="row" class="appointment-details__table-header">
                Procedimiento:
              </th>
              <td class="appointment-details__table-data">
                {{ appointment.package?.procedure.name }}
              </td>
            </tr>

            <tr class="appointment-details__table-row">
              <th scope="row" class="appointment-details__table-header">
                Costo del servicio:
              </th>
              <td class="appointment-details__table-data">Ver en plataforma</td>
            </tr>

            <tr class="appointment-details__table-row">
              <th scope="row" class="appointment-details__table-header">
                Motivo:
              </th>
              <td class="appointment-details__table-data">
                {{ appointment.user_description }}
              </td>
            </tr>

            <tr class="appointment-details__table-row">
              <th scope="row" class="appointment-details__table-header">
                Fecha de solicitud:
              </th>
              <td class="appointment-details__table-data">
                <time :datetime="appointment.application_date">
                  {{
                    new Date(appointment.application_date).toLocaleDateString()
                  }}
                </time>
              </td>
            </tr>

            <tr class="appointment-details__table-row">
              <th scope="row" class="appointment-details__table-header">
                Estado de la cita:
              </th>
              <td class="appointment-details__table-data">
                <span
                  class="appointment-details__status-badge"
                  :class="getStatusClass(appointment.appointment_status.code)"
                  :aria-label="`Estado de la cita: ${appointment.appointment_status.value1}`"
                >
                  {{ appointment.appointment_status.value1 }}
                </span>
              </td>
            </tr>

            <tr
              v-if="hasCredit"
              class="appointment-details__table-row--end-row"
            >
              <th scope="row" class="appointment-details__table-header">
                Validación de Crédito:
              </th>
              <td>
                <div
                  v-if="!qrValidated"
                  class="appointment-details__table-data--qr-wrapper"
                >
                  <input
                    id="qr-code-input"
                    type="text"
                    :value="qrCodeInput"
                    :disabled="
                      appointment.appointment_status.code ===
                        'VALUED_VALORATION_APPOINTMENT' ||
                      appointment.appointment_status.code ===
                        'CONCRETED_APPOINTMENT'
                    "
                    @input="
                      $emit(
                        'update:qrCodeInput',
                        ($event.target as HTMLInputElement).value
                      )
                    "
                    placeholder="Escanear código QR"
                    class="appointment-details__table-data--input"
                    aria-describedby="qr-input-help"
                  />
                  <button
                    class="appointment-details__button--primary"
                    @click="handleValidateQrCode"
                    :disabled="
                      appointment.appointment_status.code ===
                        'VALUED_VALORATION_APPOINTMENT' ||
                      appointment.appointment_status.code ===
                        'CONCRETED_APPOINTMENT'
                    "
                  >
                    Validar QR
                  </button>
                </div>
                <div v-else>
                  <div class="alert alert-success mb-2">
                    Crédito pre-aprobado válido: {{ creditAmount }}
                  </div>
                  <button
                    class="btn btn-success"
                    @click="handleUseCredit"
                    :disabled="creditUsed"
                  >
                    {{ creditUsed ? "Crédito utilizado" : "Usar crédito" }}
                  </button>
                </div>
              </td>
              <div v-if="errorText" class="alert alert-danger mt-2">
                {{ errorText }}
              </div>
            </tr>

            <!-- Sección para valoración -->
            <template
              v-if="
                appointment.appointment_status.code ==
                  'VALUED_VALORATION_APPOINTMENT' ||
                appointment.appointment_status.code === 'CONCRETED_APPOINTMENT'
              "
            >
              <tr class="appointment-details__table-row">
                <th scope="row" class="appointment-details__table-header">
                  Proforma:
                </th>
                <td class="appointment-details__table-data">
                  <div
                    class="appointment-details__file-upload-container"
                    role="region"
                    aria-labelledby="proforma-upload-label"
                  >
                    <span id="proforma-upload-label" class="visually-hidden">
                      Sección de carga de archivo proforma
                    </span>

                    <input
                      id="proforma-file-input"
                      ref="proformaFile"
                      type="file"
                      class="appointment-details__file-input"
                      @change="$emit('handleProformaUpload', $event)"
                      accept=".pdf,.doc,.docx"
                      :aria-describedby="
                        proformaFileName || hasExistingProforma
                          ? 'current-file-info'
                          : 'file-upload-help'
                      "
                      :disabled="proformaGuardado"
                    />

                    <div
                      v-if="proformaFileName"
                      class="appointment-details__file-display"
                      role="group"
                      aria-labelledby="current-file-info"
                    >
                      <div
                        id="current-file-info"
                        class="appointment-details__file-name"
                        :aria-label="`Archivo seleccionado: ${proformaFileName}`"
                      >
                        <AtomsIconsFileTextIcon size="20" aria-hidden="true" />
                        {{ proformaFileName }}
                        <span
                          class="appointment-details__file-success-icon"
                          aria-label="Archivo cargado exitosamente"
                        >
                          <AtomsIconsCircleCheckBigIcon
                            size="12"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                      <button
                        class="appointment-details__file-remove-button"
                        type="button"
                        :aria-label="`Eliminar archivo ${proformaFileName}`"
                        @click="removeFile"
                        :disabled="proformaGuardado"
                      >
                        <AtomsIconsTrashIcon size="20" aria-hidden="true" />
                      </button>
                    </div>

                    <div
                      v-else-if="hasExistingProforma"
                      class="appointment-details__file-display"
                      role="group"
                      aria-labelledby="existing-file-info"
                    >
                      <div
                        id="existing-file-info"
                        class="appointment-details__file-name"
                        :aria-label="`Proforma existente: ${appointment.proforma_file_code}`"
                      >
                        <AtomsIconsFileTextIcon size="20" aria-hidden="true" />
                        {{ appointment.proforma_file_code }}
                        <span
                          class="appointment-details__file-success-icon"
                          aria-label="Proforma guardada"
                        >
                          <AtomsIconsCircleCheckBigIcon
                            size="12"
                            aria-hidden="true"
                          />
                        </span>
                      </div>
                      <div class="appointment-details__file-actions">
                        <button
                          v-if="
                            !proformaGuardado &&
                            appointment.appointment_status.code !==
                              'VALUED_VALORATION_APPOINTMENT' &&
                            appointment.appointment_status.code !==
                              'CONCRETED_APPOINTMENT'
                          "
                          class="appointment-details__file-remove-button"
                          type="button"
                          :aria-label="`Eliminar proforma ${appointment.proforma_file_code}`"
                          @click="removeExistingProforma"
                        >
                          <AtomsIconsTrashIcon size="16" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    <button
                      v-else
                      type="button"
                      class="appointment-details__file-upload-button"
                      @click="handleFileUploadClick"
                      :disabled="
                        proformaGuardado ||
                        appointment.appointment_status.code ===
                          'VALUED_VALORATION_APPOINTMENT'
                      "
                      aria-describedby="file-upload-help"
                    >
                      <AtomsIconsCloudUploadIcon aria-hidden="true" />
                      Adjuntar Proforma
                    </button>

                    <div id="file-upload-help" class="visually-hidden">
                      Formatos permitidos: PDF, DOC, DOCX
                    </div>
                  </div>
                </td>
              </tr>

              <tr>
                <th scope="row" class="appointment-details__table-header">
                  Valor del procedimiento:
                </th>
                <td class="appointment-details__table-data">
                  <input
                    type="text"
                    class="appointment-details__table-data--input"
                    :value="appointment.price_procedure"
                    disabled
                  />
                </td>
              </tr>

              <tr class="appointment-details__table-row">
                <th scope="row" class="appointment-details__table-header">
                  <label for="recommendations-textarea">
                    Recomendaciones Post-Cita:
                  </label>
                </th>
                <td class="appointment-details__table-data">
                  <textarea
                    id="recommendations-textarea"
                    :value="
                      props.appointment.recommendation_post_appointment ||
                      description
                    "
                    @input="
                      $emit(
                        'update:description',
                        ($event.target as HTMLInputElement).value
                      )
                    "
                    class="appointment-details__table-data--input"
                    rows="3"
                    placeholder="Escribe las recomendaciones médicas..."
                    :disabled="
                      appointment.appointment_status.code ===
                        'VALUED_VALORATION_APPOINTMENT' ||
                      appointment.appointment_status.code ===
                        'CONCRETED_APPOINTMENT'
                    "
                    :aria-describedby="
                      proformaGuardado
                        ? 'recommendations-saved'
                        : 'recommendations-help'
                    "
                  ></textarea>
                  <div id="recommendations-help" class="visually-hidden">
                    Campo para ingresar recomendaciones médicas post-cita
                  </div>
                  <span
                    v-if="proformaGuardado"
                    id="recommendations-saved"
                    class="visually-hidden"
                  >
                    Recomendaciones guardadas y no editables
                  </span>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </section>

      <div
        v-if="
          appointment.appointment_type.code !== 'VALORATION_APPOINTMENT' &&
          appointment.appointment_status.code !== 'CONCRETED_APPOINTMENT'
        "
        class="appointment-details__information-banner"
      >
        <div
          class="appointment-details__info-alert"
          role="note"
          aria-labelledby="coordination-reminder"
        >
          <AtomsIconsInfoIcon width="12" height="12" aria-hidden="true" />
          <p id="coordination-reminder" class="appointment-details__info-text">
            Asegúrate de coordinar con el paciente antes de confirmar con la
            cita
          </p>
        </div>
      </div>
    </main>

    <!-- Modal Footer -->
    <footer class="appointment-details__footer">
      <!-- Botones para citas pendientes -->
      <div
        v-if="
          appointment.appointment_status.code ==
            'PENDING_VALORATION_APPOINTMENT' ||
          appointment.appointment_status.code == 'PENDING_PROCEDURE'
        "
        class="appointment-details__action-group"
        role="group"
        aria-label="Acciones para cita pendiente"
      >
        <button
          type="button"
          class="appointment-details__button appointment-details__button--secondary"
          @click="$emit('editDateTime')"
          aria-describedby="edit-datetime-help"
        >
          <AtomsIconsSquarePenIcon width="20" height="20" aria-hidden="true" />
          Editar fecha y hora
        </button>
        <div id="edit-datetime-help" class="visually-hidden">
          Permite modificar la fecha y hora de la cita
        </div>

        <button
          type="button"
          class="appointment-details__button appointment-details__button--primary"
          @click="$emit('confirmReservation')"
          aria-describedby="confirm-reservation-help"
        >
          Confirmar reserva
        </button>
        <div id="confirm-reservation-help" class="visually-hidden">
          Confirma definitivamente la reserva de la cita
        </div>
      </div>

      <!-- Botones para otras citas -->
      <div
        v-else
        class="appointment-details__action-group"
        role="group"
        aria-label="Acciones disponibles para la cita"
      >
        <div
          class="appointment-details__action-subgroup"
          v-if="
            appointment.appointment_status.code !==
              'VALUED_VALORATION_APPOINTMENT' &&
            appointment.appointment_status.code !== 'CONCRETED_APPOINTMENT'
          "
        >
          <button
            type="button"
            class="appointment-details__button appointment-details__button--danger"
            @click="$emit('cancelAppointment')"
            aria-describedby="cancel-help"
          >
            Anular cita
          </button>
          <div id="cancel-help" class="visually-hidden">
            Cancela permanentemente la cita médica
          </div>

          <button
            type="button"
            class="appointment-details__button appointment-details__button--secondary"
            @click="$emit('reschedule')"
            aria-describedby="reschedule-help"
          >
            Reprogramar
          </button>
          <div id="reschedule-help" class="visually-hidden">
            Permite cambiar la fecha y hora de la cita
          </div>

          <button
            type="button"
            class="appointment-details__button appointment-details__button--primary"
            @click="$emit('markCompleted')"
            aria-describedby="complete-help"
          >
            Marcar concretada
          </button>
          <div id="complete-help" class="visually-hidden">
            Marca la cita como completada exitosamente
          </div>
        </div>

        <!-- Botones especiales para valoración completada -->
        <div
          class="appointment-details__action-group"
          v-if="
            appointment.appointment_status.code ==
              'VALUED_VALORATION_APPOINTMENT' ||
            appointment.appointment_status.code === 'CONCRETED_APPOINTMENT'
          "
        >
          <div
            class="appointment-details__save-indicator"
            :class="{
              'appointment-details__save-indicator--visible': proformaGuardado,
            }"
            role="status"
            aria-live="polite"
            :aria-label="
              proformaGuardado ? 'Cambios guardados exitosamente' : undefined
            "
          >
            <p class="appointment-details__save-text">Cambios guardados</p>
            <AtomsIconsCheckIcon size="20" aria-hidden="true" />
          </div>

          <div
            class="appointment-details__valuation-buttons"
            role="group"
            aria-label="Acciones de valoración"
          >
            <button
              type="button"
              class="appointment-details__button appointment-details__button--secondary"
              @click="$emit('editRecommendations')"
              :disabled="!proformaFileName"
              :aria-describedby="
                !proformaFileName ? 'edit-disabled-help' : undefined
              "
            >
              <AtomsIconsEditPencilIcon
                v-if="proformaGuardado"
                aria-hidden="true"
              />
              {{ proformaGuardado ? "Editar" : "Cancelar" }}
            </button>
            <div
              v-if="!proformaFileName"
              id="edit-disabled-help"
              class="visually-hidden"
            >
              Debe cargar una proforma antes de editar
            </div>

            <button
              type="button"
              class="appointment-details__button appointment-details__button--primary"
              @click="$emit('saveRecommendations')"
              :disabled="!proformaFileName"
              :aria-describedby="
                !proformaFileName ? 'save-disabled-help' : undefined
              "
            >
              Guardar
            </button>
            <div
              v-if="!proformaFileName"
              id="save-disabled-help"
              class="visually-hidden"
            >
              Debe cargar una proforma antes de guardar
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="errorText"
        class="appointment-details__alert appointment-details__alert--error"
        role="alert"
        aria-live="assertive"
      >
        {{ errorText }}
      </div>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import type { Appointment, AppointmentStatusCode } from "@/types/appointment";
import { computed, ref } from "vue";

interface Props {
  appointment: Appointment;
  proformaFileName: string;
  proformaGuardado: boolean;
  description: string;
  qrCodeInput: string;
  qrValidated: boolean;
  creditAmount: number;
  creditUsed: boolean;
  errorText?: string;
  closeModal: () => void;
  existingProformaRemoved?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits([
  "editDateTime",
  "confirmReservation",
  "cancelAppointment",
  "reschedule",
  "markCompleted",
  "editRecommendations",
  "saveRecommendations",
  "handleProformaUpload",
  "validateQrCode",
  "useCredit",
  "update:description",
  "update:qrCodeInput",
  "notSuitableProcedure",
  "removeProforma",
  "removeExistingProforma",
]);

const proformaFile = ref<HTMLInputElement | null>(null);

const hasExistingProforma = computed(() => {
  if (props.existingProformaRemoved) {
    return false;
  }

  return !!(
    props.appointment.proforma_file_code &&
    props.appointment.proforma_file_code.trim()
  );
});

const displayProformaName = computed(() => {
  if (props.proformaFileName) {
    return props.proformaFileName;
  }
  if (hasExistingProforma.value) {
    return `${props.appointment.proforma_file_code}`;
  }
  return "";
});

const handleFileUploadClick = () => {
  proformaFile.value?.click();
};

const handleValidateQrCode = () => {
  emit("validateQrCode");
};

const handleUseCredit = () => {
  emit("useCredit");
};

const hasCredit = computed(() => {
  console.log("Credito: ", props.appointment.appointment_credit);
  if (!props.appointment.appointment_credit) {
    return false;
  }

  if (props.appointment.appointment_credit) {
  }

  return true;
});

const removeFile = () => {
  const fileInput = document.getElementById("proforma-file-input");
  if (fileInput && fileInput instanceof HTMLInputElement) {
    fileInput.value = "";
  }

  emit("removeProforma");
};

const removeExistingProforma = () => {
  emit("removeExistingProforma");
};

const getStatusClass = (status: AppointmentStatusCode) => {
  const statusClassMap = {
    CANCEL_APPOINTMENT: "appointment-details__status-badge--cancelled",
    PENDING_VALORATION_APPOINTMENT:
      "appointment-details__status-badge--warning",
    PENDING_PROCEDURE: "appointment-details__status-badge--warning",
    CONFIRM_PROCEDURE: "appointment-details__status-badge--primary",
    CONCRETED_APPOINTMENT: "appointment-details__status-badge--primary",
    VALUED_VALORATION_APPOINTMENT: "appointment-details__status-badge--success",
    CONFIRM_VALIDATION_APPOINTMENT:
      "appointment-details__status-badge--success",
    VALUATION_PENDING_VALORATION_APPOINTMENT:
      "appointment-details__status-badge--primary",
    WAITING_PROCEDURE: "appointment-details__status-badge--warning",
  };
  return statusClassMap[status] || "";
};
</script>

<style lang="scss" scoped>
.appointment-details {
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

    &--qr-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 12px 0;

      button {
        text-wrap: nowrap;
      }
    }

    &--input {
      @include input-base;
      width: 100%;
    }
  }

  &__form-input {
    @include input-base;
    width: 100%;

    &--qr {
      margin-bottom: $spacing-sm;
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

  &__button {
    @include button-base;

    &--primary {
      @include primary-button;
    }

    &--secondary {
      @include outline-button;
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

    & > .appointment-details__button {
      flex: 1;
      min-width: 120px;
    }

    @include respond-to-max(sm) {
      flex-direction: column;

      & > .appointment-details__button {
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

      & > .appointment-details__button {
        width: 100%;
      }
    }
  }
}

.visually-hidden {
  @include visually-hidden;
}

@include respond-to-max(md) {
  .appointment-details {
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
  .appointment-details {
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

.appointment-details {
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

@media (prefers-contrast: high) {
  .appointment-details {
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

@media (prefers-reduced-motion: reduce) {
  .appointment-details {
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
