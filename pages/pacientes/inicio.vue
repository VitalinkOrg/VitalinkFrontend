<!-- inicio.vue -->
<script setup>
definePageMeta({
  middleware: ["auth-pacientes"],
});

import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const config = useRuntimeConfig();
const token = useCookie("token");
const user_info = useCookie("user_info");

const doctorData = ref(null);
const loadingPackages = ref(false);
const openPackagesModal = ref(false);
const modalHasBeenOpened = ref(false);

const procedureCode = computed(() => route.query.procedure_code);
const specialtyCode = computed(() => route.query.specialty_code);

const { data: specialties } = await useFetch(
  config.public.API_BASE_URL + "/udc/get_all?type=MEDICAL_SPECIALTY",
  {
    headers: { Authorization: token.value },
    transform: (res) =>
      res.data.map((item) => ({ code: item.code, name: item.name })),
    server: false,
  }
);

const { data: historial } = await useFetch(
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

const selectDoctor = async ({ medico }) => {
  modalHasBeenOpened.value = true;
  openPackagesModal.value = true;

  try {
    loadingPackages.value = true;
    const { data } = await useLazyFetch(
      config.public.API_BASE_URL + "/supplier/get",
      {
        headers: { Authorization: token.value },
        params: { id: medico.id },
        transform: (_doctor) => _doctor.data,
      }
    );

    doctorData.value = data.value;
  } catch (error) {
    console.error("Error obteniendo datos del doctor", error);
  } finally {
    loadingPackages.value = false;
  }
};

const closePackagesModal = () => {
  openPackagesModal.value = false;
  router.replace({ query: {} }); // Opcional: limpiar query params
};
</script>

<template>
  <NuxtLayout name="pacientes-dashboard">
    <div>
      <header class="dashboard-header">
        <div class="dashboard-header__container">
          <h1 class="dashboard-header__title">
            <span class="dashboard-header__highlight">
              {{ genderWelcome }} {{ user_info.name }}
            </span>
            <span class="dashboard-header__subtitle">
              ¿Qué servicio médico estás buscando?
            </span>
          </h1>
          <WebsiteSearchBar
            :solicitar="true"
            :specialties="specialties || []"
            :token="token.value"
          />
        </div>
      </header>

      <main class="dashboard-main">
        <section class="recommended-section">
          <div class="recommended-grid">
            <WebsiteTarjetaMedico
              v-for="medico in historial"
              :key="medico.id"
              :medico="medico"
              @toggle-favorite="() => {}"
              @show-packages="selectDoctor"
            />
          </div>
        </section>
      </main>

      <WebsitePackTratamientos
        v-if="!loadingPackages && doctorData"
        :doctor="doctorData"
        :open="openPackagesModal"
        :user="user_info"
        :procedure-code="procedureCode"
        :specialty-code="specialtyCode"
        @close-modal="closePackagesModal"
      />
    </div>
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
    letter-spacing: 0;
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
    letter-spacing: 0;
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
    letter-spacing: 0;
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
