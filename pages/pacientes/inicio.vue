<script lang="ts" setup>
definePageMeta({
  middleware: ["auth-pacientes"],
});

import { useSupplier, useUdc } from "@/composables/api";
import { useLogger } from "@/composables/useLogger";
import { useToast } from "@/composables/useToast";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const logger = useLogger("PacientesInicio");
const toast = useToast();

const { getAllUdcs } = useUdc();
const { getAllMainSuppliers } = useSupplier();

const { getUserInfo } = useUserInfo();
const userInfo = getUserInfo?.() ?? null;

const safeUser = computed(() => userInfo?.value ?? userInfo ?? {});

const ITEMS_PER_SECTION = 6;
const SKELETON_COUNT = 3;

const GENDER_MAP: Record<string, string> = {
  male: "Bienvenido",
  female: "Bienvenida",
};
const GENDER_FALLBACK = "Bienvenido/a";

const openPackagesModal = ref(false);
const supplier = ref<ISupplierMain | null>(null);

const isLoadingSpecialties = ref(false);
const isLoadingHistory = ref(false);
const specialtiesError = ref<string | null>(null);
const historyError = ref<string | null>(null);

const specialties = ref<IUdc[]>([]);
const history = ref<ISupplierMain[]>([]);

const getQueryParam = (param: string): string => {
  const value = route.query[param];
  if (Array.isArray(value)) return value[0] ?? "";
  return typeof value === "string" ? value : "";
};

const procedureCode = computed(() => getQueryParam("procedure_code"));
const specialtyCode = computed(() => getQueryParam("specialty_code"));

const recommended = computed(() => history.value.slice(0, ITEMS_PER_SECTION));

const popular = computed(() =>
  history.value.slice(ITEMS_PER_SECTION, ITEMS_PER_SECTION * 2),
);

const genderWelcome = computed(() => {
  const gender = safeUser.value.gender;
  if (!gender) return GENDER_FALLBACK;
  return GENDER_MAP[gender.toLowerCase()] ?? GENDER_FALLBACK;
});

const userName = computed(() => safeUser.value.name ?? "");

const handleFetchSpecialties = async (): Promise<void> => {
  isLoadingSpecialties.value = true;
  specialtiesError.value = null;

  try {
    const { data, error } = await getAllUdcs({ type: "MEDICAL_SPECIALTY" });

    if (error && !data) {
      logger.error("No se pudieron cargar las especialidades", {
        info: error.info,
      });
      toast.error(error.info);
      throw new Error(error.info || "Error al cargar las especialidades");
    }

    specialties.value = data ?? [];
  } catch (err) {
    specialtiesError.value = "Error inesperado al cargar especialidades.";
    logger.error("Unexpected error fetching specialties", {
      error: String(err),
    });
  } finally {
    isLoadingSpecialties.value = false;
  }
};

const handleFetchHistory = async (): Promise<void> => {
  isLoadingHistory.value = true;
  historyError.value = null;

  try {
    const { data, error } = await getAllMainSuppliers();

    if (error && !data) {
      logger.error("No se pudieron cargar los médicos y clínicas", {
        info: error.info,
      });
      toast.error(error.info);
      throw new Error(
        error.info || "No se pudieron cargar los médicos y clínicas",
      );
    }

    history.value = data ?? [];
  } catch (err) {
    historyError.value = "Error inesperado al cargar médicos.";
    logger.error("Unexpected error fetching suppliers", {
      error: String(err),
    });
  } finally {
    isLoadingHistory.value = false;
  }
};

const handleRetrySpecialties = async (): Promise<void> => {
  toast.info("Reintentando carga de especialidades…");
  await handleFetchSpecialties();
};

const handleRetryHistory = async (): Promise<void> => {
  toast.info("Reintentando carga de médicos…");
  await handleFetchHistory();
};

const handleSelectDoctor = ({
  selectedSupplier,
}: {
  selectedSupplier: ISupplierMain;
}) => {
  if (!selectedSupplier?.id) {
    logger.warn("Attempted to select doctor without valid ID");
    toast.warning("No se pudo seleccionar el médico.");
    return;
  }

  supplier.value = selectedSupplier;
  openPackagesModal.value = true;
};

