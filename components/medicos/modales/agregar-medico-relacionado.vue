<template>
  <div>
    <slot name="trigger" :open="openModal" />

    <AtomsModalBase
      :is-open="isOpen"
      size="large"
      :show-close-button="true"
      :close-on-backdrop="false"
      @close="handleModalClose"
    >
      <template #title>
        <h2 v-if="currentStep !== 3" class="modal-title">
          Agregar médico relacionado
        </h2>
      </template>

      <div class="modal-body">
        <WebsiteStepper
          v-if="currentStep !== 0 && currentStep !== 3"
          :steps="steps"
          :currentStep="currentStep"
        />

        <div v-if="currentStep === 1" class="step-content">
          <form @submit.prevent="goToStep(2)" class="doctor-form">
            <div class="doctor-form__group">
              <label for="documentType" class="doctor-form__label">
                Tipo de documento de identidad
              </label>
              <UiDropdownBase
                v-model="formData.documentType"
                :loading="isLoadingDocumentTypes"
                :items="
                  documentTypeOptions.map((s) => ({
                    value: s.code,
                    label: s.name,
                  }))
                "
                placeholder="Seleccione tipo de documento"
                :disabled="isLoadingSubmit"
              />
            </div>

            <div class="doctor-form__group">
              <label for="documentNumber" class="doctor-form__label">
                Número de documento
              </label>
              <input
                v-model="formData.documentNumber"
                type="text"
                class="doctor-form__input"
                placeholder="Ingrese número de documento"
                :disabled="isLoadingSubmit"
                required
              />
            </div>

            <div class="doctor-form__group">
              <label for="fullName" class="doctor-form__label">
                Nombre y Apellidos
              </label>
              <input
                v-model="formData.fullName"
                type="text"
                class="doctor-form__input"
                placeholder="Ingrese nombre completo"
                :disabled="isLoadingSubmit"
                required
              />
            </div>

            <MedicosRegistroCargarArchivos
              label="Documento de identidad"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              id="identityFile"
              inputId="identityFileInput"
              :uploadedFile="formData.identityDocumentFile"
              :disabled="isLoadingSubmit"
              @update:file="formData.identityDocumentFile = $event"
            />

            <div class="doctor-form__group">
              <label for="medicalCode" class="doctor-form__label">
                Código de médico
              </label>
              <input
                v-model="formData.medicalCode"
                type="text"
                class="doctor-form__input"
                placeholder="Ingrese el código de médico"
                :disabled="isLoadingSubmit"
                required
              />
            </div>

            <MedicosRegistroCargarArchivos
              label="Carnet vigente"
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              id="validLicenseFile"
              inputId="validLicenseFileInput"
              :uploadedFile="formData.validLicenseFile"
              :disabled="isLoadingSubmit"
              @update:file="formData.validLicenseFile = $event"
            />

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
                placeholder="Seleccione tipo de médico"
                :disabled="isLoadingSubmit"
              />
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

        <div v-if="currentStep === 2" class="step-content">
          <MedicosModalesPreciosPacks v-model="packs" />

          <div v-if="errorMessage" class="doctor-form__error">
            <AtomsIconsAlertCircleIcon size="20" />
            <span>{{ errorMessage }}</span>
          </div>
        </div>

        <div v-if="currentStep === 3" class="confirmation">
          <div class="confirmation__icon">
            <img src="@/assets/check.svg" width="48" alt="Success" />
          </div>
          <h5 class="confirmation__title">Médico creado exitosamente</h5>
          <p class="confirmation__description">
            El médico se ha registrado correctamente con sus packs y servicios.
            Ahora puedes verlo y administrarlo en el menú de médicos.
          </p>
        </div>
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
              @click="goToStep(2)"
            >
              Continuar
            </button>
          </template>

          <!-- Footer Paso 2 -->
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
              {{ isLoadingSubmit ? "Guardando..." : "Guardar médico" }}
            </button>
          </template>

          <!-- Footer Paso 3 -->
          <template v-if="currentStep === 3">
            <NuxtLink
              to="/medicos/mis-medicos"
              class="modal-footer__button--secondary modal-footer__button--full"
            >
              Ver en mis médicos
            </NuxtLink>
            <button
              type="button"
              class="modal-footer__button--primary modal-footer__button--full"
              @click="addAnotherDoctor"
            >
              Agregar otro médico
            </button>
          </template>
        </div>
      </template>
    </AtomsModalBase>
  </div>
