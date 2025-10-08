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
          <div v-if="!currentProformaFileName && isEditing">
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
            <div v-if="proformaError" class="valoration-details__error-message">
              {{ proformaError }}
            </div>
          </div>
          <div
            v-else-if="currentProformaFileName"
            class="valoration-details__proforma-uploaded-wrapper"
          >
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
              <span
                class="valoration-details__file-success-icon"
                aria-label="Archivo cargado exitosamente"
              >
                <AtomsIconsCircleCheckBigIcon size="12" aria-hidden="true" />
              </span>
            </div>
            <button
              v-if="isEditing"
              class="valoration-details__remove-proforma"
              type="button"
              :aria-label="`Eliminar archivo ${currentProformaFileName}`"
              @click="handleRemoveProforma"
            >
              <AtomsIconsTrashIcon size="20" aria-hidden="true" />
            </button>
          </div>
          <div v-else class="valoration-details__no-proforma">
            Sin proforma adjunta
          </div>
        </template>

        <template #data-valor-procedimiento>
          <input
            type="number"
            name="price-procedure"
            id="price-procedure"
            v-model.number="currentPriceProcedure"
            :disabled="!isEditing"
            class="valoration-details__input"
            placeholder="0"
            min="0"
            step="0.01"
          />
        </template>

        <template #data-recomendaciones>
          <textarea
            name="recommendation-post-appointment"
            id="recommendation-post-appointment"
            rows="3"
            v-model="currentRecommendation"
            :disabled="!isEditing"
            class="valoration-details__textarea"
            placeholder="Escribe las recomendaciones médicas..."
          ></textarea>
        </template>

        <template #data-diagnostico>
          <textarea
            name="diagnostic"
            id="diagnostict"
            rows="3"
            v-model="currentDiagnostic"
            :disabled="!isEditing"
            class="valoration-details__textarea"
            placeholder="Escribe el diagnóstico médico..."
          ></textarea>
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
        <div
          v-if="changesSaved && !isEditing"
          class="valoration-details__saved-changes--wrapper"
        >
          <span class="valoration-details__saved-changes--text"
            >Cambios Guardados</span
          >
          <span class="valoration-details__saved-changes--icon">
            <AtomsIconsCheckIcon size="20" />
          </span>
        </div>

        <div
          v-if="changesSaved && !isEditing"
          class="valoration-details__view-buttons"
        >
          <button
            class="valoration-details__button--outline"
            @click="handleEdit"
          >
            <AtomsIconsSquarePenIcon size="20" />
            Editar
          </button>
          <button
            class="valoration-details__button--primary"
            @click="handleViewInAppointments"
          >
            Ver en citas
          </button>
        </div>

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
import type { Appointment, AppointmentStatusCode } from "~/types";
import type { TablaBaseRow } from "../tabla-detalles-cita.vue";

const config = useRuntimeConfig();
const token = useCookie("token");

const isModalOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);
const isEditing = ref<boolean>(true);
const changesSaved = ref<boolean>(false);
const confirmValorationRef = ref();

const currentRecommendation = ref<string>("");
const currentDiagnostic = ref<string>("");
const currentPriceProcedure = ref<string>("");
const currentProformaFileName = ref<string | null>(null);

const originalRecommendation = ref<string>("");
const originalDiagnostic = ref<string>("");
const originalPriceProcedure = ref<string>("");
const originalProformaFileName = ref<string | null>(null);

const proformaError = ref<string>("");

interface Props {
  appointment: Appointment;
}

const props = defineProps<Props>();

const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");

const { formatDate, formatTime, formatCurrency } = useFormat();

const hasChanges = computed(() => {
  return (
    currentRecommendation.value !== originalRecommendation.value ||
    currentDiagnostic.value !== originalDiagnostic.value ||
    currentPriceProcedure.value !== originalPriceProcedure.value ||
    currentProformaFileName.value !== originalProformaFileName.value
  );
});

