<template>
  <div class="service-card">
    <div class="service-card__wrapper" :class="{ selected: pkg.is_king }">
      <!-- Leyenda especial para Cita de Valoración -->
      <div
        v-if="pkg.product.name === 'Cita de Valoración'"
        class="service-card__legend"
      >
        Primero vamos a valorarte
      </div>

      <div class="service-card__header">
        {{ pkg.product.name }}
        <span v-if="pkg.is_king">
          <img
            src="@/src/assets/crown.svg"
            alt="Recomendado"
            class="img-fluid"
          />
        </span>
      </div>

      <div class="service-card__body">
        <!-- Precio -->
        <h5 class="service-card__price">₡{{ getPackagePrice(pkg) }}</h5>

        <!-- Disclaimer para Cita de Valoración -->
        <p
          v-if="pkg.product.name === 'Cita de Valoración'"
          class="service-card__payment-disclaimer"
        >
          Podes pagar el día de tu cita
        </p>

        <!-- Precio original con descuento -->
        <p class="service-card__discount" v-if="pkg.discount">
          Precio original
          <span>₡{{ pkg.product.value1 }}</span>
        </p>

        <!-- Aviso general -->
        <small class="service-card__disclaimer">
          Los precios pueden variar según el diagnóstico del médico.
        </small>

        <!-- Calificación -->
        <p class="service-card__rating-wrapper">
          <span class="service-card__rating">
            <img src="@/src/assets/star.svg" alt="Rating" class="img-fluid" />
            5.0
          </span>
          <span class="service-card__reviews"
            >({{ doctorReviews.length }} Reseñas)</span
          >
        </p>

        <!-- Disponibilidad (solo para Cita de Valoración) -->
        <div
          v-if="pkg.product.name === 'Cita de Valoración'"
          class="service-card__availability"
        >
          <p class="service-card__availability-title">
            Próxima Disponibilidad:
          </p>
          <p class="service-card__availability-info">
            <span class="service-card__availability-date">
              <span class="service-card__availability-icon">
                <svg
                  width="15"
                  height="16"
                  viewBox="0 0 15 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.07143 5.1875H10.875M3.60714 1.4375V2.56264M11.25 1.4375V2.5625M13.5 5.5625L13.5 11.5626C13.5 13.2194 12.1569 14.5626 10.5 14.5626H4.5C2.84315 14.5626 1.5 13.2194 1.5 11.5626V5.5625C1.5 3.90565 2.84315 2.5625 4.5 2.5625H10.5C12.1569 2.5625 13.5 3.90565 13.5 5.5625Z"
                    stroke="#3541B4"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              {{ doctor.date_availability }}
            </span>
            <span class="service-card__availability-time">
              <span class="service-card__availability-icon">
                <svg
                  width="15"
                  height="16"
                  viewBox="0 0 15 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7.5 4.25V8L10 9.25M13.75 8C13.75 11.4518 10.9518 14.25 7.5 14.25C4.04822 14.25 1.25 11.4518 1.25 8C1.25 4.54822 4.04822 1.75 7.5 1.75C10.9518 1.75 13.75 4.54822 13.75 8Z"
                    stroke="#3541B4"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              {{ doctor.hour_availability }}
            </span>
          </p>
        </div>

        <!-- Servicios (solo para otros paquetes) -->
        <div
          v-if="pkg.product.name !== 'Cita de Valoración'"
          class="service-card__services-wrapper"
        >
          <p class="service-card__services-title">Servicios:</p>
          <ul class="service-card__services">
            <li
              class="service-card__services-item"
              v-for="service in pkg.services_offer.ASSESSMENT_DETAILS"
              :key="service"
            >
              <div class="service-card__services-icon-wrapper">
                <img
                  src="@/src/assets/check.svg"
                  alt="Incluido"
                  class="service-card__services-icon"
                />
              </div>
              <p class="service-card__services-text">
                {{ getAssesmentLabel(service) }}
              </p>
            </li>
          </ul>
        </div>

        <!-- Botón solo para Cita de Valoración -->
        <button
          v-if="pkg.product.name === 'Cita de Valoración'"
          class="service-card__assessment-appointment-button"
          @click="openModal()"
        >
          Cita de valoración
        </button>
      </div>
    </div>
  </div>

  <WebsiteReservarModal
    :selectedProcedureId="selectedProcedureId"
    :selectedSpecialtyId="selectedSpecialtyId"
    :userInfo="user"
    :doctorInfo="doctor"
    :selectedDay="selectedDay"
    :selectedHour="selectedHour"
    :selectedPackage="selectedPackage"
    :isOpen="isOpenModal"
    :currentStep="2"
    :offers="offers"
    @close="closeModal"
  />
</template>

<script setup>
import { defineProps } from "vue";

defineProps({
  // Datos del paquete
  pkg: {
    type: Object,
    required: true,
  },
  // Datos del médico
  doctor: {
    type: Object,
    required: true,
  },
  // Reseñas del médico
  doctorReviews: {
    type: Array,
    default: () => [],
  },
  // Función para calcular precio
  getPackagePrice: {
    type: Function,
    required: true,
  },
  // Función para obtener nombre de servicio
  getAssesmentLabel: {
    type: Function,
    required: true,
  },
  // Función para seleccionar paquete
  selectPackage: {
    type: Function,
    required: true,
  },
});

const isOpenModal = ref(false);

const openModal = () => {
  isOpenModal.value = true;
};

const closeModal = () => {
  isOpenModal.value = false;
};
</script>

<style lang="scss" scoped>
.service-card {
  width: 100%;
  max-width: 256px;
  height: 100%;
  max-height: 450px;
  border-radius: 20px;
  padding-bottom: 15px;
  border-width: 1px;
  background-color: #ffffff;
  border: 1px solid #f1f3f7;
  box-shadow: 0px 2px 8px 0px #00000014;
  overflow: hidden;
  min-height: 441px;

  @media (max-width: 768px) {
    max-width: 100%;
  }

  &__wrapper {
    height: 100%;
    display: flex;
    background-color: #fff;
    flex-direction: column;
    justify-content: space-between;
  }

  &__header {
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
  }

  &__body {
    padding: 0px 20px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 100%;
  }

  &__price {
    font-weight: 600;
    font-size: 18px;
    line-height: 20px;
    color: #19213d;
    padding-top: 4px;
    margin-bottom: 2px;
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

  &__legend {
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    color: #0cadbb;
    text-align: center;
    padding: 8px 20px;
    background-color: #f0feff;
    border-bottom: 1px solid #e7f7f8;
  }

  &__disclaimer {
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    color: #6d758f;
    padding-bottom: 4px;
  }

  &__payment-disclaimer {
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    color: #6d758f;
    font-style: italic;
    margin-bottom: 8px;
  }

  &__availability {
    &-title {
      font-weight: 500;
      font-size: 13px;
      line-height: 24px;
      color: #6d758f;
      margin-bottom: 5px;
    }

    &-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    &-date,
    &-time {
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 500;
      font-size: 14px;
      line-height: 24px;
      color: #353e5c;
    }

    &-icon {
      display: flex;
      align-items: center;
      svg {
        width: 15px;
        height: 15px;
      }
    }
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
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: #353e5c;
  }

  &__assessment-appointment-button {
    @include outline-button;
    width: 100%;
    font-weight: 600;
    font-size: 14px;
  }
}
</style>
