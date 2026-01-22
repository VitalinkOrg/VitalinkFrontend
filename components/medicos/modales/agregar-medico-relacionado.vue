<template>
  <div>
    <slot name="trigger" :open="openModal" />

    <AtomsModalBase
      :is-open="isOpen"
      size="extra-large"
      :show-close-button="true"
      :close-on-backdrop="false"
      @close="handleModalClose"
    >
      <template #title>
        <h2 v-if="currentStep !== 3" class="modal-title">
          {{
            isEditMode
              ? "Editar médico relacionado"
              : "Agregar médico relacionado"
          }}
        </h2>
      </template>

      <div class="modal-body">
        <div v-if="isLoadingModalData" class="modal-loading">
          <div class="modal-loading__spinner"></div>
          <p class="modal-loading__text">Cargando datos del médico...</p>
        </div>

        <template v-else>
          <WebsiteStepper
            v-if="currentStep !== 0 && currentStep !== 3"
            :steps="steps"
            :currentStep="currentStep"
          />

          <div v-if="currentStep === 1" class="step-content">
            <form @submit.prevent="handleStep1Submit" class="doctor-form">
              <div class="doctor-form__group">
                <label for="documentType" class="doctor-form__label">
                  Tipo de documento de identidad
                </label>
                <UiDropdownBase
                  :model-value="formData.documentType"
                  :items="
                    documentTypeOptions.map((s) => ({
                      value: s.code,
                      label: s.name,
                    }))
                  "
                  :loading="isLoadingDocumentTypes"
                  :disabled="isLoadingSubmit || isEditMode"
                  :class="{
                    'input-error':
                      touched.documentType && !formData.documentType,
                  }"
                  placeholder="Seleccione tipo de documento"
                  @update:model-value="
                    handleDocumentTypeChange($event as string)
                  "
                  @blur="touched.documentType = true"
                />
                <small
                  v-if="touched.documentType && !formData.documentType"
                  class="doctor-form__error-message"
                >
                  Debes seleccionar un tipo de documento
                </small>
              </div>

              <div class="doctor-form__group">
                <label for="documentNumber" class="doctor-form__label">
                  Número de documento
                </label>
                <input
                  :value="formData.documentNumber"
                  @input="handleDocumentNumberInput"
                  @blur="touched.documentNumber = true"
                  type="text"
                  class="doctor-form__input"
                  :class="{
                    'input-error':
                      touched.documentNumber &&
                      (!formData.documentNumber || !isDocumentValid),
                  }"
                  :placeholder="getCedulaPlaceholder(formData.documentType)"
                  :disabled="isLoadingSubmit || isEditMode"
                  id="documentNumber"
                  required
                />
                <small
                  v-if="touched.documentNumber && !formData.documentNumber"
                  class="doctor-form__error-message"
                >
                  El número de documento es requerido
                </small>
                <small
                  v-else-if="formData.documentNumber && !isDocumentValid"
                  class="doctor-form__error-message"
                >
                  {{ getCedulaErrorMessage(formData.documentType) }}
                </small>
              </div>

              <div class="doctor-form__group">
                <label for="fullName" class="doctor-form__label">
                  Nombre y Apellidos
                </label>
                <input
                  v-model="formData.fullName"
                  @blur="touched.fullName = true"
                  type="text"
                  class="doctor-form__input"
                  :class="{
                    'input-error':
                      touched.fullName && !formData.fullName.trim(),
                  }"
                  placeholder="Ingrese nombre completo"
                  :disabled="isLoadingSubmit"
                  id="fullName"
                  required
                />
                <small
                  v-if="touched.fullName && !formData.fullName.trim()"
                  class="doctor-form__error-message"
                >
                  El nombre completo es requerido
                </small>
              </div>

              <MedicosRegistroCargarArchivos
                v-if="!isEditMode"
                label="Documento de identidad"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                id="identityFile"
                inputId="identityFileInput"
                :uploadedFile="formData.identityDocumentFile"
                :disabled="isLoadingSubmit"
                :has-error="
                  touched.identityDocumentFile && !formData.identityDocumentFile
                "
                @update:file="handleIdentityFileChange"
                @blur="touched.identityDocumentFile = true"
              />
              <small
                v-if="
                  !isEditMode &&
                  touched.identityDocumentFile &&
                  !formData.identityDocumentFile
                "
                class="doctor-form__error-message"
              >
                Debes cargar el documento de identidad (PDF, Word, JPG o PNG)
              </small>
              <small
                v-if="identityFileError"
                class="doctor-form__error-message"
              >
                {{ identityFileError }}
              </small>

              <div class="doctor-form__group">
                <label for="medicalCode" class="doctor-form__label">
                  Código de médico
                </label>
                <input
                  v-model="formData.medicalCode"
                  @blur="touched.medicalCode = true"
                  type="text"
                  class="doctor-form__input"
                  :class="{
                    'input-error':
                      touched.medicalCode && !formData.medicalCode.trim(),
                  }"
                  placeholder="Ingrese el código de médico"
                  :disabled="isLoadingSubmit"
                  id="medicalCode"
                  required
                />
                <small
                  v-if="touched.medicalCode && !formData.medicalCode.trim()"
                  class="doctor-form__error-message"
                >
                  El código de médico es requerido
                </small>
              </div>

              <MedicosRegistroCargarArchivos
                v-if="!isEditMode"
                label="Carnet vigente"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                id="validLicenseFile"
                inputId="validLicenseFileInput"
                :uploadedFile="formData.validLicenseFile"
                :disabled="isLoadingSubmit"
                :has-error="
                  touched.validLicenseFile && !formData.validLicenseFile
                "
                @update:file="handleLicenseFileChange"
                @blur="touched.validLicenseFile = true"
              />
              <small
                v-if="
                  !isEditMode &&
                  touched.validLicenseFile &&
                  !formData.validLicenseFile
                "
                class="doctor-form__error-message"
              >
                Debes cargar el carnet vigente (PDF, Word, JPG o PNG)
              </small>
              <small v-if="licenseFileError" class="doctor-form__error-message">
                {{ licenseFileError }}
              </small>

              <div class="doctor-form__group">
                <label for="medicalType" class="doctor-form__label">
                  Tipo de médico
                </label>
                <UiDropdownBase
                  v-model="formData.medicalType"
                  :loading="isLoadingMedicalTypes"
                  :items="
                    medicalTypes.map((s) => ({ value: s.code, label: s.name }))
                  "
                  :class="{
                    'input-error': touched.medicalType && !formData.medicalType,
                  }"
                  placeholder="Seleccione tipo de médico"
                  :disabled="isLoadingSubmit"
                  @blur="touched.medicalType = true"
                />
                <small
                  v-if="touched.medicalType && !formData.medicalType"
                  class="doctor-form__error-message"
                >
                  Debes seleccionar un tipo de médico
                </small>
              </div>

              <div class="doctor-form__group">
                <label for="medicalSpecialty" class="doctor-form__label">
                  Especialidad (máximo 3)
                </label>
                <div class="doctor-form__input-group">
                  <UiDropdownBase
                    v-model="selectedSpecialty"
                    :loading="isLoadingSpecialties"
                    :items="
                      specialties.map((s) => ({ value: s.code, label: s.name }))
                    "
                    placeholder="Seleccione especialidad"
                    :disabled="isLoadingSubmit"
                    searchable
                  />
                  <button
                    type="button"
                    class="doctor-form__add-button"
                    :disabled="
                      !selectedSpecialty ||
                      formData.specialties.length >= 3 ||
                      formData.specialties.some(
                        (s) => s.code === selectedSpecialty
                      ) ||
                      isLoadingSubmit
                    "
                    @click="addSpecialty"
                  >
                    Agregar
                  </button>
                </div>
                <div
                  v-if="formData.specialties.length > 0"
                  class="doctor-form__specialties"
                >
                  <span
                    v-for="(specialty, specIndex) in formData.specialties"
                    :key="specIndex"
                    class="specialty-badge"
                  >
                    {{ specialty.name }}
                    <button
                      type="button"
                      class="specialty-badge__remove"
                      @click="removeSpecialty(specIndex)"
                      :disabled="isLoadingSubmit"
                    >
                      <AtomsIconsXIcon size="12" />
                    </button>
                  </span>
                </div>
                <small
                  v-if="
                    touched.specialties && formData.specialties.length === 0
                  "
                  class="doctor-form__error-message"
                >
                  Debes agregar al menos una especialidad
                </small>
                <small
                  v-if="formData.specialties.length >= 3"
                  class="doctor-form__limit-text"
                >
                  Has alcanzado el máximo de 3 especialidades
                </small>
              </div>
            </form>

            <div v-if="errorMessage" class="doctor-form__error">
              <AtomsIconsAlertCircleIcon size="20" />
              <span>{{ errorMessage }}</span>
            </div>
          </div>

          <div
            v-if="currentStep === 2"
            class="step-content step-content--with-preview"
          >
            <div class="packs-section">
              <MedicosModalesPreciosPacks
                v-model="packs"
                :available-specialties="formData.specialties"
                @update:activePackIndex="activePackIndex = $event"
              />

              <div v-if="errorMessage" class="doctor-form__error">
                <AtomsIconsAlertCircleIcon size="20" />
                <span>{{ errorMessage }}</span>
              </div>
            </div>

            <div class="preview-section">
              <MedicosModalesPackPreview
                v-if="packs[activePackIndex]"
                :key="`preview-${activePackIndex}`"
                :pack="packs[activePackIndex]"
                :is-king-package="activePackIndex === 0 && packs.length > 1"
                :productos="productosForPreview"
                :specialties="specialtiesForPreview"
                :services-map="servicesMap"
                class="preview-card"
              />
            </div>
          </div>

          <div v-if="currentStep === 3" class="confirmation">
            <div class="confirmation__icon">
              <AtomsIconsCheckIcon size="20" />
            </div>
            <h5 class="confirmation__title">
              {{
                isEditMode
                  ? "Médico actualizado exitosamente"
                  : "Médico creado exitosamente"
              }}
            </h5>
            <p class="confirmation__description">
              {{
                isEditMode
                  ? "Los cambios se han guardado correctamente. Ahora puedes verlos en el menú de médicos."
                  : "El médico se ha registrado correctamente con sus packs y servicios. Ahora puedes verlo y administrarlo en el menú de médicos."
              }}
            </p>
          </div>
        </template>
      </div>

      <template #footer>
        <div class="modal-footer">
          <template v-if="currentStep === 1">
            <button
              type="button"
              class="modal-footer__button--secondary"
              @click="handleCancelStep1"
              :disabled="isLoadingSubmit"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="modal-footer__button--primary"
              :disabled="!isStep1Complete || isLoadingSubmit"
              @click="handleStep1Submit"
            >
              Continuar
            </button>
          </template>

          <template v-if="currentStep === 2">
            <button
              type="button"
              class="modal-footer__button--secondary"
              @click="goToStep(1)"
              :disabled="isLoadingSubmit"
            >
              Volver
            </button>
            <button
              type="button"
              class="modal-footer__button--primary"
              :disabled="!isStep2Complete || isLoadingSubmit"
              @click="handleSubmit"
            >
              <span v-if="isLoadingSubmit" class="spinner"></span>
              {{
                isLoadingSubmit
                  ? isEditMode
                    ? "Actualizando..."
                    : "Guardando..."
                  : isEditMode
                    ? "Actualizar médico"
                    : "Guardar médico"
              }}
            </button>
          </template>

          <template v-if="currentStep === 3">
            <NuxtLink
              to="/medicos/mis-medicos"
              class="modal-footer__button--secondary modal-footer__button--full"
            >
              Ver en mis médicos
            </NuxtLink>
            <button
              v-if="!isEditMode"
              type="button"
              class="modal-footer__button--primary modal-footer__button--full"
              @click="addAnotherDoctor"
            >
              Agregar otro médico
            </button>
            <button
              v-else
              type="button"
              class="modal-footer__button--primary modal-footer__button--full"
              @click="handleModalClose"
            >
              Cerrar
            </button>
          </template>
        </div>
      </template>
    </AtomsModalBase>
  </div>
