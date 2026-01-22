<template>
  <div class="form-container">
    <form @submit.prevent="handleSubmit" novalidate class="registro-form">
      <div class="registro-form__main">
        <label class="registro-form__title">
          Completa los datos de registro
        </label>

        <div class="registro-form__row">
          <div class="registro-form__group">
            <label for="documentType" class="registro-form__label">
              Tipo de documento de identidad
              <div class="tooltip-container">
                <AtomsIconsInfoIcon
                  size="20"
                  class="icon icon-tabler icons-tabler-outline icon-tabler-info-circle tooltip-trigger"
                />
                <div class="tooltip-content">
                  Selecciona el tipo de documento de identidad que utilizarás
                  para el registro
                </div>
              </div>
            </label>
            <UiDropdownBase
              :model-value="supplierFormData.documentType"
              :items="
                documentTypeOptions.map((s) => ({
                  value: s.code,
                  label: s.name,
                }))
              "
              :loading="isLoadingDocumentTypes"
              :disabled="isLoading"
              :class="{
                'input-error':
                  touched.documentType && !supplierFormData.documentType,
              }"
              placeholder="Seleccione tipo de documento"
              @update:model-value="handleDocumentTypeChange($event as string)"
              @blur="touched.documentType = true"
            />
            <small
              v-if="touched.documentType && !supplierFormData.documentType"
              class="registro-form__error-message"
            >
              Debes seleccionar un tipo de documento
            </small>
          </div>

          <div class="registro-form__group">
            <label for="documentNumber" class="registro-form__label">
              Número de documento
            </label>
            <input
              :value="supplierFormData.documentNumber"
              @input="handleDocumentNumberInput"
              @blur="touched.documentNumber = true"
              type="text"
              class="registro-form__input-text"
              :class="{
                'input-error':
                  touched.documentNumber &&
                  (!supplierFormData.documentNumber || !isDocumentValid),
              }"
              :placeholder="getCedulaPlaceholder(supplierFormData.documentType)"
              :disabled="isLoading"
              id="documentNumber"
              required
            />
            <small
              v-if="touched.documentNumber && !supplierFormData.documentNumber"
              class="registro-form__error-message"
            >
              El número de documento es requerido
            </small>
            <small
              v-else-if="supplierFormData.documentNumber && !isDocumentValid"
              class="registro-form__error-message"
            >
              {{ getCedulaErrorMessage(supplierFormData.documentType) }}
            </small>
          </div>
        </div>

        <div class="registro-form__group">
          <label for="fullName" class="registro-form__label">
            Nombre y Apellidos / Razón Social (En caso de personas jurídicas)
          </label>
          <input
            :value="supplierFormData.fullName"
            @input="
              updateSupplierFormData({
                ...supplierFormData,
                fullName: ($event.target as HTMLInputElement).value,
              })
            "
            @blur="touched.fullName = true"
            type="text"
            class="registro-form__input-text"
            :class="{
              'input-error':
                touched.fullName && !supplierFormData.fullName.trim(),
            }"
            placeholder="Ingrese nombre completo o razón social"
            :disabled="isLoading"
            id="fullName"
            required
          />
          <small
            v-if="touched.fullName && !supplierFormData.fullName.trim()"
            class="registro-form__error-message"
          >
            El nombre completo o razón social es requerido
          </small>
        </div>

        <MedicosRegistroCargarArchivos
          label="Contrato"
          inputId="contact"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          :uploadedFile="supplierFormData.contratcFile"
          :disabled="isLoading"
          :has-error="touched.contratcFile && !supplierFormData.contratcFile"
          @update:file="handleContractFileChange"
          @blur="touched.contratcFile = true"
        />
        <small
          v-if="touched.contratcFile && !supplierFormData.contratcFile"
          class="registro-form__error-message"
        >
          Debes cargar el archivo de contrato (PDF, Word, JPG o PNG)
        </small>
        <small v-if="contractFileError" class="registro-form__error-message">
          {{ contractFileError }}
        </small>

        <hr class="registro-form__divider" />

        <div class="registro-form__row">
          <div class="registro-form__group">
            <label for="email" class="registro-form__label">
              Correo Electrónico
              <div class="tooltip-container">
                <AtomsIconsInfoIcon
                  size="20"
                  class="icon icon-tabler icons-tabler-outline icon-tabler-info-circle tooltip-trigger"
                />
                <div class="tooltip-content">
                  Utiliza un correo electrónico válido. Recibirás notificaciones
                  importantes en esta dirección.
                </div>
              </div>
            </label>
            <input
              :value="supplierFormData.email"
              @input="
                updateSupplierFormData({
                  ...supplierFormData,
                  email: ($event.target as HTMLInputElement).value,
                })
              "
              @blur="touched.email = true"
              type="email"
              class="registro-form__input-text"
              :class="{
                'input-error':
                  touched.email &&
                  (!supplierFormData.email.trim() || !isEmailValid),
              }"
              placeholder="Escribe tu correo electrónico"
              :disabled="isLoading"
              id="email"
              required
            />
            <small
              v-if="touched.email && !supplierFormData.email.trim()"
              class="registro-form__error-message"
            >
              El correo electrónico es requerido
            </small>
            <small
              v-else-if="
                touched.email && supplierFormData.email.trim() && !isEmailValid
              "
              class="registro-form__error-message"
            >
              Ingresa un correo electrónico válido (ej: usuario@ejemplo.com)
            </small>
          </div>

          <div class="registro-form__group">
            <label for="confirmEmail" class="registro-form__label">
              Confirmar Correo Electrónico
            </label>
            <input
              :value="confirmEmail"
              @input="confirmEmail = ($event.target as HTMLInputElement).value"
              @blur="touched.confirmEmail = true"
              type="email"
              class="registro-form__input-text"
              :class="{
                'input-error':
                  touched.confirmEmail && (!confirmEmail || emailMismatch),
              }"
              placeholder="Confirma tu correo electrónico"
              :disabled="isLoading"
              id="confirmEmail"
              required
            />
            <small
              v-if="touched.confirmEmail && !confirmEmail"
              class="registro-form__error-message"
            >
              Debes confirmar tu correo electrónico
            </small>
            <small
              v-else-if="touched.confirmEmail && emailMismatch"
              class="registro-form__error-message"
            >
              Los correos electrónicos no coinciden
            </small>
          </div>
        </div>

        <div class="registro-form__group">
          <label for="phone" class="registro-form__label">
            Teléfono de contacto
          </label>
          <input
            :value="supplierFormData.phone"
            @input="handlePhoneInput"
            @blur="touched.phone = true"
            type="tel"
            class="registro-form__input-text"
            :class="{
              'input-error':
                touched.phone &&
                (!supplierFormData.phone.trim() || !isPhoneValid),
            }"
            placeholder="8888-8888"
            :disabled="isLoading"
            id="phone"
            maxlength="13"
            required
          />
          <small
            v-if="touched.phone && !supplierFormData.phone.trim()"
            class="registro-form__error-message"
          >
            El teléfono de contacto es requerido
          </small>
          <small
            v-else-if="
              touched.phone && supplierFormData.phone.trim() && !isPhoneValid
            "
            class="registro-form__error-message"
          >
            Ingresa un número de teléfono válido (8 dígitos)
          </small>
        </div>

        <div class="registro-form__row">
          <div class="registro-form__group">
            <label for="password" class="registro-form__label">
              Contraseña Nueva
              <div class="tooltip-container">
                <AtomsIconsInfoIcon
                  size="20"
                  class="icon icon-tabler icons-tabler-outline icon-tabler-info-circle tooltip-trigger"
                />
                <div class="tooltip-content">
                  La contraseña debe tener al menos 8 caracteres
                </div>
              </div>
            </label>
            <input
              :value="supplierFormData.password"
              @input="
                updateSupplierFormData({
                  ...supplierFormData,
                  password: ($event.target as HTMLInputElement).value,
                })
              "
              @blur="touched.password = true"
              type="password"
              class="registro-form__input-text"
              :class="{
                'input-error':
                  touched.password &&
                  (!supplierFormData.password || !isPasswordValid),
              }"
              placeholder="Ingrese su contraseña"
              :disabled="isLoading"
              id="password"
              required
            />
            <small
              v-if="touched.password && !supplierFormData.password"
              class="registro-form__error-message"
            >
              La contraseña es requerida
            </small>
            <small
              v-else-if="
                touched.password &&
                supplierFormData.password &&
                !isPasswordValid
              "
              class="registro-form__error-message"
            >
              La contraseña debe tener al menos 8 caracteres
            </small>
          </div>

          <div class="registro-form__group">
            <label for="confirmPassword" class="registro-form__label">
              Confirmar Contraseña
            </label>
            <input
              :value="confirmPassword"
              @input="
                confirmPassword = ($event.target as HTMLInputElement).value
              "
              @blur="touched.confirmPassword = true"
              type="password"
              class="registro-form__input-text"
              :class="{
                'input-error':
                  touched.confirmPassword &&
                  (!confirmPassword || passwordMismatch),
              }"
              placeholder="Confirma tu contraseña"
              :disabled="isLoading"
              id="confirmPassword"
              required
            />
            <small
              v-if="touched.confirmPassword && !confirmPassword"
              class="registro-form__error-message"
            >
              Debes confirmar tu contraseña
            </small>
            <small
              v-else-if="touched.confirmPassword && passwordMismatch"
              class="registro-form__error-message"
            >
              Las contraseñas no coinciden
            </small>
          </div>
        </div>

        <button
          type="submit"
          class="registro-form__button-submit"
          :disabled="!isFormValid || isLoading"
        >
          <span v-if="isLoading" class="spinner"></span>
          {{ isLoading ? "Registrando..." : "Completar Registro" }}
        </button>
      </div>
    </form>

    <div class="auth-footer-actions">
      <p class="auth-already-account" id="register-link-label">
        <span>¿Ya tienes cuenta?</span>
        <NuxtLink
          to="/auth/login"
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
import { useUdc } from "@/composables/api";
import { useFormat } from "@/composables/useFormat";
import type { IdType, ISupplierFormData } from "@/types";