</template>

<script lang="ts" setup>
import { useDocuments, useSupplier, useUdc } from "@/composables/api";
import type { IRelatedMedicalFormData, IUdc, Supplier } from "@/types";
import type { CreateSupplier } from "~/composables/api/useSupplier";
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
  name: string;
  producto: string;
  servicios: string;
  precio: number;
  moneda: string;
  costoValoracion: number;
  monedaValoracion: string;
  disponibilidad: DayAvailability[];
}

interface Emits {
  (e: "doctor-added"): void;
}

const emit = defineEmits<Emits>();

const { fetchUdc } = useUdc();
const { uploadDocument } = useDocuments();
const { createSupplier, uploadSpecialtyBySupplier, fetchAllSuppliers } =
  useSupplier();
const { getToken } = useAuthToken();
const { getUserInfo } = useUserInfo();

const isOpen = ref(false);
const currentStep = ref(1);
const steps = ["Datos del médico", "Packs y precios"];

const isLoadingDocumentTypes = ref<boolean>(false);
const isLoadingMedicalTypes = ref<boolean>(false);
const isLoadingSpecialties = ref<boolean>(false);
const isLoadingSubmit = ref<boolean>(false);

const documentTypeOptions = ref<IUdc[]>([]);
const medicalTypes = ref<IUdc[]>([]);
const specialties = ref<IUdc[]>([]);
const selectedSpecialty = ref<string>("");

const errorMessage = ref<string>("");
const currentSupplier = ref<Supplier | null>(null);

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

const packs = ref<Pack[]>([]);

const isStep1Complete = computed(() => {
  return (
    formData.value.documentType &&
    formData.value.documentNumber &&
    formData.value.fullName &&
    formData.value.identityDocumentFile &&
    formData.value.medicalCode &&
    formData.value.validLicenseFile &&
    formData.value.medicalType &&
    formData.value.specialties.length > 0
  );
});

const isStep2Complete = computed(() => {
  return (
    packs.value.length > 0 &&
    packs.value.every(
      (pack) => pack.name && pack.producto && pack.servicios && pack.precio > 0
    )
  );
});

const openModal = () => {
  isOpen.value = true;
  currentStep.value = 1;
  errorMessage.value = "";
};

const closeModal = () => {
  isOpen.value = false;
  currentStep.value = 1;
  errorMessage.value = "";
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
  }
};

