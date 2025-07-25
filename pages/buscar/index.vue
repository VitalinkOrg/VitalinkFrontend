<script>
definePageMeta({
  middleware: ["auth-pacientes"],
});
import axios from "axios";

export default {
  data() {
    return {
      clinicas: [],
      specialties: [], // Add specialties data
      isLoading: true,
      isSpecialtiesLoading: true, // Add loading state for specialties
      filter_query: this.$route.query.filter_name,
      insurance: this.$route.query.insurance,
      entity_type: this.$route.query.entity_type,
      min_price: this.$route.query.min_price,
      max_price: this.$route.query.max_price,
      specialty: this.$route.query.specialty,
      isMapVisible: false,
      config: {}, // Will store runtime config
      token: "", // Will store token
    };
  },
  watchQuery: [
    "filter_name",
    "insurance",
    "entity_type",
    "min_price",
    "max_price",
    "specialty",
    "min_stars",
    "lugar",
  ],
  watch: {
    "$route.query.min_stars": {
      handler(oldUrl) {
        this.min_starts = oldUrl;
        this.search();
      },
    },
    "$route.query.min_price": {
      handler(oldUrl) {
        this.min_price = oldUrl;
        this.search();
      },
    },
    "$route.query.max_price": {
      handler(oldUrl) {
        this.max_price = oldUrl;
        this.search();
      },
    },
  },
  async created() {
    this.config = useRuntimeConfig();
    this.token = useCookie("token").value;

    // Set initial values from route query
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

    await this.loadSpecialties();
    this.search();
  },
  methods: {
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
    async search() {
      this.isLoading = true;
      this.clinicas = [];

      // Create a clean params object
      const params = {};

      // Only add parameters that have values
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
        console.error("Search error:", e);
      } finally {
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
              <WebsiteSearchBar
                :specialties="specialties"
                :loading="isSpecialtiesLoading"
              />
            </div>
          </div>
        </div>
      </section>
      <WebsitePerfilDoctorPantallaCarga v-if="isLoading" />
      <div v-else class="container-fluid px-5">
        <section class="pb-5">
          <div class="row">
            <div class="col-md-12">
              <div
                class="d-flex align-items-center justify-content-between mb-3"
              >
                <div class="d-flex flex-column gap-2">
                  <span class="fw-semibold fs-5">{{ filter_query }}</span>
                  <span class="fw-medium text-muted" v-if="clinicas">
                    {{ clinicas.length }} resultados
                  </span>
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

          <div class="row">
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
