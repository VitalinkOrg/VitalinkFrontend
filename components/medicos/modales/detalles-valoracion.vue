<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    size="large"
    :close-on-backdrop="false"
    @close="handleClose"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
    aria-labelledby="valoration-modal-title"
  >
    <template #title>
      <h2 id="valoration-modal-title" class="valoration-modal__title">
        Detalles de la Cita de valoración
      </h2>
    </template>

    <div class="valoration-modal__body">
      <MedicosTablaDetallesCita
        v-if="detailRows"
        :rows="detailRows"
        aria-label="Detalles de la cita de valoración"
      >
        <template #data-proforma>
          <div v-if="isEditing" class="valoration-modal__proforma">
            <template v-if="!form.proformaFileName">
              <button
                type="button"
                class="valoration-modal__proforma-download"
                :disabled="isDownloadingBase"
                :aria-busy="isDownloadingBase"
                @click="downloadBaseProforma"
              >
                <AtomsIconsDownloadIcon size="20" aria-hidden="true" />
                {{
                  isDownloadingBase
                    ? "Descargando..."
                    : "Descargar proforma base"
                }}
              </button>

              <label
                for="proforma-upload"
                class="valoration-modal__proforma-attach"
              >
                <AtomsIconsCloudUploadIcon aria-hidden="true" />
                Adjuntar Proforma
              </label>
              <input
                id="proforma-upload"
                type="file"
                class="visually-hidden"
                accept=".pdf,.doc,.docx"
                @change="handleFileSelect"
              />

              <p
                v-if="proformaError"
                class="valoration-modal__field-error"
                role="alert"
              >
                {{ proformaError }}
              </p>
            </template>

            <template v-else>
              <div class="valoration-modal__proforma-file">
                <div class="valoration-modal__proforma-file-info">
                  <AtomsIconsFileTextIcon size="20" aria-hidden="true" />
                  <span
                    class="valoration-modal__proforma-file-name"
                    :title="form.proformaFileName"
                  >
                    {{ form.proformaFileName }}
                  </span>
                  <span
                    class="valoration-modal__proforma-file-badge"
                    aria-label="Archivo cargado exitosamente"
                  >
                    <AtomsIconsCircleCheckBigIcon
                      size="12"
                      aria-hidden="true"
                    />
                  </span>
                </div>
                <button
                  type="button"
                  class="valoration-modal__proforma-remove"
                  :aria-label="`Eliminar archivo ${form.proformaFileName}`"
                  @click="removeProforma"
                >
                  <AtomsIconsTrashIcon size="20" aria-hidden="true" />
                </button>
              </div>
            </template>
          </div>

          <span v-else class="valoration-modal__proforma-readonly">
            {{ form.proformaFileName || "Sin proforma adjunta" }}
          </span>
        </template>

        <template #data-valor-procedimiento>
          <label for="procedure-price" class="visually-hidden">
            Valor del procedimiento
          </label>
          <input
            id="procedure-price"
            type="text"
            :value="formattedPriceDisplay"
            :disabled="!isEditing"
            class="valoration-modal__input"
            placeholder="₡0"
            inputmode="numeric"
            @input="handlePriceInput"
          />
        </template>

        <template #data-recomendaciones>
          <label for="recommendations-field" class="visually-hidden">
            Recomendaciones Post-Cita
          </label>
          <textarea
            id="recommendations-field"
            v-model="form.recommendation"
            rows="3"
            :disabled="!isEditing"
            class="valoration-modal__textarea"
            placeholder="Escribe las recomendaciones médicas..."
          />
        </template>

        <template #data-diagnostico>
          <label for="diagnostic-field" class="visually-hidden">
            Diagnóstico
          </label>
          <textarea
            id="diagnostic-field"
            v-model="form.diagnostic"
            rows="3"
            :disabled="!isEditing"
            class="valoration-modal__textarea"
            placeholder="Escribe el diagnóstico médico..."
          />
        </template>

        <template #data-estado-cita>
          <span v-if="appointment" :class="statusBadgeClass">
            {{ appointment.appointment_status?.value1 }}
          </span>
        </template>
      </MedicosTablaDetallesCita>
    </div>

    <template #footer>
      <div class="valoration-modal__footer">
        <template v-if="isSaved && !isEditing">
          <div class="valoration-modal__saved-indicator">
            <span class="valoration-modal__saved-text">Cambios Guardados</span>
            <span class="valoration-modal__saved-icon">
              <AtomsIconsCheckIcon size="20" />
            </span>
          </div>
          <div class="valoration-modal__saved-actions">
            <button
              class="valoration-modal__action valoration-modal__action--outline"
              @click="enableEditing"
            >
              <AtomsIconsSquarePenIcon size="20" /> Editar
            </button>
            <button
              class="valoration-modal__action valoration-modal__action--primary"
              @click="handleClose"
            >
              Ver en citas
            </button>
          </div>
        </template>

        <div v-else class="valoration-modal__edit-actions">
          <button
            class="valoration-modal__action valoration-modal__action--outline"
            :disabled="!hasUnsavedChanges || isSaving"
            @click="discardChanges"
          >
            Cancelar
          </button>

          <button
            v-if="isValorationStatus"
            class="valoration-modal__action valoration-modal__action--primary"
            :disabled="!isValorationFormComplete"
            @click="openValorationConfirmation"
          >
            Guardar
          </button>

          <button
            v-else
            class="valoration-modal__action valoration-modal__action--primary"
            :disabled="!canSave || isSaving"
            :aria-busy="isSaving"
            @click="saveChanges"
          >
            {{ isSaving ? "Guardando..." : "Guardar" }}
          </button>
        </div>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useAppointment, useDocuments } from "@/composables/api";
