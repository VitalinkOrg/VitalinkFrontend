<template>
  <div class="rep-form">
    <form
      @submit.prevent="handleSubmit"
      novalidate
      class="rep-form__body"
      aria-labelledby="rep-form-heading"
    >
      <fieldset class="rep-form__fieldset" :disabled="isSubmitting">
        <legend id="rep-form-heading" class="rep-form__heading">
          Completa los datos de registro
        </legend>

        <div class="rep-form__row">
          <div class="rep-form__field">
            <label for="document-type" class="rep-form__label">
              Tipo de documento de identidad
              <RepFormTooltip
                text="Selecciona el tipo de documento de identidad que utilizarás para el registro"
              />
            </label>
            <UiDropdownBase
              id="document-type"
              :model-value="formData.documentType"
              :items="
                documentTypeOptions.map((opt) => ({
                  value: opt.code,
                  label: opt.name,
                }))
              "
              :loading="isLoadingDocumentTypes"
              :class="{
                'rep-form__input--invalid':
                  touched.documentType && !formData.documentType,
              }"
              placeholder="Seleccione tipo de documento"
              aria-required="true"
              :aria-invalid="touched.documentType && !formData.documentType"
              :aria-describedby="
                touched.documentType && !formData.documentType
                  ? 'document-type-error'
                  : undefined
              "
              @update:model-value="handleDocumentTypeChange($event as string)"
              @blur="touched.documentType = true"
            />
            <span
              v-if="touched.documentType && !formData.documentType"
              id="document-type-error"
              class="rep-form__error"
              role="alert"
            >
              Debes seleccionar un tipo de documento
            </span>
          </div>

          <div class="rep-form__field">
            <label for="document-number" class="rep-form__label">
              Número de documento
            </label>
            <input
              id="document-number"
              :value="formData.documentNumber"
              type="text"
              class="rep-form__input"
              :class="{
                'rep-form__input--invalid':
                  touched.documentNumber &&
                  (!formData.documentNumber || !isDocumentValid),
              }"
              :placeholder="getCedulaPlaceholder(formData.documentType)"
              required
              aria-required="true"
              :aria-invalid="
                touched.documentNumber &&
                (!formData.documentNumber || !isDocumentValid)
              "
              :aria-describedby="documentNumberErrorId"
              @input="handleDocumentNumberInput"
              @blur="touched.documentNumber = true"
            />
            <span
              v-if="touched.documentNumber && !formData.documentNumber"
              id="document-number-required-error"
              class="rep-form__error"
              role="alert"
            >
              El número de documento es requerido
            </span>
            <span
              v-else-if="formData.documentNumber && !isDocumentValid"
              id="document-number-format-error"
              class="rep-form__error"
              role="alert"
            >
              {{ getCedulaErrorMessage(formData.documentType) }}
            </span>
          </div>
        </div>

        <div class="rep-form__field">
          <label for="full-name" class="rep-form__label">
            Nombre y Apellidos / Razón Social (en caso de personas jurídicas)
          </label>
          <input
            id="full-name"
            :value="formData.fullName"
            type="text"
            class="rep-form__input"
            :class="{
              'rep-form__input--invalid':
                touched.fullName && !formData.fullName.trim(),
            }"
            placeholder="Ingrese nombre completo o razón social"
            required
            aria-required="true"
            :aria-invalid="touched.fullName && !formData.fullName.trim()"
            :aria-describedby="
              touched.fullName && !formData.fullName.trim()
                ? 'full-name-error'
                : undefined
            "
            @input="
              emitUpdate({
                fullName: ($event.target as HTMLInputElement).value,
              })
            "
            @blur="touched.fullName = true"
          />
          <span
            v-if="touched.fullName && !formData.fullName.trim()"
            id="full-name-error"
            class="rep-form__error"
            role="alert"
          >
            El nombre completo o razón social es requerido
          </span>
        </div>

        <div class="rep-form__field">
          <MedicosRegistroCargarArchivos
            label="Contrato"
            inputId="contract-file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            :uploadedFile="formData.contractFile"
            :has-error="touched.contractFile && !formData.contractFile"
            @update:file="handleContractFileChange"
            @blur="touched.contractFile = true"
          />
          <span
            v-if="touched.contractFile && !formData.contractFile"
            id="contract-file-error"
            class="rep-form__error"
            role="alert"
          >
            Debes cargar el archivo de contrato (PDF, Word, JPG o PNG)
          </span>
          <span v-if="contractFileError" class="rep-form__error" role="alert">
            {{ contractFileError }}
          </span>
        </div>

        <hr class="rep-form__divider" aria-hidden="true" />

        <div class="rep-form__row">
          <div class="rep-form__field">
            <label for="email" class="rep-form__label">
              Correo Electrónico
              <RepFormTooltip
                text="Utiliza un correo electrónico válido. Recibirás notificaciones importantes en esta dirección."
              />
            </label>
            <input
              id="email"
              :value="formData.email"
              type="email"
              class="rep-form__input"
              :class="{
                'rep-form__input--invalid':
                  touched.email && (!formData.email.trim() || !isEmailValid),
              }"
              placeholder="Escribe tu correo electrónico"
              required
              autocomplete="email"
              aria-required="true"
              :aria-invalid="
                touched.email && (!formData.email.trim() || !isEmailValid)
              "
              :aria-describedby="emailErrorId"
              @input="
                emitUpdate({
                  email: ($event.target as HTMLInputElement).value,
                })
              "
              @blur="touched.email = true"
            />
            <span
              v-if="touched.email && !formData.email.trim()"
              id="email-required-error"
              class="rep-form__error"
              role="alert"
            >
              El correo electrónico es requerido
            </span>
            <span
              v-else-if="
                touched.email && formData.email.trim() && !isEmailValid
              "
              id="email-format-error"
              class="rep-form__error"
              role="alert"
            >
              Ingresa un correo electrónico válido (ej: usuario@ejemplo.com)
            </span>
          </div>

          <div class="rep-form__field">
            <label for="confirm-email" class="rep-form__label">
              Confirmar Correo Electrónico
            </label>
            <input
              id="confirm-email"
              v-model="confirmEmail"
              type="email"
              class="rep-form__input"
              :class="{
                'rep-form__input--invalid':
                  touched.confirmEmail && (!confirmEmail || hasEmailMismatch),
              }"
              placeholder="Confirma tu correo electrónico"
              required
              autocomplete="email"
              aria-required="true"
              :aria-invalid="
                touched.confirmEmail && (!confirmEmail || hasEmailMismatch)
              "
              :aria-describedby="confirmEmailErrorId"
              @blur="touched.confirmEmail = true"
            />
            <span
              v-if="touched.confirmEmail && !confirmEmail"
              id="confirm-email-required-error"
              class="rep-form__error"
              role="alert"
            >
              Debes confirmar tu correo electrónico
            </span>
            <span
              v-else-if="touched.confirmEmail && hasEmailMismatch"
              id="confirm-email-mismatch-error"
              class="rep-form__error"
              role="alert"
            >
              Los correos electrónicos no coinciden
            </span>
          </div>
        </div>

        <div class="rep-form__field">
          <label for="phone" class="rep-form__label">
            Teléfono de contacto
          </label>
          <input
            id="phone"
            :value="formData.phone"
            type="tel"
            class="rep-form__input"
            :class="{
              'rep-form__input--invalid':
                touched.phone && (!formData.phone.trim() || !isPhoneValid),
            }"
            placeholder="8888-8888"
            required
            maxlength="13"
            autocomplete="tel"
            aria-required="true"
            :aria-invalid="
              touched.phone && (!formData.phone.trim() || !isPhoneValid)
            "
            :aria-describedby="phoneErrorId"
            @input="handlePhoneInput"
            @blur="touched.phone = true"
          />
          <span
            v-if="touched.phone && !formData.phone.trim()"
            id="phone-required-error"
            class="rep-form__error"
            role="alert"
          >
            El teléfono de contacto es requerido
          </span>
          <span
            v-else-if="touched.phone && formData.phone.trim() && !isPhoneValid"
            id="phone-format-error"
            class="rep-form__error"
            role="alert"
          >
            Ingresa un número de teléfono válido (8 dígitos)
          </span>
        </div>

        <div class="rep-form__row">
          <div class="rep-form__field">
            <label for="password" class="rep-form__label">
              Contraseña Nueva
              <RepFormTooltip
                text="La contraseña debe tener mínimo 8 caracteres e incluir: letras, números y símbolos (ejemplo: !@#$%^&*)"
              />
            </label>
            <input
              id="password"
              :value="formData.password"
              type="password"
              class="rep-form__input"
              :class="{
                'rep-form__input--invalid':
                  touched.password && (!formData.password || !isPasswordValid),
              }"
              placeholder="Ingrese su contraseña"
              required
              autocomplete="new-password"
              aria-required="true"
              :aria-invalid="
                touched.password && (!formData.password || !isPasswordValid)
              "
              :aria-describedby="passwordErrorId"
              @input="
                emitUpdate({
                  password: ($event.target as HTMLInputElement).value,
                })
              "
              @blur="touched.password = true"
            />
            <span
              v-if="touched.password && !formData.password"
              id="password-required-error"
              class="rep-form__error"
              role="alert"
            >
              La contraseña es requerida
            </span>
            <span
              v-else-if="
                touched.password && formData.password && !isPasswordValid
              "
              id="password-format-error"
              class="rep-form__error"
              role="alert"
            >
              {{ passwordValidationMessage }}
            </span>
          </div>

          <div class="rep-form__field">
            <label for="confirm-password" class="rep-form__label">
              Confirmar Contraseña
            </label>
            <input
              id="confirm-password"
              v-model="confirmPassword"
              type="password"
              class="rep-form__input"
              :class="{
                'rep-form__input--invalid':
                  touched.confirmPassword &&
                  (!confirmPassword || hasPasswordMismatch),
              }"
              placeholder="Confirma tu contraseña"
              required
              autocomplete="new-password"
              aria-required="true"
              :aria-invalid="
                touched.confirmPassword &&
                (!confirmPassword || hasPasswordMismatch)
              "
              :aria-describedby="confirmPasswordErrorId"
              @blur="touched.confirmPassword = true"
            />
            <span
              v-if="touched.confirmPassword && !confirmPassword"
              id="confirm-password-required-error"
              class="rep-form__error"
              role="alert"
            >
              Debes confirmar tu contraseña
            </span>
            <span
              v-else-if="touched.confirmPassword && hasPasswordMismatch"
              id="confirm-password-mismatch-error"
              class="rep-form__error"
              role="alert"
            >
              Las contraseñas no coinciden
            </span>
          </div>
        </div>

        <button
          type="submit"
          class="rep-form__submit"
          :disabled="!isFormComplete || isSubmitting"
          :aria-busy="isSubmitting"
        >
          <span
            v-if="isSubmitting"
            class="rep-form__spinner"
            aria-hidden="true"
          />
          {{ isSubmitting ? "Registrando..." : "Completar Registro" }}
        </button>
      </fieldset>
    </form>

    <footer class="rep-form__footer">
      <p class="rep-form__login-prompt">
        <span>¿Ya tienes cuenta?</span>
        <NuxtLink to="/auth/login" class="rep-form__login-link">
          Iniciar sesión
        </NuxtLink>
      </p>
    </footer>
  </div>