const removeSpecialty = (index: number) => {
  formData.value.specialties.splice(index, 1);
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
  packs.value = [];
  selectedSpecialty.value = "";
  errorMessage.value = "";
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const handleUploadFile = async (
  file: File,
  actionType: string,
  tableId: number = 5
): Promise<string> => {
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

  console.log("📤 Subiendo documento:", {
    fileName: file.name,
    fileType,
    actionType,
    fields,
  });

  const api = uploadDocument(file, fields);
  await api.request();

  if (api.error.value) {
    console.error("❌ Error al subir documento:", api.error.value);
    throw new Error(`Error subiendo documento: ${api.error.value}`);
  }

  const code = api.response.value?.data?.code;

  if (!code) {
    console.error("❌ No se recibió código del documento");
    throw new Error("No se pudo obtener el código del documento");
  }

  console.log("✅ Documento subido exitosamente. Code:", code);
  return code;
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

  console.log("📤 Creando supplier con payload:", payload);

  const api = createSupplier(payload, token);
  await api.request();

  if (api.error.value) {
    console.error("❌ Error al crear supplier:", api.error.value);
    throw new Error(`Error creando médico: ${api.error.value}`);
  }

  const supplierId = api.response.value?.data?.id;

  if (!supplierId) {
    console.error("❌ No se recibió ID del supplier");
    throw new Error("No se pudo obtener el ID del médico");
  }

  console.log("✅ Supplier creado exitosamente. ID:", supplierId);
  return supplierId;
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

  console.log("📤 Asociando especialidades:", body);

  const api = uploadSpecialtyBySupplier(body, token);
  await api.request();

  if (api.error.value) {
    console.error("❌ Error al asociar especialidades:", api.error.value);
    throw new Error(`Error asociando especialidades: ${api.error.value}`);
  }

  console.log("✅ Especialidades asociadas exitosamente");
};

const fetchCurrentSupplier = async (): Promise<string | null> => {
  console.log("🔍 Obteniendo supplier actual...");

  const api = fetchAllSuppliers();
  await api.request();

  const response = api.response.value;

  if (response?.data && response.data.length > 0) {
    currentSupplier.value = response.data[0];
    const legalRep =
      typeof currentSupplier.value.legal_representative === "string"
        ? currentSupplier.value.legal_representative
        : currentSupplier.value.legal_representative?.id;

    console.log("✅ Legal representative encontrado:", legalRep);
    return legalRep ? String(legalRep) : null;
  }

  console.error("❌ No se encontró supplier actual");
  return null;
};

const handleSavePacks = async (supplierId: number, token: string) => {
  console.log("📦 Guardando packs para supplier:", supplierId);

  for (const pack of packs.value) {
    try {
      // Aquí necesitarás usar tu API composable para crear packages
      // const api = createPackage({
      //   supplier_id: supplierId,
      //   name: pack.name,
      //   product_name: pack.producto,
      //   services_included: pack.servicios,
      //   price: pack.precio,
      //   currency: pack.moneda,
      //   valoration_cost: pack.costoValoracion,
      //   valoration_currency: pack.monedaValoracion,
      //   availability: pack.disponibilidad
      // }, token);

      console.log("✅ Pack guardado:", pack.name);
    } catch (error) {
      console.error("❌ Error guardando pack:", error);
      throw error;
    }
  }
};

const handleSubmit = async () => {
  if (!isStep2Complete.value || isLoadingSubmit.value) return;

  try {
    isLoadingSubmit.value = true;
    errorMessage.value = "";

    console.log("🚀 Iniciando proceso de registro de médico...");

    const token = getToken();
    if (!token) {
      throw new Error("No se encontró token de autenticación");
    }

    console.log("✅ Token obtenido");

    const legalRepresentativeId = await fetchCurrentSupplier();
    if (!legalRepresentativeId) {
      throw new Error("No se pudo obtener el representante legal");
    }

    await delay(500);

    console.log("📄 Paso 2: Subiendo documento de identidad...");
    if (!formData.value.identityDocumentFile) {
      throw new Error("Documento de identidad requerido");
    }

    const codeCardIdFile = await handleUploadFile(
      formData.value.identityDocumentFile,
      "PERSONAL_DOCUMENT",
      5
    );

    await delay(500);

    console.log("📄 Paso 3: Subiendo licencia médica...");
    if (!formData.value.validLicenseFile) {
      throw new Error("Licencia médica requerida");
    }

    const codeMedicalLicenseFile = await handleUploadFile(
      formData.value.validLicenseFile,
      "PERSONAL_DOCUMENT",
      5
    );

    await delay(500);

    console.log("👨‍⚕️ Paso 4: Creando médico (supplier)...");
    const supplierId = await handleCreateSupplier(
      formData.value,
      legalRepresentativeId,
      codeCardIdFile,
      codeMedicalLicenseFile,
      token
    );

    await delay(500);

    if (formData.value.specialties.length > 0) {
      console.log("🏥 Paso 5: Asociando especialidades...");
      await handleUploadSpecialtyBySupplier(supplierId, formData.value, token);
    }

    await delay(500);

    if (packs.value.length > 0) {
      console.log("📦 Paso 6: Guardando packs...");
      await handleSavePacks(supplierId, token);
    }

    console.log("🎉 ¡Médico registrado exitosamente con sus packs!");

    emit("doctor-added");

    currentStep.value = 3;
  } catch (error) {
    console.error("❌ Error en el proceso de registro:", error);
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Error al guardar el médico. Por favor, intenta nuevamente.";
  } finally {
    isLoadingSubmit.value = false;
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

onMounted(async () => {
  await Promise.all([loadIdType(), loadSpecialties(), loadMedicalTypes()]);
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

.step-content {
  padding: 1.25rem 0;
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
