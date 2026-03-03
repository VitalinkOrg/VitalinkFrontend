<template>
  <div>
    <slot name="trigger" :open="openModal" />

    <AtomsModalBase
      :is-open="isModalVisible"
      size="extra-large"
      :show-close-button="true"
      :close-on-backdrop="false"
      @close="handleModalClose"
    >
      <template #title>
        <h2
          v-if="currentStep !== STEP_CONFIRMATION"
          class="doctor-modal__title"
        >
          {{
            isEditMode
              ? "Editar médico relacionado"
              : "Agregar médico relacionado"
          }}
        </h2>
      </template>

      <div class="doctor-modal__body">
        <div v-if="isLoadingInitialData" class="doctor-modal__loading">
          <div class="doctor-modal__loading-spinner" />
          <p class="doctor-modal__loading-text">Cargando datos del médico...</p>
        </div>

        <template v-else>
          <WebsiteStepper
            v-if="currentStep !== STEP_CONFIRMATION"
            :steps="WIZARD_STEPS"
            :current-step="currentStep"
          />

          <section
            v-if="currentStep === STEP_DOCTOR_INFO"
            class="doctor-modal__step-content"
            aria-label="Datos del médico"
          >
            <form
              class="doctor-form"
              novalidate
              @submit.prevent="handleDoctorInfoSubmit"
            >
              <div class="doctor-form__field">
                <label id="label-document-type" class="doctor-form__label">
                  Tipo de documento de identidad
                </label>
                <UiDropdownBase
                  :model-value="doctorForm.documentTypeCode"
                  :items="documentTypeDropdownItems"
                  :loading="isLoadingDocumentTypes"
                  :disabled="isSubmitting || isEditMode"
                  :error="
                    touched.documentTypeCode && !doctorForm.documentTypeCode
                  "
                  placeholder="Seleccione tipo de documento"
                  aria-labelledby="label-document-type"
                  @update:model-value="
                    handleDocumentTypeSelection($event as string)
                  "
                />
                <span
                  v-if="
                    touched.documentTypeCode && !doctorForm.documentTypeCode
                  "
                  class="doctor-form__error-message"
                  role="alert"
                >
                  Debes seleccionar un tipo de documento
                </span>
              </div>

              <div class="doctor-form__field">
                <label for="input-document-number" class="doctor-form__label">
                  Número de documento
                </label>
                <input
                  id="input-document-number"
                  :value="doctorForm.documentNumber"
                  type="text"
                  class="doctor-form__input"
                  :class="{
                    'doctor-form__input--error':
                      touched.documentNumber &&
                      (!doctorForm.documentNumber || !isDocumentNumberValid),
                  }"
                  :placeholder="documentNumberPlaceholder"
                  :disabled="isSubmitting || isEditMode"
                  autocomplete="off"
                  required
                  aria-required="true"
                  :aria-invalid="
                    touched.documentNumber &&
                    (!doctorForm.documentNumber || !isDocumentNumberValid)
                  "
                  @input="
                    doctorForm.documentNumber = (
                      $event.target as HTMLInputElement
                    ).value
                  "
                  @blur="touched.documentNumber = true"
                />
                <span
                  v-if="touched.documentNumber && !doctorForm.documentNumber"
                  class="doctor-form__error-message"
                  role="alert"
                >
                  El número de documento es requerido
                </span>
                <span
                  v-else-if="
                    touched.documentNumber &&
                    doctorForm.documentNumber &&
                    !isDocumentNumberValid
                  "
                  class="doctor-form__error-message"
                  role="alert"
                >
                  El número de documento debe tener entre 5 y 20 caracteres
                </span>
              </div>

              <div class="doctor-form__field">
                <label for="input-full-name" class="doctor-form__label">
                  Nombre y Apellidos
                </label>
                <input
                  id="input-full-name"
                  v-model="doctorForm.fullName"
                  type="text"
                  class="doctor-form__input"
                  :class="{
                    'doctor-form__input--error':
                      touched.fullName && !doctorForm.fullName.trim(),
                  }"
                  placeholder="Ingrese nombre completo"
                  :disabled="isSubmitting"
                  autocomplete="name"
                  required
                  aria-required="true"
                  :aria-invalid="
                    touched.fullName && !doctorForm.fullName.trim()
                  "
                  @blur="touched.fullName = true"
                />
                <span
                  v-if="touched.fullName && !doctorForm.fullName.trim()"
                  class="doctor-form__error-message"
                  role="alert"
                >
                  El nombre completo es requerido
                </span>
              </div>

              <MedicosRegistroCargarArchivos
                v-if="!isEditMode"
                label="Documento de identidad"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                input-id="input-identity-document-file"
                :uploaded-file="doctorForm.identityDocumentFile"
                :disabled="isSubmitting"
                :has-error="
                  touched.identityDocumentFile &&
                  !doctorForm.identityDocumentFile
                "
                @update:file="
                  doctorForm.identityDocumentFile = $event;
                  touched.identityDocumentFile = true;
                "
              />
              <span
                v-if="
                  !isEditMode &&
                  touched.identityDocumentFile &&
                  !doctorForm.identityDocumentFile
                "
                class="doctor-form__error-message"
                role="alert"
              >
                Debes cargar el documento de identidad
              </span>

              <div class="doctor-form__field">
                <label for="input-medical-code" class="doctor-form__label">
                  Código de médico
                </label>
                <input
                  id="input-medical-code"
                  v-model="doctorForm.medicalEnrollmentCode"
                  type="text"
                  class="doctor-form__input"
                  :class="{
                    'doctor-form__input--error':
                      touched.medicalEnrollmentCode &&
                      !doctorForm.medicalEnrollmentCode.trim(),
                  }"
                  placeholder="Ingrese el código de médico"
                  :disabled="isSubmitting"
                  autocomplete="off"
                  required
                  aria-required="true"
                  @blur="touched.medicalEnrollmentCode = true"
                />
                <span
                  v-if="
                    touched.medicalEnrollmentCode &&
                    !doctorForm.medicalEnrollmentCode.trim()
                  "
                  class="doctor-form__error-message"
                  role="alert"
                >
                  El código de médico es requerido
                </span>
              </div>

              <MedicosRegistroCargarArchivos
                v-if="!isEditMode"
                label="Carnet vigente"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                input-id="input-medical-license-file"
                :uploaded-file="doctorForm.medicalLicenseFile"
                :disabled="isSubmitting"
                :has-error="
                  touched.medicalLicenseFile && !doctorForm.medicalLicenseFile
                "
                @update:file="
                  doctorForm.medicalLicenseFile = $event;
                  touched.medicalLicenseFile = true;
                "
              />
              <span
                v-if="
                  !isEditMode &&
                  touched.medicalLicenseFile &&
                  !doctorForm.medicalLicenseFile
                "
                class="doctor-form__error-message"
                role="alert"
              >
                Debes cargar el carnet vigente
              </span>

              <div class="doctor-form__field">
                <label id="label-medical-type" class="doctor-form__label">
                  Tipo de médico
                </label>
                <UiDropdownBase
                  :model-value="doctorForm.medicalTypeCode"
                  :items="medicalTypeDropdownItems"
                  :loading="isLoadingMedicalTypes"
                  :disabled="isSubmitting"
                  :error="
                    touched.medicalTypeCode && !doctorForm.medicalTypeCode
                  "
                  placeholder="Seleccione tipo de médico"
                  aria-labelledby="label-medical-type"
                  @update:model-value="
                    handleMedicalTypeChange($event as string)
                  "
                  @blur="touched.medicalTypeCode = true"
                />
                <span
                  v-if="touched.medicalTypeCode && !doctorForm.medicalTypeCode"
                  class="doctor-form__error-message"
                  role="alert"
                >
                  Debes seleccionar un tipo de médico
                </span>
              </div>

              <div class="doctor-form__field">
                <label id="label-specialties" class="doctor-form__label">
                  Especialidad (máximo 3)
                </label>
                <div class="doctor-form__inline-group">
                  <UiDropdownBase
                    :model-value="pendingSpecialtyCode"
                    :items="specialtyDropdownItems"
                    :loading="isLoadingSpecialties"
                    :disabled="isSubmitting || !doctorForm.medicalTypeCode"
                    placeholder="Seleccione especialidad"
                    searchable
                    aria-labelledby="label-specialties"
                    @update:model-value="
                      pendingSpecialtyCode = $event as string
                    "
                  />
                  <button
                    type="button"
                    class="doctor-form__add-button"
                    :disabled="!canAddSpecialty"
                    @click="addSelectedSpecialty"
                  >
                    Agregar
                  </button>
                </div>
                <span
                  v-if="!doctorForm.medicalTypeCode"
                  class="doctor-form__hint"
                >
                  Primero seleccione el tipo de médico
                </span>

                <ul
                  v-if="doctorForm.selectedSpecialties.length > 0"
                  class="doctor-form__specialty-list"
                  aria-label="Especialidades seleccionadas"
                >
                  <li
                    v-for="(specialty, idx) in doctorForm.selectedSpecialties"
                    :key="specialty.code"
                    class="doctor-form__specialty-badge"
                  >
                    {{ specialty.name }}
                    <button
                      type="button"
                      class="doctor-form__specialty-remove"
                      :disabled="isSubmitting"
                      :aria-label="`Eliminar especialidad ${specialty.name}`"
                      @click="removeSpecialtyAtIndex(idx)"
                    >
                      <AtomsIconsXIcon size="12" />
                    </button>
                  </li>
                </ul>
                <span
                  v-if="
                    touched.selectedSpecialties &&
                    doctorForm.selectedSpecialties.length === 0 &&
                    doctorForm.medicalTypeCode
                  "
                  class="doctor-form__error-message"
                  role="alert"
                >
                  Debes agregar al menos una especialidad
                </span>
                <span
                  v-if="
                    doctorForm.selectedSpecialties.length >= MAX_SPECIALTIES
                  "
                  class="doctor-form__hint"
                >
                  Has alcanzado el máximo de
                  {{ MAX_SPECIALTIES }} especialidades
                </span>
              </div>

              <!-- <div class="doctor-form__field">
                <label id="label-hospital" class="doctor-form__label">
                  Seleccionar Hospitales
                </label>
                <div class="doctor-form__inline-group">
                  <UiDropdownBase
                    :model-value="pendingLocationId"
                    :items="availableLocationDropdownItems"
                    :loading="isLoadingLocations"
                    :disabled="isSubmitting"
                    placeholder="Seleccione un hospital"
                    searchable
                    aria-labelledby="label-hospital"
                    @update:model-value="pendingLocationId = $event as number"
                  />
                  <button
                    type="button"
                    class="doctor-form__add-button"
                    :disabled="!pendingLocationId"
                    @click="addSelectedLocation"
                  >
                    Agregar
                  </button>
                </div>

                <ul
                  v-if="doctorForm.selectedLocationIds.length > 0"
                  class="doctor-form__specialty-list"
                  aria-label="Hospitales seleccionados"
                >
                  <li
                    v-for="(locId, idx) in doctorForm.selectedLocationIds"
                    :key="locId"
                    class="doctor-form__specialty-badge"
                  >
                    {{ getLocationLabel(locId) }}
                    <button
                      type="button"
                      class="doctor-form__specialty-remove"
                      :disabled="isSubmitting"
                      :aria-label="`Eliminar hospital ${getLocationLabel(locId)}`"
                      @click="removeLocationAtIndex(idx)"
                    >
                      <AtomsIconsXIcon size="12" />
                    </button>
                  </li>
                </ul>
                <span
                  v-if="
                    touched.selectedLocationIds &&
                    doctorForm.selectedLocationIds.length === 0
                  "
                  class="doctor-form__error-message"
                  role="alert"
                >
                  Debes seleccionar al menos un hospital
                </span>
              </div> -->
            </form>
          </section>

          <section
            v-if="currentStep === STEP_PACKS_PRICING"
            class="doctor-modal__step-content doctor-modal__step-content--with-preview"
            aria-label="Packs y precios"
          >
            <div class="doctor-modal__packs-section">
              <MedicosModalesPreciosPacks
                ref="packsConfigRef"
                v-model="packsList"
                :available-specialties="doctorForm.selectedSpecialties"
                :medical-type-code="doctorForm.medicalTypeCode"
                :supplier-id="editSupplierId"
                @update:active-pack-index="activePreviewPackIndex = $event"
              />
            </div>

            <div class="doctor-modal__preview-section">
              <MedicosModalesPackPreview
                v-if="packsList[activePreviewPackIndex]"
                :key="`preview-${activePreviewPackIndex}`"
                :model-value="packsList"
                :pack="packsList[activePreviewPackIndex]"
                :is-king-package="
                  activePreviewPackIndex === 0 && packsList.length > 1
                "
                :productos="cachedProducts"
                :procedures="cachedProcedures"
                :specialties="cachedSpecialtiesUdc"
                :services-map="assessmentDetailsMap"
              />
            </div>
          </section>

          <section
            v-if="currentStep === STEP_CONFIRMATION"
            class="doctor-modal__confirmation"
            aria-label="Confirmación"
          >
            <div class="doctor-modal__confirmation-icon-wrapper">
              <div class="doctor-modal__confirmation-icon">
                <AtomsIconsCheckIcon size="20" />
              </div>
            </div>
            <h5 class="doctor-modal__confirmation-title">
              {{
                isEditMode
                  ? "Médico actualizado exitosamente"
                  : "Médico creado exitosamente"
              }}
            </h5>
            <p class="doctor-modal__confirmation-description">
              {{
                isEditMode
                  ? "Los cambios se han guardado correctamente."
                  : "El médico se ha registrado con sus packs y servicios."
              }}
            </p>
          </section>
        </template>
      </div>

      <template #footer>
        <nav
          class="doctor-modal__footer"
          aria-label="Navegación del formulario"
        >
          <template v-if="currentStep === STEP_DOCTOR_INFO">
            <button
              type="button"
              class="doctor-modal__button--secondary"
              :disabled="isSubmitting"
              @click="handleModalClose"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="doctor-modal__button--primary"
              :disabled="!isDoctorInfoStepComplete || isSubmitting"
              @click="handleDoctorInfoSubmit"
            >
              Continuar
            </button>
          </template>

          <template v-if="currentStep === STEP_PACKS_PRICING">
            <button
              type="button"
              class="doctor-modal__button--secondary"
              :disabled="isSubmitting"
              @click="navigateToStep(STEP_DOCTOR_INFO)"
            >
              Volver
            </button>
            <button
              type="button"
              class="doctor-modal__button--primary"
              :disabled="!isPacksStepComplete || isSubmitting"
              @click="handleFinalSubmit"
            >
              <span v-if="isSubmitting" class="doctor-modal__spinner" />
              {{ submitButtonLabel }}
            </button>
          </template>

          <template v-if="currentStep === STEP_CONFIRMATION">
            <NuxtLink
              to="/medicos/mis-medicos"
              class="doctor-modal__button--secondary doctor-modal__button--full"
            >
              Ver en mis médicos
            </NuxtLink>
            <button
              v-if="!isEditMode"
              type="button"
              class="doctor-modal__button--primary doctor-modal__button--full"
              @click="resetAndStartNew"
            >
              Agregar otro médico
            </button>
            <button
              v-else
              type="button"
              class="doctor-modal__button--primary doctor-modal__button--full"
              @click="handleModalClose"
            >
              Cerrar
            </button>
          </template>
        </nav>
      </template>
    </AtomsModalBase>
  </div>
