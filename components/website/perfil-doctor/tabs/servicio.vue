<template>
  <div class="service-tab">
    <p class="service-tab__title">Servicios disponibles</p>

    <!-- Specialty badges -->
    <div class="service-tab__badges-wrapper">
      <button
        v-for="specialty in specialties()"
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
      <p class="service-tab__packages-title"></p>
    </div>

    <!-- All packages for selected procedure -->
    <div v-if="filteredPackages.length > 0" class="service-tab__packages">
      <WebsitePerfilDoctorTarjetaServicio
        v-for="pkg in filteredPackages"
        :key="pkg.id"
        :pkg="pkg"
        :doctor="props.doctor"
        :doctor-reviews="doctorReviews()"
        :get-package-price="getPackagePrice"
        :get-assesment-label="getAssesmentLabel"
        :select-package="props.selectPackage"
        :selected-package="pkg"
        :user-info="props.userInfo"
        :selected-specialty-id="selectedSpecialtyId || 0"
        :selected-procedure-id="selectedProcedureId || 0"
      />
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
</template>

<script setup lang="ts">
import type {
  AssessmentDetail,
  Doctor,
  MedicalSpecialty,
  Package,
  Procedure,
} from "~/types/doctor";

interface ProcessedDoctorReview {
  first_name: string;
  last_name: string;
  message: string;
  pacient_type: string;
  score: number;
}

interface Props {
  doctor: Doctor;
  selectPackage: (selectedPackage: Package) => void;
  userInfo: Object;
  searchSpecialtyCode?: string;
  searchProcedureCode?: string;
  isSearchMode?: boolean;
}

const props = defineProps<Props>();
const config = useRuntimeConfig();
const token = useCookie("token");

const selectedSpecialty = ref<string | null>(null);
const selectedSpecialtyId = ref<number | null>(null);
const selectedProcedure = ref<string | null>(null);
const assessmentDetails = ref<AssessmentDetail[]>([]);
const selectedProcedureId = ref<number | null>(null);
const appointment = ref({
  specialty: "",
  service: "",
  location: "",
  type: "",
  date: "",
  time: "",
});

const setDefaultSpecialtyAndProcedure = async () => {
  const authHeader = token.value ? { Authorization: token.value } : undefined;
  const assessmentResponse = await $fetch<{ data: AssessmentDetail[] }>(
    config.public.API_BASE_URL + "/udc/get_all",
    {
      headers: authHeader,
      params: { type: "ASSESSMENT_DETAIL" },
    }
  );

  assessmentDetails.value = assessmentResponse.data;

  // Initialize based on search parameters or defaults
  if (props.searchSpecialtyCode) {
    const specialty = props.doctor.services?.find(
      (s) => s.medical_specialty.code === props.searchSpecialtyCode
    );
    if (specialty) {
      selectedSpecialty.value = specialty.medical_specialty.code;
      selectedSpecialtyId.value = specialty.medical_specialty.id;
      appointment.value.specialty = selectedSpecialty.value;

      // If we also have a procedure code from search
      if (props.searchProcedureCode) {
        const procedure = specialty.procedures?.find(
          (p) => p.procedure.code === props.searchProcedureCode
        );
        if (procedure) {
          selectedProcedure.value = procedure.procedure.code;
          selectedProcedureId.value = procedure.procedure.id;
          appointment.value.service = selectedProcedure.value;
        }
      } else if (specialty.procedures && specialty.procedures.length > 0) {
        // Default to first procedure if no specific procedure searched
        selectedProcedure.value = specialty.procedures[0].procedure.code;
        selectedProcedureId.value = specialty.procedures[0].procedure.id;
        appointment.value.service = selectedProcedure.value;
      }
    }
  } else if (props.doctor.services && props.doctor.services.length > 0) {
    // Default behavior - use first available specialty and procedure
    selectedSpecialty.value = props.doctor.services[0].medical_specialty.code;
    selectedSpecialtyId.value = props.doctor.services[0].medical_specialty.id;
    appointment.value.specialty = selectedSpecialty.value;
    if (
      props.doctor.services[0].procedures &&
      props.doctor.services[0].procedures.length > 0
    ) {
      selectedProcedure.value =
        props.doctor.services[0].procedures[0].procedure.code;
      selectedProcedureId.value =
        props.doctor.services[0].procedures[0].procedure.id;
      appointment.value.service = selectedProcedure.value;
    }
  }
};

const specialties = (): MedicalSpecialty[] => {
  return (
    props.doctor.services?.map((service) => service.medical_specialty) || []
  );
};

const selectSpecialty = (specialtyCode: string, specialtyId: number) => {
  selectedSpecialty.value = specialtyCode;
  selectedSpecialtyId.value = specialtyId;
  selectedProcedure.value = null;
  appointment.value.specialty = specialtyCode;

  const specialty = props.doctor.services.find(
    (s) => s.medical_specialty.code === specialtyCode
  );
  if (specialty && specialty.procedures && specialty.procedures.length > 0) {
    selectedProcedure.value = specialty.procedures[0].procedure.code;
    selectedProcedureId.value = specialty.procedures[0].procedure.id;
    appointment.value.service = selectedProcedure.value;
  }
};

const filteredProcedures = computed<Procedure[]>((): Procedure[] => {
  if (
    !selectedSpecialty.value &&
    props.doctor.services &&
    props.doctor.services.length > 0
  ) {
    selectedSpecialty.value = props.doctor.services[0].medical_specialty.code;
    appointment.value.specialty = selectedSpecialty.value;
    return props.doctor.services[0].procedures || [];
  }

  const specialty = props.doctor.services.find(
    (s) => s.medical_specialty.code === selectedSpecialty.value
  );

  return specialty?.procedures || [];
});

const selectProcedure = (procedureCode: string, procedureId: number) => {
  selectedProcedure.value = procedureCode;
  selectedProcedureId.value = procedureId;
  appointment.value.service = procedureCode;
};

const filteredPackages = computed<Package[]>(() => {
  let packages = [];

  if (!selectedProcedure.value && filteredProcedures.value.length > 0) {
    selectedProcedure.value = filteredProcedures.value[0].procedure.code;
    selectedProcedureId.value = filteredProcedures.value[0].procedure.id;
    appointment.value.service = selectedProcedure.value;
    packages = filteredProcedures.value[0].packages || [];
  } else {
    const procedure = filteredProcedures.value.find(
      (p) => p.procedure.code === selectedProcedure.value
    );
    packages = procedure?.packages || [];
  }

  const citaValoracionPackage: Package = {
    id: 1001,
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
});

const getAssesmentLabel = (assesmentCode: string) => {
  if (!assessmentDetails.value) return assesmentCode;
  const detail = assessmentDetails.value.find(
    (item) => item.code === assesmentCode
  );
  return detail ? detail.name : assesmentCode;
};

const doctorReviews = (): ProcessedDoctorReview[] => {
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
};

const getPackagePrice = (pkg: Package) => {
  const price = parseFloat(pkg.product.value1);
  const discount = pkg.discount / 100;
  return price - price * discount;
};

onMounted(() => {
  setDefaultSpecialtyAndProcedure();
});
</script>

<style lang="scss" scoped>
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
    color: #6d758f;
    background-color: #f8faff;

    @include respond-to-max(sm) {
      padding: $spacing-xs $spacing-sm;
      font-size: 12px;
    }

    &--active {
      color: #242d7c;
      background-color: #ebecf7;
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
    margin-top: 12px;
  }
}
</style>
