<template>
  <div class="registro-form">
    <label class="registro-form__title">
      Esta sección hace referencia al o los médicos relacionados al contrato. En
      caso de estar el contrato a título personal (persona física) colocar sus
      datos personales
    </label>

    <!-- Médico por médico -->
    <div
      v-for="(doctor, index) in doctorsList"
      :key="index"
      class="doctor-section mb-5 border-bottom pb-4"
    >
      <h4 v-if="index > 0" class="mb-3 text-primary">
        Médico adicional #{{ index + 1 }}
      </h4>

      <!-- Checkbox para usar la misma información del paso 1 -->
      <div class="form-check" v-if="index === 0">
        <input
          v-model="doctor.useSameInfo"
          type="checkbox"
          class="form-check-input border-dark"
          :id="`sameInfoCheckbox-${index}`"
          @change="toggleSameInfo(index)"
        />
        <label class="form-check-label" :for="`sameInfoCheckbox-${index}`">
          Misma información que el paso 1
        </label>
      </div>

      <!-- Tipo y número de documento -->
      <div class="registro-form__row">
        <div class="registro-form__group">
          <label
            :for="`doctorDocumentType-${index}`"
            class="registro-form__label"
          >
            Tipo de documento de identidad
          </label>
          <select
            v-model="doctor.documentType"
            :id="`doctorDocumentType-${index}`"
            class="registro-form__input-select"
            :disabled="doctor.useSameInfo"
            required
          >
            <option value="" disabled selected>
              Seleccione tipo de documento
            </option>
            <option value="dni">DNI</option>
            <option value="passport">Pasaporte</option>
            <option value="ruc">RUC</option>
            <option value="other">Otro</option>
          </select>
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
            :disabled="doctor.useSameInfo"
            required
          />
        </div>
      </div>

      <!-- Nombre completo -->
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
          :disabled="doctor.useSameInfo"
          required
        />
      </div>

      <!-- Documento de identidad -->
      <CargarArchivos
        label="Documento de identidad"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        :id="`identityFile-${index}`"
        :inputId="`identityFileInput-${index}`"
        :uploadedFile="doctor.identityDocument"
        :fileError="doctor.identityFileError"
        :disabled="doctor.useSameInfo"
        @file-uploaded="(file) => handleIdentityFileUpload(index, file)"
        @file-removed="() => removeIdentityFile(index)"
      />

      <!-- Código de médico -->
      <div class="registro-form__group">
        <label :for="`doctorCode-${index}`" class="registro-form__label">
          Código de médico
        </label>
        <input
          v-model="doctor.doctorCode"
          type="text"
          class="registro-form__input-text"
          placeholder="Ingrese el código de médico"
          :id="`doctorCode-${index}`"
          :disabled="!isDoctorBasicInfoComplete(index)"
          required
        />
      </div>

      <!-- Carnet vigente -->
      <CargarArchivos
        label="Carnet vigente"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        :id="`medicalCardFile-${index}`"
        :inputId="`medicalCardFileInput-${index}`"
        :uploadedFile="doctor.medicalCard"
        :fileError="doctor.medicalCardError"
        :disabled="!isDoctorBasicInfoComplete(index)"
        @file-uploaded="(file) => handleMedicalCardUpload(index, file)"
        @file-removed="() => removeMedicalCard(index)"
      />

      <!-- Tipo de médico -->
      <div class="registro-form__group">
        <label :for="`doctorType-${index}`" class="registro-form__label">
          Tipo de médico
        </label>
        <select
          :id="`doctorType-${index}`"
          class="registro-form__input-select"
          v-model="doctor.doctorType"
          :disabled="!isDoctorBasicInfoComplete(index)"
          required
        >
          <option value="" disabled>Seleccione un tipo</option>
          <option value="general">Médico General</option>
          <option value="specialist">Especialista</option>
          <option value="surgeon">Cirujano</option>
        </select>
      </div>

      <!-- Especialidades -->
      <div class="registro-form__group">
        <label :for="`medicalSpecialty-${index}`" class="registro-form__label">
          Especialidad (máximo 3)
        </label>
        <select
          v-model="doctor.selectedSpecialty"
          class="registro-form__input-select"
          :disabled="
            !isDoctorBasicInfoComplete(index) || doctor.specialties.length >= 3
          "
          @change="addSpecialty(index)"
        >
          <option value="" disabled>Seleccione una especialidad</option>
          <option
            v-for="specialty in specialties"
            :key="specialty.code"
            :value="specialty"
            :disabled="
              doctor.specialties.some((s) => s.code === specialty.code)
            "
          >
            {{ specialty.name }}
          </option>
        </select>
        <div class="mt-2" v-if="doctor.specialties.length > 0">
          <span
            v-for="(specialty, specIndex) in doctor.specialties"
            :key="specIndex"
            class="badge bg-primary-subtle text-primary me-1 rounded-5"
          >
            {{ specialty.name }}
            <button
              type="button"
              class="btn-close btn-close-primary ms-1"
              aria-label="Remove"
              @click="removeSpecialty(index, specIndex)"
            ></button>
          </span>
        </div>
        <small class="text-muted" v-if="doctor.specialties.length >= 3">
          Has alcanzado el máximo de 3 especialidades
        </small>
      </div>

      <!-- Botón eliminar médico -->
      <button
        v-if="index > 0"
        @click="removeDoctor(index)"
        class="btn btn-outline-danger mb-4"
        type="button"
      >
        Eliminar médico
      </button>
    </div>

    <!-- Botón agregar otro médico -->
    <button
      @click="addNewDoctor"
      class="btn btn-primary mb-4"
      :disabled="!canAddMoreDoctors"
      type="button"
    >
      + Agregar otro médico relacionado
    </button>

    <!-- Botones de navegación -->
    <div class="navigation-buttons">
      <button @click="$emit('prev')" class="btn btn-light border-dark w-100">
        Volver Atrás
      </button>
      <button
        type="submit"
        class="btn btn-primary w-100"
        :disabled="!isFormComplete"
        @click="$emit('submit')"
      >
        Registrarme
      </button>
    </div>
  </div>
