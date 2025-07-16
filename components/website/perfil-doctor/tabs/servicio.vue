<template>
  <div class="service-tab">
    <p class="service-tab__title">Servicios disponibles</p>

    <!-- Specialty badges -->
    <div class="service-tab__badges-wrapper">
      <button
        v-for="specialty in specialties"
        :key="specialty.code"
        @click="selectSpecialty(specialty.code, specialty.id)"
        class="service-tab__badge"
        style="--bs-bg-opacity: 0.07"
        :class="{
          'service-tab__badge--active': selectedSpecialty === specialty.code,
        }"
      >
        {{ specialty.name }}
      </button>
    </div>

    <!-- Procedure badges (shown when specialty is selected) -->
    <div class="service-tab__procedures-wrapper">
      <button
        v-for="procedure in filteredProcedures"
        :key="procedure.procedure.code"
        @click="
          selectProcedure(procedure.procedure.code, procedure.procedure.id)
        "
        class="service-tab__procedure-badge"
        :class="{
          'service-tab__procedure-badge--active':
            selectedProcedure === procedure.procedure.code,
        }"
      >
        {{ procedure.procedure.name }}
      </button>
    </div>

    <div>
      <p class="service-tab__packages-title"></p>
    </div>

    <!-- All packages for selected procedure -->
    <div v-if="filteredPackages.length > 0" class="service-tab__packages">
      <div
        class="service-tab-card"
        v-for="(pkg, index) in filteredPackages"
        :key="pkg.id"
      >
        <div
          class="service-tab-card__wrapper"
          :class="{ selected: pkg.is_king }"
        >
          <div class="service-tab-card__header">
            {{ pkg.product.name }}
            <span v-if="pkg.is_king">
              <img
                src="@/src/assets/crown.svg"
                alt="Recomendado"
                class="img-fluid"
              />
            </span>
          </div>
          <div class="service-tab-card__body">
            <h5 class="service-tab-card__price">₡{{ getPackagePrice(pkg) }}</h5>
            <p class="service-tab-card__discount" v-if="pkg.discount">
              Precio original
              <span>₡{{ pkg.product.value1 }}</span>
            </p>
            <small class="service-tab-card__disclaimer">
              Los precios pueden variar según el diagnóstico del médico.
            </small>
            <p class="service-tab-card__rating-wrapper">
              <span class="service-tab-card__rating">
                <img
                  src="@/src/assets/star.svg"
                  alt="Rating"
                  class="img-fluid"
                />
                5.0
              </span>
              <span class="service-tab-card__reviews"
                >({{ doctorReviews.length }} Reseñas)</span
              >
            </p>
            <div class="service-tab-card__services-wrapper">
              <p class="service-tab-card__services-title">Servicios:</p>
              <ul class="service-tab-card__services">
                <li
                  class="service-tab-card__services-item"
                  v-for="service in pkg.services_offer.ASSESSMENT_DETAILS"
                  :key="service"
                >
                  <div class="service-tab-card__services-icon-wrapper">
                    <img
                      src="@/src/assets/check.svg"
                      alt="Incluido"
                      class="service-tab-card__services-icon"
                    />
                  </div>
                  <p class="service-tab-card__services-text">
                    {{ getAssesmentLabel(service) }}
                  </p>
                </li>
              </ul>
            </div>

            <button
              v-if="pkg.product.name === 'Cita de Valoración'"
              class="service-tab-card__assessment-appointment-button"
              @click="selectPackage(pkg)"
            >
              Cita de valoración
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-else-if="selectedSpecialty && filteredProcedures.length === 0"
      class="alert alert-info"
    >
      No hay procedimientos disponibles para esta especialidad
    </div>
    <div
      v-else-if="selectedProcedure && filteredPackages.length === 0"
      class="alert alert-info"
    >
      No hay paquetes disponibles para este procedimiento
    </div>
  </div>
</template>

<script setup lang="ts">
interface MedicalSpecialty {
  code: string;
  id: number;
  name: string;
}

interface Procedure {
  procedure: {
    code: string;
    id: number;
    name: string;
  };
  packages: Package[];
}

interface Package {
  id: number;
  product: {
    name: string;
    value1: string;
  };
  discount: number;
  services_offer: {
    ASSESSMENT_DETAILS: string[];
  };
  is_king: boolean;
}

