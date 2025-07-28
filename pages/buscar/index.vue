<script>
definePageMeta({
  middleware: ["auth-pacientes"],
});
import axios from "axios";

export default {
  data() {
    return {
      clinicas: [],
      specialties: [],
      procedures: [],
      isLoading: true,
      isSpecialtiesLoading: true,
      filter_query: this.$route.query.filter_name,
      insurance: this.$route.query.insurance,
      entity_type: this.$route.query.entity_type,
      min_price: this.$route.query.min_price,
      max_price: this.$route.query.max_price,
      specialty: this.$route.query.specialty,
      specialty_code: this.$route.query.specialty_code || "",
      procedure_code: this.$route.query.procedure_code || "",
      isMapVisible: false,
      config: {},
      token: "",
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
    };
  },
  computed: {
    currentProcedureName() {
      if (!this.procedure_code || !this.procedures.length) return null;
      const procedure = this.procedures.find(
        (p) => p.code === this.procedure_code
      );
      return procedure ? procedure.name : null;
    },

    currentSpecialtyName() {
      if (!this.specialty_code || !this.specialties.length) return null;
      const specialty = this.specialties.find(
        (s) => s.code === this.specialty_code
      );
      return specialty ? specialty.name : null;
    },

    searchDisplayText() {
      return this.currentProcedureName || this.currentSpecialtyName;
    },
  },
  watchQuery: [
    "filter_name",
    "insurance",
    "entity_type",
    "min_price",
    "max_price",
    "specialty",
    "specialty_code",
    "procedure_code",
    "min_stars",
    "lugar",
    "timestamp",
  ],
  watch: {
    "$route.query.min_stars": {
      handler(newVal) {
        this.min_stars = newVal;
        this.search();
      },
    },
    "$route.query.min_price": {
      handler(newVal) {
        this.min_price = newVal;
        this.search();
      },
    },
    "$route.query.max_price": {
      handler(newVal) {
        this.max_price = newVal;
        this.search();
      },
    },
    "$route.query.specialty_code": {
      handler(newVal) {
        this.specialty_code = newVal;
        // ✅ Cargar procedures cuando cambie specialty_code
        if (newVal) {
          this.loadProcedures(newVal);
        } else {
          this.procedures = []; // Limpiar procedures si no hay specialty
        }
        this.search();
      },
    },
    "$route.query.procedure_code": {
      handler(newVal) {
        this.procedure_code = newVal;
        this.search();
      },
    },
    "$route.query": {
      handler(newQuery, oldQuery) {
        this.initializeFiltersFromQuery();

        if (
          newQuery.specialty_code !== oldQuery?.specialty_code ||
          newQuery.procedure_code !== oldQuery?.procedure_code ||
          newQuery.timestamp !== oldQuery?.timestamp
        ) {
          this.search();
        }
      },
      deep: true,
    },
  },
  async created() {
    this.config = useRuntimeConfig();
    this.token = useCookie("token").value;

    this.filter_query = this.$route.query.filter_name || "";
    this.insurance = this.$route.query.insurance || "";
    this.entity_type = this.$route.query.entity_type || "";
    this.min_price = this.$route.query.min_price || "";
    this.max_price = this.$route.query.max_price || "";
    this.specialty = this.$route.query.specialty || "";
    this.min_stars = this.$route.query.min_stars || "";
    this.specialty_code = this.$route.query.specialty_code || "";
    this.procedure_code = this.$route.query.procedure_code || "";
    this.lugar = this.$route.query.lugar || "";

    await this.initializeFiltersFromQuery();

    await this.loadSpecialties();

    // ✅ Mejorado: Cargar procedures si hay specialty_code
    if (this.specialty_code) {
      await this.loadProcedures(this.specialty_code);
    }

    this.search();
  },
  methods: {
    async initializeFiltersFromQuery() {
      const query = this.$route.query;

      this.filtersData.procedimiento = query.procedure_code || "";
      this.filtersData.lugar = query.province || "";
      this.filtersData.valoracion = query.min_stars || "";
      this.filtersData.min = query.min_price || "";
      this.filtersData.max = query.max_price || "";
      this.filtersData.entity = query.entity_type || "";

      this.specialty_code = query.specialty_code || "";
      this.procedure_code = query.procedure_code || "";

      if (!this.filtersData.disponibilidad.length) {
        this.filtersData.disponibilidad = [
          { code: "all", name: "Todos" },
          { code: "weeks", name: "Proximas semanas" },
          { code: "months", name: "Proximos meses" },
          { code: "days", name: "Proximos dias" },
        ];
      }
    },

    async loadSpecialties() {
      this.isSpecialtiesLoading = true;
      try {
        const response = await axios.get(
          this.config.public.API_BASE_URL +
            "/udc/get_all?type=MEDICAL_SPECIALTY",
          {
            headers: { Authorization: useCookie("token").value },
          }
        );
        this.specialties = response.data.data.map((item) => ({
          code: item.code,
          name: item.name,
        }));
      } catch (error) {
        console.error("Error loading specialties:", error);
      } finally {
        this.isSpecialtiesLoading = false;
      }
    },

    async loadProcedures(specialtyCode) {
      if (!specialtyCode) {
        this.procedures = [];
        return;
      }

      try {
        const response = await axios.get(
          `${this.config.public.API_BASE_URL}/udc/get_all?father_code=${specialtyCode}&type=MEDICAL_PROCEDURE`,
          {
            headers: { Authorization: useCookie("token").value },
          }
        );

        if (response.data?.data) {
          this.procedures = response.data.data.map((item) => ({
            code: item.code,
            name: item.name,
          }));
        } else {
          this.procedures = [];
        }
      } catch (error) {
        console.error("Error loading procedures:", error);
        this.procedures = [];
      }
    },

    async search() {
      this.isLoading = true;
      this.clinicas = [];

      const params = {};

      if (this.filter_query) params.filter_name = this.filter_query;
      if (this.procedure_code) params.procedure_code = this.procedure_code;
      if (this.min_stars) params.min_stars = this.min_stars;
      if (this.min_price) params.min_price = this.min_price;
      if (this.max_price) params.max_price = this.max_price;
      if (this.lugar) params.lugar = this.lugar;
      if (this.specialty_code) params.specialty_code = this.specialty_code;

      const setup = {
        params,
        headers: { Authorization: useCookie("token").value },
      };

      try {
        const response = await axios.get(
          this.config.public.API_BASE_URL + "/supplier/get_all_main",
          setup
        );
        this.clinicas = response.data.data;
      } catch (e) {
        console.error("❌ Error en búsqueda:", e);
      } finally {
        this.isLoading = false;
      }
    },

    onFiltersChange(newFilters) {
      this.filtersData = { ...this.filtersData, ...newFilters };

      const newQuery = {
        ...this.$route.query,
        ...(this.filtersData.procedimiento && {
          procedure_code: this.filtersData.procedimiento,
        }),
        ...(this.filtersData.lugar && { province: this.filtersData.lugar }),
        ...(this.filtersData.valoracion && {
          min_stars: this.filtersData.valoracion,
        }),
        ...(this.filtersData.min && { min_price: this.filtersData.min }),
        ...(this.filtersData.max && { max_price: this.filtersData.max }),
        ...(this.filtersData.entity && {
          entity_type: this.filtersData.entity,
        }),
      };

      this.$router.push({
        path: "/buscar",
        query: newQuery,
      });
    },
  },
};
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
