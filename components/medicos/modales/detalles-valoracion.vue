<template>
  <slot name="trigger" :open="handleOpenModal"></slot>

  <AtomsModalBase
    :is-open="isModalOpen"
    size="large"
    @close="handleCloseModal"
    :close-on-backdrop="false"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
  >
    <template #title>
      <h1 id="appointment-modal-title" class="valoration-details__title">
        Detalles de la Cita de valoración
      </h1>
    </template>

    <div class="valoration-details__body">
      <MedicosTablaDetallesCita
        :rows="appointmentRowsWithData"
        aria-label="Detalles de la cita médica"
      >
        <template #data-proforma>
          <div v-if="isEditing">
            <template v-if="!currentProformaFileName">
              <label
                for="attach-proforma"
                class="valoration-details__attach-proforma"
              >
                <AtomsIconsCloudUploadIcon aria-hidden="true" />
                Adjuntar Proforma
              </label>
              <input
                id="attach-proforma"
                type="file"
                class="visually-hidden"
                accept=".pdf,.doc,.docx"
                @change="handleFileUpload"
              />
              <div
                v-if="proformaError"
                class="valoration-details__error-message"
              >
                {{ proformaError }}
              </div>
            </template>
            <template v-else>
              <div class="valoration-details__proforma-uploaded-wrapper">
                <div class="valoration-details__proforma-uploaded">
                  <AtomsIconsFileTextIcon size="20" aria-hidden="true" />
                  <p class="valoration-details__proforma-name">
                    <span
                      class="valoration-details__proforma-name-text"
                      :title="currentProformaFileName"
                    >
                      {{ currentProformaFileName }}
                    </span>
                  </p>
                  <span class="valoration-details__file-success-icon">
                    <AtomsIconsCircleCheckBigIcon
                      size="12"
                      aria-hidden="true"
                    />
                  </span>
                </div>
                <button
                  class="valoration-details__remove-proforma"
                  type="button"
                  :aria-label="`Eliminar archivo ${currentProformaFileName}`"
                  @click="handleRemoveProforma"
                >
                  <AtomsIconsTrashIcon size="20" aria-hidden="true" />
                </button>
              </div>
            </template>
          </div>
          <div v-else>
            {{ currentProformaFileName || "Sin proforma adjunta" }}
          </div>
        </template>

        <template #data-valor-procedimiento>
          <input
            type="text"
            id="price-procedure"
            :value="formattedPriceDisplay"
            @input="handlePriceInput"
            :disabled="!isEditing"
            class="valoration-details__input"
            placeholder="₡0"
            inputmode="numeric"
          />
        </template>

        <template #data-recomendaciones>
          <textarea
            v-model="currentRecommendation"
            rows="3"
            :disabled="!isEditing"
            class="valoration-details__textarea"
            placeholder="Escribe las recomendaciones médicas..."
          />
        </template>

        <template #data-diagnostico>
          <textarea
            v-model="currentDiagnostic"
            rows="3"
            :disabled="!isEditing"
            class="valoration-details__textarea"
            placeholder="Escribe el diagnóstico médico..."
          />
        </template>

        <template #data-estado-cita>
          <span :class="getStatusClass(appointment.appointment_status.code)">
            {{ appointment.appointment_status.value1 }}
          </span>
        </template>
      </MedicosTablaDetallesCita>
    </div>

    <template #footer>
      <div class="valoration-details__actions">
        <template v-if="changesSaved && !isEditing">
          <div class="valoration-details__saved-changes--wrapper">
            <span class="valoration-details__saved-changes--text"
              >Cambios Guardados</span
            >
            <span class="valoration-details__saved-changes--icon">
              <AtomsIconsCheckIcon size="20" />
            </span>
          </div>
          <div class="valoration-details__view-buttons">
            <button
              class="valoration-details__button--outline"
              @click="handleEdit"
            >
              <AtomsIconsSquarePenIcon size="20" /> Editar
            </button>
            <button
              class="valoration-details__button--primary"
              @click="handleViewInAppointments"
            >
              Ver en citas
            </button>
          </div>
        </template>

        <div v-else class="valoration-details__buttons-wrapper">
          <button
            class="valoration-details__button--outline"
            :disabled="!hasChanges || isLoading"
            @click="handleCancel"
          >
            Cancelar
          </button>
          <MedicosModalesConfirmacionValoracion
            v-if="
              appointment.appointment_status.code ===
              'CONFIRM_VALIDATION_APPOINTMENT'
            "
            :appointment="appointment"
            :recommendation="currentRecommendation"
            :diagnostic="currentDiagnostic"
            :proforma-file-name="currentProformaFileName || ''"
            :price-procedure="currentPriceProcedure"
          >
            <template #trigger="{ open }">
              <button class="valoration-details__button--primary" @click="open">
                Guardar
              </button>
            </template>
          </MedicosModalesConfirmacionValoracion>
          <button
            v-else
            class="valoration-details__button--primary"
            :disabled="!canSave || isLoading"
            @click="handleSaveChanges"
          >
            {{ isLoading ? "Guardando..." : "Guardar" }}
          </button>
        </div>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useAppointment, useDocuments } from "@/composables/api";
