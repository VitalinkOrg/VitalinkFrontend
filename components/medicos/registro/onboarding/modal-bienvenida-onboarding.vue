<template>
  <slot name="trigger" :open="handleOpenModal"></slot>

  <AtomsModalBase
    :is-open="isModalOpen"
    :close-on-backdrop="false"
    @close="handleCloseAndRemoveFlag"
    size="extra-large"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
    modal-class="onboarding-responsive-modal height-full"
  >
    <template #title>
      <h2 class="onboarding-modal__title">Onboarding Bienvenida</h2>
    </template>

    <template #default>
      <div class="onboarding-modal__content">
        <div class="onboarding-modal__wrapper">
          <img
            src="@/src/assets/background-pattern.svg"
            alt="Patrón de fondo decorativo"
            class="onboarding-modal__background-pattern"
          />
          <div class="onboarding-modal__welcome-section">
            <img
              src="@/src/assets/img-bienvenida-medicos.svg"
              alt="Ilustración de bienvenida para médicos"
              class="onboarding-modal__illustration"
            />
            <div class="onboarding-modal__message">
              <h3 class="onboarding-modal__greeting">Bienvenido!</h3>
              <p class="onboarding-modal__description">
                Completar tu perfil te ayudará a destacar y conectar con más
                pacientes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="onboarding-modal__actions">
        <button
          class="onboarding-modal__button onboarding-modal__button--outline"
          @click="handleCloseAndRemoveFlag"
        >
          Ahora no
        </button>
        <button
          class="onboarding-modal__button onboarding-modal__button--primary"
          @click="
            () => {
              handleCloseModal();
              $emit('openProviderFormModal');
            }
          "
        >
          Comenzar
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
const isModalOpen = ref<boolean>(false);

interface Emits {
  (e: "openProviderFormModal"): void;
}

defineEmits<Emits>();

const handleOpenModal = () => {
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
};

const handleCloseAndRemoveFlag = () => {
  localStorage.removeItem("onboarding");
  handleCloseModal();
};

onMounted(() => {
  const onboardingFlag = localStorage.getItem("onboarding");

  if (onboardingFlag === "true") {
    handleOpenModal();
  }
});

defineExpose({
  handleOpenModal,
  handleCloseModal,
  isOpen: readonly(isModalOpen),
});
</script>

<style lang="scss">
.onboarding-responsive-modal.modal__dialog {
  max-height: min(90vh, 767px);
}
</style>

<style lang="scss" scoped>
.onboarding-modal {
  &__title {
    @include text-base;
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    color: #353e5c;

    @include respond-to-max(md) {
      font-size: 18px;
      line-height: 24px;
    }
  }

  &__content {
    background: $white;
    padding: 20px;
    flex: 1;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;

    @include respond-to-max(md) {
      padding: $spacing-md;
      height: auto;
      min-height: calc(100vh - 200px);
    }

    @include respond-to-max(sm) {
      padding: $spacing-sm;
    }
  }

  &__wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ebecf7;
    border-radius: 15px;
    flex: 1;
    overflow: hidden;
    width: 100%;

    @include respond-to-max(md) {
      min-height: 400px;
      padding: $spacing-lg;
    }

    @include respond-to-max(sm) {
      border-radius: 8px;
      min-height: 300px;
      padding: $spacing-md;
    }
  }

  &__welcome-section {
    z-index: 10;
    display: flex;
    align-items: center;

    @include respond-to-max(md) {
      flex-direction: column;
      text-align: center;
      gap: $spacing-lg;
    }

    @include respond-to-max(sm) {
      gap: $spacing-md;
    }
  }

  &__background-pattern {
    position: absolute;
    z-index: 0;
    width: 300%;
    height: 300%;

    @include respond-to-max(md) {
      width: 200%;
      height: 200%;
    }
  }

  &__illustration {
    width: 400px;
    height: auto;

    @include respond-to-max(lg) {
      width: 300px;
    }

    @include respond-to-max(md) {
      width: 250px;
    }

    @include respond-to-max(sm) {
      width: 200px;
    }
  }

  &__message {
    max-width: 414px;

    @include respond-to-max(md) {
      max-width: 100%;
    }
  }

  &__greeting {
    font-family: $font-family-montserrat-alt;
    font-weight: 800;
    font-size: 64px;
    line-height: 39px;
    letter-spacing: 0;
    color: $color-primary;
    padding: 0px 0px 10px 0px;
    margin: 0;

    @include respond-to-max(lg) {
      font-size: 52px;
      line-height: 48px;
    }

    @include respond-to-max(md) {
      font-size: 40px;
      line-height: 36px;
    }

    @include respond-to-max(sm) {
      font-size: 32px;
      line-height: 28px;
      padding-bottom: $spacing-sm;
    }
  }

  &__description {
    font-family: $font-family-main;
    font-weight: 400;
    font-size: 16px;
    line-height: 22px;
    letter-spacing: 0;
    color: #6d758f;
    padding: 0;
    margin: 0;

    @include respond-to-max(sm) {
      font-size: 14px;
      line-height: 20px;
    }
  }

  &__actions {
    display: flex;
    gap: $spacing-md;
    width: 100%;

    @include respond-to-max(md) {
      flex-direction: column;
      gap: $spacing-sm;
    }

    @include respond-to-max(sm) {
      gap: $spacing-xs;
    }
  }

  &__button {
    &--outline {
      @include outline-button;
      width: 100%;

      @include respond-to-max(sm) {
        padding: $spacing-sm $spacing-md;
        font-size: 14px;
      }
    }

    &--primary {
      @include primary-button;
      width: 100%;

      @include respond-to-max(sm) {
        padding: $spacing-sm $spacing-md;
        font-size: 14px;
      }
    }
  }
}
</style>
