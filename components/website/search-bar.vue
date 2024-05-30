<script>
export default {
  data() {
    return {
      filtersData: {
        procedimiento: "",
        lugar: "",
        vaucher: "",
        entity: "",
        min: "",
        max: "",
        specialties: null,
      },
    };
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
          ...(this.filtersData.vaucher !== ""
            ? { insurance: this.filtersData.vaucher }
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
            ...(this.filtersData.specialties
            ? { specialty: this.filtersData.specialties.code }
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
        <form class="row align-items-end justify-content-between" @submit.prevent="searchResults">
          <!-- <form class="d-flex align-items-end" action="/buscar/wovnworv"> -->
            <div class="col-md-3 form-group">
              <label for="procedimiento" class="form-label text-uppercase"
                >Procedimiento</label
              >
              <input
                type="text"
                class="form-control"
                v-model="filtersData.procedimiento"
                id="procedimiento"
                placeholder="Operacion de cataratas"
                aria-describedby="procedimiento-help"
              />
              <!-- <div id="procedimiento-help" class="form-text ">We'll never share your email with anyone else.</div> -->
            </div>
            <div class="col-md-3 form-group">
              <label for="lugar" class="form-label">Lugar</label>
              <input
                type="text"
                class="form-control"
                v-model="lugar"
                id="lugar"
                aria-describedby="lugar-help"
                placeholder="Costa Rica"
              />
              <!-- <div id="lugar-help" class="form-text ">We'll never share your email with anyone else.</div> -->
            </div>
            <div class="col-md-3 form-group">
              <label for="vaucher" class="form-label">Código de Vaucher</label>
              <input
                type="text"
                class="form-control"
                v-model="vaucher"
                id="vaucher"
                aria-describedby="vaucher-help"
                placeholder="Código de Vaucher"
              />
              <!-- <div id="vaucher-help" class="form-text ">We'll never share your email with anyone else.</div> -->
            </div>
          <div class="form-group col-md-2">
            <button type="submit" class="btn btn-warning px-4 w-100">Buscar</button>
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
      <button
        v-if="filtersData.specialties"
        class="btn rounded-5 bg-white border-secondary-subtle shadow-sm mx-1 fw-light"
      >
        Especialidades: {{ filtersData.specialties.name }}
        <!-- <span v-for="specialty in filtersData.specialties" :key="specialty.id">
          {{ specialty.name + " " }}</span
        > -->
      </button>
      <WebsiteMasFiltrosModal :filters="filtersData" />
    </div>
    <WebsiteSolicitarVaucher />
  </div>
</template>
