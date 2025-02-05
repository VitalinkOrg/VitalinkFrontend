<script>
import axios from "axios";

export default {
  data() {
    return {
      clinicas: [
        {
          id: 2000,
          entity_type: "doctor",
          name: "Clinica Santa Fe",
          review_score: 4.5,
          review_count: 23,
          specialty_name: ["Cardiology", "Pediatrics"],
          service_name: ["Consultation"],
          hospital_count: 3,
          min_price: 150.0,
        },
        {
          id: 2001,
          entity_type: "hospital",
          name: "Hospital General",
          review_score: 4.0,
          review_count: 45,
          specialty_name: ["Orthopedics", "Neurology"],
          service_name: ["Surgery"],
          hospital_count: 5,
          min_price: 200.0,
        },
        {
          id: 2002,
          entity_type: "doctor",
          name: "Dr. Ana Perez",
          review_score: 4.7,
          review_count: 30,
          specialty_name: ["Dermatology"],
          service_name: ["Skin Treatment"],
          hospital_count: 1,
          min_price: 100.0,
        },
      ],
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
      // this.clinicas = [];
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
            config.public.API_BASE_URL +
              "/patient_dashboard/search_doctors_hospitals",
            setup
          )
          .then((r) => {
            // this.clinicas = r.data.data;
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
              <div class="d-flex flex-column gap-2">
                <span class="fw-semibold fs-5">{{ filter_query }}</span>
                <span class="fw-medium text-muted" v-if="clinicas"
                  >{{ clinicas.length }} resultados</span
                >
              </div>
              
                <span class="d-flex align-items-center">
                  <div style="display: flex" class="px-5">
                    <div
                      style="display: flex"
                      class="btn rounded-5 bg-white border-secondary-subtle shadow-sm mx-1 fw-light"
                    >
                      <span class="text-nowrap">Ordenar por:</span>
                      <select
                        name="medicos-sort"
                        id="medicos-sort"
                        class="form-select form-select-sm border-0"
                      >
                        <option value="relevantes">Más Relevantes</option>
                        <option value="disponibilidad" selected>
                          Disponibilidad
                        </option>
                        <option value="precio-min">Precio más bajo</option>
                        <option value="precio-max">Precio más alto</option>
                      </select>
                    </div>
                    <div
                      class="form-check d-flex align-items-center justify-content-between gap-2 form-switch btn rounded-5 bg-white border-secondary-subtle shadow-sm mx-1 fw-light"
                    >
                      <input
                        class="form-check-reverse form-check-input m-0"
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
                </span>
              </div>
            </div>
          </div>

          <div class="row ">
            <div
              :class="{ 'col-sm-12': !isMapVisible, 'col-sm-8': isMapVisible }"
            >
              <div class="row">
                <div
                  class="col-md-4"
                  v-for="clinica in clinicas"
                  :key="clinica.id"
                >
                  <WebsiteClinicasListItem :clinica="clinica" />
                </div>
              </div>
            </div>
            <div class="col-md-4" v-show="isMapVisible">
              <AtomsMapaInteractivo />
            </div>
          </div>
        </section>
      </div>
    </main>
  </NuxtLayout>
</template>