</template>

<script lang="ts" setup>
import {
  useAvailability,
  useDocuments,
  usePackage,
  useSupplier,
  useUdc,
} from "@/composables/api";
import { useFormat } from "@/composables/useFormat";
import type { IRelatedMedicalFormData, IUdc, Service, Supplier } from "@/types";
import type { CreateSupplier } from "~/composables/api/useSupplier";
import MedicosModalesPackPreview from "./pack-preview.vue";
import MedicosModalesPreciosPacks from "./precios-packs.vue";

interface TimeSlot {
  from: string;
  to: string;
}

interface DayAvailability {
  active: boolean;
  timeSlots: TimeSlot[];
}

interface Pack {
  especialidad: string;
  procedimiento: string;
  producto: string;
  servicios: string[];
  precio: number;
  precioValoracion?: number;
  disponibilidad: DayAvailability[];
}

interface Props {
  editMode?: boolean;
  doctorData?: Partial<IRelatedMedicalFormData>;
  existingPacks?: Pack[];
  supplierId?: number;
}

interface Emits {
  (e: "doctor-added"): void;
  (e: "doctor-updated"): void;
}

const DEFAULT_VALORACION_COST = 25000;
const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const props = withDefaults(defineProps<Props>(), {
  editMode: false,
  doctorData: undefined,
  existingPacks: () => [],
  supplierId: undefined,
});

