<template>
  <div class="service-card-wrapper">
    <div v-if="isPackEmpty" class="service-card-wrapper__empty" role="status">
      <AtomsIconsEyeIcon size="48" aria-hidden="true" />
      <p class="service-card-wrapper__empty-text">
        Completa los datos del pack para ver la previsualización
      </p>
    </div>

    <article
      v-else
      class="service-card"
      :class="{ 'service-card--king': isKingPackage }"
      :aria-label="`Previsualización: ${procedureDisplayName}`"
    >
      <div class="service-card__inner">
        <header class="service-card__header">
          <span v-if="isKingPackage" aria-hidden="true">
            <img
              src="@/src/assets/crown.svg"
              alt=""
              class="service-card__header-crown"
            />
          </span>
          <h3 class="service-card__header-title">
            {{ procedureDisplayName }}
            <span v-if="isKingPackage" class="visually-hidden">
              — Paquete recomendado
            </span>
          </h3>
        </header>

        <div class="service-card__body">
          <div v-if="productDisplayName" class="service-card__product-name">
            {{ productDisplayName }}
          </div>

          <div
            class="service-card__pricing"
            role="group"
            aria-label="Información de precio"
          >
            <p class="service-card__price">
              <span class="visually-hidden">Precio: </span>
              {{ formattedReferencePrice }}
            </p>

            <p class="service-card__monthly">
              Cuotas mensuales desde {{ formattedMonthlyInstallment }}
            </p>

            <p v-if="hasVitalinkDiscount" class="service-card__discount">
              Precio original
              <span class="service-card__discount-value">
                {{ formattedReferencePrice }}
              </span>
            </p>

            <p class="service-card__disclaimer">
              Los precios pueden variar según el diagnóstico del médico.
            </p>
          </div>

          <div class="service-card__rating" aria-label="Valoración del doctor">
            <span class="service-card__rating-score">
              <img
                src="@/src/assets/star.svg"
                alt=""
                aria-hidden="true"
                class="service-card__rating-star"
              />
              <span class="visually-hidden">Puntuación: </span>
              5.0
            </span>
            <span class="service-card__rating-count"> (0 Reseñas) </span>
          </div>

          <div
            v-if="includedServiceNames.length > 0"
            class="service-card__services"
          >
            <h4 class="service-card__services-title">Servicios:</h4>
            <ul
              class="service-card__services-list"
              aria-label="Servicios incluidos en el paquete"
            >
              <li
                v-for="serviceName in includedServiceNames"
                :key="serviceName"
                class="service-card__services-item"
              >
                <div class="service-card__services-icon" aria-hidden="true">
                  <AtomsIconsCheckIcon />
                </div>
                <span class="service-card__services-text">
                  {{ serviceName }}
                </span>
              </li>
            </ul>
          </div>

          <div v-else class="service-card__services-empty" role="status">
            <p>No hay servicios especificados para este paquete.</p>
          </div>

          <footer class="service-card__footer">
            <div class="service-card__footer-divider" aria-hidden="true" />

            <dl class="service-card__valoracion">
              <div class="service-card__valoracion-row">
                <dt class="service-card__valoracion-label">
                  Cita de valoración
                </dt>
                <dd
                  class="service-card__valoracion-price"
                  :class="{
                    'service-card__valoracion-price--struck':
                      hasVitalinkDiscount,
                  }"
                >
                  {{ formattedValorationPrice }}
                </dd>
              </div>

              <div class="service-card__valoracion-row">
                <dt
                  class="service-card__valoracion-label service-card__valoracion-label--highlight"
                >
                  Precio Vitalink
                </dt>
                <dd
                  class="service-card__valoracion-vitalink"
                  :class="{
                    'service-card__valoracion-vitalink--inactive':
                      !hasVitalinkDiscount,
                  }"
                >
                  {{ hasVitalinkDiscount ? formattedDiscountPrice : "—" }}
                </dd>
              </div>
            </dl>

            <div class="service-card__cta">
              <button
                type="button"
                class="service-card__cta-button"
                disabled
                aria-disabled="true"
              >
                Reservar cita de valoración
              </button>
            </div>
          </footer>
        </div>
      </div>
    </article>
  </div>
