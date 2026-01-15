<template>
  <div class="registro-form">
    <label class="registro-form__title">
      Esta sección hace referencia al o los médicos relacionados al contrato. En
      caso de estar el contrato a título personal (persona física) colocar sus
      datos personales
    </label>

    <div
      v-for="(doctor, index) in localRelatedMedicalFormData"
      :key="index"
      class="registro-form__doctor-section doctor-section"
    >
      <h4 v-if="index > 0" class="doctor-section__title">
        Médico adicional #{{ index + 1 }}
      </h4>

      <div class="registro-form__row">
        <div class="registro-form__group">
          <label
            :for="`doctorDocumentType-${index}`"
            class="registro-form__label"
          >
            Tipo de documento de identidad
            <AtomsIconsInfoIcon
              size="20"
              class="icon icon-tabler icons-tabler-outline icon-tabler-info-circle tooltip-trigger"
            />
          </label>
          <UiDropdownBase
            :model-value="doctor.documentType"
            :loading="isLoadingDocumentTypes"
            :items="
              documentTypeOptions.map((s) => ({ value: s.code, label: s.name }))
            "
            placeholder="Seleccione tipo de documento"
            :disabled="isLoadingSubmit"
            @update:model-value="
              updateRelatedMedicalFormData(index, {
                documentType: ($event as string) ?? '',
              })
            "
          />
        </div>
        <div class="registro-form__group">
          <label
            :for="`doctorDocumentNumber-${index}`"
            class="registro-form__label"
          >
            Número de documento:
          </label>
          <input
            v-model="doctor.documentNumber"
            type="text"
            class="registro-form__input-text"
            placeholder="Ingrese su número de documento"
            :id="`doctorDocumentNumber-${index}`"
            :disabled="isLoadingSubmit"
            required
            @input="
              updateRelatedMedicalFormData(index, {
                documentNumber: doctor.documentNumber,
              })
            "
          />
        </div>
      </div>

      <div class="registro-form__group">
        <label :for="`doctorFullName-${index}`" class="registro-form__label">
          Nombre y Apellidos
        </label>
        <input
          v-model="doctor.fullName"
          type="text"
          class="registro-form__input-text"
          placeholder="Ingrese nombre completo"
          :id="`doctorFullName-${index}`"
          :disabled="isLoadingSubmit"
          required
          @input="
            updateRelatedMedicalFormData(index, { fullName: doctor.fullName })
          "
        />
      </div>

      <MedicosRegistroCargarArchivos
        label="Documento de identidad"
        accept=".pdf,.doc,.docx"
        :id="`identityFile-${index}`"
        :inputId="`identityFileInput-${index}`"
        :uploadedFile="doctor.identityDocumentFile"
        :disabled="isLoadingSubmit"
        @update:file="
          updateRelatedMedicalFormData(index, { identityDocumentFile: $event })
        "
      />

      <div class="registro-form__group">
        <label :for="`doctorCode-${index}`" class="registro-form__label">
          Código de médico
        </label>
        <input
          v-model="doctor.medicalCode"
          type="text"
          class="registro-form__input-text"
          placeholder="Ingrese el código de médico"
          :id="`doctorCode-${index}`"
          required
          :disabled="isLoadingSubmit"
          @input="
            updateRelatedMedicalFormData(index, {
              medicalCode: doctor.medicalCode,
            })
          "
        />
      </div>

      <MedicosRegistroCargarArchivos
        label="Carnet vigente"
        accept=".pdf,.doc,.docx"
        :id="`identityDocumentFile-${index}`"
        :inputId="`identityDocumentFileInput-${index}`"
        :uploadedFile="doctor.validLicenseFile"
        :disabled="isLoadingSubmit"
        @update:file="
          updateRelatedMedicalFormData(index, { validLicenseFile: $event })
        "
      />

      <div class="registro-form__group">
        <label :for="`doctorType-${index}`" class="registro-form__label">
          Tipo de médico
        </label>
        <UiDropdownBase
          :model-value="doctor.medicalType"
          :loading="isLoadingMedicalTypes"
          :items="medicalTypes.map((s) => ({ value: s.code, label: s.name }))"
          placeholder="Seleccione tipo de médico"
          @update:model-value="
            updateRelatedMedicalFormData(index, {
              medicalType: $event as string,
            })
          "
          :disabled="isLoadingSubmit"
        />
      </div>

      <div class="registro-form__group">
        <label :for="`medicalSpecialty-${index}`" class="registro-form__label">
          Especialidad (máximo 3)
        </label>
        <div class="registro-form__input-group">
          <UiDropdownBase
            :model-value="selectedSpecialty"
            :loading="isLoadingSpecialties"
            :items="specialties.map((s) => ({ value: s.code, label: s.name }))"
            placeholder="Seleccione especialidad"
            @update:model-value="selectedSpecialty = $event as string"
            :disabled="isLoadingSubmit"
          />
          <button
            type="button"
            class="registro-form__input-button"
            :disabled="
              !selectedSpecialty ||
              doctor.specialties.length >= 3 ||
              doctor.specialties.some((s) => s.code === selectedSpecialty) ||
              isLoadingSubmit
            "
            @click="addSpecialty(index)"
          >
            Agregar otra especialidad
          </button>
        </div>
        <div
          class="registro-form__specialties-container"
          v-if="doctor.specialties.length > 0"
        >
          <span
            v-for="(specialty, specIndex) in doctor.specialties"
            :key="specIndex"
            class="registro-form__specialty-badge specialty-badge"
          >
            {{ specialty.name }}
            <button
              type="button"
              class="specialty-badge__remove-button"
              aria-label="Remove"
              @click="removeSpecialty(index, specIndex)"
              :disabled="isLoadingSubmit"
            >
              <AtomsIconsXIcon size="12" />
            </button>
          </span>
        </div>
        <small
          class="registro-form__specialties-limit"
          v-if="doctor.specialties.length >= 3"
        >
          Has alcanzado el máximo de 3 especialidades
        </small>
      </div>

      <button
        v-if="index > 0"
        @click="removeDoctor(index)"
        class="registro-form__remove-doctor-button"
        type="button"
        :disabled="isLoadingSubmit"
      >
        Eliminar médico
      </button>
    </div>

    <button
      @click="addNewDoctor"
      class="registro-form__add-button"
      type="button"
      :disabled="isLoadingSubmit"
    >
      + Agregar otro médico relacionado
    </button>

    <div class="registro-form__navigation navigation-buttons">
      <button
        @click="$emit('prev')"
        class="navigation-buttons__button navigation-buttons__button--secondary"
        :disabled="isLoadingSubmit"
      >
        <AtomsIconsArrowLeftIcon size="20" />
        Volver Atrás
      </button>
      <button
        type="submit"
        class="navigation-buttons__button navigation-buttons__button--primary"
        :disabled="!isFormComplete || isLoadingSubmit"
        @click="handleSubmit"
      >
        Enviar formulario
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUdc } from "@/composables/api";
import type { IRelatedMedicalFormData, IUdc } from "@/types";