const emit = defineEmits<Emits>();

const { fetchUdc } = useUdc();
const { uploadDocument } = useDocuments();
const {
  createSupplier,
  uploadSpecialtyBySupplier,
  fetchAllSuppliers,
  updateSupplier,
  fetchSpecialtyBySupplier,
  deleteSpecialtyBySupplier,
} = useSupplier();
const { createPackage } = usePackage();
const { createAvailability } = useAvailability();
const { getToken } = useAuthToken();
const { getUserInfo } = useUserInfo();
const {
  formatCedula,
  validateCedula,
  getCedulaPlaceholder,
  getCedulaErrorMessage,
} = useFormat();

const isOpen = ref(false);
const currentStep = ref(1);
const steps = ["Datos del médico", "Packs y precios"];

const isLoadingDocumentTypes = ref<boolean>(false);
const isLoadingMedicalTypes = ref<boolean>(false);
const isLoadingSpecialties = ref<boolean>(false);
const isLoadingSubmit = ref<boolean>(false);
const isLoadingProducts = ref<boolean>(false);
const isLoadingServices = ref<boolean>(false);
const isLoadingModalData = ref<boolean>(false);

const documentTypeOptions = ref<IUdc[]>([]);
const medicalTypes = ref<IUdc[]>([]);
const specialties = ref<IUdc[]>([]);
const selectedSpecialty = ref<string>("");
const productosForPreview = ref<Array<{ value: string; label: string }>>([]);
const servicesData = ref<IUdc[]>([]);

const errorMessage = ref<string>("");
const currentSupplier = ref<Supplier | null>(null);
const identityFileError = ref<string>("");
const licenseFileError = ref<string>("");

const isEditMode = computed(() => props.editMode);

const formData = ref<IRelatedMedicalFormData>({
  documentType: "",
  documentNumber: "",
  fullName: "",
  identityDocumentFile: null,
  medicalCode: "",
  validLicenseFile: null,
  medicalType: "",
  specialties: [],
});

const originalFormData = ref<IRelatedMedicalFormData | null>(null);

const touched = reactive({
  documentType: false,
  documentNumber: false,
  fullName: false,
  identityDocumentFile: false,
  medicalCode: false,
  validLicenseFile: false,
  medicalType: false,
  specialties: false,
});

const packs = ref<Pack[]>([]);
const originalPacks = ref<Pack[]>([]);

const specialtiesForPreview = computed(() => {
  return formData.value.specialties.map((s) => ({
    value: s.code,
    label: s.name,
  }));
});

const servicesMap = computed(() => {
  const map: Record<string, string> = {};
  servicesData.value.forEach((service) => {
    map[service.code] = service.name;
  });
  return map;
});

const isDocumentValid = computed(() => {
  if (!formData.value.documentNumber) return true;
  return validateCedula(
    formData.value.documentNumber,
    formData.value.documentType
  );
});

