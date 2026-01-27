<template>
  <div class="registration-form">
    <form @submit.prevent="register" class="registration-form__main">
      <div class="registration-field-group">
        <label for="nombre" class="registration-label">Tu nombre</label>
        <input
          v-model="name"
          type="text"
          id="nombre"
          placeholder="Escribe tu nombre"
          required
          class="registration-input"
        />
      </div>

      <div class="registration-field-group">
        <label for="email" class="registration-label"
          >Correo electrónico o número de teléfono</label
        >
        <input
          v-model="email"
          type="email"
          id="email"
          placeholder="Tu correo electrónico o número de teléfono"
          required
          class="registration-input"
        />
      </div>

      <div class="registration-field-group">
        <label for="password" class="registration-label">Contraseña</label>
        <input
          v-model="password"
          type="password"
          id="password"
          placeholder="Escribe tu contraseña"
          required
          class="registration-input"
        />
        <small class="registration-hint"
          >Debe tener al menos 8 caracteres</small
        >
      </div>

      <div class="registration-options-group">
        <div class="registration-terms-group">
          <div class="registration-option">
            <input
              type="checkbox"
              id="terms"
              v-model="acceptedTerms"
              class="form-check-input"
            />
            <label for="terms" class="registration-option-label">
              <span>
                He leído y acepto los
                <a
                  href="/documentos/terminos-condiciones.pdf"
                  target="_blank"
                  download
                >
                  Términos y Condiciones
                </a>
              </span>
            </label>
          </div>

          <div class="registration-option">
            <input
              type="checkbox"
              id="privacy"
              v-model="acceptedPrivacy"
              class="form-check-input"
            />
            <label for="privacy" class="registration-option-label">
              <span>
                He leído y acepto la
                <a
                  href="/documentos/politica-privacidad.pdf"
                  target="_blank"
                  download
                >
                  Política de Privacidad
                </a>
              </span>
            </label>
          </div>
        </div>
      </div>

      <button
        type="submit"
        class="registration-submit-button"
        :disabled="!acceptedTerms || !acceptedPrivacy"
      >
        Registrarme
      </button>
    </form>

    <div class="registration-social-login">
      <p class="registration-social-login__label">
        <span>O hacerlo con:</span>
      </p>

      <div class="registration-social-buttons">
        <button class="registration-social-button registration-google-button">
          <AtomsIconsGoogleIcon size="24" />
        </button>
        <button class="registration-social-button registration-apple-button">
          <AtomsIconsAppleIcon size="24" />
        </button>
      </div>
    </div>

    <div class="registration-footer-actions">
      <p class="registration-already-account">
        <span>¿Ya tienes una cuenta?</span>
        <NuxtLink to="/pacientes/login" class="registration-login-link"
          >Iniciar sesión</NuxtLink
        >
      </p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useRuntimeConfig } from "#app";
import { ref } from "vue";
import { useRouter } from "vue-router";

const name = ref("");
const email = ref("");
const password = ref("");

const acceptedTerms = ref(false);
const acceptedPrivacy = ref(false);

const config = useRuntimeConfig();
const router = useRouter();

const register = async () => {
  if (!acceptedTerms.value || !acceptedPrivacy.value) {
    return;
  }

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

    router.push("/auth/registro-exitoso");
  }
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
}

.registration-hint {
  font-family: $font-family-alt;
  font-size: 0.721875rem;
  color: #718096;
}

.registration-options-group {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  margin-top: $spacing-lg;
}

.registration-option {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.registration-option-label {
  font-family: $font-family-main;
  font-size: 0.853125rem;
  line-height: 1.4;
  color: #353e5c;

  a {
    @include link-base;

    &:hover {
      color: darken($color-text-secondary, 10%);
    }
  }
}

.registration-submit-button {
  @include button-base;
  @include primary-button;
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
  }

  &:active {
    transform: translateY(0);
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
}
</style>
