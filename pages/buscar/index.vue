<script>
import axios from "axios";

export default {
  data() {
    return {
      clinicas: [],
      isLoading: true,
      filter_query: this.$route.query.filter_name,
      insurance: this.$route.query.insurance,
      entity_type: this.$route.query.entity_type,
      min_price: this.$route.query.min_price,
      max_price: this.$route.query.max_price,
      specialty: this.$route.query.specialty,
      isMapVisible: false,
    };
  },
  watchQuery: true,
  watch: {
    "$route.query.filter_name": {
      handler(oldUrl) {
        this.filter_query = oldUrl;
        this.search();
      },
    },
    "$route.query.insurance": {
      handler(oldUrl) {
        this.insurance = oldUrl;
        this.search();
      },
    },
    "$route.query.entity_type": {
      handler(oldUrl) {
        this.entity_type = oldUrl;
        this.search();
      },
    },
    "$route.query.specialty": {
      handler(oldUrl) {
        this.specialty = oldUrl;
        this.search();
      },
    },
  },
  created() {
    this.search();
  },
  methods: {
    async search() {
      this.isLoading = true;
      this.clinicas = [];
      const setup = {
        params: {
          ...(this.filter_query !== ""
            ? { filter_name: this.filter_query }
            : {}),
          ...(this.insurance !== "" ? { insurance: this.insurance } : {}),
          ...(this.entity_type !== "" ? { entity_type: this.entity_type } : {}),
          ...(this.min_price !== "" ? { min_price: this.min_price } : {}),
          ...(this.max_price !== "" ? { max_price: this.max_price } : {}),
          ...(this.specialty !== "" ? { specialty: this.specialty } : {}),
        },
      };
      try {
        await axios
          .get(
            "https://stg.vitalink.cr" +
              "/patient_dashboard/search_doctors_hospitals",
            setup,
          )
          .then((r) => {
            this.clinicas = r.data.data;
            this.isLoading = false;
          });
      } catch (e) {
        this.isLoading = false;
      }
    },
  },
};
</script>

<template>
  <NuxtLayout name="web">
    <main class="bg-light">
      <section class="bg-primary mb-4" style="--bs-bg-opacity: 0.03">
        <div class="container">
          <div class="row pt-5 pb-3">
            <div class="col-sm-11 mx-auto">
              <h1 class="text-sm-center h3 mb-4 fw-medium">
                ¿Qué servicio médico estás buscando?
              </h1>
              <WebsiteSearchBar />
            </div>
          </div>
        </div>
      </section>
      <div v-if="isLoading">Loading clinicas...</div>
      <div v-else class="container-fluid px-5">
        <section class="pb-5">
          <div class="row">
            <div class="col-md-12">
              <div
                class="d-flex align-items-center justify-content-between mb-3"
              >
                <span class="fw-medium ms-2" v-if="clinicas"
                  >{{ clinicas.length }} Médicos y Hospitales disponibles</span
                >
                <span class="d-flex align-items-center">
                  <div style="display: flex" class="px-5">
                    <div class="form-check form-switch">
                      <input
                        class="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="flexSwitchCheckDefault"
                        v-model="isMapVisible"
                      />
                      <label
                        class="form-check-label"
                        for="flexSwitchCheckDefault"
                        >Mostrar mapa</label
                      >
                    </div>
                  </div>

                  <div style="display: flex">
                    <span class="text-nowrap">Ordenar por:</span>
                    <select
                      name="medicos-sort"
                      id="medicos-sort"
                      class="form-select form-select-sm border-0"
                    >
                      <option value="recomendados">Recomendados</option>
                      <option value="valoraciones">Valoraciones</option>
                      <option value="disponibilidad" selected>
                        Disponibilidad inmediata
                      </option>
                      <option value="cercania">Mayor cercanía</option>
                    </select>
                  </div>
                </span>
              </div>
            </div>
          </div>

          <div class="row">
            <div
              :class="{ 'col-sm-12': !isMapVisible, 'col-sm-6': isMapVisible }"
            >
              <WebsiteClinicasListItem
                v-for="clinica in clinicas"
                :key="clinica.id"
                :clinica="clinica"
              />
            </div>
            <div class="col-md-6" v-show="isMapVisible">
              <AtomsMapaInteractivo />
            </div>
          </div>
        </section>
      </div>
    </main>
  </NuxtLayout>
</template>
