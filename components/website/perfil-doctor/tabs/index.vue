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
  watch: {
    selectedMonth(newMonth) {
      this.handleMonthChange();
    },
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

      // Set default specialty and procedure
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

      if (!this.doctor.availabilities) return availabilityMap;

      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 30);

      this.doctor.availabilities.forEach((avail) => {
        const currentDate = new Date(today);
        while (currentDate <= endDate) {
          const weekdayName = currentDate.toLocaleDateString("en-US", {
            weekday: "long",
          });

          if (weekdayName === avail.weekday) {
            const dateStr = currentDate.toISOString().split("T")[0];
            const fromHour = avail.from_hour.substring(0, 5);

            if (!availabilityMap[dateStr]) {
              availabilityMap[dateStr] = [];
            }

            availabilityMap[dateStr].push(fromHour);
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
      let packages = [];

      if (
        !this.selectedProcedure &&
        this.filteredProcedures &&
        this.filteredProcedures.length > 0
      ) {
        this.selectedProcedure = this.filteredProcedures[0].procedure.code;
        this.selectedProcedureId = this.filteredProcedures[0].procedure.id;
        this.appointment.service = this.selectedProcedure;
        packages = this.filteredProcedures[0].packages || [];
      } else {
        const procedure = this.filteredProcedures.find(
          (p) => p.procedure.code === this.selectedProcedure
        );
        packages = procedure?.packages || [];
      }

      const citaValoracionPackage = {
        id: "cita-valoracion",
        product: {
          id: 9999,
          code: "ASSESSMENT_APPOINTMENT",
          name: "Cita de Valoración",
          type: "MEDICAL_PRODUCT",
          description: "Cita de valoración médica inicial",
          father_code: null,
          value1: "25000",
          created_date: new Date().toISOString(),
          updated_date: null,
          is_deleted: 0,
        },
        reference_price: 25000,
        discount: 0,
        discounted_price: 25000,
        services_offer: {
          ASSESSMENT_DETAILS: [
            "MEDICAL_CONSULTATION",
            "CLINICAL_EVALUATION",
            "INITIAL_DIAGNOSIS",
          ],
        },
        is_king: 0,
        observations: "",
        postoperative_assessments: null,
      };

      return [citaValoracionPackage, ...packages];
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

      const sum = this.doctor.reviews.reduce(
        (total, review) => total + review.stars_average,
        0
      );
      const average = sum / this.doctor.reviews.length;
      return Math.round(average * 10) / 10;
    },
    selectDay(date) {
      this.selectedDay = date;
      this.availableHours = this.availability[date] || [];
      this.selectedHour = null;
    },
    selectHour(time) {
      this.selectedHour = time;
    },
    handleMonthChange() {
      this.selectedDay = null;
      this.selectedHour = null;
      this.availableDays = this.getAvailableDaysForMonth(this.selectedMonth);
      this.availableHours = [];
    },
    getAvailableDaysForMonth(month) {
      if (month === null) return [];

      const year = new Date().getFullYear();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const availableDays = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = date.toISOString().split("T")[0];

        if (
          this.availability[dateStr] &&
          this.availability[dateStr].length > 0
        ) {
          const weekdayName = date.toLocaleDateString("en-US", {
            weekday: "long",
          });

          availableDays.push({
            date: dateStr,
            day: this.weekdayMap[weekdayName] || weekdayName.slice(0, 3),
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
        this.selectedDay,
        this.selectedHour
      );
      this.panel = true;
    },
    selectSpecialty(specialtyCode, specialtyId) {
      this.selectedSpecialty = specialtyCode;
      this.selectedSpecialtyId = specialtyId;
      this.selectedProcedure = null;
      this.appointment.specialty = specialtyCode;

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
  },
  mounted() {
    if (this.selectedMonth !== null) {
      this.availableDays = this.getAvailableDaysForMonth(this.selectedMonth);
    }
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
        :class="{ 'tab-item__link--active': tab === 5 }"
        @click="tab = 4"
      >
        Perfil
      </button>
    </li>
  </ul>

  <section class="tabs-content">
    <!-- Servicios Tab -->
    <WebsitePerfilDoctorTabsServicio
      v-if="tab === 1"
      :doctor="doctor"
      :selectSpecialty="selectSpecialty"
      :selectedSpecialty="selectedSpecialty"
      :filteredProcedures="filteredProcedures"
      :selectedProcedure="selectedProcedure"
      :filteredPackages="filteredPackages"
      :selectPackage="selectPackage"
      :getAssesmentLabel="getAssesmentLabel"
      :doctorReviews="doctorReviews"
      :getPackagePrice="getPackagePrice"
      :selectProcedure="selectProcedure"
      :specialties="specialties"
    />

    <WebsitePerfilDoctorTabsDisponibilidad
      v-if="tab === 2"
      :selected-day="selectedDay"
      :available-hours="availableHours"
      :selected-hour="selectedHour"
      :available-days="availableDays"
      :selected-month="selectedMonth"
      :months="months"
      :availability="availability"
      :format-time="formatTime"
      :reserve-appointment="reserveAppointment"
      @update:selected-day="selectDay"
      @update:selected-month="
        selectedMonth = $event;
        handleMonthChange();
      "
      @update:selected-hour="selectHour"
    />

    <!-- Ubicación Tab -->
    <WebsitePerfilDoctorTabsUbicacion v-if="tab === 3" :doctor="doctor" />

    <!-- Perfil Tab -->
    <WebsitePerfilDoctorTabsPerfil v-if="tab === 4" :doctor="doctor" />
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
