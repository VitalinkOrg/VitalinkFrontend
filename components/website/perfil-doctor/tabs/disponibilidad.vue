<template>
  <div class="availability-tab">
    <div class="availability-tab__header">
      <h3 class="availability-tab__title">Agenda de disponibilidad</h3>
      <div class="availability-tab__badges">
        <span class="availability-tab__badge">
          {{ selectedSpecialty }}
          <AtomsIconsXIcon size="16" />
        </span>
        <span class="availability-tab__badge">
          {{ selectedProcedureName }}
          <AtomsIconsXIcon size="16" />
        </span>
      </div>
    </div>

    <UiAvailabilitySelector
      v-if="supplier?.id"
      v-model="selectedDateTime"
      :supplier-id="supplier.id"
    />

    <div class="availability-tab__reservation-wrapper">
      <WebsiteReservarCitaValoracion
        :selected-day="selectedDateTime.day"
        :selected-hour="selectedDateTime.hour"
        :current-step="2"
        :supplier-id="supplier?.id ?? 0"
        :supplier-name="supplier?.name ?? ''"
        :customer-id="customer?.id ?? ''"
        :customer-name="customer?.name || ''"
        :customer-phone="customer?.phone_number || ''"
        :selected-package="selectedPackage"
        :selected-procedure-id="selectedProcedureId ?? 0"
        :services="supplier?.services"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { Customer, Supplier } from "@/types";

interface Props {
  selectedSpecialty: string | null;
  selectedProcedureName: string | null;
  selectedProcedureId: number | null;
  reserveAppointment: () => void;
  supplier: Supplier | Partial<Supplier> | null;
  customer: Customer | null;
  selectedPackage?: any;
}

defineProps<Props>();

const selectedDateTime = ref<{ day: string | null; hour: string | null }>({
  day: null,
  hour: null,
});
</script>

<style lang="scss" scoped>
.availability-tab {
  padding: 20px 0;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 15px;
    margin-bottom: 1rem;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;
    color: $color-foreground;
    margin: 0;
  }

  &__badges {
    display: flex;
    gap: 8.4px;
  }

  &__badge {
    @include label-base;
    display: flex;
    align-items: center;
    gap: 10.5px;
    border-radius: 105.02px;
    border: 1px solid #e1e4ed;
    padding: 8.4px 12.6px;
    background-color: transparent;
    color: #6d758f;
    font-size: 12px;
    font-weight: 500;
    opacity: 1;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background-color: rgba(#6d758f, 0.05);
      border-color: rgba(#6d758f, 0.3);
    }

    svg {
      color: #6d758f;
      flex-shrink: 0;
    }
  }

  &__reservation-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 1rem;
  }
}
</style>
