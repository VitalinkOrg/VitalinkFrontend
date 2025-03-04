<script>
import { useCookie } from "nuxt/app";
import { ref } from "vue";

export default {
  props: {
    doctor: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      panel: false,
      tab: 1,
      appointment: {
        specialty: "",
        service: "",
        location: "",
        type: "",
        date: "",
        time: "",
      },
      result: null,
      open: false,
      errorText: "",
      doctorReviews: [
        {
          first_name: "John",
          last_name: "Doe",
          message:
            "La cirugía de cataratas ha transformado mi vida visual por completo; el procedimiento rápido y preciso me permitió recuperar una claridad visual asombrosa, devolviéndome la independencia y la nitidez que había perdido.",
          pacient_type: "Paciente de Cirugía de Cataratas",
          score: 5,
        },
        {
          first_name: "Jane",
          last_name: "Smith",
          message:
            "El proceso fue indoloro, y ahora veo el mundo con una claridad que pensé que nunca recuperaría, agradecido por esta intervención que ha cambiado mi perspectiva de la vida.",
          pacient_type: "Paciente de Cirugía de Cataratas",
          score: 4,
        },
        {
          first_name: "Alice",
          last_name: "Johnson",
          message:
            "La precisión del procedimiento y la rápida recuperación me dejaron asombrado, brindándome una nueva visión sin las limitaciones que las cataratas habían impuesto previamente.",
          pacient_type: "Paciente de Cirugía de Cataratas",
          score: 5,
        },
      ],
      doctorHistory:
        "Desde su fundación en 1985, la Clínica Oftalmológica Santa Lucía ha sido un faro de excelencia en la atención visual. Inspirados por la misión de proporcionar cuidado ocular de calidad, comenzamos como una pequeña clínica con un compromiso inquebrantable con la salud visual. Con el tiempo, hemos crecido y evolucionado, incorporando las últimas tecnologías y atrayendo a un equipo de oftalmólogos altamente especializados. La historia de Santa Lucía es la narrativa de décadas dedicadas a mejorar la visión y transformar vidas a través de un enfoque centrado en el paciente.",
      doctorVision:
        "En la Clínica Oftalmológica Santa Lucía, visualizamos un futuro donde cada individuo experimente una visión óptima y una calidad de vida mejorada. Nos esforzamos por ser líderes en innovación oftalmológica, introduciendo tecnologías avanzadas y prácticas médicas progresistas. Aspiramos a expandir nuestro alcance, brindando atención oftalmológica accesible y de calidad a comunidades en todo el país. Nuestra visión es ser reconocidos como el referente en excelencia oftalmológica, marcando el camino hacia un mundo donde la visión es valorada, protegida y optimizada.",
      doctorMision:
        "La misión de la Clínica Oftalmológica Santa Lucía es simple pero profunda: brindar atención oftalmológica compasiva y de vanguardia para preservar y mejorar la salud visual de nuestros pacientes. Nos comprometemos a ofrecer diagnósticos precisos, tratamientos efectivos y cirugías oftalmológicas de alta calidad. Buscamos educar y empoderar a nuestros pacientes, fomentando un viaje hacia la claridad visual y el bienestar ocular. Nuestra misión se extiende más allá de la consulta, aspirando a ser un faro de ",
      breadcumCitaValoracion: 1,
      selectedMonth: null,
      selectedDay: null,
      selectedHour: null,
      availableDays: [],
      availableHours: [],
      availability: {
        "2025-02-10": ["09:00", "10:00", "11:00", "14:00"],
        "2025-02-11": ["10:30", "12:00", "15:00"],
        "2025-02-12": ["08:00", "09:30", "11:00", "13:00", "16:00"],
      },
      months: [
        { value: 0, label: "Enero" },
        { value: 1, label: "Febrero" },
        { value: 2, label: "Marzo" },
        { value: 3, label: "Abril" },
        { value: 4, label: "Mayo" },
        { value: 5, label: "Junio" },
        { value: 6, label: "Julio" },
        { value: 7, label: "Agosto" },
        { value: 8, label: "Septiembre" },
        { value: 9, label: "Octubre" },
        { value: 10, label: "Noviembre" },
        { value: 11, label: "Diciembre" },
      ],
      dates: Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        return {
          date: date.toISOString().split("T")[0],
          day: date
            .toLocaleDateString("es-ES", { weekday: "short" })
            .slice(0, 3),
          number: date.getDate(),
        };
      }),
    };
  },
  computed: {
    availableHours() {
      return this.availability[this.selectedDay] || [];
    },
    formattedSelectedMonth() {
      return this.selectedMonth !== null ? this.selectedMonth + 1 : null;
    },
  },
  methods : {
    search() {
      let filter = this.doctor.servicesResult;

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
    selectDay(date) {
      this.selectedDay = date;
      this.selectedDate = date; // Ensure selectedDate is updated
      this.availableHours = this.availability[date] || [];
    },
    handleMonthChange() {
      this.selectedDay = null;
      this.selectedHour = null;
      this.availableDays = this.getAvailableDaysForMonth(this.selectedMonth);
    },
    getAvailableDaysForMonth(month) {
      const year = new Date().getFullYear();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const availableDays = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = date.toISOString().split("T")[0];
        if (this.availability[dateString]) {
          availableDays.push({
            date: dateString,
            day: date
              .toLocaleDateString("es-ES", { weekday: "short" })
              .slice(0, 3),
            number: date.getDate(),
          });
        }
      }

      return availableDays;
    },
    formatTime(time) {
      const [hours, minutes] = time.split(":");
      const period = hours >= 12 ? "PM" : "AM";
      return `${hours % 12 || 12}:${minutes}${period}`;
    },
    openConfirmationModal() {
      const authenticated = useCookie("authenticated");
      if (authenticated.value) {
        this.open = true;
      } else {
        this.$router.push("/pacientes/login");
      }
    },
    closeModal() {
      this.open = false;
    },
    reserveAppointment() {
      if (this.panel) { // Simplificado
        this.panel = false;
        return; // Salir de la función
      }
  
      console.log(
          "Reserving appointment at",
          this.selectedDate,
          this.selectedHour
        );
  
      this.panel = true;
    },
  },
};
</script>

