<script setup>
definePageMeta({
  middleware: ["auth-pacientes"],
});
const config = useRuntimeConfig();
const token = useCookie("token");
const user_info = useCookie("user_info");

console.log("USER INFO: ", user_info);

const { data: specialties, pending: pendingSpecialties } = await useFetch(
  config.public.API_BASE_URL + "/udc/get_all?type=MEDICAL_SPECIALTY",
  {
    headers: { Authorization: token.value },
    transform: (res) =>
      res.data.map((item) => ({ code: item.code, name: item.name })),
    server: false, // Ensure this runs on client-side
  }
);

const { data: appointments, pending: pendingAppointments } = await useFetch(
  config.public.API_BASE_URL + "/internal_patient_dashboard/appointments",
  {
    headers: { Authorization: token.value },
    transform: (_appointments) => _appointments.data,
  }
);

const { data: historial, pending: pendingHistorial } = await useFetch(
  config.public.API_BASE_URL + "/supplier/get_all_main",
  {
    headers: { Authorization: token.value },
    transform: (_historial) => _historial.data,
  }
);

const genderWelcome = computed(() => {
  const gender = user_info.value?.gender;
  if (!gender) return "Bienvenido/a";
  if (gender.toLowerCase() === "male") return "Bienvenido";
  if (gender.toLowerCase() === "female") return "Bienvenida";
});

console.log(historial);
</script>

<template>
  <NuxtLayout name="pacientes-dashboard">
    <div v-if="pendingUser"></div>
    <div v-else>
      <header class="dashboard-header">
        <div class="dashboard-header__container">
          <h1 class="dashboard-header__title">
            <span class="dashboard-header__highlight">
              {{ genderWelcome }} {{ user_info.name }}
            </span>
            <span class="dashboard-header__subtitle"
              >¿Qué servicio médico estás buscando?</span
            >
          </h1>
          <WebsiteSearchBar
            :solicitar="true"
            :specialties="specialties || []"
            :token="token.value"
          />
        </div>
      </header>

      <main class="dashboard-main">
        <div class="dashboard-main__container">
          <section class="recommended-section">
            <div class="recommended-section__wrapper">
              <div class="recommended-section__intro">
                <p class="recommended-section__label">Recomendados</p>
                <div
                  v-if="historial !== null && historial.length > 0"
                  class="recommended-section__content"
                >
                  <div class="recommended-grid">
                    <div
                      class="recommended-card"
                      v-for="medico in historial"
                      :key="medico.id"
                    >
                      <div class="recommended-card__body">
                        <div class="recommended-card__top">
                          <div class="recommended-card__profile">
                            <img
                              :src="
                                medico.profile_picture_url ||
                                '/_nuxt/src/assets/picture.svg'
                              "
                              alt=""
                              class="recommended-card__avatar"
                            />
                            <div class="recommended-card__score">
                              <p class="recommended-card__rating">
                                {{ medico.stars_by_supplier?.toFixed(1) || 0 }}
                              </p>
                              <img
                                src="@/src/assets/star.svg"
                                alt="Calificación"
                                class="recommended-card__star-icon"
                              />
                            </div>
                          </div>

                          <div class="recommended-card__info">
                            <div class="recommended-card__name-container">
                              <p class="recommended-card__name">
                                {{ medico.name }}
                              </p>
                              <div>
                                <button
                                  class="recommended-card__favorite-button"
                                  @click="toggleFavorite(medico.id)"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                    :fill="
                                      medico.is_favorite
                                        ? 'currentColor'
                                        : 'none'
                                    "
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    class="recommended-card__favorite-icon"
                                  >
                                    <path
                                      stroke="none"
                                      d="M0 0h24v24H0z"
                                      fill="none"
                                    />
                                    <path
                                      d="M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            <div class="recommended-card__detail">
                              <img
                                src="@/src/assets/doctor-element.svg"
                                alt="Especialidad"
                                class="recommended-card__icon"
                              />
                              <p class="recommended-card__description">
                                {{ medico.description }}
                              </p>
                            </div>

                            <div class="recommended-card__location">
                              <img
                                src="@/src/assets/marker.svg"
                                alt="Ubicaciones"
                                class="recommended-card__icon"
                              />
                              <p class="recommended-card__location-text">
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

                        <div class="recommended-card__availability">
                          <p class="recommended-card__availability-label">
                            Disponibilidad
                          </p>
                          <div class="recommended-card__availability-item">
                            <img
                              src="@/src/assets/calendar.svg"
                              alt="Fecha"
                              class="recommended-card__availability-icon"
                            />
                            <p class="recommended-card__availability-date">
                              {{ medico.date_availability }}
                            </p>
                          </div>
                          <div class="recommended-card__availability-item">
                            <img
                              src="@/src/assets/clock.svg"
                              alt="Hora"
                              class="recommended-card__availability-icon"
                            />
                            <p class="recommended-card__availability-time">
                              {{ medico.hour_availability }}
                            </p>
                          </div>
                        </div>

                        <div class="recommended-card__tags">
                          <span
                            v-for="service in medico.services_names"
                            :key="service"
                            class="recommended-card__tag"
                            >{{ service }}</span
                          >
                        </div>

                        <div class="recommended-card__footer">
                          <div class="recommended-card__price">
                            <p class="recommended-card__price-value">
                              ₡{{ medico.search_reference_price }}
                            </p>
                            <p class="recommended-card__price-description">
                              Costo Cita de Valoración
                            </p>
                          </div>

                          <NuxtLink
                            :href="'/perfiles/doctor/' + medico.id"
                            class="recommended-card__packages-link"
                          >
                            Ver paquetes
                            <img
                              src="@/src/assets/arrow-next.svg"
                              alt="Siguiente"
                              class="recommended-card__arrow-icon"
                            />
                          </NuxtLink>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="empty-state">
                  <div class="empty-state__image">
                    <AtomsIconsChartVacio />
                  </div>
                  <div class="empty-state__text">
                    <p class="empty-state__title">
                      Aún no tienes actividad en tu tablero
                    </p>
                    <p class="empty-state__description">
                      Muy pronto podrás administrar y verificar estadísticas y
                      actividades de los usuarios de Vitalink.
                    </p>
                    <button class="empty-state__button">Empezar</button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
    <MedicosCitaCancelModal
      :open="openDateCancelModal"
      :appointment="modalData"
      @close-modal="closeModal"
    />
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.dashboard-header {
  background-color: #ebecf7;
  padding: 20px 15px;

  @include respond-to(sm) {
    padding: 30px 30px;
  }

  @include respond-to(md) {
    padding: 35px 50px;
  }

  @include respond-to(lg) {
    padding: 39px 100px;
  }

  @include respond-to(xl) {
    padding: 39px 150px;
  }

  @include respond-to(xxl) {
    padding: 39px 255px;
  }

  &__container {
    & > * + * {
      margin-top: 15px;

      @include respond-to(md) {
        margin-top: 20px;
      }
    }
  }

  &__title {
    display: flex;
    flex-direction: column;
    padding: 10px 15px;
    gap: 10px;
    text-shadow: 0px 1.05px 4.2px 0px #19213d14;

    @include respond-to(md) {
      padding: 15.75px 18.9px;
      gap: 15px;
    }
  }

  &__highlight {
    font-family: $font-family-montserrat-alt;
    font-weight: 700;
    font-size: 20px;
    line-height: 1.2;
    letter-spacing: 0%;
    text-align: center;
    vertical-align: middle;
    color: #19213d;

    @include respond-to(sm) {
      font-size: 22px;
    }

    @include respond-to(md) {
      font-size: 25.21px;
      line-height: 21px;
    }
  }

  &__subtitle {
    font-family: $font-family-montserrat-alt;
    font-weight: 500;
    font-size: 16px;
    line-height: 1.2;
    letter-spacing: 0%;
    text-align: center;
    vertical-align: middle;
    color: #19213d;

    @include respond-to(sm) {
      font-size: 18px;
    }

    @include respond-to(md) {
      font-size: 20px;
    }

    @include respond-to(lg) {
      font-size: 25.21px;
      line-height: 21px;
    }
  }
}

