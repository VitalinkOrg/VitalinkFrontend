<!-- pages/buscar/index.vue -->
<script setup>
definePageMeta({
  middleware: ["auth-pacientes"],
});

import axios from "axios";

const config = useRuntimeConfig();
const token = useCookie("token");
const route = useRoute();
const router = useRouter();

const clinicas = ref([]);
const specialties = ref([]);
const procedures = ref([]);
const isLoading = ref(true);
const isSpecialtiesLoading = ref(true);
const isMapVisible = ref(false);

const filter_query = ref(route.query.filter_name || "");
const insurance = ref(route.query.insurance || "");
const entity_type = ref(route.query.entity_type || "");
const min_price = ref(route.query.min_price || "");
const max_price = ref(route.query.max_price || "");
const specialty = ref(route.query.specialty || "");
const specialty_code = ref(route.query.specialty_code || "");
const procedure_code = ref(route.query.procedure_code || "");
const min_stars = ref(route.query.min_stars || "");
const lugar = ref(route.query.lugar || "");

const filtersData = ref({
  procedimiento: "",
  lugar: "",
  valoracion: "",
  disponibilidad: "",
  entity: "",
  min: "",
  max: "",
  procedures: [],
});

const currentProcedureName = computed(() => {
  if (!procedure_code.value || !procedures.value.length) return null;
  const procedure = procedures.value.find(
    (p) => p.code === procedure_code.value
  );
  return procedure ? procedure.name : null;
});

const currentSpecialtyName = computed(() => {
  if (!specialty_code.value || !specialties.value.length) return null;
  const specialty = specialties.value.find(
    (s) => s.code === specialty_code.value
  );
  return specialty ? specialty.name : null;
});

const searchDisplayText = computed(() => {
  return currentProcedureName.value || currentSpecialtyName.value;
});

const initializeFiltersFromQuery = async () => {
  const query = route.query;

  filtersData.value.procedimiento = query.procedure_code || "";
  filtersData.value.lugar = query.province || "";
  filtersData.value.valoracion = query.min_stars || "";
  filtersData.value.min = query.min_price || "";
  filtersData.value.max = query.max_price || "";
  filtersData.value.entity = query.entity_type || "";

  specialty_code.value = query.specialty_code || "";
  procedure_code.value = query.procedure_code || "";

  if (!filtersData.value.disponibilidad.length) {
    filtersData.value.disponibilidad = [
      { code: "all", name: "Todos" },
      { code: "weeks", name: "Proximas semanas" },
      { code: "months", name: "Proximos meses" },
      { code: "days", name: "Proximos dias" },
    ];
  }
};

const loadSpecialties = async () => {
  isSpecialtiesLoading.value = true;
  try {
    const response = await axios.get(
      config.public.API_BASE_URL + "/udc/get_all?type=MEDICAL_SPECIALTY",
      {
        headers: { Authorization: token.value },
      }
    );
    specialties.value = response.data.data.map((item) => ({
      code: item.code,
      name: item.name,
    }));
  } catch (error) {
    console.error("Error loading specialties:", error);
  } finally {
    isSpecialtiesLoading.value = false;
  }
};

const loadProcedures = async (specialtyCode) => {
  if (!specialtyCode) {
    procedures.value = [];
    return;
  }

  try {
    const response = await axios.get(
      `${config.public.API_BASE_URL}/udc/get_all?father_code=${specialtyCode}&type=MEDICAL_PROCEDURE`,
      {
        headers: { Authorization: token.value },
      }
    );

    if (response.data?.data) {
      procedures.value = response.data.data.map((item) => ({
        code: item.code,
        name: item.name,
      }));
    } else {
      procedures.value = [];
    }
  } catch (error) {
    console.error("Error loading procedures:", error);
    procedures.value = [];
  }
};

const search = async () => {
  isLoading.value = true;
  clinicas.value = [];

  const params = {};

  if (filter_query.value) params.filter_name = filter_query.value;
  if (procedure_code.value) params.procedure_code = procedure_code.value;
  if (min_stars.value) params.min_stars = min_stars.value;
  if (min_price.value) params.min_price = min_price.value;
  if (max_price.value) params.max_price = max_price.value;
  if (lugar.value) params.lugar = lugar.value;
  if (specialty_code.value) params.specialty_code = specialty_code.value;

  const setup = {
    params,
    headers: { Authorization: token.value },
  };

  try {
    const response = await axios.get(
      config.public.API_BASE_URL + "/supplier/get_all_main",
      setup
    );
    clinicas.value = response.data.data;
  } catch (e) {
    console.error("❌ Error en búsqueda:", e);
  } finally {
    isLoading.value = false;
  }
};

