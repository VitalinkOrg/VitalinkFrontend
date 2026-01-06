<template>
  <AtomsModalBase
    :is-open="isOpen"
    size="large"
    :show-close-button="true"
    :close-on-backdrop="false"
    @close="handleModalClose"
  >
    <template #title>
      <h2 v-if="currentStep !== 3" class="modal-title">
        Editar médico relacionado
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
            label="Documento de identidad (opcional - solo si desea actualizar)"
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
            label="Carnet vigente (opcional - solo si desea actualizar)"
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
        <h5 class="confirmation__title">Médico actualizado exitosamente</h5>
        <p class="confirmation__description">
          Los datos del médico y sus packs han sido actualizados correctamente.
        </p>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <template v-if="currentStep === 1">
          <button
            type="button"
            class="modal-footer__button--secondary"
            @click="closeModal"
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
            :disabled="isLoadingSubmit"
            @click="handleSubmit"
          >
            <span v-if="isLoadingSubmit" class="spinner"></span>
            {{ isLoadingSubmit ? "Actualizando..." : "Actualizar médico" }}
          </button>
        </template>

        <template v-if="currentStep === 3">
          <button
            type="button"
            class="modal-footer__button--primary modal-footer__button--full"
            @click="handleCloseAfterSuccess"
          >
            Cerrar
          </button>
        </template>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useDocuments, useSupplier, useUdc } from "@/composables/api";
import { usePackage } from "@/composables/api/usePackage";
import { useSpecialties } from "@/composables/api/useSpecialties";
import type { IRelatedMedicalFormData, IUdc } from "@/types";
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
  id?: number;
  name: string;
  producto: string;
  servicios: string;
  precio: number;
  moneda: string;
  costoValoracion: number;
  monedaValoracion: string;
  disponibilidad: DayAvailability[];
}

interface Props {
  doctor: IRelatedMedicalFormData | null;
}

interface Emits {
  (e: "doctor-updated"): void;
  (e: "close"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { fetchUdc } = useUdc();
const { uploadDocument } = useDocuments();
const { updateSupplier } = useSupplier();
const {
  fetchSpecialtiesBySupplier,
  addMultipleSpecialties,
  deleteSpecialtyFromSupplier,
} = useSpecialties();
const {
  fetchPackagesBySupplierId,
  createPackage: createPackageAPI,
  updatePackage: updatePackageAPI,
  deletePackage: deletePackageAPI,
} = usePackage();
const { getToken } = useAuthToken();
const { getUserInfo } = useUserInfo();

const weekDays = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

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
const originalCodeCardId = ref<string>("");
const originalCodeMedicalLicense = ref<string>("");

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
    formData.value.medicalCode &&
    formData.value.medicalType &&
    formData.value.specialties.length > 0
  );
});

const openModal = async (doctor: IRelatedMedicalFormData) => {
  formData.value = {
    id: doctor.id,
    documentType: doctor.documentType,
    documentNumber: doctor.documentNumber,
    fullName: doctor.fullName,
    identityDocumentFile: null,
    medicalCode: doctor.medicalCode,
    validLicenseFile: null,
    medicalType: doctor.medicalType,
    specialties: [...doctor.specialties],
  };

  originalCodeCardId.value = doctor.codeCardIdFile || "";
  originalCodeMedicalLicense.value = doctor.codeMedicalLicenseFile || "";

  await loadDoctorPacks(doctor.id);

  isOpen.value = true;
  currentStep.value = 1;
  errorMessage.value = "";
};

const closeModal = () => {
  isOpen.value = false;
  currentStep.value = 1;
  emit("close");
};

const handleModalClose = () => {
  if (currentStep.value === 3) {
    handleCloseAfterSuccess();
  } else {
    closeModal();
  }
};

const handleCloseAfterSuccess = () => {
  emit("doctor-updated");
  closeModal();
};

const goToStep = (step: number) => {
  errorMessage.value = "";
  currentStep.value = step;
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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const loadDoctorPacks = async (doctorId?: number) => {
  if (!doctorId) {
    packs.value = [];
    return;
  }

  try {
    const api = fetchPackagesBySupplierId(doctorId);
    await api.request();

    if (api.response.value?.data) {
      packs.value = api.response.value.data.map((pack) => ({
        id: pack.id,
        name: pack.product?.name || "",
        producto: pack.product?.name || "",
        servicios: Array.isArray(pack.services_offer?.ASSESSMENT_DETAILS)
          ? pack.services_offer.ASSESSMENT_DETAILS.join(", ")
          : "",
        precio: pack.discounted_price || pack.reference_price || 0,
        moneda: "CRC",
        costoValoracion: 0,
        monedaValoracion: "CRC",
        disponibilidad: weekDays.map(() => ({
          active: false,
          timeSlots: [{ from: "", to: "" }],
        })),
      }));
    }
  } catch (error) {
    console.error("❌ Error cargando packs:", error);
    packs.value = [];
  }
};

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

  return code;
};