<template>
  <ul class="nav nav-underline d-flex flex-row w-100">
    <li class="nav-item">
      <button
        class="nav-link info"
        :class="{ active: tab === 1 }"
        @click="tab = 1"
      >
        Servicios
      </button>
    </li>
    <li class="nav-item">
      <button
        class="nav-link info"
        :class="{ active: tab === 2 }"
        @click="tab = 2"
      >
        Disponibilidad
      </button>
    </li>
    <li class="nav-item">
      <button
        class="nav-link info"
        :class="{ active: tab === 3 }"
        @click="tab = 3"
      >
        Ubicación
      </button>
    </li>
    <li class="nav-item">
      <button
        class="nav-link info"
        :class="{ active: tab === 4 }"
        @click="tab = 4"
      >
        Reseñas
      </button>
    </li>
    <li class="nav-item">
      <button
        class="nav-link info"
        :class="{ active: tab === 5 }"
        @click="tab = 5"
      >
        Perfil
      </button>
    </li>
  </ul>

  <section class="py-4 px-1">
    <!-- Dsiponibilidad  -->
    <div v-if="tab === 1">
      <p class="fw-semibold">Servicios disponibles</p>

      <!-- doctor specialities -->
      <div>
        <button
          v-for="service in doctor.servicesResult"
          :key="service.doctor_service_id"
          @click="appointment.specialty = service.specialty"
          class="badge bg-info text-info border-none me-2 rounded-5 text-capitalize"
          style="--bs-bg-opacity: 0.07"
        >
          {{ service.specialty }}
        </button>
      </div>

      <div v-if="result && result.schedule">
        <form @submit.prevent="openConfirmationModal">
          <div class="mb-2 row align-items-center justify-content-between">
            <span class="col-md-4 fw-semibold"
              >Resultados de la Disponibilidad:</span
            >
            <div
              class="col-md-8 row gap-2 align-items-center justify-content-center justify-content-md-end"
            >
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
              Reservar Cita de valoración
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

      <p>Procedimientos avanzados para el tratamiento de cataratas</p>
      <p>Packs:</p>

      <!-- plans -->
      <div class="container">
        <div class="row">
          <!-- Option 1 -->
          <div class="col-4">
            <div class="custom-card">
              <div class="card-header text-center">OPCIÓN 1</div>
              <div class="card-body">
                <h5 class="card-title">19.000 USD</h5>
                <p class="card-text">Precio original 28.000 USD</p>
                <p class="card-text rating">
                  <span class="icon"
                    ><img
                      src="@/src/assets/star.svg"
                      alt="Busca centro medico"
                      class="img-fluid"
                  /></span>
                  5.0 <span class="text-muted">(13 Reseñas)</span>
                </p>
                <ul class="list-group list-group-flush">
                  <li class="list-group-item">
                    <span class="icon"
                      ><img
                        src="@/src/assets/check.svg"
                        alt="Busca centro medico"
                        class="img-fluid"
                    /></span>
                    Cita de valoración
                  </li>
                  <li class="list-group-item">
                    <span class="icon"
                      ><img
                        src="@/src/assets/check.svg"
                        alt="Busca centro medico"
                        class="img-fluid"
                    /></span>
                    Medicamentos
                  </li>
                  <li class="list-group-item">
                    <span class="icon"
                      ><img
                        src="@/src/assets/check.svg"
                        alt="Busca centro medico"
                        class="img-fluid"
                    /></span>
                    Cita de seguimiento 1 mes después.
                  </li>
                </ul>
                <p class="text-muted">Próxima Disponibilidad:</p>
                <p class="card-text availability">
                  <span class="availability-text">
                    <span class="icon">
                      <img
                        src="@/src/assets/calendar.svg"
                        alt="Busca centro medico"
                        class="img-fluid"
                      />
                    </span>
                    19/10/2024
                  </span>
                  <span class="time-text">
                    <span class="icon">
                      <img
                        src="@/src/assets/clock.svg"
                        alt="Busca centro medico"
                        class="img-fluid"
                      />
                    </span>
                    11:00 am
                  </span>
                </p>
                <button class="btn btn-outline-primary">
                  Cita de valoración
                </button>
              </div>
            </div>
          </div>

          <!-- Option 2 -->
          <div class="col-4">
            <div class="custom-card">
              <div
                class="card-header selected text-center d-flex gap-2 align-items-center justify-content-center"
              >
                <span
                  ><img
                    src="@/src/assets/crown.svg"
                    alt="Busca centro medico"
                    class="img-fluid"
                /></span>
                <p class="m-0">OPCIÓN 2</p>
              </div>
              <div class="card-body">
                <h5 class="card-title">23.000 USD</h5>
                <p class="card-text">Precio original 28.000 USD</p>
                <p class="card-text rating">
                  <span class="icon"
                    ><img
                      src="@/src/assets/star.svg"
                      alt="Busca centro medico"
                      class="img-fluid"
                  /></span>
                  5.0 <span class="text-muted">(13 Reseñas)</span>
                </p>
                <ul class="list-group list-group-flush">
                  <li class="list-group-item">
                    <span class="icon"
                      ><img
                        src="@/src/assets/check.svg"
                        alt="Busca centro medico"
                        class="img-fluid"
                    /></span>
                    Cita de valoración
                  </li>
                  <li class="list-group-item">
                    <span class="icon"
                      ><img
                        src="@/src/assets/check.svg"
                        alt="Busca centro medico"
                        class="img-fluid"
                    /></span>
                    Medicamentos
                  </li>
                  <li class="list-group-item">
                    <span class="icon"
                      ><img
                        src="@/src/assets/check.svg"
                        alt="Busca centro medico"
                        class="img-fluid"
                    /></span>
                    Cita de seguimiento 1 mes después.
                  </li>
                </ul>
                <p class="text-muted">Próxima Disponibilidad:</p>
                <p class="card-text availability">
                  <span class="availability-text">
                    <span class="icon">
                      <img
                        src="@/src/assets/calendar.svg"
                        alt="Busca centro medico"
                        class="img-fluid"
                      />
                    </span>
                    19/10/2024
                  </span>
                  <span class="time-text">
                    <span class="icon">
                      <img
                        src="@/src/assets/clock.svg"
                        alt="Busca centro medico"
                        class="img-fluid"
                      />
                    </span>
                    11:00 am
                  </span>
                </p>
                <button class="btn btn-outline-primary">
                  Cita de valoración
                </button>
              </div>
            </div>
          </div>

          <!-- Option 3 -->
          <div class="col-4">
            <div class="custom-card">
              <div class="card-header text-center">OPCIÓN 3</div>
              <div class="card-body">
                <h5 class="card-title">26.000 USD</h5>
                <p class="card-text">Precio original 28.000 USD</p>
                <p class="card-text rating">
                  <span class="icon"
                    ><img
                      src="@/src/assets/star.svg"
                      alt="Busca centro medico"
                      class="img-fluid"
                  /></span>
                  5.0 <span class="text-muted">(13 Reseñas)</span>
                </p>
                <ul class="list-group list-group-flush">
                  <li class="list-group-item">
                    <span class="icon"
                      ><img
                        src="@/src/assets/check.svg"
                        alt="Busca centro medico"
                        class="img-fluid"
                    /></span>
                    Cita con nutricionista
                  </li>
                  <li class="list-group-item">
                    <span class="icon"
                      ><img
                        src="@/src/assets/check.svg"
                        alt="Busca centro medico"
                        class="img-fluid"
                    /></span>
                    Cita con alergólogo
                  </li>
                  <li class="list-group-item">
                    <span class="icon"
                      ><img
                        src="@/src/assets/cross.svg"
                        alt="Busca centro medico"
                        class="img-fluid"
                    /></span>
                    Cita de seguimiento 1 mes después.
                  </li>
                </ul>
                <p class="text-muted">Próxima Disponibilidad:</p>
                <p class="card-text availability">
                  <span class="availability-text">
                    <span class="icon">
                      <img
                        src="@/src/assets/calendar.svg"
                        alt="Busca centro medico"
                        class="img-fluid"
                      />
                    </span>
                    19/10/2024
                  </span>

                  <span class="time-text">
                    <span class="icon">
                      <img
                        src="@/src/assets/clock.svg"
                        alt="Busca centro medico"
                        class="img-fluid"
                      />
                    </span>
                    11:00 am
                  </span>
                </p>
                <button class="btn btn-outline-primary">
                  Cita de valoración
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- <WebsiteClinicaServiciosTab
      :services="doctor.servicesResult"
      v-if="tab === 2"
    />  -->

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
              doctor.doctor_information.personal.address +
              ", " +
              doctor.doctor_information.personal.city +
              ", " +
              doctor.doctor_information.personal.country_iso_code
            }}</span>
          </p>
          <div>
            <a
              :href="`tel:${doctor.doctor_information.personal.phone_number}`"
              class="btn btn-info rounded-4 text-white me-2 py-1 px-2"
            >
              <span class="fs-5"><AtomsIconsPhoneIcon /></span>
            </a>
            <a
              :href="`mailto:${doctor.doctor_information.personal.email}`"
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
    <!-- calendar -->
    <!-- Disponibilidad (Tab 2) -->
    <div v-if="tab === 2">
      <div class="card mb-4 rounded-4">
        <div class="card-body">
          <!-- Date Selection -->
          <div class="mb-4">
            <div class="d-flex justify-content-between align-items-center">
              <h4 class="h6 fw-semibold mb-3">Seleccione una fecha</h4>
              <div
                class="calendar-container badge rounded-5 bg-primary text-primary p-2"
                style="--bs-bg-opacity: 0.07"
              >
                <img
                  src="@/src/assets/calendar.svg"
                  alt="Busca centro medico"
                  class="img-fluid text-primary"
                />
                <div class="custom-select-wrapper">
                  <select
                    v-model="selectedMonth"
                    class="form-select badge bg-transparent border-0 shadow-none text-primary text-left text-start"
                    style="--bs-bg-opacity: 0.07"
                    @change="handleMonthChange"
                  >
                    <option :value="null" disabled selected>
                      Seleccione un mes
                    </option>
                    <option
                      v-for="month in months"
                      :key="month.value"
                      :value="month.value"
                    >
                      {{ month.label }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="d-flex gap-2 overflow-auto pb-2">
              <button
                v-for="day in availableDays"
                :key="day.date"
                @click="selectDay(day.date)"
                class="btn btn-outline-info d-flex flex-column align-items-center"
                :class="{ active: selectedDay === day.date }"
                style="min-width: 60px; padding: 8px 12px; border-radius: 8px"
              >
                <span
                  class="small text-info"
                  :class="{ 'text-white': selectedDay === day.date }"
                >
                  {{ day.day }}
                </span>
                <span
                  class="fw-semibold text-info"
                  :class="{ 'text-white': selectedDay === day.date }"
                  >{{ day.number }}
                </span>
              </button>
            </div>
          </div>

          <!-- Time Selection -->
          <div v-if="selectedDay" class="mt-4">
            <h4 class="h6 fw-semibold mb-3">Seleccione la hora</h4>
            <div class="d-flex flex-wrap gap-2">
              <button
                v-for="(time, index) in availableHours"
                :key="index"
                @click="selectedHour = time"
                class="btn btn-outline-info position-relative hover-info"
                :class="{
                  'active border-info text-white hover-info':
                    selectedHour === time,
                }"
                style="border-radius: 8px; padding: 8px 16px"
              >
                {{ formatTime(time) }}
              </button>
            </div>
          </div>

          <div v-else class="text-muted mt-4">
            Por favor seleccione una fecha para ver los horarios disponibles
          </div>

          <!-- Reservation Button -->
          <div class="row mt-4">
            <div class="col-12 d-flex justify-content-end">
              <button
                class="btn btn-primary"
                :disabled="!selectedHour"
                @click="reserveAppointment()"
              >
                Reservar Cita de valoración
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Reseñas  -->
    <div v-if="tab === 4">
      <div class="card mb-4 rounded-4">
        <div class="card-body">
          <div class="row gap-2 d-flex">
            <div class="col-md-6 border-end">
              <p
                class="fw-semibold d-flex align-items-center justify-content-between"
              >
                Reseñas logradas
                <small class="text-muted"
                  >5.0
                  <span class="fw-light"
                    >({{ doctorReviews.length }} Opiniones)</span
                  ></small
                >
              </p>
              <div class="d-flex justify-content-between fw-light text-muted">
                Calidad de atención
                <span class="text-warning">
                  <AtomsIconsStarFilled v-for="i in 5" :key="i" />
                </span>
              </div>
              <div class="d-flex justify-content-between fw-light text-muted">
                Limpieza de instalaciones
                <span class="text-warning">
                  <AtomsIconsStarFilled v-for="i in 4" :key="i" />
                  <AtomsIconsStarOutline />
                </span>
              </div>
              <div class="d-flex justify-content-between fw-light text-muted">
                Amabilidad del Staff
                <span class="text-warning">
                  <AtomsIconsStarFilled v-for="i in 5" :key="i" />
                </span>
              </div>
              <div class="d-flex justify-content-between fw-light text-muted">
                Relacion Precio/Calidad
                <span class="text-warning">
                  <AtomsIconsStarFilled v-for="i in 4" :key="i" />
                  <AtomsIconsStarOutline />
                </span>
              </div>
            </div>
            <div class="col-md-5">
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
      <div class="row row-cols-1 row-cols-md-3 g-4">
        <!-- Added g-4 for gap between cards -->
        <div
          class="col"
          v-for="review in doctorReviews"
          :key="review.first_name"
        >
          <div class="card h-100 rounded-4 shadow-sm border-none">
            <!-- Added h-100 for equal height -->
            <div class="card-body d-flex flex-column">
              <div class="text-warning">
                <!-- Dynamic stars based on review.score -->
                <AtomsIconsStarFilled v-for="i in review.score" :key="i" />
                <AtomsIconsStarOutline
                  v-for="i in 5 - review.score"
                  :key="i + 5"
                />
              </div>
              <p class="fst-italic my-3 flex-grow-1">{{ review.message }}</p>
              <!-- Added flex-grow-1 -->
              <p class="text-primary fw-semibold m-0">
                {{ review.first_name }} {{ review.last_name }}
              </p>
              <p class="text-muted m-0">{{ review.pacient_type }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Perfil  -->
    <div v-if="tab === 5">
      <div class="row">
        <div class="col-12">
          <h5 class="fw-bold">Nuestra historia</h5>
          <p class="text-muted">{{ doctorHistory }}</p>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <h5 class="fw-bold">Visión</h5>
          <p class="text-muted">{{ doctorVision }}</p>
        </div>
      </div>

      <div class="row">
        <div class="col-12">
          <h5 class="fw-bold">Misión</h5>
          <p class="text-muted">{{ doctorMision }}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- modals -->
  <div>
    <div
      class="modal fade"
      id="modalCitaValoracion"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Título del Modal</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>

          <!-- modal content -->
          <div class="modal-body">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb">
                <li
                  :class="{ active: breadcumCitaValoracion == 1 }"
                  class="breadcrumb-item"
                  aria-current="page"
                >
                  1
                </li>
                <li
                  :class="{ active: breadcumCitaValoracion == 2 }"
                  class="breadcrumb-item active"
                  aria-current="page"
                >
                  2
                </li>
                <li
                  :class="{ active: breadcumCitaValoracion == 3 }"
                  class="breadcrumb-item active"
                  aria-current="page"
                >
                  3
                </li>
              </ol>
            </nav>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cerrar
            </button>
            <button type="button" class="btn btn-primary">
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <WebsiteConfirmationCitaModal
    :open="open"
    :appointment="appointment"
    :result="result"
    @close-modal="closeModal"
  />
  <WebsiteReservarModal :isOpen="panel" :currentStep=2 :offers="offers" @close="panel = false" />
</template>

<style scoped>
.day-container {
  display: flex;
  /* margin-top: 20px; */
}

.nav-link.info {
  color: #0cadbb;
}

.day {
  width: 41px;
  height: 40px;
  text-align: center;
  line-height: 40px;
  background-color: #f0f0f0;
  border-radius: 5px;
  margin: 10px;
}

.day-active {
  background-color: #007bff;
  color: white;
}

.hour {
  width: auto;
  height: 40px;
  text-align: center;
  line-height: 40px;
  background-color: #f0f0f0;
  border-radius: 5px;
  margin: 10px;
}

.hour > span {
  padding: 16px;
}

.custom-card {
  border: 1px solid var(--Gray-Scale-300, #f1f3f7);
  background: var(--Gray-Scale-White, #fff);
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.08);
}

.custom-card .card-header {
  font-weight: bold;
  padding: 15px;
  background: linear-gradient(
    188deg,
    #f8faff 65.03%,
    rgba(248, 250, 255, 0.1) 112.13%
  );
  border: none;
}

.custom-card .card-header.selected {
  background: linear-gradient(
    180deg,
    #fffcf5 70.16%,
    rgba(255, 252, 245, 0.05) 100%
  );
}

.custom-card .card-body {
  padding: 20px;
}

.custom-card .card-title {
  font-size: 1.5em;
  margin-bottom: 10px;
}

.custom-card .card-text {
  margin-bottom: 10px;
}

.custom-card .list-group-item {
  border: none;
  padding-left: 0;
  padding-right: 0;
}

.custom-card .btn {
  width: 100%;
  margin-top: 15px;
}

.custom-card .rating .icon {
  color: #ffc107;
}

.custom-card .icon {
  margin-right: 5px;
}

.availability {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.availability .availability-text,
.availability .time-text {
  display: flex;
  align-items: center;
}

.availability .icon {
  margin-right: 5px;
}

.btn-outline-primary {
  border-color: #dee2e6;
  color: #6c757d;
}

.btn-outline-primary:hover {
  border-color: #0d6efd;
  background-color: rgba(13, 110, 253, 0.05);
}

.btn-outline-primary.active {
  background-color: rgba(13, 110, 253, 0.1);
  border-color: #0d6efd;
  color: #0d6efd;
}

.btn-outline-primary.active span {
  color: #0d6efd;
}

.day-container {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.day-container::-webkit-scrollbar {
  height: 4px;
}

.day-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.day-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.day-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.btn-outline-info:hover .text-info {
  color: white !important;
}

.hover-info:hover {
  color: white !important;
}

/* Ensure text is white when active (selected) */
.active .text-info {
  color: white !important;
}

select {
  appearance: none; /* Remove default arrow */
  -webkit-appearance: none; /* For Safari */
  -moz-appearance: none; /* For Firefox */
  background-image: none; /* Remove any background image */
  padding-right: 1rem; /* Add padding to prevent text overlap */
}

/* Optional: Add a custom arrow if needed */
.custom-select-wrapper {
  position: relative;
  display: inline-block;
}

.custom-select-wrapper::after {
  content: ""; /* Custom arrow */
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none; /* Ensure clicks go to the select element */
  color: #000; /* Arrow color */
}
</style>
