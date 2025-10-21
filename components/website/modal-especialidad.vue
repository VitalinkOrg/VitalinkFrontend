<template>
  <button
    class="specialty-modal-trigger"
    @click="handleOpenModal"
    type="button"
    aria-label="Leer más sobre cirugía correctiva"
  >
    <span class="specialty-modal-trigger__text">Leer más</span>
    <AtomsIconsArrowRightIcon class="specialty-modal-trigger__icon" />
  </button>

  <AtomsModalBase
    :is-open="isOpen"
    @close="handleCloseModal"
    :show-close-button="false"
    :hideHeader="true"
  >
    <article class="specialty-modal">
      <header class="specialty-modal__header">
        <div class="specialty-modal__header-content">
          <AtomsIconsPhoneIcon class="specialty-modal__header-icon" />
          <h2 class="specialty-modal__title">
            {{ data?.title }}
          </h2>
        </div>
        <button
          class="specialty-modal__close-button"
          type="button"
          @click="handleCloseModal"
          aria-label="Cerrar modal"
        >
          <AtomsIconsXIcon
            class="specialty-modal__close-icon"
            width="24"
            height="24"
            aria-hidden="true"
          />
        </button>
      </header>

      <div class="specialty-modal__body">
        <section class="specialty-modal__intro">
          <p class="specialty-modal__intro-highlight">
            <strong>
              {{ data?.intro?.highlight }}
            </strong>
            {{ data?.intro?.text }}
          </p>
          <p class="specialty-modal__intro-text">
            Si no se corrigen, pueden afectar tu desempeño diario y empeorar con
            el tiempo.
          </p>
        </section>

        <section class="specialty-modal__solution">
          <div class="specialty-modal__solution-icon">
            <AtomsIconsDoctorIcon />
          </div>
          <div class="specialty-modal__solution-content">
            <h3 class="specialty-modal__solution-title">
              Solución especializada
            </h3>
            <p class="specialty-modal__solution-text">
              {{ data?.specializedSolution }}
            </p>
          </div>
        </section>

        <section class="specialty-modal__procedure">
          <h3 class="specialty-modal__procedure-title">
            ¿En qué consiste el procedimiento?
          </h3>
          <p class="specialty-modal__procedure-description">
            <strong>
              {{ data?.procedureConsistOf?.text }}
            </strong>
          </p>
          <p class="specialty-modal__procedure-benefits">
            {{ data?.procedureConsistOf?.additionalText }}
          </p>
        </section>
      </div>
    </article>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import type { ModalContent } from "@/types";

interface Props {
  data?: ModalContent;
}

defineProps<Props>();

const isOpen = ref<boolean>(false);

const handleOpenModal = () => {
  isOpen.value = true;
};

const handleCloseModal = () => {
  isOpen.value = false;
};
</script>

<style lang="scss" scoped>
.specialty-modal-trigger {
  @include button-base;
  font-weight: 600;
  font-size: 0.875rem;
  line-height: 125%;
  letter-spacing: 0;
  color: $primary-aqua;
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  width: min-content;
  text-wrap: nowrap;
  padding: 0;

  @include respond-to(md) {
    font-size: 1rem;
  }

  &:hover {
    text-decoration: underline;
  }
}

.specialty-modal {
  margin: 0.625rem;
  padding: 1.25rem;
  border-radius: 0.75rem;
  border-width: 0.063rem;
  border: 0.063rem solid #c2ebee;
  @include space-y(2rem);

  &__close-button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
    color: #64748b;

    &:hover {
      background-color: #f1f5f9;
      color: #374151;
    }

    &:focus {
      outline: 0.125rem solid $primary-aqua;
      outline-offset: 0.125rem;
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__header-content {
    display: flex;
    align-items: center;
    gap: 1.25rem;
  }

  &__header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $primary-aqua;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0.625rem;
    border-radius: 0.688rem;
    color: $white;
  }

  &__body {
    @include space-y(1.438rem);
  }

  &__title {
    font-weight: 700;
    font-size: 1.125rem;
    line-height: 125%;
    letter-spacing: 0;
    color: #19213d;
  }

  &__close-icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  &__solution {
    display: flex;
    border-radius: 0.75rem;
    gap: 0.625rem;
    padding: 1.25rem;
    background: linear-gradient(90deg, #eff6fe 0%, #f0fcf5 100%);
  }

  &__intro-highlight,
  &__procedure-benefits,
  &__procedure-description,
  &__custom-content {
    font-weight: 400;
    font-size: 1rem;
    line-height: 150%;
    letter-spacing: 0;

    strong {
      font-weight: 600;
      color: #353e5c;
    }
  }

  &__solution-icon {
    color: $primary-aqua;
    width: 1.5rem;
    height: 1.5rem;
  }

  &__solution-title,
  &__procedure-title,
  &__custom-title {
    font-weight: 600;
    font-size: 1rem;
    line-height: 150%;
    letter-spacing: 0;
    color: #353e5c;
  }

  &__procedure,
  &__custom-section {
    display: flex;
    flex-direction: column;
    gap: 1.188rem;
  }
}
</style>
