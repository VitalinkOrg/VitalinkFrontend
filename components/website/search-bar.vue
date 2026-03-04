<script lang="ts" setup>
import { useUdc } from "@/composables/api";
import { useLogger } from "@/composables/useLogger";
import { useToast } from "@/composables/useToast";
import type { DropdownItem } from "../ui/dropdown-base.vue";

const SEARCH_HISTORY_KEY = "medical_search_history";
const MAX_HISTORY_ITEMS = 10;
const RETRY_DELAY_MS = 1000;
const MAX_RETRIES = 2;

const ODONTOLOGY_SPECIALTY: IUdc = {
  id: 50,
  code: "ODONTOLOGY",
  name: "Odontología",
  type: "ODONTOLOGY_SPECIALTY",
  value1: null,
  value2: null,
  father_code: "ODONTOLOGY_MEDICAL",
  supplier_id: null,
  created_date: "2026-02-26T06:19:08.000Z",
  updated_date: null,
};

interface SearchHistory {
  specialtyCode: string;
  specialtyName: string;
  procedureCode?: string;
  procedureName?: string;
  timestamp: number;
}

interface Props {
  specialties?: IUdc[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  specialties: () => [],
  loading: false,
});

const emit = defineEmits<{
  search: [query: Record<string, string>];
}>();

const route = useRoute();
const router = useRouter();
const { getToken } = useAuthToken();
const { getAllUdcs } = useUdc();
const logger = useLogger("SearchBar");
const toast = useToast();

const selectedSpecialty = ref<string | number | undefined>(undefined);
const selectedProcedure = ref<string | number | undefined>(undefined);
const procedures = ref<IUdc[]>([]);
const loadingProcedures = ref(false);
const proceduresError = ref<string | null>(null);
const retryCount = ref(0);

const isAuthenticated = computed(() => !!getToken());

const mergedSpecialties = computed<IUdc[]>(() => {
  const list = [...props.specialties];
  const alreadyExists = list.some((s) => s.code === ODONTOLOGY_SPECIALTY.code);
  if (!alreadyExists) {
    list.push(ODONTOLOGY_SPECIALTY);
  }
  return list;
});

const specialtyItems = computed<DropdownItem[]>(() =>
  mergedSpecialties.value.map((specialty) => ({
    value: specialty.code,
    label: specialty.name,
  })),
);

const procedureItems = computed<DropdownItem[]>(() =>
  procedures.value.map((procedure) => ({
    value: procedure.code,
    label: procedure.name,
  })),
);

const isProcedureDisabled = computed(
  () =>
    !isAuthenticated.value ||
    !selectedSpecialty.value ||
    loadingProcedures.value ||
    !!proceduresError.value,
);

const hasValidSelection = computed(
  () => !!selectedSpecialty.value || !!selectedProcedure.value,
);

const procedureStatusMessage = computed(() => {
  if (proceduresError.value) return proceduresError.value;
  if (loadingProcedures.value) return "Cargando procedimientos…";
  return null;
});

function buildSearchQuery(
  specialtyValue?: string | number,
  procedureValue?: string | number,
): Record<string, string> {
  const query: Record<string, string> = {};
  if (specialtyValue) query.specialty_code = String(specialtyValue);
  if (procedureValue) query.procedure_code = String(procedureValue);
  return query;
}

function isQueryEqual(
  a: Record<string, string>,
  b: Record<string, string>,
): boolean {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => a[key] === b[key]);
}

function findItemByCode<T extends { code: string }>(
  items: T[],
  code?: string | number,
): T | undefined {
  if (!code) return undefined;
  return items.find((item) => item.code === String(code));
}

function getSearchHistory(): SearchHistory[] {
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    return raw ? (JSON.parse(raw) as SearchHistory[]) : [];
  } catch (err) {
    logger.warn("Failed to read search history", { error: String(err) });
    return [];
  }
}

function saveSearchToHistory(entry: Omit<SearchHistory, "timestamp">): void {
  try {
    const history = getSearchHistory();

    const isDuplicate = history.some(
      (item) =>
        item.specialtyCode === entry.specialtyCode &&
        item.procedureCode === entry.procedureCode,
    );
    if (isDuplicate) return;

    const updated: SearchHistory[] = [
      { ...entry, timestamp: Date.now() },
      ...history,
    ].slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  } catch (err) {
    logger.warn("Failed to save search history", { error: String(err) });
  }
}

function clearSearchHistory(): void {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (err) {
    logger.warn("Failed to clear search history", { error: String(err) });
  }
}

