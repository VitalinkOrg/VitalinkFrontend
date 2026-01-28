<template>
  <NuxtLayout name="pacientes-autenticacion">
    <div class="signup-container" role="main" aria-labelledby="signup-title">
      <div
        class="signup-content"
        role="region"
        aria-live="polite"
        aria-atomic="false"
      >
        <div v-if="signupOption === 'email'" class="signup-back-button">
          <button
            type="button"
            class="signup-back-button__control"
            @click="handleBack"
            aria-label="Volver a opciones de registro"
          >
            <AtomsIconsArrowLeftIcon
              color="#6D758F"
              size="24px"
              aria-hidden="true"
            />
          </button>
        </div>

        <div class="signup-header">
          <h1
            id="signup-title"
            class="signup-header__title"
            tabindex="-1"
            ref="titleRef"
          >
            Registrarse
          </h1>
          <p class="signup-header__subtitle" aria-describedby="signup-title">
            Es gratis y fácil
          </p>
        </div>

        <section
          v-if="signupOption === null"
          class="signup-section signup-section--option-selector"
          aria-labelledby="signup-title"
        >
          <RegisterOptionSelector ref="selectorRef" />
        </section>

        <section
          v-else-if="signupOption === 'email'"
          class="signup-section signup-section--form-email"
          aria-label="Formulario de registro con correo electrónico"
        >
          <RegisterWithEmailForm />
        </section>

        <section
          v-else-if="signupOption === 'idCard'"
          class="signup-section signup-section--form-idcard"
          aria-label="Formulario de registro con cédula"
        >
          <RegisterWithIdCardWizard @back-to-selector="handleBackToSelector" />
        </section>
      </div>

      <div
        class="signup-actions"
        v-if="signupOption === null"
        role="navigation"
        aria-label="Acciones de registro"
      >
        <p class="signup-login-redirect">
          <span class="signup-login-redirect__text"
            >¿Ya tienes una cuenta?</span
          >
          <NuxtLink
            href="/auth/login"
            class="signup-login-redirect__link"
            aria-label="Ir a iniciar sesión"
          >
            Iniciar sesión
          </NuxtLink>
        </p>

        <button
          class="signup-actions__button"
          @click="continueSignup"
          :aria-label="`Continuar con registro por ${selectorRef?.selectedOption === 'idCard' ? 'cédula' : 'correo electrónico'}`"
        >
          Continuar
        </button>
      </div>

      <div
        class="sr-only"
        role="status"
        aria-live="assertive"
        aria-atomic="true"
      >
        {{ statusMessage }}
      </div>
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import RegisterWithIdCardWizard from "@/components/pacientes/registro/asistente-registro-cedula.vue";
import RegisterWithEmailForm from "@/components/pacientes/registro/formulario-registro-correo.vue";
import RegisterOptionSelector from "@/components/pacientes/registro/selector-opcion-registro.vue";
import { nextTick, ref, watch } from "vue";

const signupOption = ref<"email" | "idCard" | null>(null);
const selectorRef = ref();
const titleRef = ref<HTMLElement>();
const statusMessage = ref("");

const continueSignup = () => {
  const option = selectorRef.value?.selectedOption || "email";
  signupOption.value = option;
  statusMessage.value = `Mostrando formulario de registro por ${option === "idCard" ? "cédula" : "correo electrónico"}`;
};

const handleBack = () => {
  signupOption.value = null;
  statusMessage.value = "Volviendo a opciones de registro";
};

const handleBackToSelector = () => {
  signupOption.value = null;
  statusMessage.value = "Volviendo a opciones de registro";
};

watch(signupOption, async () => {
  await nextTick();
  titleRef.value?.focus();
});
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

      &:focus {
        outline: 2px solid $color-primary;
        outline-offset: 4px;
      }
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
      padding: 8px;
      margin: -8px;
      border-radius: $border-radius-md;

      &:hover {
        opacity: 0.8;
        background-color: rgba(109, 117, 143, 0.1);
      }

      &:focus-visible {
        outline: 2px solid $color-primary;
        outline-offset: 2px;
      }

      &:active {
        transform: scale(0.95);
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

      &:focus-visible {
        outline: 2px solid $color-primary;
        outline-offset: 2px;
        border-radius: 2px;
      }
    }
  }

  &__button {
    @include primary-button;
  }
}

.sr-only {
  @include visually-hidden;
}
</style>
