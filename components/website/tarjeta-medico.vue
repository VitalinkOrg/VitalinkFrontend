<template>
  <div v-if="supplier" class="medico-card">
    <NuxtLink
      :to="{
        path: `/perfiles/doctor/${supplier.id}`,
        query: queryParams,
      }"
      class="medico-card__link"
    >
      <div class="medico-card__body">
        <div class="medico-card__top">
          <div class="medico-card__profile">
            <img
              :src="
                supplier.profile_picture_url || '/_nuxt/src/assets/picture.svg'
              "
              alt=""
              class="medico-card__avatar"
            />
            <div class="medico-card__score">
              <p class="medico-card__rating">
                {{ supplier.stars_by_supplier?.toFixed(1) || 0 }}
              </p>
              <img
                src="@/src/assets/star.svg"
                alt="Calificación"
                class="medico-card__star-icon"
              />
            </div>
          </div>

          <div class="medico-card__info">
            <div class="medico-card__name-container">
              <p class="medico-card__name">
                {{ supplier.name }}
              </p>
              <div>
                <button
                  class="medico-card__favorite-button"
                  @click.prevent.stop="toggleFavorite"
                >
                  <AtomsIconsBookmarkIcon class="medico-card__favorite-icon" />
                </button>
              </div>
            </div>

            <div class="medico-card__detail">
              <img
                src="@/src/assets/doctor-element.svg"
                alt="Especialidad"
                class="medico-card__icon"
              />
              <p class="medico-card__description">
                {{ supplier.description }}
              </p>
            </div>

            <div class="medico-card__location">
              <img
                src="@/src/assets/marker.svg"
                alt="Ubicaciones"
                class="medico-card__icon"
              />
              <p class="medico-card__location-text">
                {{ supplier.location_number }}
                {{
                  supplier.location_number === 1
                    ? "Hospital"
                    : "Hospitales diferentes"
                }}
              </p>
            </div>
          </div>
        </div>

        <div class="medico-card__availability">
          <p class="medico-card__availability-label">Disponibilidad</p>
          <div class="medico-card__availability-item">
            <img
              src="@/src/assets/calendar.svg"
              alt="Fecha"
              class="medico-card__availability-icon"
            />
            <p class="medico-card__availability-date">
              {{ supplier.date_availability }}
            </p>
          </div>
          <div class="medico-card__availability-item">
            <img
              src="@/src/assets/clock.svg"
              alt="Hora"
              class="medico-card__availability-icon"
            />
            <p class="medico-card__availability-time">
              {{ supplier.hour_availability }}
            </p>
          </div>
        </div>

        <div class="medico-card__tags">
          <span
            v-for="service in supplier.services_names"
            :key="service"
            class="medico-card__tag"
          >
            {{ service }}
          </span>
        </div>

        <div class="medico-card__footer">
          <div class="medico-card__price">
            <p
              v-if="costOfAssessmentAppointmentsFrom"
              class="medico-card__price-value"
            >
              {{
                formatCurrency(costOfAssessmentAppointmentsFrom, {
                  decimalPlaces: 0,
                })
              }}
            </p>
            <p
              v-else
              class="medico-card__price-value medico-card__price-value--consult"
            >
              Precio a consultar
            </p>

            <p class="medico-card__price-description">
              {{
                costOfAssessmentAppointmentsFrom
                  ? "costo citas de valoración desde"
                  : "valoración inicial"
              }}
            </p>
          </div>

          <button
            class="medico-card__packages-button"
            @click.prevent.stop="getDoctorData"
          >
            Ver paquetes y citas de valoración
            <AtomsIconsChevronRightIcon class="medico-card__arrow-icon" />
          </button>
        </div>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { usePackage } from "@/composables/api";
import type { LocationQueryRaw } from "vue-router";

const props = defineProps<{
  supplier: ISupplierMain;
  queryParams?: LocationQueryRaw;
}>();

const { getAllPackages } = usePackage();
const toast = useToast();
const logger = useLogger();

const costOfAssessmentAppointmentsFrom = ref<string | null>(null);

const emit = defineEmits<{
  (e: "toggle-favorite", doctorId: ISupplierMain["id"]): void;
  (e: "show-packages", payload: { selectedSupplier: ISupplierMain }): void;
}>();

const { formatCurrency } = useFormat();

const toggleFavorite = (): void => {
  emit("toggle-favorite", props.supplier.id);
};

const getDoctorData = (): void => {
  emit("show-packages", { selectedSupplier: props.supplier });
};