</template>

<script lang="ts" setup>
import { useUdc } from "@/composables/api";
import { useFormat } from "@/composables/useFormat";

const RepFormTooltip = defineComponent({
  props: { text: { type: String, required: true } },
  template: `
    <span class="rep-form__tooltip">
      <AtomsIconsInfoIcon
        size="20"
        class="rep-form__tooltip-icon"
        aria-hidden="true"
      />
      <span class="rep-form__tooltip-content" role="tooltip">{{ text }}</span>
    </span>
  `,
});

interface Props {
  formData: IRepresentativeRegisterRequest;
  isSubmitting?: boolean;
}

interface Emits {
  (e: "update:formData", value: IRepresentativeRegisterRequest): void;
  (e: "submit"): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { getAllUdcs } = useUdc();
const {
  formatCedula,
  validateCedula,
  getCedulaPlaceholder,
  getCedulaErrorMessage,
  formatPhone,
} = useFormat();

const confirmEmail = ref("");
const confirmPassword = ref("");
const documentTypeOptions = ref<IUdc[]>([]);
const isLoadingDocumentTypes = ref(false);
const contractFileError = ref("");

const touched = reactive({
  documentType: false,
  documentNumber: false,
  fullName: false,
  contractFile: false,
  email: false,
  confirmEmail: false,
  phone: false,
  password: false,
  confirmPassword: false,
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RULES = {
  minLength: 8,
  hasLetter: /[a-zA-Z]/,
  hasNumber: /\d/,
  hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
};

const isEmailValid = computed(() => {
  if (!props.formData.email) return true;
  return EMAIL_REGEX.test(props.formData.email);
});

const isPhoneValid = computed(() => {
  if (!props.formData.phone) return true;
  return props.formData.phone.replace(/\D/g, "").length === 8;
});

const isPasswordValid = computed(() => {
  const pw = props.formData.password;
  if (!pw) return false;

  return (
    pw.length >= PASSWORD_RULES.minLength &&
    PASSWORD_RULES.hasLetter.test(pw) &&
    PASSWORD_RULES.hasNumber.test(pw) &&
    PASSWORD_RULES.hasSymbol.test(pw)
  );
});

const passwordValidationMessage = computed(() => {
  if (!props.formData.password || isPasswordValid.value) return "";
  return "La contraseña debe tener mínimo 8 caracteres e incluir: letras, números y símbolos (!@#$%^&*-_+=[]{}|:;<>,.?/)";
});

const isDocumentValid = computed(() => {
  if (!props.formData.documentNumber) return true;
  return validateCedula(
    props.formData.documentNumber,
    props.formData.documentType,
  );
});

const hasEmailMismatch = computed(() => {
  return (
    props.formData.email.trim() !== "" &&
    confirmEmail.value !== "" &&
    props.formData.email !== confirmEmail.value
  );
});

const hasPasswordMismatch = computed(() => {
  return (
    props.formData.password.trim() !== "" &&
    confirmPassword.value !== "" &&
    props.formData.password !== confirmPassword.value
  );
});

const isFormComplete = computed(() => {
  return (
    props.formData.documentType.trim() !== "" &&
    props.formData.documentNumber.trim() !== "" &&
    isDocumentValid.value &&
    props.formData.fullName.trim() !== "" &&
    props.formData.contractFile !== null &&
    props.formData.email.trim() !== "" &&
    isEmailValid.value &&
    confirmEmail.value !== "" &&
    !hasEmailMismatch.value &&
    props.formData.phone.trim() !== "" &&
    isPhoneValid.value &&
    props.formData.password.trim() !== "" &&
    isPasswordValid.value &&
    confirmPassword.value !== "" &&
    !hasPasswordMismatch.value
  );
});

const documentNumberErrorId = computed(() => {
  if (touched.documentNumber && !props.formData.documentNumber)
    return "document-number-required-error";
  if (props.formData.documentNumber && !isDocumentValid.value)
    return "document-number-format-error";
  return undefined;
});

const emailErrorId = computed(() => {
  if (touched.email && !props.formData.email.trim())
    return "email-required-error";
  if (touched.email && !isEmailValid.value) return "email-format-error";
  return undefined;
});

const confirmEmailErrorId = computed(() => {
  if (touched.confirmEmail && !confirmEmail.value)
    return "confirm-email-required-error";
  if (touched.confirmEmail && hasEmailMismatch.value)
    return "confirm-email-mismatch-error";
  return undefined;
});

const phoneErrorId = computed(() => {
  if (touched.phone && !props.formData.phone.trim())
    return "phone-required-error";
  if (touched.phone && !isPhoneValid.value) return "phone-format-error";
  return undefined;
});

const passwordErrorId = computed(() => {
  if (touched.password && !props.formData.password)
    return "password-required-error";
  if (touched.password && !isPasswordValid.value)
    return "password-format-error";
  return undefined;
});

const confirmPasswordErrorId = computed(() => {
  if (touched.confirmPassword && !confirmPassword.value)
    return "confirm-password-required-error";
  if (touched.confirmPassword && hasPasswordMismatch.value)
    return "confirm-password-mismatch-error";
  return undefined;
});

const emitUpdate = (partial: Partial<IRepresentativeRegisterRequest>) => {
  emit("update:formData", { ...props.formData, ...partial });
};

const handleDocumentTypeChange = (documentType: string) => {
  touched.documentType = true;
  emitUpdate({ documentType: documentType ?? "", documentNumber: "" });
};

const handleDocumentNumberInput = (event: Event) => {
  touched.documentNumber = true;
  const target = event.target as HTMLInputElement;
  const cursorPosition = target.selectionStart || 0;

  const formatted = formatCedula(target.value, props.formData.documentType);

  const digitsBeforeCursor = target.value
    .substring(0, cursorPosition)
    .replace(/\D/g, "").length;

  let digitCount = 0;
  let newCursorPosition = formatted.length;

  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) {
      digitCount++;
      if (digitCount === digitsBeforeCursor) {
        newCursorPosition = i + 1;
        break;
      }
    }
  }

  emitUpdate({ documentNumber: formatted });

  nextTick(() => {
    target.setSelectionRange(newCursorPosition, newCursorPosition);
  });
};

const handlePhoneInput = (event: Event) => {
  touched.phone = true;
  const target = event.target as HTMLInputElement;
  const cursorPosition = target.selectionStart || 0;

  const digits = target.value.replace(/\D/g, "").slice(0, 8);
  const formatted = formatPhone(digits);

  const digitsBeforeCursor = target.value
    .substring(0, cursorPosition)
    .replace(/\D/g, "").length;

  let digitCount = 0;
  let newCursorPosition = formatted.length;

  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) {
      digitCount++;
      if (digitCount === digitsBeforeCursor) {
        newCursorPosition = i + 1;
        break;
      }
    }
  }

  emitUpdate({ phone: formatted });

  nextTick(() => {
    target.setSelectionRange(newCursorPosition, newCursorPosition);
  });
};

