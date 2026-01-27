<template>
  <AtomsModalBase
    :is-open="modalManager.isOpen.details"
    @close="handleClose"
    :close-on-backdrop="false"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
  >
    <template #title>
      <h5 class="credit-details__title">Detalles de la solicitud</h5>
    </template>

    <div class="credit-details">
      <MedicosTablaDetallesCita
        :rows="creditRowsWithData"
        :hidden-title="true"
        :aria-label="`Detalles de la cita de ${modalManager.credit.value?.appointment.customer.name}`"
      >
        <template #data-monto-aprobar>
          <input
            type="text"
            class="credit-details__input"
            :placeholder="
              formatCurrency(modalManager.credit.value?.requested_amount || 0, {
                decimalPlaces: 0,
              })
            "
            :value="displayAmount"
            @input="handleAmountInput"
            :class="{ 'credit-details__input--invalid': amountError }"
            :disabled="isDisabled"
            inputmode="numeric"
          />
          <small class="credit-details__help-text"
            >Debe ser igual o menor al monto solicitado.</small
          >
          <div v-if="amountError" class="credit-details__error">
            {{ amountError }}
          </div>
        </template>

        <template #data-observaciones-analisis>
          <textarea
            v-model="description"
            class="credit-details__textarea"
            placeholder="Campo para detallar motivos del ajuste si se aprueba con un monto menor"
            rows="4"
            :disabled="isDisabled"
          ></textarea>
        </template>
      </MedicosTablaDetallesCita>

      <div class="credit-details__actions">
        <button
          class="credit-details__button credit-details__button--danger-outline"
          @click="handleCancel"
          :disabled="isDisabled"
        >
          Anular Solicitud
        </button>
        <button
          class="credit-details__button credit-details__button--primary"
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
import type { TablaBaseRow } from "@/components/medicos/tabla-detalles-cita.vue";
import { useModalManager } from "@/composables/useModalManager";

const { formatDate, formatCurrency } = useFormat();
const modalManager = useModalManager();

const amountError = ref<string>("");

const approvedAmount = computed({
  get: () => modalManager.getSharedData<string>("approvedAmount") || "",
  set: (value: string) => modalManager.setSharedData("approvedAmount", value),
});

const description = computed({
  get: () => modalManager.getSharedData<string>("description") || "",
  set: (value: string) => modalManager.setSharedData("description", value),
});

const isDisabled = computed(
  () => modalManager.credit.value?.credit_status.code !== "REQUIRED"
);

const creditRowsWithData = computed((): TablaBaseRow[] => {
  if (!modalManager.credit.value) return [];

  return [
    {
      key: "paciente",
      header: "Información del Paciente:",
      value: modalManager.credit.value.appointment.customer.name,
    },
    {
      key: "especialidad",
      header: "Especialidad:",
      value:
        modalManager.credit.value.appointment.package.specialty
          .medical_specialty.name,
    },
    {
      key: "procedimiento",
      header: "Procedimiento:",
      value:
        modalManager.credit.value.appointment.package?.procedure?.name ?? "",
      class: "appointment-editor__details-row--editable",
      isEndRow: true,
    },
    {
      key: "fecha-solicitud",
      header: "Fecha de Solicitud:",
      value: formatDate(modalManager.credit.value.created_date, "short"),
      class: "appointment-editor__details-row--editable",
    },
    {
      key: "monto-solicitado",
      header: "Monto Solicitado:",
      value: modalManager.credit.value.requested_amount
        ? formatCurrency(modalManager.credit.value.requested_amount, {
            decimalPlaces: 0,
          })
        : "",
    },
    {
      key: "monto-aprobar",
      header: "Monto a Aprobar:",
      value: modalManager.credit.value.approved_amount
        ? formatCurrency(modalManager.credit.value.approved_amount, {
            decimalPlaces: 0,
          })
        : "",
    },
    {
      key: "observaciones-analisis",
      header: "Observaciones del Análisis:",
      value: modalManager.credit.value.credit_observations || "",
    },
  ];
});

const displayAmount = computed(() => {
  if (!approvedAmount.value) return "";
  return formatCurrency(Number(approvedAmount.value), {
    decimalPlaces: 0,
  });
});

const handleAmountInput = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const value = input.value;
  const numericValue = value.replace(/[^\d]/g, "");
  approvedAmount.value = numericValue;
};

const isApproveDisabled = computed<boolean>(() => {
  return (
    isDisabled.value ||
    !approvedAmount.value ||
    Number(approvedAmount.value) <= 0 ||
    (modalManager.credit.value?.requested_amount !== undefined &&
      Number(approvedAmount.value) >
        Number(modalManager.credit.value.requested_amount))
  );
});

const validateAndProceed = (): void => {
  if (!approvedAmount.value) {
    amountError.value = "El monto es requerido";
    return;
  }

  if (
    modalManager.credit.value?.requested_amount &&
    Number(approvedAmount.value) >
      Number(modalManager.credit.value.requested_amount)
  ) {
    amountError.value = `El monto no puede exceder ${formatCurrency(modalManager.credit.value.requested_amount, { decimalPlaces: 0 })}`;
    return;
  }

  if (Number(approvedAmount.value) <= 0) {
    amountError.value = "El monto debe ser mayor a 0";
    return;
  }

  amountError.value = "";
  modalManager.closeModal("details");
  modalManager.openModal("approval");
};

const handleCancel = () => {
  modalManager.closeModal("details");
  modalManager.openModal("rejection");
};

const handleClose = () => {
  amountError.value = "";
  modalManager.closeModal("details");
};

watch(
  () => modalManager.credit.value?.id,
  () => {
    amountError.value = "";
  }
);

watch(approvedAmount, (newVal) => {
  if (!newVal) {
    amountError.value = "El monto es requerido";
    return;
  }

  if (
    modalManager.credit.value?.requested_amount &&
    Number(newVal) > Number(modalManager.credit.value.requested_amount)
  ) {
    amountError.value = `El monto no puede exceder ${formatCurrency(modalManager.credit.value.requested_amount, { decimalPlaces: 0 })}`;
  } else if (Number(newVal) <= 0) {
    amountError.value = "El monto debe ser mayor a 0";
  } else {
    amountError.value = "";
  }
});
</script>

<style lang="scss" scoped>
.credit-details {
  width: 100%;
  padding: 20px 24px;

  &__title {
    font-weight: 600;
    font-size: 1.25rem;
    line-height: 1.75rem;
    letter-spacing: 0;
    color: #353e5c;
  }

  &__help-text {
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0;
    color: #667085;
  }

  &__input {
    @include input-base;
    width: 100%;

    &--invalid {
      border-color: #dc3545;

      &:focus {
        border-color: #dc3545;
        box-shadow: 0 0 0 0.25rem rgba(220, 53, 69, 0.25);
      }
    }
  }

  &__textarea {
    @include input-base;
    width: 100%;
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

  &__button {
    &--primary {
      @include primary-button;
    }

    &--danger-outline {
      @include outline-danger-button;
      border: none;
    }
  }
}
</style>
