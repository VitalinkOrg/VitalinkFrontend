<template>
  <AtomsModalBase :is-open="isOpen" size="small" @close="handleCloseModal">
    <main class="cancel-appointment__body">
      <div class="cancel-appointment__content">
        <div class="cancel-appointment__content--icon">
          <AtomsIconsTriangleAlertIcon size="64" color="#FF2D46" />
        </div>
        <h2 class="cancel-appointment__content--title">
          Seguro que quieres salir del proceso de reserva?
        </h2>
        <p class="cancel-appointment__content--subtitle">
          Aun no has solicitado tu cita
        </p>
      </div>
    </main>

    <footer class="cancel-appointment__footer">
      <button
        class="cancel-appointment__footer--outline-button"
        @click="handleCloseModal"
      >
        Continuar con reserva
      </button>
      <button
        class="cancel-appointment__footer--filled-danger-button"
        @click="handleConfirmCloseModal"
      >
        Salir
      </button>
    </footer>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
interface Props {
  isOpen: boolean;
}

interface Emits {
  (e: "confirm-close-modal"): void;
  (e: "close-modal"): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleCloseModal = () => {
  emit("close-modal");
};

const handleConfirmCloseModal = () => {
  emit("confirm-close-modal");
};
</script>

<style lang="scss" scoped>
.cancel-appointment {
  &__dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 90%;
    max-width: 536px;
    z-index: 1000;
  }

  &__header {
    display: flex;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid #e4e7ec;

    &--close-button {
      @include button-base;
      background-color: transparent;
      border: none;
      padding: $spacing-sm;
      color: #353e5c;
      transition: all 0.15s ease-in-out;
      padding: 0;
      margin-left: auto;

      width: 24px;
      height: 24px;

      &:hover {
        color: $black;
      }

      &:focus-visible {
        outline: 2px solid $color-primary;
        outline-offset: 2px;
      }
    }
  }

  &__body {
    padding: 24px 20px;
  }

  &__content {
    padding: 20px;

    &--icon {
      display: flex;
      justify-content: center;
      margin-bottom: 22px;
    }

    &--subtitle,
    &--title {
      @include label-base;
    }

    &--title {
      font-weight: 700;
      font-size: 28px;
      line-height: 36px;
      text-align: center;
      color: #19213d;
    }

    &--subtitle {
      font-weight: 500;
      font-size: 20px;
      line-height: 29.5px;
      text-align: center;
      color: #6d758f;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    border-top: 1px solid #e4e7ec;
    padding: 24px;
    gap: 12px;

    &--outline-button,
    &--filled-danger-button {
      width: 100%;
      font-size: 16px;
      line-height: 24px;
    }

    &--outline-button {
      @include outline-button;
    }

    &--filled-danger-button {
      @include primary-button;
      background-color: #ff2d46;

      &:hover {
        background-color: darken(#ff2d46, 3%);
      }
    }
  }
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 500px;
  width: 100%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.modal-body {
  text-align: center;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}

.btn-outline-dark {
  border: 1px solid #dee2e6;
  color: #6c757d;
}

.btn-outline-dark:hover {
  border-color: #0d6efd;
  background-color: rgba(13, 110, 253, 0.05);
}

.btn-primary {
  background-color: #0d6efd;
  color: white;
  border: none;
}

.btn-primary:hover {
  background-color: #0b5ed7;
}
</style>