</template>

<script lang="ts" setup>
interface PackData {
  specialty_code?: string;
  procedure_code?: string;
  product_code?: string;
  product_name?: string;
  reference_price?: number | null;
  product_valoration_price?: number | null;
  discount?: number | null;
  apply_discount?: boolean;
  services_offer?: string[];
}

interface Props {
  pack: PackData;
  isKingPackage?: boolean;
  productos?: IUdc[];
  procedures?: IUdc[];
  specialties?: IUdc[];
  servicesMap?: Map<string, string> | Record<string, string>;
}

const props = withDefaults(defineProps<Props>(), {
  isKingPackage: false,
  productos: () => [],
  procedures: () => [],
  specialties: () => [],
  servicesMap: () => new Map(),
});

const INSTALLMENT_MONTHS = 12;
const CURRENCY_LOCALE = "es-CR";
const CURRENCY_CODE = "CRC";
const FALLBACK_PROCEDURE_LABEL = "Nombre del procedimiento";
const FALLBACK_PRICE = "₡0";

const isPackEmpty = computed(() => {
  if (!props.pack) return true;
  const { procedure_code, product_name, reference_price } = props.pack;
  return !procedure_code && !product_name && !reference_price;
});

const hasVitalinkDiscount = computed(() =>
  Boolean(props.pack?.apply_discount && props.pack?.discount),
);

function resolveUdcName(collection: IUdc[], code: string | undefined): string {
  if (!code || collection.length === 0) return "";
  const match = collection.find(
    (item) => item.code === code || String(item.id) === code,
  );
  return match?.name ?? "";
}

function resolveServiceName(serviceCode: string): string {
  if (!serviceCode) return serviceCode;

  if (props.servicesMap instanceof Map) {
    return props.servicesMap.get(serviceCode) ?? serviceCode;
  }

  if (typeof props.servicesMap === "object" && props.servicesMap !== null) {
    return (
      (props.servicesMap as Record<string, string>)[serviceCode] ?? serviceCode
    );
  }

  return serviceCode;
}

