<template>
  <AtomsModalBase
    :is-open="isOpen"
    @close="handleCloseModal"
    :close-on-backdrop="false"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
  >
    <div class="credit-confirmation">
      <span class="credit-confirmation__success-icon">
        <img src="@/src/assets/check.svg" width="48" alt="Success" />
      </span>

      <h4 class="credit-confirmation__title">¡Solicitud Aprobada!</h4>

      <p class="credit-confirmation__text">
        La solicitud de crédito ha sido aprobada exitosamente
      </p>

      <table class="credit-confirmation__table">
        <tbody>
          <tr class="credit-confirmation__row">
            <td class="credit-confirmation__label">Paciente:</td>
            <td class="credit-confirmation__value">
              {{ credit.appointment.customer.name }}
            </td>
          </tr>
          <tr class="credit-confirmation__row">
            <td class="credit-confirmation__label">Monto Aprobado:</td>
            <td class="credit-confirmation__value">₡{{ approvedAmount }}</td>
          </tr>
          <tr class="credit-confirmation__row">
            <td class="credit-confirmation__label">Documento:</td>
            <td class="credit-confirmation__value">
              {{ uploadedFile?.name }}
            </td>
          </tr>
          <tr class="credit-confirmation__row">
            <td class="credit-confirmation__label">Fecha de aprobación:</td>
            <td class="credit-confirmation__value">
              {{ credit.appointment.appointment_credit?.updated_date }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="credit-confirmation__actions">
        <button
          class="credit-confirmation__btn credit-confirmation__btn--primary"
          @click="handleCloseModal"
        >
          Finalizar
        </button>
      </div>
    </div>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import type { Credit } from "~/types";

interface Props {
  credit: Credit;
  approvedAmount: string | null;
  uploadedFile: File | null;
}

interface Emits {
  (e: "close"): void;
}

defineProps<Props>();
defineEmits<Emits>();

const isOpen = ref<boolean>(false);

const handleOpenModal = () => {
  isOpen.value = true;
};

const handleCloseModal = () => {
  isOpen.value = false;
};

defineExpose({
  handleOpenModal,
  handleCloseModal,
  isOpen: readonly(isOpen),
});
</script>

<style lang="scss" scoped>
.credit-confirmation {
  width: 100%;
  text-align: center;

  &__success-icon {
    display: flex;
    justify-content: center;
    margin-bottom: 1rem;
  }

  &__title {
    font-size: 1.5rem;
    color: #0d6efd;
    margin-bottom: 1rem;
  }

  &__text {
    margin-bottom: 1.5rem;
    color: #6c757d;
  }

  &__table {
    width: 100%;
    margin-bottom: 1rem;
    border-collapse: collapse;
    text-align: left;
  }

  &__row {
    border: none;
  }

  &__label {
    padding: 0.5rem;
    color: #6c757d;
    vertical-align: top;
  }

  &__value {
    padding: 0.5rem;
  }

  &__actions {
    display: flex;
    justify-content: center;
    margin-top: 1.5rem;
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

    &--primary {
      color: #fff;
      background-color: #0d6efd;
      border-color: #0d6efd;

      &:hover {
        background-color: #0b5ed7;
        border-color: #0a58ca;
      }
    }
  }
}
</style>
