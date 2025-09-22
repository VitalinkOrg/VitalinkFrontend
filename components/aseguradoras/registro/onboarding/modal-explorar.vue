<template>
  <slot name="trigger" :open="handleOpenModal"></slot>

  <AtomsModalBase
    :is-open="isModalOpen"
    :close-on-backdrop="false"
    @close="handleGoBack"
    size="extra-large"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
    modal-class="onboarding-modal--responsive height-full"
  >
    <template #title>
      <h1 class="onboarding-modal__title">Onboarding Bienvenida</h1>
    </template>

    <template #default>
      <main class="onboarding-modal__content">
        <aside class="onboarding-modal__image-wrapper">
          <img
            src="@/src/assets/background-pattern.svg"
            alt="Patrón de fondo decorativo"
            class="onboarding-modal__background-image"
          />

          <img
            v-if="step === 1"
            src="@/src/assets/img-executive-summary.svg"
            alt=""
            class="onboarding-modal__step-image"
          />

          <img
            v-else-if="step === 2"
            src="@/src/assets/img-credit-requests.svg"
            alt=""
            class="onboarding-modal__step-image"
          />

          <img
            v-else
            src="@/src/assets/img-connect-patients.svg"
            alt=""
            class="onboarding-modal__step-image"
          />
        </aside>

        <section class="onboarding-modal__info-section">
          <div v-if="step === 1" class="onboarding-modal__text-wrapper">
            <h2 class="onboarding-modal__main-title">
              Explora tu Resumen Ejecutivo
            </h2>
            <p class="onboarding-modal__description">
              Visualiza estadísticas clave y en tiempo real a través de gráficos
              informativos y resúmenes personalizados.
            </p>
          </div>
          <div v-else-if="step === 2" class="onboarding-modal__text-wrapper">
            <h2 class="onboarding-modal__main-title">
              Visualiza y Gestiona solicitudes de crédito con Facilidad
            </h2>
            <p class="onboarding-modal__description">
              Gestiona eficientemente solicitudes de crédito de tu gente a
              través de un menú intuitivo diseñado para simplificar tus
              operaciones.
            </p>
          </div>
          <div v-else class="onboarding-modal__text-wrapper">
            <h2 class="onboarding-modal__main-title">
              Conecta con los pacientes con Confianza
            </h2>
            <p class="onboarding-modal__description">
              Podrás comunicarte y establecer relaciones sólidas con los
              pacientes.
            </p>
          </div>
          <div class="onboarding-modal__step-navigation">
            <button
              class="onboarding-modal__step-button"
              :class="{ 'onboarding-modal__step-button--active': step === 1 }"
              @click="step = 1"
            ></button>
            <button
              class="onboarding-modal__step-button"
              :class="{ 'onboarding-modal__step-button--active': step === 2 }"
              @click="step = 2"
            ></button>
            <button
              class="onboarding-modal__step-button"
              :class="{ 'onboarding-modal__step-button--active': step === 3 }"
              @click="step = 3"
            ></button>
          </div>
        </section>
      </main>
    </template>

    <template #footer>
      <button
        type="button"
        @click="handleGoBack"
        class="onboarding-modal__action-button onboarding-modal__action-button--outline"
      >
        Volver
      </button>
      <button
        type="button"
        @click="handleNextStep"
        class="onboarding-modal__action-button onboarding-modal__action-button--primary"
      >
        Siguiente
      </button>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
const isModalOpen = ref<boolean>(false);

const step = ref<number>(1);

interface Emits {
  (e: "openWelcomeModal"): void;
  (e: "openSuccessModal"): void;
  (e: "closeWelcomeModal"): void;
}
const emit = defineEmits<Emits>();

const handleOpenModal = () => {
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
};

const handleGoBack = () => {
  if (step.value === 1) {
    handleCloseModal();
    emit("openWelcomeModal");
    return;
  }

  step.value -= 1;
};

const handleNextStep = () => {
  if (step.value === 3) {
    localStorage.removeItem("onboarding");
    emit("openSuccessModal");
    handleCloseModal();
    return;
  }

  step.value += 1;
};

defineExpose({
  handleOpenModal,
  handleCloseModal,
  isOpen: readonly(isModalOpen),
});
</script>

<style lang="scss">
.onboarding-modal--responsive.modal__dialog {
  max-height: min(90vh, 767px);
}
</style>

<style lang="scss" scoped>
.onboarding-modal {
  &__title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #2d3748;
  }

  &__content {
    display: flex;
    height: 100%;
  }

  &__image-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    width: 50%;
    background: #ebecf7;
    border-radius: 15px;
    margin: 10px;
    padding: 20px;
    overflow: hidden;
  }

  &__background-image {
    z-index: 0;
    position: absolute;
    height: 100%;
    min-height: 800px;
  }

  &__step-image {
    z-index: 1;
    width: 96%;
    height: auto;
  }

  &__info-section {
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 50%;
    margin: 10px;
    padding: 20px;
    background-color: #f8faff;
    box-shadow: 0px 1px 4px 0px #19213d14;
    border-radius: 15px;
  }

  &__text-wrapper {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    height: 244px;
  }

  &__main-title {
    font-family: $font-family-montserrat-alt;
    font-weight: 800;
    font-size: 36px;
    line-height: 49px;
    letter-spacing: 0;
    color: $color-primary;
    padding-bottom: $spacing-md;
    margin: 0;
  }

  &__description {
    @include text-base;
    font-weight: 300;
    font-size: 15px;
    line-height: 23px;
    letter-spacing: 0;
    color: #6d758f;
  }

  &__step-navigation {
    display: flex;
  }

  &__step-button {
    position: relative;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    margin: 0 5px;
    cursor: pointer;
    background: transparent;
    border: 1px solid $primary-aqua;

    &--active {
      &::after {
        content: "";
        display: block;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: $primary-aqua;
      }
    }
  }

  &__action-button {
    width: 100%;

    &--primary {
      @include primary-button;
    }

    &--outline {
      @include outline-button;
    }
  }
}
</style>