import { useFormat } from "@/composables/useFormat";
import { useLogger } from "@/composables/useLogger";
import { useMedicalModalManager } from "@/composables/useMedicalModalManager";
import type { TablaBaseRow } from "../tabla-detalles-cita.vue";

const { isOpen, closeModal, getSharedData, openModal } =
  useMedicalModalManager();
const { uploadProforma } = useAppointment();
const { addDocument } = useDocuments();
const { formatDate, formatTime, formatCurrency } = useFormat();
const logger = useLogger("DetallesValoracion");
const toast = useToast();
const { getUserInfo } = useUserInfo();

const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");

const isModalOpen = computed(() => isOpen.detallesValoracion);

const modalData = computed(() =>
  getSharedData<{ appointment: IAppointment }>("detallesValoracion"),
);

const appointment = computed(() => modalData.value?.appointment ?? null);

const statusCode = computed(
  () => appointment.value?.appointment_status?.code ?? "",
);

const isEditing = ref(true);
const isSaved = ref(false);
const isSaving = ref(false);
const isDownloadingBase = ref(false);

const form = reactive({
  recommendation: "",
  diagnostic: "",
  priceProcedure: "",
  proformaFileName: null as string | null,
  proformaCode: "",
});

const snapshot = reactive({
  recommendation: "",
  diagnostic: "",
  priceProcedure: "",
  proformaFileName: null as string | null,
  proformaCode: "",
});

const proformaFile = ref<File | null>(null);
const proformaError = ref("");

const VALORATION_STATUSES = [
  "CONFIRM_VALIDATION_APPOINTMENT",
  "VALUATION_PENDING_VALORATION_APPOINTMENT",
];

const isValorationStatus = computed(() =>
  VALORATION_STATUSES.includes(statusCode.value),
);

const hasUnsavedChanges = computed(
  () =>
    form.recommendation !== snapshot.recommendation ||
    form.diagnostic !== snapshot.diagnostic ||
    form.priceProcedure !== snapshot.priceProcedure ||
    form.proformaFileName !== snapshot.proformaFileName,
);

const canSave = computed(
  () => hasUnsavedChanges.value && !!form.proformaFileName,
);

const isValorationFormComplete = computed(
  () =>
    !!form.proformaFileName &&
    form.priceProcedure !== "" &&
    form.recommendation !== "" &&
    form.diagnostic !== "",
);