</template>

<script setup>
import CargarArchivos from "./cargar-archivos.vue";

const props = defineProps({
  doctorsList: Array,
  specialties: Array,
  canAddMoreDoctors: Boolean,
  isFormComplete: Boolean,
});

const emit = defineEmits([
  "update:doctors-list",
  "add-doctor",
  "remove-doctor",
  "toggle-same-info",
  "handle-identity-upload",
  "remove-identity-file",
  "handle-medical-card-upload",
  "remove-medical-card",
  "add-specialty",
  "remove-specialty",
  "next",
  "prev",
  "submit",
]);

// Métodos

// Toggle same info
const toggleSameInfo = (index) => {
  emit("toggle-same-info", index);
};

// Verificar si la información básica está completa
const isDoctorBasicInfoComplete = (index) => {
  const doctor = props.doctorsList[index];
  return (
    doctor.useSameInfo ||
    (doctor.documentType && doctor.documentNumber && doctor.fullName)
  );
};

// Manejo de archivos
const handleIdentityFileUpload = (index, file) => {
  emit("handle-identity-upload", index, file);
};

const removeIdentityFile = (index) => {
  emit("remove-identity-file", index);
};

const handleMedicalCardUpload = (index, file) => {
  emit("handle-medical-card-upload", index, file);
};

const removeMedicalCard = (index) => {
  emit("remove-medical-card", index);
};

// Agregar y eliminar médicos
const addNewDoctor = () => {
  emit("add-doctor");
};

const removeDoctor = (index) => {
  emit("remove-doctor", index);
};

// Especialidades
const addSpecialty = (index) => {
  emit("add-specialty", index);
};

const removeSpecialty = (index, specIndex) => {
  emit("remove-specialty", index, specIndex);
};
</script>

<style lang="scss" scoped>
.registro-form {
  & > * + * {
    margin-top: 20px;
  }

  &__title {
    @include label-base;
    font-size: 15px;
    color: #353e5c;
    font-weight: 600;
  }

  &__row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  &__group {
    flex: 1;
    & > * + * {
      margin-top: 6px;
    }
  }

  &__label {
    @include label-base;
    color: #344054;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__input-text,
  &__input-select {
    @include input-base;
    width: 100%;
  }

  &__button-next {
    @include primary-button;
    margin-top: 20px;
  }

  &__error-message {
    color: #dc2626;
    font-size: 14px;
    margin-top: 4px;
  }
}
</style>
