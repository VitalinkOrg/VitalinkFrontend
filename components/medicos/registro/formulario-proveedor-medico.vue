<template>
  <div class="form-container">
    <form @submit.prevent="handleNext" novalidate class="registro-form">
      <div class="registro-form__main">
        <label class="registro-form__title"
          >Completa los datos de registro</label
        >

        <!-- Tipo de documento -->
        <div class="registro-form__row">
          <div class="registro-form__group">
            <label for="documentType" class="registro-form__label">
              Tipo de documento de identidad
              <div class="tooltip-container">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="icon icon-tabler icons-tabler-outline icon-tabler-info-circle tooltip-trigger"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                  <path d="M12 9h.01" />
                  <path d="M11 12h1v4h1" />
                </svg>
                <div class="tooltip-content">
                  Selecciona el tipo de documento de identidad que utilizarás
                  para el registro
                </div>
              </div>
            </label>
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
            <label for="email" class="registro-form__label">
              Correo Electrónico
              <div class="tooltip-container">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="icon icon-tabler icons-tabler-outline icon-tabler-info-circle tooltip-trigger"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                  <path d="M12 9h.01" />
                  <path d="M11 12h1v4h1" />
                </svg>
                <div class="tooltip-content">
                  Utiliza un correo electrónico válido. Recibirás notificaciones
                  importantes en esta dirección.
                </div>
              </div>
            </label>
            <input
              :value="email"
              @input="
                $emit(
                  'update:email',
                  ($event.target as HTMLSelectElement).value
                )
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

    <div class="auth-footer-actions">
      <p class="auth-already-account" id="register-link-label">
        <span>Ya tienes cuenta?</span>
        <NuxtLink
          to="/medicos/login"
          class="auth-login-link"
          aria-describedby="register-link-label"
        >
          Iniciar sesión
        </NuxtLink>
      </p>
    </div>
  </div>
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
.form-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.registro-form {
  flex: 1;
  display: flex;
  flex-direction: column;

  &__main {
    flex: 1;

    & > * + * {
      margin-top: 20px;
    }
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

.tooltip-container {
  position: relative;
  display: inline-flex;
  align-items: center;

  .tooltip-trigger {
    cursor: help;
    color: #6b7280;
    transition: color 0.2s ease;

    &:hover {
      color: #374151;
    }
  }

  .tooltip-content {
    position: absolute;
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
    background: #1f2937;
    color: white;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 400;
    max-width: 280px;
    white-space: normal;
    line-height: 1.4;
    z-index: 1000;
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);

    // Flecha del tooltip
    &::before {
      content: "";
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 6px solid transparent;
      border-bottom-color: #1f2937;
    }

    // Ocultar por defecto
    opacity: 0;
    visibility: hidden;
    transform: translateX(-50%) translateY(-5px);
    transition: all 0.2s ease;
    pointer-events: none;
  }

  // Mostrar en hover
  &:hover .tooltip-content {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
    pointer-events: auto;
  }

  // Ajuste para evitar que se salga de la pantalla
  .tooltip-content {
    // Si está muy a la izquierda
    &.tooltip-left {
      left: 0;
      transform: translateX(0);

      &::before {
        left: 20px;
        transform: translateX(0);
      }

      &:hover {
        transform: translateX(0) translateY(0);
      }
    }

    // Si está muy a la derecha
    &.tooltip-right {
      right: 0;
      left: auto;
      transform: translateX(0);

      &::before {
        right: 20px;
        left: auto;
        transform: translateX(0);
      }

      &:hover {
        transform: translateX(0) translateY(0);
      }
    }
  }

  // Responsivo para móviles
  @media (max-width: 768px) {
    .tooltip-content {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      max-width: calc(100vw - 40px);

      &::before {
        display: none;
      }

      &:hover {
        transform: translate(-50%, -50%);
      }
    }
  }
}

.auth-footer-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: auto;
  padding: 20px 0;

  .auth-already-account {
    display: flex;
    align-items: center;
    gap: 4px;
    margin: 0;
    font-family: $font-family-alt;
    font-weight: 400;
    font-size: 14px;
    color: $color-text-muted;
  }

  .auth-login-link {
    @include link-base;
    font-weight: 600;
    text-decoration: none;
    color: $color-primary;

    &:hover {
      text-decoration: underline;
      color: darken($color-primary, 10%);
    }
  }
}
</style>
