<template>
  <article v-if="supplier" class="supplier-card">
    <NuxtLink
      :to="{
        path: `/perfiles/doctor/${supplier.id}`,
        query: queryParams,
      }"
      class="supplier-card__link"
      :aria-label="`Ver perfil de ${supplier.name}`"
    >
      <div class="supplier-card__body">
        <header class="supplier-card__header">
          <div class="supplier-card__profile">
            <img
              :src="profileImageSource"
              :alt="`Foto de perfil de ${supplier.name}`"
              class="supplier-card__avatar"
              loading="lazy"
            />
            <div class="supplier-card__rating-badge" aria-label="Calificación">
              <span class="supplier-card__rating-value">
                {{ formattedRating }}
              </span>
              <img
                src="@/src/assets/star.svg"
                alt=""
                aria-hidden="true"
                class="supplier-card__rating-star"
              />
            </div>
          </div>

          <div class="supplier-card__details">
            <div class="supplier-card__title-row">
              <h3 class="supplier-card__name">
                {{ supplier.name }}
              </h3>
              <button
                class="supplier-card__bookmark-button"
                :aria-label="`Guardar a ${supplier.name} en favoritos`"
                @click.prevent.stop="handleToggleFavorite"
              >
                <AtomsIconsBookmarkIcon class="supplier-card__bookmark-icon" />
              </button>
            </div>

            <div class="supplier-card__meta">
              <img
                src="@/src/assets/doctor-element.svg"
                alt=""
                aria-hidden="true"
                class="supplier-card__meta-icon"
              />
              <p class="supplier-card__specialty">
                {{ supplier.description }}
              </p>
            </div>

            <div class="supplier-card__meta">
              <img
                src="@/src/assets/marker.svg"
                alt=""
                aria-hidden="true"
                class="supplier-card__meta-icon"
              />
              <p class="supplier-card__location">
                {{ supplier.location_number }}
                {{ locationLabel }}
              </p>
            </div>
          </div>
        </header>

        <section
          class="supplier-card__availability"
          aria-label="Disponibilidad"
        >
          <p class="supplier-card__availability-title">Disponibilidad</p>
          <div class="supplier-card__availability-entry">
            <img
              src="@/src/assets/calendar.svg"
              alt=""
              aria-hidden="true"
              class="supplier-card__availability-icon"
            />
            <time class="supplier-card__availability-date">
              {{ supplier.date_availability }}
            </time>
          </div>
          <div class="supplier-card__availability-entry">
            <img
              src="@/src/assets/clock.svg"
              alt=""
              aria-hidden="true"
              class="supplier-card__availability-icon"
            />
            <time class="supplier-card__availability-time">
              {{ supplier.hour_availability }}
            </time>
          </div>
        </section>

        <ul
          class="supplier-card__service-list"
          aria-label="Servicios ofrecidos"
        >
          <li
            v-for="serviceName in supplier.services_names"
            :key="serviceName"
            class="supplier-card__service-tag"
          >
            {{ serviceName }}
          </li>
        </ul>

        <footer class="supplier-card__footer">
          <div class="supplier-card__pricing" aria-label="Precio de valoración">
            <div v-if="hasLoadedPricing" class="supplier-card__pricing-amounts">
              <p class="supplier-card__pricing-original">
                <span class="sr-only">Precio original: </span>
                {{ formattedOriginalPrice }}
              </p>
              <p
                v-if="formattedDiscountedPrice"
                class="supplier-card__pricing-discounted"
              >
                <span class="sr-only">Precio con descuento: </span>
                {{ formattedDiscountedPrice }}
              </p>
            </div>
            <p v-else class="supplier-card__pricing-inquiry">
              Precio a consultar
            </p>

            <p class="supplier-card__pricing-caption">
              {{ pricingCaption }}
            </p>
          </div>

          <button
            class="supplier-card__action-button"
            :aria-label="`Ver paquetes y citas de valoración de ${supplier.name}`"
            @click.prevent.stop="handleShowPackages"
          >
            <span class="supplier-card__action-label">
              Ver paquetes y citas de valoración
            </span>
            <AtomsIconsChevronRightIcon class="supplier-card__action-arrow" />
          </button>
        </footer>
      </div>
    </NuxtLink>
  </article>
</template>

<script setup lang="ts">
import { usePackage } from "@/composables/api";
import type { LocationQueryRaw } from "vue-router";

interface Props {
  supplier: ISupplierMain;
  queryParams?: LocationQueryRaw;
}

