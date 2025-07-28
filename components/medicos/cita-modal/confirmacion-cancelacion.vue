<template>
  <div class="confirm-cancellation">
    <header class="confirm-cancellation__header">
      <span class="confirm-cancellation__icon">
        <AtomsIconsCircleXIcon size="15" />
      </span>
      <button
        type="button"
        class="confirm-cancellation__close-button"
        aria-label="Cerrar modal de detalles de la cita"
        @click="$emit('goBack')"
      >
        <AtomsIconsXIcon width="24" height="24" aria-hidden="true" />
      </button>
    </header>

    <main class="confirm-cancellation__body">
      <h2 class="confirm-cancellation__body--title">
        Seguro que quieres anular esta cita?
      </h2>
      <p class="confirm-cancellation__body--text">
        Se le enviará un correo electrónico automático al usuario avisándole que
        su cita ha sido cancelada.
      </p>
    </main>

    <footer class="confirm-cancellation__footer">
      <button
        class="confirm-cancellation__footer--button-go-back"
        @click="$emit('goBack')"
      >
        No, volver
      </button>
      <button
        class="confirm-cancellation__footer--button-confirm"
        @click="$emit('cancelAppointment')"
      >
        Sí, cancelar
      </button>
    </footer>
  </div>
</template>

<script lang="ts" setup>
const emit = defineEmits(["goBack", "cancelAppointment"]);
</script>

<style lang="scss" scoped>
.confirm-cancellation {
  position: relative;
  display: flex;
  flex-direction: column;
  max-width: 400px;
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
    padding: 0px 24px;

    &--title {
      @include label-base;
      font-weight: 600;
      font-size: 20px;
      line-height: 30px;
      color: #19213d;
    }
    &--text {
      @include label-base;
      font-weight: 500;
      font-size: 14px;
      line-height: 24px;
      color: #6d758f;
    }
  }

  &__footer {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    padding: 24px;

    &--button-go-back,
    &--button-confirm {
      @include button-base;
      font-weight: 600;
      font-size: 14px;
      line-height: 20px;
      width: 100%;
    }

    &--button-go-back {
      @include outline-button;
      font-weight: 600;
      font-size: 14px;
      line-height: 20px;
    }

    &--button-confirm {
      background-color: $color-danger;
      color: $white;
      border: none;

      &:hover {
        background-color: darken($color-danger, 3%);
      }

      &:focus-visible {
        outline: 2px solid $color-danger;
        outline-offset: 2px;
      }
    }
  }
}
</style>
