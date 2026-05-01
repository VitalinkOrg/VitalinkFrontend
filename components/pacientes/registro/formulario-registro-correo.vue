<template>
  <div class="registration-form">
    <form
      @submit.prevent="handleSubmit"
      class="registration-form__main"
      novalidate
    >
      <fieldset class="registration-form__fieldset">
        <legend class="registration-form__heading">
          Completa tus datos de registro
        </legend>

        <div class="registration-form__row">
          <div class="registration-field-group">
            <label for="document-type" class="registration-label">
              Tipo de documento de identidad
              <span aria-hidden="true">*</span>
            </label>
            <UiDropdownBase
              id="document-type"
              v-model="documentType"
              :items="documentTypeItems"
              :loading="isLoadingDocumentTypes"
              placeholder="Selecciona tipo de documento"
              :aria-invalid="errors.documentType ? 'true' : 'false'"
              :aria-describedby="
                errors.documentType ? 'document-type-error' : undefined
              "
              @blur="validateDocumentType"
            />
            <span
              v-if="errors.documentType"
              id="document-type-error"
              class="registration-error"
              role="alert"
            >
              {{ errors.documentType }}
            </span>
          </div>

          <div class="registration-field-group">
            <label for="document-number" class="registration-label">
              Número de documento
              <span aria-hidden="true">*</span>
            </label>
            <input
              id="document-number"
              :value="documentNumber"
              type="text"
              class="registration-input"
              :class="{ 'registration-input--invalid': errors.documentNumber }"
              :placeholder="getCedulaPlaceholder(documentType)"
              :aria-invalid="errors.documentNumber ? 'true' : 'false'"
              :aria-describedby="
                errors.documentNumber ? 'document-number-error' : undefined
              "
              @input="handleDocumentNumberInput"
              @blur="validateDocumentNumber"
            />
            <span
              v-if="errors.documentNumber"
              id="document-number-error"
              class="registration-error"
              role="alert"
            >
              {{ errors.documentNumber }}
            </span>
          </div>
        </div>

        <div class="registration-field-group">
          <label for="nombre" class="registration-label">
            Tu nombre
            <span aria-hidden="true">*</span>
          </label>
          <input
            v-model="name"
            type="text"
            id="nombre"
            placeholder="Escribe tu nombre"
            class="registration-input"
            :class="{ 'registration-input--invalid': errors.name }"
            :aria-invalid="errors.name ? 'true' : 'false'"
            :aria-describedby="errors.name ? 'nombre-error' : undefined"
            @blur="validateName"
          />
          <span
            v-if="errors.name"
            id="nombre-error"
            class="registration-error"
            role="alert"
          >
            {{ errors.name }}
          </span>
        </div>

        <div class="registration-field-group">
          <label for="email" class="registration-label">
            Correo electrónico
            <span aria-hidden="true">*</span>
          </label>
          <input
            v-model="email"
            type="email"
            id="email"
            placeholder="Tu correo electrónico"
            class="registration-input"
            :class="{ 'registration-input--invalid': errors.email }"
            :aria-invalid="errors.email ? 'true' : 'false'"
            :aria-describedby="errors.email ? 'email-error' : undefined"
            @blur="validateEmail"
          />
          <span
            v-if="errors.email"
            id="email-error"
            class="registration-error"
            role="alert"
          >
            {{ errors.email }}
          </span>
        </div>

        <div class="registration-field-group">
          <label for="password" class="registration-label">
            Contraseña
            <span aria-hidden="true">*</span>
          </label>
          <div class="password-field-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              id="password"
              placeholder="Escribe tu contraseña"
              class="registration-input"
              :class="{ 'registration-input--invalid': errors.password }"
              :aria-invalid="errors.password ? 'true' : 'false'"
              :aria-describedby="
                errors.password
                  ? 'password-error password-hint'
                  : 'password-hint'
              "
              @blur="validatePassword"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              :aria-label="
                showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
              "
              :aria-pressed="showPassword"
            >
              <span aria-hidden="true">{{ showPassword ? "👁️" : "👁️‍🗨️" }}</span>
            </button>
          </div>
          <small id="password-hint" class="registration-hint">
            Debe tener al menos 8 caracteres
          </small>
          <span
            v-if="errors.password"
            id="password-error"
            class="registration-error"
            role="alert"
          >
            {{ errors.password }}
          </span>
        </div>

        <div class="registration-field-group">
          <label for="solidarista" class="registration-label">
            Asociación Solidarista
            <span aria-hidden="true">*</span>
          </label>
          <UiDropdownBase
            id="solidarista"
            v-model="solidaristaAssociation"
            :items="financeEntityItems"
            placeholder="Selecciona tu asociación"
            searchable
            clearable
          />
          <span
            v-if="errors.solidarista"
            id="solidarista-error"
            class="registration-error"
            role="alert"
          >
            {{ errors.solidarista }}
          </span>
        </div>

        <fieldset class="registration-options-group" aria-required="true">
          <legend class="sr-only">Aceptación de términos y políticas</legend>
          <div class="registration-terms-group">
            <div class="registration-option">
              <input
                type="checkbox"
                id="terms"
                v-model="acceptedTerms"
                class="registration-checkbox"
                @change="validateTerms"
              />
              <label for="terms" class="registration-option-label">
                He leído y acepto los
                <a
                  href="/documentos/terminos-condiciones.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  Términos y Condiciones
                </a>
              </label>
            </div>
            <span
              v-if="errors.terms"
              id="terms-error"
              class="registration-error"
              role="alert"
            >
              {{ errors.terms }}
            </span>

            <div class="registration-option">
              <input
                type="checkbox"
                id="privacy"
                v-model="acceptedPrivacy"
                class="registration-checkbox"
                @change="validatePrivacy"
              />
              <label for="privacy" class="registration-option-label">
                He leído y acepto la
                <a
                  href="/documentos/politica-privacidad.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  Política de Privacidad
                </a>
              </label>
            </div>
            <span
              v-if="errors.privacy"
              id="privacy-error"
              class="registration-error"
              role="alert"
            >
              {{ errors.privacy }}
            </span>
          </div>
        </fieldset>

        <button
          type="submit"
          class="registration-submit-button"
          :disabled="isSubmitting || !acceptedTerms || !acceptedPrivacy"
          :aria-busy="isSubmitting"
        >
          <span
            v-if="isSubmitting"
            class="registration-submit-button__spinner"
            aria-hidden="true"
          />
          {{ isSubmitting ? "Procesando..." : "Registrarme" }}
        </button>
      </fieldset>
    </form>

    <div class="registration-footer-actions">
      <p class="registration-already-account">
        <span>¿Ya tienes una cuenta?</span>
        <NuxtLink
          to="/auth/login"
          class="registration-login-link"
          aria-label="Ir a iniciar sesión"
        >
          Iniciar sesión
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRuntimeConfig } from "#app";
import { useFinanceEntity, useUdc } from "@/composables/api";
import { useFormat } from "@/composables/useFormat";
import { useLogger } from "@/composables/useLogger";
import { useToast } from "@/composables/useToast";
const { getAllFinanceEntities } = useFinanceEntity();
const { getAllUdcs } = useUdc();
const {
  formatCedula,
  validateCedula,
  getCedulaPlaceholder,
  getCedulaErrorMessage,
  convertCedulaForBackend,
} = useFormat();
const logger = useLogger("formulario-registro-correo");
const toast = useToast();

