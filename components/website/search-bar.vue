<script>
export default {
  props: {
    solicitar: Boolean,
    specialties: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    token: String,
  },
  data() {
    return {
      filtersData: {
        procedimiento: "",
        procedures: [],
      },
      selectedSpecialty: "",
      selectedSpecialtyName: "Buscar por especialidad",
      selectedProcedureName: "Nombre del procedimiento",
      loadingProcedures: false,
      errorLoadingProcedures: false,
      showSpecialtyDropdown: false,
      showProcedureDropdown: false,
      procedureSearchText: "",
      filteredProcedures: [],
    };
  },
  async mounted() {
    await this.initializeFiltersFromQuery();
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
  watch: {
    async selectedSpecialty(newVal) {
      if (newVal) {
        await this.loadProcedures(newVal);
      } else {
        this.filtersData.procedures = [];
        this.filtersData.procedimiento = "";
        this.selectedProcedureName = "Nombre del procedimiento";
        this.procedureSearchText = "";
        this.filteredProcedures = [];
      }
    },
    procedureSearchText(newVal) {
      this.filterProcedures(newVal);
    },
    "$route.query": {
      handler: "initializeFiltersFromQuery",
      immediate: false,
    },
  },
  methods: {
    async initializeFiltersFromQuery() {
      const query = this.$route.query;

      this.filtersData.procedimiento = query.procedure_code || "";
      this.selectedSpecialty = query.specialty_code || "";

      if (this.selectedSpecialty) {
        const specialty = this.specialties.find(
          (s) => s.code === this.selectedSpecialty
        );
        if (specialty) {
          this.selectedSpecialtyName = specialty.name;
        }
        await this.loadProcedures(this.selectedSpecialty);

        if (this.filtersData.procedimiento) {
          const procedure = this.filtersData.procedures.find(
            (p) => p.code === this.filtersData.procedimiento
          );
          if (procedure) {
            this.selectedProcedureName = procedure.name;
            this.procedureSearchText = procedure.name;
          }
        }
      }
    },

    async loadProcedures(specialtyCode) {
      const config = useRuntimeConfig();
      const token = useCookie("token");
      this.loadingProcedures = true;
      this.errorLoadingProcedures = false;

      if (!this.filtersData.procedimiento) {
        this.filtersData.procedimiento = "";
      }

      try {
        const { data, error } = await useFetch(
          `${config.public.API_BASE_URL}/udc/get_all?father_code=${specialtyCode}&type=MEDICAL_PROCEDURE`,
          {
            method: "GET",
            headers: { Authorization: token.value },
          }
        );

        if (data.value?.data) {
          this.filtersData.procedures = data.value.data.map((item) => ({
            code: item.code,
            name: item.name,
          }));
          this.filteredProcedures = [...this.filtersData.procedures];

          const queryProcedure = this.$route.query.procedure_code;
          if (queryProcedure && !this.procedureSearchText) {
            this.filtersData.procedimiento = queryProcedure;
            const procedure = this.filtersData.procedures.find(
              (p) => p.code === queryProcedure
            );
            if (procedure) {
              this.selectedProcedureName = procedure.name;
              this.procedureSearchText = procedure.name;
            }
          }
        }
      } catch (err) {
        console.error("Error loading procedures:", err);
        this.errorLoadingProcedures = true;
      } finally {
        this.loadingProcedures = false;
      }
    },

    handleClickOutside(event) {
      if (!this.$refs.specialtyDropdown?.contains(event.target)) {
        this.showSpecialtyDropdown = false;
      }
      if (!this.$refs.procedureDropdown?.contains(event.target)) {
        this.showProcedureDropdown = false;
      }
    },

    filterProcedures(searchText) {
      if (!searchText.trim()) {
        this.filteredProcedures = [...this.filtersData.procedures];
      } else {
        this.filteredProcedures = this.filtersData.procedures.filter(
          (procedure) =>
            procedure.name.toLowerCase().includes(searchText.toLowerCase())
        );
      }
    },

    toggleSpecialtyDropdown() {
      if (!this.loading) {
        this.showSpecialtyDropdown = !this.showSpecialtyDropdown;
        this.showProcedureDropdown = false;
      }
    },

    toggleProcedureDropdown() {
      if (
        !this.loadingProcedures &&
        !this.errorLoadingProcedures &&
        this.selectedSpecialty
      ) {
        this.showProcedureDropdown = !this.showProcedureDropdown;
        this.showSpecialtyDropdown = false;
        if (this.showProcedureDropdown) {
          this.$nextTick(() => {
            this.$refs.procedureSearchInput?.focus();
          });
        }
      }
    },

    selectSpecialty(specialty) {
      this.selectedSpecialty = specialty.code;
      this.selectedSpecialtyName = specialty.name;
      this.showSpecialtyDropdown = false;
      this.filtersData.procedimiento = "";
      this.selectedProcedureName = "Nombre del procedimiento";
      this.procedureSearchText = "";
      this.filteredProcedures = [];
    },

    selectProcedure(procedure) {
      this.filtersData.procedimiento = procedure.code;
      this.selectedProcedureName = procedure.name;
      this.showProcedureDropdown = false;
      this.procedureSearchText = procedure.name;
    },

    onProcedureSearchInput() {
      if (!this.showProcedureDropdown) {
        this.showProcedureDropdown = true;
      }
      if (this.filtersData.procedimiento) {
        const currentProcedure = this.filtersData.procedures.find(
          (p) => p.code === this.filtersData.procedimiento
        );
        if (
          currentProcedure &&
          this.procedureSearchText !== currentProcedure.name
        ) {
          this.filtersData.procedimiento = "";
          this.selectedProcedureName = "Nombre del procedimiento";
        }
      }
    },

    onInputClick() {
      if (
        !this.showProcedureDropdown &&
        !this.loadingProcedures &&
        !this.errorLoadingProcedures &&
        this.selectedSpecialty
      ) {
        this.showProcedureDropdown = true;
        this.showSpecialtyDropdown = false;
      }
    },

    onInputFocus() {
      if (
        !this.showProcedureDropdown &&
        !this.loadingProcedures &&
        !this.errorLoadingProcedures &&
        this.selectedSpecialty
      ) {
        this.showProcedureDropdown = true;
        this.showSpecialtyDropdown = false;
      }
    },

    clearProcedureSelection() {
      this.filtersData.procedimiento = "";
      this.selectedProcedureName = "Nombre del procedimiento";
      this.procedureSearchText = "";
      this.filteredProcedures = [...this.filtersData.procedures];
    },

    searchResults() {
      const newQuery = {
        ...(this.filtersData.procedimiento && {
          procedure_code: this.filtersData.procedimiento,
        }),
        ...(this.selectedSpecialty && {
          specialty_code: this.selectedSpecialty,
        }),
      };

      if (Object.keys(newQuery).length === 0) {
        this.$router.push({ path: "/buscar" });
        return;
      }

      const currentQuery = this.$route.query;
      const isSameQuery =
        JSON.stringify(currentQuery) === JSON.stringify(newQuery);

      if (!isSameQuery) {
        this.$router.push({
          path: "/buscar",
          query: newQuery,
        });
      } else {
        this.$emit("search", newQuery);
      }
    },
  },
};
</script>

<template>
  <div class="search-form">
    <div class="search-form__card">
      <div class="search-form__body">
        <form class="search-form__form" @submit.prevent="searchResults">
          <!-- Specialties Dropdown -->
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

          <!-- Procedures Dropdown -->
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