interface Props {
  supplierFormData: ISupplierFormData;
  isLoading?: boolean;
}

interface Emits {
  (e: "update:supplierFormData", value: ISupplierFormData): void;
  (e: "submit"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { fetchUdc } = useUdc();
const {
  formatCedula,
  validateCedula,
  getCedulaPlaceholder,
  getCedulaErrorMessage,
  formatPhone,
} = useFormat();

const confirmEmail = ref<string>("");
const confirmPassword = ref<string>("");
const documentTypeOptions = ref<IdType[]>([]);
const isLoadingDocumentTypes = ref<boolean>(false);
const contractFileError = ref<string>("");

const touched = reactive({
  documentType: false,
  documentNumber: false,
  fullName: false,
  contratcFile: false,
  email: false,
  confirmEmail: false,
  phone: false,
  password: false,
  confirmPassword: false,
});

const isEmailValid = computed(() => {
  if (!props.supplierFormData.email) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(props.supplierFormData.email);
});

const isPhoneValid = computed(() => {
  if (!props.supplierFormData.phone) return true;
  const digitsOnly = props.supplierFormData.phone.replace(/\D/g, "");
  return digitsOnly.length === 8;
});

const isPasswordValid = computed(() => {
  return props.supplierFormData.password.length >= 8;
});

const emailMismatch = computed(() => {
  return (
    props.supplierFormData.email.trim() !== "" &&
    props.supplierFormData.email !== confirmEmail.value &&
    confirmEmail.value !== ""
  );
});

const passwordMismatch = computed(() => {
  return (
    props.supplierFormData.password.trim() !== "" &&
    props.supplierFormData.password !== confirmPassword.value &&
    confirmPassword.value !== ""
  );
});

const isDocumentValid = computed(() => {
  if (!props.supplierFormData.documentNumber) return true;
  return validateCedula(
    props.supplierFormData.documentNumber,
    props.supplierFormData.documentType,
  );
});

const isFormValid = computed(() => {
  return (
    props.supplierFormData.documentType.trim() !== "" &&
    props.supplierFormData.documentNumber.trim() !== "" &&
    isDocumentValid.value &&
    props.supplierFormData.fullName.trim() !== "" &&
    props.supplierFormData.contratcFile !== null &&
    props.supplierFormData.email.trim() !== "" &&
    isEmailValid.value &&
    props.supplierFormData.phone.trim() !== "" &&
    isPhoneValid.value &&
    props.supplierFormData.password.trim() !== "" &&
    isPasswordValid.value &&
    !emailMismatch.value &&
    !passwordMismatch.value
  );
});

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const validateFileType = (file: File): boolean => {
  const extension = "." + file.name.split(".").pop()?.toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    contractFileError.value = `Formato no permitido. Solo se aceptan archivos: ${ALLOWED_EXTENSIONS.join(", ")}`;
    return false;
  }

  if (file.size > MAX_FILE_SIZE) {
    contractFileError.value =
      "El archivo es demasiado grande. El tamaño máximo es 10MB";
    return false;
  }

  contractFileError.value = "";
  return true;
};

const handleContractFileChange = (file: File | null) => {
  touched.contratcFile = true;

  if (file && !validateFileType(file)) {
    updateSupplierFormData({
      ...props.supplierFormData,
      contratcFile: null,
    });
    return;
  }

  updateSupplierFormData({
    ...props.supplierFormData,
    contratcFile: file,
  });
};

const handleDocumentTypeChange = (documentType: string) => {
  touched.documentType = true;
  updateSupplierFormData({
    ...props.supplierFormData,
    documentType: documentType ?? "",
    documentNumber: "",
  });
};

const handleDocumentNumberInput = (event: Event) => {
  touched.documentNumber = true;
  const target = event.target as HTMLInputElement;
  const cursorPosition = target.selectionStart || 0;

  const formattedValue = formatCedula(
    target.value,
    props.supplierFormData.documentType,
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

  updateSupplierFormData({
    ...props.supplierFormData,
    documentNumber: formattedValue,
  });

  nextTick(() => {
    target.setSelectionRange(newCursorPosition, newCursorPosition);
  });
};

const handlePhoneInput = (event: Event) => {
  touched.phone = true;
  const target = event.target as HTMLInputElement;
  const cursorPosition = target.selectionStart || 0;

  const digitsOnly = target.value.replace(/\D/g, "");

  const limitedDigits = digitsOnly.slice(0, 8);

  const formattedValue = formatPhone(limitedDigits);

  const digitsBeforeCursor = target.value
    .substring(0, cursorPosition)
    .replace(/\D/g, "").length;

  let newCursorPosition = 0;
  let digitCount = 0;

  for (let i = 0; i < formattedValue.length; i++) {
    if (formattedValue[i].match(/\d/)) {
      digitCount++;
      if (digitCount === digitsBeforeCursor) {
        newCursorPosition = i + 1;
        break;
      }
    }
  }

  if (digitCount < digitsBeforeCursor || newCursorPosition === 0) {
    newCursorPosition = formattedValue.length;
  }

  updateSupplierFormData({
    ...props.supplierFormData,
    phone: formattedValue,
  });

  nextTick(() => {
    target.setSelectionRange(newCursorPosition, newCursorPosition);
  });
};

const updateSupplierFormData = (newData: ISupplierFormData) => {
  emit("update:supplierFormData", { ...newData });
};

const markAllTouched = () => {
  Object.keys(touched).forEach((key) => {
    touched[key as keyof typeof touched] = true;
  });
};

const handleSubmit = () => {
  markAllTouched();

  if (isFormValid.value && !props.isLoading) {
    emit("submit");
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
    console.error("❌ Error loading document type options:", error);
    documentTypeOptions.value = [];
  } finally {
    isLoadingDocumentTypes.value = false;
  }
};

onMounted(async () => {
  await loadIdType();
});
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
    @include space-y(1.25rem);
  }