interface Props {
  relatedMedicalFormData: IRelatedMedicalFormData[];
  loading?: boolean;
}

interface Emits {
  (
    e: "updateRelatedMedicalFormData",
    index: number,
    newData: Partial<IRelatedMedicalFormData> | null
  ): void;
  (e: "prev"): void;
  (e: "submit"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { fetchUdc } = useUdc();

const documentTypeOptions = ref<IUdc[]>([]);
const isLoadingDocumentTypes = ref<boolean>(false);
const isLoadingMedicalTypes = ref<boolean>(false);
const isLoadingSpecialties = ref<boolean>(false);
const isLoadingSubmit = ref<boolean>(false);
const localRelatedMedicalFormData = ref<IRelatedMedicalFormData[]>([
  ...props.relatedMedicalFormData,
]);
const medicalTypes = ref<IUdc[]>([]);
const selectedSpecialty = ref<string>("");
const specialties = ref<IUdc[]>([]);

const isFormComplete = computed(() => {
  return localRelatedMedicalFormData.value.every((_, index) =>
    isDoctorComplete(index)
  );
});

watch(
  () => props.relatedMedicalFormData,
  (newData) => {
    localRelatedMedicalFormData.value = [...newData];
  },
  { deep: true }
);

watch(
  () => props.loading,
  (newVal) => {
    isLoadingSubmit.value = newVal ?? false;
  },
  { immediate: true }
);

const handleSubmit = () => {
  if (props.loading) return;
  emit("submit");
};

const addNewDoctor = () => {
  if (localRelatedMedicalFormData.value.length < 3) {
    const newDoctor: IRelatedMedicalFormData = {
      documentType: "",
      documentNumber: "",
      fullName: "",
      identityDocumentFile: null,
      medicalCode: "",
      validLicenseFile: null,
      medicalType: "",
      specialties: [],
    };
    localRelatedMedicalFormData.value.push(newDoctor);
    emit(
      "updateRelatedMedicalFormData",
      localRelatedMedicalFormData.value.length - 1,
      newDoctor
    );
  }
};

const addSpecialty = (index: number) => {
  if (!selectedSpecialty.value) return;
  const doctor = localRelatedMedicalFormData.value[index];
  const specialtyToAdd = specialties.value.find(
    (s) => s.code === selectedSpecialty.value
  );
  if (
    specialtyToAdd &&
    !doctor.specialties.some((s) => s.code === specialtyToAdd.code) &&
    doctor.specialties.length < 3
  ) {
    const updatedSpecialties = [...doctor.specialties, specialtyToAdd];
    updateRelatedMedicalFormData(index, { specialties: updatedSpecialties });
    selectedSpecialty.value = "";
  }
};

const isDoctorComplete = (index: number) => {
  const doctor = localRelatedMedicalFormData.value[index];
  return (
    doctor.documentType &&
    doctor.documentNumber &&
    doctor.fullName &&
    doctor.identityDocumentFile &&
    doctor.medicalCode &&
    doctor.validLicenseFile &&
    doctor.medicalType &&
    doctor.specialties.length > 0
  );
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
  } finally {
    isLoadingSpecialties.value = false;
  }
};

const removeDoctor = (index: number) => {
  if (index > 0 && index < localRelatedMedicalFormData.value.length) {
    localRelatedMedicalFormData.value.splice(index, 1);
    emit("updateRelatedMedicalFormData", index, null);
  }
};

const removeSpecialty = (doctorIndex: number, specialtyIndex: number) => {
  const doctor = localRelatedMedicalFormData.value[doctorIndex];
  const updatedSpecialties = [...doctor.specialties];
  updatedSpecialties.splice(specialtyIndex, 1);
  updateRelatedMedicalFormData(doctorIndex, {
    specialties: updatedSpecialties,
  });
};

const updateRelatedMedicalFormData = (
  index: number,
  newData: Partial<IRelatedMedicalFormData>
) => {
  if (index >= 0 && index < localRelatedMedicalFormData.value.length) {
    localRelatedMedicalFormData.value[index] = {
      ...localRelatedMedicalFormData.value[index],
      ...newData,
    };
    emit("updateRelatedMedicalFormData", index, newData);
  }
};

onMounted(async () => {
  await loadIdType();
  await loadSpecialties();
  await loadMedicalTypes();
});
</script>

<style lang="scss" scoped>
.registro-form {
  @include space-y(1.25rem);

  &__title {
    @include label-base;
    font-size: 0.9375rem;
    color: #353e5c;
    font-weight: 600;
  }

  &__doctor-section {
    @include space-y(1.25rem);
  }

  &__row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;

    @media (max-width: $breakpoint-md) {
      flex-direction: column;
    }
  }

