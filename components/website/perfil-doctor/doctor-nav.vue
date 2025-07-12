<script>
import { useCookie } from "nuxt/app";

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
      user: useCookie("user_info"),
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
      selectedMonth: null,
      selectedDay: null,
      selectedHour: null,
      availableDays: [],
      availableHours: [],
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
      breadcumCitaValoracion: 1,
      selectedSpecialty: null,
      selectedSpecialtyId: null,
      selectedPackage: null,
      selectedProcedure: null,
      selectedProcedureId: null,
      selectedMonth: null,
      selectedDay: null,
      selectedHour: null,
      availableDays: [],
      availableHours: [],
      reviewDetails: [],
      assessmentDetails: [],
      weekdayMap: {
        Monday: "Lun",
        Tuesday: "Mar",
        Wednesday: "Mié",
        Thursday: "Jue",
        Friday: "Vie",
        Saturday: "Sáb",
        Sunday: "Dom",
      },
    };
  },
  async created() {
    const token = useCookie("token");
    const config = useRuntimeConfig();

    try {
      // Fetch review details
      const reviewResponse = await $fetch(
        config.public.API_BASE_URL + "/udc/get_all",
        {
          headers: { Authorization: token.value },
          params: { type: "REVIEW" },
        }
      );
      this.reviewDetails = reviewResponse.data;

      // Fetch assessment details
      const assessmentResponse = await $fetch(
        config.public.API_BASE_URL + "/udc/get_all",
        {
          headers: { Authorization: token.value },
          params: { type: "ASSESSMENT_DETAIL" },
        }
      );
      this.assessmentDetails = assessmentResponse.data;

      // Set default specialty, procedure, and procedureId
      if (this.doctor.services && this.doctor.services.length > 0) {
        this.selectedSpecialty = this.doctor.services[0].medical_specialty.code;
        this.selectedSpecialtyId = this.doctor.services[0].medical_specialty.id;
        this.appointment.specialty = this.selectedSpecialty;

        if (
          this.doctor.services[0].procedures &&
          this.doctor.services[0].procedures.length > 0
        ) {
          this.selectedProcedure =
            this.doctor.services[0].procedures[0].procedure.code;
          this.selectedProcedureId =
            this.doctor.services[0].procedures[0].procedure.id;
          this.appointment.service = this.selectedProcedure;
        }
      }
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  },
  computed: {
    defaultService() {
      return this.doctor.services && this.doctor.services.length > 0
        ? this.doctor.services[0]
        : null;
    },

    defaultProcedure() {
      if (!this.defaultService) return null;
      return this.defaultService.procedures &&
        this.defaultService.procedures.length > 0
        ? this.defaultService.procedures[0]
        : null;
    },
    formattedSelectedMonth() {
      return this.selectedMonth !== null ? this.selectedMonth + 1 : null;
    },
    doctorReviews() {
      return (
        this.doctor.reviews?.map((review) => ({
          first_name: review.customer.split(" ")[0] || "Anónimo",
          last_name: review.is_annonymous
            ? ""
            : review.customer.split(" ")[1] || "",
          message: review.comment,
          pacient_type: "Paciente",
          score: review.stars_average,
        })) || []
      );
    },
    reviewSummary() {
      return this.doctor.review_details_summary || [];
    },
    availability() {
      const availabilityMap = {};
      // You would need to implement logic to convert the doctor.availabilities
      // into the format expected by your calendar
      return availabilityMap;
    },
    packages() {
      if (!this.selectedSpecialty) return [];
      const specialty = this.doctor.services.find(
        (s) => s.medical_specialty.code === this.selectedSpecialty
      );
      if (!specialty) return [];

      return specialty.procedures.flatMap((procedure) =>
        procedure.packages.map((pkg) => ({
          ...pkg,
          procedureName: procedure.procedure.name,
          specialtyName: specialty.medical_specialty.name,
        }))
      );
    },
    availability() {
      const availabilityMap = {};

      // Get current date and next 30 days
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 30);

      // Process each availability
      this.doctor.availabilities.forEach((avail) => {
        // Find all dates that match this weekday within the next 30 days
        const currentDate = new Date(today);
        while (currentDate <= endDate) {
          if (
            currentDate.toLocaleDateString("en-US", { weekday: "long" }) ===
            avail.weekday
          ) {
            const dateStr = currentDate.toISOString().split("T")[0];
            const fromHour = avail.from_hour.substring(0, 5);

            if (!availabilityMap[dateStr]) {
              availabilityMap[dateStr] = [];
            }

            // Add the exact time slot
            availabilityMap[dateStr].push(`${fromHour}`);
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });

      return availabilityMap;
    },
    specialties() {
      return (
        this.doctor.services?.map((service) => service.medical_specialty) || []
      );
    },
    filteredProcedures() {
      if (
        !this.selectedSpecialty &&
        this.doctor.services &&
        this.doctor.services.length > 0
      ) {
        // Set default specialty if none selected
        this.selectedSpecialty = this.doctor.services[0].medical_specialty.code;
        this.appointment.specialty = this.selectedSpecialty;
        return this.doctor.services[0].procedures;
      }

      const specialty = this.doctor.services.find(
        (s) => s.medical_specialty.code === this.selectedSpecialty
      );
      return specialty?.procedures || [];
    },
    filteredPackages() {
      if (
        !this.selectedProcedure &&
        this.filteredProcedures &&
        this.filteredProcedures.length > 0
      ) {
        // Set default procedure if none selected
        this.selectedProcedure = this.filteredProcedures[0].procedure.code;
        this.selectedProcedureId = this.filteredProcedures[0].procedure.id;
        this.appointment.service = this.selectedProcedure;
        return this.filteredProcedures[0].packages;
      }

      const procedure = this.filteredProcedures.find(
        (p) => p.procedure.code === this.selectedProcedure
      );
      return procedure?.packages || [];
    },
    formattedSelectedMonth() {
      return this.selectedMonth !== null ? this.selectedMonth + 1 : null;
    },
  },
  methods: {
    search() {
      let filter = this.doctor.services;

      filter = filter.filter((item) => {
        return (
          item.medical_specialty.code === this.appointment.specialty &&
          item.procedures.some(
            (p) => p.procedure.code === this.appointment.service
          ) &&
          this.doctor.locations.some(
            (l) => l.name === this.appointment.location
          )
        );
      });

      if (filter.length === 0) {
        this.errorText = "No hay disponibilidad para esta cita";
      } else {
        this.errorText = "";
      }
      return (this.result = filter[0]);
    },
    getReviewLabel(reviewCode) {
      if (!this.reviewDetails) return reviewCode;

      const detail = this.reviewDetails.find(
        (item) => item.code === reviewCode
      );
      return detail ? detail.name : reviewCode;
    },
    getAssesmentLabel(assesmentCode) {
      if (!this.assessmentDetails) return assesmentCode;

      const detail = this.assessmentDetails.find(
        (item) => item.code === assesmentCode
      );
      return detail ? detail.name : assesmentCode;
    },
    calculateAverageRating() {
      if (!this.doctor.reviews || this.doctor.reviews.length === 0) {
        return 0; // Return 0 if no reviews
      }

      // Calculate average from stars_average of each review
      const sum = this.doctor.reviews.reduce(
        (total, review) => total + review.stars_average,
        0
      );

      const average = sum / this.doctor.reviews.length;

      // Return rounded to 1 decimal place
      return Math.round(average * 10) / 10;
    },
    selectDay(date) {
      this.selectedDay = date;
      this.selectedDate = date;
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
    closeModal() {
      this.open = false;
    },
    reserveAppointment() {
      if (this.panel) {
        this.panel = false;
        return;
      }

      console.log(
        "Reserving appointment at",
        this.selectedDate,
        this.selectedHour
      );

      this.panel = true;
    },
    selectSpecialty(specialtyCode, specialtyId) {
      this.selectedSpecialty = specialtyCode;
      this.selectedSpecialtyId = specialtyId;
      this.selectedProcedure = null; // Reset selected procedure when specialty changes
      this.appointment.specialty = specialtyCode;

      // Set default procedure for the new specialty
      const specialty = this.doctor.services.find(
        (s) => s.medical_specialty.code === specialtyCode
      );
      if (
        specialty &&
        specialty.procedures &&
        specialty.procedures.length > 0
      ) {
        this.selectedProcedure = specialty.procedures[0].procedure.code;
        this.selectedProcedureId = specialty.procedures[0].procedure.id;
        this.appointment.service = this.selectedProcedure;
      }
    },
    selectPackage(selectedPackage) {
      this.selectedPackage = selectedPackage;
      console.log("Selected package:", this.selectedPackage); // Debug log
      this.tab = 2;
    },
    selectProcedure(procedureCode, procedureId) {
      this.selectedProcedure = procedureCode;
      this.selectedProcedureId = procedureId;
      this.appointment.service = procedureCode;
    },
    getPackagePrice(pkg) {
      const price = parseFloat(pkg.product.value1);
      const discount = pkg.discount / 100;
      return price - price * discount;
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
        const dateStr = date.toISOString().split("T")[0];
        console.log(this.availability);
        console.log(dateStr);

        if (
          this.availability[dateStr] &&
          this.availability[dateStr].length > 0
        ) {
          availableDays.push({
            date: dateStr,
            day: this.weekdayMap[
              date.toLocaleDateString("en-US", { weekday: "long" })
            ],
            number: date.getDate(),
          });
        }
      }

      return availableDays;
    },

    selectDay(date) {
      this.selectedDay = date;
      this.availableHours = this.availability[date] || [];
      this.selectedHour = null;
    },

    formatTime(time) {
      const [hours, minutes] = time.split(":");
      const period = hours >= 12 ? "PM" : "AM";
      return `${hours % 12 || 12}:${minutes}${period}`;
    },
  },
};
</script>

<template>
  <ul class="tabs-container">
    <li class="tab-item">
      <button
        class="tab-item__link"
        :class="{ 'tab-item__link--active': tab === 1 }"
        @click="tab = 1"
      >
        Servicios
      </button>
    </li>
    <li class="tab-item">
      <button
        class="tab-item__link"
        :class="{ 'tab-item__link--active': tab === 2 }"
        @click="tab = 2"
      >
        Disponibilidad
      </button>
    </li>
    <li class="tab-item">
      <button
        class="tab-item__link"
        :class="{ 'tab-item__link--active': tab === 3 }"
        @click="tab = 3"
      >
        Ubicación
      </button>
    </li>
    <li class="tab-item">
      <button
        class="tab-item__link"
        :class="{ 'tab-item__link--active': tab === 4 }"
        @click="tab = 4"
      >
        Reseñas
      </button>
    </li>
    <li class="tab-item">
      <button
        class="tab-item__link"
        :class="{ 'tab-item__link--active': tab === 5 }"
        @click="tab = 5"
      >
        Perfil
      </button>
    </li>
  </ul>

  <section class="tabs-content">
    <!-- Servicios Tab -->
    <div v-if="tab === 1" class="service-tab">
      <p class="service-tab__title">Servicios disponibles</p>

      <!-- Specialty badges -->
      <div class="service-tab__badges-wrapper">
        <button
          v-for="specialty in specialties"
          :key="specialty.code"
          @click="selectSpecialty(specialty.code, specialty.id)"
          class="service-tab__badge"
          style="--bs-bg-opacity: 0.07"
          :class="{
            'service-tab__badge--active': selectedSpecialty === specialty.code,
          }"
        >
          {{ specialty.name }}
        </button>
      </div>

      <!-- Procedure badges (shown when specialty is selected) -->
      <div class="service-tab__procedures-wrapper">
        <button
          v-for="procedure in filteredProcedures"
          :key="procedure.procedure.code"
          @click="
            selectProcedure(procedure.procedure.code, procedure.procedure.id)
          "
          class="service-tab__procedure-badge"
          :class="{
            'service-tab__procedure-badge--active':
              selectedProcedure === procedure.procedure.code,
          }"
        >
          {{ procedure.procedure.name }}
        </button>
      </div>

      <div>
        <p class="service-tab__packages-title">Packs:</p>
      </div>

      <!-- All packages for selected procedure -->
      <div v-if="filteredPackages.length > 0" class="service-tab__packages">
        <div
          class="service-tab-card"
          v-for="(pkg, index) in filteredPackages"
          :key="pkg.id"
        >
          <div
            class="service-tab-card__wrapper"
            :class="{ selected: pkg.is_king }"
          >
            <div class="service-tab-card__header">
              {{ pkg.product.name }}
              <span v-if="pkg.is_king">
                <img
                  src="@/src/assets/crown.svg"
                  alt="Recomendado"
                  class="img-fluid"
                />
              </span>
            </div>
            <div class="service-tab-card__body">
              <h5 class="service-tab-card__price">
                ₡{{ getPackagePrice(pkg) }}
              </h5>
              <p class="service-tab-card__discount" v-if="pkg.discount">
                Precio original
                <span>₡{{ pkg.product.value1 }}</span>
              </p>
              <p class="service-tab-card__rating-wrapper">
                <span class="service-tab-card__rating">
                  <img
                    src="@/src/assets/star.svg"
                    alt="Rating"
                    class="img-fluid"
                  />
                  5.0
                </span>
                <span class="service-tab-card__reviews"
                  >({{ doctorReviews.length }} Reseñas)</span
                >
              </p>
              <div class="service-tab-card__services-wrapper">
                <p class="service-tab-card__services-title">Servicios:</p>
                <ul class="service-tab-card__services">
                  <li
                    class="service-tab-card__services-item"
                    v-for="service in pkg.services_offer.ASSESSMENT_DETAILS"
                    :key="service"
                  >
                    <div class="service-tab-card__services-icon-wrapper">
                      <img
                        src="@/src/assets/check.svg"
                        alt="Incluido"
                        class="service-tab-card__services-icon"
                      />
                    </div>
                    <p class="service-tab-card__services-text">
                      {{ getAssesmentLabel(service) }}
                    </p>
                  </li>
                </ul>
              </div>

              <div class="service-tab-card__availability-wrapper">
                <p class="service-tab-card__availability-title">
                  Próxima Disponibilidad:
                </p>
                <p class="service-tab-card__availability-content">
                  <span class="service-tab-card__availability-text">
                    <span class="icon">
                      <svg
                        width="15"
                        height="16"
                        viewBox="0 0 15 16"
                        fill="none"
                        class="service-tab-card__availability-icon"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4.07143 5.1875H10.875M3.60714 1.4375V2.56264M11.25 1.4375V2.5625M13.5 5.5625L13.5 11.5626C13.5 13.2194 12.1569 14.5626 10.5 14.5626H4.5C2.84315 14.5626 1.5 13.2194 1.5 11.5626V5.5625C1.5 3.90565 2.84315 2.5625 4.5 2.5625H10.5C12.1569 2.5625 13.5 3.90565 13.5 5.5625Z"
                          stroke="#3541B4"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                    {{ doctor.date_availability }}
                  </span>
                  <span class="service-tab-card__availability-text">
                    <span class="icon">
                      <svg
                        width="15"
                        height="16"
                        viewBox="0 0 15 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        class="service-tab-card__availability-icon"
                      >
                        <path
                          d="M7.5 4.25V8L10 9.25M13.75 8C13.75 11.4518 10.9518 14.25 7.5 14.25C4.04822 14.25 1.25 11.4518 1.25 8C1.25 4.54822 4.04822 1.75 7.5 1.75C10.9518 1.75 13.75 4.54822 13.75 8Z"
                          stroke="#3541B4"
                          stroke-width="1.5"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        />
                      </svg>
                    </span>
                    {{ doctor.hour_availability }}
                  </span>
                </p>
              </div>

              <button
                class="service-tab-card__assessment-appointment-button"
                @click="selectPackage(pkg)"
              >
                Cita de valoración
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        v-else-if="selectedSpecialty && filteredProcedures.length === 0"
        class="alert alert-info"
      >
        No hay procedimientos disponibles para esta especialidad
      </div>
      <div
        v-else-if="selectedProcedure && filteredPackages.length === 0"
        class="alert alert-info"
      >
        No hay paquetes disponibles para este procedimiento
      </div>
    </div>

    <div v-if="tab === 2" class="availability-tab">
      <div class="availability-tab__header">
        <h3 class="availability-tab__title">Agenda de disponibilidad</h3>
      </div>
      <div class="availability-tab-card">
        <div class="availability-tab-card__content">
          <!-- Date Selection -->
          <div class="availability-tab-card__date-selection">
            <div class="d-flex justify-content-between align-items-center">
              <h4 class="availability-tab-card__title">Seleccione una fecha</h4>
              <div
                class="calendar-container badge rounded-5 bg-primary text-primary p-2"
                style="--bs-bg-opacity: 0.07"
              >
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

                <img
                  src="@/src/assets/calendar.svg"
                  alt="Busca centro medico"
                  class="img-fluid text-primary"
                />
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
        </div>
      </div>

      <!-- Reservation Button -->
      <div class="availability-tab__reservation-button-wrapper">
        <button
          class="availability-tab__reserve-button"
          :disabled="!selectedHour"
          @click="reserveAppointment()"
        >
          Reservar Cita de valoración
        </button>
      </div>
    </div>

    <!-- Ubicación Tab -->
    <div v-if="tab === 3">
      <div class="location-tab">
        <div class="location-tab__info">
          <p class="location-tab__title">Encuentranos Facilmente</p>
          <p class="location-tab__address">
            <span class="location-tab__icon">
              <AtomsIconsMapPointerIcon />
            </span>
            <span class="location-tab__address-text">
              {{ doctor.address }}, {{ doctor.city_name }},
              {{ doctor.country_iso_code }}
            </span>
          </p>
          <div class="location-tab__contact">
            <a
              :href="`tel:${doctor.phone_number}`"
              class="contact-button contact-button--phone"
            >
              <span><AtomsIconsPhoneIcon /></span>
            </a>
            <a
              :href="`mailto:${doctor.email}`"
              class="contact-button contact-button--email"
            >
              <span><AtomsIconsMailIcon /></span>
            </a>
          </div>
        </div>
        <div class="location-tab__map">
          <AtomsMapaInteractivo
            :latitude="doctor.latitude"
            :longitude="doctor.longitude"
            :name="doctor.name"
          />
        </div>
      </div>
    </div>

    <!-- Reseñas Tab -->
    <div v-if="tab === 4">
      <div class="card mb-4 rounded-4">
        <div class="card-body">
          <div class="row gap-2 d-flex">
            <div class="col-md-6 border-end">
              <p
                class="fw-semibold d-flex align-items-center justify-content-between"
              >
                Reseñas logradas
                <small class="text-muted">
                  {{ calculateAverageRating() }}
                  <span class="fw-light"
                    >({{ doctorReviews.length }} Opiniones)</span
                  >
                </small>
              </p>
              <div
                v-for="summary in reviewSummary"
                :key="summary.review"
                class="d-flex justify-content-between fw-light text-muted"
              >
                {{ getReviewLabel(summary.review) }}
                <span class="text-warning">
                  <AtomsIconsStarFilled
                    v-for="i in summary.stars_point_average"
                    :key="i"
                  />
                  <AtomsIconsStarOutline
                    v-for="i in 5 - summary.stars_point_average"
                    :key="i + 5"
                  />
                </span>
              </div>
            </div>
            <div class="col-md-5">
              <p class="fw-semibold">Servicios Destacados</p>
              <div>
                <span class="btn btn-outline-info rounded-5 btn-sm mb-2 me-2">
                  {{ doctor.medical_type.name }}
                </span>
                <span
                  v-for="specialty in specialties"
                  :key="specialty.code"
                  class="btn btn-outline-info rounded-5 btn-sm mb-2 me-2"
                >
                  {{ specialty.name }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row row-cols-1 row-cols-md-3 g-4">
        <div class="col" v-for="review in doctorReviews" :key="review.id">
          <div class="card h-100 rounded-4 shadow-sm border-none">
            <div class="card-body d-flex flex-column">
              <div class="text-warning">
                <AtomsIconsStarFilled v-for="i in review.score" :key="i" />
                <AtomsIconsStarOutline
                  v-for="i in 5 - review.score"
                  :key="i + 5"
                />
              </div>
              <p class="fst-italic my-3 flex-grow-1">{{ review.message }}</p>
              <p class="text-primary fw-semibold m-0">
                {{ review.first_name }} {{ review.last_name }}
              </p>
              <p class="text-muted m-0">{{ review.pacient_type }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Perfil Tab -->
    <div v-if="tab === 5" class="profile-tab">
      <div class="profile-section">
        <h5 class="profile-section__title">Descripción</h5>
        <p class="profile-section__content">{{ doctor.description }}</p>
      </div>

      <div class="profile-section" v-if="doctor.our_history">
        <h5 class="profile-section__title">Nuestra historia</h5>
        <p class="profile-section__content">{{ doctor.our_history }}</p>
      </div>

      <div class="profile-section" v-if="doctor.mission">
        <h5 class="profile-section__title">Misión</h5>
        <p class="profile-section__content">{{ doctor.mission }}</p>
      </div>

      <div class="profile-section" v-if="doctor.vision">
        <h5 class="profile-section__title">Visión</h5>
        <p class="profile-section__content">{{ doctor.vision }}</p>
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
  <WebsiteReservarModal
    :selectedProcedureId="selectedProcedureId"
    :selectedSpecialtyId="selectedSpecialtyId"
    :userInfo="user"
    :doctorInfo="doctor"
    :selectedDay="selectedDay"
    :selectedHour="selectedHour"
    :selectedPackage="selectedPackage"
    :isOpen="panel"
    :currentStep="2"
    :offers="offers"
    @close="panel = false"
  />
</template>

<style lang="scss" scoped>
.tabs-container {
  display: flex;
  justify-content: space-between;
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-x: auto;

  -webkit-overflow-scrolling: touch;

  @include respond-to-max(sm) {
    gap: $spacing-xs;
    padding: 0 $spacing-sm;
  }

  &::-webkit-scrollbar {
    display: none;
  }

  scrollbar-width: none;
}

.tab-item {
  font-family: $font-family-main;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  text-align: center;
  flex-grow: 1;
  min-width: fit-content;

  @include respond-to-max(sm) {
    flex: 0 0 auto;
    min-width: 80px;
  }

  @include respond-to-max(md) {
    font-size: 12px;
  }

  &__link {
    @include button-base;
    width: 100%;
    display: block;
    border-radius: 0;
    border-bottom: 3px solid #e1e4ed;
    color: #6d758f;
    padding: 15px 18px;

    @include respond-to-max(sm) {
      padding: $spacing-sm $spacing-xs;
      gap: 2px;
    }

    @include respond-to-max(md) {
      padding: $spacing-sm;
    }
  }

  &__link--active {
    color: #0cadbb;
    font-weight: 600;
    border-bottom-color: #0cadbb;
  }

  &__icon {
    font-size: 18px;

    @include respond-to-max(sm) {
      font-size: 14px;
    }
  }

  &__text {
    white-space: nowrap;

    @include respond-to-max(sm) {
      font-size: 10px;
    }
  }
}

.service-tab {
  padding: 20px 0px;

  &__title {
    @include label-base;
    font-weight: 400;
    font-size: 14px;
    line-height: 24px;
    color: #19213d;
  }

  &__badges-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 10px 0;

    @include respond-to-max(sm) {
      gap: $spacing-xs;
    }
  }

  &__badge {
    @include button-base;
    border-radius: 10px;
    padding: 10px 20px;
    border-width: 1px;
    font-weight: 400;
    color: #6d758f;
    background-color: #f8faff;

    @include respond-to-max(sm) {
      padding: $spacing-xs $spacing-sm;
      font-size: 12px;
    }
  }

  &__badge--active {
    color: #0cadbb;
    background-color: #e7f7f8;
    border: 1px solid #0cadbb;
  }

  &__procedures-wrapper {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    @include respond-to-max(sm) {
      gap: $spacing-xs;
    }
  }

  &__procedure-badge {
    @include button-base;
    border-radius: 16px;
    padding: 2px 8px;
    border-width: 1px;
    font-weight: 400;
    font-size: 12px;
    color: #3541b4;
    background-color: #ebecf7;

    @include respond-to-max(sm) {
      padding: $spacing-xs $spacing-sm;
      font-size: 12px;
    }

    &--active {
      color: #ffffff;
      background-color: #3541b4;
      border: 1px solid #3541b4;
    }
  }

  &__packages {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;

    @include respond-to-max(sm) {
      grid-template-columns: 1fr;
      gap: $spacing-md;
    }
  }

  &__packages-title {
    @include label-base;
    font-weight: 400;
    font-size: 14px;
    line-height: 24px;
    color: #6d758f;
  }

  .service-tab-card {
    width: 100%;
    max-width: 256px;
    height: 100%;
    border-radius: 20px;
    padding-bottom: 15px;
    border-width: 1px;
    background-color: #ffffff;
    border: 1px solid #f1f3f7;
    box-shadow: 0px 2px 8px 0px #00000014;
    overflow: hidden;

    @include respond-to-max(sm) {
      max-width: 100%;
    }

    &__wrapper {
      background-color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
    }

    &__header {
      @include label-base;
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;
      text-transform: uppercase;
      width: 100%;
      padding: 20px;
      color: #19213d;
      background: linear-gradient(
        187.59deg,
        #f8faff 65.03%,
        rgba(248, 250, 255, 0.1) 112.13%
      );

      @include respond-to-max(sm) {
        padding: $spacing-md;
        font-size: 14px;
      }
    }

    &__body {
      padding: 0px 20px;
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;

      @include respond-to-max(sm) {
        padding: 0 $spacing-md;
      }
    }

    &__price {
      @include label-base;
      font-weight: 600;
      font-size: 18px;
      line-height: 20px;
      color: #19213d;
      padding-top: 4px;
      margin-bottom: 2px;
    }

    &__discount {
      @include label-base;
      font-weight: 500;
      font-size: 12px;
      line-height: 16px;
      color: #6d758f;
      padding-bottom: 4px;

      span {
        text-decoration: line-through;
      }
    }

    &__rating-wrapper {
      display: flex;
      align-items: center;
      gap: 3px;
    }

    &__rating {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #fdb022;

      img {
        width: 16px;
        height: 16px;
        color: #fdb022;
      }
    }

    &__reviews {
      font-size: 14px;
      font-weight: 300;
      color: #6d758f;
    }

    &__services-title {
      @include label-base;
      font-weight: 500;
      font-size: 13px;
      line-height: 24px;
      color: #6d758f;
      margin-bottom: 5px;
    }

    &__services {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    &__services-item {
      display: flex;
      align-items: center;
      padding: 0;
      margin: 0;
    }

    &__services-icon-wrapper {
      width: 16px;
      height: 16px;
      display: flex;
      align-items: center;
      margin-right: 8px;
    }

    &__services-text {
      @include label-base;
      font-weight: 500;
      font-size: 14px;
      line-height: 20px;
      color: #353e5c;
    }

    &__availability-wrapper {
      display: flex;
      flex-direction: column;
      padding: 5px 0px;
      gap: 5px;
    }

    &__availability-title {
      @include label-base;
      font-weight: 500;
      font-size: 13px;
      line-height: 24px;
      color: #6d758f;
    }

    &__availability-icon {
      width: 15px;
      height: 15px;
      color: #3541b4;
    }

    &__availability-content {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 0;
    }

    &__availability-text {
      @include label-base;
      font-weight: 500;
      font-size: 14px;
      line-height: 24px;
      color: #353e5c;
    }

    &__assessment-appointment-button {
      @include outline-button;
      width: 100%;
      box-shadow: 0px 1px 2px 0px #1018280d;
    }
  }
}

.location-tab {
  margin-top: 20px;
  display: grid;
  grid-template-columns: 1fr 2fr;

  &__info {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 16px;
    line-height: 28.5px;
    color: #19213d;
  }

  &__address {
    display: flex;
    align-items: center;
    gap: 17px;
  }

  &__icon {
    width: 15px;
    height: 15px;
    color: #0cadbb;
  }

  &__address-text {
    @include label-base;
    font-weight: 300;
    font-size: 16px;
    line-height: 21px;
    color: #6d758f;
  }

  &__contact {
    display: flex;
    gap: 15px;
  }

  .contact-button {
    @include button-base;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 9.04px 12.65px;
    gap: 18.08px;
    border-radius: 20px;
    background-color: #0cadbb;
    box-shadow: 0px 18.08px 28.92px 0px #14253f0f;
    box-shadow: 0px 0px 1.81px 0px #0c1a4b1a;
    color: #ffffff;

    svg {
      width: 30px;
      height: 30px;
    }
  }

  &__map {
    width: 100%;
    height: 100%;
    position: relative;
    border-radius: 20px;
    overflow: hidden;
  }
}

.profile-tab {
  padding: 20px 0px;

  .profile-section {
    &__title {
      @include label-base;
      font-weight: 600;
      font-size: 16px;
      line-height: 24px;
      color: #19213d;
    }

    &__content {
      @include label-base;
      font-weight: 600;
      font-size: 16px;
      line-height: 24px;
      color: #6d758f;
      padding: 15px;
    }
  }
}

.availability-tab {
  padding: 20px 0px;

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-left: 15px;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 16px;
    line-height: 20px;
    color: #19213d;
  }

  .availability-tab-card {
    gap: 17px;
    border-radius: 15px;
    padding: 15px;
    background-color: #f8faff;
    box-shadow: 0px 1px 4px 0px #19213d14;
    margin-top: 22px;

    &__title {
      @include label-base;
      font-weight: 400;
      font-size: 16px;
      line-height: 20px;
      color: #19213d;
    }

    &__date-selection {
      margin: 0;
    }
  }

  &__reservation-button-wrapper {
    display: flex;
    justify-content: flex-end;
  }

  &__reserve-button {
    @include primary-button;
    margin-top: 20px;
  }
}

.day-container {
  display: flex;
  /* margin-top: 20px; */
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
