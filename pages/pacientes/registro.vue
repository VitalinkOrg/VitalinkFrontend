<template>
  <NuxtLayout name="pacientes-autenticacion">
    <div class="signup-container">
      <div class="signup-content">
        <!-- Botón de regresar -->
        <div v-if="signupOption === 'email'" class="signup-back-button">
          <button
            type="button"
            class="signup-back-button__control"
            @click="signupOption = null"
            aria-label="Go back"
          >
            <AtomsIconsArrowLeftIcon color="#6D758F" size="24px" />
          </button>
        </div>

        <!-- Título y subtítulo -->
        <div class="signup-header">
          <h1 class="signup-header__title">Registrarse</h1>
          <p class="signup-header__subtitle">Es gratis y fácil</p>
        </div>

        <!-- Sección de opciones -->
        <section
          v-if="signupOption === null"
          class="signup-section signup-section--option-selector"
        >
          <RegisterOptionSelector ref="selectorRef" />
        </section>

        <!-- Formulario por correo -->
        <section
          v-else-if="signupOption === 'email'"
          class="signup-section signup-section--form-email"
        >
          <RegisterWithEmailForm />
        </section>

        <!-- Formulario por cédula -->
        <section
          v-else-if="signupOption === 'idCard'"
          class="signup-section signup-section--form-idcard"
        >
          <RegisterWithIdCardWizard @back-to-selector="signupOption = null" />
        </section>
      </div>

      <!-- Acciones inferiores -->
      <div class="signup-actions" v-if="signupOption === null">
        <p class="signup-login-redirect">
          <span class="signup-login-redirect__text"
            >¿Ya tienes una cuenta?</span
          >
          <NuxtLink href="/pacientes/login" class="signup-login-redirect__link">
            Iniciar sesión
          </NuxtLink>
        </p>

        <button class="signup-actions__button" @click="continueSignup">
          Continuar
        </button>
      </div>
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import RegisterWithIdCardWizard from "@/components/pacientes/registro/asistente-registro-cedula.vue";
import RegisterWithEmailForm from "@/components/pacientes/registro/formulario-registro-correo.vue";
import RegisterOptionSelector from "@/components/pacientes/registro/selector-opcion-registro.vue";
import { ref } from "vue";

const signupOption = ref<"email" | "idCard" | null>(null);
const selectorRef = ref();

const continueSignup = () => {
  const option = selectorRef.value?.selectedOption || "email";
  signupOption.value = option;
};
</script>

<style lang="scss" scoped>
.signup-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.signup-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;

  .signup-header {
    margin-bottom: 34px;

    &__title {
      color: #27272e;
      font-family: $font-family-main;
      font-weight: 600;
      font-size: 29.41px;
      line-height: 136%;
      letter-spacing: 0;
      margin: 0;
    }

    &__subtitle {
      font-family: $font-family-main;
      font-weight: 400;
      font-size: 16.8px;
      line-height: 162%;
      letter-spacing: 0;
      color: $color-text-secondary;
      margin: 0;
    }
  }

  .signup-back-button {
    padding: 10px 0;

    &__control {
      background-color: transparent;
      border: none;
      outline: none;
      cursor: pointer;
      padding: 0;

      &:hover {
        opacity: 0.8;
      }

      &:focus {
        outline: none;
      }
    }
  }

  .signup-section {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

.signup-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  width: 100%;
  padding: 0 $spacing-lg $spacing-lg;

  .signup-login-redirect {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    margin: 0;

    &__text {
      font-family: $font-family-alt;
      font-weight: 400;
      font-size: 14px;
      line-height: 20px;
      color: $color-text-muted;
    }

    &__link {
      @include link-base;

      font-weight: 600;
      font-size: 14px;
      color: $color-primary;

      &:hover {
        text-decoration: underline;
        color: $color-primary-darkened-5;
      }
    }
  }

  &__button {
    @include primary-button;
  }
}
</style>