async function executeGetAllPackagesBySupplierId() {
  const supplierId = props.supplier.id;
  if (!supplierId) {
    toast.error("ID del proveedor no encontrado");
    return;
  }

  try {
    const { data, error } = await getAllPackages(supplierId);

    if (error || !data) {
      const errorMessage =
        error?.info || "Error desconocido al obtener paquetes";
      logger.error("Failed to fetch packages", { info: errorMessage });
      toast.error(errorMessage);
      return;
    }

    if (data.length === 0) {
      logger.debug("No packages found for this supplier");
      return;
    }

    logger.debug("[PACKAGES]", { data });

    const lowestProductValue2 = data.reduce((minPkg, currentPkg) => {
      const currentPrice = parseFloat(currentPkg.product.value1 || "0");
      const minPrice = parseFloat(minPkg.product.value1 || "0");

      return currentPrice < minPrice ? currentPkg : minPkg;
    }).product.value2;

    costOfAssessmentAppointmentsFrom.value = lowestProductValue2;
  } catch (err) {
    logger.error("Unexpected error in executeGetAllPackagesBySupplierId", {
      error: err,
    });
    toast.error("Error inesperado al cargar los paquetes");
  }
}

onMounted(() => {
  executeGetAllPackagesBySupplierId();
});
</script>

<style lang="scss" scoped>
.medico-card {
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

  &__top {
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
      width: 67.08px;
      height: 66.97px;
    }
  }

  &__score {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #3541b4;
    padding: 4px 8px;
    gap: 3px;
    opacity: 1;
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

  &__rating {
    margin: 0;
    font-family: $font-family-main;
    font-weight: 600;
    font-style: Semi Bold;
    font-size: 12px;
    line-height: 1.2;
    letter-spacing: 0;
    color: #ffffff;

    @include respond-to(sm) {
      font-size: 13px;
    }

    @include respond-to(md) {
      font-size: 14.7px;
      line-height: 25.21px;
    }
  }

  &__star-icon {
    width: 12px;
    height: 12px;

    @include respond-to(md) {
      width: 15px;
      height: 15px;
    }
  }

  &__info {
    width: 100%;
    min-width: 0;
  }

  &__name-container {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
  }

  &__name {
    @include label-base;
    font-weight: 600;
    font-style: SemiBold;
    font-size: 17px;
    line-height: 1.2;
    color: #19213d;
    word-break: break-word;

    @include respond-to(sm) {
      font-size: 19px;
    }

    @include respond-to(md) {
      font-size: 21px;
      line-height: 25.21px;
    }
  }

  &__favorite-button {
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

    &:hover {
      .medico-card__favorite-icon {
        color: rgba(53, 65, 180, 0.8);
      }
    }
  }

  &__location,
  &__detail {
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

  &__icon {
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

  &__location-text,
  &__description {
    @include label-base;
    font-weight: 300;
    font-size: 14px;
    line-height: 1.3;
    letter-spacing: 0;
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

  &__availability-label {
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

  &__availability-item {
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

  &__link {
    display: flex;
    flex-direction: column;
    height: 100%;
    text-decoration: none;
  }

  &__body {
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 15px;
    margin-bottom: auto;

    @include respond-to(md) {
      gap: 6.3px;
      margin-top: 20px;
    }
  }

  &__tag {
    display: flex;
    padding: 6px 10px;
    gap: 8px;
    opacity: 1;
    border-radius: 50px;
    background-color: #ebecf7;
    color: #3541b4;
    font-weight: 600;
    font-style: SemiBold;
    font-size: 11px;
    line-height: 100%;
    letter-spacing: 0;

    @include respond-to(md) {
      padding: 8.4px 12.6px;
      gap: 10.5px;
      border-radius: 105.02px;
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

  &__price {
    display: flex;
    flex-direction: column;
    gap: 3px;

    @include respond-to(md) {
      gap: 5px;
    }
  }

  &__price-value {
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

  &__price-description {
    @include label-base;
    font-weight: 300;
    font-size: 12px;
    line-height: 1.2;
    letter-spacing: 0;
    vertical-align: middle;
    color: #6d758f;

    @include respond-to(md) {
      font-size: 14.7px;
      line-height: 21px;
    }
  }

  &__packages-button {
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

    &:hover {
      text-decoration: underline;

      @include respond-to-max(sm) {
        background-color: #3541b4;
        color: white;
      }
    }
  }

  &__arrow-icon {
    width: 16px;
    height: 16px;

    @include respond-to(md) {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