const isStep1Complete = computed(() => {
  const baseValidation =
    formData.value.documentType.trim() !== "" &&
    formData.value.documentNumber.trim() !== "" &&
    isDocumentValid.value &&
    formData.value.fullName.trim() !== "" &&
    formData.value.medicalCode.trim() !== "" &&
    formData.value.medicalType.trim() !== "" &&
    formData.value.specialties.length > 0;

  if (isEditMode.value) {
    return baseValidation;
  }

  return (
    baseValidation &&
    formData.value.identityDocumentFile !== null &&
    formData.value.validLicenseFile !== null
  );
});

const isStep2Complete = computed(() => {
  if (!isEditMode.value) {
    return (
      packs.value.length > 0 &&
      packs.value.every(
        (pack) =>
          pack.especialidad &&
          pack.procedimiento &&
          pack.producto &&
          pack.servicios.length > 0 &&
          pack.precio > 0
      )
    );
  }

  const newPacks = packs.value.filter(
    (pack, index) => index >= originalPacks.value.length
  );

  if (newPacks.length === 0) {
    return true;
  }

  return newPacks.every(
    (pack) =>
      pack.especialidad &&
      pack.procedimiento &&
      pack.producto &&
      pack.servicios.length > 0 &&
      pack.precio > 0
  );
});

const validateFileType = (file: File, errorRef: Ref<string>): boolean => {
  const extension = "." + file.name.split(".").pop()?.toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    errorRef.value = `Formato no permitido. Solo se aceptan archivos: ${ALLOWED_EXTENSIONS.join(", ")}`;
    return false;
  }

  if (file.size > MAX_FILE_SIZE) {
    errorRef.value = "El archivo es demasiado grande. El tamaño máximo es 10MB";
    return false;
  }

  errorRef.value = "";
  return true;
};

const handleIdentityFileChange = (file: File | null) => {
  touched.identityDocumentFile = true;

  if (file && !validateFileType(file, identityFileError)) {
    formData.value.identityDocumentFile = null;
    return;
  }

  formData.value.identityDocumentFile = file;
};

const handleLicenseFileChange = (file: File | null) => {
  touched.validLicenseFile = true;

  if (file && !validateFileType(file, licenseFileError)) {
    formData.value.validLicenseFile = null;
    return;
  }

  formData.value.validLicenseFile = file;
};

const handleDocumentTypeChange = (documentType: string) => {
  touched.documentType = true;
  formData.value.documentType = documentType ?? "";
  formData.value.documentNumber = "";
  touched.documentNumber = false;
};

const handleDocumentNumberInput = (event: Event) => {
  touched.documentNumber = true;
  const target = event.target as HTMLInputElement;
  const cursorPosition = target.selectionStart || 0;

  const formattedValue = formatCedula(
    target.value,
    formData.value.documentType
  );

  const numbersBeforeCursor = target.value
    .substring(0, cursorPosition)
    .replace(/\D/g, "").length;

  let numbersCount = 0;
  let newCursorPosition = 0;

  for (let i = 0; i < formattedValue.length; i++) {
    if (formattedValue[i].match(/\d/)) {
      numbersCount++;
      if (numbersCount === numbersBeforeCursor) {
        newCursorPosition = i + 1;
        break;
      }
    }
  }

  if (numbersCount < numbersBeforeCursor || newCursorPosition === 0) {
    newCursorPosition = formattedValue.length;
  }

  formData.value.documentNumber = formattedValue;

  nextTick(() => {
    target.setSelectionRange(newCursorPosition, newCursorPosition);
  });
};

const markAllTouched = () => {
  Object.keys(touched).forEach((key) => {
    touched[key as keyof typeof touched] = true;
  });
};

const handleStep1Submit = () => {
  markAllTouched();

  if (isStep1Complete.value && !isLoadingSubmit.value) {
    goToStep(2);
  }
};

const openModal = () => {
  isOpen.value = true;
  currentStep.value = 1;
  errorMessage.value = "";

  if (isEditMode.value && props.doctorData) {
    isLoadingModalData.value = true;

    nextTick(() => {
      loadDoctorData();

      if (
        Array.isArray(props.existingPacks) &&
        props.existingPacks.length > 0
      ) {
        packs.value = props.existingPacks.map((pack) => ({
          ...pack,
          precioValoracion: pack.precioValoracion || DEFAULT_VALORACION_COST,
        }));
        originalPacks.value = JSON.parse(JSON.stringify(props.existingPacks));
      }

      isLoadingModalData.value = false;
    });
  } else {
    isLoadingModalData.value = false;
    resetForm();
  }
};

const loadDoctorData = () => {
  if (!props.doctorData) {
    return;
  }

  const data = {
    documentType: props.doctorData.documentType || "",
    documentNumber: props.doctorData.documentNumber || "",
    fullName: props.doctorData.fullName || "",
    identityDocumentFile: null,
    medicalCode: props.doctorData.medicalCode || "",
    validLicenseFile: null,
    medicalType: props.doctorData.medicalType || "",
    specialties: props.doctorData.specialties || [],
  };

  formData.value = { ...data };
  originalFormData.value = JSON.parse(JSON.stringify(data));
};

const closeModal = () => {
  isOpen.value = false;
  currentStep.value = 1;
  errorMessage.value = "";
  isLoadingModalData.value = false;

  if (!isEditMode.value) {
    resetForm();
  }
};

const handleModalClose = () => {
  if (currentStep.value === 3) {
    resetForm();
    closeModal();
  } else {
    closeModal();
  }
};

const handleCancelStep1 = () => {
  closeModal();
};

const goToStep = (step: number) => {
  errorMessage.value = "";
  currentStep.value = step;
};