interface Review {
  first_name: string;
  last_name: string;
  message: string;
  pacient_type: string;
  score: number;
}

defineProps<{
  doctor: {
    id: number;
    name: string;
    locations: { name: string }[];
    availabilities: any[];
    reviews?: Review[];
    review_details_summary?: any[];
    services: {
      medical_specialty: MedicalSpecialty;
      procedures: Procedure[];
    }[];
  };
  selectSpecialty: (specialtyCode: string, specialtyId: number) => void;
  selectedSpecialty: string | null;
  filteredProcedures: Procedure[];
  selectedProcedure: string | null;
  filteredPackages: Package[];
  selectPackage: (pkg: Package) => void;
  getAssesmentLabel: (code: string) => string;
  doctorReviews: Review[];
  getPackagePrice: (pkg: Package) => number;
  selectProcedure: (procedureCode: string, procedureId: number) => void;
  specialties: MedicalSpecialty[];
}>();
</script>

<style lang="scss" scoped>
.service-tab {
  padding: 20px 0px;

  &__title {
    @include label-base;
    font-weight: 400;
    font-size: 14px;
    line-height: 24px;
    color: #19213d;
  }

  &__badges-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 10px 0;

    @include respond-to-max(sm) {
      gap: $spacing-xs;
    }
  }

  &__badge {
    @include button-base;
    border-radius: 10px;
    padding: 10px 20px;
    border-width: 1px;
    font-weight: 400;
    color: #6d758f;
    background-color: #f8faff;

    @include respond-to-max(sm) {
      padding: $spacing-xs $spacing-sm;
      font-size: 12px;
    }
  }

  &__badge--active {
    color: #0cadbb;
    background-color: #e7f7f8;
    border: 1px solid #0cadbb;
  }

  &__procedures-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    @include respond-to-max(sm) {
      gap: $spacing-xs;
    }
  }

  &__procedure-badge {
    @include button-base;
    border-radius: 16px;
    padding: 2px 8px;
    border-width: 1px;
    font-weight: 400;
    font-size: 12px;
    color: #6d758f;
    background-color: #f8faff;

    @include respond-to-max(sm) {
      padding: $spacing-xs $spacing-sm;
      font-size: 12px;
    }

    &--active {
      color: #242d7c;
      background-color: #ebecf7;
      border: 1px solid #3541b4;
    }
  }

  &__packages {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;

    @include respond-to-max(sm) {
      grid-template-columns: 1fr;
      gap: $spacing-md;
    }
  }

  &__packages-title {
    @include label-base;
    font-weight: 400;
    font-size: 14px;
    line-height: 24px;
    color: #6d758f;
    margin-top: 12px;
  }

  .service-tab-card {
    width: 100%;
    max-width: 256px;
    height: 100%;
    border-radius: 20px;
    padding-bottom: 15px;
    border-width: 1px;
    background-color: #ffffff;
    border: 1px solid #f1f3f7;
    box-shadow: 0px 2px 8px 0px #00000014;
    overflow: hidden;

    @include respond-to-max(sm) {
      max-width: 100%;
    }

    &__wrapper {
      background-color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
    }

    &__header {
      @include label-base;
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

      @include respond-to-max(sm) {
        padding: $spacing-md;
        font-size: 14px;
      }
    }

    &__body {
      padding: 0px 20px;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;

      @include respond-to-max(sm) {
        padding: 0 $spacing-md;
      }
    }

    &__price {
      @include label-base;
      font-weight: 600;
      font-size: 18px;
      line-height: 20px;
      color: #19213d;
      padding-top: 4px;
      margin-bottom: 2px;
    }

    &__discount {
      @include label-base;
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
      @include label-base;
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

    &__services-title {
      @include label-base;
      font-weight: 500;
      font-size: 13px;
      line-height: 24px;
      color: #6d758f;
      margin-bottom: 5px;
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
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      margin-right: 8px;
    }

    &__services-text {
      @include label-base;
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      color: #353e5c;
    }
    &__assessment-appointment-button {
      @include outline-button;
      width: 100%;
      box-shadow: 0px 1px 2px 0px #1018280d;
    }
  }
}
</style>
