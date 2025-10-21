<script lang="ts" setup>
import { useUdc } from "@/composables/api";
import type { DropdownItem } from "../ui/dropdown-base.vue";

interface Specialty {
  code: string;
  name: string;
}

interface Procedure {
  code: string;
  name: string;
}

interface SearchHistory {
  specialtyCode: string;
  specialtyName: string;
  procedureCode?: string;
  procedureName?: string;
  timestamp: number;
}

interface Props {
  specialties?: Specialty[];
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
const { fetchUdc } = useUdc();
const { getToken } = useAuthToken();

const SEARCH_HISTORY_KEY = "medical_search_history";
const MAX_HISTORY_ITEMS = 10;

const selectedSpecialty = ref<string | number | undefined>(undefined);
const selectedProcedure = ref<string | number | undefined>(undefined);
const procedures = ref<Procedure[]>([]);
const loadingProcedures = ref(false);
const errorLoadingProcedures = ref(false);

const isAuthenticated = computed(() => !!getToken());

const specialtyItems = computed<DropdownItem[]>(() => {
  return props.specialties.map((specialty) => ({
    value: specialty.code,
    label: specialty.name,
  }));
});

const procedureItems = computed<DropdownItem[]>(() => {
  return procedures.value.map((procedure) => ({
    value: procedure.code,
    label: procedure.name,
  }));
});

const getSearchHistory = (): SearchHistory[] => {
  try {
    const history = localStorage.getItem(SEARCH_HISTORY_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("Error reading search history:", error);
    return [];
  }
};

const saveSearchToHistory = (search: Omit<SearchHistory, "timestamp">) => {
  try {
    const history = getSearchHistory();

    const isDuplicate = history.some(
      (item) =>
        item.specialtyCode === search.specialtyCode &&
        item.procedureCode === search.procedureCode
    );

    if (!isDuplicate) {
      const newSearch: SearchHistory = {
        ...search,
        timestamp: Date.now(),
      };

      history.unshift(newSearch);

      const trimmedHistory = history.slice(0, MAX_HISTORY_ITEMS);

      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(trimmedHistory));
    }
  } catch (error) {
    console.error("Error saving search history:", error);
  }
};

const clearSearchHistory = () => {
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch (error) {
    console.error("Error clearing search history:", error);
  }
};

const loadProcedures = async (
  specialtyCode: string,
  keepSelectedProcedure = false
) => {
  loadingProcedures.value = true;
  errorLoadingProcedures.value = false;

  if (!keepSelectedProcedure) {
    selectedProcedure.value = undefined;
  }

  try {
    const api = fetchUdc("MEDICAL_PROCEDURE", {
      father_code: specialtyCode,
    });
    await api.request();

    const response = api.response.value;

    if (response?.data) {
      procedures.value = response.data.map((item: any) => ({
        code: item.code,
        name: item.name,
      }));
    }
  } catch (err) {
    console.error("Error loading procedures:", err);
    errorLoadingProcedures.value = true;
    procedures.value = [];
  } finally {
    loadingProcedures.value = false;
  }
};

const handleSpecialtySelect = (item: DropdownItem) => {
  selectedProcedure.value = undefined;
  procedures.value = [];
  if (item.value) {
    loadProcedures(item.value.toString());
  }
};

const handleSpecialtyClear = () => {
  selectedProcedure.value = undefined;
  procedures.value = [];
};

const searchResults = () => {
  const newQuery: Record<string, string> = {
    ...(selectedProcedure.value && {
      procedure_code: selectedProcedure.value.toString(),
    }),
    ...(selectedSpecialty.value && {
      specialty_code: selectedSpecialty.value.toString(),
    }),
  };

  if (Object.keys(newQuery).length === 0) {
    router.push({ path: "/buscar" });
    return;
  }

  if (selectedSpecialty.value) {
    const specialty = props.specialties.find(
      (s) => s.code === selectedSpecialty.value
    );
    const procedure = procedures.value.find(
      (p) => p.code === selectedProcedure.value
    );

    if (specialty) {
      saveSearchToHistory({
        specialtyCode: specialty.code,
        specialtyName: specialty.name,
        procedureCode: procedure?.code,
        procedureName: procedure?.name,
      });
    }
  }

  const currentQuery = route.query;
  const isSameQuery = JSON.stringify(currentQuery) === JSON.stringify(newQuery);

  if (!isSameQuery) {
    router.push({
      path: "/buscar",
      query: newQuery,
    });
  } else {
    emit("search", newQuery);
  }
};

const initializeFiltersFromQuery = async () => {
  const query = route.query;

  const specialtyCode = query.specialty_code as string;
  const procedureCode = query.procedure_code as string;

  if (!specialtyCode) {
    selectedSpecialty.value = undefined;
    selectedProcedure.value = undefined;
    procedures.value = [];
    return;
  }

  if (selectedSpecialty.value !== specialtyCode) {
    selectedSpecialty.value = specialtyCode;
    await loadProcedures(specialtyCode, true);
  } else if (specialtyCode && procedures.value.length === 0) {
    await loadProcedures(specialtyCode, true);
  }

  if (procedureCode) {
    const procedureExists = procedures.value.find(
      (p) => p.code === procedureCode
    );
    if (procedureExists) {
      selectedProcedure.value = procedureCode;
    } else {
      selectedProcedure.value = undefined;
    }
  } else {
    selectedProcedure.value = undefined;
  }
};

watch(
  () => route.query,
  async (newQuery, oldQuery) => {
    const queryChanged =
      newQuery.specialty_code !== oldQuery?.specialty_code ||
      newQuery.procedure_code !== oldQuery?.procedure_code;

    if (queryChanged) {
      await initializeFiltersFromQuery();
    }
  }
);

onMounted(async () => {
  await initializeFiltersFromQuery();
});

defineExpose({
  getSearchHistory,
  clearSearchHistory,
});
</script>

<template>
  <div class="search-form">
    <div class="search-form__card">
      <div class="search-form__body">
        <form class="search-form__form" @submit.prevent="searchResults">
          <div class="search-form__group">
            <label for="especialidad" class="search-form__label">
              Especialidades
            </label>
            <UiDropdownBase
              :key="`specialty-${selectedSpecialty}`"
              v-model="selectedSpecialty"
              :items="specialtyItems"
              placeholder="Ej. Oftalmología"
              :disabled="loading || !isAuthenticated"
              :loading="loading"
              searchable
              clearable
              no-results-text="No se encontraron especialidades"
              @select="handleSpecialtySelect"
              @clear="handleSpecialtyClear"
              size="lg"
            />
          </div>