const ALLOWED_EXTENSIONS = [".pdf", ".doc", ".docx", ".jpg", ".jpeg", ".png"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

const handleContractFileChange = (file: File | null) => {
  touched.contractFile = true;
  contractFileError.value = "";

  if (!file) {
    emitUpdate({ contractFile: null });
    return;
  }

  const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    contractFileError.value = `Formato no permitido. Solo se aceptan: ${ALLOWED_EXTENSIONS.join(", ")}`;
    emitUpdate({ contractFile: null });
    return;
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    contractFileError.value =
      "El archivo es demasiado grande. El tamaño máximo es 10 MB.";
    emitUpdate({ contractFile: null });
    return;
  }

  emitUpdate({ contractFile: file });
};

const markAllFieldsTouched = () => {
  (Object.keys(touched) as (keyof typeof touched)[]).forEach((key) => {
    touched[key] = true;
  });
};

const handleSubmit = () => {
  markAllFieldsTouched();

  if (isFormComplete.value && !props.isSubmitting) {
    emit("submit");
  }
};

const loadDocumentTypes = async () => {
  isLoadingDocumentTypes.value = true;

  try {
    const { data } = await getAllUdcs({ type: "ID_TYPE" as any }, false);

    if (data) {
      documentTypeOptions.value = data;
    }
  } catch {
    documentTypeOptions.value = [];
  } finally {
    isLoadingDocumentTypes.value = false;
  }
};

