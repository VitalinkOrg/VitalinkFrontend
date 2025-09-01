<template>
  <section class="reservation-confirmation__step-content">
    <h3 class="reservation-confirmation__title">
      Revisa los datos antes de confirmar la cita:
    </h3>

    <div class="reservation-confirmation__table-wrapper">
      <table class="reservation-confirmation__table">
        <tbody class="reservation-confirmation__table-body">
          <tr class="reservation-confirmation__table-row">
            <td
              class="reservation-confirmation__table-cell reservation-confirmation__table-cell--label"
            >
              Tipo de servicio:
            </td>
            <td
              class="reservation-confirmation__table-cell reservation-confirmation__table-cell--value"
            >
              {{ getSelectedServiceName }}
            </td>
          </tr>
          <tr class="reservation-confirmation__table-row">
            <td
              class="reservation-confirmation__table-cell reservation-confirmation__table-cell--label"
            >
              Fecha de la cita:
            </td>
            <td
              class="reservation-confirmation__table-cell reservation-confirmation__table-cell--value"
            >
              {{ selectedDay }}
            </td>
          </tr>
          <tr class="reservation-confirmation__table-row">
            <td
              class="reservation-confirmation__table-cell reservation-confirmation__table-cell--label"
            >
              Hora de la cita:
            </td>
            <td
              class="reservation-confirmation__table-cell reservation-confirmation__table-cell--value"
            >
              {{ selectedHour }}
            </td>
          </tr>
          <tr class="reservation-confirmation__table-row">
            <td
              class="reservation-confirmation__table-cell reservation-confirmation__table-cell--label"
            >
              Paciente titular:
            </td>
            <td
              class="reservation-confirmation__table-cell reservation-confirmation__table-cell--value"
            >
              {{ customerName }}
            </td>
          </tr>
          <tr class="reservation-confirmation__table-row">
            <td
              class="reservation-confirmation__table-cell reservation-confirmation__table-cell--label"
            >
              Teléfono de Contacto:
            </td>
            <td
              class="reservation-confirmation__table-cell reservation-confirmation__table-cell--value"
            >
              {{ customerPhone }}
            </td>
          </tr>
          <tr class="reservation-confirmation__table-row">
            <td
              class="reservation-confirmation__table-cell reservation-confirmation__table-cell--label"
            >
              Procedimiento:
            </td>
            <td
              class="reservation-confirmation__table-cell reservation-confirmation__table-cell--value"
            >
              {{ getSelectedProcedureName }}
            </td>
          </tr>
          <tr class="reservation-confirmation__table-row">
            <td
              class="reservation-confirmation__table-cell reservation-confirmation__table-cell--label"
            >
              Costo del servicio:
            </td>
            <td
              class="reservation-confirmation__table-cell reservation-confirmation__table-cell--value"
            >
              {{ formatCurrency(18000, { decimalPlaces: 0 }) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script lang="ts" setup>
import { useFormat } from "~/composables/useFormat";
import type { Package, Service } from "~/types/";

const { formatCurrency } = useFormat();

interface Props {
  selectedDay: string | null;
  selectedHour: string | null;
  supplierId: number;
  customerId: number;
  customerName: string;
  customerPhone?: string;
  userDescription: string;
  selectedPackage?: Package;
  selectedProcedureId?: number;
  selectedSpecialtyId?: number;
  services?: Service[];
}

const props = defineProps<Props>();

const getSelectedServiceName = computed(() => {
  try {
    if (!props.services || !props.selectedSpecialtyId) {
      return "N/A";
    }
    const service = props.services.find(
      (service) => service.medical_specialty?.id === props.selectedSpecialtyId
    );
    return service?.medical_specialty?.name || "N/A";
  } catch (error) {
    console.error("Error getting service name:", error);
    return "N/A";
  }
});

const getSelectedProcedureName = computed(() => {
  try {
    if (!props.services || !props.selectedProcedureId) {
      return "N/A";
    }
    const allProcedures = props.services.flatMap(
      (service) => service.procedures || []
    );
    const procedure = allProcedures.find(
      (procedure) => procedure.procedure?.id === props.selectedProcedureId
    );
    return procedure?.procedure?.name || "N/A";
  } catch (error) {
    console.error("Error getting procedure name:", error);
    return "N/A";
  }
});
</script>

<style lang="scss" scoped>
.reservation-confirmation {
  &__step-content {
    display: flex;
    flex-direction: column;
    gap: $spacing-lg;
    padding: $spacing-md;
  }

  &__title {
    font-family: $font-family-main;
    font-size: 18px;
    font-weight: 600;
    color: $color-foreground;
    margin: 0 0 $spacing-md 0;
    line-height: 1.4;

    @include respond-to(md) {
      font-size: 20px;
    }
  }

  &__table-wrapper {
    overflow-x: auto;
    border-radius: $border-radius-md;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    background-color: $white;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    font-family: $font-family-main;
    font-size: 14px;

    @include respond-to(md) {
      font-size: 15px;
    }
  }

  &__table-row {
    border-bottom: 1px solid #e5e7eb;
    transition: background-color 0.2s ease;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background-color: #f9fafb;
    }
  }

  &__table-cell {
    padding: $spacing-md $spacing-lg;
    vertical-align: top;
    line-height: 1.5;

    @include respond-to-max(md) {
      padding: $spacing-sm $spacing-md;
    }

    &--label {
      font-weight: 600;
      color: $color-text-secondary;
      width: 40%;
      min-width: 150px;
      background-color: #f8fafc;

      @include respond-to-max(md) {
        width: 45%;
        min-width: 120px;
      }
    }

    &--value {
      font-weight: 500;
      color: $color-foreground;
      width: 60%;

      &:empty::after {
        content: "—";
        color: $color-text-muted;
        font-style: italic;
      }

      @include respond-to-max(md) {
        width: 55%;
      }
    }
  }

  // Responsive adjustments
  @include respond-to-max(sm) {
    &__step-content {
      padding: $spacing-sm;
      gap: $spacing-md;
    }

    &__title {
      font-size: 16px;
    }

    &__table-cell {
      &--label {
        font-size: 13px;
      }

      &--value {
        font-size: 14px;
      }
    }
  }
}
</style>