const handleUpdateSpecialties = async (
  supplierId: number,
  newSpecialties: any[],
  token: string
) => {
  try {
    const currentApi = fetchSpecialtiesBySupplier(supplierId);
    await currentApi.request();

    if (currentApi.response.value?.data) {
      for (const specialty of currentApi.response.value.data) {
        const deleteApi = deleteSpecialtyFromSupplier(specialty.id);
        await deleteApi.request();
      }
    }

    await delay(500);

    const specialtyCodes = newSpecialties.map((s) => s.code);
    const addApi = addMultipleSpecialties({
      supplier_id: supplierId,
      medical_specialty_codes: specialtyCodes,
    });

    await addApi.request();

    if (addApi.error.value) {
      throw new Error("Error agregando especialidades");
    }
  } catch (error) {
    console.error("❌ Error actualizando especialidades:", error);
    throw error;
  }
};

const handleUpdatePacks = async (supplierId: number, token: string) => {
  const existingApi = fetchPackagesBySupplierId(supplierId);
  await existingApi.request();

  const existingPackIds =
    existingApi.response.value?.data?.map((p) => p.id) || [];

  for (const pack of packs.value) {
    try {
      const servicesArray = pack.servicios
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);

      const packageData: any = {
        specialty_id: formData.value.specialties[0]?.id || 1,
        procedure_code: "MEDICAL_CONSULTATION",
        product_code: "MEDICAL_CONSULTATION",
        discount: 0,
        services_offer: {
          ASSESSMENT_DETAILS: servicesArray,
        },
        is_king: 0,
        observations: pack.producto,
        postoperative_assessments: 0,
      };

      if (pack.id && existingPackIds.includes(pack.id)) {
        const api = updatePackageAPI(pack.id, packageData);
        await api.request();

        if (api.error.value) {
          throw new Error(`Error actualizando pack: ${pack.name}`);
        }
      } else {
        const api = createPackageAPI(packageData);
        await api.request();

        if (api.error.value) {
          throw new Error(`Error creando pack: ${pack.name}`);
        }
      }
    } catch (error) {
      console.error("❌ Error procesando pack:", error);
      throw error;
    }
  }

  const currentPackIds = packs.value.filter((p) => p.id).map((p) => p.id!);
  const packsToDelete = existingPackIds.filter(
    (id) => !currentPackIds.includes(id)
  );

  for (const packId of packsToDelete) {
    const deleteApi = deletePackageAPI(packId);
    await deleteApi.request();
  }
};

const handleSubmit = async () => {
  if (!isStep1Complete.value || isLoadingSubmit.value) return;

  try {
    isLoadingSubmit.value = true;
    errorMessage.value = "";

    const token = getToken();
    if (!token) {
      throw new Error("No se encontró token de autenticación");
    }

    if (!formData.value.id) {
      throw new Error("ID del médico no disponible");
    }

    let codeCardIdFile = originalCodeCardId.value;
    let codeMedicalLicenseFile = originalCodeMedicalLicense.value;

    if (formData.value.identityDocumentFile) {
      codeCardIdFile = await handleUploadFile(
        formData.value.identityDocumentFile,
        "PERSONAL_DOCUMENT",
        5
      );
      await delay(500);
    }

    if (formData.value.validLicenseFile) {
      codeMedicalLicenseFile = await handleUploadFile(
        formData.value.validLicenseFile,
        "PERSONAL_DOCUMENT",
        5
      );
      await delay(500);
    }

    const payload: Partial<CreateSupplier> = {};

    if (formData.value.fullName) {
      payload.name = formData.value.fullName.trim();
    }

    if (formData.value.documentNumber) {
      payload.card_id = formData.value.documentNumber;
    }

    if (formData.value.documentType) {
      payload.id_type = formData.value.documentType;
    }

    if (formData.value.medicalType) {
      payload.medical_type_code = formData.value.medicalType;
    }

    if (formData.value.medicalCode) {
      payload.num_medical_enrollment = formData.value.medicalCode;
    }

    if (codeCardIdFile) {
      payload.code_card_id_file = codeCardIdFile;
    }

    if (codeMedicalLicenseFile) {
      payload.code_medical_license_file = codeMedicalLicenseFile;
    }

    const api = updateSupplier(formData.value.id, payload, token);
    await api.request();

    if (api.error.value) {
      console.error("❌ Error del servidor:", api.error.value);
      throw new Error("Error actualizando médico");
    }

    await delay(500);

    if (formData.value.specialties.length > 0) {
      await handleUpdateSpecialties(
        formData.value.id,
        formData.value.specialties,
        token
      );
    }

    await delay(500);

    if (packs.value.length > 0) {
      await handleUpdatePacks(formData.value.id, token);
    }

    currentStep.value = 3;
  } catch (error) {
    console.error("❌ Error en el proceso de actualización:", error);
    errorMessage.value =
      error instanceof Error
        ? error.message
        : "Error al actualizar el médico. Intenta nuevamente.";
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

defineExpose({
  openModal,
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
  justify-content: flex-end;
  gap: 0.75rem;

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