function formatCurrency(value: number | null | undefined): string {
  if (value == null || isNaN(value)) return FALLBACK_PRICE;

  try {
    return new Intl.NumberFormat(CURRENCY_LOCALE, {
      style: "currency",
      currency: CURRENCY_CODE,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `₡${Math.round(value).toLocaleString(CURRENCY_LOCALE)}`;
  }
}

const procedureDisplayName = computed(
  () =>
    resolveUdcName(props.procedures, props.pack?.procedure_code) ||
    FALLBACK_PROCEDURE_LABEL,
);

const productDisplayName = computed(() => {
  const name = props.pack?.product_name;
  if (name) return name;

  const code = props.pack?.product_code;
  if (!code) return "";
  return resolveUdcName(props.productos, code) || code;
});

const formattedReferencePrice = computed(() =>
  formatCurrency(props.pack?.reference_price),
);

const formattedValorationPrice = computed(() =>
  formatCurrency(props.pack?.product_valoration_price),
);

const formattedDiscountPrice = computed(() =>
  formatCurrency(props.pack?.discount),
);

const formattedMonthlyInstallment = computed(() => {
  const total = props.pack?.reference_price;
  if (!total || total <= 0) return FALLBACK_PRICE;
  return formatCurrency(Math.ceil(total / INSTALLMENT_MONTHS));
});

const includedServiceNames = computed<string[]>(() => {
  const raw = props.pack?.services_offer ?? [];
  if (raw.length === 0) return [];
  return raw.map((code) => resolveServiceName(code)).filter(Boolean);
});
</script>

<style lang="scss" scoped>
.visually-hidden {
  @include visually-hidden;
}

.service-card-wrapper {
  display: flex;
  flex-direction: column;
  min-width: 256px;
  max-width: 300px;
  flex-shrink: 0;

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem 1.5rem;
    background-color: #f9fafb;
    border: 2px dashed #d0d5dd;
    border-radius: 20px;
    text-align: center;
    min-height: 400px;

    svg {
      color: #98a2b3;
      margin-bottom: 1rem;
    }
  }

  &__empty-text {
    font-size: 0.875rem;
    color: #667085;
    margin: 0;
    max-width: 200px;
  }
}

.service-card {
  width: 100%;
  flex: 1;
  border-radius: 20px;
  padding-bottom: 15px;
  background-color: $white;
  border: 1px solid #f1f3f7;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  }

  &--king {
    border: 2px solid $color-primary;

    .service-card__header {
      color: $color-primary;
    }
  }

  &__inner {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  &__header {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
    text-transform: uppercase;
    width: 100%;
    padding: 20px;
    color: $color-foreground;
    background: linear-gradient(
      187.59deg,
      #f8faff 65.03%,
      rgba(248, 250, 255, 0.1) 112.13%
    );

    span {
      display: flex;
      align-items: center;
    }
  }

  &__header-crown {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    object-fit: contain;
  }

  &__header-title {
    font: inherit;
    margin: 0;
  }

  &__body {
    padding: 0 20px;
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
  }

  &__product-name {
    font-weight: 500;
    font-size: 13px;
    line-height: 18px;
    color: $color-text-secondary;
    padding-top: 4px;
  }

  &__pricing {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__price {
    font-weight: 600;
    font-size: 18px;
    line-height: 20px;
    color: $color-foreground;
    padding-top: 4px;
    margin: 0 0 2px 0;
  }

  &__monthly {
    font-weight: 500;
    font-size: 13px;
    line-height: 16px;
    color: $primary-aqua;
    margin: 0 0 4px 0;
  }

  &__discount {
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    color: $color-text-secondary;
    padding-bottom: 4px;
    margin: 0;
  }

  &__discount-value {
    text-decoration: line-through;
  }

  &__disclaimer {
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    color: $color-text-secondary;
    padding-bottom: 4px;
    margin: 0;
  }

  &__rating {
    display: flex;
    align-items: center;
    gap: 3px;
  }

  &__rating-score {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #fdb022;
  }

  &__rating-star {
    width: 16px;
    height: 16px;
  }

  &__rating-count {
    font-size: 14px;
    font-weight: 300;
    color: $color-text-secondary;
  }

  &__services {
    flex: 1;
  }

  &__services-title {
    font-weight: 600;
    font-size: 13px;
    line-height: 16px;
    color: #344054;
    margin: 0 0 $spacing-sm 0;
  }

  &__services-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__services-item {
    display: flex;
    align-items: center;
    padding: 0;
    margin: 0;
  }

  &__services-icon {
    width: 15px;
    height: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: $spacing-sm;
    background-color: #e7f7f8;
    border-radius: 50%;
    flex-shrink: 0;

    svg {
      width: 12px;
      height: 12px;
      color: $primary-aqua;
    }
  }

  &__services-text {
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: #353e5c;
  }

  &__services-empty {
    padding: 1rem;
    background-color: #f9fafb;
    border-radius: $border-radius-md;
    text-align: center;

    p {
      margin: 0;
      font-size: 14px;
      color: $color-text-secondary;
      font-style: italic;
    }
  }

  &__footer {
    margin-top: auto;
    padding-top: $spacing-sm;
  }

  &__footer-divider {
    height: 1px;
    background-color: #e4e7ec;
    margin-bottom: 12px;
  }

  &__valoracion {
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  &__valoracion-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__valoracion-label {
    font-weight: 500;
    font-size: 13px;
    line-height: 16px;
    color: $color-text-secondary;
    margin: 0;

    &--highlight {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
      color: $primary-aqua;
    }
  }

  &__valoracion-price {
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    color: $color-foreground;
    margin: 0;

    &--struck {
      text-decoration: line-through;
      color: #98a2b3;
      font-weight: 500;
      font-size: 13px;
    }
  }

  &__valoracion-vitalink {
    font-weight: 700;
    font-size: 15px;
    line-height: 20px;
    color: $primary-aqua;
    margin: 0;

    &--inactive {
      font-weight: 500;
      font-size: 13px;
      color: #98a2b3;
    }
  }

  &__cta {
    margin-top: 12px;
    padding-bottom: 4px;
  }

  &__cta-button {
    @include primary-button;
    width: 100%;
    padding: 0.625rem 1rem;
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
