<script lang="ts" setup>
interface SupplierReview {
  first_name: string;
  last_name: string;
  message: string;
  pacient_type: string;
  score: number;
}

interface ServiceCardProps {
  pkg: IPackage;
  supplier?: ISupplierSystem | Partial<ISupplierDetail> | null;
  supplierReviews?: SupplierReview[];
  getAssessmentLabel: (code: string) => string;
  customer?: ICustomer | null;
  selectedSpecialtyId?: number | null;
  selectedProcedureId?: number | null;
  procedureName?: string | null;
  selectedDay?: string | null;
  selectedHour?: string | null;
}

interface CustomerSummary {
  id: string;
  name: string;
  phone: string;
}

const props = withDefaults(defineProps<ServiceCardProps>(), {
  supplier: null,
  supplierReviews: () => [],
  customer: null,
  selectedSpecialtyId: null,
  selectedProcedureId: null,
  procedureName: null,
  selectedDay: null,
  selectedHour: null,
});

const { formatCurrency } = useFormat();

const currentModalStep = ref<number>(1);
const isOpenModal = ref<boolean>(false);
const offers = ref<any[]>([]);

const currentSupplier = computed<
  ISupplierDetail | Partial<ISupplierDetail> | null
>(() => props.supplier ?? null);

const supplierName = computed<string>(
  () => currentSupplier.value?.name ?? "Proveedor médico",
);

const supplierId = computed<number>(() => currentSupplier.value?.id ?? 0);

const supplierServices = computed<ISupplierService[]>(() => {
  const services = currentSupplier.value?.services;
  return Array.isArray(services) ? services : [];
});

const packageName = computed<string>(
  () => props.pkg?.product?.name ?? "Paquete sin nombre",
);

const isKingPackage = computed<boolean>(() => Boolean(props.pkg?.is_king));

const packagePrice = computed<string>(() => {
  const price = props.pkg?.reference_price;
  if (!price) return "₡0.00";

  return typeof price === "string" ? price : safeCurrencyFormat(price);
});

const originalPrice = computed<string>(() => {
  const raw = props.pkg?.product?.value1;
  if (!raw) return "₡0.00";

  const parsed = parseFloat(raw);
  return isNaN(parsed) ? "₡0.00" : safeCurrencyFormat(parsed);
});

const hasDiscount = computed<boolean>(() =>
  Boolean(props.pkg?.discount && props.pkg.discount > 0),
);

const valoracionCost = computed<number>(() => {
  const raw = props.pkg?.product.value2;
  if (!raw) return 0;
  const parsed = parseFloat(raw);
  return isNaN(parsed) ? 0 : parsed;
});

const discountPrice = computed<number>(() => props.pkg?.discount ?? 0);

const hasVitalinkDiscount = computed<boolean>(() => discountPrice.value > 0);

const formattedValoracionCost = computed<string>(() =>
  safeCurrencyFormat(valoracionCost.value),
);

const formattedDiscountPrice = computed<string>(() =>
  safeCurrencyFormat(discountPrice.value),
);

const effectiveValoracionPrice = computed<number>(() =>
  hasVitalinkDiscount.value ? discountPrice.value : valoracionCost.value,
);

const reviewsCount = computed<number>(() => {
  return Array.isArray(props.supplierReviews)
    ? props.supplierReviews.length
    : 0;
});

const averageRating = computed<string>(() => {
  if (
    !Array.isArray(props.supplierReviews) ||
    props.supplierReviews.length === 0
  ) {
    return "5.0";
  }

  const total = props.supplierReviews.reduce(
    (sum, review) => sum + (review.score ?? 0),
    0,
  );
  return (total / props.supplierReviews.length).toFixed(1);
});

const reviewsLabel = computed<string>(() =>
  reviewsCount.value === 1 ? "Reseña" : "Reseñas",
);

const servicesList = computed<string[]>(() => {
  const services = props.pkg?.services_offer?.ASSESSMENT_DETAILS;
  return Array.isArray(services) ? services : [];
});

