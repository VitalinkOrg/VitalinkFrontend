<script setup>
import { useCookie, useRuntimeConfig } from "nuxt/app";
import { computed, onMounted, reactive, ref, watch } from "vue";

const props = defineProps({
  doctor: {
    type: Object,
    default: () => ({}),
  },
  searchSpecialtyCode: {
    type: String,
    default: null,
  },
  searchProcedureCode: {
    type: String,
    default: null,
  },
});

const panel = ref(false);
const user = useCookie("user_info");
const tab = ref(1);
const appointment = reactive({
  specialty: "",
  service: "",
  location: "",
  type: "",
  date: "",
  time: "",
});
const result = ref(null);
const open = ref(false);
const errorText = ref("");
const selectedMonth = ref(null);
const selectedDay = ref(null);
const selectedHour = ref(null);
const availableDays = ref([]);
const availableHours = ref([]);
const breadcumCitaValoracion = ref(1);
const selectedSpecialty = ref(null);
const selectedSpecialtyId = ref(null);
const selectedPackage = ref(null);
const selectedProcedure = ref(null);
const selectedProcedureId = ref(null);
const reviewDetails = ref([]);
const assessmentDetails = ref([]);

const selectedSpecialtyName = computed(() => {
  if (!selectedSpecialty.value || !props.doctor.services) return "";

  const service = props.doctor.services.find(
    (s) => s.medical_specialty.code === selectedSpecialty.value
  );
  return service ? service.medical_specialty.name : selectedSpecialty.value;
});

const selectedProcedureName = computed(() => {
  if (!selectedProcedure.value || !props.doctor.services) return "";

  for (const service of props.doctor.services) {
    const procedure = service.procedures?.find(
      (p) => p.procedure.code === selectedProcedure.value
    );
    if (procedure) {
      return procedure.procedure.name;
    }
  }
  return selectedProcedure.value;
});

const months = ref([
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
]);

const weekdayMap = ref({
  Monday: "Lun",
  Tuesday: "Mar",
  Wednesday: "Mié",
  Thursday: "Jue",
  Friday: "Vie",
  Saturday: "Sáb",
  Sunday: "Dom",
});

watch(selectedMonth, (newMonth) => {
  handleMonthChange();
});

const isSearchMode = computed(() => {
  return props.searchSpecialtyCode || props.searchProcedureCode;
});

const doctorReviews = computed(() => {
  return (
    props.doctor.reviews?.map((review) => ({
      first_name: review.customer.split(" ")[0] || "Anónimo",
      last_name: review.is_annonymous
        ? ""
        : review.customer.split(" ")[1] || "",
      message: review.comment,
      pacient_type: "Paciente",
      score: review.stars_average,
    })) || []
  );
});

