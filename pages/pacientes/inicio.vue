<script lang="ts" setup>
definePageMeta({
  middleware: ["auth-pacientes"],
});

import { useSupplier, useUdc } from "@/composables/api";
import type { IUdc, Supplier } from "@/types";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const { fetchUdc } = useUdc();
const { fetchAllMain } = useSupplier();
const { getUserInfo } = useUserInfo();

const userInfo = getUserInfo();

const openPackagesModal = ref(false);

const supplier = ref<Supplier | null>(null);

const getQueryParam = (param: string): string => {
  const value = route.query[param];
  if (Array.isArray(value)) return value[0] ?? "";
  return typeof value === "string" ? value : "";
};

const procedureCode = computed(() => getQueryParam("procedure_code"));
const specialtyCode = computed(() => getQueryParam("specialty_code"));

const specialties = ref<IUdc[]>([]);
const history = ref<any[]>([]);

const handleGetSpecialities = async () => {
  const api = fetchUdc("MEDICAL_SPECIALTY");
  await api.request();

  const response = api.response.value;

  if (response?.data) {
    specialties.value = response.data;
  }
};

const handleGetHistory = async () => {
  const api = fetchAllMain();
  await api.request();

  const response = api.response.value;

  if (response?.data) {
    console.log({ history });
    history.value = response.data;
  }
};

const genderWelcome = computed(() => {
  const gender = userInfo.value?.gender;
  if (!gender) return "Bienvenido/a";
  if (gender.toLowerCase() === "male") return "Bienvenido";
  if (gender.toLowerCase() === "female") return "Bienvenida";
});

const selectDoctor = async ({
  selectedSupplier,
}: {
  selectedSupplier: Supplier;
}) => {
  openPackagesModal.value = true;

  supplier.value = selectedSupplier;
};

const closePackagesModal = () => {
  openPackagesModal.value = false;
  supplier.value = null;
  router.replace({ query: {} });
};

onMounted(async () => {
  await handleGetSpecialities();
  await handleGetHistory();
});
</script>

<template>
  <NuxtLayout name="pacientes-dashboard">
    <div>
      <header class="hero">
        <div class="hero__container">
          <h1 class="hero__title">
            <span class="hero__greeting">
              {{ genderWelcome }} {{ userInfo.name }}
            </span>
            <span class="hero__question">
              ¿Qué servicio médico estás buscando?
            </span>
          </h1>
          <WebsiteSearchBar :specialties="specialties" />
        </div>
      </header>

      <main class="content">
        <div class="content__container">
          <section class="section">
            <div class="section__content">
              <div class="section__header">
                <h2 class="section__title">Recomendados</h2>
              </div>
              <div class="cards-grid">
                <WebsiteTarjetaMedico
                  v-for="medico in history"
                  :key="medico.id"
                  :medico="medico"
                  @toggle-favorite="() => {}"
                  @show-packages="selectDoctor"
                />
              </div>
            </div>
          </section>

          <section class="section">
            <div class="section__content">
              <div class="section__header">
                <h2 class="section__title">Más populares</h2>
              </div>
              <div class="cards-grid">
                <WebsiteTarjetaMedico
                  v-for="medico in history"
                  :key="medico.id"
                  :medico="medico"
                  @toggle-favorite="() => {}"
                  @show-packages="selectDoctor"
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      <WebsitePackTratamientos
        v-if="supplier"
        :supplier-id="supplier.id"
        :open="openPackagesModal"
        :user-info="userInfo"
        :procedure-code="procedureCode"
        :specialty-code="specialtyCode"
        @close-modal="closePackagesModal"
      />
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.hero {
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

  &__greeting {
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

  &__question {
    @include label-base;
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

.content {
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
    max-width: 1310px;
    padding: 12px 0px;

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

.section {
  background-color: #f8f8f8;

  &__header {
    margin-bottom: 1rem;
  }

  &__title {
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
    min-height: 400px;
  }
}

.cards-grid {
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

  &__media {
    margin-bottom: 20px;

    @include respond-to(md) {
      margin-bottom: 30px;
    }
  }

  &__content {
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

  &__action {
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

    &--secondary {
      background-color: transparent;
      color: #3541b4;
      border: 2px solid #3541b4;

      &:hover {
        background-color: #3541b4;
        color: white;
      }
    }

    &--large {
      padding: 16px 32px;
      font-size: 18px;

      @include respond-to(md) {
        padding: 20px 40px;
        font-size: 20px;
      }
    }
  }
}
</style>
