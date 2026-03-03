<script lang="ts" setup>
import { useSupplier, useUdc } from "@/composables/api";
import { useLogger } from "@/composables/useLogger";
import { useToast } from "@/composables/useToast";
import type { LocationQueryValue } from "vue-router";

definePageMeta({
  middleware: ["auth-pacientes"],
});

const SORT_OPTIONS = [
  { value: "relevantes", label: "Más Relevantes" },
  { value: "disponibilidad", label: "Disponibilidad" },
  { value: "precio-min", label: "Precio más bajo" },
  { value: "precio-max", label: "Precio más alto" },
] as const;

const DEFAULT_SORT = "disponibilidad";

const AVAILABILITY_OPTIONS = [
  { code: "all", name: "Todos" },
  { code: "weeks", name: "Próximas semanas" },
  { code: "months", name: "Próximos meses" },
  { code: "days", name: "Próximos días" },
] as const;

const FILTER_KEYS: (keyof SearchFilters)[] = [
  "filter_name",
  "procedure_code",
  "specialty_code",
  "min_stars",
  "min_price",
  "max_price",
  "province",
];

const SYNCED_ROUTE_KEYS: (keyof SearchFilters)[] = [
  "filter_name",
  "procedure_code",
  "min_stars",
  "min_price",
  "max_price",
  "province",
];

interface SearchFilters {
  filter_name: string;
  specialty_code: string;
  procedure_code: string;
  min_stars: string;
  min_price: string;
  max_price: string;
  province: string;
}

interface CatalogItem {
  code: string;
  name: string;
}

interface FilterChangePayload {
  procedimiento?: string;
  province?: string;
  valoracion?: string;
  min?: string;
  max?: string;
}

const route = useRoute();
const router = useRouter();
const logger = useLogger("SearchPage");
const toast = useToast();
const { getAllMainSuppliers } = useSupplier();
const { getAllUdcs } = useUdc();

const clinicas = ref<ISupplierMain[]>([]);
const specialties = ref<IUdc[]>([]);
const procedures = ref<CatalogItem[]>([]);

const isLoading = ref(false);
const isSpecialtiesLoading = ref(false);
const isMapVisible = ref(false);
const selectedSort = ref(DEFAULT_SORT);

const hasSearchError = ref(false);
const hasSpecialtiesError = ref(false);

const filters = reactive<SearchFilters>({
  filter_name: extractQueryParam("filter_name"),
  specialty_code: extractQueryParam("specialty_code"),
  procedure_code: extractQueryParam("procedure_code"),
  min_stars: extractQueryParam("min_stars"),
  min_price: extractQueryParam("min_price"),
  max_price: extractQueryParam("max_price"),
  province: extractQueryParam("province"),
});

const currentProcedureName = computed((): string | null => {
  if (!filters.procedure_code || !procedures.value.length) return null;
  const found = procedures.value.find((p) => p.code === filters.procedure_code);
  return found?.name ?? null;
});

const currentSpecialtyName = computed((): string | null => {
  if (!filters.specialty_code || !specialties.value.length) return null;
  const found = specialties.value.find(
    (s) => s.code === filters.specialty_code,
  );
  return found?.name ?? null;
});

const searchDisplayText = computed((): string => {
  return (
    currentProcedureName.value ||
    currentSpecialtyName.value ||
    "Todos los servicios"
  );
});

const resultsCountText = computed((): string => {
  const count = clinicas.value.length;
  return count === 1 ? "1 resultado" : `${count} resultados`;
});

const filtersData = computed(() => ({
  procedimiento: filters.procedure_code,
  province: filters.province,
  valoracion: filters.min_stars ? Number(filters.min_stars) : undefined,
  min: filters.min_price ? Number(filters.min_price) : undefined,
  max: filters.max_price ? Number(filters.max_price) : undefined,
  disponibilidad: [...AVAILABILITY_OPTIONS],
  procedures: procedures.value,
}));

