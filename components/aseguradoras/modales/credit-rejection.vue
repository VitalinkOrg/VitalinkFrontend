<template>
  <AtomsModalBase
    :is-open="isOpen"
    @close="handleCloseModal"
    :close-on-backdrop="false"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
  >
    <div class="credit-rejection">
      <img
        src="@/src/assets/trash.svg"
        alt="Alerta"
        class="credit-rejection__alert-icon"
      />

      <h5 class="credit-rejection__title">
        ¿Seguro que quieres rechazar esta solicitud?
      </h5>

      <p class="credit-rejection__description">
        ¿Está seguro de rechazar esta solicitud? Al rechazar, el paciente
        recibirá un voucher de descuento de Vitalink.
      </p>

      <div class="credit-rejection__form-group">
        <label for="rejectionReason" class="credit-rejection__form-label">
          Motivo del rechazo:
        </label>
        <textarea
          id="rejectionReason"
          :value="rejectionReason"
          @input="
            $emit(
              'update:rejection-reason',
              ($event.target as HTMLTextAreaElement).value
            )
          "
          class="credit-rejection__textarea"
          rows="3"
          placeholder="Explique el motivo del rechazo..."
        ></textarea>
      </div>

      <div class="credit-rejection__actions">
        <button
          class="credit-rejection__btn credit-rejection__btn--dark-outline"
          @click="handleGoBack"
        >
          Volver
        </button>
        <button
          class="credit-rejection__btn credit-rejection__btn--danger"
          @click="handleConfirm"
          :disabled="!rejectionReason"
        >
          Confirmar Rechazo
        </button>
      </div>
    </div>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
interface Props {
  rejectionReason: string;
}

interface Emits {
  (e: "update:rejection-reason", value: string): void;
  (e: "back"): void;
  (e: "confirm"): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const isOpen = ref<boolean>(false);

const handleOpenModal = () => {
  isOpen.value = true;
};

const handleCloseModal = () => {
  isOpen.value = false;
};

const handleConfirm = () => {
  emit("confirm");
  handleCloseModal();
};

const handleGoBack = () => {
  emit("back");
  handleCloseModal();
};

defineExpose({
  handleOpenModal,
  handleCloseModal,
  isOpen: readonly(isOpen),
});
</script>

<style lang="scss" scoped>
.credit-rejection {
  width: 100%;

  &__alert-icon {
    height: 3rem;
    margin-bottom: 1rem;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  &__description {
    color: #6c757d;
    margin-bottom: 1rem;
  }

  &__form-group {
    margin-bottom: 1rem;
  }

  &__form-label {
    display: inline-block;
    margin-bottom: 0.5rem;
  }

  &__textarea {
    display: block;
    width: 100%;
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    color: #212529;
    background-color: #fff;
    border: 1px solid #ced4da;
    border-radius: 0.375rem;
    resize: vertical;
    transition:
      border-color 0.15s ease-in-out,
      box-shadow 0.15s ease-in-out;

    &:focus {
      color: #212529;
      background-color: #fff;
      border-color: #86b7fe;
      outline: 0;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
    }
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    margin-top: 1.5rem;

    .credit-rejection__btn {
      flex: 1;
    }
  }

  &__btn {
    padding: 0.5rem 1rem;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5;
    border-radius: 0.375rem;
    border: 1px solid transparent;
    cursor: pointer;
    transition:
      color 0.15s ease-in-out,
      background-color 0.15s ease-in-out,
      border-color 0.15s ease-in-out,
      box-shadow 0.15s ease-in-out;

    &:disabled {
      pointer-events: none;
      opacity: 0.65;
    }

    &--danger {
      color: #fff;
      background-color: #dc3545;
      border-color: #dc3545;

      &:hover:not(:disabled) {
        background-color: #bb2d3b;
        border-color: #b02a37;
      }
    }

    &--dark-outline {
      color: #212529;
      background-color: transparent;
      border-color: #212529;

      &:hover:not(:disabled) {
        color: #fff;
        background-color: #212529;
        border-color: #212529;
      }
    }
  }
}
</style>
