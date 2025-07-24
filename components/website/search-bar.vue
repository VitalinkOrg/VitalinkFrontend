<script>
export default {
  props: {
    solicitar: Boolean,
    specialties: {
      type: Array,
      default: () => [],
    },
    token: String,
  },
  data() {
    return {
      filtersData: {
        procedimiento: "",
        lugar: "",
        valoracion: "",
        disponibilidad: "",
        entity: "",
        min: "",
        max: "",
        procedures: [],
      },
      selectedSpecialty: "",
      loadingProcedures: false,
      // Removed errorLoadingSpecialties since we don't need it anymore
      errorLoadingProcedures: false,
    };
  },
  mounted() {
    this.filtersData.disponibilidad = [
      { code: "all", name: "Todos" },
      { code: "weeks", name: "Proximas semanas" },
      { code: "months", name: "Proximos meses" },
      { code: "days", name: "Proximos dias" },
    ];
  },
  watch: {
    async selectedSpecialty(newVal, token) {
      if (newVal) {
        await this.loadProcedures(newVal, token);
      } else {
        this.filtersData.procedures = [];
        this.filtersData.procedimiento = "";
      }
    },
  },
  methods: {
    async loadProcedures(specialtyCode) {
      const config = useRuntimeConfig();
      const token = useCookie("token");
      this.loadingProcedures = true;
      this.errorLoadingProcedures = false;
      this.filtersData.procedimiento = "";

      console.log(this.selectedSpecialty);

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
        }
      } catch (err) {
        console.error("Error loading procedures:", err);
        this.errorLoadingProcedures = true;
      } finally {
        this.loadingProcedures = false;
      }
    },
    searchResults() {
      this.$router.push({
        path: "/buscar",
        query: {
          ...(this.filtersData.procedimiento && {
            procedure_code: this.filtersData.procedimiento,
          }),
          ...(this.selectedSpecialty && {
            specialty_code: this.selectedSpecialty,
          }),
          ...(this.filtersData.lugar && { province: this.filtersData.lugar }),
          ...(this.filtersData.valoracion && {
            min_stars: this.filtersData.valoracion,
          }),
          /* ...(this.filtersData.disponibilidad && {
            disponibilidad: this.filtersData.disponibilidad,
          }), */
          ...(this.filtersData.min && { min_price: this.filtersData.min }),
          ...(this.filtersData.max && { max_price: this.filtersData.max }),
          ...(this.filtersData.entity && {
            entity_type: this.filtersData.entity,
          }),
        },
      });
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
            >
              <option value="" disabled selected>
                Buscar por especialidad
              </option>
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
            <label for="procedimiento" class="search-form__label"
              >Procedimiento</label
            >
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
                <option value="" disabled selected>
                  Nombre del procedimiento
                </option>
                <option
                  v-for="procedure in filtersData.procedures"
                  :key="procedure.code"
                  :value="procedure.code"
                >
                  {{ procedure.name }}
                </option>
              </select>
              <div
                v-if="loadingProcedures || errorLoadingProcedures"
                class="search-form__status-message"
                :class="{
                  'search-form__status-message--error': errorLoadingProcedures,
                }"
              >
                <span v-if="loadingProcedures">Cargando...</span>
                <span v-else>Error al cargar</span>
              </div>
            </div>
          </div>

          <div class="search-form__button-group">
            <button type="submit" class="search-form__submit-button">
              <Icon
                name="fa6-solid:magnifying-glass"
                size="18"
                class="text-light"
              />
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="search-form__filter-display">
      <button v-if="filtersData.entity" class="search-form__filter-tag">
        Entidad:
        {{ filtersData.entity === "doctor" ? "Doctor" : "Hospital" }}
      </button>
      <button v-if="filtersData.min" class="search-form__filter-tag">
        Precio mínimo: {{ filtersData.min }}
      </button>
      <button v-if="filtersData.max" class="search-form__filter-tag">
        Precio máximo: {{ filtersData.max }}
      </button>
      <WebsiteMasFiltrosModal :filters="filtersData" />
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

  &__label {
    @include label-base;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    color: #344054;
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

  &__filter-display {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
    width: 100%;
  }

  &__filter-tag {
    background-color: #f2f4f7;
    border: none;
    color: #344054;
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 14px;
    cursor: default;
  }
}
</style>
