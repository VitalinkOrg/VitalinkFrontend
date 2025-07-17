<template>
  <div class="medico-card">
    <div class="medico-card__body">
      <div class="medico-card__top">
        <div class="medico-card__profile">
          <img
            :src="medico.profile_picture_url || '/_nuxt/src/assets/picture.svg'"
            alt=""
            class="medico-card__avatar"
          />
          <div class="medico-card__score">
            <p class="medico-card__rating">
              {{ medico.stars_by_supplier?.toFixed(1) || 0 }}
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
              {{ medico.name }}
            </p>
            <div>
              <button
                class="medico-card__favorite-button"
                @click="toggleFavorite"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  :fill="medico.is_favorite ? 'currentColor' : 'none'"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="medico-card__favorite-icon"
                >
                  <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                  <path
                    d="M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z"
                  />
                </svg>
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
              {{ medico.description }}
            </p>
          </div>

          <div class="medico-card__location">
            <img
              src="@/src/assets/marker.svg"
              alt="Ubicaciones"
              class="medico-card__icon"
            />
            <p class="medico-card__location-text">
              {{ medico.location_number }}
              {{
                medico.location_number === 1
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
            {{ medico.date_availability }}
          </p>
        </div>
        <div class="medico-card__availability-item">
          <img
            src="@/src/assets/clock.svg"
            alt="Hora"
            class="medico-card__availability-icon"
          />
          <p class="medico-card__availability-time">
            {{ medico.hour_availability }}
          </p>
        </div>
      </div>

      <div class="medico-card__tags">
        <span
          v-for="service in medico.services_names"
          :key="service"
          class="medico-card__tag"
        >
          {{ service }}
        </span>
      </div>

      <div class="medico-card__footer">
        <div class="medico-card__price">
          <p class="medico-card__price-value">
            ₡{{ medico.search_reference_price }}
          </p>
          <p class="medico-card__price-description">Costo Cita de Valoración</p>
        </div>

        <button class="medico-card__packages-button" @click="getDoctorData">
          Ver paquetes
          <img
            src="@/src/assets/arrow-next.svg"
            alt="Siguiente"
            class="medico-card__arrow-icon"
          />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  medico: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["toggle-favorite", "get-doctor-data"]);

const toggleFavorite = () => {
  emit("toggle-favorite", props.medico.id);
};

const getDoctorData = () => {
  emit("get-doctor-data", props.medico);
};
</script>

<style lang="scss" scoped>
.medico-card {
  background-color: #ffffff;
  border: 1px solid #f1f3f7;
  border-radius: 16px;
  padding: 15px;
  max-width: 420px;

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
      svg {
        fill: #3541b4;
        fill-opacity: 0.2;
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

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin-top: 15px;

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
