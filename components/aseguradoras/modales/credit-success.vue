<template>
  <AtomsModalBase
    :is-open="modalManager.isOpen.success"
    @close="handleClose"
    :close-on-backdrop="false"
    size="large"
  >
    <div class="credit-success">
      <div class="credit-success__header-container">
        <span class="credit-success__success-icon">
          <AtomsIconsCircleCheckBigIcon size="20" />
        </span>
        <h4 class="credit-success__title">¡Fantástico!</h4>
        <p class="credit-success__text">
          La solicitud ha sido procesada correctamente
        </p>
      </div>
      <div class="credit-success__table-container">
        <MedicosTablaDetallesCita :rows="rowsWithData" />
      </div>
    </div>

    <template #footer>
      <div class="credit-success__actions">
        <button
          class="credit-success__button credit-success__button--primary"
          @click="handleClose"
        >
          Cerrar
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useModalManager } from "@/composables/useModalManager";
import type { TablaBaseRow } from "~/components/medicos/tabla-detalles-cita.vue";

const modalManager = useModalManager();
const { formatDate, formatCurrency } = useFormat();

const rowsWithData = computed((): TablaBaseRow[] => {
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
      isEndRow: true,
    },
    {
      key: "monto",
      header: "Monto:",
      value: formatCurrency(modalManager.credit.value.approved_amount || 0, {
        decimalPlaces: 0,
      }),
    },
    {
      key: "fecha-solicitud",
      header: "Fecha de Solicitud:",
      value: formatDate(modalManager.credit.value.created_date),
    },
  ];
});

const handleClose = async () => {
  modalManager.closeAllModals();
  modalManager.clearSharedData();

  // Refresh credits if function is available
  if (modalManager.refreshCredits.value) {
    await modalManager.refreshCredits.value();
  }
};
</script>

<style lang="scss" scoped>
.credit-success {
  width: 100%;
  padding: 24px;

  &__header-container {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    text-align: center;
  }

  &__success-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 48px;
    height: 48px;
    border-radius: 28px;
    background: #d1fadf;
    border: 8px solid #ecfdf3;
    color: #039855;
  }

  &__title {
    font-weight: 600;
    font-size: 26px;
    line-height: 32px;
    letter-spacing: 0;
    text-align: center;
    color: #19213d;
  }

  &__text {
    font-weight: 600;
    font-size: 16px;
    line-height: 32px;
    letter-spacing: 0%;
    text-align: center;
    color: #19213d;
  }

  &__table-container {
    border-radius: 20px;
    padding: 20px;
    background: #f8faff;
  }

  &__actions {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  &__button {
    &--primary {
      @include primary-button;
      padding: 10px 24px;
      font-weight: 600;
      font-size: 14px;
      line-height: 20px;
    }
  }
}
</style>