.dashboard-main {
  padding: 15px 10px;
  background-color: #f8f8f8;

  @include respond-to(sm) {
    padding: 18px 15px;
  }

  @include respond-to(md) {
    padding: 21px 15px;
  }

  &__container {
    width: 100%;
    margin: 0 auto;
    max-width: 100%;

    @include respond-to(md) {
      max-width: 720px;
    }

    @include respond-to(lg) {
      max-width: 960px;
    }

    @include respond-to(xl) {
      max-width: 1200px;
    }

    @include respond-to(xxl) {
      max-width: 1310px;
    }
  }
}

.recommended-section {
  padding-top: 1rem;
  padding-bottom: 2rem;
  background-color: #f8f8f8;

  @include respond-to(md) {
    padding-top: 1.5rem;
    padding-bottom: 3rem;
  }

  &__intro {
    margin-bottom: 1rem;
  }

  &__label {
    @include label-base;
    font-weight: 600;
    font-style: Semi Bold;
    font-size: 16px;
    line-height: 1.2;
    letter-spacing: 0%;
    color: #19213d;
    margin-bottom: 16px;

    @include respond-to(md) {
      font-size: 18px;
      line-height: 21px;
      margin-bottom: 22px;
    }
  }

  &__content {
    margin-top: 1rem;
  }
}

.recommended-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;

  @include respond-to(sm) {
    gap: 20px;
  }

  @include respond-to(md) {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 24px;
  }

  @include respond-to(lg) {
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  }

  @include respond-to(xl) {
    grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  }
}

.recommended-card {
  background-color: #ffffff;
  border: 1px solid #f1f3f7;
  border-radius: 16px;
  padding: 15px;

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
    letter-spacing: 0%;
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
    letter-spacing: 0%;
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
    letter-spacing: 0%;

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
    letter-spacing: 0%;
    vertical-align: middle;
    color: #6d758f;

    @include respond-to(md) {
      font-size: 14.7px;
      line-height: 21px;
    }
  }

  &__packages-link {
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 20px;

  @include respond-to(md) {
    padding: 60px 40px;
  }

  &__image {
    margin-bottom: 20px;

    @include respond-to(md) {
      margin-bottom: 30px;
    }
  }

  &__text {
    max-width: 400px;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: #19213d;
    margin-bottom: 10px;

    @include respond-to(md) {
      font-size: 20px;
      margin-bottom: 15px;
    }
  }

  &__description {
    font-size: 14px;
    color: #6d758f;
    line-height: 1.4;
    margin-bottom: 20px;

    @include respond-to(md) {
      font-size: 16px;
      margin-bottom: 25px;
    }
  }

  &__button {
    @include button-base;
    background-color: #3541b4;
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;

    @include respond-to(md) {
      padding: 15px 30px;
      font-size: 16px;
    }

    &:hover {
      background-color: darken(#3541b4, 10%);
    }
  }
}
</style>