async function fetchProcedures(
  specialtyCode: string,
  preserveSelection = false,
): Promise<void> {
  loadingProcedures.value = true;
  proceduresError.value = null;

  if (!preserveSelection) {
    selectedProcedure.value = undefined;
  }

  try {
    const { data, error } = await getAllUdcs({
      type: "MEDICAL_PROCEDURE",
      father_code: specialtyCode,
    });

    if (error && !data) {
      logger.error("Failed to fetch appointments", { info: error.info });
      toast.error(error.info);
      throw new Error(error.info || "Error al cargar los procedimientos");
    }

    procedures.value = (data ?? []).map((item) => ({
      ...item,
      code: item.code,
      name: item.name,
    }));

    retryCount.value = 0;
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar procedimientos";
    logger.error("fetchProcedures failed", {
      specialtyCode,
      error: message,
    });
    proceduresError.value = "Error al cargar procedimientos. Intente de nuevo.";
    procedures.value = [];
  } finally {
    loadingProcedures.value = false;
  }
}

async function handleRetryFetchProcedures(): Promise<void> {
  if (!selectedSpecialty.value || retryCount.value >= MAX_RETRIES) {
    if (retryCount.value >= MAX_RETRIES) {
      toast.error(
        "No se pudieron cargar los procedimientos. Intente más tarde.",
      );
    }
    return;
  }

  retryCount.value++;
  await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  await fetchProcedures(String(selectedSpecialty.value), true);
}

function handleSpecialtySelect(item: DropdownItem): void {
  selectedProcedure.value = undefined;
  procedures.value = [];
  proceduresError.value = null;
  retryCount.value = 0;

  if (item.value) {
    fetchProcedures(String(item.value));
  }
}

function handleSpecialtyClear(): void {
  selectedProcedure.value = undefined;
  procedures.value = [];
  proceduresError.value = null;
  retryCount.value = 0;
}

function handleSubmitSearch(): void {
  const query = buildSearchQuery(
    selectedSpecialty.value,
    selectedProcedure.value,
  );

  if (Object.keys(query).length === 0) {
    router.push({ path: "/buscar" });
    return;
  }

  const specialty = findItemByCode(
    mergedSpecialties.value,
    selectedSpecialty.value,
  );
  if (specialty) {
    const procedure = findItemByCode(procedures.value, selectedProcedure.value);
    saveSearchToHistory({
      specialtyCode: specialty.code,
      specialtyName: specialty.name,
      procedureCode: procedure?.code,
      procedureName: procedure?.name,
    });
  }

  const currentQuery = { ...(route.query as Record<string, string>) };
  if (isQueryEqual(currentQuery, query)) {
    emit("search", query);
  } else {
    router.push({ path: "/buscar", query });
  }
}

async function syncFiltersFromQuery(): Promise<void> {
  const specialtyCode = route.query.specialty_code as string | undefined;
  const procedureCode = route.query.procedure_code as string | undefined;

  if (!specialtyCode) {
    selectedSpecialty.value = undefined;
    selectedProcedure.value = undefined;
    procedures.value = [];
    return;
  }

  const needsRefresh =
    selectedSpecialty.value !== specialtyCode || procedures.value.length === 0;

  if (needsRefresh) {
    selectedSpecialty.value = specialtyCode;
    await fetchProcedures(specialtyCode, true);
  }

  if (procedureCode) {
    const exists = findItemByCode(procedures.value, procedureCode);
    selectedProcedure.value = exists ? procedureCode : undefined;
  } else {
    selectedProcedure.value = undefined;
  }
}

watch(
  () => route.query,
  async (newQuery, oldQuery) => {
    const changed =
      newQuery.specialty_code !== oldQuery?.specialty_code ||
      newQuery.procedure_code !== oldQuery?.procedure_code;
    if (changed) await syncFiltersFromQuery();
  },
);

onMounted(async () => {
  await syncFiltersFromQuery();
});

defineExpose({ getSearchHistory, clearSearchHistory });
</script>