const handleClosePackagesModal = (): void => {
  openPackagesModal.value = false;
  supplier.value = null;
  router.replace({ query: {} });
};

onMounted(async () => {
  await Promise.all([handleFetchSpecialties(), handleFetchHistory()]);
});
</script>

<template>
  <NuxtLayout name="pacientes-dashboard">
    <div class="inicio-page">
      <header class="hero" role="banner">
        <div class="hero__container">
          <h1 class="hero__title">
            <span class="hero__greeting">
              {{ genderWelcome }} {{ userName }}
            </span>
            <span class="hero__question">
              ¿Qué servicio médico estás buscando?
            </span>
          </h1>

          <div
            v-if="specialtiesError"
            class="hero__alert"
            role="alert"
            aria-live="assertive"
          >
            <p class="hero__alert-message">{{ specialtiesError }}</p>
            <button
              class="hero__alert-retry"
              type="button"
              @click="handleRetrySpecialties"
            >
              Reintentar
            </button>
          </div>

          <WebsiteSearchBar
            v-else
            :specialties="specialties"
            :loading="isLoadingSpecialties"
            aria-label="Buscar especialidad médica"
          />
        </div>
      </header>

      <main class="content" id="main-content">
        <div class="content__container">
          <div
            v-if="historyError"
            class="error-banner"
            role="alert"
            aria-live="assertive"
          >
            <p class="error-banner__message">{{ historyError }}</p>
            <button
              class="error-banner__retry"
              type="button"
              @click="handleRetryHistory"
            >
              Reintentar carga
            </button>
          </div>

          <template v-else>
            <section class="section" aria-labelledby="recommended-heading">
              <div class="section__content">
                <div class="section__header">
                  <h2 id="recommended-heading" class="section__title">
                    Recomendados
                  </h2>
                </div>

                <div
                  v-if="isLoadingHistory"
                  class="section__loading"
                  role="status"
                  aria-live="polite"
                >
                  <span class="sr-only">Cargando médicos recomendados…</span>
                  <div class="skeleton-grid" aria-hidden="true">
                    <div
                      v-for="n in SKELETON_COUNT"
                      :key="`skeleton-rec-${n}`"
                      class="skeleton-card"
                    />
                  </div>
                </div>

                <div
                  v-else-if="recommended.length === 0"
                  class="empty-state"
                  role="status"
                  aria-live="polite"
                >
                  <div class="empty-state__content">
                    <p class="empty-state__title">
                      No hay recomendados disponibles
                    </p>
                    <p class="empty-state__description">
                      Intenta buscar por especialidad para encontrar médicos o
                      clínicas.
                    </p>
                  </div>
                </div>

                <ul
                  v-else
                  class="cards-grid"
                  role="list"
                  aria-label="Lista de médicos recomendados"
                >
                  <li
                    v-for="medico in recommended"
                    :key="`rec-${medico.id}`"
                    class="cards-grid__item"
                  >
                    <WebsiteTarjetaMedico
                      :medico="medico"
                      @toggle-favorite="() => {}"
                      @show-packages="handleSelectDoctor"
                    />
                  </li>
                </ul>
              </div>
            </section>

            <section class="section" aria-labelledby="popular-heading">
              <div class="section__content">
                <div class="section__header">
                  <h2 id="popular-heading" class="section__title">
                    Más populares
                  </h2>
                </div>

                <div
                  v-if="isLoadingHistory"
                  class="section__loading"
                  role="status"
                  aria-live="polite"
                >
                  <span class="sr-only">Cargando médicos populares…</span>
                  <div class="skeleton-grid" aria-hidden="true">
                    <div
                      v-for="n in SKELETON_COUNT"
                      :key="`skeleton-pop-${n}`"
                      class="skeleton-card"
                    />
                  </div>
                </div>

                <div
                  v-else-if="popular.length === 0"
                  class="empty-state"
                  role="status"
                  aria-live="polite"
                >
                  <div class="empty-state__content">
                    <p class="empty-state__title">
                      No hay populares disponibles
                    </p>
                    <p class="empty-state__description">
                      Intenta buscar por especialidad para encontrar médicos o
                      clínicas.
                    </p>
                  </div>
                </div>

                <ul
                  v-else
                  class="cards-grid"
                  role="list"
                  aria-label="Lista de médicos más populares"
                >
                  <li
                    v-for="medico in popular"
                    :key="`pop-${medico.id}`"
                    class="cards-grid__item"
                  >
                    <WebsiteTarjetaMedico
                      :medico="medico"
                      @toggle-favorite="() => {}"
                      @show-packages="handleSelectDoctor"
                    />
                  </li>
                </ul>
              </div>
            </section>
          </template>
        </div>
      </main>

      <WebsitePackTratamientos
        v-if="supplier"
        :supplier-id="supplier.id"
        :open="openPackagesModal"
        :user-info="userInfo"
        :procedure-code="procedureCode"
        :specialty-code="specialtyCode"
        @close-modal="handleClosePackagesModal"
      />
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.sr-only {
  @include visually-hidden;
}