interface Emits {
  (event: "toggle-favorite", doctorId: ISupplierMain["id"]): void;
  (event: "show-packages", payload: { selectedSupplier: ISupplierMain }): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const { getAllPackages } = usePackage();
const toast = useToast();
const logger = useLogger();
const { formatCurrency } = useFormat();

const originalPrice = ref<string | null>(null);
const discountedPrice = ref<number | null>(null);

const profileImageSource = computed<string>(
  () => props.supplier.profile_picture_url || "/_nuxt/src/assets/picture.svg",
);

const formattedRating = computed<string>(
  () => props.supplier.stars_by_supplier?.toFixed(1) ?? "0.0",
);

const locationLabel = computed<string>(() =>
  props.supplier.location_number === 1 ? "Hospital" : "Hospitales diferentes",
);

const hasLoadedPricing = computed<boolean>(() => originalPrice.value !== null);

const formattedOriginalPrice = computed<string>(() => {
  if (!originalPrice.value) return "";
  return formatCurrency(originalPrice.value, { decimalPlaces: 0 });
});

const formattedDiscountedPrice = computed<string | null>(() => {
  if (discountedPrice.value == null) return null;
  return formatCurrency(discountedPrice.value, { decimalPlaces: 0 });
});

const pricingCaption = computed<string>(() =>
  hasLoadedPricing.value
    ? "costo citas de valoración desde"
    : "valoración inicial",
);

function handleToggleFavorite(): void {
  emit("toggle-favorite", props.supplier.id);
}

function handleShowPackages(): void {
  emit("show-packages", { selectedSupplier: props.supplier });
}

async function fetchSupplierPackages(): Promise<void> {
  const supplierId = props.supplier.id;

  if (!supplierId) {
    toast.error("ID del proveedor no encontrado");
    return;
  }

  try {
    const { data, error } = await getAllPackages(supplierId);

    if (error || !data) {
      const detail = error?.info || "Error desconocido al obtener paquetes";
      logger.error("Failed to fetch supplier packages", { info: detail });
      toast.error(detail);
      return;
    }

    if (data.length === 0) {
      logger.debug("No packages available for supplier", { supplierId });
      return;
    }

    const citas = data
      .map((p) => parseFloat(p.product.value2 ?? "0"))
      .filter((v) => v > 0);

    const vitalinks = data
      .map((p) => parseFloat(String(p.discount ?? 0)))
      .filter((v) => v > 0);

    const minCita = citas.length ? Math.min(...citas) : null;
    const minVitalink = vitalinks.length ? Math.min(...vitalinks) : null;

    if (!minCita && !minVitalink) {
      originalPrice.value = null;
      discountedPrice.value = null;
      return;
    }

    if (minCita && (!minVitalink || minCita < minVitalink)) {
      originalPrice.value = String(minCita);
      discountedPrice.value = null;
      return;
    }

    if (minCita && minVitalink && minVitalink < minCita) {
      originalPrice.value = String(minCita);
      discountedPrice.value = minVitalink;
      return;
    }

    if (minVitalink) {
      originalPrice.value = null;
      discountedPrice.value = minVitalink;
    }
  } catch (error) {
    logger.error("Unexpected error fetching supplier packages", { error });
    toast.error("Error inesperado al cargar los paquetes");
  }
}

onMounted(fetchSupplierPackages);
</script>

<style lang="scss" scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.supplier-card {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  border: 1px solid #f1f3f7;
  border-radius: 16px;
  padding: 15px;
  max-width: 420px;
  height: 100%;

  @include respond-to(sm) {
    border-radius: 20px;
    padding: 18px;
  }

  @include respond-to(md) {
    padding: 20px;
  }

  &__link {
    display: flex;
    flex-direction: column;
    height: 100%;
    text-decoration: none;
    color: inherit;
  }

  &__body {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  &__header {
    display: flex;
    gap: 15px;

    @include respond-to(md) {
      gap: 20px;
    }
  }

  &__profile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  &__avatar {
    width: 55px;
    height: 55px;
    border-radius: 50%;
    object-fit: cover;

    @include respond-to(sm) {
      width: 60px;
      height: 60px;
    }

    @include respond-to(md) {
      width: 67px;
      height: 67px;
    }
  }

  &__rating-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #3541b4;
    padding: 4px 8px;
    gap: 3px;
    border-radius: 16px;

    @include respond-to(sm) {
      padding: 5px 10px;
      gap: 4px;
      border-radius: 20px;
    }

    @include respond-to(md) {
      border-radius: 23px;
    }
  }

  &__rating-value {
    font-family: $font-family-main;
    font-weight: 600;
    font-size: 12px;
    line-height: 1.2;
    color: #ffffff;

    @include respond-to(sm) {
      font-size: 13px;
    }

    @include respond-to(md) {
      font-size: 14.7px;
      line-height: 25.21px;
    }
  }

  &__rating-star {
    width: 12px;
    height: 12px;

    @include respond-to(md) {
      width: 15px;
      height: 15px;
    }
  }

  &__details {
    width: 100%;
    min-width: 0;
  }

  &__title-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }

  &__name {
    @include label-base;
    font-weight: 600;
    font-size: 17px;
    line-height: 1.2;
    color: #19213d;
    word-break: break-word;
    margin: 0;

    @include respond-to(sm) {
      font-size: 19px;
    }

    @include respond-to(md) {
      font-size: 21px;
      line-height: 25.21px;
    }
  }

