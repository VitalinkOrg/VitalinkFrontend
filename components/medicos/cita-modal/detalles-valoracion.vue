<!-- components/medicos/cita-modal/detalles-valoracion.vue -->
<template>
  <div class="details-valuation">
    <header class="details-valuation__header">
      <h1 id="details-valuation-title" class="details-valuation__title">
        Detalles de la Cita de valoración
      </h1>
      <button
        type="button"
        class="details-valuation__close-button"
        aria-label="Cerrar modal de detalles de la cita"
        @click="closeModal"
      >
        <AtomsIconsXIcon width="24" height="24" aria-hidden="true" />
      </button>
    </header>

    <main class="details-valuation__content">
      <table
        class="details-valuation__information-table"
        role="table"
        aria-label="Información detallada de la cita médica"
      >
        <tbody class="details-valuation__table-body">
          <tr class="details-valuation__table-row">
            <th scope="row" class="details-valuation__table-header">
              Paciente:
            </th>
            <td>{{ appointment.customer.name }}</td>
          </tr>
          <tr class="details-valuation__table-row">
            <th scope="row" class="details-valuation__table-header">
              Fecha de la cita:
            </th>
            <td>
              {{ new Date(appointment.appointment_date).toLocaleDateString() }}
            </td>
          </tr>
          <tr class="details-valuation__table-row">
            <th scope="row" class="details-valuation__table-header">
              Hora de la cita:
            </th>
            <td>{{ appointment.appointment_hour }}</td>
          </tr>
          <tr class="details-valuation__table-row">
            <th scope="row" class="details-valuation__table-header">
              Procedimiento:
            </th>
            <td>
              <input
                type="text"
                class="form-control"
                :value="appointment.package?.procedure.name"
                readonly
              />
            </td>
          </tr>

          <tr class="details-valuation__table-row">
            <th scope="row" class="details-valuation__table-header">
              Proforma:
            </th>
            <td class="details-valuation__table-data">
              <div
                class="details-valuation__file-upload-container"
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
                  class="details-valuation__file-input"
                  @change="$emit('handleProformaUpload', $event)"
                  accept=".pdf,.doc,.docx"
                  :aria-describedby="
                    proformaFileName || existingProforma
                      ? 'current-file-info'
                      : 'file-upload-help'
                  "
                  :disabled="proformaGuardado"
                />

                <div
                  v-if="proformaFileName"
                  class="details-valuation__file-display"
                  role="group"
                  aria-labelledby="current-file-info"
                >
                  <div
                    id="current-file-info"
                    class="details-valuation__file-name"
                    :aria-label="`Archivo seleccionado: ${proformaFileName}`"
                  >
                    <AtomsIconsFileTextIcon size="20" aria-hidden="true" />
                    {{ proformaFileName }}
                    <span
                      class="details-valuation__file-success-icon"
                      aria-label="Archivo cargado exitosamente"
                    >
                      <AtomsIconsCircleCheckBigIcon
                        size="12"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                  <button
                    class="details-valuation__file-remove-button"
                    type="button"
                    :aria-label="`Eliminar archivo ${proformaFileName}`"
                    @click="removeFile"
                    :disabled="proformaGuardado"
                  >
                    <AtomsIconsTrashIcon size="20" aria-hidden="true" />
                  </button>
                </div>

                <div
                  v-else-if="existingProforma"
                  class="details-valuation__file-display"
                  role="group"
                  aria-labelledby="existing-file-info"
                >
                  <div
                    id="existing-file-info"
                    class="details-valuation__file-name"
                    :aria-label="`Proforma existente: ${existingProforma}`"
                  >
                    <AtomsIconsFileTextIcon size="20" aria-hidden="true" />
                    {{ existingProforma }}
                    <span
                      class="details-valuation__file-success-icon"
                      aria-label="Proforma guardada"
                    >
                      <AtomsIconsCircleCheckBigIcon
                        size="12"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                  <div class="details-valuation__file-actions">
                    <button
                      class="details-valuation__file-download-button"
                      type="button"
                      :aria-label="`Descargar proforma ${existingProforma}`"
                      @click="$emit('downloadProforma', existingProforma)"
                    >
                      <AtomsIconsDownloadIcon size="16" aria-hidden="true" />
                    </button>
                    <button
                      v-if="!proformaGuardado"
                      class="details-valuation__file-replace-button"
                      type="button"
                      :aria-label="`Reemplazar proforma ${existingProforma}`"
                      @click="handleFileUploadClick"
                    >
                      <AtomsIconsUploadIcon size="16" aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <button
                  v-else
                  type="button"
                  class="details-valuation__file-upload-button"
                  @click="handleFileUploadClick"
                  :disabled="proformaGuardado"
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

          <tr class="details-valuation__table-row">
            <th scope="row" class="details-valuation__table-header">
              <label for="price-procedure-input">
                Valor del procedimiento:
              </label>
            </th>
            <td>
              <input
                id="price-procedure-input"
                type="text"
                class="form-control"
                v-model="localProcedurePrice"
                @input="$emit('update:procedurePrice', localProcedurePrice)"
                placeholder="Ingrese el valor del procedimiento"
                :disabled="proformaGuardado"
                aria-describedby="price-procedure-help"
                aria-required="true"
              />
              <div id="price-procedure-help" class="visually-hidden">
                Campo obligatorio. Ingrese el valor monetario del procedimiento
              </div>
            </td>
          </tr>
          <tr class="details-valuation__table-row">
            <th scope="row" class="details-valuation__table-header">
              Recomendaciones Post-Cita:
            </th>
            <td>
              <textarea
                :value="description"
                @input="$emit('update:description', $event.target.value)"
                class="form-control mb-4"
                rows="4"
                placeholder="Escribe las recomendaciones médicas..."
                :disabled="proformaGuardado"
              ></textarea>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="details-valuation__information-banner">
        <div
          class="details-valuation__info-alert"
          role="note"
          aria-labelledby="coordination-reminder"
        >
          <AtomsIconsInfoIcon width="12" height="12" aria-hidden="true" />
          <p id="coordination-reminder" class="details-valuation__info-text">
            Asegúrate de coordinar con el paciente antes de confirmar con la
            cita
          </p>
        </div>
      </div>
    </main>

    <footer class="details-valuation__footer">
      <div class="details-valuation__action-group">
        <div
          class="details-valuation__valuation-buttons"
          role="group"
          aria-label="Acciones de valoración"
        >
          <div
            v-if="!proformaFileName"
            id="edit-disabled-help"
            class="visually-hidden"
          >
            Debe cargar una proforma antes de editar
          </div>
          <button
            class="details-valuation__button--outline"
            @click="handleGoBack"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="details-valuation__button details-valuation__button--primary"
            @click="handleSaveValoration"
            :disabled="!canSave"
            :aria-describedby="!canSave ? 'save-disabled-help' : undefined"
          >
            Guardar
          </button>
          <div v-if="canSave" id="save-disabled-help" class="visually-hidden">
            Debe cargar una proforma antes de guardar
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from "vue";