</template>

<script lang="ts" setup>
import type { PackFormItem } from "@/components/medicos/modales/precios-packs.vue";
import type { DropdownItem } from "@/components/ui/dropdown-base.vue";
import { useDocuments } from "@/composables/api/useDocuments";
import { useLocation } from "@/composables/api/useLocation";
import { usePackage } from "@/composables/api/usePackage";
import { useSpecialtyBySupplier } from "@/composables/api/useSpecialtyBySupplier";
import { useSupplier } from "@/composables/api/useSupplier";
import { useUdc } from "@/composables/api/useUdc";
import { useLogger } from "@/composables/useLogger";
import { useToast } from "@/composables/useToast";

const STEP_DOCTOR_INFO = 1;
const STEP_PACKS_PRICING = 2;
const STEP_CONFIRMATION = 3;
const MAX_SPECIALTIES = 3;
const WIZARD_STEPS = ["Datos del médico", "Packs y precios"];

const MEDICAL_TYPE_SPECIALTY_MAP: Record<string, string> = {
  SPECIALTY_MEDICAL: "SPECIALTY_MEDICAL",
  ODONTOLOGY: "ODONTOLOGY_MEDICAL",
};

const ODONTOLOGY_FALLBACK: IUdc = {
  id: 50,
  code: "ODONTOLOGY",
  name: "Odontología",
  type: "ODONTOLOGY_SPECIALTY",
  value1: null,
  value2: null,
  father_code: "ODONTOLOGY_MEDICAL",
  supplier_id: null,
  created_date: "2026-02-26T06:19:08.000Z",
  updated_date: null,
};

