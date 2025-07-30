<template>
  <div class="confirmation-not-suitable">
    <header class="confirmation-not-suitable__header">
      <button
        type="button"
        class="confirmation-not-suitable__close-button"
        aria-label="Cerrar modal de detalles de la cita"
        @click="closeModal"
      >
        <AtomsIconsXIcon width="24" height="24" aria-hidden="true" />
      </button>
    </header>

    <main class="confirmation-not-suitable__body">
      <h5 class="confirmation-not-suitable__body--title">
        ¿Está seguro que desea finalizar con la valoración?
      </h5>

      <p class="confirmation-not-suitable__body--subtitle">
        Esta acción marcará la valoración como completada indicando que el
        paciente no es candidato para el procedimiento solicitado.
      </p>
    </main>

    <footer class="confirmation-not-suitable__footer">
      <button
        class="confirmation-not-suitable__button--outline"
        @click="$emit('cancel')"
      >
        No, volver
      </button>
      <button
        class="confirmation-not-suitable__button--primary"
        @click="$emit('confirmNotSuitable')"
      >
        Sí, confirmar
      </button>
    </footer>
  </div>
</template>

<script setup>
const emit = defineEmits(["confirmNotSuitable", "cancel"]);
const props = defineProps(["closeModal"]);
</script>

<style lang="scss" scoped>
.confirmation-not-suitable {
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: 536px;
  width: 100%;
  max-height: calc(100vh - 3rem);
  pointer-events: auto;
  background-color: $white;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  outline: 0;
  overflow: hidden;
  box-shadow:
    0px 8px 8px -4px #1018280a,
    0px 20px 24px -4px #1018281a;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg;
    background-color: $white;
  }

  &__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 39px;
    height: 39px;
    background-color: $color-danger;
    border-radius: 50%;
    margin-right: $spacing-sm;
    border: 6.5px solid #fac6d0;
    svg {
      color: $white;
    }
  }

  &__title {
    font-family: $font-family-main;
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    color: #353e5c;
    margin: 0;
  }

  &__close-button {
    @include button-base;
    background-color: transparent;
    border: none;
    padding: $spacing-sm;
    color: #353e5c;
    border-radius: 50%;
    transition: all 0.15s ease-in-out;
    margin-left: auto;

    &:hover {
      color: $black;
      background-color: #f5f5f5;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }

  &__body {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 24px 24px 0px 24px;
    overflow-y: auto;
    flex: 1;

    &--title {
      @include label-base;
      font-weight: 600;
      font-size: 24px;
      line-height: 24px;
      color: #19213d;
      margin: 0;
    }

    &--subtitle {
      @include label-base;
      font-weight: 500;
      font-size: 14px;
      line-height: 24px;
      color: #353e5c;
      margin: 0;
    }
  }

  &__footer {
    border-top: 1px solid #e4e7ec;
    padding: 24px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
  }

  &__button {
    &--outline {
      @include outline-button;
      width: 100%;
    }

    &--primary {
      @include primary-button;
      width: 100%;
    }
  }
}
</style>