onMounted(loadDocumentTypes);
</script>

<style lang="scss" scoped>
.rep-form {
  display: flex;
  flex-direction: column;
  min-height: 100%;

  &__body {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__fieldset {
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;

    &:disabled {
      opacity: 0.6;
      pointer-events: none;
    }
  }

  &__heading {
    @include label-base;
    font-size: 0.9375rem;
    color: #353e5c;
    font-weight: 600;
    padding: 0;
  }

  &__row {
    display: flex;
    gap: 1rem;

    @media (max-width: 48rem) {
      flex-direction: column;
    }
  }

  &__field {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  &__divider {
    border: none;
    border-top: 1px solid #e5e7eb;
    margin: 0.75rem 0;
  }

  &__label {
    @include label-base;
    color: #344054;
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }

  &__input {
    @include input-base;
    width: 100%;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    &:disabled {
      background-color: #f9fafb;
      cursor: not-allowed;
      opacity: 0.6;
    }

    &--invalid {
      border-color: $color-danger;
      background-color: #fef2f2;

      &:focus {
        border-color: $color-danger;
        box-shadow: 0 0 0 3px rgba($color-danger, 0.1);
      }
    }
  }

  &__error {
    display: block;
    color: $color-danger;
    font-family: $font-family-alt;
    font-size: 0.8125rem;
    line-height: 1.25;
  }

  &__submit {
    @include primary-button;
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &[aria-busy="true"] {
      cursor: wait;
    }
  }

  &__spinner {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(#fff, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: rep-form-spin 0.6s linear infinite;
  }

  &__footer {
    display: flex;
    justify-content: center;
    width: 100%;
    margin-top: auto;
    padding: 1.25rem 0;
  }

  &__login-prompt {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin: 0;
    font-family: $font-family-alt;
    font-weight: 400;
    font-size: 0.875rem;
    color: $color-text-muted;
  }

  &__login-link {
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

  &__tooltip {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  &__tooltip-icon {
    cursor: help;
    color: #6b7280;
    transition: color 0.2s ease;

    &:hover {
      color: #374151;
    }
  }

  &__tooltip-content {
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 50%;
    transform: translateX(-50%) translateY(-0.3125rem);
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
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s ease;
    pointer-events: none;

    &::before {
      content: "";
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 0.375rem solid transparent;
      border-bottom-color: #1f2937;
    }
  }

  &__tooltip:hover &__tooltip-content,
  &__tooltip:focus-within &__tooltip-content {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
    pointer-events: auto;
  }
}

@keyframes rep-form-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
