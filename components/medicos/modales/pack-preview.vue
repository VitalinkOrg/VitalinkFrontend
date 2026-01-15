// components\medicos\modales\pack-preview.vue
<template>
  <div class="pack-preview">
    <h3 class="pack-preview__title">Previsualización del Pack</h3>

    <div
      v-if="!pack.procedimiento && !pack.producto && !pack.precio"
      class="pack-preview__empty"
    >
      <AtomsIconsEyeIcon size="48" />
      <p>Completa los datos del pack para ver la previsualización</p>
    </div>

    <div
      v-else
      class="service-card"
      :class="{ 'service-card--king': isKingPackage }"
    >
      <div class="service-card__wrapper">
        <div class="service-card__header">
          <span v-if="isKingPackage">
            <img src="@/assets/crown.svg" alt="Recomendado" class="img-fluid" />
          </span>
          {{ procedureLabel || "Nombre del procedimiento" }}
        </div>

        <div class="service-card__body">
          <h5 class="service-card__price">
            {{ formattedPrice }}
          </h5>

          <p class="service-card__monthly-payment">
            Cuotas mensuales desde {{ monthlyPayment }}
          </p>

          <p class="service-card__discount">
            Costo de valoración
            <span>{{ formattedValoracionPrice }}</span>
          </p>

          <small class="service-card__disclaimer">
            Los precios pueden variar según el diagnóstico del médico.
          </small>

          <p class="service-card__rating-wrapper">
            <span class="service-card__rating">
              <img src="@/assets/star.svg" alt="Rating" class="img-fluid" />
              5.0
            </span>
            <span class="service-card__reviews"> (0 Reseñas) </span>
          </p>

          <div v-if="pack.especialidad" class="service-card__specialty-info">
            <p class="service-card__specialty-label">Especialidad:</p>
            <p class="service-card__specialty-name">{{ specialtyLabel }}</p>
          </div>

          <div v-if="pack.producto" class="service-card__product-info">
            <p class="service-card__product-label">Producto:</p>
            <p class="service-card__product-name">{{ productLabel }}</p>
          </div>

          <div v-if="hasServices" class="service-card__services-wrapper">
            <p class="service-card__services-title">Servicios incluidos:</p>
            <ul class="service-card__services">
              <li
                v-for="(service, idx) in servicesList"
                :key="idx"
                class="service-card__services-item"
              >
                <div class="service-card__services-icon-wrapper">
                  <AtomsIconsCheckIcon class="service-card__services-icon" />
                </div>
                <p class="service-card__services-text">
                  {{ service }}
                </p>
              </li>
            </ul>
          </div>

          <div v-if="hasAvailability" class="service-card__availability">
            <p class="service-card__availability-title">
              Disponibilidad horaria:
            </p>
            <div class="service-card__availability-days">
              <span
                v-for="(day, idx) in availableDays"
                :key="idx"
                class="service-card__availability-day"
              >
                {{ day }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useUdc } from "@/composables/api";
import type { IUdc } from "@/types";

interface TimeSlot {
  from: string;
  to: string;
}

interface DayAvailability {
  active: boolean;
  timeSlots: TimeSlot[];
}

interface Pack {
  especialidad: string;
  procedimiento: string;
  producto: string;
  servicios: string[];
  precio: number;
  disponibilidad: DayAvailability[];
}

interface Props {
  pack: Pack;
  isKingPackage?: boolean;
  productos?: Array<{ value: string; label: string }>;
  specialties?: Array<{ value: string; label: string }>;
  servicesMap?: Record<string, string>;
}

const props = withDefaults(defineProps<Props>(), {
  isKingPackage: false,
  productos: () => [],
  specialties: () => [],
  servicesMap: () => ({}),
});

const { formatCurrency } = useFormat();
const { fetchUdc } = useUdc();

const VALORACION_COST = 25000;

const procedures = ref<IUdc[]>([]);

const weekDays = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const formattedPrice = computed(() => {
  if (!props.pack.precio) return "₡0.00";
  return `${formatCurrency(props.pack.precio)}`;
});

const formattedValoracionPrice = computed(() => {
  return `${formatCurrency(VALORACION_COST)}`;
});

const monthlyPayment = computed(() => {
  if (!props.pack.precio) return "₡0";
  const monthly = (props.pack.precio / 12) * 1.1;
  return `₡${Math.round(monthly).toLocaleString("es-CR")}`;
});

const procedureLabel = computed(() => {
  if (!props.pack.procedimiento) return "";
  const procedure = procedures.value.find(
    (p) => p.code === props.pack.procedimiento
  );
  return procedure?.name || props.pack.procedimiento;
});

const specialtyLabel = computed(() => {
  if (!props.pack.especialidad) return "";
  const specialty = props.specialties.find(
    (s) => s.value === props.pack.especialidad
  );
  return specialty?.label || props.pack.especialidad;
});

const productLabel = computed(() => {
  if (!props.pack.producto) return "";
  const product = props.productos.find((p) => p.value === props.pack.producto);
  return product?.label || props.pack.producto;
});