const documentType = ref("");
const documentNumber = ref("");
const name = ref("");
const email = ref("");
const password = ref("");
const solidaristaAssociation = ref("");
const showPassword = ref(false);
const acceptedTerms = ref(false);
const acceptedPrivacy = ref(false);
const isSubmitting = ref(false);
const financeEntities = ref<IUdc[]>([]);
const documentTypeOptions = ref<IUdc[]>([]);
const isLoadingDocumentTypes = ref(false);

const documentTypeItems = computed(() =>
  documentTypeOptions.value.map((opt) => ({
    value: opt.code,
    label: opt.name,
  })),
);

const financeEntityItems = computed(() =>
  financeEntities.value.map((e) => ({ value: e.id, label: e.name })),
);

const errors = reactive({
  documentType: "",
  documentNumber: "",
  name: "",
  email: "",
  password: "",
  solidarista: "",
  terms: "",
  privacy: "",
});

const config = useRuntimeConfig();
const router = useRouter();

const validateDocumentType = () => {
  if (!documentType.value) {
    errors.documentType = "Debes seleccionar un tipo de documento";
    return false;
  }
  errors.documentType = "";
  return true;
};

const validateDocumentNumber = () => {
  if (!documentNumber.value.trim()) {
    errors.documentNumber = "El número de documento es requerido";
    return false;
  }
  if (!validateCedula(documentNumber.value, documentType.value)) {
    errors.documentNumber = getCedulaErrorMessage(documentType.value);
    return false;
  }
  errors.documentNumber = "";
  return true;
};

