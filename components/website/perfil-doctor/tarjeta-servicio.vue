<script lang="ts" setup>
import type { Customer, Package, Service, Supplier } from "@/types";

interface SupplierReview {
  first_name: string;
  last_name: string;
  message: string;
  pacient_type: string;
  score: number;
}

interface Props {
  pkg: Package;
  supplier?: Supplier | Partial<Supplier> | null;
  supplierReviews?: SupplierReview[];
  getPackagePrice: (pkg: Package) => number | string;
  getAssessmentLabel: (code: string) => string;
  customer?: Customer | null;
  selectedSpecialtyId?: number | null;
  selectedProcedureId?: number | null;
  procedureName: string | null;
  selectedDay?: string | null;
  selectedHour?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  supplier: null,
  supplierReviews: () => [],
  customer: null,
  selectedSpecialtyId: null,
  selectedProcedureId: null,
  selectedDay: null,
  selectedHour: null,
});

const { formatCurrency, formatDate, formatTime } = useFormat();

const currentModalStep = ref<number>(1);
const isOpenModal = ref<boolean>(false);
const offers = ref<any[]>([]);

const currentSupplier = computed<Supplier | Partial<Supplier> | null>(() => {
  return props.supplier || null;
});

const packageName = computed<string>(() => {
  return props.pkg?.product?.name || "Paquete sin nombre";
});

const isKingPackage = computed<boolean>(() => {
  return Boolean(props.pkg?.is_king);
});

const packagePrice = computed<string>(() => {
  if (!props.pkg) return "₡0.00";

  try {
    const price = props.getPackagePrice(props.pkg);
    return typeof price === "string" ? price : formatCurrency(price);
  } catch (error) {
    console.error("Error getting package price:", error);
    return "₡0.00";
  }
});

const originalPrice = computed<string>(() => {
  const value = props.pkg?.product?.value1;
  return value ? formatCurrency(parseFloat(value)) : "₡0.00";
});

const hasDiscount = computed<boolean>(() => {
  return Boolean(props.pkg?.discount && props.pkg.discount > 0);
});

const valoracionCost = computed<number>(() => {
  return (props.pkg as any)?.valoracion_cost ?? 0;
});

const discountPrice = computed<number>(() => {
  return (props.pkg as any)?.discount_price ?? 0;
});

const hasVitalinkDiscount = computed<boolean>(() => {
  return discountPrice.value > 0;
});

const formattedValoracionCost = computed<string>(() => {
  return formatCurrency(valoracionCost.value);
});

const formattedDiscountPrice = computed<string>(() => {
  return formatCurrency(discountPrice.value);
});

const effectiveValoracionPrice = computed<number>(() => {
  return hasVitalinkDiscount.value ? discountPrice.value : valoracionCost.value;
});

const supplierName = computed<string>(() => {
  return currentSupplier.value?.name || "Proveedor médico";
});

const supplierId = computed<number>(() => {
  return currentSupplier.value?.id || 0;
});

const supplierServices = computed<Service[]>(() => {
  const services = currentSupplier.value?.services;
  return Array.isArray(services) ? services : [];
});

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
    (sum, review) => sum + (review.score || 0),
    0,
  );
  const average = total / props.supplierReviews.length;
  return average.toFixed(1);
});

const servicesList = computed<string[]>(() => {
  const services = props.pkg?.services_offer?.ASSESSMENT_DETAILS;
  return Array.isArray(services) ? services : [];
});

const hasServices = computed<boolean>(() => {
  return servicesList.value.length > 0;
});

const customerInfo = computed(() => {
  return {
    id: props.customer?.id || "",
    name: props.customer?.name || "",
    phone: props.customer?.phone_number || "",
  };
});

const getMonthlyPayment = (pkg: Package): string => {
  if (!pkg?.product?.value1) return "0";

  try {
    let price: number;

    if (pkg.discount && pkg.product.value2) {
      price = parseFloat(pkg.product.value2);
    } else {
      price = parseFloat(pkg.product.value1);
    }

    if (isNaN(price)) return "0";

    const monthlyPayment = (price / 12) * 1.1;
    return Math.round(monthlyPayment).toLocaleString("es-CR");
  } catch (error) {
    console.error("Error calculating monthly payment:", error);
    return "0";
  }
};

const getServiceLabel = (serviceCode: string): string => {
  if (!serviceCode) return "Servicio desconocido";

  try {
    return props.getAssessmentLabel(serviceCode);
  } catch (error) {
    console.error("Error getting service label:", error);
    return serviceCode;
  }
};

const closeModal = (): void => {
  isOpenModal.value = false;
  currentModalStep.value = 1;
};
</script>