const servicesList = computed(() => {
  return props.pack.servicios
    .map((code) => props.servicesMap[code] || code)
    .filter((s) => s.length > 0);
});

const hasServices = computed(() => {
  return servicesList.value.length > 0;
});

const availableDays = computed(() => {
  return props.pack.disponibilidad
    .map((day, idx) => (day.active ? weekDays[idx] : null))
    .filter((day) => day !== null);
});

const hasAvailability = computed(() => {
  return availableDays.value.length > 0;
});

onMounted(async () => {
  const proceduresApi = fetchUdc(
    "MEDICAL_PROCEDURE",
    {},
    { authRequired: false }
  );
  await proceduresApi.request();
  procedures.value = proceduresApi.response.value?.data ?? [];
});
</script>

<style lang="scss" scoped>
.pack-preview {
  height: fit-content;

  &:not(:last-child) {
    margin-bottom: 1.5rem;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 1.125rem;
    color: #101828;
    margin: 0 0 1.5rem 0;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1.5rem;
    background-color: #f9fafb;
    border: 2px dashed #d0d5dd;
    border-radius: 0.75rem;
    text-align: center;
    min-height: 400px;

    svg {
      color: #98a2b3;
      margin-bottom: 1rem;
    }

    p {
      @include text-base;
      font-size: 0.875rem;
      color: #667085;
      margin: 0;
      max-width: 200px;
    }
  }
}

.service-card {
  width: 100%;
  max-width: 320px;
  border-radius: 20px;
  padding-bottom: 15px;
  border-width: 1px;
  background-color: #ffffff;
  border: 1px solid #f1f3f7;
  box-shadow: 0px 2px 8px 0px #00000014;
  overflow: hidden;

  &__wrapper {
    display: flex;
    background-color: #fff;
    flex-direction: column;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
    text-transform: uppercase;
    width: 100%;
    padding: 20px;
    color: #19213d;
    background: linear-gradient(
      187.59deg,
      #f8faff 65.03%,
      rgba(248, 250, 255, 0.1) 112.13%
    );

    span {
      display: flex;
      align-items: center;
    }

    img {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      object-fit: contain;
    }
  }

  &__body {
    padding: 0px 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__price {
    font-weight: 600;
    font-size: 18px;
    line-height: 20px;
    color: #19213d;
    padding-top: 4px;
    margin-bottom: 2px;
  }

  &__monthly-payment {
    font-weight: 500;
    font-size: 13px;
    line-height: 16px;
    color: #0cadbb;
    margin-bottom: 4px;
  }

  &__discount {
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    color: #6d758f;
    padding-bottom: 4px;

    span {
      display: block;
      margin-top: 2px;
    }
  }

  &__disclaimer {
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    color: #6d758f;
    padding-bottom: 4px;
  }

  &__rating-wrapper {
    display: flex;
    align-items: center;
    gap: 3px;
    margin: 8px 0;
  }

  &__rating {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #fdb022;

    img {
      width: 16px;
      height: 16px;
      color: #fdb022;
      margin-right: 4px;
    }
  }

  &__reviews {
    font-size: 14px;
    font-weight: 300;
    color: #6d758f;
  }

  &__product-info {
    margin: 8px 0;
  }

  &__specialty-info {
    margin: 8px 0;
  }

  &__specialty-label {
    font-weight: 600;
    font-size: 13px;
    line-height: 16px;
    color: #344054;
    margin: 0 0 4px 0;
  }

  &__specialty-name {
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: #7f56d9;
    margin: 0;
  }

  &__product-label {
    font-weight: 600;
    font-size: 13px;
    line-height: 16px;
    color: #344054;
    margin: 0 0 4px 0;
  }

  &__product-name {
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: #0cadbb;
    margin: 0;
  }

  &__services-wrapper {
    margin-top: 12px;
  }

  &__services-title {
    font-weight: 600;
    font-size: 13px;
    line-height: 16px;
    color: #344054;
    margin: 0 0 8px 0;
  }

  &__services {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__services-item {
    display: flex;
    align-items: flex-start;
    padding: 0;
    margin: 0;
  }

  &__services-icon-wrapper {
    width: 15px;
    height: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    margin-top: 2px;
    background-color: #e7f7f8;
    border-radius: 50%;
    flex-shrink: 0;

    svg {
      width: 12px;
      height: 12px;
      color: #0cadbb;
    }
  }

  &__services-text {
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: #353e5c;
    margin: 0;
  }

  &__availability {
    margin-top: 12px;

    &-title {
      font-weight: 600;
      font-size: 13px;
      line-height: 16px;
      color: #344054;
      margin: 0 0 8px 0;
    }

    &-days {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    &-day {
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
      color: #353e5c;
      background-color: #f0f9ff;
      padding: 4px 8px;
      border-radius: 4px;
      border: 1px solid #e7f7f8;
    }
  }

  &--king {
    border: 2px solid #3541b4;

    .service-card__header {
      color: #3541b4;
    }
  }
}
</style>