const addAnotherDoctor = () => {
  resetForm();
  currentStep.value = 1;
};

const addSpecialty = () => {
  if (!selectedSpecialty.value) return;

  const specialtyToAdd = specialties.value.find(
    (s) => s.code === selectedSpecialty.value
  );

  if (
    specialtyToAdd &&
    !formData.value.specialties.some((s) => s.code === specialtyToAdd.code) &&
    formData.value.specialties.length < 3
  ) {
    formData.value.specialties.push(specialtyToAdd);
    selectedSpecialty.value = "";
    touched.specialties = true;
  }
};

const removeSpecialty = (index: number) => {
  formData.value.specialties.splice(index, 1);
  touched.specialties = true;
};

const resetForm = () => {
  formData.value = {
    documentType: "",
    documentNumber: "",
    fullName: "",
    identityDocumentFile: null,
    medicalCode: "",
    validLicenseFile: null,
    medicalType: "",
    specialties: [],
  };
  originalFormData.value = null;
  packs.value = [];
  originalPacks.value = [];
  selectedSpecialty.value = "";
  errorMessage.value = "";
  identityFileError.value = "";
  licenseFileError.value = "";
  isLoadingModalData.value = false;

  Object.keys(touched).forEach((key) => {
    touched[key as keyof typeof touched] = false;
  });
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getChangedFields = (): Partial<CreateSupplier> => {
  if (!originalFormData.value) return {};

  const changes: Partial<CreateSupplier> = {};

  if (formData.value.fullName !== originalFormData.value.fullName) {
    changes.name = formData.value.fullName;
  }

  if (formData.value.medicalType !== originalFormData.value.medicalType) {
    changes.medical_type_code = formData.value.medicalType;
  }

  if (formData.value.medicalCode !== originalFormData.value.medicalCode) {
    changes.num_medical_enrollment = formData.value.medicalCode;
  }

  return changes;
};

const activePackIndex = ref<number>(0);

const handleUploadFile = async (
  file: File,
  actionType: string,
  tableId: number = 5,
  retries: number = 3
): Promise<string> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const userInfo = getUserInfo();
      const userId = userInfo?.id || "";

      const extension = file.name.split(".").pop()?.toLowerCase();
      const fileType =
        extension === "pdf" || extension === "doc" || extension === "docx"
          ? "DOC"
          : "IMG";

      const fields = {
        title: file.name,
        type: fileType,
        description:
          actionType === "PERSONAL_DOCUMENT"
            ? "Documento personal del médico"
            : "Licencia médica",
        id_for_table: tableId.toString(),
        table: "SUPPLIER",
        action_type: actionType,
        user_id: userId,
        is_public: 0,
      };

      const api = uploadDocument(file, fields);
      await api.request();

      if (api.error.value) {
        throw new Error(`Error subiendo documento: ${api.error.value}`);
      }

      const code = api.response.value?.data?.code;

      if (!code) {
        throw new Error("No se pudo obtener el código del documento");
      }

      return code;
    } catch (error) {
      if (attempt === retries) {
        throw new Error(
          `Error al subir documento después de ${retries} intentos: ${
            error instanceof Error ? error.message : "Error desconocido"
          }`
        );
      }

      const waitTime = Math.pow(2, attempt) * 1000;
      await delay(waitTime);
    }
  }

  throw new Error("Error inesperado al subir documento");
};

const handleCreateSupplier = async (
  supplier: IRelatedMedicalFormData,
  legalRepresentativeId: string,
  codeCardIdFile: string,
  codeMedicalLicenseFile: string,
  token: string
): Promise<number> => {
  const userInfo = getUserInfo();
  const email = userInfo?.email || "";
  const phone = userInfo?.phone_number || "";

  const payload: CreateSupplier = {
    id_type: supplier.documentType,
    card_id: supplier.documentNumber,
    email: email,
    medical_type_code: supplier.medicalType,
    legal_representative: legalRepresentativeId,
    num_medical_enrollment: supplier.medicalCode,
    name: supplier.fullName,
    phone_number: phone,
    country_iso_code: "CRC",
    province: "San Jose",
    city_name: "Guadalupe",
    postal_code: "10100",
    profile_picture_url: "",
    description: `Médico especialista - ${supplier.fullName}`,
    is_hospital: false,
    code_card_id_file: codeCardIdFile,
    code_medical_license_file: codeMedicalLicenseFile,
    gender: "M",
    address: "Dirección",
    street_number: "123",
    floor: "1",
    door_number: "1",
    latitude: "9.9281",
    longitude: "-84.0907",
    experience_years: "10",
    patients_number: "100",
    our_history: "",
    mission: "",
    vision: "",
  };

  const api = createSupplier(payload, token);
  await api.request();

  if (api.error.value) {
    throw api.error.value;
  }

  const supplierId = api.response.value?.data?.id;

  if (!supplierId) {
    throw new Error("No se pudo obtener el ID del médico");
  }

  return supplierId;
};

const handleUpdateSupplier = async (
  supplierId: number,
  supplier: IRelatedMedicalFormData,
  token: string
): Promise<void> => {
  const payload = getChangedFields();

  if (Object.keys(payload).length === 0) {
    return;
  }

  const api = updateSupplier(supplierId, payload, token);
  await api.request();

  if (api.error.value) {
    throw new Error(`Error actualizando médico: ${api.error.value}`);
  }
};

