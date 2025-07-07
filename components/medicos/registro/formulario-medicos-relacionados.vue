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
      class="registro-form__doctor-section doctor-section"
    >
      <h4 v-if="index > 0" class="doctor-section__title">
        Médico adicional #{{ index + 1 }}
      </h4>

      <!-- Checkbox para usar la misma información del paso 1 -->
      <div class="doctor-section__checkbox checkbox-group" v-if="index === 0">
        <input
          v-model="doctor.useSameInfo"
          type="checkbox"
          class="form-check-input"
          :id="`sameInfoCheckbox-${index}`"
          @change="toggleSameInfo(index)"
        />
        <label class="checkbox-group__label" :for="`sameInfoCheckbox-${index}`">
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              x="0px"
              y="0px"
              width="100"
              height="100"
              viewBox="0 0 24 24"
            >
              <path
                d="M 12 0 C 5.371094 0 0 5.371094 0 12 C 0 18.628906 5.371094 24 12 24 C 18.628906 24 24 18.628906 24 12 C 24 5.371094 18.628906 0 12 0 Z M 12 2 C 17.523438 2 22 6.476563 22 12 C 22 17.523438 17.523438 22 12 22 C 6.476563 22 2 17.523438 2 12 C 2 6.476563 6.476563 2 12 2 Z M 12 5.8125 C 11.816406 5.8125 11.664063 5.808594 11.5 5.84375 C 11.335938 5.878906 11.183594 5.96875 11.0625 6.0625 C 10.941406 6.15625 10.851563 6.285156 10.78125 6.4375 C 10.710938 6.589844 10.6875 6.769531 10.6875 7 C 10.6875 7.226563 10.710938 7.40625 10.78125 7.5625 C 10.851563 7.71875 10.941406 7.84375 11.0625 7.9375 C 11.183594 8.03125 11.335938 8.085938 11.5 8.125 C 11.664063 8.164063 11.816406 8.1875 12 8.1875 C 12.179688 8.1875 12.371094 8.164063 12.53125 8.125 C 12.691406 8.085938 12.816406 8.03125 12.9375 7.9375 C 13.058594 7.84375 13.148438 7.71875 13.21875 7.5625 C 13.289063 7.410156 13.34375 7.226563 13.34375 7 C 13.34375 6.769531 13.289063 6.589844 13.21875 6.4375 C 13.148438 6.285156 13.058594 6.15625 12.9375 6.0625 C 12.816406 5.96875 12.691406 5.878906 12.53125 5.84375 C 12.371094 5.808594 12.179688 5.8125 12 5.8125 Z M 10.78125 9.15625 L 10.78125 18.125 L 13.21875 18.125 L 13.21875 9.15625 Z"
              ></path>
            </svg>
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
        <div class="registro-form__input-group">
          <select
            v-model="doctor.selectedSpecialty"
            class="registro-form__input-select"
            :disabled="
              !isDoctorBasicInfoComplete(index) ||
              doctor.specialties.length >= 3
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
          <button
            type="button"
            class="registro-form__input-button"
            :disabled="
              !isDoctorBasicInfoComplete(index) ||
              doctor.specialties.length >= 3
            "
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
            >
              ×
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

      <!-- Botón eliminar médico -->
      <button
        v-if="index > 0"
        @click="removeDoctor(index)"
        class="registro-form__remove-doctor-button"
        type="button"
      >
        Eliminar médico
      </button>
    </div>

    <!-- Botón agregar otro médico -->
    <button
      @click="addNewDoctor"
      class="registro-form__add-button"
      :disabled="!canAddMoreDoctors"
      type="button"
    >
      + Agregar otro médico relacionado
    </button>

    <!-- Botones de navegación -->
    <div class="registro-form__navigation navigation-buttons">
      <button
        @click="$emit('prev')"
        class="navigation-buttons__button navigation-buttons__button--secondary"
      >
        <AtomsIconsArrowLeftIcon size="20" />
        Volver Atrás
      </button>
      <button
        type="submit"
        class="navigation-buttons__button navigation-buttons__button--primary"
        :disabled="!isFormComplete"
        @click="$emit('submit')"
      >
        Enviar formulario
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

const toggleSameInfo = (index) => {
  emit("toggle-same-info", index);
};

const isDoctorBasicInfoComplete = (index) => {
  const doctor = props.doctorsList[index];
  return (
    doctor.useSameInfo ||
    (doctor.documentType && doctor.documentNumber && doctor.fullName)
  );
};

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

const addNewDoctor = () => {
  emit("add-doctor");
};

const removeDoctor = (index) => {
  emit("remove-doctor", index);
};

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

  &__doctor-section {
    & > * + * {
      margin-top: 20px;
    }
  }

  &__row {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;

    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  &__add-button {
    @include primary-button;
    margin-top: 10px;
  }

  &__remove-doctor-button {
    @include button-base;
    color: #dc2626;
    border: 1px solid #dc2626;
    background-color: transparent;
    margin-bottom: 1rem;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      background-color: #dc2626;
      color: white;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__group {
    flex: 1;
    & > * + * {
      margin-top: 6px;
    }
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
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0%;

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
    gap: 6px;
    svg {
      width: 18px;
      height: 18px;
      fill: #344054;
      margin-right: 4px;
    }
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

  &__checkbox {
    @extend .checkbox-group;
  }
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 12px;

  &__label {
    @include label-base;
    font-weight: 500;
    line-height: 20px;
    color: #344054;
    letter-spacing: 0%;
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

  &__remove-button {
    background: none;
    border: none;
    color: #1d4ed8;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    padding: 0;
    margin-left: 0.25rem;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;

    &:hover {
      background-color: #1d4ed8;
      color: white;
    }
  }
}

.navigation-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;

  &__button {
    @include button-base;
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
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