  &__add-button {
    @include primary-button;
    margin-top: 0.625rem;
  }

  &__remove-doctor-button {
    @include outline-danger-button;
    margin-top: 0.625rem;
    padding: 0.625rem 0.875rem;
  }

  &__group {
    flex: 1;
    @include space-y(0.375rem);
  }

  &__input-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    select {
      flex: 1;
    }
  }

  &__input-button {
    @include button-base;
    padding: 0;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.25rem;
    letter-spacing: 0;
    color: $color-primary;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__specialties-container {
    margin-top: 0.5rem;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  &__specialty-badge {
    @extend .specialty-badge;
  }

  &__specialties-limit {
    display: block;
    color: #6b7280;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  &__label {
    @include label-base;
    color: #344054;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    svg {
      width: 1.125rem;
      height: 1.125rem;
      fill: #344054;
      margin-right: 0.25rem;
    }
  }

  &__input-text,
  &__input-select {
    @include input-base;
    width: 100%;
  }

  &__button-next {
    @include primary-button;
    margin-top: 1.25rem;
  }

  &__error-message {
    color: #dc2626;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  &__navigation {
    @extend .navigation-buttons;
  }
}

.doctor-section {
  &__title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 1rem;
  }
}

.specialty-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background-color: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;

  &__remove-button {
    @include button-base;
    cursor: pointer;
    color: $color-primary;
    font-size: 1rem;
    line-height: 1;
    margin-left: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
    flex-shrink: 0;
    padding: 0.25rem;

    &:hover {
      background-color: #1d4ed8;
      color: $white;
    }
  }
}

.navigation-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;

  &__button {
    @include button-base;
    padding: 0.75rem 1.5rem;
    border-radius: 0.25rem;
    font-weight: 500;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &--secondary {
      @include outline-button;
    }

    &--primary {
      @include primary-button;
    }
  }
}
</style>