const hasServices = computed<boolean>(() => servicesList.value.length > 0);

const customerInfo = computed<CustomerSummary>(() => ({
  id: props.customer?.id ?? "",
  name: props.customer?.name ?? "",
  phone: props.customer?.phone_number ?? "",
}));

function safeCurrencyFormat(value: number): string {
  try {
    return formatCurrency(value);
  } catch {
    return "₡0.00";
  }
}

function calculateMonthlyPayment(pkg: IPackage): string {
  const rawValue =
    pkg?.discount && pkg.product?.value2
      ? pkg.product.value2
      : pkg?.product?.value1;

  if (!rawValue) return "0";

  const price = parseFloat(rawValue);
  if (isNaN(price) || price <= 0) return "0";

  const MONTHS = 12;
  const INTEREST_RATE = 1.1;
  const monthly = (price / MONTHS) * INTEREST_RATE;

  return Math.round(monthly).toLocaleString("es-CR");
}

function resolveServiceLabel(serviceCode: string): string {
  if (!serviceCode) return "Servicio desconocido";

  try {
    return props.getAssessmentLabel(serviceCode);
  } catch {
    return serviceCode;
  }
}

function closeModal(): void {
  isOpenModal.value = false;
  currentModalStep.value = 1;
}
</script>

<template>
  <div class="service-card-wrapper">
    <article
      class="service-card"
      :class="{ 'service-card--king': isKingPackage }"
      :aria-label="`Paquete: ${packageName}`"
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
            {{ packageName }}
            <span v-if="isKingPackage" class="visually-hidden">
              — Paquete recomendado
            </span>
          </h3>
        </header>

        <div class="service-card__body">
          <div
            class="service-card__pricing"
            role="group"
            aria-label="Información de precio"
          >
            <p class="service-card__price">
              <span class="visually-hidden">Precio: </span>
              {{ packagePrice }}
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
              {{ averageRating }}
            </span>
            <span class="service-card__rating-count">
              ({{ reviewsCount }} {{ reviewsLabel }})
            </span>
          </div>

          <div v-if="hasServices" class="service-card__services">
            <h4 class="service-card__services-title">Servicios:</h4>
            <ul
              class="service-card__services-list"
              aria-label="Servicios incluidos en el paquete"
            >
              <li
                v-for="service in servicesList"
                :key="service"
                class="service-card__services-item"
              >
                <div class="service-card__services-icon" aria-hidden="true">
                  <AtomsIconsCheckIcon />
                </div>
                <span class="service-card__services-text">
                  {{ resolveServiceLabel(service) }}
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
                  {{ formattedValoracionCost }}
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
              <WebsiteReservarCitaValoracion
                :selected-day="selectedDay"
                :selected-hour="selectedHour"
                :current-step="1"
                :supplier-id="supplierId"
                :supplier-name="supplierName"
                :customer-id="customerInfo.id"
                :customer-name="customerInfo.name"
                :customer-phone="customerInfo.phone"
                :selected-package="pkg"
                :services="supplierServices"
                :selected-procedure-id="selectedProcedureId ?? 0"
                :valoracion-price="effectiveValoracionPrice"
              />
            </div>
          </footer>
        </div>
      </div>
    </article>

    <WebsiteReservarModal
      v-if="currentSupplier"
      :selected-procedure-id="selectedProcedureId ?? 0"
      :selected-specialty-id="selectedSpecialtyId ?? 0"
      :user-info="customer"
      :supplier-info="currentSupplier"
      :doctor-info="currentSupplier"
      :selected-day="selectedDay ?? ''"
      :selected-hour="selectedHour ?? ''"
      :selected-package="pkg"
      :is-open="isOpenModal"
      :current-step="currentModalStep"
      :offers="offers"
      :valoracion-price="effectiveValoracionPrice"
      @close="closeModal"
    />
  </div>
</template>

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
}
</style>
