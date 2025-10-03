<script lang="ts" setup>
interface Specialty {
  code: string;
  name: string;
}

interface Procedure {
  code: string;
  name: string;
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

import { onClickOutside } from "@vueuse/core";
import { useUdc } from "~/composables/api";

const route = useRoute();
const router = useRouter();
const { fetchUdc } = useUdc();

const filtersData = ref({
  procedimiento: "",
  procedures: [] as Procedure[],
});

const selectedSpecialty = ref("");
const selectedSpecialtyName = ref("Buscar por especialidad");
const selectedProcedureName = ref("Nombre del procedimiento");
const loadingProcedures = ref(false);
const errorLoadingProcedures = ref(false);
const showSpecialtyDropdown = ref(false);
const showProcedureDropdown = ref(false);
const specialtySearchText = ref("");
const procedureSearchText = ref("");
const filteredSpecialties = ref<Specialty[]>([]);
const filteredProcedures = ref<Procedure[]>([]);

const specialtyDropdown = ref<HTMLElement | null>(null);
const procedureDropdown = ref<HTMLElement | null>(null);
const specialtySearchInput = ref<HTMLInputElement | null>(null);
const procedureSearchInput = ref<HTMLInputElement | null>(null);

const loadProcedures = async (specialtyCode: string) => {
  loadingProcedures.value = true;
  errorLoadingProcedures.value = false;

  if (!filtersData.value.procedimiento) {
    filtersData.value.procedimiento = "";
  }

  try {
    const api = fetchUdc("MEDICAL_PROCEDURE", {
      father_code: specialtyCode,
    });
    await api.request();

    const response = api.response.value;

    if (response?.data) {
      filtersData.value.procedures = response.data.map((item: any) => ({
        code: item.code,
        name: item.name,
      }));
      filteredProcedures.value = [...filtersData.value.procedures];

      const queryProcedure = route.query.procedure_code as string;
      if (queryProcedure && !procedureSearchText.value) {
        filtersData.value.procedimiento = queryProcedure;
        const procedure = filtersData.value.procedures.find(
          (p) => p.code === queryProcedure
        );
        if (procedure) {
          selectedProcedureName.value = procedure.name;
          procedureSearchText.value = procedure.name;
        }
      }
    }
  } catch (err) {
    console.error("Error loading procedures:", err);
    errorLoadingProcedures.value = true;
  } finally {
    loadingProcedures.value = false;
  }
};

onClickOutside(specialtyDropdown, () => {
  showSpecialtyDropdown.value = false;
});

onClickOutside(procedureDropdown, () => {
  showProcedureDropdown.value = false;
});

const filterSpecialties = (searchText: string) => {
  if (!searchText.trim()) {
    filteredSpecialties.value = [...props.specialties];
  } else {
    filteredSpecialties.value = props.specialties.filter((specialty) =>
      specialty.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }
};

const filterProcedures = (searchText: string) => {
  if (!searchText.trim()) {
    filteredProcedures.value = [...filtersData.value.procedures];
  } else {
    filteredProcedures.value = filtersData.value.procedures.filter(
      (procedure) =>
        procedure.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }
};

const toggleSpecialtyDropdown = () => {
  if (!props.loading) {
    showSpecialtyDropdown.value = !showSpecialtyDropdown.value;
    showProcedureDropdown.value = false;
    if (showSpecialtyDropdown.value) {
      nextTick(() => {
        specialtySearchInput.value?.focus();
      });
    }
  }
};

const toggleProcedureDropdown = () => {
  if (
    !loadingProcedures.value &&
    !errorLoadingProcedures.value &&
    selectedSpecialty.value
  ) {
    showProcedureDropdown.value = !showProcedureDropdown.value;
    showSpecialtyDropdown.value = false;
    if (showProcedureDropdown.value) {
      nextTick(() => {
        procedureSearchInput.value?.focus();
      });
    }
  }
};

const selectSpecialty = (specialty: Specialty) => {
  selectedSpecialty.value = specialty.code;
  selectedSpecialtyName.value = specialty.name;
  specialtySearchText.value = specialty.name;
  showSpecialtyDropdown.value = false;
  filtersData.value.procedimiento = "";
  selectedProcedureName.value = "Nombre del procedimiento";
  procedureSearchText.value = "";
  filteredProcedures.value = [];
};

const selectProcedure = (procedure: Procedure) => {
  filtersData.value.procedimiento = procedure.code;
  selectedProcedureName.value = procedure.name;
  showProcedureDropdown.value = false;
  procedureSearchText.value = procedure.name;
};

const onSpecialtySearchInput = () => {
  if (!showSpecialtyDropdown.value) {
    showSpecialtyDropdown.value = true;
  }
  if (selectedSpecialty.value) {
    const currentSpecialty = props.specialties.find(
      (s) => s.code === selectedSpecialty.value
    );
    if (
      currentSpecialty &&
      specialtySearchText.value !== currentSpecialty.name
    ) {
      selectedSpecialty.value = "";
      selectedSpecialtyName.value = "Buscar por especialidad";
    }
  }
};

const onProcedureSearchInput = () => {
  if (!showProcedureDropdown.value) {
    showProcedureDropdown.value = true;
  }
  if (filtersData.value.procedimiento) {
    const currentProcedure = filtersData.value.procedures.find(
      (p) => p.code === filtersData.value.procedimiento
    );
    if (
      currentProcedure &&
      procedureSearchText.value !== currentProcedure.name
    ) {
      filtersData.value.procedimiento = "";
      selectedProcedureName.value = "Nombre del procedimiento";
    }
  }
};

const onSpecialtyInputClick = () => {
  if (!showSpecialtyDropdown.value && !props.loading) {
    showSpecialtyDropdown.value = true;
    showProcedureDropdown.value = false;
  }
};

const onSpecialtyInputFocus = () => {
  if (!showSpecialtyDropdown.value && !props.loading) {
    showSpecialtyDropdown.value = true;
    showProcedureDropdown.value = false;
  }
};

const onInputClick = () => {
  if (
    !showProcedureDropdown.value &&
    !loadingProcedures.value &&
    !errorLoadingProcedures.value &&
    selectedSpecialty.value
  ) {
    showProcedureDropdown.value = true;
    showSpecialtyDropdown.value = false;
  }
};

const onInputFocus = () => {
  if (
    !showProcedureDropdown.value &&
    !loadingProcedures.value &&
    !errorLoadingProcedures.value &&
    selectedSpecialty.value
  ) {
    showProcedureDropdown.value = true;
    showSpecialtyDropdown.value = false;
  }
};

const clearSpecialtySelection = () => {
  selectedSpecialty.value = "";
  selectedSpecialtyName.value = "Buscar por especialidad";
  specialtySearchText.value = "";
  filteredSpecialties.value = [...props.specialties];
  filtersData.value.procedimiento = "";
  selectedProcedureName.value = "Nombre del procedimiento";
  procedureSearchText.value = "";
  filteredProcedures.value = [];
  filtersData.value.procedures = [];
};

const clearProcedureSelection = () => {
  filtersData.value.procedimiento = "";
  selectedProcedureName.value = "Nombre del procedimiento";
  procedureSearchText.value = "";
  filteredProcedures.value = [...filtersData.value.procedures];
};

const searchResults = () => {
  const newQuery: Record<string, string> = {
    ...(filtersData.value.procedimiento && {
      procedure_code: filtersData.value.procedimiento,
    }),
    ...(selectedSpecialty.value && {
      specialty_code: selectedSpecialty.value,
    }),
  };

  if (Object.keys(newQuery).length === 0) {
    router.push({ path: "/buscar" });
    return;
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

  filtersData.value.procedimiento = (query.procedure_code as string) || "";
  selectedSpecialty.value = (query.specialty_code as string) || "";

  if (selectedSpecialty.value) {
    const specialty = props.specialties.find(
      (s) => s.code === selectedSpecialty.value
    );
    if (specialty) {
      selectedSpecialtyName.value = specialty.name;
      specialtySearchText.value = specialty.name;
    }
    await loadProcedures(selectedSpecialty.value);

    if (filtersData.value.procedimiento) {
      const procedure = filtersData.value.procedures.find(
        (p) => p.code === filtersData.value.procedimiento
      );
      if (procedure) {
        selectedProcedureName.value = procedure.name;
        procedureSearchText.value = procedure.name;
      }
    }
  }
};

watch(selectedSpecialty, async (newVal) => {
  if (newVal) {
    await loadProcedures(newVal);
  } else {
    filtersData.value.procedures = [];
    filtersData.value.procedimiento = "";
    selectedProcedureName.value = "Nombre del procedimiento";
    procedureSearchText.value = "";
    filteredProcedures.value = [];
  }
});

watch(specialtySearchText, (newVal) => {
  filterSpecialties(newVal);
});

watch(procedureSearchText, (newVal) => {
  filterProcedures(newVal);
});

watch(
  () => props.specialties,
  (newSpecialties) => {
    filteredSpecialties.value = [...newSpecialties];
  },
  { immediate: true }
);

watch(
  () => route.query,
  () => {
    initializeFiltersFromQuery();
  }
);

onMounted(async () => {
  filteredSpecialties.value = [...props.specialties];
  await initializeFiltersFromQuery();
});
</script>

<template>
  <div class="search-form">
    <div class="search-form__card">
      <div class="search-form__body">
        <form class="search-form__form" @submit.prevent="searchResults">
          <div class="search-form__group">
            <label for="especialidad" class="search-form__label"
              >Especialidades</label
            >
            <div class="dropdown search-form__dropdown" ref="specialtyDropdown">
              <div class="dropdown__toggle-container">
                <div
                  class="dropdown__toggle dropdown__toggle--with-icon dropdown__toggle--clickable"
                  :class="{
                    'dropdown__toggle--disabled': loading,
                    'dropdown__toggle--active': showSpecialtyDropdown,
                  }"
                  @click="toggleSpecialtyDropdown"
                >
                  <div class="dropdown__icon">
                    <AtomsIconsSearchIcon size="20" />
                  </div>
                  <input
                    ref="specialtySearchInput"
                    class="dropdown__search-input"
                    type="text"
                    v-model="specialtySearchText"
                    :placeholder="
                      selectedSpecialty ? '' : selectedSpecialtyName
                    "
                    @input="onSpecialtySearchInput"
                    @click.stop="onSpecialtyInputClick"
                    @focus="onSpecialtyInputFocus"
                    :disabled="loading"
                  />
                  <button
                    v-if="specialtySearchText || selectedSpecialty"
                    type="button"
                    class="dropdown__clear-button"
                    @click.stop="clearSpecialtySelection"
                    :disabled="loading"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M12 4L4 12M4 4l8 8"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div
                class="dropdown__menu"
                :class="{ 'dropdown__menu--show': showSpecialtyDropdown }"
              >
                <div
                  v-if="filteredSpecialties.length === 0 && specialtySearchText"
                  class="dropdown__no-results"
                >
                  No se encontraron especialidades
                </div>
                <button
                  v-for="specialty in filteredSpecialties"
                  :key="specialty.code"
                  class="dropdown__item"
                  :class="{
                    'dropdown__item--active':
                      selectedSpecialty === specialty.code,
                  }"
                  type="button"
                  @click="selectSpecialty(specialty)"
                >
                  <span class="dropdown__item-text">{{ specialty.name }}</span>
                  <AtomsIconsCheckIcon
                    v-if="selectedSpecialty === specialty.code"
                    size="16"
                    class="dropdown__item-icon"
                  />
                </button>
              </div>
            </div>
          </div>

          <div class="search-form__group">
            <div class="search-form__label-container">
              <label for="procedimiento" class="search-form__label"
                >Procedimiento</label
              >
              <AtomsIconsRefreshCcwIcon
                v-if="loadingProcedures"
                class="search-form__loading-icon"
              />
            </div>

            <div class="dropdown search-form__dropdown" ref="procedureDropdown">
              <div class="dropdown__toggle-container">
                <div
                  class="dropdown__toggle dropdown__toggle--with-icon dropdown__toggle--clickable"
                  :class="{
                    'dropdown__toggle--disabled':
                      loadingProcedures ||
                      errorLoadingProcedures ||
                      !selectedSpecialty,
                    'dropdown__toggle--active': showProcedureDropdown,
                    'dropdown__toggle--error': errorLoadingProcedures,
                  }"
                  @click="toggleProcedureDropdown"
                >
                  <div class="dropdown__icon">
                    <AtomsIconsSearchIcon size="20" />
                  </div>
                  <input
                    ref="procedureSearchInput"
                    class="dropdown__search-input"
                    type="text"
                    v-model="procedureSearchText"
                    :placeholder="
                      filtersData.procedimiento ? '' : selectedProcedureName
                    "
                    @input="onProcedureSearchInput"
                    @click.stop="onInputClick"
                    @focus="onInputFocus"
                    :disabled="
                      loadingProcedures ||
                      errorLoadingProcedures ||
                      !selectedSpecialty
                    "
                  />
                  <button
                    v-if="procedureSearchText || filtersData.procedimiento"
                    type="button"
                    class="dropdown__clear-button"
                    @click.stop="clearProcedureSelection"
                    :disabled="
                      loadingProcedures ||
                      errorLoadingProcedures ||
                      !selectedSpecialty
                    "
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M12 4L4 12M4 4l8 8"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div
                class="dropdown__menu"
                :class="{ 'dropdown__menu--show': showProcedureDropdown }"
              >
                <div
                  v-if="filteredProcedures.length === 0 && procedureSearchText"
                  class="dropdown__no-results"
                >
                  No se encontraron procedimientos
                </div>
                <button
                  v-for="procedure in filteredProcedures"
                  :key="procedure.code"
                  class="dropdown__item"
                  :class="{
                    'dropdown__item--active':
                      filtersData.procedimiento === procedure.code,
                  }"
                  type="button"
                  @click="selectProcedure(procedure)"
                >
                  <span class="dropdown__item-text">{{ procedure.name }}</span>
                  <AtomsIconsCheckIcon
                    v-if="filtersData.procedimiento === procedure.code"
                    size="16"
                    class="dropdown__item-icon"
                  />
                </button>
              </div>

              <div
                v-if="errorLoadingProcedures"
                class="search-form__status-message search-form__status-message--error"
              >
                <span>Error al cargar</span>
              </div>
            </div>
          </div>

          <div class="search-form__button-group">
            <button type="submit" class="search-form__submit-button">
              <AtomsIconsSearchIcon size="20" class="text-light" />
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
  max-width: 48.5rem;
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

  &__form {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 1.25rem;
    width: 100%;
    align-items: end;

    @media (max-width: $breakpoint-md) {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
    }
  }

  &__body {
    display: contents;
  }

  &__group {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    min-width: 0;
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

  &__dropdown {
    position: relative;
    width: 100%;
    min-width: 20.25rem;
  }

  &__button-group {
    display: flex;
    align-self: end;
  }

  &__submit-button {
    width: 3.5rem;
    height: 3.5rem;
    gap: 0.5rem;
    opacity: 1;
    border-radius: 0.5rem;
    padding: 1rem;
    border: 1px solid $primary-aqua;
    box-shadow: 0 0.0625rem 0.125rem 0 #1018280d;
    background: $primary-aqua;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover {
      background-color: darken($primary-aqua, 10%);
      border-color: darken($primary-aqua, 10%);
    }

    @media (max-width: $breakpoint-md) {
      align-self: flex-end;
      width: 100%;
      justify-content: center;
    }
  }

  &__status-message {
    position: absolute;
    bottom: -1.25rem;
    left: 0;
    font-size: 0.75rem;

    &--error {
      color: #dc3545;
    }
  }
}