const availability = computed(() => {
  const availabilityMap = {};

  if (!props.doctor.availabilities) return availabilityMap;

  const today = new Date();
  const endDate = new Date();
  endDate.setDate(today.getDate() + 30);

  props.doctor.availabilities.forEach((avail) => {
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
});

const specialties = computed(() => {
  return (
    props.doctor.services?.map((service) => service.medical_specialty) || []
  );
});

const filteredProcedures = computed(() => {
  if (
    !selectedSpecialty.value &&
    props.doctor.services &&
    props.doctor.services.length > 0
  ) {
    selectedSpecialty.value = props.doctor.services[0].medical_specialty.code;
    appointment.specialty = selectedSpecialty.value;
    return props.doctor.services[0].procedures;
  }

  const specialty = props.doctor.services.find(
    (s) => s.medical_specialty.code === selectedSpecialty.value
  );

  return specialty?.procedures || [];
});

const filteredPackages = computed(() => {
  let packages = [];

  if (
    !selectedProcedure.value &&
    filteredProcedures.value &&
    filteredProcedures.value.length > 0
  ) {
    selectedProcedure.value = filteredProcedures.value[0].procedure.code;
    selectedProcedureId.value = filteredProcedures.value[0].procedure.id;
    appointment.service = selectedProcedure.value;
    packages = filteredProcedures.value[0].packages || [];
  } else {
    const procedure = filteredProcedures.value.find(
      (p) => p.procedure.code === selectedProcedure.value
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
      value1: "18000",
      created_date: new Date().toISOString(),
      updated_date: null,
      is_deleted: 0,
    },
    reference_price: 18000,
    discount: 0,
    discounted_price: 18000,
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
});

const getAssesmentLabel = (assesmentCode) => {
  if (!assessmentDetails.value) return assesmentCode;
  const detail = assessmentDetails.value.find(
    (item) => item.code === assesmentCode
  );
  return detail ? detail.name : assesmentCode;
};

const selectDay = (date) => {
  selectedDay.value = date;
  availableHours.value = availability.value[date] || [];
  selectedHour.value = null;
};

const selectHour = (time) => {
  selectedHour.value = time;
};

const handleMonthChange = () => {
  selectedDay.value = null;
  selectedHour.value = null;
  availableDays.value = getAvailableDaysForMonth(selectedMonth.value);
  availableHours.value = [];
};

const getAvailableDaysForMonth = (month) => {
  if (month === null) return [];

  const year = new Date().getFullYear();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const availableDaysArray = [];

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = date.toISOString().split("T")[0];

    if (availability.value[dateStr] && availability.value[dateStr].length > 0) {
      const weekdayName = date.toLocaleDateString("en-US", {
        weekday: "long",
      });

      availableDaysArray.push({
        date: dateStr,
        day: weekdayMap.value[weekdayName] || weekdayName.slice(0, 3),
        number: date.getDate(),
      });
    }
  }

  return availableDaysArray;
};

const formatTime = (time) => {
  const [hours, minutes] = time.split(":");
  const period = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${minutes}${period}`;
};

const closeModal = () => {
  open.value = false;
};

const reserveAppointment = () => {
  if (panel.value) {
    panel.value = false;
    return;
  }
  panel.value = true;
};

const selectSpecialty = (specialtyCode, specialtyId) => {
  selectedSpecialty.value = specialtyCode;
  selectedSpecialtyId.value = specialtyId;
  selectedProcedure.value = null;
  appointment.specialty = specialtyCode;

  const specialty = props.doctor.services.find(
    (s) => s.medical_specialty.code === specialtyCode
  );
  if (specialty && specialty.procedures && specialty.procedures.length > 0) {
    selectedProcedure.value = specialty.procedures[0].procedure.code;
    selectedProcedureId.value = specialty.procedures[0].procedure.id;
    appointment.service = selectedProcedure.value;
  }
};

const selectPackage = (selectedPkg) => {
  selectedPackage.value = selectedPkg;
  tab.value = 2;
};

const selectProcedure = (procedureCode, procedureId) => {
  selectedProcedure.value = procedureCode;
  selectedProcedureId.value = procedureId;
  appointment.service = procedureCode;
};

const getPackagePrice = (pkg) => {
  const price = parseFloat(pkg.product.value1);
  const discount = pkg.discount / 100;
  return price - price * discount;
};

const initializeDefaults = () => {
  if (props.doctor.services && props.doctor.services.length > 0) {
    selectedSpecialty.value = props.doctor.services[0].medical_specialty.code;
    selectedSpecialtyId.value = props.doctor.services[0].medical_specialty.id;
    appointment.specialty = selectedSpecialty.value;
    if (
      props.doctor.services[0].procedures &&
      props.doctor.services[0].procedures.length > 0
    ) {
      selectedProcedure.value =
        props.doctor.services[0].procedures[0].procedure.code;
      selectedProcedureId.value =
        props.doctor.services[0].procedures[0].procedure.id;
      appointment.service = selectedProcedure.value;
    }
  }
};

const loadApiData = async () => {
  const token = useCookie("token");
  const config = useRuntimeConfig();

  try {
    const reviewResponse = await $fetch(
      config.public.API_BASE_URL + "/udc/get_all",
      {
        headers: { Authorization: token.value },
        params: { type: "REVIEW" },
      }
    );
    reviewDetails.value = reviewResponse.data;

    const assessmentResponse = await $fetch(
      config.public.API_BASE_URL + "/udc/get_all",
      {
        headers: { Authorization: token.value },
        params: { type: "ASSESSMENT_DETAIL" },
      }
    );
    assessmentDetails.value = assessmentResponse.data;
  } catch (error) {
    console.error("Error fetching details:", error);
  }
};

initializeDefaults();

onMounted(() => {
  if (selectedMonth.value !== null) {
    availableDays.value = getAvailableDaysForMonth(selectedMonth.value);
  }

  loadApiData();
});
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
      :selectedProcedure="selectedProcedure"
      :filteredProcedures="filteredProcedures"
      :filteredPackages="filteredPackages"
      :selectPackage="selectPackage"
      :getAssesmentLabel="getAssesmentLabel"
      :doctorReviews="doctorReviews"
      :getPackagePrice="getPackagePrice"
      :selectProcedure="selectProcedure"
      :specialties="specialties"
      :searchSpecialtyCode="searchSpecialtyCode"
      :searchProcedureCode="searchProcedureCode"
      :isSearchMode="isSearchMode"
      :userInfo="user"
    />

    <WebsitePerfilDoctorTabsDisponibilidad
      v-if="tab === 2"
      :supplier-id="doctor.id"
      :supplier-name="doctor.name"
      :selected-day="selectedDay"
      :available-hours="availableHours"
      :selected-hour="selectedHour"
      :available-days="availableDays"
      :selected-month="selectedMonth"
      :selectedSpecialty="selectedSpecialtyName"
      :selectedProcedure="selectedProcedureName"
      :selected-package="selectedPackage"
      :months="months"
      :customer="user"
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
}
</style>
