<template>
  <Teleport to="body">
    <div
      v-if="props.open"
      class="modal-backdrop"
      @click.self="emit('close-modal')"
      @keydown.esc="emit('close-modal')"
      role="dialog"
      aria-modal="true"
      :aria-labelledby="modalTitleId"
      tabindex="-1"
    >
      <div class="modal-content" role="document">
        <div class="modal-content__header">
          <h2 :id="modalTitleId" class="modal-content__title">
            Packs de tratamientos
          </h2>
          <button
            class="modal-close-button"
            @click="emit('close-modal')"
            aria-label="Cerrar modal"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-hidden="true"
            >
              <path
                d="M17 7L7 17M17 17L7 7"
                stroke="black"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
          </button>
        </div>

        <hr class="modal-divider" />

        <div class="modal-tab">
          <!-- All packages without filtering -->
          <div v-if="props.doctor">
            <div
              v-if="allPackages.length > 0"
              class="modal-tab__packages"
              role="region"
              aria-live="polite"
            >
              <WebsitePerfilDoctorTarjetaServicio
                v-for="pkg in allPackages"
                :key="pkg.id"
                :pkg="pkg"
                :doctor="props.doctor"
                :doctor-reviews="doctorReviews()"
                :get-package-price="getPackagePrice"
                :get-assesment-label="getAssesmentLabel"
              />
            </div>
            <div v-else class="alert alert-info" role="alert">
              No hay paquetes disponibles
            </div>
          </div>

          <WebsitePerfilDoctorPantallaCarga v-else />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { AssessmentDetail, Doctor, Package } from "~/types/doctor";

const props = defineProps<{
  doctor: Doctor;
  open: boolean;
}>();

const emit = defineEmits(["close-modal"]);

interface ProcessedDoctorReview {
  first_name: string;
  last_name: string;
  message: string;
  pacient_type: string;
  score: number;
}

const config = useRuntimeConfig();
const token = useCookie("token");
const modalTitleId = ref("modal-title");

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

  if (props.doctor.services && props.doctor.services.length > 0) {
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

const allPackages = computed<Package[]>(() => {
  let packages: Package[] = [];

  if (props.doctor.services) {
    props.doctor.services.forEach((service) => {
      if (service.procedures) {
        service.procedures.forEach((procedure) => {
          if (procedure.packages) {
            packages = [...packages, ...procedure.packages];
          }
        });
      }
    });
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
  modalTitleId.value = `modal-title-${Math.random().toString(36).substr(2, 9)}`;
  setDefaultSpecialtyAndProcedure();
});
</script>

<style lang="scss" scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  &-content {
    background: white;
    border-radius: 16px;
    max-height: 90vh;
    max-width: 1000px;
    overflow-y: auto;
    position: relative;
    width: 90%;

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
    }

    &__title {
      @include label-base;
      font-weight: 600;
      font-size: 20px;
      line-height: 28px;
      color: #19213d;
    }
  }

  &-close-button {
    position: absolute;
    top: 12px;
    right: 16px;
    font-size: 24px;
    background: none;
    border: none;
    cursor: pointer;
  }

  &-divider {
    width: 100%;
    height: 1px;
    background-color: #e4e7ec;
    margin: 0;
    padding: 0;
  }

  &-tab {
    padding: 24px;

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

      &--active {
        color: #0cadbb;
        background-color: #e7f7f8;
        border: 1px solid #0cadbb;
      }
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
      flex-direction: row;
      flex-wrap: nowrap;
      gap: 20px;
      width: 100%;
      height: 100%;
      align-items: stretch;
      padding-bottom: 10px;
      overflow: auto;
      -webkit-overflow-scrolling: touch;

      @include respond-to-max(sm) {
        flex-direction: column;
        gap: $spacing-md;
      }

      &::-webkit-scrollbar {
        height: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 4px;
      }

      > * {
        flex: 0 0 auto;
        min-width: 280px;
      }
    }
  }
}
</style>
