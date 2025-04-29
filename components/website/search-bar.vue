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
  <div>
    <div class="card shadow border-0 rounded-4">
      <div class="card-body">
        <form
          class="row align-items-end justify-content-between"
          @submit.prevent="searchResults"
        >
          <!-- Specialties Dropdown - simplified since we don't need loading states -->
          <div class="col-md-5 form-group">
            <label for="especialidad" class="form-label text-uppercase"
              >Especialidades</label
            >
            <select
              id="especialidad"
              class="form-select"
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
          <div class="col-md-5 form-group position-relative">
            <label for="procedimiento" class="form-label text-uppercase"
              >Procedimiento</label
            >
            <div class="input-wrapper">
              <select
                id="procedimiento"
                class="form-select"
                v-model="filtersData.procedimiento"
                :disabled="
                  loadingProcedures ||
                  errorLoadingProcedures ||
                  !selectedSpecialty
                "
              >
                <option value="" disabled selected>
                  {{
                    selectedSpecialty
                      ? "Seleccione un procedimiento"
                      : "Primero seleccione una especialidad"
                  }}
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
                class="status-message"
                :class="{ 'text-danger': errorLoadingProcedures }"
              >
                <span v-if="loadingProcedures">Cargando...</span>
                <span v-else>Error al cargar</span>
              </div>
            </div>
          </div>

          <div class="form-group col-md-2">
            <button type="submit" class="btn btn-info px-4 w-100">
              <Icon name="fa6-solid:magnifying-glass" class="text-light" />
            </button>
          </div>
        </form>
      </div>
    </div>
    <div class="py-3 text-center">
      <button
        v-if="filtersData.entity"
        class="btn rounded-5 bg-white border-secondary-subtle shadow-sm mx-1 fw-light"
      >
        Entidad:
        {{ filtersData.entity === "doctor" ? "Doctor" : "Hospital" }}
      </button>
      <button
        v-if="filtersData.min"
        class="btn rounded-5 bg-white border-secondary-subtle shadow-sm mx-1 fw-light"
      >
        Precio mínimo: {{ filtersData.min }}
      </button>
      <button
        v-if="filtersData.max"
        class="btn rounded-5 bg-white border-secondary-subtle shadow-sm mx-1 fw-light"
      >
        Precio máximo: {{ filtersData.max }}
      </button>
      <WebsiteMasFiltrosModal :filters="filtersData" />
    </div>
  </div>
</template>

<style scoped>
.input-wrapper {
  position: relative;
}

.status-message {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.8rem;
  background: white;
  padding: 0 5px;
  color: #6c757d;
}

.form-select {
  padding-right: 90px;
}

.text-danger {
  color: #dc3545 !important;
}
</style>
