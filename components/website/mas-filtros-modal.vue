<script>
import axios from "axios";
import { onMounted, ref } from "vue";

export default {
  props: {
    filters: {
      type: Object,
      default: undefined,
    },
    clearFilters: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      open: false,
      specialties: [],
      rating: ref(0),
      place: ref(""),
      autocomplete: null,
    };
  },
  mounted() {
    this.getSpecialties();
    this.initAutocomplete();
  },
  watch: {
    place(newVal) {
      this.filters.lugar = newVal;
    },
    rating(newVal) {
      this.filters.valoracion = newVal;
    },
  },
  methods: {
    openConfirmationModal() {
      this.open = true;
    },
    searchFilters() {
      this.open = false;
    },
    async getSpecialties() {
      try {
        const config = useRuntimeConfig();
        const token = useCookie("token");

        const authHeader = token.value
          ? { Authorization: token.value }
          : undefined;

        const response = await axios.get(
          config.public.API_BASE_URL + "/specialties",
          {
            headers: authHeader,
          }
        );

        this.specialties = response.data.data;
      } catch (e) {
        console.error("Error fetching specialties:", e);
      }
    },
    initAutocomplete() {
      onMounted(() => {
        const input = document.getElementById("placeInput");
        this.autocomplete = new google.maps.places.Autocomplete(input, {
          fields: ["address_components", "geometry"],
        });

        this.autocomplete.addListener("place_changed", () => {
          const place = this.autocomplete.getPlace();
          if (place.geometry) {
            this.place = place.formatted_address || input.value;
          } else {
            this.place = input.value;
          }
        });
      });
    },
    setRating(value) {
      this.rating = value;
    },
  },
};
</script>

<template>
  <button @click="openConfirmationModal" class="filter-trigger">
    <AtomsIconsListFilterIcon size="20" />
    Más Filtros
  </button>

  <div
    class="modal fade"
    :class="open ? 'show' : ''"
    id="exampleModal"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content text-start">
        <div class="modal-header border-bottom align-items-center d-flex">
          <h1
            class="modal-title fs-5 fw-semibold ms-2 mt-2"
            id="exampleModalLabel"
          >
            Filtros
          </h1>
          <button
            type="button"
            class="btn-close btn btn-light me-2"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="open = false"
          ></button>
        </div>
        <form @submit.prevent="searchFilters">
          <div class="modal-body">
            <div class="rounded-4 h-100 p-4" style="--bs-bg-opacity: 0.04">
              <div class="d-flex flex-column gap-2 mb-3">
                <div class="d-flex gap-2 align-items-center">
                  <label class="form-label m-0 w-25">Valoraciones</label>
                  <div class="w-100">
                    <span
                      v-for="n in 5"
                      :key="n"
                      @click="setRating(n)"
                      style="cursor: pointer"
                    >
                      <Icon
                        :name="
                          n <= rating ? 'fa6-solid:star' : 'fa6-regular:star'
                        "
                        class="text-warning"
                      />
                    </span>
                  </div>
                </div>
                <div class="d-flex gap-2 align-items-center">
                  <label for="placeInput" class="form-label m-0 w-25"
                    >Lugar</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="placeInput"
                    v-model="place"
                    placeholder="Ciudad o provincia"
                  />
                </div>
                <div class="d-flex gap-2 align-items-center">
                  <label for="disponibilidad" class="form-label m-0 w-25"
                    >Disponibilidad de citas</label
                  >
                  <select
                    id="disponibilidad"
                    class="form-select"
                    v-model="selectedSpecialty"
                    aria-describedby="especialidad-help"
                  >
                    <option value="" disabled selected>
                      Buscar por especialidad
                    </option>
                    <option
                      v-for="specialty in filters.disponibilidad"
                      :key="specialty.code"
                      :value="specialty.code"
                    >
                      {{ specialty.name }}
                    </option>
                  </select>
                </div>
              </div>
              <hr />

              <div>
                <label class="form-label fs-6">Rango de precios</label>
                <label class="text-secondary">
                  Agregue un precio mínimo y un precio máximo por el que esté
                  dispuesto a pagar el servicio
                </label>
                <div class="row my-2">
                  <div class="form-group mb-2 col">
                    <input
                      type="number"
                      class="form-control"
                      placeholder="Mínimo"
                      id="min"
                      v-model="filters.min"
                    />
                  </div>
                  <div class="col-1 text-center">-</div>
                  <div class="form-group mb-2 col">
                    <input
                      type="number"
                      class="form-control"
                      placeholder="Máximo"
                      id="max"
                      v-model="filters.max"
                    />
                  </div>
                </div>
                <hr />
                <label class="fw-light fs-6">Servicios Integrales</label>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="entityType"
                    id="entityType1"
                    value="hospital"
                    v-model="filters.entity"
                  />
                  <label class="form-check-label" for="entityType1">
                    Por Hospitales que cubran ese procedimiento y la sala de
                    cirugía
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="entityType"
                    id="entityType2"
                    value="doctor"
                    v-model="filters.entity"
                  />
                  <label class="form-check-label" for="entityType2">
                    Por médico o especialista que cubran el procedimiento
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="entityType"
                    id="entityType3"
                    value=""
                    v-model="filters.entity"
                  />
                  <label class="form-check-label" for="entityType3">
                    Todas las opciones
                  </label>
                </div>
                <hr />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <div class="col">
              <button
                type="button"
                class="btn btn-white border w-100"
                data-bs-dismiss="modal"
              >
                Cancelar
              </button>
            </div>
            <div class="col">
              <button type="submit" class="btn btn-primary w-100">
                Confirmar
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filter-trigger {
  @include button-base;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #374151;
  border-radius: 105.02px;
  padding: 8.4px 16.8px;
  background-color: #ffffff;
  border: 1.05px solid #e5e7eb;
}

.show {
  display: block;
  background-color: rgba(0, 0, 0, 0.1);
}

.stepper {
  &-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 2rem;

    &-icon {
      font-size: 2rem;
    }
  }
}
</style>