import { nextTick, readonly } from "vue";
import type { Appointment, AppointmentStatusCode } from "~/types";
import type { TablaBaseRow } from "../tabla-detalles-cita.vue";

const isModalOpen = ref(false);
const isLoading = ref(false);
const isEditing = ref(true);
const changesSaved = ref(false);

const currentRecommendation = ref("");
const currentDiagnostic = ref("");
const currentPriceProcedure = ref("");
const currentProformaFileName = ref<string | null>(null);

const originalRecommendation = ref("");
const originalDiagnostic = ref("");
const originalPriceProcedure = ref("");
const originalProformaFileName = ref<string | null>(null);

const proformaFile = ref<File | null>(null);
const proformaError = ref("");

interface Props {
  appointment: Appointment;
}
const props = defineProps<Props>();

const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");

const { uploadProforma } = useAppointment();
const { uploadDocument } = useDocuments();
const { formatDate, formatTime, formatCurrency } = useFormat();

const hasChanges = computed(
  () =>
    currentRecommendation.value !== originalRecommendation.value ||
    currentDiagnostic.value !== originalDiagnostic.value ||
    currentPriceProcedure.value !== originalPriceProcedure.value ||
    currentProformaFileName.value !== originalProformaFileName.value
);

const canSave = computed(
  () => hasChanges.value && !!currentProformaFileName.value
);

const formattedPriceDisplay = computed(() =>
  !currentPriceProcedure.value || currentPriceProcedure.value === "0"
    ? ""
    : formatCurrency(currentPriceProcedure.value, { decimalPlaces: 0 })
);

const appointmentRowsWithData = computed((): TablaBaseRow[] => [
  {
    key: "tipo-servicio",
    header: "Tipo de servicio:",
    value: props.appointment.appointment_type.name,
  },
  {
    key: "fecha",
    header: "Fecha de la cita:",
    value: formatDate(props.appointment.appointment_date),
  },
  {
    key: "hora",
    header: "Hora de la cita:",
    value: formatTime(props.appointment.appointment_hour, "hs"),
  },
  {
    key: "paciente",
    header: "Paciente:",
    value: props.appointment.customer.name,
    isEndRow: true,
  },
  {
    key: "procedimiento",
    header: "Procedimiento:",
    value: props.appointment.package?.procedure?.name,
  },
  {
    key: "motivo",
    header: "Motivo:",
    value: props.appointment.user_description,
  },
  { key: "costo", header: "Costo del servicio:", value: "Ver en proforma" },
  {
    key: "fecha-solicitud",
    header: "Fecha de la solicitud:",
    value: formatDate(props.appointment.application_date, "short"),
  },
  {
    key: "estado-cita",
    header: "Estado de la cita:",
    value: props.appointment.appointment_status.value1,
    isEndRow: true,
  },
  {
    key: "proforma",
    header: "Proforma:",
    value:
      currentProformaFileName.value ||
      props.appointment.proforma_file_code ||
      "Sin proforma",
  },
  {
    key: "valor-procedimiento",
    header: "Valor del procedimiento:",
    value: formatCurrency(currentPriceProcedure.value, { decimalPlaces: 0 }),
  },
  {
    key: "recomendaciones",
    header: "Recomendaciones Post-Cita:",
    value: currentRecommendation.value || "Sin recomendaciones",
  },
  {
    key: "diagnostico",
    header: "Diagnostico:",
    value: currentDiagnostic.value || "Sin diagnóstico",
  },
]);

