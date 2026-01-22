<script>
export default {
  props: {
    hospital: {
      type: Object,
      default: [],
    },
  },
  data() {
    return {
      tab: 1,
      appointment: {
        specialty: "",
        service: "",
        location: this.hospital.servicesResult[0].hospital_name,
        type: "",
        date: "",
        time: "",
      },
      result: null,
      open: false,
      errorText: "",
    };
  },
  methods: {
    search() {
      let filter = this.hospital.servicesResult;

      filter = filter.filter((item) => {
        return (
          item.specialty === this.appointment.specialty &&
          item.service === this.appointment.service &&
          item.hospital_name === this.appointment.location &&
          item.cpt === this.appointment.type
        );
      });
      if (!filter[0].schedule) {
        this.errorText = "No hay disponibilidad para esta cita";
      } else {
        this.errorText = "";
      }
      return (this.result = filter[0]);
    },
    openConfirmationModal() {
      const authenticated = useCookie("authenticated");
      if (authenticated.value) {
        this.open = true;
      } else {
        this.$router.push("/auth/login");
      }
    },
    closeModal() {
      this.open = false;
    },
  },
};
</script>

<template>
  <ul class="nav nav-underline d-flex flex-row w-100">
    <li class="nav-item">
      <button
        class="nav-link"
        :class="tab === 1 ? 'active' : ''"
        @click="tab = 1"
      >
        Disponibilidad
      </button>
    </li>
    <li class="nav-item">
      <button
        class="nav-link"
        :class="tab === 2 ? 'active' : ''"
        @click="tab = 2"
      >
        Servicios
      </button>
    </li>
    <li class="nav-item">
      <button
        class="nav-link"
        :class="tab === 3 ? 'active' : ''"
        @click="tab = 3"
      >
        Ubicación
      </button>
    </li>
    <!-- <li class="nav-item">
      <button
        class="nav-link"
        :class="tab === 4 ? 'active' : ''"
        @click="tab = 4"
      >
        Galería de fotos
      </button>
    </li> -->
    <li class="nav-item">
      <button
        class="nav-link"
        :class="tab === 5 ? 'active' : ''"
        @click="tab = 5"
      >
        Reseñas
      </button>
    </li>
    <li class="nav-item">
      <button
        class="nav-link"
        :class="tab === 6 ? 'active' : ''"
        @click="tab = 6"
      >
        Perfil
      </button>
    </li>
  </ul>

  <section class="py-4 px-1">
    <!-- Dsiponibilidad  -->
    <div v-if="tab === 1">
      <p class="fw-semibold">Reserva una cita</p>

      <div
        class="bg-primary rounded-4 h-100 p-4 mb-3"
        style="--bs-bg-opacity: 0.04"
      >
        <form @submit.prevent="search">
          <div class="row row-cols-sm-2 mb-3">
            <div class="form-group">
              <label for="especialidad" class="form-label">Especialidad</label>
              <select
                class="form-select"
                v-model="appointment.specialty"
                required
              >
                <option
                  v-for="service in hospital.servicesResult"
                  :key="service.hospital_service_id"
                  :value="service.specialty"
                >
                  {{ service.hospital_service_id + " " + service.specialty }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="procedimiento" class="form-label"
                >Procedimiento</label
              >
              <select
                name="procedimiento"
                id="procedimiento"
                class="form-select"
                v-model="appointment.service"
                required
              >
                <option
                  v-for="service in hospital.servicesResult"
                  :key="service.hospital_service_id"
                  :value="service.service"
                >
                  {{ service.hospital_service_id + " " + service.service }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="lugar" class="form-label">Lugar</label>
              <select
                name="lugar"
                id="lugar"
                class="form-select"
                v-model="appointment.location"
              >
                <option
                  :value="hospital.servicesResult[0].hospital_name"
                  disabled
                  selected
                >
                  {{ hospital.servicesResult[0].hospital_name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="tipodecita" class="form-label">Tipo de cita</label>
              <select
                name="tipodecita"
                id="tipodecita"
                class="form-select"
                v-model="appointment.type"
              >
                <option
                  v-for="service in hospital.servicesResult"
                  :key="service.hospital_service_id"
                  :value="service.cpt"
                >
                  {{ service.hospital_service_id + " " + service.cpt }}
                </option>
              </select>
            </div>
          </div>

          <div class="d-flex justify-content-end">
            <button type="submit" class="btn btn-outline-primary rounded-4">
              <AtomsIconsActualizarIcon /> Actualizar Búsqueda
            </button>
          </div>
        </form>
        <hr />

        <div
          v-if="result"
          class="d-flex align-items-center justify-content-between"
        >
          <div>
            <div class="btn btn-outline-primary rounded-5">
              Váucher: <strong>Ninguno</strong>
            </div>
            <button class="btn text-primary"><AtomsIconsPlusIcon /></button>
          </div>
          <div class="d-flex flex-column">
            <span class="fs-6">Precio final del servicio:</span>
            <span class="fs-5 fw-semibold"
              >{{ parseFloat(result.price).toLocaleString() }}
              {{ result.currency }}</span
            >
            <!-- <small class="text-muted"
              >Precio original
              <span class="text-decoration-line-through"
                >₡33000 CRC</span
              ></small
            > -->
          </div>
        </div>
      </div>

      <div v-if="result && result.schedule">
        <form @submit.prevent="openConfirmationModal">
          <span class="fw-semibold">Resultados de la Disponibilidad:</span>
          <div class="my-2 row align-items-center justify-content-between">
            <div class="col-md-8 row gap-2 align-items-center">
              <div
                class="col-auto btn rounded-5 btn-outline-success btn-sm me-1"
              >
                <small>
                  {{ this.appointment.specialty }}
                </small>
              </div>
              <div
                class="col-auto btn rounded-5 btn-outline-success btn-sm me-1"
              >
                <small>
                  {{ this.appointment.service }}
                </small>
              </div>
              <div
                class="col-auto btn rounded-5 btn-outline-success btn-sm me-1"
              >
                <small>
                  {{ this.appointment.location }}
                </small>
              </div>
              <div
                class="col-auto btn rounded-5 btn-outline-success btn-sm me-1"
              >
                <small>
                  {{ this.appointment.type }}
                </small>
              </div>
            </div>
          </div>

          <div
            class="bg-primary rounded-4 h-100 p-4"
            style="--bs-bg-opacity: 0.04"
          >
            <div class="row row-cols-2">
              <div class="form-group mb-3">
                <label for="fecha" class="form-label"
                  >Seleccione una fecha</label
                >
                <input
                  type="date"
                  name="fecha"
                  id="fecha"
                  class="form-control"
                  v-model="appointment.date"
                  required
                />
              </div>
              <div class="form-group mb-3">
                <label for="hora" class="form-label">Seleccione la Hora</label>
                <input
                  type="time"
                  id="hora"
                  name="hora"
                  :min="result.schedule[0].open + ':00'"
                  :max="result.schedule[0].close + ':00'"
                  class="form-control"
                  v-model="appointment.time"
                  required
                />
              </div>
            </div>
          </div>
          <div class="text-end pt-4">
            <button type="submit" class="btn btn-primary btn-lg">
              Reservar Cita
            </button>
          </div>
        </form>
        <WebsiteConfirmationCitaModal
          :open="open"
          :appointment="appointment"
          :result="result"
          @close-modal="closeModal"
        />
      </div>
      <div v-else>
        <p>{{ errorText }}</p>
      </div>
    </div>
    <!-- Servicios  -->
    <MedicosServicios :services="hospital.servicesResult" v-if="tab === 2" />
    <!-- Ubicacion -->
    <div v-if="tab === 3">
      <div class="row gap-2">
        <div class="col-md-3">
          <p class="fw-semibold">Encuentranos Facilmente</p>
          <p class="d-flex">
            <span class="fs-4 text-success me-2"
              ><AtomsIconsMapPointerIcon
            /></span>
            <span class="fw-light">{{
              hospital.hospital_information.address +
              ", " +
              hospital.hospital_information.city +
              ", " +
              hospital.hospital_information.country_iso_code
            }}</span>
          </p>
          <div>
            <a
              :href="`tel:${hospital.hospital_information.phone_number}`"
              class="btn btn-info rounded-4 text-white me-2 py-1 px-2"
            >
              <span class="fs-5"><AtomsIconsPhoneIcon /></span>
            </a>
            <a
              :href="`mailto:${hospital.hospital_information.email}`"
              class="btn btn-info rounded-4 text-white py-1 px-2"
            >
              <span class="fs-5"><AtomsIconsMailIcon /></span>
            </a>
          </div>
        </div>
        <div class="col">
          <AtomsMapaInteractivo />
        </div>
      </div>
    </div>
    <!-- Galeria  -->
    <div v-if="tab === 4">
      <div class="row row-cols-md-3">
        <div class="col">
          <img
            src="@/src/assets/img-perfil-galeria-item.png"
            alt=""
            class="img-fluid"
          />
        </div>
        <div class="col">
          <img
            src="@/src/assets/img-perfil-galeria-item.png"
            alt=""
            class="img-fluid"
          />
        </div>
        <div class="col">
          <img
            src="@/src/assets/img-perfil-galeria-item.png"
            alt=""
            class="img-fluid"
          />
        </div>
      </div>

      <nav
        aria-label="gallery pagination"
        class="d-flex justify-content-end pt-4"
      >
        <ul class="pagination">
          <li class="page-item">
            <a class="page-link" href="#"><AtomsIconsArrowLeftIcon /></a>
          </li>
          <li class="page-item">
            <a class="page-link active" href="#"
              ><AtomsIconsArrowRightIcon
            /></a>
          </li>
        </ul>
      </nav>
    </div>
    <!-- Reseñas  -->
    <div v-if="tab === 5">
      <div class="card mb-4 rounded-4">
        <div class="card-body">
          <div class="row gap-2">
            <div class="col-md-6 border-end">
              <p
                class="fw-semibold d-flex align-items-center justify-content-between"
              >
                Reseñas logradas
                <small class="text-muted"
                  >5.0
                  <span class="fw-light"
                    >({{ hospital.reviews.length }} Opiniones)</span
                  ></small
                >
              </p>
              <div class="d-flex justify-content-between fw-light text-muted">
                Calidad de atención
                <span class="text-warning">
                  <AtomsIconsStarFilled v-for="i in 5" :key="i.length" />
                </span>
              </div>
              <div class="d-flex justify-content-between fw-light text-muted">
                Limpieza de instalaciones
                <span class="text-warning"
                  ><AtomsIconsStarOutline /> <AtomsIconsStarFilled />
                  <AtomsIconsStarFilled /> <AtomsIconsStarFilled />
                  <AtomsIconsStarFilled
                /></span>
              </div>
              <div class="d-flex justify-content-between fw-light text-muted">
                Amabilidad del Staff
                <span class="text-warning"
                  ><AtomsIconsStarFilled /> <AtomsIconsStarFilled />
                  <AtomsIconsStarFilled /> <AtomsIconsStarFilled />
                  <AtomsIconsStarFilled
                /></span>
              </div>
              <div class="d-flex justify-content-between fw-light text-muted">
                Relacion Precio/Calidad
                <span class="text-warning"
                  ><AtomsIconsStarOutline /> <AtomsIconsStarFilled />
                  <AtomsIconsStarFilled /> <AtomsIconsStarFilled />
                  <AtomsIconsStarFilled
                /></span>
              </div>
            </div>
            <div class="col-md-6">
              <p class="fw-semibold">Servicios Destacados</p>
              <div>
                <span class="btn btn-outline-info rounded-5 btn-sm mb-2 me-2"
                  >Profesional</span
                >
                <span class="btn btn-outline-info rounded-5 btn-sm mb-2 me-2"
                  >Enfermeros</span
                >
                <span class="btn btn-outline-info rounded-5 btn-sm mb-2 me-2"
                  >Váucher</span
                >
                <span class="btn btn-outline-info rounded-5 btn-sm mb-2 me-2"
                  >Oftalmólogo</span
                >
                <span class="btn btn-outline-info rounded-5 btn-sm mb-2 me-2"
                  >Médicos</span
                >
                <span class="btn btn-outline-info rounded-5 btn-sm mb-2 me-2"
                  >Buen trato</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row row-cols-3">
        <div
          class="col"
          v-for="review in hospital.reviews"
          :key="review.length"
        >
          <div class="card rounded-4 shadow-sm border-none">
            <div class="card-body">
              <div class="text-warning">
                <AtomsIconsStarFilled /><AtomsIconsStarFilled /><AtomsIconsStarFilled /><AtomsIconsStarFilled /><AtomsIconsStarFilled />
              </div>
              <p class="fst-italic my-3">
                {{ review.reply }}
              </p>
              <p v-if="review.first_name" class="text-primary fw-semibold m-0">
                {{ review.first_name + " " + review.last_name }}
              </p>
              <p v-if="review.message" class="text-muted m-0">
                {{ review.message }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Perfil  -->
    <div v-if="tab === 6">
      <div>
        <h5>Nuestra historia</h5>
        <p>{{ hospital.hospital_information.our_history }}</p>
      </div>
      <div>
        <h5>Visión</h5>
        <p>{{ hospital.hospital_information.vision }}</p>
      </div>
      <div>
        <h5>Misión</h5>
        <p>{{ hospital.hospital_information.mission }}</p>
      </div>
    </div>
  </section>
</template>