.hero {
  background-color: #ebecf7;
  padding: 20px 15px;

  @include respond-to(sm) {
    padding: 30px;
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
    @include space-y(15px);

    @include respond-to(md) {
      @include space-y(20px);
    }
  }

  &__title {
    display: flex;
    flex-direction: column;
    padding: 10px 15px;
    gap: 10px;
    text-shadow: 0 1.05px 4.2px rgba(25, 33, 61, 0.08);

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
    text-align: center;
    color: $color-foreground;

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
    text-align: center;
    color: $color-foreground;

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

  &__alert {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-md;
    background-color: $white;
    border-left: 4px solid $color-error;
    border-radius: $border-radius-md;
  }

  &__alert-message {
    @include text-base;
    color: $color-error;
    font-size: 14px;
    text-align: center;
  }

  &__alert-retry {
    @include primary-button;
    padding: $spacing-sm $spacing-md;
    font-size: 14px;
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
    padding: 12px 0;

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

.error-banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-md;
  padding: $spacing-xl $spacing-md;
  background-color: $white;
  border-left: 4px solid $color-error;
  border-radius: $border-radius-md;
  text-align: center;

  &__message {
    @include text-base;
    color: $color-error;
    font-weight: 500;
  }

  &__retry {
    @include primary-button;
    padding: $spacing-sm $spacing-lg;
    font-size: 14px;
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
    font-size: 16px;
    line-height: 1.2;
    color: $color-foreground;
    margin-bottom: $spacing-md;

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

  &__loading {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
  }
}

.cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-md;
  list-style: none;
  padding: 0;
  margin: 0;

  @include respond-to(sm) {
    gap: 20px;
  }

  @include respond-to(md) {
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: $spacing-lg;
  }

  @include respond-to(lg) {
    grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  }

  @include respond-to(xl) {
    grid-template-columns: repeat(auto-fit, minmax(420px, 1fr));
  }

  &__item {
    min-width: 0;
  }
}

.skeleton-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-md;
  width: 100%;

  @include respond-to(md) {
    grid-template-columns: repeat(3, 1fr);
    gap: $spacing-lg;
  }
}

.skeleton-card {
  height: 220px;
  border-radius: 12px;
  background: linear-gradient(90deg, #e8e8e8 25%, #f0f0f0 50%, #e8e8e8 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
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

  &__content {
    max-width: 400px;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    color: $color-foreground;
    margin-bottom: 10px;

    @include respond-to(md) {
      font-size: 20px;
      margin-bottom: 15px;
    }
  }

  &__description {
    font-size: 14px;
    color: $color-text-secondary;
    line-height: 1.4;
    margin-bottom: 20px;

    @include respond-to(md) {
      font-size: 16px;
      margin-bottom: 25px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-card {
    animation: none;
  }
}
</style>
