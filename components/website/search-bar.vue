<script>
export default {
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
        specialties: null,
      },
      selectedSpecialty: "", // New data property for selected specialty
    };
  },
  mounted() {
    this.filtersData.specialties = [
      { code: "cardiology", name: "Cardiología" },
      { code: "neurology", name: "Neurología" },
      { code: "orthopedics", name: "Ortopedia" },
    ];
    this.filtersData.disponibilidad = [
      { code: "cardiology", name: "Todos" },
      { code: "neurology", name: "Proximas semanas" },
      { code: "orthopedics", name: "Proximos meses" },
      { code: "orthopedics", name: "Proximos dias" },
    ];
  },
  methods: {
    searchResults() {
      this.$router.push({
        path: "/buscar",
        query: {
          ...(this.filtersData.procedimiento !== ""
            ? { filter_name: this.filtersData.procedimiento }
            : {}),
          ...(this.filtersData.lugar !== ""
            ? { lugar: this.filtersData.lugar }
            : {}),
          ...(this.filtersData.valoracion !== ""
          ? { lugar: this.filtersData.valoracion }
          : {}),
          ...(this.filtersData.disponibilidad !== ""
          ? { lugar: this.filtersData.disponibilidad }
          : {}),
          ...(this.filtersData.min !== ""
            ? { min_price: this.filtersData.min }
            : {}),
          ...(this.filtersData.max !== ""
            ? { max_price: this.filtersData.max }
            : {}),
          ...(this.filtersData.entity !== ""
            ? { entity_type: this.filtersData.entity }
            : {}),
          ...(this.selectedSpecialty
            ? { specialty: this.selectedSpecialty }
            : {}),
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
          <div class="col-md-5 form-group">
            <label for="especialidad" class="form-label text-uppercase">Especialidades</label>
            <select
              id="especialidad"
              class="form-select"
              v-model="selectedSpecialty"
              aria-describedby="especialidad-help"
            >
              <option value="" disabled>Buscar por especialidad</option>
              <option
                v-for="specialty in filtersData.specialties"
                :key="specialty.code"
                :value="specialty.code"
              >
                {{ specialty.name }}
              </option>
            </select>
          </div>
          <div class="col-md-5 form-group">
            <label for="procedimiento" class="form-label text-uppercase">Procedimiento</label>
            <input
              type="text"
              class="form-control"
              v-model="filtersData.procedimiento"
              id="procedimiento"
              placeholder="Operacion de cataratas"
              aria-describedby="procedimiento-help"
            />
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
        Entidad: {{ filtersData.entity === "doctor" ? "Doctor" : "Hospital" }}
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