const onFiltersChange = (newFilters) => {
  filtersData.value = { ...filtersData.value, ...newFilters };

  const newQuery = {
    ...route.query,
    ...(filtersData.value.procedimiento && {
      procedure_code: filtersData.value.procedimiento,
    }),
    ...(filtersData.value.lugar && { province: filtersData.value.lugar }),
    ...(filtersData.value.valoracion && {
      min_stars: filtersData.value.valoracion,
    }),
    ...(filtersData.value.min && { min_price: filtersData.value.min }),
    ...(filtersData.value.max && { max_price: filtersData.value.max }),
    ...(filtersData.value.entity && {
      entity_type: filtersData.value.entity,
    }),
  };

  router.push({
    path: "/buscar",
    query: newQuery,
  });
};

watch(
  () => route.query.min_stars,
  (newVal) => {
    min_stars.value = newVal;
    search();
  }
);

watch(
  () => route.query.min_price,
  (newVal) => {
    min_price.value = newVal;
    search();
  }
);

watch(
  () => route.query.max_price,
  (newVal) => {
    max_price.value = newVal;
    search();
  }
);

watch(
  () => route.query.specialty_code,
  (newVal) => {
    specialty_code.value = newVal;
    if (newVal) {
      loadProcedures(newVal);
    } else {
      procedures.value = [];
    }
    search();
  }
);

watch(
  () => route.query.procedure_code,
  (newVal) => {
    procedure_code.value = newVal;
    search();
  }
);

watch(
  () => route.query,
  (newQuery, oldQuery) => {
    initializeFiltersFromQuery();

    if (
      newQuery.specialty_code !== oldQuery?.specialty_code ||
      newQuery.procedure_code !== oldQuery?.procedure_code ||
      newQuery.timestamp !== oldQuery?.timestamp
    ) {
      search();
    }
  },
  { deep: true }
);

onMounted(async () => {
  filter_query.value = route.query.filter_name || "";
  insurance.value = route.query.insurance || "";
  entity_type.value = route.query.entity_type || "";
  min_price.value = route.query.min_price || "";
  max_price.value = route.query.max_price || "";
  specialty.value = route.query.specialty || "";
  min_stars.value = route.query.min_stars || "";
  specialty_code.value = route.query.specialty_code || "";
  procedure_code.value = route.query.procedure_code || "";
  lugar.value = route.query.lugar || "";

  await initializeFiltersFromQuery();
  await loadSpecialties();

  if (specialty_code.value) {
    await loadProcedures(specialty_code.value);
  }

  search();
});
</script>

<template>
  <NuxtLayout name="web">
    <main class="search-page">
      <section class="search-page__hero">
        <div class="search-page__container">
          <div class="search-page__hero-content">
            <div class="search-page__hero-inner">
              <h1 class="search-page__title">
                ¿Qué servicio médico estás buscando?
              </h1>
              <WebsiteSearchBar
                :specialties="specialties"
                :loading="isSpecialtiesLoading"
              />
            </div>
          </div>
        </div>
      </section>

      <WebsitePerfilDoctorPantallaCarga v-if="isLoading" />

      <div v-else class="search-page__content">
        <section class="search-results">
          <div class="search-results__header">
            <div class="search-results__info">
              <div class="search-results__info-content">
                <span class="search-results__title">{{
                  searchDisplayText
                }}</span>
                <span class="search-results__count" v-if="clinicas">
                  {{ clinicas.length }} resultados
                </span>
              </div>
            </div>

            <div class="search-results__controls">
              <WebsiteMasFiltrosModal
                :filters="filtersData"
                @filters-changed="onFiltersChange"
              />

              <div class="search-results__sort">
                <span class="search-results__sort-label">Ordenar por:</span>
                <select
                  name="medicos-sort"
                  id="medicos-sort"
                  class="search-results__sort-select"
                >
                  <option value="relevantes">Más Relevantes</option>
                  <option value="disponibilidad" selected>
                    Disponibilidad
                  </option>
                  <option value="precio-min">Precio más bajo</option>
                  <option value="precio-max">Precio más alto</option>
                </select>
              </div>

              <div class="search-results__map-toggle">
                <input
                  class="search-results__map-input"
                  type="checkbox"
                  role="switch"
                  id="flexSwitchCheckDefault"
                  v-model="isMapVisible"
                />
                <label
                  class="search-results__map-label"
                  for="flexSwitchCheckDefault"
                >
                  Mostrar mapa
                </label>
              </div>
            </div>
          </div>

          <div class="search-results__body">
            <div
              class="search-results__main"
              :class="{ 'search-results__main--with-map': isMapVisible }"
            >
              <div class="search-results__grid">
                <div
                  class="search-results__item"
                  v-for="clinica in clinicas"
                  :key="clinica.id"
                >
                  <WebsiteClinicasListItem :clinica="clinica" />
                </div>
              </div>
            </div>
            <div class="search-results__map" v-show="isMapVisible">
              <AtomsMapaInteractivo />
            </div>
          </div>
        </section>
      </div>
    </main>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.search-page {
  min-height: 100vh;
  background-color: #f8f8f8;

  &__container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
  }

  &__content {
    max-width: 1310px;
    padding: 24px 0px;
    margin: 0 auto;
    background-color: #f8f8f8;
  }
}

