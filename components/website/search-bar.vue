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
const procedureSearchText = ref("");
const filteredProcedures = ref<Procedure[]>([]);

const specialtyDropdown = ref<HTMLElement | null>(null);
const procedureDropdown = ref<HTMLElement | null>(null);
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

watch(procedureSearchText, (newVal) => {
  filterProcedures(newVal);
});

watch(
  () => route.query,
  () => {
    initializeFiltersFromQuery();
  }
);

onMounted(async () => {
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
              <button
                class="dropdown__toggle"
                :class="{
                  'dropdown__toggle--disabled': loading,
                  'dropdown__toggle--active': showSpecialtyDropdown,
                }"
                type="button"
                @click="toggleSpecialtyDropdown"
                :disabled="loading"
              >
                <span class="dropdown__text">{{ selectedSpecialtyName }}</span>
                <svg
                  class="dropdown__arrow"
                  :class="{ 'dropdown__arrow--rotated': showSpecialtyDropdown }"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    stroke-width="1.67"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>

              <div
                class="dropdown__menu"
                :class="{ 'dropdown__menu--show': showSpecialtyDropdown }"
              >
                <button
                  v-for="specialty in specialties"
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
  max-width: 776px;
  gap: 20px;
  border-radius: 15px;
  padding: 20px;
  margin: 0 auto;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0px 4px 26.8px 0px #00000017;

  @media (max-width: 768px) {
    padding: 16px;
    gap: 16px;
  }

  &__form {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 20px;
    width: 100%;
    align-items: end;

    @media (max-width: 768px) {
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
    gap: 6px;
    min-width: 0;
  }

  &__label-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__label {
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: #344054;
  }

  &__loading-icon {
    width: 16px;
    height: 16px;
    color: #0cadbb;
    animation: spin 1s linear infinite;
  }

  &__dropdown {
    position: relative;
    width: 100%;
    min-width: 324px;
  }

  &__button-group {
    display: flex;
    align-self: end;
  }

  &__submit-button {
    width: 56px;
    height: 56px;
    gap: 8px;
    opacity: 1;
    border-radius: 8px;
    padding: 16px;
    border: 1px solid #0cadbb;
    box-shadow: 0px 1px 2px 0px #1018280d;
    background: #0cadbb;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover {
      background-color: darken(#0cadbb, 10%);
      border-color: darken(#0cadbb, 10%);
    }

    @media (max-width: 768px) {
      align-self: flex-end;
      width: 100%;
      justify-content: center;
    }
  }

  &__status-message {
    position: absolute;
    bottom: -20px;
    left: 0;
    font-size: 12px;

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
    min-height: 56px;
    padding: 16px;
    background: #ffffff;
    border: 1px solid #d0d5dd;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    text-align: left;

    &:hover {
      border-color: #0cadbb;
    }

    &:focus {
      outline: none;
      border-color: #0cadbb;
      box-shadow: 0 0 0 3px rgba(12, 173, 187, 0.1);
    }

    &--active {
      border-color: #0cadbb;
      box-shadow: 0 0 0 3px rgba(12, 173, 187, 0.1);
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
      padding-left: 45px;
      padding-right: 50px;
    }

    &--clickable {
      border: 1px solid #d0d5dd;
      cursor: pointer;
    }
  }

  &__icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #667085;
    pointer-events: none;
    z-index: 1;
  }

  &__clear-button {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    border: none;
    background: transparent;
    color: #667085;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
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
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0;

    &::placeholder {
      color: #667085;
    }

    &:disabled {
      color: #98a2b3;
      cursor: not-allowed;
    }
  }

  &__text {
    flex: 1;
    font-size: 16px;
    line-height: 24px;
    color: #667085;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__arrow {
    width: 20px;
    height: 20px;
    color: #667085;
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
    background: #ffffff;
    border: 1px solid #d0d5dd;
    border-radius: 8px;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
    max-height: 200px;
    overflow-y: auto;
    margin-top: 4px;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.2s ease;

    &--show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f5f9;
    }

    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;

      &:hover {
        background: #94a3b8;
      }
    }
  }

  &__no-results {
    padding: 12px 16px;
    font-size: 14px;
    color: #6b7280;
    font-style: italic;
    text-align: center;
  }

  &__item {
    width: 100%;
    padding: 12px 16px;
    text-align: left;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 16px;
    line-height: 24px;
    color: $color-foreground;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;

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
      border-top-left-radius: 7px;
      border-top-right-radius: 7px;
    }

    &:last-child {
      border-bottom-left-radius: 7px;
      border-bottom-right-radius: 7px;
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
