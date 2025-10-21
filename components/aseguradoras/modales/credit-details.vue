<template>
  <button
    class="credit-details__trigger"
    @click="handleOpenModal"
    :disabled="disabled"
  >
    Ver Detalles
  </button>

  <AtomsModalBase
    :is-open="isOpen"
    @close="handleCloseModal"
    :close-on-backdrop="false"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
  >
    <div class="credit-details">
      <h5 class="credit-details__title">Detalles de la solicitud</h5>

      <table class="credit-details__table">
        <tbody>
          <tr class="credit-details__row">
            <td class="credit-details__label">Información del Paciente:</td>
            <td class="credit-details__value">
              {{ credit.appointment.customer.name }}
            </td>
          </tr>
          <tr class="credit-details__row">
            <td class="credit-details__label">Especialidad:</td>
            <td class="credit-details__value">
              {{ credit.appointment.package.specialty.medical_specialty.name }}
            </td>
          </tr>
          <tr class="credit-details__row">
            <td class="credit-details__label">Procedimiento:</td>
            <td class="credit-details__value">
              {{ credit.appointment.package?.procedure?.name }}
            </td>
          </tr>
          <tr class="credit-details__row">
            <td class="credit-details__label">Fecha de Solicitud:</td>
            <td class="credit-details__value">
              {{ formatDate(credit.created_date) }}
            </td>
          </tr>
          <tr class="credit-details__row">
            <td class="credit-details__label">Monto Solicitado:</td>
            <td class="credit-details__value">
              {{
                formatCurrency(credit.requested_amount, { decimalPlaces: 0 })
              }}
            </td>
          </tr>
          <tr class="credit-details__row">
            <td class="credit-details__label">Monto a Aprobar:</td>
            <td class="credit-details__value">
              <input
                type="number"
                :value="approvedAmount"
                @input="
                  $emit(
                    'update:approved-amount',
                    ($event.target as HTMLInputElement).value
                  )
                "
                :max="credit.requested_amount"
                class="credit-details__input"
                :class="{ 'credit-details__input--invalid': amountError }"
              />
              <div v-if="amountError" class="credit-details__error">
                {{ amountError }}
              </div>
            </td>
          </tr>
          <tr class="credit-details__row">
            <td class="credit-details__label">Observaciones del Análisis:</td>
            <td class="credit-details__value">
              <textarea
                :value="description"
                @input="
                  $emit(
                    'update:description',
                    ($event.target as HTMLTextAreaElement).value
                  )
                "
                class="credit-details__textarea"
                rows="3"
                placeholder="Campo para detallar motivos del ajuste si se aprueba con un monto menor"
                :disabled="proformaGuardado"
              ></textarea>
            </td>
          </tr>
        </tbody>
      </table>

      <div class="credit-details__actions">
        <button
          class="credit-details__btn credit-details__btn--danger-outline"
          @click="handleCancel"
        >
          Anular Solicitud
        </button>
        <button
          class="credit-details__btn credit-details__btn--primary"
          @click="validateAndProceed"
          :disabled="isApproveDisabled"
        >
          Aprobar Solicitud
        </button>
      </div>
    </div>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import type { Credit } from "@/types";

interface Props {
  credit: Credit;
  approvedAmount: string | null;
  description: string;
  amountError: string;
  proformaGuardado: boolean;
  disabled: boolean;
}

interface Emits {
  (e: "update:approved-amount", value: string): void;
  (e: "update:description", value: string): void;
  (e: "next-step"): void;
  (e: "cancel-step"): void;
}

const { formatDate, formatCurrency } = useFormat();

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isOpen = ref<boolean>(false);

const handleOpenModal = () => {
  isOpen.value = true;
};

const handleCloseModal = () => {
  isOpen.value = false;
};

const isApproveDisabled = computed<boolean>(() => {
  return (
    !props.approvedAmount ||
    Number(props.approvedAmount) <= 0 ||
    (props.credit?.requested_amount !== undefined &&
      props.approvedAmount > props.credit.requested_amount)
  );
});

const validateAndProceed = (): void => {
  if (!props.approvedAmount) {
    return;
  }

  if (
    props.credit?.requested_amount &&
    props.approvedAmount > props.credit.requested_amount
  ) {
    return;
  }

  if (Number(props.approvedAmount) <= 0) {
    return;
  }

  emit("next-step");
  handleCloseModal();
};

const handleCancel = () => {
  emit("cancel-step");
  handleCloseModal();
};

defineExpose({
  handleOpenModal,
  handleCloseModal,
  isOpen: readonly(isOpen),
});
</script>

<style lang="scss" scoped>
.credit-modal {
  &__button {
    &--outline {
      @include outline-button;
      border-radius: 8px;
      border-width: 1px;
      padding: 8px 14px;
      gap: 8px;
      opacity: 1;
      font-weight: 600;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0;
    }
  }

  &__content {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
  }
}

%table-base {
  width: 100%;
  margin-bottom: 1rem;
  border-collapse: collapse;
}

%table-row {
  border: none;
}

%table-label {
  padding: 0.5rem;
  color: #6c757d;
  vertical-align: top;
}

%table-value {
  padding: 0.5rem;
}

%input-base {
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

%btn-base {
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
}

%btn-primary {
  @extend %btn-base;
  color: #fff;
  background-color: #0d6efd;
  border-color: #0d6efd;

  &:hover:not(:disabled) {
    background-color: #0b5ed7;
    border-color: #0a58ca;
  }
}

%btn-danger {
  @extend %btn-base;
  color: #fff;
  background-color: #dc3545;
  border-color: #dc3545;

  &:hover:not(:disabled) {
    background-color: #bb2d3b;
    border-color: #b02a37;
  }
}

%btn-danger-outline {
  @extend %btn-base;
  color: #dc3545;
  background-color: transparent;
  border-color: #dc3545;

  &:hover:not(:disabled) {
    color: #fff;
    background-color: #dc3545;
    border-color: #dc3545;
  }
}

%btn-dark-outline {
  @extend %btn-base;
  color: #212529;
  background-color: transparent;
  border-color: #212529;

  &:hover:not(:disabled) {
    color: #fff;
    background-color: #212529;
    border-color: #212529;
  }
}

%error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

%title-base {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

%description-base {
  color: #6c757d;
  margin-bottom: 1rem;
}

.credit-details {
  width: 100%;
  padding: 20px 24px;

  &__trigger {
    @include outline-button;
    padding: 8px;
    font-size: 14px;
    text-wrap: nowrap;
  }

  &__title {
    font-weight: 600;
    font-size: 1.25rem;
    line-height: 1.75rem;
    letter-spacing: 0;
    color: #353e5c;
  }

  &__table {
    width: 100%;
    margin-bottom: 1rem;
    border-collapse: collapse;
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

  &__input {
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

    &--invalid {
      border-color: #dc3545;

      &:focus {
        border-color: #dc3545;
        box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
      }
    }
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

    &:disabled {
      background-color: #e9ecef;
      opacity: 1;
    }
  }

  &__error {
    color: #dc3545;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
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

    &:disabled {
      pointer-events: none;
      opacity: 0.65;
    }

    &--primary {
      color: #fff;
      background-color: #0d6efd;
      border-color: #0d6efd;

      &:hover:not(:disabled) {
        background-color: #0b5ed7;
        border-color: #0a58ca;
      }
    }

    &--danger-outline {
      color: #dc3545;
      background-color: transparent;
      border-color: #dc3545;

      &:hover:not(:disabled) {
        color: #fff;
        background-color: #dc3545;
        border-color: #dc3545;
      }
    }
  }
}
</style>