  &__title {
    @include label-base;
    font-size: 0.9375rem;
    color: #353e5c;
    font-weight: 600;
  }

  &__row {
    display: flex;
    gap: 1rem;

    @media (max-width: 48rem) {
      flex-direction: column;
    }
  }

  &__group {
    flex: 1;
    @include space-y(0.375rem);
  }

  &__label {
    @include label-base;
    color: #344054;
    display: flex;
    align-items: center;
    gap: 0.375rem;
    max-height: 1.25rem;
  }

  &__input-text,
  &__input-select {
    @include input-base;
    width: 100%;
    margin-top: 0.375rem;
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

  &__divider {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 1rem 0;
  }

  &__button-submit {
    @include primary-button;
    margin-top: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:disabled {
      opacity: 0.6;
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
}

.input-error {
  border-color: #dc2626 !important;
  background-color: #fef2f2 !important;

  &:focus {
    border-color: #dc2626 !important;
    box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
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
    top: calc(100% + 0.5rem);
    left: 50%;
    transform: translateX(-50%);
    background: #1f2937;
    color: $white;
    padding: 0.625rem 0.875rem;
    border-radius: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 400;
    max-width: 17.5rem;
    white-space: normal;
    line-height: 1.4;
    z-index: 1000;
    box-shadow:
      0 0.625rem 0.9375rem -0.1875rem rgba(0, 0, 0, 0.1),
      0 0.25rem 0.375rem -0.125rem rgba(0, 0, 0, 0.05);

    &::before {
      content: "";
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 0.375rem solid transparent;
      border-bottom-color: #1f2937;
    }

    opacity: 0;
    visibility: hidden;
    transform: translateX(-50%) translateY(-0.3125rem);
    transition: all 0.2s ease;
    pointer-events: none;
  }

  &:hover .tooltip-content {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
    pointer-events: auto;
  }

  @media (max-width: 48rem) {
    .tooltip-content {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      max-width: calc(100vw - 2.5rem);

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
  padding: 1.25rem 0;

  .auth-already-account {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin: 0;
    font-family: $font-family-alt;
    font-weight: 400;
    font-size: 0.875rem;
    color: $color-text-muted;
  }

  .auth-login-link {
    @include link-base;
    font-weight: 600;
    text-decoration: none;
    color: $color-primary;

    &:hover {
      text-decoration: underline;
      color: $color-primary-darkened-10;
    }
  }
}
</style>