const validateName = () => {
  if (!name.value.trim()) {
    errors.name = "El nombre es requerido";
    return false;
  }
  if (name.value.trim().length < 2) {
    errors.name = "El nombre debe tener al menos 2 caracteres";
    return false;
  }
  errors.name = "";
  return true;
};

const validateEmail = () => {
  if (!email.value.trim()) {
    errors.email = "El correo electrónico es requerido";
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.value)) {
    errors.email = "Por favor ingresa un correo electrónico válido";
    return false;
  }
  errors.email = "";
  return true;
};

const validatePassword = () => {
  if (!password.value) {
    errors.password = "La contraseña es requerida";
    return false;
  }
  if (password.value.length < 8) {
    errors.password = "La contraseña debe tener al menos 8 caracteres";
    return false;
  }
  errors.password = "";
  return true;
};

const validateSolidarista = () => {
  if (!solidaristaAssociation.value) {
    errors.solidarista = "Debes seleccionar tu Asociación Solidarista";
    return false;
  }
  errors.solidarista = "";
  return true;
};

const validateTerms = () => {
  if (!acceptedTerms.value) {
    errors.terms = "Debes aceptar los Términos y Condiciones";
    return false;
  }
  errors.terms = "";
  return true;
};

const validatePrivacy = () => {
  if (!acceptedPrivacy.value) {
    errors.privacy = "Debes aceptar la Política de Privacidad";
    return false;
  }
  errors.privacy = "";
  return true;
};

const validateForm = () => {
  return [
    validateDocumentType(),
    validateDocumentNumber(),
    validateName(),
    validateEmail(),
    validatePassword(),
    validateSolidarista(),
    validateTerms(),
    validatePrivacy(),
  ].every(Boolean);
};

const handleDocumentNumberInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const formatted = formatCedula(target.value, documentType.value);
  documentNumber.value = formatted;
  target.value = formatted;
  if (errors.documentNumber) validateDocumentNumber();
};

watch(documentType, () => {
  documentNumber.value = "";
  errors.documentNumber = "";
});

watch(solidaristaAssociation, (val) => {
  if (val) errors.solidarista = "";
});

const handleSubmit = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;

  const backendDocumentNumber = convertCedulaForBackend(
    documentNumber.value,
    documentType.value,
  );

  const payload = {
    card_id: backendDocumentNumber,
    id_type: documentType.value,
    name: name.value,
    email: email.value,
    password: password.value,
    role_code: "CUSTOMER",
    accepted_terms: true,
    accepted_privacy: true,
    finance_entity: solidaristaAssociation.value,
  };
  logger.debug("Register payload", { payload });

  try {
    const { data, error } = await useFetch(
      config.public.API_BASE_URL + "/auth/register",
      {
        method: "POST",
        body: payload,
      },
    );

    if (error.value) {
      logger.error("Register error", {
        status: error.value.statusCode,
        message: error.value.message,
        data: error.value.data,
      });
      toast.error("Error al registrar. Por favor intenta nuevamente.");
      return;
    }

    if (data.value) {
      toast.success(
        "Registro exitoso. Revisa tu correo electrónico para verificar tu cuenta.",
      );
    }
  } catch (error) {
    logger.error("Register exception", { error });
    toast.error("Error al procesar el registro. Por favor intenta nuevamente.");
  } finally {
    isSubmitting.value = false;
  }
};

const loginWithGoogle = () => {};
const loginWithApple = () => {};

