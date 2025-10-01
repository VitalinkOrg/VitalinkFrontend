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
        <div class="registration-option">
          <input type="checkbox" id="recordarme" class="form-check-input" />
          <label for="recordarme" class="registration-option-label">
            <span>Recordarme</span>
          </label>
        </div>

        <div class="registration-option">
          <input type="checkbox" id="condiciones" class="form-check-input" />
          <label for="condiciones" class="registration-option-label">
            <span>
              He leído y acepto la
              <NuxtLink to="/">Política de Privacidad</NuxtLink> y
              <NuxtLink to="/">condiciones de uso</NuxtLink>
            </span>
          </label>
        </div>
      </div>

      <button type="submit" class="registration-submit-button">
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

const config = useRuntimeConfig();
const router = useRouter();

const register = async () => {
  const { data, error }: any = await useFetch(
    config.public.API_BASE_URL + "/auth/register",
    {
      method: "POST",
      body: {
        name: name.value,
        email: email.value,
        password: password.value,
      },
    }
  );

  if (data.value) {
    router.push("/");
  }

  if (error.value) {
    console.error(error.value);
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
  font-size: 14.7px;
  color: #425466;
}

.registration-input {
  @include input-base;
}

.registration-hint {
  font-family: $font-family-alt;
  font-size: 11.55px;
  color: #718096;
}

.registration-options-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: $spacing-lg;
}

.registration-option {
  display: flex;
  align-items: center;
  gap: $spacing-md;
}

.registration-option-label {
  font-family: $font-family-main;
  font-size: 13.65px;
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
  font-size: 10.5px;
  color: #718096;
}

.registration-social-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.registration-social-button {
  width: 71.41px;
  height: 55.99px;
  border-radius: 8.4px;
  background: #ffffff;
  border: 1px solid #dee2e6;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 1.05px 3.15px rgba(50, 50, 71, 0.1),
    0 0 1.05px rgba(12, 26, 75, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    box-shadow:
      0 2px 4px rgba(50, 50, 71, 0.1),
      0 0 2px rgba(12, 26, 75, 0.2);
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
  gap: 4px;
  margin: 0;
  font-family: $font-family-alt;
  font-weight: 400;
  font-size: 14px;
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