const handleUploadSpecialtyBySupplier = async (
  supplierId: number,
  supplier: IRelatedMedicalFormData,
  token: string
) => {
  const body = supplier.specialties.map((specialty) => ({
    supplier_id: supplierId,
    medical_specialty_code: specialty.code,
  }));

  const api = uploadSpecialtyBySupplier(body, token);
  await api.request();

  if (api.error.value) {
    throw new Error(`Error asociando especialidades: ${api.error.value}`);
  }
};

const fetchCurrentSupplier = async (): Promise<string | null> => {
  const api = fetchAllSuppliers();
  await api.request();

  const response = api.response.value;

  if (response?.data && response.data.length > 0) {
    currentSupplier.value = response.data[0];
    const legalRep =
      typeof currentSupplier.value.legal_representative === "string"
        ? currentSupplier.value.legal_representative
        : currentSupplier.value.legal_representative?.id;

    return legalRep ? String(legalRep) : null;
  }

  return null;
};

const handleSavePacks = async (supplierId: number) => {
  const token = getToken();
  if (!token) {
    throw new Error("No se encontró token de autenticación");
  }

  try {
    const fetchApi = fetchSpecialtyBySupplier(supplierId, token);
    await fetchApi.request();

    const supplierSpecialties: Service[] = fetchApi.response.value?.data || [];

    if (supplierSpecialties.length === 0) {
      throw new Error("No se encontraron especialidades asociadas al médico");
    }

    const packsToSave = packs.value.filter(
      (pack, index) => index >= originalPacks.value.length
    );

    for (const pack of packsToSave) {
      try {
        const packSpecialtyCode = pack.especialidad;

        const matchingSpecialty = supplierSpecialties.find(
          (spec) => spec.medical_specialty.code === packSpecialtyCode
        );

        if (!matchingSpecialty) {
          console.warn(
            `⚠️ No se encontró especialidad para código: ${packSpecialtyCode}`
          );
          continue;
        }

        const specialtyId = matchingSpecialty.id;

        const packagePayload = {
          specialty_id: specialtyId,
          procedure_code: pack.procedimiento,
          product_code: pack.producto,
          discount: 0,
          services_offer: {
            ASSESSMENT_DETAILS: pack.servicios,
          },
          is_king: 0,
          observations: "",
          postoperative_assessments: 0,
        };

        const packageApi = createPackage(packagePayload);
        await packageApi.request();

        if (packageApi.error.value) {
          throw new Error(`Error creando package: ${packageApi.error.value}`);
        }

        await handleSaveAvailability(supplierId, pack.disponibilidad);
      } catch (error) {
        console.error("❌ Error guardando pack:", error);
        throw error;
      }
    }
  } catch (error) {
    console.error("❌ Error en handleSavePacks:", error);
    throw error;
  }
};

const handleSaveAvailability = async (
  supplierId: number,
  availability: DayAvailability[]
) => {
  const weekDays = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  const locationId = 1;

  for (let i = 0; i < availability.length; i++) {
    const day = availability[i];
    if (!day.active) continue;

    for (const timeSlot of day.timeSlots) {
      if (!timeSlot.from || !timeSlot.to) continue;

      try {
        const availabilityPayload = {
          supplier_id: supplierId,
          location_id: locationId,
          weekday: weekDays[i].toUpperCase(),
          from_hour: timeSlot.from,
          to_hour: timeSlot.to,
        };

        const api = createAvailability(availabilityPayload);
        await api.request();

        if (api.error.value) {
          throw new Error(`Error creando availability: ${api.error.value}`);
        }
      } catch (error) {
        throw error;
      }
    }
  }
};

const handleSyncSpecialties = async (
  supplierId: number,
  token: string
): Promise<void> => {
  try {
    const fetchApi = fetchSpecialtyBySupplier(supplierId, token);
    await fetchApi.request();

    const currentSpecialties: Service[] = fetchApi.response.value?.data || [];

    const desiredCodes = formData.value.specialties.map((s) => s.code);

    const groupedByCode = currentSpecialties.reduce(
      (acc, spec) => {
        const code = spec.medical_specialty.code;
        if (!acc[code]) acc[code] = [];
        acc[code].push(spec);
        return acc;
      },
      {} as Record<string, Service[]>
    );

    let hasDeletePermission = true;

    for (const [code, specs] of Object.entries(groupedByCode)) {
      if (desiredCodes.includes(code)) {
        const toDeleteDuplicates = specs.slice(1);

        for (const spec of toDeleteDuplicates) {
          const deleteApi = deleteSpecialtyBySupplier(spec.id, token);
          await deleteApi.request();

          if (deleteApi.error.value) {
            const errorData = deleteApi.error.value as any;
            if (errorData.httpCode === 401) {
              hasDeletePermission = false;
              break;
            }
          }
          await delay(300);
        }

        if (!hasDeletePermission) break;
      } else {
        for (const spec of specs) {
          const deleteApi = deleteSpecialtyBySupplier(spec.id, token);
          await deleteApi.request();

          if (deleteApi.error.value) {
            const errorData = deleteApi.error.value as any;
            if (errorData.httpCode === 401) {
              hasDeletePermission = false;
              break;
            }
          }
          await delay(300);
        }

        if (!hasDeletePermission) break;
      }
    }

    const existingUniqueCodes = Object.keys(groupedByCode);
    const toAdd = formData.value.specialties.filter(
      (newSpec) => !existingUniqueCodes.includes(newSpec.code)
    );

    if (toAdd.length > 0) {
      const body = toAdd.map((specialty) => ({
        supplier_id: supplierId,
        medical_specialty_code: specialty.code,
      }));

      const addApi = uploadSpecialtyBySupplier(body, token);
      await addApi.request();

      if (addApi.error.value) {
        throw new Error(
          `Error agregando especialidades: ${addApi.error.value}`
        );
      }
    }

    if (!hasDeletePermission) {
      errorMessage.value =
        "Las especialidades nuevas se agregaron correctamente, pero no se pudieron eliminar duplicados o especialidades antiguas. Contacta al administrador.";
    }
  } catch (error) {
    throw error;
  }
};