.dropdown {
  &__toggle-container {
    position: relative;
    width: 100%;
  }

  &__toggle {
    width: 100%;
    min-height: 3.5rem;
    padding: 1rem;
    background: $white;
    border: 1px solid #d0d5dd;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    text-align: left;

    &:hover {
      border-color: $primary-aqua;
    }

    &:focus {
      outline: none;
      border-color: $primary-aqua;
      box-shadow: 0 0 0 0.1875rem rgba(12, 173, 187, 0.1);
    }

    &--active {
      border-color: $primary-aqua;
      box-shadow: 0 0 0 0.1875rem rgba(12, 173, 187, 0.1);
    }

    &--disabled {
      background-color: #f9fafb;
      border-color: #d0d5dd;
      color: #98a2b3;
      cursor: not-allowed;

      &:hover {
        border-color: #d0d5dd;
      }
    }

    &--error {
      border-color: #dc3545;
    }

    &--with-icon {
      padding-left: 2.8125rem;
      padding-right: 3.125rem;
    }

    &--clickable {
      border: 1px solid #d0d5dd;
      cursor: pointer;
    }
  }

  &__icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: $color-text-muted;
    pointer-events: none;
    z-index: 1;
  }

  &__clear-button {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    width: 1.5rem;
    height: 1.5rem;
    border: none;
    background: transparent;
    color: $color-text-muted;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.25rem;
    transition: all 0.2s ease;

    &:hover {
      background-color: #f3f4f6;
      color: #374151;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: $color-foreground;
    width: 100%;
    font-family: $font-family-main;
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0;

    &::placeholder {
      color: $color-text-muted;
    }

    &:disabled {
      color: #98a2b3;
      cursor: not-allowed;
    }
  }

  &__text {
    flex: 1;
    font-size: 1rem;
    line-height: 1.5rem;
    color: $color-text-muted;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__arrow {
    width: 1.25rem;
    height: 1.25rem;
    color: $color-text-muted;
    transition: transform 0.2s ease;
    flex-shrink: 0;

    &--rotated {
      transform: rotate(180deg);
    }
  }

  &__menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1000;
    background: $white;
    border: 1px solid #d0d5dd;
    border-radius: 0.5rem;
    box-shadow:
      0 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1),
      0 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06);
    max-height: 12.5rem;
    overflow-y: auto;
    margin-top: 0.25rem;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-0.625rem);
    transition: all 0.2s ease;

    &--show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    &::-webkit-scrollbar {
      width: 0.375rem;
    }

    &::-webkit-scrollbar-track {
      background: #f1f5f9;
    }

    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 0.1875rem;

      &:hover {
        background: #94a3b8;
      }
    }
  }

  &__no-results {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    color: #6b7280;
    font-style: italic;
    text-align: center;
  }

  &__item {
    width: 100%;
    padding: 0.75rem 1rem;
    text-align: left;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1.5rem;
    color: $color-foreground;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;

    &:hover {
      background-color: #f9fafb;
    }

    &:focus {
      outline: none;
      background-color: #f3f4f6;
    }

    &--active {
      background-color: #f9fafb;
      color: $color-foreground;
    }

    &:first-child {
      border-top-left-radius: 0.4375rem;
      border-top-right-radius: 0.4375rem;
    }

    &:last-child {
      border-bottom-left-radius: 0.4375rem;
      border-bottom-right-radius: 0.4375rem;
    }
  }

  &__item-text {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
  }

  &__item-icon {
    color: #7f56d9;
    flex-shrink: 0;
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
