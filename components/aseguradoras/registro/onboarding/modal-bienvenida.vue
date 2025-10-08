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
              $emit('openExploreModal');
              handleCloseModal();
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
  (e: "openExploreModal"): void;
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
    font-size: 1.25rem;
    line-height: 1.75rem;
    color: #353e5c;

    @include respond-to-max(md) {
      font-size: 1.125rem;
      line-height: 1.5rem;
    }
  }

  &__content {
    background: $white;
    padding: 1.25rem;
    flex: 1;
    height: 100%;
    width: 100%;
    display: flex;
    flex-direction: column;

    @include respond-to-max(md) {
      padding: $spacing-md;
      height: auto;
      min-height: calc(100vh - 12.5rem);
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
    border-radius: 0.9375rem;
    flex: 1;
    overflow: hidden;
    width: 100%;

    @include respond-to-max(md) {
      min-height: 25rem;
      padding: $spacing-lg;
    }

    @include respond-to-max(sm) {
      border-radius: 0.5rem;
      min-height: 18.75rem;
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
    width: 25rem;
    height: auto;

    @include respond-to-max(lg) {
      width: 18.75rem;
    }

    @include respond-to-max(md) {
      width: 15.625rem;
    }

    @include respond-to-max(sm) {
      width: 12.5rem;
    }
  }

  &__message {
    max-width: 25.875rem;

    @include respond-to-max(md) {
      max-width: 100%;
    }
  }

  &__greeting {
    font-family: $font-family-montserrat-alt;
    font-weight: 800;
    font-size: 4rem;
    line-height: 2.4375rem;
    letter-spacing: 0;
    color: $color-primary;
    padding: 0 0 0.625rem 0;
    margin: 0;

    @include respond-to-max(lg) {
      font-size: 3.25rem;
      line-height: 3rem;
    }

    @include respond-to-max(md) {
      font-size: 2.5rem;
      line-height: 2.25rem;
    }

    @include respond-to-max(sm) {
      font-size: 2rem;
      line-height: 1.75rem;
      padding-bottom: $spacing-sm;
    }
  }

  &__description {
    font-family: $font-family-main;
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.375rem;
    letter-spacing: 0;
    color: $color-text-secondary;
    padding: 0;
    margin: 0;

    @include respond-to-max(sm) {
      font-size: 0.875rem;
      line-height: 1.25rem;
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
        font-size: 0.875rem;
      }
    }

    &--primary {
      @include primary-button;
      width: 100%;

      @include respond-to-max(sm) {
        padding: $spacing-sm $spacing-md;
        font-size: 0.875rem;
      }
    }
  }
}
</style>