const canSave = computed(() => {
  return hasChanges.value && currentProformaFileName.value !== null;
});

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
  {
    key: "costo",
    header: "Costo del servicio:",
    value: "Ver en proforma",
  },
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
    value: formatCurrency(currentPriceProcedure.value, {
      decimalPlaces: 0,
    }),
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
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    currentProformaFileName.value = file.name;
    proformaError.value = "";
  }
};

const handleRemoveProforma = () => {
  currentProformaFileName.value = null;
  proformaError.value = "";
};

const handleCancel = () => {
  currentRecommendation.value = originalRecommendation.value;
  currentDiagnostic.value = originalDiagnostic.value;
  currentPriceProcedure.value = originalPriceProcedure.value;
  currentProformaFileName.value = originalProformaFileName.value;
  proformaError.value = "";
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
    const payload = {
      price_procedure: currentPriceProcedure.value,
      recommendation_post_appointment: currentRecommendation.value,
      diagnostic: currentDiagnostic.value,
      appointment_result_code: "FIT_FOR_PROCEDURE",
      proforma_file_code: currentProformaFileName.value,
    };

    if (!token.value) {
      throw new Error("Token de autenticación no disponible");
    }

    const data = await $fetch(
      config.public.API_BASE_URL + "/appointment/upload_proforma",
      {
        method: "PUT",
        headers: { Authorization: token.value },
        params: {
          id: props.appointment.id,
        },
        body: payload,
      }
    );

    originalRecommendation.value = currentRecommendation.value;
    originalDiagnostic.value = currentDiagnostic.value;
    originalPriceProcedure.value = currentPriceProcedure.value;
    originalProformaFileName.value = currentProformaFileName.value;

    changesSaved.value = true;
    isEditing.value = false;

    await refreshAppointments?.();
  } catch (error: any) {
    console.error("Error al guardar los cambios:", error);
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

const handleViewInAppointments = () => {
  handleCloseModal();
};

const getStatusClass = (status: AppointmentStatusCode) => {
  const statusClassMap = {
    CANCEL_APPOINTMENT: "status-badge--cancelled",
    PENDING_VALORATION_APPOINTMENT: "status-badge--warning",
    PENDING_PROCEDURE: "status-badge--warning",
    CONFIRM_PROCEDURE: "status-badge--primary",
    CONCRETED_APPOINTMENT: "status-badge--primary",
    VALUED_VALORATION_APPOINTMENT: "status-badge--success",
    CONFIRM_VALIDATION_APPOINTMENT: "status-badge--success",
    VALUATION_PENDING_VALORATION_APPOINTMENT: "status-badge--primary",
    WAITING_PROCEDURE: "status-badge--warning",
  };
  return statusClassMap[status] || "";
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
    font-size: 20px;
    line-height: 28px;
    color: #353e5c;
    margin: 0;
  }

  &__body {
    padding: 24px;
  }

  &__attach-proforma {
    @include outline-button;
    padding: 10px 16px;
    cursor: pointer;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  &__error-message {
    margin-top: 4px;
    font-family: $font-family-main;
    font-size: 12px;
    line-height: 16px;
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
    gap: 4px;
  }

  &__proforma-name {
    @include label-base;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    color: $color-foreground;
    display: flex;
    gap: $spacing-sm;
    align-items: center;
    max-width: 250px;
  }

  &__proforma-name-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
  }

  &__no-proforma {
    @include label-base;
    font-size: 14px;
    line-height: 20px;
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
    width: 24px;
    height: 24px;
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
    min-height: 120px;

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
      gap: 8px;
    }

    &--text {
      font-family: $font-family-main;
      font-weight: 600;
      font-size: 16px;
      line-height: 24px;
      letter-spacing: 0;
      color: #12b76a;
    }

    &--icon {
      width: 20px;
      height: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #d1fadf;
      color: #12b76a;
      border-radius: 50%;
      padding: 3px;
    }
  }

  &__view-buttons {
    display: flex;
    gap: 12px;
  }

  &__buttons-wrapper {
    display: flex;
    gap: 12px;
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