const hasResults = computed((): boolean => clinicas.value.length > 0);

function extractQueryParam(key: string): string {
  const value = route.query[key];
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

function buildSearchParams(): Record<string, string> {
  return FILTER_KEYS.reduce<Record<string, string>>((params, key) => {
    const value = filters[key];
    if (value) params[key] = value;
    return params;
  }, {});
}

function mapToCatalogItems(
  items: { code: string; name: string }[],
): CatalogItem[] {
  return items.map(({ code, name }) => ({ code, name }));
}

function updateRouteQuery(updates: Partial<SearchFilters>): void {
  const merged = { ...route.query, ...updates };

  const query = Object.entries(merged).reduce<
    Record<string, LocationQueryValue | LocationQueryValue[]>
  >((acc, [key, value]) => {
    if (value) acc[key] = value;
    return acc;
  }, {});

  router.push({ path: "/buscar", query });
}

function syncFiltersFromRoute(): void {
  SYNCED_ROUTE_KEYS.forEach((key) => {
    filters[key] = extractQueryParam(key);
  });
}

async function fetchSpecialties(): Promise<void> {
  isSpecialtiesLoading.value = true;
  hasSpecialtiesError.value = false;

  try {
    const { data, error } = await getAllUdcs({
      type: "MEDICAL_SPECIALTY",
    });

    if (error && !data) {
      logger.error("Error al cargar las especialidades", { info: error.info });
      toast.error(error.info);
      throw new Error(error.info || "Error al cargar las especialidades");
    }

    specialties.value = data ?? [];
  } catch (err) {
    hasSpecialtiesError.value = true;
    logger.error("Failed to load specialties", { error: String(err) });
    toast.error("No se pudieron cargar las especialidades. Intenta de nuevo.");
  } finally {
    isSpecialtiesLoading.value = false;
  }
}

async function fetchProcedures(specialtyCode: string): Promise<void> {
  if (!specialtyCode) {
    procedures.value = [];
    return;
  }

  try {
    const { data, error } = await getAllUdcs({
      type: "MEDICAL_PROCEDURE",
      code: specialtyCode,
    });

    if (error && !data) {
      logger.error("Error al cargar los procedimientos", { info: error.info });
      toast.error(error.info);
      throw new Error(error.info || "Error al cargar los procedimientos");
    }

    procedures.value = data ? mapToCatalogItems(data) : [];
  } catch (err) {
    procedures.value = [];
    logger.error("Failed to load procedures", {
      specialtyCode,
      error: String(err),
    });
  }
}

async function fetchSuppliers(): Promise<void> {
  isLoading.value = true;
  hasSearchError.value = false;
  clinicas.value = [];

  try {
    const params = buildSearchParams();
    const { data, error } = await getAllMainSuppliers(params);

    if (error && !data) {
      logger.error("Error al cargar los médicos y clínicas", {
        info: error.info,
      });
      toast.error(error.info);
      throw new Error(error.info || "Error al cargar los médicos y clínicas");
    }

    clinicas.value = data ?? [];
    logger.info("Search completed", { count: clinicas.value.length });
  } catch (err) {
    hasSearchError.value = true;
    logger.error("Search failed", { error: String(err) });
    toast.error("Error al buscar clínicas. Intenta de nuevo.");
  } finally {
    isLoading.value = false;
  }
}

function handleRetrySearch(): void {
  fetchSuppliers();
}

function handleRetrySpecialties(): void {
  fetchSpecialties();
}

function handleFiltersChange(payload: FilterChangePayload): void {
  const updates: Partial<SearchFilters> = {};

  if (payload.procedimiento !== undefined) {
    updates.procedure_code = payload.procedimiento;
  }
  if (payload.province !== undefined) {
    updates.province = payload.province;
  }
  if (payload.valoracion !== undefined) {
    updates.min_stars = payload.valoracion;
  }
  if (payload.min !== undefined) {
    updates.min_price = payload.min;
  }
  if (payload.max !== undefined) {
    updates.max_price = payload.max;
  }

  updateRouteQuery(updates);
}

function handleToggleMap(): void {
  isMapVisible.value = !isMapVisible.value;
}

watch(
  () => route.query.specialty_code,
  async (newVal) => {
    filters.specialty_code = extractQueryParam("specialty_code");

    if (newVal) {
      await fetchProcedures(newVal as string);
    } else {
      procedures.value = [];
    }

    fetchSuppliers();
  },
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
    syncFiltersFromRoute();
    fetchSuppliers();
  },
);