interface SelectedSpecialty {
  code: string;
  name: string;
}

interface DoctorFormState {
  documentTypeCode: string;
  documentNumber: string;
  fullName: string;
  identityDocumentFile: File | null;
  medicalEnrollmentCode: string;
  medicalLicenseFile: File | null;
  medicalTypeCode: string;
  selectedSpecialties: SelectedSpecialty[];
  selectedLocationIds: number[];
}

interface FieldTouchedState {
  documentTypeCode: boolean;
  documentNumber: boolean;
  fullName: boolean;
  identityDocumentFile: boolean;
  medicalEnrollmentCode: boolean;
  medicalLicenseFile: boolean;
  medicalTypeCode: boolean;
  selectedSpecialties: boolean;
  selectedLocationIds: boolean;
}

interface Props {
  editMode?: "edit" | "create";
  selectedSupplierForEdit?: Partial<ISupplierSystem>;
}

interface Emits {
  (event: "supplier-added"): void;
  (event: "supplier-updated"): void;
}

const props = withDefaults(defineProps<Props>(), {
  editMode: "create",
  selectedSupplierForEdit: undefined,
});

const emit = defineEmits<Emits>();

const logger = useLogger("FormularioMedicoRelacionado");
const toast = useToast();
const { getAllUdcs, createUdc, updateUdc } = useUdc();
const { createSupplier, updateSupplier, getSupplierById } = useSupplier();
const { createMultipleSpecialtiesBySupplier } = useSpecialtyBySupplier();
const { createPackage, updatePackage, deletePackage } = usePackage();
const { getAllLocations } = useLocation();
const { getUserInfo } = useUserInfo();
const { addDocument } = useDocuments();

const isModalVisible = ref(false);
const currentStep = ref(STEP_DOCTOR_INFO);
const isLoadingInitialData = ref(false);
const isSubmitting = ref(false);

const documentTypes = ref<IUdc[]>([]);
const medicalTypes = ref<IUdc[]>([]);
const specialtiesCatalog = ref<IUdc[]>([]);
const locations = ref<ILocation[]>([]);

const isLoadingDocumentTypes = ref(false);
const isLoadingMedicalTypes = ref(false);
const isLoadingSpecialties = ref(false);
const isLoadingLocations = ref(false);

const pendingSpecialtyCode = ref("");
const pendingLocationId = ref<number | undefined>(undefined);
const activePreviewPackIndex = ref(0);

const cachedProducts = ref<IUdc[]>([]);
const cachedProcedures = ref<IUdc[]>([]);
const cachedSpecialtiesUdc = ref<IUdc[]>([]);
const assessmentDetailsMap = ref<Map<string, string>>(new Map());

const editSupplierDetail = ref<ISupplierDetail | null>(null);
const existingPackageIds = ref<number[]>([]);

const packsList = ref<PackFormItem[]>([createEmptyPack()]);

