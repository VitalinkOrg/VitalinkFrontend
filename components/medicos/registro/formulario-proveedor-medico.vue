<template>
  <form @submit.prevent="handleNext" novalidate>
    <div class="registro-form">
      <label class="registro-form__title">Completa los datos de registro</label>

      <!-- Tipo de documento -->
      <div class="registro-form__row">
        <div class="registro-form__group">
          <label for="documentType" class="registro-form__label"
            >Tipo de documento de identidad</label
          >
          <select
            :value="documentType"
            @input="
              $emit(
                'update:document-type',
                ($event.target as HTMLSelectElement).value
              )
            "
            id="documentType"
            class="registro-form__input-select"
            required
          >
            <option value="" disabled>Seleccione tipo de documento</option>
            <option value="dni">DNI</option>
            <option value="passport">Pasaporte</option>
            <option value="ruc">RUC</option>
            <option value="other">Otro</option>
          </select>
        </div>
        <div class="registro-form__group">
          <label for="documentNumber" class="registro-form__label"
            >Número de documento:</label
          >
          <input
            :value="documentNumber"
            @input="
              $emit(
                'update:document-number',
                ($event.target as HTMLSelectElement).value
              )
            "
            type="text"
            class="registro-form__input-text"
            placeholder="Ingrese su número de documento"
            id="documentNumber"
            required
          />
        </div>
      </div>

      <!-- Nombre completo -->
      <div class="registro-form__group">
        <label for="fullName" class="registro-form__label">
          Nombre y Apellidos / Razón Social (En caso de personas jurídicas)
        </label>
        <input
          :value="fullName"
          @input="
            $emit(
              'update:full-name',
              ($event.target as HTMLSelectElement).value
            )
          "
          type="text"
          class="registro-form__input-text"
          placeholder="Ingrese nombre completo o razón social"
          id="fullName"
          required
        />
      </div>

      <!-- Cargar contrato -->
      <CargarArchivos
        label="Contrato"
        inputId="contact"
        :uploadedFile="uploadedFile"
        @update:file="$emit('update:uploaded-file', $event)"
      />

      <hr class="registro-form__divider" />

      <!-- Correo -->
      <div class="registro-form__row">
        <div class="registro-form__group">
          <label for="email" class="registro-form__label"
            >Correo Electrónico</label
          >
          <input
            :value="email"
            @input="
              $emit('update:email', ($event.target as HTMLSelectElement).value)
            "
            type="email"
            class="registro-form__input-text"
            placeholder="Escribe tu correo electrónico"
            id="email"
            required
          />
        </div>
        <div class="registro-form__group">
          <label for="confirmEmail" class="registro-form__label"
            >Confirmar Correo Electrónico</label
          >
          <input
            :value="confirmEmail"
            @input="handleConfirmEmailChange"
            type="email"
            class="registro-form__input-text"
            placeholder="Confirma tu correo electrónico"
            id="confirmEmail"
            required
          />
          <div v-if="emailMismatch" class="registro-form__error-message">
            Los correos electrónicos no coinciden
          </div>
        </div>
      </div>

      <!-- Teléfono -->
      <div class="registro-form__group">
        <label for="phone" class="registro-form__label"
          >Teléfono de contacto</label
        >
        <input
          :value="phone"
          @input="
            $emit('update:phone', ($event.target as HTMLSelectElement).value)
          "
          type="tel"
          class="registro-form__input-text"
          placeholder="(506) 0000-0000"
          id="phone"
          required
        />
      </div>

      <button
        type="submit"
        class="registro-form__button-next"
        :disabled="!isStep1Valid"
      >
        Paso 2: Agregar médicos relacionados
      </button>
    </div>
  </form>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import CargarArchivos from "./cargar-archivos.vue";

const props = defineProps<{
  documentType: string;
  documentNumber: string;
  fullName: string;
  email: string;
  confirmEmail: string;
  phone: string;
  uploadedFile: File | null;
  emailMismatch: boolean;
}>();

const emit = defineEmits<{
  (e: "update:document-type", value: string): void;
  (e: "update:document-number", value: string): void;
  (e: "update:full-name", value: string): void;
  (e: "update:email", value: string): void;
  (e: "update:confirm-email", value: string): void;
  (e: "update:phone", value: string): void;
  (e: "update:uploaded-file", value: File | null): void;
  (e: "update:email-mismatch", value: boolean): void;
  (e: "next"): void;
}>();

const isStep1Valid = computed(() => {
  return (
    props.documentType &&
    props.documentNumber &&
    props.fullName &&
    props.email &&
    props.confirmEmail &&
    props.phone &&
    props.uploadedFile &&
    !props.emailMismatch
  );
});

const handleConfirmEmailChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  emit("update:confirm-email", value);
  emit("update:email-mismatch", props.email !== value);
};

const handleNext = () => {
  if (isStep1Valid.value) {
    emit("next");
  }
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