          <div class="search-form__group">
            <div class="search-form__label-container">
              <label for="procedimiento" class="search-form__label">
                Procedimiento
              </label>
              <AtomsIconsRefreshCcwIcon
                v-if="loadingProcedures"
                class="search-form__loading-icon"
              />
            </div>
            <UiDropdownBase
              v-model="selectedProcedure"
              :items="procedureItems"
              placeholder="Ej. Cirugía de cataratas"
              :disabled="
                !isAuthenticated ||
                !selectedSpecialty ||
                loadingProcedures ||
                errorLoadingProcedures
              "
              :loading="loadingProcedures"
              :error="errorLoadingProcedures"
              searchable
              clearable
              no-results-text="No se encontraron procedimientos"
              size="lg"
            >
              <template #icon>
                <AtomsIconsSearchIcon size="20" />
              </template>
            </UiDropdownBase>
            <div
              v-if="errorLoadingProcedures"
              class="search-form__status-message search-form__status-message--error"
            >
              <span>Error al cargar procedimientos</span>
            </div>
          </div>

          <div class="search-form__button-group">
            <button type="submit" class="search-form__submit-button">
              <AtomsIconsSearchIcon size="20" class="text-light" />
              Buscar especialidad
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-form {
  width: 100%;
  max-width: 957px;
  gap: 1.25rem;
  border-radius: 0.9375rem;
  padding: 1.25rem;
  margin: 0 auto;
  background: $white;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 0.25rem 1.675rem 0 #00000017;

  @media (max-width: $breakpoint-md) {
    padding: 1rem;
    gap: 1rem;
  }

  &__card {
    width: 100%;
  }

  &__body {
    width: 100%;
  }

  &__form {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 1.25rem;
    align-items: end;

    @media (max-width: $breakpoint-md) {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
    }
  }

  &__group {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    min-width: 0;

    @media (min-width: $breakpoint-md) {
      max-width: 320px;
    }
  }

  &__label-container {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__label {
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #344054;
  }

  &__loading-icon {
    width: 1rem;
    height: 1rem;
    color: $primary-aqua;
    animation: spin 1s linear infinite;
  }

  &__button-group {
    display: flex;

    @media (max-width: $breakpoint-md) {
      width: 100%;
    }
  }

  &__submit-button {
    @include gradient-button;
    height: 3.5rem;

    @media (max-width: $breakpoint-md) {
      width: 100%;
    }
  }

  &__status-message {
    position: absolute;
    bottom: -1.25rem;
    left: 0;
    font-size: 0.75rem;
    line-height: 1rem;

    &--error {
      color: #dc3545;
    }
  }

  &__auth-message {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    line-height: 1rem;
    color: #ef4444;
    font-weight: 500;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