const doctorForm = reactive<DoctorFormState>({
  documentTypeCode: "",
  documentNumber: "",
  fullName: "",
  identityDocumentFile: null,
  medicalEnrollmentCode: "",
  medicalLicenseFile: null,
  medicalTypeCode: "",
  selectedSpecialties: [],
  selectedLocationIds: [],
});

const touched = reactive<FieldTouchedState>({
  documentTypeCode: false,
  documentNumber: false,
  fullName: false,
  identityDocumentFile: false,
  medicalEnrollmentCode: false,
  medicalLicenseFile: false,
  medicalTypeCode: false,
  selectedSpecialties: false,
  selectedLocationIds: false,
});

const isEditMode = computed(() => props.editMode === "edit");

const editSupplierId = computed<number | null>(() =>
  isEditMode.value ? (props.selectedSupplierForEdit?.id ?? null) : null,
);

const documentTypeDropdownItems = computed<DropdownItem[]>(() =>
  documentTypes.value.map((u) => ({ value: u.code, label: u.name })),
);

const medicalTypeDropdownItems = computed<DropdownItem[]>(() =>
  medicalTypes.value.map((u) => ({ value: u.code, label: u.name })),
);

const specialtyDropdownItems = computed<DropdownItem[]>(() => {
  const selectedCodes = new Set(
    doctorForm.selectedSpecialties.map((s) => s.code),
  );
  return specialtiesCatalog.value
    .filter((u) => !selectedCodes.has(u.code))
    .map((u) => ({ value: u.code, label: u.name }));
});

// const availableLocationDropdownItems = computed<DropdownItem[]>(() => {
//   const selectedIds = new Set(doctorForm.selectedLocationIds);
//   return locations.value
//     .filter((loc) => !selectedIds.has(loc.id))
//     .map((loc) => ({
//       value: loc.id,
//       label: `${loc.name} — ${loc.city_name}, ${loc.province}`,
//     }));
// });

// function getLocationLabel(locId: number): string {
//   const loc = locations.value.find((l) => l.id === locId);
//   return loc
//     ? `${loc.name} — ${loc.city_name}, ${loc.province}`
//     : `Hospital #${locId}`;
// }

// function addSelectedLocation() {
//   if (!pendingLocationId.value) return;
//   if (doctorForm.selectedLocationIds.includes(pendingLocationId.value)) return;

//   doctorForm.selectedLocationIds.push(pendingLocationId.value);
//   pendingLocationId.value = undefined;
//   touched.selectedLocationIds = true;
// }

// function removeLocationAtIndex(index: number) {
//   doctorForm.selectedLocationIds.splice(index, 1);
// }

const canAddSpecialty = computed(() => {
  if (!pendingSpecialtyCode.value || isSubmitting.value) return false;
  if (doctorForm.selectedSpecialties.length >= MAX_SPECIALTIES) return false;
  return !doctorForm.selectedSpecialties.some(
    (s) => s.code === pendingSpecialtyCode.value,
  );
});

const isDocumentNumberValid = computed(() => {
  const v = doctorForm.documentNumber.trim();
  return v.length >= 5 && v.length <= 20;
});

const documentNumberPlaceholder = computed(() => {
  const map: Record<string, string> = {
    PHYSICAL_DNI: "Ej: 102340567",
    JURIDICAL_DNI: "Ej: 3-101-123456",
    PASSPORT: "Ej: AB1234567",
    DIMEX: "Ej: 100000012345",
  };
  return map[doctorForm.documentTypeCode] ?? "Ingrese número de documento";
});

const isDoctorInfoStepComplete = computed(() => {
  const hasFiles = isEditMode.value
    ? true
    : Boolean(doctorForm.identityDocumentFile) &&
      Boolean(doctorForm.medicalLicenseFile);

  return (
    Boolean(doctorForm.documentTypeCode) &&
    Boolean(doctorForm.documentNumber.trim()) &&
    isDocumentNumberValid.value &&
    Boolean(doctorForm.fullName.trim()) &&
    Boolean(doctorForm.medicalEnrollmentCode.trim()) &&
    Boolean(doctorForm.medicalTypeCode) &&
    doctorForm.selectedSpecialties.length > 0 &&
    // doctorForm.selectedLocationIds.length > 0 &&
    hasFiles
  );
});

const isPacksStepComplete = computed(
  () =>
    packsList.value.length > 0 &&
    packsList.value.every(
      (p) =>
        p.procedure_code &&
        p.product_valoration_price &&
        p.product_valoration_price > 0,
    ),
);

const submitButtonLabel = computed(() => {
  if (isSubmitting.value)
    return isEditMode.value ? "Actualizando..." : "Guardando...";
  return isEditMode.value ? "Actualizar médico" : "Guardar médico";
});

function createEmptyPack(): PackFormItem {
  return {
    procedure_code: "",
    product_code: "",
    discount: null,
    reference_price: null,
    services_offer: [],
    specialty_code: "",
    product_name: "",
    product_valoration_price: null,
    apply_discount: false,
  };
}

function toNumericOrNull(value: unknown): number | null {
  if (value == null) return null;
  const num = typeof value === "string" ? parseFloat(value) : Number(value);
  return isNaN(num) ? null : num;
}

function markAllTouched() {
  (Object.keys(touched) as (keyof FieldTouchedState)[]).forEach((k) => {
    touched[k] = true;
  });
}

function generateCodeFromName(name: string): string {
  return name
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_{2,}/g, "_")
    .replace(/^_|_$/g, "");
}

function buildSpecialtyMapFromResponse(specData: unknown): Map<string, number> {
  const map = new Map<string, number>();

  const response = specData as
    | { success?: Array<{ id: number; medical_specialty: string }> }
    | undefined
    | null;

  const entries = response?.success;

  if (!Array.isArray(entries) || entries.length === 0) {
    logger.warn(
      "createMultipleSpecialtiesBySupplier no devolvió entries en success",
      {
        specData,
      },
    );
    return map;
  }

  for (const entry of entries) {
    if (entry.id && entry.medical_specialty) {
      map.set(entry.medical_specialty, entry.id);
    }
  }

  logger.debug("Mapa specialty_code → specialty_by_supplier_id", {
    map: Object.fromEntries(map),
  });

  return map;
}

async function openModal() {
  isModalVisible.value = true;
  currentStep.value = STEP_DOCTOR_INFO;

  await fetchAllDropdownData();

  if (isEditMode.value && props.selectedSupplierForEdit?.id) {
    await loadSupplierForEditing(props.selectedSupplierForEdit.id);
  }
}

function handleModalClose() {
  isModalVisible.value = false;
  resetFormState();
}

function navigateToStep(step: number) {
  currentStep.value = step;
}

function handleDocumentTypeSelection(code: string) {
  doctorForm.documentTypeCode = code;
  touched.documentTypeCode = true;
}

