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
      loadingProcedures: false,
      errorLoadingProcedures: false,
    };
  },
  async mounted() {
    await this.initializeFiltersFromQuery();
  },
  watch: {
    async selectedSpecialty(newVal) {
      if (newVal) {
        await this.loadProcedures(newVal);
      } else {
        this.filtersData.procedures = [];
        this.filtersData.procedimiento = "";
      }
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
        await this.loadProcedures(this.selectedSpecialty);
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

          const queryProcedure = this.$route.query.procedure_code;
          if (queryProcedure && !this.filtersData.procedimiento) {
            this.filtersData.procedimiento = queryProcedure;
          }
        }
      } catch (err) {
        console.error("Error loading procedures:", err);
        this.errorLoadingProcedures = true;
      } finally {
        this.loadingProcedures = false;
      }
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
            <select
              id="especialidad"
              class="search-form__select"
              v-model="selectedSpecialty"
              :disabled="loading"
            >
              <option value="" disabled>Buscar por especialidad</option>
              <option
                v-for="specialty in specialties"
                :key="specialty.code"
                :value="specialty.code"
              >
                {{ specialty.name }}
              </option>
            </select>
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
            <div class="search-form__input-icon-wrapper">
              <select
                id="procedimiento"
                class="search-form__select search-form__select--with-icon"
                v-model="filtersData.procedimiento"
                :disabled="
                  loadingProcedures ||
                  errorLoadingProcedures ||
                  !selectedSpecialty
                "
              >
                <option value="" disabled>Nombre del procedimiento</option>
                <option
                  v-for="procedure in filtersData.procedures"
                  :key="procedure.code"
                  :value="procedure.code"
                >
                  {{ procedure.name }}
                </option>
              </select>
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
    display: flex;
    align-items: flex-end;
    gap: 20px;
    width: 100%;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;
    }
  }

  &__body {
    display: flex;
    gap: 20px;
    width: 100%;

    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  &__group {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 6px;
    width: 100%;
  }

  &__label-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__label {
    @include label-base;
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

  &__select {
    @include input-base;
    width: 100%;
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    color: #667085;
    padding-left: 0;
  }

  &__input-icon-wrapper {
    position: relative;
    width: 100%;
  }

  &__submit-button {
    @include button-base;
    width: 56px;
    height: 56px;
    gap: 8px;
    opacity: 1;
    border-radius: 8px;
    padding: 16px;
    border-width: 1px;
    box-shadow: 0px 1px 2px 0px #1018280d;
    background: #0cadbb;

    &:hover {
      background-color: darken(#0cadbb, 0.5);
      border-color: darken(#0cadbb, 0.5);
    }

    @media (max-width: 768px) {
      align-self: flex-end;
    }
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