<template>
  <div class="service-card-wrapper">
    <div class="service-card" :class="{ 'service-card--king': isKingPackage }">
      <div class="service-card__inner">
        <div class="service-card__header">
          <span v-if="isKingPackage">
            <img
              src="@/src/assets/crown.svg"
              alt="Recomendado"
              class="img-fluid"
            />
          </span>
          {{ packageName }}
        </div>

        <div class="service-card__body">
          <h5 class="service-card__price">
            {{ packagePrice }}
          </h5>

          <p class="service-card__monthly-payment">
            Cuotas mensuales desde ₡{{ getMonthlyPayment(pkg) }}
          </p>

          <p v-if="hasDiscount" class="service-card__discount">
            Precio original
            <span>{{ originalPrice }}</span>
          </p>

          <small class="service-card__disclaimer">
            Los precios pueden variar según el diagnóstico del médico.
          </small>

          <p class="service-card__rating-wrapper">
            <span class="service-card__rating">
              <img src="@/src/assets/star.svg" alt="Rating" class="img-fluid" />
              {{ averageRating }}
            </span>
            <span class="service-card__reviews">
              ({{ reviewsCount }}
              {{ reviewsCount === 1 ? "Reseña" : "Reseñas" }})
            </span>
          </p>

          <div v-if="hasServices" class="service-card__services-wrapper">
            <p class="service-card__services-title">Servicios:</p>
            <ul class="service-card__services">
              <li
                v-for="service in servicesList"
                :key="service"
                class="service-card__services-item"
              >
                <div class="service-card__services-icon-wrapper">
                  <AtomsIconsCheckIcon class="service-card__services-icon" />
                </div>
                <p class="service-card__services-text">
                  {{ getServiceLabel(service) }}
                </p>
              </li>
            </ul>
          </div>

          <div v-else class="service-card__no-services">
            <p>No hay servicios especificados para este paquete.</p>
          </div>

          <div class="service-card__footer-section">
            <div class="service-card__valoracion-divider"></div>

            <div class="service-card__valoracion-row">
              <span class="service-card__valoracion-label">
                Cita de valoración
              </span>
              <span
                class="service-card__valoracion-price"
                :class="{
                  'service-card__valoracion-price--strikethrough':
                    hasVitalinkDiscount,
                }"
              >
                {{ formattedValoracionCost }}
              </span>
            </div>

            <div
              class="service-card__valoracion-row service-card__valoracion-row--discount"
            >
              <span class="service-card__valoracion-discount-label">
                Precio Vitalink
              </span>
              <span
                class="service-card__valoracion-discount-price"
                :class="{
                  'service-card__valoracion-discount-price--inactive':
                    !hasVitalinkDiscount,
                }"
              >
                {{ hasVitalinkDiscount ? formattedDiscountPrice : "—" }}
              </span>
            </div>

            <div class="service-card__cta">
              <WebsiteReservarCitaValoracion
                :selected-day="selectedDay"
                :selected-hour="selectedHour"
                :current-step="1"
                :supplier-id="supplierId"
                :supplier-name="supplierName"
                :customer-id="customerInfo.id ?? ''"
                :customer-name="customerInfo.name"
                :customer-phone="customerInfo.phone"
                :selected-package="pkg"
                :services="supplierServices"
                :selected-procedure-id="selectedProcedureId || 0"
                :valoracion-price="effectiveValoracionPrice"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <WebsiteReservarModal
      v-if="currentSupplier"
      :selected-procedure-id="selectedProcedureId || 0"
      :selected-specialty-id="selectedSpecialtyId || 0"
      :user-info="customer"
      :supplier-info="currentSupplier"
      :doctor-info="currentSupplier"
      :selected-day="selectedDay || ''"
      :selected-hour="selectedHour || ''"
      :selected-package="pkg"
      :is-open="isOpenModal"
      :current-step="currentModalStep"
      :offers="offers"
      :valoracion-price="effectiveValoracionPrice"
      @close="closeModal"
    />
  </div>
</template>

<style scoped>
.service-card__no-services {
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 8px;
  text-align: center;
  color: #6b7280;
  font-style: italic;
}

.service-card__no-services p {
  margin: 0;
  font-size: 0.875rem;
}
</style>

<style lang="scss" scoped>
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
  background-color: #ffffff;
  border: 1px solid #f1f3f7;
  box-shadow: 0px 2px 8px 0px #00000014;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &__inner {
    display: flex;
    flex-direction: column;
    flex: 1;
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
    flex: 1;
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
      text-decoration: line-through;
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
    }
  }

  &__reviews {
    font-size: 14px;
    font-weight: 300;
    color: #6d758f;
  }

  &__services-wrapper {
    flex: 1;
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
    align-items: center;
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
    background-color: #e7f7f8;
    border-radius: 50%;

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
  }

  &__footer-section {
    margin-top: auto;
    padding-top: 8px;
  }

  &__valoracion-divider {
    height: 1px;
    background-color: #e4e7ec;
    margin-bottom: 12px;
  }

  &__valoracion-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;

    &--discount {
      margin-bottom: 0;
    }
  }

  &__valoracion-label {
    font-weight: 500;
    font-size: 13px;
    line-height: 16px;
    color: #6d758f;
  }

  &__valoracion-price {
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    color: #19213d;

    &--strikethrough {
      text-decoration: line-through;
      color: #98a2b3;
      font-weight: 500;
      font-size: 13px;
    }
  }

  &__valoracion-discount-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 600;
    font-size: 13px;
    line-height: 16px;
    color: #0cadbb;
  }

  &__valoracion-discount-icon {
    width: 14px;
    height: 14px;
    object-fit: contain;
  }

  &__valoracion-discount-price {
    font-weight: 700;
    font-size: 15px;
    line-height: 20px;
    color: #0cadbb;

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

  &--king {
    border: 2px solid #3541b4;

    .service-card__header {
      color: #3541b4;
    }
  }
}
</style>