async function handleMedicalTypeChange(code: string) {
  doctorForm.medicalTypeCode = code;
  touched.medicalTypeCode = true;

  doctorForm.selectedSpecialties = [];
  pendingSpecialtyCode.value = "";
  specialtiesCatalog.value = [];

  if (code) {
    const fatherCode = MEDICAL_TYPE_SPECIALTY_MAP[code];
    if (fatherCode) {
      await fetchSpecialtiesByFatherCode(fatherCode);
    }

    if (code === "ODONTOLOGY" && specialtiesCatalog.value.length === 0) {
      logger.debug("No odontology specialties from API, trying by type");
      await fetchSpecialtiesByType("ODONTOLOGY_SPECIALTY");
    }

    if (code === "ODONTOLOGY") {
      const exists = specialtiesCatalog.value.some(
        (s) => s.code === ODONTOLOGY_FALLBACK.code,
      );
      if (!exists) {
        logger.debug("Adding odontology fallback specialty");
        specialtiesCatalog.value.push(ODONTOLOGY_FALLBACK);
      }
    }

    if (specialtiesCatalog.value.length === 0) {
      logger.debug("No specialties found with filter, loading all specialties");
      await executeGetAllSpecialties();
    }
  }
}

async function executeGetAllSpecialties() {
  isLoadingSpecialties.value = true;
  try {
    const { data, error } = await getAllUdcs(
      { type: "MEDICAL_SPECIALTY" } as Partial<IUdcParams>,
      false,
    );
    if (error) {
      logger.error("Failed to fetch all specialties", { info: error.info });
      return;
    }
    specialtiesCatalog.value = data ?? [];
  } finally {
    isLoadingSpecialties.value = false;
  }
}

function addSelectedSpecialty() {
  if (!canAddSpecialty.value) return;
  const matched = specialtiesCatalog.value.find(
    (s) => s.code === pendingSpecialtyCode.value,
  );
  if (!matched) return;

  doctorForm.selectedSpecialties.push({
    code: matched.code,
    name: matched.name,
  });
  pendingSpecialtyCode.value = "";
  touched.selectedSpecialties = true;
}

function removeSpecialtyAtIndex(index: number) {
  doctorForm.selectedSpecialties.splice(index, 1);
}

function handleDoctorInfoSubmit() {
  markAllTouched();
  if (!isDoctorInfoStepComplete.value) {
    toast.error("Por favor, completa todos los campos requeridos.");
    return;
  }
  navigateToStep(STEP_PACKS_PRICING);
}

