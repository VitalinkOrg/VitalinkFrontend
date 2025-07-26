<template>
  <div class="service-card">
    <div class="service-card__wrapper" :class="{ selected: pkg.is_king }">
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
        <h5 class="service-card__price">₡{{ getPackagePrice(pkg) }}</h5>

        <p class="service-card__monthly-payment">
          Cuotas mensuales desde ₡{{ getMonthlyPayment(pkg) }}
        </p>

        <p
          v-if="pkg.product.name === 'Cita de Valoración'"
          class="service-card__payment-disclaimer"
        >
          Podes pagar el día de tu cita
        </p>

        <p class="service-card__discount" v-if="pkg.discount">
          Precio original
          <span>₡{{ pkg.product.value1 }}</span>
        </p>

        <small class="service-card__disclaimer">
          Los precios pueden variar según el diagnóstico del médico.
        </small>

        <p class="service-card__rating-wrapper">
          <span class="service-card__rating">
            <img src="@/src/assets/star.svg" alt="Rating" class="img-fluid" />
            5.0
          </span>
          <span class="service-card__reviews"
            >({{ doctorReviews.length }} Reseñas)</span
          >
        </p>

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
                <AtomsIconsCalendarIcon size="20" />
              </span>
              {{ doctor.date_availability }}
            </span>
            <span class="service-card__availability-time">
              <span class="service-card__availability-icon">
                <AtomsIconsClockIcon size="20" />
              </span>
              {{ doctor.hour_availability }}
            </span>
          </p>
        </div>

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
                <AtomsIconsCheckIcon class="service-card__services-icon" />
              </div>
              <p class="service-card__services-text">
                {{ getAssesmentLabel(service) }}
              </p>
            </li>
          </ul>
        </div>

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
    :userInfo="userInfo"
    :doctorInfo="doctor"
    :selectedDay="selectedDay"
    :selectedHour="selectedHour"
    :selected-package="pkg"
    :isOpen="isOpenModal"
    :currentStep="currentModalStep"
    :offers="offers"
    @close="closeModal"
  />
</template>

<script setup>
import { defineProps, ref } from "vue";

const props = defineProps({
  pkg: {
    type: Object,
    required: true,
  },
  doctor: {
    type: Object,
    required: true,
  },
  doctorReviews: {
    type: Array,
    default: () => [],
  },
  getPackagePrice: {
    type: Function,
    required: true,
  },
  getAssesmentLabel: {
    type: Function,
    required: true,
  },
  selectPackage: {
    type: Function,
    required: true,
  },
  selectedPackage: {
    type: Object,
    default: null,
  },
  userInfo: {
    type: Object,
    required: true,
  },
  selectedSpecialtyId: {
    type: Number,
    default: null,
  },
  selectedProcedureId: {
    type: Number,
    default: null,
  },
});

const currentModalStep = ref(1);
const isOpenModal = ref(false);

const getMonthlyPayment = (pkg) => {
  let price;
  if (pkg.discount) {
    price = parseFloat(pkg.product.value2 || pkg.product.value1 || 0);
  } else {
    price = parseFloat(pkg.product.value1 || 0);
  }

  const monthlyPayment = (price / 12) * 1.1;
  return Math.round(monthlyPayment).toLocaleString();
};

const openModal = () => {
  isOpenModal.value = true;
  currentModalStep.value = 1;
};

const closeModal = () => {
  isOpenModal.value = false;
  currentModalStep.value = 1;
};
</script>

<style lang="scss" scoped>
.service-card {
  width: 100%;
  max-width: 256px;
  height: 100%;
  max-height: 510px;
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

  &__assessment-appointment-button {
    @include outline-button;
    width: 100%;
    font-weight: 600;
    font-size: 14px;
  }
}
</style>