async function loadDocumentTypes() {
  isLoadingDocumentTypes.value = true;
  try {
    const { data } = await getAllUdcs({ type: "ID_TYPE" as any }, false);
    if (data) documentTypeOptions.value = data;
  } catch {
    documentTypeOptions.value = [];
  } finally {
    isLoadingDocumentTypes.value = false;
  }
}

async function loadFinanceEntities() {
  try {
    const entitiesResponse = await getAllFinanceEntities();
    financeEntities.value = entitiesResponse.data ?? [];
  } catch (error) {
    logger.error("Error al obtener entidades financieras", { error });
  }
}

onMounted(() => {
  loadDocumentTypes();
  loadFinanceEntities();
});
</script>

<style lang="scss" scoped>
.registration-form {
  width: 100%;
  margin: 0 auto;
}

.registration-form__main {
  display: flex;
  flex-direction: column;
}

.registration-form__fieldset {
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.registration-form__heading {
  @include label-base;
  font-size: 0.9375rem;
  color: #353e5c;
  font-weight: 600;
  padding: 0;
}

.registration-form__row {
  display: flex;
  gap: 1rem;

  @media (max-width: 48rem) {
    flex-direction: column;
  }
}

.registration-field-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
}

.registration-label {
  font-family: $font-family-main;
  font-weight: 500;
  font-size: 0.91875rem;
  color: #425466;
}

.registration-input {
  @include input-base;

  &--invalid {
    border-color: $color-error;
    background-color: #fef2f2;

    &:focus-visible {
      border-color: $color-error;
      box-shadow: 0 0 0 4px rgba($color-error, 0.1);
    }
  }
}

.password-field-wrapper {
  position: relative;
  display: flex;
  align-items: center;

  .registration-input {
    flex: 1;
    padding-right: 48px;
  }

  .password-toggle {
    position: absolute;
    right: 12px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: $border-radius-md;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }
}

.registration-hint {
  font-family: $font-family-alt;
  font-size: 0.721875rem;
  color: #718096;
}

.registration-error {
  font-family: $font-family-alt;
  font-size: 0.8125rem;
  color: $color-error;
  font-weight: 500;
}

.registration-options-group {
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.registration-terms-group {
  display: flex;
  flex-direction: column;
  gap: $spacing-md;
}

.registration-option {
  display: flex;
  align-items: flex-start;
  gap: $spacing-md;
}

.registration-checkbox {
  @include custom-checkbox;
  margin-top: 2px;

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }

  &[aria-invalid="true"] {
    border-color: $color-error;
  }
}

.registration-option-label {
  font-family: $font-family-main;
  font-size: 0.853125rem;
  line-height: 1.4;
  color: #353e5c;
  cursor: pointer;

  a {
    @include link-base;
    color: $color-primary;
    text-decoration: underline;

    &:hover {
      color: $color-primary-darkened-5;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
      border-radius: 2px;
    }
  }
}

.registration-submit-button {
  @include button-base;
  @include primary-button;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &[aria-busy="true"] {
    cursor: wait;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &__spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(#fff, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: registration-spin 0.6s linear infinite;
  }
}

.registration-social-login {
  padding: $spacing-lg;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-lg;
}

.registration-social-login__label {
  margin: 0;
  font-family: $font-family-main;
  font-size: 0.65625rem;
  color: #718096;
}

.registration-social-buttons {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

.registration-social-button {
  width: 4.463125rem;
  height: 3.499375rem;
  border-radius: 0.525rem;
  background: $white;
  border: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 0.065625rem 0.196875rem rgba(50, 50, 71, 0.1),
    0 0 0.065625rem rgba(12, 26, 75, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow:
      0 0.125rem 0.25rem rgba(50, 50, 71, 0.1),
      0 0 0.125rem rgba(12, 26, 75, 0.2);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }
}

.registration-footer-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: $spacing-lg;
}

.registration-already-account {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin: 0;
  font-family: $font-family-alt;
  font-weight: 400;
  font-size: 0.875rem;
  color: $color-text-muted;
}

.registration-login-link {
  @include link-base;
  font-weight: 600;
  text-decoration: none;
  color: $color-primary;

  &:hover {
    text-decoration: underline;
    color: darken($color-primary, 10%);
  }

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
    border-radius: 2px;
  }
}

.sr-only {
  @include visually-hidden;
}

@keyframes registration-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
