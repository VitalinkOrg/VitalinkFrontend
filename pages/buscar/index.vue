<script lang="ts" setup>
import { useSupplier, useUdc } from "@/composables/api";
import type { Supplier } from "@/types";
import type { LocationQueryValue } from "vue-router";

definePageMeta({
  middleware: ["auth-pacientes"],
});

const route = useRoute();
const router = useRouter();
const { fetchAllMain } = useSupplier();
const { fetchUdc } = useUdc();

interface SearchFilters {
  filter_name: string;
  specialty_code: string;
  procedure_code: string;
  min_stars: string;
  min_price: string;
  max_price: string;
  lugar: string;
}

interface Specialty {
  code: string;
  name: string;
}

interface Procedure {
  code: string;
  name: string;
}

const clinicas = ref<Supplier[]>([]);
const specialties = ref<Specialty[]>([]);
const procedures = ref<Procedure[]>([]);

const isLoading = ref(false);
const isSpecialtiesLoading = ref(false);
const isMapVisible = ref(false);

const filters = reactive<SearchFilters>({
  filter_name: getQueryParam("filter_name"),
  specialty_code: getQueryParam("specialty_code"),
  procedure_code: getQueryParam("procedure_code"),
  min_stars: getQueryParam("min_stars"),
  min_price: getQueryParam("min_price"),
  max_price: getQueryParam("max_price"),
  lugar: getQueryParam("lugar"),
});

const currentProcedureName = computed(() => {
  if (!filters.procedure_code || !procedures.value.length) return null;
  const procedure = procedures.value.find(
    (p) => p.code === filters.procedure_code
  );
  return procedure?.name ?? null;
});

const currentSpecialtyName = computed(() => {
  if (!filters.specialty_code || !specialties.value.length) return null;
  const specialty = specialties.value.find(
    (s) => s.code === filters.specialty_code
  );
  return specialty?.name ?? null;
});

const searchDisplayText = computed(() => {
  return (
    currentProcedureName.value ||
    currentSpecialtyName.value ||
    "Todos los servicios"
  );
});

const filtersData = computed(() => ({
  procedimiento: filters.procedure_code,
  lugar: filters.lugar,
  valoracion: filters.min_stars ? Number(filters.min_stars) : undefined,
  min: filters.min_price ? Number(filters.min_price) : undefined,
  max: filters.max_price ? Number(filters.max_price) : undefined,
  disponibilidad: [
    { code: "all", name: "Todos" },
    { code: "weeks", name: "Próximas semanas" },
    { code: "months", name: "Próximos meses" },
    { code: "days", name: "Próximos días" },
  ],
  procedures: procedures.value,
}));

function getQueryParam(key: string): string {
  const value = route.query[key];
  return (Array.isArray(value) ? value[0] : value) || "";
}

function buildSearchParams(): Record<string, string> {
  const params: Record<string, string> = {};

  if (filters.filter_name) params.filter_name = filters.filter_name;
  if (filters.procedure_code) params.procedure_code = filters.procedure_code;
  if (filters.specialty_code) params.specialty_code = filters.specialty_code;
  if (filters.min_stars) params.min_stars = filters.min_stars;
  if (filters.min_price) params.min_price = filters.min_price;
  if (filters.max_price) params.max_price = filters.max_price;
  if (filters.lugar) params.lugar = filters.lugar;

  console.log("🔍 Parámetros construidos:", params);

  return params;
}

function updateRouteQuery(newFilters: Partial<SearchFilters>) {
  const combinedQuery = { ...route.query, ...newFilters };

  const query = Object.entries(combinedQuery).reduce(
    (acc, [key, value]) => {
      if (value) {
        acc[key] = value;
      }
      return acc;
    },
    {} as Record<string, LocationQueryValue | LocationQueryValue[]>
  );

  router.push({ path: "/buscar", query });
}

async function loadSpecialties() {
  isSpecialtiesLoading.value = true;

  try {
    const { response, request } = fetchUdc("MEDICAL_SPECIALTY");
    await request();

    if (response.value?.data) {
      specialties.value = response.value.data.map((item) => ({
        code: item.code,
        name: item.name,
      }));
    }
  } catch (error) {
    console.error("Error loading specialties:", error);
  } finally {
    isSpecialtiesLoading.value = false;
  }
}

async function loadProcedures(specialtyCode: string) {
  if (!specialtyCode) {
    procedures.value = [];
    return;
  }

  try {
    const { response, request } = fetchUdc("MEDICAL_PROCEDURE", {
      father_code: specialtyCode,
    });
    await request();

    if (response.value?.data) {
      procedures.value = response.value.data.map((item) => ({
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
}

async function searchSuppliers() {
  isLoading.value = true;
  clinicas.value = [];

  try {
    const params = buildSearchParams();

    const { response, request } = fetchAllMain(params);

    await request();

    if (response.value?.data) {
      clinicas.value = response.value.data;
      console.log("✅ Búsqueda exitosa:", clinicas.value.length, "resultados");
      console.log("📋 Parámetros de búsqueda:", params);
    }
  } catch (error) {
    console.error("❌ Error en búsqueda:", error);
  } finally {
    isLoading.value = false;
  }
}

function onFiltersChange(newFilters: any) {
  const queryUpdates: Partial<SearchFilters> = {};

  if (newFilters.procedimiento !== undefined) {
    queryUpdates.procedure_code = newFilters.procedimiento;
  }
  if (newFilters.lugar !== undefined) {
    queryUpdates.lugar = newFilters.lugar;
  }
  if (newFilters.valoracion !== undefined) {
    queryUpdates.min_stars = newFilters.valoracion;
  }
  if (newFilters.min !== undefined) {
    queryUpdates.min_price = newFilters.min;
  }
  if (newFilters.max !== undefined) {
    queryUpdates.max_price = newFilters.max;
  }

  updateRouteQuery(queryUpdates);
}

watch(
  () => route.query.specialty_code,
  async (newVal) => {
    filters.specialty_code = getQueryParam("specialty_code");

    if (newVal) {
      await loadProcedures(newVal as string);
    } else {
      procedures.value = [];
    }

    searchSuppliers();
  }
);

watch(
  () => [
    route.query.procedure_code,
    route.query.min_stars,
    route.query.min_price,
    route.query.max_price,
    route.query.lugar,
  ],
  () => {
    filters.filter_name = getQueryParam("filter_name");
    filters.procedure_code = getQueryParam("procedure_code");
    filters.min_stars = getQueryParam("min_stars");
    filters.min_price = getQueryParam("min_price");
    filters.max_price = getQueryParam("max_price");
    filters.lugar = getQueryParam("lugar");

    searchSuppliers();
  }
);

onMounted(async () => {
  await loadSpecialties();

  if (filters.specialty_code) {
    await loadProcedures(filters.specialty_code);
  }

  searchSuppliers();
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
                <span class="search-results__title">
                  {{ searchDisplayText }}
                </span>
                <span class="search-results__count">
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
    width: 100%;
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
    width: 100%;
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
