<template>
  <section
    class="booking-confirmation"
    aria-labelledby="booking-confirmation-heading"
  >
    <h3 id="booking-confirmation-heading" class="booking-confirmation__heading">
      Revisa los datos antes de confirmar la cita:
    </h3>

    <MedicosTablaDetallesCita
      :rows="appointmentSummaryRows"
      title="Resumen de la cita"
      hidden-title
      aria-label="Resumen de los datos de la cita"
    >
      <template #data-serviceCost="{ value }">
        <span class="booking-confirmation__price">{{ value }}</span>
      </template>

      <template #data-discountPrice="{ value }">
        <span
          class="booking-confirmation__price booking-confirmation__price--discount"
        >
          {{ value }}
        </span>
      </template>
    </MedicosTablaDetallesCita>
  </section>
</template>

<script lang="ts" setup>
import type { TablaBaseRow } from "~/components/medicos/tabla-detalles-cita.vue";
import { useFormat } from "~/composables/useFormat";

interface Props {
  selectedDay: string | null;
  selectedHour: string | null;
  supplierId: number;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  userDescription: string;
  selectedPackage?: IPackage;
  selectedProcedureId?: number;
  selectedSpecialtyId?: number;
  services?: ISupplierService[];
}

const props = defineProps<Props>();
const { formatCurrency } = useFormat();

const SERVICE_BASE_COST = 18000;
const FALLBACK_LABEL = "N/A";

const specialtyName = computed<string>(() => {
  if (!props.services?.length || !props.selectedSpecialtyId) {
    return FALLBACK_LABEL;
  }

  const matchedService = props.services.find(
    (service) => service.medical_specialty?.id === props.selectedSpecialtyId,
  );

  return matchedService?.medical_specialty?.name ?? FALLBACK_LABEL;
});

const procedureName = computed<string>(() => {
  if (!props.services?.length || !props.selectedProcedureId) {
    return FALLBACK_LABEL;
  }

  const allProcedures = props.services.flatMap(
    (service) => service.procedures ?? [],
  );

  const matchedProcedure = allProcedures.find(
    (entry) => entry.procedure?.id === props.selectedProcedureId,
  );

  return matchedProcedure?.procedure?.name ?? FALLBACK_LABEL;
});

const formattedServiceCost = computed(() =>
  formatCurrency(SERVICE_BASE_COST, { decimalPlaces: 0 }),
);

const formattedDiscountPrice = computed(() =>
  formatCurrency(props.selectedPackage?.discount ?? 0, { decimalPlaces: 0 }),
);

const appointmentSummaryRows = computed<TablaBaseRow[]>(() => [
  {
    key: "serviceType",
    header: "Tipo de servicio",
    value: specialtyName.value,
  },
  {
    key: "appointmentDate",
    header: "Fecha de la cita",
    value: props.selectedDay ?? FALLBACK_LABEL,
  },
  {
    key: "appointmentTime",
    header: "Hora de la cita",
    value: props.selectedHour ?? FALLBACK_LABEL,
  },
  {
    key: "patientName",
    header: "Paciente titular",
    value: props.customerName,
  },
  {
    key: "contactPhone",
    header: "Teléfono de contacto",
    value: props.customerPhone ?? FALLBACK_LABEL,
    show: !!props.customerPhone,
  },
  {
    key: "procedure",
    header: "Procedimiento",
    value: procedureName.value,
  },
  {
    key: "serviceCost",
    header: "Costo del servicio",
    value: formattedServiceCost.value,
    isEndRow: true,
  },
  {
    key: "discountPrice",
    header: "Precio descuento Vitalink",
    value: formattedDiscountPrice.value,
  },
]);
</script>

<style lang="scss" scoped>
.booking-confirmation {
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
  padding: $spacing-md;

  @include respond-to-max(sm) {
    padding: $spacing-sm;
    gap: $spacing-md;
  }

  &__heading {
    font-family: $font-family-main;
    font-size: 18px;
    font-weight: 600;
    color: $color-foreground;
    margin: 0 0 $spacing-md 0;
    line-height: 1.4;

    @include respond-to(md) {
      font-size: 20px;
    }

    @include respond-to-max(sm) {
      font-size: 16px;
    }
  }

  &__price {
    font-weight: 600;

    &--discount {
      color: $color-success;
    }
  }
}
</style>