const handleSubmit = async () => {
  if (!isStep2Complete.value || isLoadingSubmit.value) return;

  try {
    isLoadingSubmit.value = true;
    errorMessage.value = "";

    const token = getToken();
    if (!token) {
      throw new Error("No se encontró token de autenticación");
    }

    if (isEditMode.value && props.supplierId) {
      await handleUpdateSupplier(props.supplierId, formData.value, token);
      await delay(1000);

      await handleSyncSpecialties(props.supplierId, token);
      await delay(1000);

      const newPacks = packs.value.filter(
        (pack, index) => index >= originalPacks.value.length
      );
      if (newPacks.length > 0) {
        await handleSavePacks(props.supplierId);
      }

      emit("doctor-updated");
    } else {
      const legalRepresentativeId = await fetchCurrentSupplier();
      if (!legalRepresentativeId) {
        throw new Error("No se pudo obtener el representante legal");
      }

      await delay(1000);

      if (!formData.value.identityDocumentFile) {
        throw new Error("Documento de identidad requerido");
      }

      const codeCardIdFile = await handleUploadFile(
        formData.value.identityDocumentFile,
        "PERSONAL_DOCUMENT",
        5
      );

      await delay(2000);

      if (!formData.value.validLicenseFile) {
        throw new Error("Licencia médica requerida");
      }

      const codeMedicalLicenseFile = await handleUploadFile(
        formData.value.validLicenseFile,
        "PERSONAL_DOCUMENT",
        5
      );

      await delay(1000);

      const supplierId = await handleCreateSupplier(
        formData.value,
        legalRepresentativeId,
        codeCardIdFile,
        codeMedicalLicenseFile,
        token
      );

      await delay(1000);

      if (formData.value.specialties.length > 0) {
        await handleUploadSpecialtyBySupplier(
          supplierId,
          formData.value,
          token
        );
      }

      await delay(1000);

      if (packs.value.length > 0) {
        await handleSavePacksForNewSupplier(supplierId, token);
      }

      emit("doctor-added");
    }

    currentStep.value = 3;
  } catch (error) {
    const errorObj = error as any;
    if (
      errorObj?.raw?.includes("ER_DUP_ENTRY") ||
      errorObj?.raw?.includes("Duplicate Entry")
    ) {
      errorMessage.value = `La cédula "${formData.value.documentNumber}" ya está registrada en el sistema. Si deseas actualizar la información de este médico, búscalo en "Mis Médicos" y usa la opción de editar.`;
    } else {
      errorMessage.value =
        error instanceof Error
          ? error.message
          : "Error al procesar la solicitud. Por favor, intenta nuevamente.";
    }
  } finally {
    isLoadingSubmit.value = false;
  }
};

const handleSavePacksForNewSupplier = async (
  supplierId: number,
  token: string
) => {
  try {
    const fetchApi = fetchSpecialtyBySupplier(supplierId, token);
    await fetchApi.request();

    const supplierSpecialties: Service[] = fetchApi.response.value?.data || [];

    if (supplierSpecialties.length === 0) {
      throw new Error("No se encontraron especialidades asociadas al médico");
    }

    const firstSpecialtyCode = formData.value.specialties[0]?.code;

    const matchingSpecialty = supplierSpecialties.find(
      (spec) => spec.medical_specialty.code === firstSpecialtyCode
    );

    if (!matchingSpecialty) {
      throw new Error("No se encontró la especialidad correspondiente");
    }

    const specialtyId = matchingSpecialty.id;

    for (const pack of packs.value) {
      try {
        const packagePayload = {
          specialty_id: specialtyId,
          procedure_code: pack.procedimiento,
          product_code: pack.producto,
          discount: 0,
          services_offer: {
            ASSESSMENT_DETAILS: pack.servicios,
          },
          is_king: 0,
          observations: "",
          postoperative_assessments: 0,
        };

        const packageApi = createPackage(packagePayload);
        await packageApi.request();

        if (packageApi.error.value) {
          throw new Error(`Error creando package: ${packageApi.error.value}`);
        }

        await handleSaveAvailability(supplierId, pack.disponibilidad);
      } catch (error) {
        console.error("❌ Error guardando pack:", error);
        throw error;
      }
    }
  } catch (error) {
    console.error("❌ Error en handleSavePacksForNewSupplier:", error);
    throw error;
  }
};

const loadIdType = async () => {
  try {
    isLoadingDocumentTypes.value = true;
    const api = fetchUdc("ID_TYPE", {}, { authRequired: false });
    await api.request();
    const response = api.response.value;
    if (response && response.data) {
      documentTypeOptions.value = response.data;
    }
  } catch (error) {
    console.error("Error loading document types:", error);
  } finally {
    isLoadingDocumentTypes.value = false;
  }
};

const loadMedicalTypes = async () => {
  try {
    isLoadingMedicalTypes.value = true;
    const api = fetchUdc("MEDICAL_TYPE", {}, { authRequired: false });
    await api.request();
    const response = api.response.value;
    if (response && response.data) {
      medicalTypes.value = response.data;
    }
  } catch (error) {
    console.error("Error loading medical types:", error);
  } finally {
    isLoadingMedicalTypes.value = false;
  }
};

