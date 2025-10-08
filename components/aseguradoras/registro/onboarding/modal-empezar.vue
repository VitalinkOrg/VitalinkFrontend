<template>
  <slot name="trigger" :open="handleOpenModal"></slot>

  <AtomsModalBase
    :is-open="isModalOpen"
    :close-on-backdrop="false"
    @close="handleCloseModal"
    size="extra-large"
    header-class="header-border-bottom"
    footer-class="footer-border-bottom"
    modal-class="onboarding-responsive-modal height-full"
  >
    <template #title>
      <h2 class="onboarding-success-modal__title">Onboarding Bienvenida</h2>
    </template>

    <template #default>
      <div class="onboarding-success-modal__content">
        <div class="onboarding-success-modal__content-wrapper">
          <img
            src="@/src/assets/background-pattern.svg"
            alt="Patrón de fondo decorativo"
            class="onboarding-success-modal__background-pattern"
          />
          <div class="onboarding-success-modal__welcome">
            <img
              src="@/src/assets/img-fuegos-artificiales-felicidades.svg"
              alt="Ilustración de bienvenida para médicos"
              class="onboarding-success-modal__illustration"
            />
            <h3 class="onboarding-success-modal__greeting">
              Listo para empezar?
            </h3>
            <p class="onboarding-success-modal__description">
              Estamos emocionados por la oportunidad de trabajar contigo y
              ayudarte a optimizar tus operaciones. Empieza ahora!
            </p>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="onboarding-success-modal__actions">
        <button
          class="onboarding-success-modal__button onboarding-success-modal__button--primary"
          @click="handleNavigateToHome"
        >
          Ir a Home
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
const isModalOpen = ref<boolean>(false);

const handleOpenModal = () => {
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
};

const handleNavigateToHome = () => {
  handleCloseModal();
  navigateTo("/socio-financiero/inicio");
};

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
.onboarding-success-modal {
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

  &__content-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #ebecf7;
    border-radius: 15px;
    flex: 1;
    overflow: hidden;
    width: 100%;
    height: 100%;

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

  &__welcome {
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    max-width: 564px;
    gap: 10px;

    @include respond-to-max(md) {
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
    width: 176px;
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

  &__greeting {
    font-family: $font-family-montserrat-alt;
    font-weight: 800;
    font-size: 48px;
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
    text-align: center;

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