<template>
  <div
    class="search-bar"
    role="search"
    aria-label="Buscar especialidades y procedimientos médicos"
  >
    <div class="search-bar__card">
      <form
        class="search-bar__form"
        novalidate
        @submit.prevent="handleSubmitSearch"
      >
        <div class="search-bar__field">
          <label
            id="specialty-label"
            for="specialty-dropdown"
            class="search-bar__label"
          >
            Especialidades
          </label>
          <UiDropdownBase
            id="specialty-dropdown"
            :key="`specialty-${selectedSpecialty}`"
            v-model="selectedSpecialty"
            :items="specialtyItems"
            placeholder="Ej. Oftalmología"
            :disabled="loading || !isAuthenticated"
            :loading="loading"
            searchable
            clearable
            no-results-text="No se encontraron especialidades"
            size="lg"
            aria-labelledby="specialty-label"
            @select="handleSpecialtySelect"
            @clear="handleSpecialtyClear"
          />
        </div>

        <div class="search-bar__field">
          <div class="search-bar__label-row">
            <label
              id="procedure-label"
              for="procedure-dropdown"
              class="search-bar__label"
            >
              Procedimiento
            </label>
            <AtomsIconsRefreshCcwIcon
              v-if="loadingProcedures"
              class="search-bar__spinner"
              aria-hidden="true"
            />
          </div>

          <UiDropdownBase
            id="procedure-dropdown"
            v-model="selectedProcedure"
            :items="procedureItems"
            placeholder="Ej. Cirugía de cataratas"
            :disabled="isProcedureDisabled"
            :loading="loadingProcedures"
            :error="!!proceduresError"
            searchable
            clearable
            no-results-text="No se encontraron procedimientos"
            size="lg"
            aria-labelledby="procedure-label"
            :aria-describedby="
              procedureStatusMessage ? 'procedure-status' : undefined
            "
          >
            <template #icon>
              <AtomsIconsSearchIcon size="20" aria-hidden="true" />
            </template>
          </UiDropdownBase>

          <div
            v-if="procedureStatusMessage"
            id="procedure-status"
            class="search-bar__status"
            :class="{
              'search-bar__status--error': !!proceduresError,
              'search-bar__status--loading':
                loadingProcedures && !proceduresError,
            }"
            :role="proceduresError ? 'alert' : 'status'"
            :aria-live="proceduresError ? 'assertive' : 'polite'"
          >
            <span>{{ procedureStatusMessage }}</span>
            <button
              v-if="proceduresError"
              type="button"
              class="search-bar__retry-button"
              :disabled="retryCount >= MAX_RETRIES"
              :aria-label="
                retryCount >= MAX_RETRIES
                  ? 'Reintentos agotados'
                  : 'Reintentar carga de procedimientos'
              "
              @click="handleRetryFetchProcedures"
            >
              {{ retryCount >= MAX_RETRIES ? "Sin reintentos" : "Reintentar" }}
            </button>
          </div>
        </div>

        <div class="search-bar__actions">
          <button
            type="submit"
            class="search-bar__submit"
            :aria-label="
              hasValidSelection
                ? 'Buscar resultados médicos'
                : 'Ir a la página de búsqueda'
            "
          >
            <AtomsIconsSearchIcon
              size="20"
              class="search-bar__submit-icon"
              aria-hidden="true"
            />
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$search-bar-bg: $white;
$search-bar-radius: 0.9375rem;
$search-bar-shadow: 0 0.25rem 1.675rem 0 rgba(0, 0, 0, 0.09);
$search-bar-gap: 1.25rem;

$label-color: #344054;
$status-error-color: #dc3545;
$status-loading-color: $color-text-muted;

$submit-bg: $primary-aqua;
$submit-bg-hover: darken($primary-aqua, 10%);
$submit-size: 3.5rem;
$submit-radius: 0.5rem;

.search-bar {
  width: 100%;
  max-width: 48.5rem;
  margin: 0 auto;
  padding: $search-bar-gap;
  background: $search-bar-bg;
  border-radius: $search-bar-radius;
  box-shadow: $search-bar-shadow;

  @media (max-width: $breakpoint-md) {
    padding: 1rem;
  }

  &__card {
    width: 100%;
  }

  &__form {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: $search-bar-gap;
    width: 100%;
    align-items: flex-end;

    @media (max-width: $breakpoint-md) {
      grid-template-columns: 1fr;
    }
  }

  &__field {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    min-width: 0;
  }

  &__label-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__label {
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: $label-color;
  }

  &__spinner {
    width: 1rem;
    height: 1rem;
    color: $primary-aqua;
    animation: search-bar-spin 1s linear infinite;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
      opacity: 0.7;
    }
  }

  &__status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.75rem;
    line-height: 1rem;
    margin-top: 0.25rem;
  }

  &__status--error {
    color: $status-error-color;
  }

  &__status--loading {
    color: $status-loading-color;
  }

  &__retry-button {
    all: unset;
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 600;
    color: $primary-aqua;
    text-decoration: underline;
    text-underline-offset: 2px;

    &:hover {
      color: $submit-bg-hover;
    }

    &:focus-visible {
      outline: 2px solid $primary-aqua;
      outline-offset: 2px;
      border-radius: 2px;
    }

    &:disabled {
      color: $color-text-muted;
      cursor: not-allowed;
      text-decoration: none;
    }
  }

  &__actions {
    display: flex;
    align-self: flex-end;
  }

  &__submit {
    width: $submit-size;
    height: $submit-size;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 1px solid $submit-bg;
    border-radius: $submit-radius;
    background: $submit-bg;
    cursor: pointer;
    flex-shrink: 0;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease;

    &:hover {
      background-color: $submit-bg-hover;
      border-color: $submit-bg-hover;
    }

    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px rgba($primary-aqua, 0.4);
    }

    @media (max-width: $breakpoint-md) {
      width: 100%;
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }

  &__submit-icon {
    color: $white;
  }
}

@keyframes search-bar-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
