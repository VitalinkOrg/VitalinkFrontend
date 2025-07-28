<template>
  <div class="save-confirmation">
    <main class="save-confirmation__body">
      <div class="save-confirmation__body--warning-icon">
        <AtomsIconsTriangleAlertIcon size="24" />
      </div>
      <div>
        <h2 class="save-confirmation__body--title">
          ¿Está seguro de continuar?
        </h2>
        <p class="save-confirmation__body--text">
          Con estos cambios el estado de la
          <strong>reserva de la cita pasará de</strong>: pendiente a
          <strong>“Concretada”</strong>
        </p>
      </div>
    </main>

    <footer class="save-confirmation__footer">
      <button
        class="save-confirmation__footer--button-outline"
        @click="$emit('cancelSave')"
        :disabled="isLoading"
      >
        Cancelar
      </button>
      <button
        class="save-confirmation__footer--button-primary"
        :disabled="isLoading"
        @click="$emit('confirmSave')"
      >
        {{ isLoading ? "Guardando..." : "Continuar" }}
      </button>
    </footer>
  </div>
</template>

<script setup>
const { isLoading } = defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["confirmSave", "cancelSave"]);
</script>

<style lang="scss" scoped>
.save-confirmation {
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
  box-shadow: 0px 8px 8px -4px #1018280a;
  box-shadow: 0px 20px 24px -4px #1018281a;

  &__body {
    padding: 24px 24px 0px 24px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    &--title {
      @include label-base;
      font-weight: 600;
      font-size: 24px;
      line-height: 24px;
      color: #19213d;
      margin: 0;
    }

    &--text {
      @include label-base;
      font-weight: 500;
      font-size: 14px;
      line-height: 24px;
      color: #353e5c;
      margin: 0;

      strong {
        font-weight: 600;
      }
    }

    &--warning-wrapper {
      display: flex;
      align-items: center;
      width: 100%;
      gap: 10px;
      padding: 10px;
      border-radius: 12px;
      background-color: #fffaeb;
      margin-bottom: 20px;
    }

    &--warning-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background-color: #fef0c7;
      color: #dc6803;
      flex: 0 0 auto;
    }

    &--warning-text {
      @include label-base;
      font-weight: 500;
      font-size: 14px;
      line-height: 24px;
      color: #dc6803;
    }
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    padding: 24px;
    gap: 12px;

    &--button-outline {
      @include outline-button;
      width: 100%;
    }

    &--button-primary {
      @include primary-button;
      width: 100%;
    }
  }
}
</style>