.search-page__hero {
  background-color: rgba($color-primary, 0.03);
  margin-bottom: 1.5rem;

  .search-page__container {
    padding-top: 3rem;
    padding-bottom: 1.5rem;
  }

  &-content {
    display: flex;
    justify-content: center;
  }

  &-inner {
    width: 91.666667%;
    max-width: 800px;
  }
}

.search-page__title {
  @include label-base;
  font-weight: 500;
  font-size: 16px;
  line-height: 1.2;
  letter-spacing: 0;
  text-align: center;
  color: #19213d;
  margin-bottom: 20px;

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

.search-results {
  padding-bottom: 3rem;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
    gap: 1rem;

    @include respond-to-max(md) {
      flex-direction: column;
      align-items: stretch;
    }
  }

  &__info {
    &-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
  }

  &__title {
    font-weight: 600;
    font-size: 1.25rem;
    color: $color-foreground;
    font-family: $font-family-main;
  }

  &__count {
    font-weight: 500;
    color: $color-text-muted;
    font-size: 0.9rem;
    font-family: $font-family-main;
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    @include respond-to-max(md) {
      flex-wrap: wrap;
      justify-content: center;
    }
  }

  &__sort {
    @include button-base;
    gap: 8.4px;
    padding: 8.4px 16.8px;
    border-radius: 105.02px;
    background-color: #ffffff;
    border: 1.05px solid #e5e7eb;

    &-label {
      @include label-base;
      white-space: nowrap;
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;
      color: #6d758f;
    }

    &-select {
      @include label-base;
      border: none;
      background: transparent;
      outline: none;
      padding: 0.25rem 0.5rem;
      cursor: pointer;
      color: #19213d;
      font-weight: 400;
      font-size: 14px;
      line-height: 21px;

      &:focus {
        outline: none;
      }
    }
  }

  &__map-toggle {
    @include button-base;
    gap: 8.4px;
    padding: 8.4px 16.8px;
    border-radius: 105.02px;
    background-color: #ffffff;
    border: 1.05px solid #e5e7eb;
  }

  &__map-input {
    margin: 0;
    cursor: pointer;

    appearance: none;
    width: 36px;
    height: 20px;
    background-color: #f2f4f7;
    border-radius: 0.75rem;
    position: relative;
    transition: background-color 0.3s;

    &:checked {
      background-color: $color-primary;
    }

    &::before {
      content: "";
      position: absolute;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background-color: $white;
      top: 0.6px;
      left: 0.8px;
      transition: transform 0.3s;
      box-shadow: 0px 1px 2px 0px #1018280f;
      box-shadow: 0px 1px 3px 0px #1018281a;
    }

    &:checked::before {
      transform: translateX(16px);
    }
  }

  &__map-label {
    font-size: 0.9rem;
    cursor: pointer;
    margin: 0;
    color: $color-foreground;
    font-family: $font-family-main;
  }
}

.search-results__body {
  display: flex;
  gap: 1.5rem;
}

.search-results__main {
  flex: 1;

  &--with-map {
    flex: 0 0 66.666667%;
  }
}

.search-results__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;

  .search-results__main--with-map & {
    grid-template-columns: repeat(2, 1fr);
  }

  @include respond-to-max(lg) {
    grid-template-columns: repeat(2, 1fr);

    .search-results__main--with-map & {
      grid-template-columns: 1fr;
    }
  }

  @include respond-to-max(md) {
    grid-template-columns: 1fr;
  }
}

.search-results__map {
  flex: 0 0 33.333333%;
  min-height: 400px;
  padding: 1.25rem 0 0 0;
}

@include respond-to-max(md) {
  .search-page__content {
    padding: 0 1rem;
  }

  .search-results__body {
    flex-direction: column;
  }

  .search-results__main {
    &--with-map {
      flex: 1;
    }
  }

  .search-results__map {
    flex: none;
    min-height: 300px;
  }

  .search-results__header {
    gap: 1rem;
  }

  .search-results__controls {
    gap: 0.75rem;
  }
}

@include respond-to-max(sm) {
  .search-page__title {
    font-size: 1.5rem;
  }

  .search-results__controls {
    flex-direction: column;
    align-items: stretch;
  }

  .search-results__sort,
  .search-results__map-toggle {
    justify-content: center;
  }
}
</style>