const loadSpecialties = async () => {
  try {
    isLoadingSpecialties.value = true;
    const api = fetchUdc("MEDICAL_SPECIALTY", {}, { authRequired: false });
    await api.request();
    const response = api.response.value;
    if (response && response.data) {
      specialties.value = response.data;
    }
  } catch (error) {
    console.error("Error loading specialties:", error);
  } finally {
    isLoadingSpecialties.value = false;
  }
};

const loadProducts = async () => {
  try {
    isLoadingProducts.value = true;
    const api = fetchUdc("MEDICAL_PRODUCT", {}, { authRequired: false });
    await api.request();
    const response = api.response.value;

    if (response && response.data) {
      productosForPreview.value = response.data.map((item: any) => ({
        value: item.code,
        label: item.name,
      }));
    }
  } catch (error) {
    console.error("Error loading products:", error);
  } finally {
    isLoadingProducts.value = false;
  }
};

const loadServices = async () => {
  try {
    isLoadingServices.value = true;
    const api = fetchUdc("ASSESSMENT_DETAIL", {}, { authRequired: false });
    await api.request();
    const response = api.response.value;

    if (response && response.data) {
      servicesData.value = response.data;
    }
  } catch (error) {
    console.error("Error loading services:", error);
  } finally {
    isLoadingServices.value = false;
  }
};

watch(
  () => props.editMode,
  (newEditMode) => {
    if (newEditMode && isOpen.value && props.doctorData) {
      nextTick(() => {
        loadDoctorData();
      });
    }
  },
  { immediate: true }
);

watch(
  () => props.existingPacks,
  (newPacks) => {
    if (
      isOpen.value &&
      isEditMode.value &&
      Array.isArray(newPacks) &&
      newPacks.length > 0
    ) {
      packs.value = newPacks.map((pack) => ({
        ...pack,
        precioValoracion: pack.precioValoracion || DEFAULT_VALORACION_COST,
      }));
      originalPacks.value = JSON.parse(JSON.stringify(newPacks));
      isLoadingModalData.value = false;
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => props.doctorData,
  (newData) => {
    if (isOpen.value && isEditMode.value && newData) {
      loadDoctorData();
    }
  },
  { immediate: true, deep: true }
);

onMounted(async () => {
  await Promise.all([
    loadIdType(),
    loadSpecialties(),
    loadMedicalTypes(),
    loadProducts(),
    loadServices(),
  ]);
});

defineExpose({
  openModal,
  closeModal,
  isLoadingModalData,
});
</script>

<style lang="scss" scoped>
.modal-title {
  @include label-base;
  font-weight: 600;
  font-size: 1.25rem;
  line-height: 1.75rem;
  letter-spacing: 0;
  color: #353e5c;
  margin: 0;
}

.modal-body {
  padding: 1.5rem;
}

.modal-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  min-height: 400px;

  &__spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e5e7eb;
    border-top-color: $color-primary;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    margin-bottom: 1.5rem;
  }

  &__text {
    @include text-base;
    font-size: 1rem;
    color: $color-text-muted;
    margin: 0;
  }
}

.step-content {
  padding: 1.25rem 0;

  &--with-preview {
    display: grid;
    grid-template-columns: 1fr 350px;
    gap: 2rem;
    align-items: start;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
    }
  }
}

.packs-section {
  flex: 1;
}

.preview-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 1.5rem;
  height: fit-content;
  max-height: calc(100vh - 3rem);
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 0.5rem;
  }

  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 0.25rem;
  }
}

.doctor-form {
  @include space-y(1.25rem);

  &__group {
    @include space-y(0.375rem);
  }

  &__label {
    @include label-base;
    color: #344054;
    display: block;
  }

  &__input {
    @include input-base;
    width: 100%;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &:disabled {
      background-color: #f9fafb;
      cursor: not-allowed;
      opacity: 0.6;
    }

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
  }

  &__input-group {
    display: flex;
    gap: 0.5rem;
  }

  &__add-button {
    @include primary-button;
    padding: 0.625rem 1rem;
    white-space: nowrap;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__specialties {
    margin-top: 0.75rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__limit-text {
    display: block;
    color: #6b7280;
    font-size: 0.875rem;
    margin-top: 0.5rem;
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    margin-top: 1rem;
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 0.375rem;
    color: #dc2626;
    font-size: 0.875rem;
  }

  &__error-message {
    display: block;
    color: #dc2626;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    line-height: 1.25;
  }
}

.input-error {
  border-color: #dc2626 !important;
  background-color: #fef2f2 !important;

  &:focus {
    border-color: #dc2626 !important;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
  }
}

.specialty-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background-color: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;

  &__remove {
    @include button-base;
    padding: 0.25rem;
    color: #1d4ed8;
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover {
      background-color: #1d4ed8;
      color: #fff;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

.confirmation {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.5rem 1.25rem;
  text-align: center;

  &__icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 5rem;
    height: 5rem;
    background-color: #f0f9ff;
    border-radius: 50%;
    margin-bottom: 1.5rem;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 1.25rem;
    color: #101828;
    margin: 0 0 0.75rem 0;
  }

  &__description {
    @include text-base;
    font-size: 1rem;
    color: $color-text-muted;
    margin: 0;
    max-width: 25rem;
  }
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  width: 100%;

  &__button--secondary {
    @include outline-button;
    padding: 0.625rem 1.25rem;
  }

  &__button--primary {
    @include primary-button;
    padding: 0.625rem 1.25rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__button--full {
    flex: 1;
    text-decoration: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