onMounted(async () => {
  await fetchSpecialties();

  if (filters.specialty_code) {
    await fetchProcedures(filters.specialty_code);
  }

  fetchSuppliers();
});
</script>

<template>
  <NuxtLayout name="pacientes-dashboard">
    <main class="search-page">
      <section
        class="search-page__hero"
        aria-label="Buscador de servicios médicos"
      >
        <div class="search-page__container">
          <div class="search-page__hero-content">
            <div class="search-page__hero-inner">
              <h1 class="search-page__title">
                ¿Qué servicio médico estás buscando?
              </h1>

              <div
                v-if="hasSpecialtiesError"
                class="search-page__error"
                role="alert"
              >
                <p class="search-page__error-text">
                  No se pudieron cargar las especialidades.
                </p>
                <button
                  class="search-page__error-retry"
                  type="button"
                  @click="handleRetrySpecialties"
                >
                  Reintentar
                </button>
              </div>

              <WebsiteSearchBar
                v-else
                :specialties="specialties"
                :loading="isSpecialtiesLoading"
              />
            </div>
          </div>
        </div>
      </section>

      <WebsitePerfilDoctorPantallaCarga
        v-if="isLoading"
        aria-label="Cargando resultados"
      />

      <div v-else class="search-page__content">
        <section class="search-results" aria-label="Resultados de búsqueda">
          <header class="search-results__header">
            <div class="search-results__info">
              <div class="search-results__info-content">
                <h2 class="search-results__title">
                  {{ searchDisplayText }}
                </h2>
                <span
                  class="search-results__count"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {{ resultsCountText }}
                </span>
              </div>
            </div>

            <div
              class="search-results__controls"
              role="toolbar"
              aria-label="Controles de búsqueda"
            >
              <WebsiteMasFiltrosModal
                :filters="filtersData"
                @filters-changed="handleFiltersChange"
              />

              <div class="search-results__sort">
                <label
                  class="search-results__sort-label"
                  for="search-sort-select"
                >
                  Ordenar por:
                </label>
                <select
                  id="search-sort-select"
                  v-model="selectedSort"
                  class="search-results__sort-select"
                  aria-label="Ordenar resultados"
                >
                  <option
                    v-for="option in SORT_OPTIONS"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <div class="search-results__map-toggle">
                <label
                  class="search-results__map-toggle-wrapper"
                  for="map-visibility-toggle"
                >
                  <input
                    id="map-visibility-toggle"
                    class="search-results__map-input"
                    type="checkbox"
                    role="switch"
                    :aria-checked="isMapVisible"
                    aria-label="Mostrar mapa"
                    :checked="isMapVisible"
                    @change="handleToggleMap"
                  />
                  <span class="search-results__map-label"> Mostrar mapa </span>
                </label>
              </div>
            </div>
          </header>

          <div v-if="hasSearchError" class="search-results__error" role="alert">
            <p class="search-results__error-text">
              Ocurrió un error al cargar los resultados.
            </p>
            <button
              class="search-results__error-retry"
              type="button"
              @click="handleRetrySearch"
            >
              Reintentar búsqueda
            </button>
          </div>

          <div
            v-else-if="!hasResults"
            class="search-results__empty"
            role="status"
          >
            <p class="search-results__empty-text">
              No se encontraron resultados para tu búsqueda.
            </p>
            <p class="search-results__empty-hint">
              Intenta con otros filtros o una especialidad diferente.
            </p>
          </div>

          <div v-else class="search-results__body">
            <div
              class="search-results__main"
              :class="{ 'search-results__main--with-map': isMapVisible }"
            >
              <ul
                class="search-results__grid"
                role="list"
                aria-label="Lista de clínicas"
              >
                <li
                  v-for="clinica in clinicas"
                  :key="clinica.id"
                  class="search-results__item"
                >
                  <WebsiteClinicasListItem :clinica="clinica" />
                </li>
              </ul>
            </div>

            <aside
              v-show="isMapVisible"
              class="search-results__map"
              aria-label="Mapa de ubicaciones"
            >
              <AtomsMapaInteractivo />
            </aside>
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
    padding: $spacing-lg 0;
    margin: 0 auto;
    background-color: #f8f8f8;
  }

  &__hero {
    background-color: rgba($color-primary, 0.03);
    margin-bottom: 1.5rem;
  }

  &__hero .search-page__container {
    padding-top: 3rem;
    padding-bottom: 1.5rem;
  }

  &__hero-content {
    display: flex;
    justify-content: center;
  }

  &__hero-inner {
    width: 100%;
  }

  &__title {
    @include label-base;
    font-weight: 500;
    font-size: 16px;
    line-height: 1.2;
    letter-spacing: 0;
    text-align: center;
    color: $color-foreground;
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

  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-lg;
    text-align: center;
  }

  &__error-text {
    @include text-base;
    color: $color-error;
  }

  &__error-retry {
    @include outline-button;
    padding: $spacing-sm $spacing-md;
    font-size: 14px;
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

  &__info-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__title {
    font-weight: 600;
    font-size: 1.25rem;
    color: $color-foreground;
    font-family: $font-family-main;
    margin: 0;
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
  }

  &__sort-label {
    @include label-base;
    white-space: nowrap;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;
    color: #6d758f;
  }

  &__sort-select {
    @include label-base;
    border: none;
    background: transparent;
    outline: none;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    color: $color-foreground;
    font-weight: 400;
    font-size: 14px;
    line-height: 21px;

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
      border-radius: 4px;
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

  &__map-toggle-wrapper {
    display: flex;
    align-items: center;
    gap: 8.4px;
    cursor: pointer;
    margin: 0;
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
    flex-shrink: 0;

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
      box-shadow:
        0px 1px 2px 0px rgba(16, 24, 40, 0.06),
        0px 1px 3px 0px rgba(16, 24, 40, 0.1);
    }

    &:checked::before {
      transform: translateX(16px);
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;

      &::before {
        transition: none;
      }
    }
  }

  &__map-label {
    font-size: 0.9rem;
    cursor: pointer;
    margin: 0;
    color: $color-foreground;
    font-family: $font-family-main;
  }

  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-xl $spacing-md;
    text-align: center;
  }

  &__error-text {
    @include text-base;
    color: $color-error;
    font-size: 16px;
  }

  &__error-retry {
    @include primary-button;
    padding: $spacing-sm $spacing-lg;
    font-size: 14px;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-xl $spacing-md;
    text-align: center;
  }

  &__empty-text {
    @include text-base;
    font-size: 16px;
    font-weight: 500;
  }

  &__empty-hint {
    @include label-base;
    font-size: 14px;
    color: $color-text-muted;
  }

  &__body {
    display: flex;
    gap: 1.5rem;
  }

  &__main {
    flex: 1;

    &--with-map {
      flex: 0 0 66.666667%;
    }
  }

  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
    list-style: none;
    margin: 0;
    padding: 0;

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

  &__map {
    flex: 0 0 33.333333%;
    min-height: 400px;
    padding: 1.25rem 0 0 0;
  }
}

@include respond-to-max(md) {
  .search-page__content {
    padding: 0 1rem;
  }

  .search-results__body {
    flex-direction: column;
  }

  .search-results__main--with-map {
    flex: 1;
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