const formattedPriceDisplay = computed(() => {
  if (!form.priceProcedure || form.priceProcedure === "0") return "";
  return formatCurrency(form.priceProcedure, { decimalPlaces: 0 });
});

const STATUS_BADGE_MAP: Record<string, string> = {
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

const statusBadgeClass = computed(
  () => STATUS_BADGE_MAP[statusCode.value] ?? "",
);

const detailRows = computed((): TablaBaseRow[] | undefined => {
  const apt = appointment.value;
  if (!apt) return undefined;

  return [
    {
      key: "tipo-servicio",
      header: "Tipo de servicio:",
      value: apt.appointment_type?.name ?? "—",
    },
    {
      key: "fecha",
      header: "Fecha de la cita:",
      value: apt.appointment_date ? formatDate(apt.appointment_date) : "—",
    },
    {
      key: "hora",
      header: "Hora de la cita:",
      value: apt.appointment_hour
        ? formatTime(apt.appointment_hour, "hs")
        : "—",
    },
    {
      key: "paciente",
      header: "Paciente:",
      value: apt.customer?.name ?? "—",
      isEndRow: true,
    },
    {
      key: "procedimiento",
      header: "Procedimiento:",
      value: apt.package?.procedure?.name ?? "—",
    },
    {
      key: "motivo",
      header: "Motivo:",
      value: apt.user_description ?? "—",
    },
    {
      key: "costo",
      header: "Costo del servicio:",
      value: "Ver en proforma",
    },
    {
      key: "fecha-solicitud",
      header: "Fecha de la solicitud:",
      value: formatDate(apt.application_date ?? "", "short"),
    },
    {
      key: "estado-cita",
      header: "Estado de la cita:",
      value: apt.appointment_status?.value1 ?? "—",
      isEndRow: true,
    },
    {
      key: "proforma",
      header: "Proforma:",
      value: form.proformaFileName ?? apt.proforma_file_code ?? "Sin proforma",
    },
    {
      key: "valor-procedimiento",
      header: "Valor del procedimiento:",
      value: formatCurrency(form.priceProcedure || "0", { decimalPlaces: 0 }),
    },
    {
      key: "recomendaciones",
      header: "Recomendaciones Post-Cita:",
      value: form.recommendation || "Sin recomendaciones",
    },
    {
      key: "diagnostico",
      header: "Diagnóstico:",
      value: form.diagnostic || "Sin diagnóstico",
    },
  ];
});

const initializeForm = () => {
  const apt = appointment.value;
  if (!apt) return;

  form.recommendation = apt.recommendation_post_appointment ?? "";
  form.diagnostic = apt.diagnostic ?? "";
  form.priceProcedure = apt.price_procedure ?? "";
  form.proformaFileName = apt.proforma_file_code ?? null;
  form.proformaCode = apt.proforma_file_code ?? "";

  snapshot.recommendation = form.recommendation;
  snapshot.diagnostic = form.diagnostic;
  snapshot.priceProcedure = form.priceProcedure;
  snapshot.proformaFileName = form.proformaFileName;

  proformaFile.value = null;
  proformaError.value = "";
};

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  input.value = "";

  if (!file) return;

  const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    proformaError.value = `Formato no permitido. Solo: ${ALLOWED_EXTENSIONS.join(", ")}`;
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    proformaError.value = "El archivo es demasiado grande. Máximo 10 MB.";
    return;
  }

  form.proformaFileName = file.name;
  proformaFile.value = file;
  proformaError.value = "";
};

const removeProforma = () => {
  form.proformaFileName = null;
  proformaFile.value = null;
  proformaError.value = "";
};

const downloadBaseProforma = async () => {
  isDownloadingBase.value = true;

  try {
    const link = document.createElement("a");
    link.href = "/docs/Proforma_Procedimiento_Médico_Vitalink.pdf";
    link.download = "Proforma Procedimiento Médico Vitalink.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    logger.error("Failed to download base proforma", {
      error: err instanceof Error ? err.message : String(err),
    });
    proformaError.value =
      "Error al descargar la proforma base. Intenta nuevamente.";
  } finally {
    isDownloadingBase.value = false;
  }
};

const handlePriceInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const cursorPosition = target.selectionStart ?? 0;
  const oldValue = target.value;
  const rawDigits = oldValue.replace(/\D/g, "");

  form.priceProcedure = rawDigits || "0";

  nextTick(() => {
    const formatted = formatCurrency(rawDigits || "0", { decimalPlaces: 0 });

    const digitsBeforeCursor = oldValue
      .substring(0, cursorPosition)
      .replace(/\D/g, "").length;

    let digitCount = 0;
    let newCursorPosition = formatted.length;

    for (let i = 0; i < formatted.length; i++) {
      if (/\d/.test(formatted[i])) {
        digitCount++;
        if (digitCount === digitsBeforeCursor) {
          newCursorPosition = i + 1;
          break;
        }
      }
    }

    target.setSelectionRange(newCursorPosition, newCursorPosition);
  });
};

function getUserId(): string {
  const userInfo = getUserInfo();
  return userInfo.id;
}

const uploadProformaDocument = async (): Promise<string | null> => {
  if (!proformaFile.value) return null;

  const payload = {
    file: proformaFile.value,
    fields: {
      title: proformaFile.value.name,
      type: "DOC",
      description: "Proforma de procedimiento médico",
      id_for_table: "6",
      table: "",
      action_type: "PERSONAL_DOCUMENT",
      user_id: getUserId(),
      is_public: 0,
    },
  };

  logger.debug("[PROFORMA PAYLOAD]", payload);

  try {
    const { data, error } = await addDocument({
      file: proformaFile.value,
      fields: {
        title: proformaFile.value.name,
        type: "DOC",
        description: "Proforma de procedimiento médico",
        id_for_table: "6",
        table: "",
        action_type: "PERSONAL_DOCUMENT",
        user_id: getUserId(),
        is_public: 0,
      },
    });

    if (error) {
      logger.error("Failed to upload proforma document", {
        error: error.info,
      });
      return null;
    }

    if (data) {
      logger.debug("[PROFORMA PAYLOAD]", { data });
      return data?.code;
    }

    return null;
  } catch (err) {
    logger.error("Unexpected error uploading proforma", {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
};

const saveChanges = async () => {
  const apt = appointment.value;

  if (!apt) {
    proformaError.value = "No se encontró la cita.";
    return;
  }

  if (!form.proformaFileName) {
    proformaError.value =
      "Debe adjuntar una proforma para guardar los cambios.";
    return;
  }

  if (!hasUnsavedChanges.value) return;

  isSaving.value = true;
  proformaError.value = "";

  try {
    console.log("[proformaCode]", apt.proforma_file_code);
    let proformaCode = apt.proforma_file_code ?? "";

    if (proformaFile.value) {
      const uploadedCode = await uploadProformaDocument();

      if (!uploadedCode) {
        proformaError.value =
          "Error al cargar el documento. Intenta nuevamente.";
        return;
      }

      console.log("[uploadedCode]", uploadedCode);

      proformaCode = uploadedCode;
    }

    const { error } = await uploadProforma(apt.id, {
      price_procedure: form.priceProcedure,
      recommendation_post_appointment: form.recommendation,
      diagnostic: form.diagnostic,
      appointment_result_code: "FIT_FOR_PROCEDURE",
      proforma_file_code: proformaCode,
    });

    if (error) {
      proformaError.value =
        error.info || "Error al guardar los cambios. Intenta nuevamente.";
      logger.error("Failed to save valoration", {
        appointmentId: apt.id,
        error: error.info,
      });
      return;
    }

    snapshot.recommendation = form.recommendation;
    snapshot.diagnostic = form.diagnostic;
    snapshot.priceProcedure = form.priceProcedure;
    snapshot.proformaFileName = form.proformaFileName;

    isSaved.value = true;
    isEditing.value = false;
    proformaFile.value = null;

    await refreshAppointments?.();
  } catch (err) {
    proformaError.value = "Error inesperado al guardar. Intenta nuevamente.";
    logger.error("Unexpected error saving valoration", {
      error: err instanceof Error ? err.message : String(err),
    });
  } finally {
    isSaving.value = false;
  }
};

const openValorationConfirmation = async () => {
  if (!appointment.value) return;

  let proformaCode = form.proformaCode;

  if (proformaFile.value && !proformaCode) {
    const uploadedCode = await uploadProformaDocument();

    if (!uploadedCode) {
      toast.error("Error al cargar la proforma. Intente nuevamente.");
      return;
    }

    proformaCode = uploadedCode;
    form.proformaCode = uploadedCode;
  }

  openModal("confirmValoration", {
    appointment: appointment.value,
    recommendation: form.recommendation,
    diagnostic: form.diagnostic,
    proformaFileName: form.proformaFileName,
    priceProcedure: Number(form.priceProcedure),
    proformaCode,
  });
};

const discardChanges = () => {
  form.recommendation = snapshot.recommendation;
  form.diagnostic = snapshot.diagnostic;
  form.priceProcedure = snapshot.priceProcedure;
  form.proformaFileName = snapshot.proformaFileName;
  proformaFile.value = null;
  proformaError.value = "";
};

const enableEditing = () => {
  isEditing.value = true;
  isSaved.value = false;
  proformaError.value = "";
};

const resetState = () => {
  isEditing.value = true;
  isSaved.value = false;
  isSaving.value = false;
  isDownloadingBase.value = false;
  proformaFile.value = null;
  proformaError.value = "";
};

const handleClose = () => {
  closeModal("detallesValoracion");
  resetState();
};

watch(isModalOpen, (open) => {
  if (open) initializeForm();
});
</script>

<style lang="scss" scoped>
.visually-hidden {
  @include visually-hidden;
}

.valoration-modal {
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

  &__field-error {
    font-family: $font-family-alt;
    font-size: 0.75rem;
    line-height: 1rem;
    font-weight: 500;
    color: $color-danger;
    margin: 0.25rem 0 0 0;
  }

  &__proforma {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__proforma-download {
    @include outline-button;
    padding: 0.625rem 1rem;
    width: 100%;

    svg {
      width: 1.25rem;
      height: 1.25rem;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__proforma-attach {
    @include outline-button;
    padding: 0.625rem 1rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;

    svg {
      width: 1.25rem;
      height: 1.25rem;
    }
  }

  &__proforma-file {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__proforma-file-info {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    min-width: 0;
  }

  &__proforma-file-name {
    @include label-base;
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: $color-foreground;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 15rem;
  }

  &__proforma-file-badge {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%;
    background-color: #d1fadf;
    color: #039855;
    flex-shrink: 0;
  }

  &__proforma-remove {
    background: transparent;
    border: none;
    color: $color-text-muted;
    padding: 0.25rem;
    border-radius: 0.375rem;
    cursor: pointer;
    transition:
      color 0.15s ease,
      background-color 0.15s ease;

    &:hover {
      color: $color-danger;
      background-color: #fef2f2;
    }
  }

  &__proforma-readonly {
    @include label-base;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: $color-text-muted;
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
    resize: vertical;

    &:disabled {
      background-color: #f9fafb;
      cursor: not-allowed;
      opacity: 0.7;
    }
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  &__saved-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__saved-text {
    font-family: $font-family-main;
    font-weight: 600;
    font-size: 1rem;
    line-height: 1.5rem;
    color: #12b76a;
  }

  &__saved-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 1.25rem;
    height: 1.25rem;
    background: #d1fadf;
    color: #12b76a;
    border-radius: 50%;
    padding: 0.1875rem;
  }

  &__saved-actions {
    display: flex;
    gap: 0.75rem;
  }

  &__edit-actions {
    display: flex;
    gap: 0.75rem;
    margin-left: auto;
  }

  &__action {
    &--outline {
      @include outline-button;
    }

    &--primary {
      @include primary-button;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
}
</style>