const existingProforma = ref(null);

const props = defineProps({
  appointment: Object,
  proformaFileName: String,
  proformaGuardado: Boolean,
  description: String,
  procedurePrice: String,
  closeModal: Function,
});

const emit = defineEmits([
  "handleProformaUpload",
  "saveValoration",
  "update:description",
  "update:procedurePrice",
  "removeProforma",
  "goBack",
]);

const localProcedurePrice = ref("");

const handleGoBack = () => {
  emit("goBack");
};

onMounted(() => {
  if (!props.procedurePrice && props.appointment.price_procedure) {
    localProcedurePrice.value = props.appointment.price_procedure;
    emit("update:procedurePrice", props.appointment.price_procedure);
  } else if (props.procedurePrice) {
    localProcedurePrice.value = props.procedurePrice;
  }
});

watch(
  () => props.procedurePrice,
  (newValue) => {
    if (newValue !== undefined) {
      localProcedurePrice.value = newValue;
    }
  }
);

const canSave = computed(() => {
  const hasProforma = props.proformaFileName || existingProforma.value;
  return hasProforma;
});

const handleFileUploadClick = () => {
  document.getElementById("proforma-file-input").click();
};

const handleSaveValoration = () => {
  emit("saveValoration");
};

const removeFile = () => {
  const fileInput = document.getElementById("proforma-file-input");
  if (fileInput) {
    fileInput.value = "";
  }

  emit("removeProforma");
};
</script>

<style lang="scss" scoped>
.details-valuation {
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

  // Buttons
  &__button {
    @include button-base;

    &--primary {
      @include primary-button;
    }

    &--outline {
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

    & > .details-valuation__button {
      flex: 1;
      min-width: 120px;
    }

    @include respond-to-max(sm) {
      flex-direction: column;

      & > .details-valuation__button {
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

      & > .details-valuation__button {
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
  .details-valuation {
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
  .details-valuation {
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
.details-valuation {
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
  .details-valuation {
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
  .details-valuation {
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