const initializeValues = () => {
  currentRecommendation.value =
    props.appointment.recommendation_post_appointment || "";
  currentDiagnostic.value = props.appointment.diagnostic || "";
  currentPriceProcedure.value = props.appointment.price_procedure || "";
  currentProformaFileName.value = props.appointment.proforma_file_code || null;

  originalRecommendation.value = currentRecommendation.value;
  originalDiagnostic.value = currentDiagnostic.value;
  originalPriceProcedure.value = currentPriceProcedure.value;
  originalProformaFileName.value = currentProformaFileName.value;

  proformaError.value = "";
};

const handleOpenModal = () => {
  isModalOpen.value = true;
  isEditing.value = true;
  changesSaved.value = false;
  initializeValues();
};

const handleCloseModal = () => {
  isModalOpen.value = false;
  resetState();
};

const resetState = () => {
  isEditing.value = true;
  changesSaved.value = false;
  isLoading.value = false;
  proformaError.value = "";
};

const handleFileUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    currentProformaFileName.value = file.name;
    proformaFile.value = file;
    proformaError.value = "";
  }
};

const handleRemoveProforma = () => {
  currentProformaFileName.value = null;
  proformaFile.value = null;
  proformaError.value = "";
};

const handleCancel = () => {
  currentRecommendation.value = originalRecommendation.value;
  currentDiagnostic.value = originalDiagnostic.value;
  currentPriceProcedure.value = originalPriceProcedure.value;
  currentProformaFileName.value = originalProformaFileName.value;
  proformaError.value = "";
};

const handleUploadDocument = async () => {
  if (!proformaFile.value) return null;
  const fields = {
    title: proformaFile.value.name,
    type: "DOC",
    description: "",
    id_for_table: 6,
    table: "",
    action_type: "PRIVATE_CONTRACT",
    user_id: "",
    is_public: 0,
  };
  const api = uploadDocument(proformaFile.value, fields);
  await api.request();
  return api.response.value?.data?.code || null;
};

const handleSaveChanges = async () => {
  if (!currentProformaFileName.value) {
    proformaError.value =
      "Debe adjuntar una proforma para poder guardar los cambios";
    return;
  }
  if (!hasChanges.value) return;

  isLoading.value = true;
  proformaError.value = "";
  try {
    const proformaFileCode = await handleUploadDocument();
    if (!proformaFileCode) throw new Error();

    const payload = {
      price_procedure: currentPriceProcedure.value,
      recommendation_post_appointment: currentRecommendation.value,
      diagnostic: currentDiagnostic.value,
      appointment_result_code: "FIT_FOR_PROCEDURE",
      proforma_file_code: proformaFileCode,
    };

    const api = uploadProforma(payload, props.appointment.id);
    await api.request();
    if (api.error.value) throw new Error(api.error.value.raw);

    originalRecommendation.value = currentRecommendation.value;
    originalDiagnostic.value = currentDiagnostic.value;
    originalPriceProcedure.value = currentPriceProcedure.value;
    originalProformaFileName.value = currentProformaFileName.value;

    changesSaved.value = true;
    isEditing.value = false;
    await refreshAppointments?.();
  } catch {
    proformaError.value =
      "Error al guardar los cambios. Por favor intenta nuevamente.";
  } finally {
    isLoading.value = false;
  }
};

const handleEdit = () => {
  isEditing.value = true;
  changesSaved.value = false;
  proformaError.value = "";
};

const handleViewInAppointments = () => handleCloseModal();

const getStatusClass = (status: AppointmentStatusCode) =>
  ({
    CANCEL_APPOINTMENT: "status-badge--cancelled",
    PENDING_VALORATION_APPOINTMENT: "status-badge--warning",
    PENDING_PROCEDURE: "status-badge--warning",
    CONFIRM_PROCEDURE: "status-badge--primary",
    CONCRETED_APPOINTMENT: "status-badge--primary",
    VALUED_VALORATION_APPOINTMENT: "status-badge--success",
    CONFIRM_VALIDATION_APPOINTMENT: "status-badge--success",
    VALUATION_PENDING_VALORATION_APPOINTMENT: "status-badge--primary",
    WAITING_PROCEDURE: "status-badge--warning",
  })[status] || "";

const handlePriceInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const cursorPosition = target.selectionStart ?? 0;
  const oldValue = target.value;
  const rawValue = oldValue.replace(/[^\d]/g, "");
  currentPriceProcedure.value = rawValue || "0";
  nextTick(() => {
    const newFormattedValue = formatCurrency(rawValue || "0", {
      decimalPlaces: 0,
    });
    const digitsBeforeCursor = oldValue
      .substring(0, cursorPosition)
      .replace(/[^\d]/g, "").length;
    let digitCount = 0;
    let newCursorPosition = 0;
    for (let i = 0; i < newFormattedValue.length; i++) {
      if (/\d/.test(newFormattedValue[i])) {
        digitCount++;
        if (digitCount === digitsBeforeCursor) {
          newCursorPosition = i + 1;
          break;
        }
      }
    }
    if (digitCount < digitsBeforeCursor)
      newCursorPosition = newFormattedValue.length;
    target.setSelectionRange(newCursorPosition, newCursorPosition);
  });
};

provide("closeValorationDetailsModal", handleCloseModal);

defineExpose({
  handleOpenModal,
  handleCloseModal,
  isOpen: readonly(isModalOpen),
  isLoading: readonly(isLoading),
});
</script>

<style lang="scss" scoped>
.visually-hidden {
  @include visually-hidden;
}

.valoration-details {
  &__title {
    font-family: $font-family-main;
    font-weight: 600;
    font-size: 1.25rem;
    line-height: 1.75rem;
    color: #353e5c;
    margin: 0;
  }

  &__body {
    padding: 1.5rem;
  }

  &__attach-proforma {
    @include outline-button;
    padding: 0.625rem 1rem;
    cursor: pointer;

    svg {
      width: 1.25rem;
      height: 1.25rem;
    }
  }

  &__error-message {
    margin-top: 0.25rem;
    font-family: $font-family-main;
    font-size: 0.75rem;
    line-height: 1rem;
    color: #dc2626;
    font-weight: 400;
  }

  &__proforma-uploaded-wrapper {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__proforma-uploaded {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  &__proforma-name {
    @include label-base;
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: $color-foreground;
    display: flex;
    gap: $spacing-sm;
    align-items: center;
    max-width: 15.625rem;
  }

  &__proforma-name-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  &__no-proforma {
    @include label-base;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: $color-text-muted;
  }

  &__remove-proforma {
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

  &__file-success-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    justify-self: flex-end;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background-color: #d1fadf;
    color: #039855;
    flex-shrink: 0;
  }

  &__input {
    @include input-base;
    width: 100%;

    &:disabled {
      background-color: #f9fafb;
      cursor: not-allowed;
      opacity: 0.7;
    }
  }

  &__textarea {
    @include input-base;
    width: 100%;
    min-height: 7.5rem;

    &:disabled {
      background-color: #f9fafb;
      cursor: not-allowed;
      opacity: 0.7;
    }
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  &__saved-changes {
    &--wrapper {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    &--text {
      font-family: $font-family-main;
      font-weight: 600;
      font-size: 1rem;
      line-height: 1.5rem;
      letter-spacing: 0;
      color: #12b76a;
    }

    &--icon {
      width: 1.25rem;
      height: 1.25rem;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #d1fadf;
      color: #12b76a;
      border-radius: 50%;
      padding: 0.1875rem;
    }
  }

  &__view-buttons {
    display: flex;
    gap: 0.75rem;
  }

  &__buttons-wrapper {
    display: flex;
    gap: 0.75rem;
    margin-left: auto;
  }

  &__button {
    &--danger {
      @include outline-danger-button;
      border: none;
    }

    &--outline {
      @include outline-button;
    }

    &--primary {
      @include primary-button;
    }

    &--full {
      width: 100%;
    }
  }
}
</style>