async function handleFinalSubmit() {
  if (!isPacksStepComplete.value) {
    toast.error(
      "Cada pack debe tener al menos un procedimiento y costo de valoración.",
    );
    return;
  }

  isSubmitting.value = true;

  try {
    if (isEditMode.value && props.selectedSupplierForEdit?.id) {
      await executeEditSubmission(props.selectedSupplierForEdit.id);
    } else {
      await executeCreateSubmission();
    }
    navigateToStep(STEP_CONFIRMATION);
  } catch (err) {
    const msg =
      err instanceof Error ? err.message : "Ocurrió un error inesperado";
    toast.error(msg);
    logger.error("Submission failed", { error: msg });
  } finally {
    isSubmitting.value = false;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getUserId(): string {
  const userInfo = getUserInfo();
  return userInfo.id;
}

async function uploadDocuments(): Promise<{
  cardIdFileCode: string;
  medicalLicenseFileCode: string;
}> {
  let cardIdFileCode = "";
  let medicalLicenseFileCode = "";

  if (doctorForm.identityDocumentFile) {
    const identityPayload: IDocumentCreationRequest = {
      file: doctorForm.identityDocumentFile,
      fields: {
        title: `Documento de identidad - ${doctorForm.fullName.trim()}`,
        type: "DOC",
        description: "Documento de identidad del médico relacionado",
        id_for_table: "5",
        table: "SUPPLIER",
        action_type: "PRIVATE_CONTRACT",
        user_id: getUserId(),
        is_public: 0,
      },
    };

    logger.debug("Subiendo documento de identidad", {
      fileName: identityPayload.file.name,
      fileSize: identityPayload.file.size,
      fields: identityPayload.fields,
    });

    const { data: identityDoc, error: identityError } =
      await addDocument(identityPayload);

    if (identityError || !identityDoc) {
      throw new Error(
        identityError?.info ?? "Error al subir el documento de identidad",
      );
    }

    cardIdFileCode = identityDoc.code;
    logger.debug("Documento de identidad subido", { code: cardIdFileCode });

    await delay(2000);
  }

  if (doctorForm.medicalLicenseFile) {
    const licensePayload: IDocumentCreationRequest = {
      file: doctorForm.medicalLicenseFile,
      fields: {
        title: `Carnet vigente - ${doctorForm.fullName.trim()}`,
        type: "DOC",
        description: "Carnet médico vigente del médico relacionado",
        id_for_table: "5",
        table: "SUPPLIER",
        action_type: "PERSONAL_DOCUMENT",
        user_id: getUserId(),
        is_public: 0,
      },
    };

    logger.debug("Payload carnet vigente:", {
      fileName: licensePayload.file.name,
      fileSize: licensePayload.file.size,
      fields: licensePayload.fields,
    });

    const { data: licenseDoc, error: licenseError } =
      await addDocument(licensePayload);

    if (licenseError || !licenseDoc) {
      throw new Error(licenseError?.info ?? "Error al subir el carnet vigente");
    }

    medicalLicenseFileCode = licenseDoc.code;
    logger.debug("Carnet vigente subido", { code: medicalLicenseFileCode });
  }

  return { cardIdFileCode, medicalLicenseFileCode };
}

async function executeCreateSubmission() {
  const currentUser = getUserInfo();

  logger.debug("Paso 1: Subiendo documentos...");

  const { cardIdFileCode, medicalLicenseFileCode } = await uploadDocuments();

  await delay(1000);

  logger.debug("Paso 2: Creando supplier...");

  const supplierPayload: ICreateSupplierRequest = {
    id_type: doctorForm.documentTypeCode,
    card_id: doctorForm.documentNumber.trim(),
    email: "",
    medical_type_code: doctorForm.medicalTypeCode,
    legal_representative: currentUser.id,
    num_medical_enrollment: doctorForm.medicalEnrollmentCode.trim(),
    name: doctorForm.fullName.trim(),
    phone_number: "",
    country_iso_code: "CRC",
    province: "",
    city_name: "",
    profile_picture_url: "",
    description: "",
    is_hospital: false,
    code_card_id_file: cardIdFileCode,
    code_medical_license_file: medicalLicenseFileCode,
  };

  logger.debug("Payload createSupplier:", { supplierPayload });

  const { data: createdSupplier, error: supplierError } =
    await createSupplier(supplierPayload);

  if (supplierError || !createdSupplier) {
    throw new Error(supplierError?.info ?? "Error al crear el médico");
  }

  const supplierId = createdSupplier.id;
  logger.debug("Supplier creado", { supplierId });

  await delay(1000);

  logger.debug("Paso 3: Añadiendo especialidades...");

  let specialtyCodeToIdMap = new Map<string, number>();

  if (doctorForm.selectedSpecialties.length > 0) {
    const specialtyPayloads: ICreateSpecialtyBySupplierRequest[] =
      doctorForm.selectedSpecialties.map((s) => ({
        supplier_id: supplierId,
        medical_specialty_code: s.code,
      }));

    logger.debug("Payload createMultipleSpecialtiesBySupplier:", {
      specialtyPayloads,
    });

    const { data: specData, error: specError } =
      await createMultipleSpecialtiesBySupplier(specialtyPayloads);

    logger.debug("Respuesta createMultipleSpecialtiesBySupplier:", {
      specData,
    });

    if (specError) {
      logger.warn("Error parcial al asignar especialidades", {
        info: specError.info,
      });
    }

    specialtyCodeToIdMap = buildSpecialtyMapFromResponse(specData);
  }

  if (specialtyCodeToIdMap.size === 0) {
    throw new Error(
      "No se pudieron obtener los IDs de specialty_by_supplier. " +
        "Verifica que las especialidades estén correctamente asignadas e intenta nuevamente.",
    );
  }

  logger.debug("Locations seleccionadas (pendiente endpoint)", {
    locationIds: doctorForm.selectedLocationIds,
  });

  logger.debug("Paso 4-5: Creando productos y packages...");

  await persistAllPackages(supplierId, specialtyCodeToIdMap);

  emit("supplier-added");
  toast.success("Médico creado correctamente");
}

async function executeEditSubmission(supplierId: number) {
  const updatePayload: ISupplierUpdateRequest = {
    name: doctorForm.fullName.trim(),
    num_medical_enrollment: doctorForm.medicalEnrollmentCode.trim(),
    medical_type_code: doctorForm.medicalTypeCode,
  };

  logger.debug("Payload updateSupplier:", { supplierId, updatePayload });
  const { error: updateError } = await updateSupplier(
    supplierId,
    updatePayload,
  );
  if (updateError) throw new Error(updateError.info);

  const specialtyCodeToIdMap = new Map<string, number>();
  const detail = editSupplierDetail.value;

  if (detail?.services) {
    for (const svc of detail.services) {
      specialtyCodeToIdMap.set(svc.medical_specialty.code, svc.id);
    }
  }

  logger.debug("Mapa specialty_code → service_id desde editSupplierDetail", {
    map: Object.fromEntries(specialtyCodeToIdMap),
  });

  if (specialtyCodeToIdMap.size === 0) {
    throw new Error(
      "No se pudieron obtener los IDs de specialty_by_supplier desde el detalle del médico.",
    );
  }

  const currentPackIds = new Set(
    packsList.value.filter((p) => p.id !== undefined).map((p) => p.id!),
  );
  for (const pkgId of existingPackageIds.value) {
    if (!currentPackIds.has(pkgId)) {
      logger.debug("Eliminando package removido por usuario", { pkgId });
      const { error: delErr } = await deletePackage(pkgId);
      if (delErr) {
        logger.warn("Error al eliminar package", {
          packageId: pkgId,
          info: delErr.info,
        });
      }
      await delay(500);
    }
  }

  for (let i = 0; i < packsList.value.length; i++) {
    const pack = packsList.value[i];
    const specialtyId = specialtyCodeToIdMap.get(pack.specialty_code) ?? 0;

    if (specialtyId === 0) {
      throw new Error(
        `No se encontró el specialty_by_supplier ID para "${pack.specialty_code}".`,
      );
    }

    if (pack.id) {
      if (pack.productId) {
        const udcUpdatePayload: IUdcUpdateRequest = {
          name: pack.product_name?.trim() || pack.procedure_code,
          value1: String(pack.reference_price ?? 0),
          value2: String(pack.product_valoration_price ?? 0),
        };
        logger.debug(`Payload updateUdc (pack ${i + 1}):`, {
          udcUpdatePayload,
        });
        const { error: udcErr } = await updateUdc(
          pack.productId,
          udcUpdatePayload,
        );
        if (udcErr) {
          logger.warn(`Error al actualizar UDC del pack ${i + 1}`, {
            info: udcErr.info,
          });
        }
      }

      const packUpdatePayload: IPackageUpdateRequest = {
        specialty_id: specialtyId,
        procedure_code: pack.procedure_code,
        product_code: pack.product_code,
        discount: pack.apply_discount && pack.discount ? pack.discount : 0,
        reference_price: pack.reference_price ?? 0,
        services_offer: { ASSESSMENT_DETAILS: pack.services_offer ?? [] },
      };
      logger.debug(`Payload updatePackage (pack ${i + 1}):`, {
        packUpdatePayload,
      });
      const { error: updErr } = await updatePackage(pack.id, packUpdatePayload);
      if (updErr) {
        logger.warn(`Error al actualizar pack ${i + 1}`, {
          info: updErr.info,
        });
      } else {
        logger.debug(`Pack ${i + 1} actualizado exitosamente`);
      }
    } else {
      const productCode = await createProductForPackage(supplierId, pack);
      if (!productCode) {
        logger.warn(`Omitiendo pack ${i + 1}: no se pudo crear el producto`);
        continue;
      }
      await delay(1000);
      const packagePayload: IPackageCreationRequest = {
        specialty_id: specialtyId,
        procedure_code: pack.procedure_code,
        product_code: productCode,
        discount: pack.apply_discount && pack.discount ? pack.discount : 0,
        reference_price: pack.reference_price ?? 0,
        services_offer: { ASSESSMENT_DETAILS: pack.services_offer ?? [] },
        is_king: 0,
        observations: "",
        postoperative_assessments: 0,
      };
      logger.debug(`Payload createPackage (pack ${i + 1}):`, {
        packagePayload,
      });
      const { error: pkgError } = await createPackage(packagePayload);
      if (pkgError) {
        logger.warn(`Error al crear pack ${i + 1}`, { info: pkgError.info });
      } else {
        logger.debug(`Pack ${i + 1} creado exitosamente`);
      }
    }

    if (i < packsList.value.length - 1) await delay(500);
  }

  emit("supplier-updated");
  toast.success("Médico actualizado correctamente");
}

async function persistAllPackages(
  supplierId: number,
  specialtyCodeToIdMap: Map<string, number>,
) {
  for (let i = 0; i < packsList.value.length; i++) {
    const pack = packsList.value[i];

    const productCode = await createProductForPackage(supplierId, pack);

    if (!productCode) {
      logger.warn(`Omitiendo pack ${i + 1}: no se pudo crear el producto`);
      continue;
    }

    await delay(1000);

    const specialtyId = specialtyCodeToIdMap.get(pack.specialty_code) ?? 0;

    if (specialtyId === 0) {
      throw new Error(
        `No se encontró el specialty_by_supplier ID para "${pack.specialty_code}". ` +
          "Asegúrate de que la especialidad esté asignada al médico.",
      );
    }

    const packagePayload = {
      specialty_id: specialtyId,
      procedure_code: pack.procedure_code,
      product_code: productCode,
      discount: pack.apply_discount && pack.discount ? pack.discount : 0,
      reference_price: pack.reference_price ?? 0,
      services_offer: { ASSESSMENT_DETAILS: pack.services_offer ?? [] },
      is_king: 0,
      observations: "",
      postoperative_assessments: 0,
    } as IPackageCreationRequest;

    logger.debug(`Payload createPackage (pack ${i + 1}):`, { packagePayload });

    const { error: pkgError } = await createPackage(packagePayload);

    if (pkgError) {
      logger.warn(`Error al crear pack ${i + 1}`, { info: pkgError.info });
    } else {
      logger.debug(`Pack ${i + 1} creado exitosamente`);
    }

    if (i < packsList.value.length - 1) {
      await delay(1000);
    }
  }
}

async function createProductForPackage(
  supplierId: number,
  pack: PackFormItem,
): Promise<string> {
  try {
    const productName = pack.product_name?.trim() || pack.procedure_code;
    const generatedCode = generateCodeFromName(productName);
    const fatherCode =
      MEDICAL_TYPE_SPECIALTY_MAP[doctorForm.medicalTypeCode] ??
      doctorForm.medicalTypeCode;

    const payload: ICreateUdcRequest = {
      supplier_id: supplierId,
      code: generatedCode,
      father_code: fatherCode,
      name: productName,
      type: "MEDICAL_PRODUCT",
      description: `Producto médico: ${productName}`,
      value1: String(pack.reference_price ?? 0),
      value2: String(pack.product_valoration_price ?? 0),
    };

    logger.debug("Payload createUdc (producto):", { payload });

    const { data: createdUdc, error: udcError } = await createUdc(payload);

    if (udcError || !createdUdc) {
      logger.error("Error al crear producto para package", {
        info: udcError?.info,
      });
      return "";
    }

    logger.debug("Producto creado exitosamente", {
      code: createdUdc.code,
      name: createdUdc.name,
    });

    return createdUdc.code;
  } catch (err) {
    logger.error("Error inesperado al crear producto", {
      error: err instanceof Error ? err.message : "Desconocido",
    });
    return "";
  }
}

async function loadSupplierForEditing(supplierId: number) {
  isLoadingInitialData.value = true;

  try {
    const { data, error } = await getSupplierById(supplierId);

    if (error || !data) {
      toast.error(error?.info ?? "Error al cargar datos del médico");
      handleModalClose();
      return;
    }

    editSupplierDetail.value = data;
    await populateFormFromDetail(data);
    populatePacksFromDetail(data);
  } catch (err) {
    logger.error("Failed to load supplier", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    toast.error("Error al cargar datos del médico");
    handleModalClose();
  } finally {
    isLoadingInitialData.value = false;
  }
}

async function populateFormFromDetail(detail: ISupplierDetail) {
  doctorForm.documentTypeCode = detail.id_type?.code ?? "";
  doctorForm.documentNumber = detail.card_id ?? "";
  doctorForm.fullName = detail.name ?? "";
  doctorForm.medicalEnrollmentCode = detail.num_medical_enrollment ?? "";
  doctorForm.medicalTypeCode = (detail.medical_type as IUdc | null)?.code ?? "";

  doctorForm.selectedSpecialties = (detail.services ?? []).map((svc) => ({
    code: svc.medical_specialty.code,
    name: svc.medical_specialty.name,
  }));

  if (doctorForm.medicalTypeCode) {
    const fatherCode = MEDICAL_TYPE_SPECIALTY_MAP[doctorForm.medicalTypeCode];
    if (fatherCode) {
      await fetchSpecialtiesByFatherCode(fatherCode);
    }

    if (
      doctorForm.medicalTypeCode === "ODONTOLOGY" &&
      specialtiesCatalog.value.length === 0
    ) {
      await fetchSpecialtiesByType("ODONTOLOGY_SPECIALTY");
    }

    if (doctorForm.medicalTypeCode === "ODONTOLOGY") {
      const exists = specialtiesCatalog.value.some(
        (s) => s.code === ODONTOLOGY_FALLBACK.code,
      );
      if (!exists) {
        specialtiesCatalog.value.push(ODONTOLOGY_FALLBACK);
      }
    }
  }

  if (detail.locations?.length > 0) {
    doctorForm.selectedLocationIds = detail.locations.map((loc) => loc.id);
  }
}

function populatePacksFromDetail(detail: ISupplierDetail) {
  const extracted: PackFormItem[] = [];
  const ids: number[] = [];

  for (const service of detail.services ?? []) {
    for (const proc of service.procedures ?? []) {
      for (const pkg of proc.packages ?? []) {
        ids.push(pkg.id);

        const servicesOffer = pkg.services_offer as IServicesOffer | undefined;

        extracted.push({
          id: pkg.id,
          productId: pkg.product?.id,
          procedure_code: proc.procedure.code,
          product_code: pkg.product?.code ?? "",
          discount: typeof pkg.discount === "number" ? pkg.discount : null,
          reference_price: toNumericOrNull(
            pkg.product?.value1 ?? pkg.reference_price,
          ),
          services_offer: servicesOffer?.ASSESSMENT_DETAILS ?? [],
          specialty_code: service.medical_specialty.code,
          product_name: pkg.product?.name ?? "",
          product_valoration_price: toNumericOrNull(pkg.product?.value2),
          apply_discount: Boolean(pkg.discount && pkg.discount > 0),
        });
      }
    }
  }

  existingPackageIds.value = ids;
  packsList.value = extracted.length > 0 ? extracted : [createEmptyPack()];
}

function resetAndStartNew() {
  resetFormState();
  currentStep.value = STEP_DOCTOR_INFO;
  fetchAllDropdownData();
}

function resetFormState() {
  doctorForm.documentTypeCode = "";
  doctorForm.documentNumber = "";
  doctorForm.fullName = "";
  doctorForm.identityDocumentFile = null;
  doctorForm.medicalEnrollmentCode = "";
  doctorForm.medicalLicenseFile = null;
  doctorForm.medicalTypeCode = "";
  doctorForm.selectedSpecialties = [];
  doctorForm.selectedLocationIds = [];

  (Object.keys(touched) as (keyof FieldTouchedState)[]).forEach((k) => {
    touched[k] = false;
  });

  pendingSpecialtyCode.value = "";
  pendingLocationId.value = undefined;
  activePreviewPackIndex.value = 0;
  packsList.value = [createEmptyPack()];
  editSupplierDetail.value = null;
  existingPackageIds.value = [];
  specialtiesCatalog.value = [];
}

async function fetchAllDropdownData() {
  await Promise.allSettled([
    fetchUdcByType("ID_TYPE", documentTypes, isLoadingDocumentTypes),
    fetchUdcByType("MEDICAL_TYPE", medicalTypes, isLoadingMedicalTypes),
    fetchLocations(),
    fetchPreviewCatalogData(),
  ]);
}

async function fetchUdcByType(
  type: string,
  target: Ref<IUdc[]>,
  loading: Ref<boolean>,
) {
  loading.value = true;
  try {
    const { data, error } = await getAllUdcs(
      { type } as Partial<IUdcParams>,
      false,
    );
    if (error) {
      logger.error(`Failed to fetch UDC type=${type}`, { info: error.info });
      return;
    }
    target.value = data ?? [];
  } finally {
    loading.value = false;
  }
}

async function fetchSpecialtiesByFatherCode(fatherCode: string) {
  isLoadingSpecialties.value = true;
  try {
    const { data, error } = await getAllUdcs(
      { father_code: fatherCode } as Partial<IUdcParams>,
      false,
    );
    if (error) {
      logger.error("Failed to fetch specialties", {
        fatherCode,
        info: error.info,
      });
      return;
    }
    specialtiesCatalog.value = data ?? [];
  } finally {
    isLoadingSpecialties.value = false;
  }
}

async function fetchSpecialtiesByType(type: string) {
  isLoadingSpecialties.value = true;
  try {
    const { data, error } = await getAllUdcs(
      { type } as Partial<IUdcParams>,
      false,
    );
    if (error) {
      logger.error("Failed to fetch specialties by type", {
        type,
        info: error.info,
      });
      return;
    }
    specialtiesCatalog.value = data ?? [];
  } finally {
    isLoadingSpecialties.value = false;
  }
}

async function fetchLocations() {
  isLoadingLocations.value = true;
  try {
    const { data, error } = await getAllLocations();
    if (error) {
      logger.error("Failed to fetch locations", { info: error.info });
      return;
    }
    locations.value = data ?? [];
  } finally {
    isLoadingLocations.value = false;
  }
}

async function fetchPreviewCatalogData() {
  try {
    const [productsRes, assessmentRes, specialtiesRes, proceduresRes] =
      await Promise.allSettled([
        getAllUdcs({ type: "MEDICAL_PRODUCT" } as Partial<IUdcParams>, false),
        getAllUdcs({ type: "ASSESSMENT_DETAIL" } as Partial<IUdcParams>, false),
        getAllUdcs({ type: "MEDICAL_SPECIALTY" } as Partial<IUdcParams>, false),
        getAllUdcs({ type: "MEDICAL_PROCEDURE" } as Partial<IUdcParams>, false),
      ]);

    if (productsRes.status === "fulfilled" && !productsRes.value.error) {
      cachedProducts.value = productsRes.value.data ?? [];
    }
    if (specialtiesRes.status === "fulfilled" && !specialtiesRes.value.error) {
      cachedSpecialtiesUdc.value = specialtiesRes.value.data ?? [];
    }
    if (assessmentRes.status === "fulfilled" && !assessmentRes.value.error) {
      const map = new Map<string, string>();
      for (const d of assessmentRes.value.data ?? []) map.set(d.code, d.name);
      assessmentDetailsMap.value = map;
    }
    if (proceduresRes.status === "fulfilled" && !proceduresRes.value.error) {
      cachedProcedures.value = proceduresRes.value.data ?? [];
    }
  } catch (err) {
    logger.warn("Failed to load preview catalog", {
      error: err instanceof Error ? err.message : "Unknown",
    });
  }
}

watch(
  () => props.selectedSupplierForEdit,
  (newSupplier) => {
    if (isEditMode.value && newSupplier?.id && isModalVisible.value) {
      loadSupplierForEditing(newSupplier.id as number);
    }
  },
);

defineExpose({ openModal });
</script>

<style lang="scss" scoped>
.doctor-modal {
  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 1.25rem;
    line-height: 1.75rem;
    color: #353e5c;
    margin: 0;
  }

  &__body {
    padding: 1.5rem;
  }

  &__loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    min-height: 400px;
  }

  &__loading-spinner {
    width: 48px;
    height: 48px;
    border: 4px solid #e5e7eb;
    border-top-color: $color-primary;
    border-radius: 50%;
    animation: doctor-modal-spin 0.8s linear infinite;
    margin-bottom: 1.5rem;
  }

  &__loading-text {
    @include text-base;
    font-size: 1rem;
    color: $color-text-muted;
    margin: 0;
  }

  &__step-content {
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

  &__packs-section {
    min-width: 0;
  }

  &__preview-section {
    position: sticky;
    top: 1.5rem;
    height: fit-content;
    max-height: calc(100vh - 3rem);
    overflow-y: auto;
  }

  &__confirmation {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2.5rem 1.25rem;
    text-align: center;
  }

  &__confirmation-icon-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 1.25rem;
  }

  &__confirmation-icon {
    width: 3rem;
    height: 3rem;
    color: $white;
    border-radius: 50%;
    background: $primary-aqua;
    border: 0.5rem solid $primary-aqua-light;
    padding: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__confirmation-title {
    @include label-base;
    font-weight: 600;
    font-size: 1.25rem;
    color: #101828;
    margin: 0 0 0.75rem 0;
  }

  &__confirmation-description {
    @include text-base;
    font-size: 1rem;
    color: $color-text-muted;
    margin: 0;
    max-width: 25rem;
  }

  &__footer {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    width: 100%;
  }

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

  &__spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: doctor-modal-spin 0.6s linear infinite;
  }
}

.doctor-form {
  @include space-y(1.25rem);

  &__field {
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

    &--error {
      border-color: #dc2626 !important;
      background-color: #fef2f2 !important;

      &:focus {
        border-color: #dc2626 !important;
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
      }
    }
  }

  &__inline-group {
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

  &__specialty-list {
    margin-top: 0.75rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    list-style: none;
    padding: 0;
  }

  &__specialty-badge {
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
  }

  &__specialty-remove {
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

  &__error-message {
    display: block;
    color: #dc2626;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    line-height: 1.25;
  }

  &__hint {
    display: block;
    color: #6b7280;
    font-size: 0.875rem;
    margin-top: 0.5rem;
    font-style: italic;
  }
}

@keyframes doctor-modal-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