  &__bookmark-button {
    @include button-base;
    color: #3541b4;
    padding: 0;
    height: 20px;
    width: 20px;
    flex-shrink: 0;

    @include respond-to(md) {
      height: 24px;
      width: 24px;
    }

    svg {
      width: 100%;
      height: 100%;
    }

    &:hover,
    &:focus-visible {
      .supplier-card__bookmark-icon {
        color: rgba(53, 65, 180, 0.8);
      }
    }
  }

  &__meta {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-top: 8px;

    @include respond-to(md) {
      align-items: center;
      gap: 10px;
      margin-top: 10px;
    }
  }

  &__meta-icon {
    width: 24px;
    height: 24px;
    padding: 5px;
    border-radius: 20px;
    background-color: #3541b40d;
    flex-shrink: 0;

    @include respond-to(md) {
      width: 30px;
      height: 30px;
      padding: 7px;
      border-radius: 24px;
    }
  }

  &__specialty,
  &__location {
    @include label-base;
    font-weight: 300;
    font-size: 14px;
    line-height: 1.3;
    color: #6d758f;
    word-break: break-word;

    @include respond-to(md) {
      font-size: 16px;
      line-height: 21px;
    }
  }

  &__availability {
    background-color: #f9f8f8;
    padding: 8px 15px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-radius: 8px;
    margin-top: 15px;

    @include respond-to(md) {
      padding: 10.5px 20px;
      gap: 10px;
      border-radius: 9px;
      margin-top: 20px;
    }
  }

  &__availability-title {
    @include label-base;
    font-weight: 500;
    font-size: 12px;
    line-height: 1.2;
    color: #6d758f;

    @include respond-to(md) {
      font-size: 13.65px;
      line-height: 25.21px;
    }
  }

  &__availability-entry {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #353e5c;

    @include respond-to(md) {
      gap: 10.5px;
    }
  }

  &__availability-date,
  &__availability-time {
    @include label-base;
    font-weight: 400;
    font-size: 13px;
    line-height: 1.2;
    color: #353e5c;

    @include respond-to(md) {
      font-size: 14.7px;
      line-height: 25.21px;
    }
  }

  &__availability-icon {
    width: 16px;
    height: 16px;

    @include respond-to(md) {
      width: 18px;
      height: 18px;
    }
  }

  &__service-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 15px;
    margin-bottom: auto;
    list-style: none;
    padding: 0;

    @include respond-to(md) {
      gap: 6.3px;
      margin-top: 20px;
    }
  }

  &__service-tag {
    display: flex;
    padding: 6px 10px;
    gap: 8px;
    border-radius: 50px;
    background-color: #ebecf7;
    color: #3541b4;
    font-weight: 600;
    font-size: 11px;
    line-height: 100%;

    @include respond-to(md) {
      padding: 8.4px 12.6px;
      gap: 10.5px;
      border-radius: 105px;
      font-size: 12.6px;
    }
  }

  &__footer {
    display: flex;
    flex-direction: column;
    gap: 15px;
    margin-top: 15px;

    @include respond-to(sm) {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      gap: 10px;
    }

    @include respond-to(md) {
      margin-top: 20px;
    }
  }

  &__pricing {
    display: flex;
    flex-direction: column;
    gap: 3px;

    @include respond-to(md) {
      gap: 5px;
    }
  }

  &__pricing-amounts {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
  }

  &__pricing-original {
    @include label-base;
    font-weight: 700;
    font-size: 16px;
    line-height: 1.2;
    color: #6d758f;
    text-decoration: line-through;

    @include respond-to(md) {
      font-size: 18.9px;
      line-height: 21px;
    }
  }

  &__pricing-discounted {
    @include label-base;
    font-weight: 700;
    font-size: 16px;
    line-height: 1.2;
    color: #353e5c;

    @include respond-to(md) {
      font-size: 18.9px;
      line-height: 21px;
    }
  }

  &__pricing-inquiry {
    @include label-base;
    font-weight: 700;
    font-size: 16px;
    line-height: 1.2;
    color: #353e5c;

    @include respond-to(md) {
      font-size: 18.9px;
      line-height: 21px;
    }
  }

  &__pricing-caption {
    @include label-base;
    font-weight: 300;
    font-size: 12px;
    line-height: 1.2;
    color: #6d758f;

    @include respond-to(md) {
      font-size: 14.7px;
      line-height: 21px;
    }
  }

  &__action-button {
    @include button-base;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #3541b4;
    font-weight: 600;
    font-size: 14px;
    line-height: 1.2;
    text-decoration: none;
    padding: 8px 16px;
    border: 1px solid #3541b4;
    border-radius: 8px;
    text-align: left;

    @include respond-to(sm) {
      padding: 0;
      border: none;
      border-radius: 0;
      justify-content: flex-start;
    }

    @include respond-to(md) {
      font-size: 16px;
      line-height: 24px;
      gap: 10.5px;
    }

    &:hover,
    &:focus-visible {
      text-decoration: underline;

      @include respond-to-max(sm) {
        background-color: #3541b4;
        color: white;
      }
    }
  }

  &__action-arrow {
    width: 16px;
    height: 16px;

    @include respond-to(md) {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
