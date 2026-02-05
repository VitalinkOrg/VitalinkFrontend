<template>
  <div
    class="registration-form"
    role="region"
    aria-labelledby="registration-form-title"
  >
    <h2 id="registration-form-title" class="sr-only">
      Formulario de registro con correo electrónico
    </h2>

    <form
      @submit.prevent="handleSubmit"
      class="registration-form__main"
      novalidate
      aria-describedby="form-instructions"
    >
      <p id="form-instructions" class="sr-only">
        Complete todos los campos requeridos. Los campos con asterisco son
        obligatorios.
      </p>

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
          required
          aria-required="true"
          :aria-invalid="errors.name ? 'true' : 'false'"
          :aria-describedby="errors.name ? 'nombre-error' : undefined"
          class="registration-input"
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
          Correo electrónico o número de teléfono
          <span aria-hidden="true">*</span>
        </label>
        <input
          v-model="email"
          type="email"
          id="email"
          placeholder="Tu correo electrónico o número de teléfono"
          required
          aria-required="true"
          :aria-invalid="errors.email ? 'true' : 'false'"
          :aria-describedby="errors.email ? 'email-error' : undefined"
          class="registration-input"
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
            required
            aria-required="true"
            :aria-invalid="errors.password ? 'true' : 'false'"
            :aria-describedby="
              errors.password ? 'password-error password-hint' : 'password-hint'
            "
            class="registration-input"
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

      <fieldset class="registration-options-group" aria-required="true">
        <legend class="sr-only">Aceptación de términos y políticas</legend>

        <div class="registration-terms-group">
          <div class="registration-option">
            <input
              type="checkbox"
              id="terms"
              v-model="acceptedTerms"
              class="registration-checkbox"
              aria-required="true"
              :aria-invalid="errors.terms ? 'true' : 'false'"
              :aria-describedby="errors.terms ? 'terms-error' : undefined"
              @change="validateTerms"
            />
            <label for="terms" class="registration-option-label">
              <span>
                He leído y acepto los
                <a
                  href="/documentos/terminos-condiciones.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  aria-label="Términos y Condiciones (se abre en una nueva pestaña)"
                >
                  Términos y Condiciones
                </a>
              </span>
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
              aria-required="true"
              :aria-invalid="errors.privacy ? 'true' : 'false'"
              :aria-describedby="errors.privacy ? 'privacy-error' : undefined"
              @change="validatePrivacy"
            />
            <label for="privacy" class="registration-option-label">
              <span>
                He leído y acepto la
                <a
                  href="/documentos/politica-privacidad.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  aria-label="Política de Privacidad (se abre en una nueva pestaña)"
                >
                  Política de Privacidad
                </a>
              </span>
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
        <span v-if="!isSubmitting">Registrarme</span>
        <span v-else>Procesando...</span>
      </button>
    </form>

    <div
      class="registration-social-login"
      role="region"
      aria-label="Opciones de registro social"
    >
      <p class="registration-social-login__label">
        <span>O hacerlo con:</span>
      </p>

      <div class="registration-social-buttons">
        <button
          type="button"
          class="registration-social-button registration-google-button"
          aria-label="Registrarse con Google"
          @click="loginWithGoogle"
        >
          <AtomsIconsGoogleIcon size="24" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="registration-social-button registration-apple-button"
          aria-label="Registrarse con Apple"
          @click="loginWithApple"
        >
          <AtomsIconsAppleIcon size="24" aria-hidden="true" />
        </button>
      </div>
    </div>

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

    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ statusMessage }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRuntimeConfig } from "#app";
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

const name = ref("");
const email = ref("");
const password = ref("");
const showPassword = ref(false);
const acceptedTerms = ref(false);
const acceptedPrivacy = ref(false);
const isSubmitting = ref(false);
const statusMessage = ref("");

const errors = reactive({
  name: "",
  email: "",
  password: "",
  terms: "",
  privacy: "",
});

const config = useRuntimeConfig();
const router = useRouter();

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
  const isNameValid = validateName();
  const isEmailValid = validateEmail();
  const isPasswordValid = validatePassword();
  const areTermsValid = validateTerms();
  const isPrivacyValid = validatePrivacy();

  return (
    isNameValid &&
    isEmailValid &&
    isPasswordValid &&
    areTermsValid &&
    isPrivacyValid
  );
};

const handleSubmit = async () => {
  if (!validateForm()) {
    statusMessage.value = "Por favor corrige los errores en el formulario";
    return;
  }

  isSubmitting.value = true;
  statusMessage.value = "Procesando tu registro...";

  try {
    const { data, error } = await useFetch(
      config.public.API_BASE_URL + "/auth/register",
      {
        method: "POST",
        body: {
          name: name.value,
          email: email.value,
          password: password.value,
          role_code: "CUSTOMER",
          accepted_terms: true,
          accepted_privacy: true,
        },
      },
    );

    if (data.value) {
      await useFetch(config.public.API_BASE_URL + "/forgot_password", {
        method: "POST",
        body: { email: email.value },
      });

      statusMessage.value = "Registro exitoso. Redirigiendo...";
      router.push("/auth/registro-exitoso");
    } else {
      statusMessage.value = "Error al registrar. Por favor intenta nuevamente.";
    }
  } catch (error) {
    statusMessage.value =
      "Error al procesar el registro. Por favor intenta nuevamente.";
  } finally {
    isSubmitting.value = false;
  }
};

const loginWithGoogle = () => {
  statusMessage.value = "Iniciando registro con Google...";
};

const loginWithApple = () => {
  statusMessage.value = "Iniciando registro con Apple...";
};
</script>

<style lang="scss" scoped>
.registration-form {
  width: 100%;
  margin: 0 auto;
}

.registration-form__main {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.registration-field-group {
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

  &[aria-invalid="true"] {
    border-color: $color-error;

    &:focus-visible {
      border-color: $color-error;
      box-shadow: 0 0 0 4px rgba($color-error, 0.2);
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
  margin-top: $spacing-lg;
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
  @include custom-radio;
  border-radius: 4px;
  margin-top: 2px;

  &:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }

  &[aria-invalid="true"] {
    border-color: $color-error;
  }

  &:checked {
    border-color: $color-primary;
    background-color: $color-primary;

    &::after {
      content: "✓";
      color: white;
      font-size: 12px;
      font-weight: bold;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: none;
    }
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

  &[aria-busy="true"] {
    opacity: 0.7;
    cursor: wait;
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
</style>
