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
            <AtomsIconsXIcon size="24" />
          </button>
        </div>

        <div class="modal-tab">
          <!-- Loading state -->
          <div v-if="!props.doctor || isLoading">
            <WebsitePerfilDoctorPantallaCarga />
          </div>

          <!-- Content when doctor is loaded -->
          <template v-else>
            <!-- Mostrar mensaje si no hay servicios -->
            <div v-if="!hasServices" class="no-services-message">
              <div class="alert alert-warning">
                <h4>Información de servicios no disponible</h4>
                <p>
                  Este doctor aún no tiene servicios configurados en el sistema.
                </p>
                <p>
                  Puedes agendar una cita de valoración para obtener más
                  información sobre los tratamientos disponibles.
                </p>
              </div>
            </div>

            <!-- Contenido normal cuando hay servicios -->
            <template v-else>
              <!-- Specialty badges -->
              <div class="modal-tab__badges-wrapper">
                <button
                  v-for="specialty in specialties()"
                  :key="specialty.code"
                  @click="selectSpecialty(specialty.code, specialty.id)"
                  class="modal-tab__badge"
                  style="--bs-bg-opacity: 0.07"
                  :class="{
                    'modal-tab__badge--active':
                      selectedSpecialty === specialty.code,
                  }"
                >
                  {{ specialty.name }}
                </button>
              </div>

              <!-- Procedure badges (shown when specialty is selected) -->
              <div class="modal-tab__procedures-wrapper">
                <button
                  v-for="procedure in filteredProcedures"
                  :key="procedure.procedure.code"
                  @click="
                    selectProcedure(
                      procedure.procedure.code,
                      procedure.procedure.id
                    )
                  "
                  class="modal-tab__procedure-badge"
                  :class="{
                    'modal-tab__procedure-badge--active':
                      selectedProcedure === procedure.procedure.code,
                  }"
                >
                  {{ procedure.procedure.name }}
                </button>
              </div>

              <div>
                <p class="modal-tab__packages-title"></p>
              </div>

              <!-- All packages for selected procedure -->
              <div
                v-if="filteredPackages.length > 0"
                class="modal-tab__packages"
              >
                <WebsitePerfilDoctorTarjetaServicio
                  v-for="pkg in filteredPackages"
                  :key="pkg.id"
                  :pkg="pkg"
                  :doctor="props.doctor"
                  :doctor-reviews="doctorReviews()"
                  :get-package-price="getPackagePrice"
                  :get-assesment-label="getAssesmentLabel"
                  :user="user"
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
            </template>

            <!-- Siempre mostrar la cita de valoración al final, independientemente de si hay servicios -->
            <div v-if="!hasServices" class="modal-tab__packages">
              <WebsitePerfilDoctorTarjetaServicio
                :key="1001"
                :pkg="citaValoracionPackage"
                :doctor="props.doctor"
                :doctor-reviews="doctorReviews()"
                :get-package-price="getPackagePrice"
                :get-assesment-label="getAssesmentLabel"
                :user="user"
              />
            </div>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type {
  AssessmentDetail,
  Doctor,
  MedicalSpecialty,
  Package,
  Procedure,
} from "~/types/doctor";

const props = defineProps<{
  doctor: Doctor | null;
  open: boolean;
  user: Object;
  specialtyCode?: string;
  procedureCode?: string;
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

const isLoading = ref(false);

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

const hasServices = computed(() => {
  return props.doctor?.services && props.doctor.services.length > 0;
});

const citaValoracionPackage = computed<Package>(() => ({
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
}));

const setDefaultSpecialtyAndProcedure = async () => {
  isLoading.value = true;
  const authHeader = token.value ? { Authorization: token.value } : undefined;

  try {
    const assessmentResponse = await $fetch<{ data: AssessmentDetail[] }>(
      config.public.API_BASE_URL + "/udc/get_all",
      {
        headers: authHeader,
        params: { type: "ASSESSMENT_DETAIL" },
      }
    );
    assessmentDetails.value = assessmentResponse.data;
  } catch (error) {
    console.error("Error loading assessment details:", error);
  } finally {
    isLoading.value = false;
  }

  if (!props.doctor?.services || props.doctor.services.length === 0) return;

  const matchService = props.doctor.services.find(
    (service) =>
      service.medical_specialty.code === props.specialtyCode &&
      service.procedures.some((p) => p.procedure.code === props.procedureCode)
  );

  const serviceToUse = matchService || props.doctor.services[0];
  selectedSpecialty.value = serviceToUse.medical_specialty.code;
  selectedSpecialtyId.value = serviceToUse.medical_specialty.id;
  appointment.value.specialty = selectedSpecialty.value;

  const procedureToUse =
    serviceToUse.procedures.find(
      (p) => p.procedure.code === props.procedureCode
    ) || serviceToUse.procedures[0];

  if (procedureToUse) {
    selectedProcedure.value = procedureToUse.procedure.code;
    selectedProcedureId.value = procedureToUse.procedure.id;
    appointment.value.service = selectedProcedure.value;
  }
};

const specialties = (): MedicalSpecialty[] => {
  if (!props.doctor?.services) return [];
  return props.doctor.services.map((service) => service.medical_specialty);
};

const selectSpecialty = (specialtyCode: string, specialtyId: number) => {
  if (!props.doctor?.services) return;

  selectedSpecialty.value = specialtyCode;
  selectedSpecialtyId.value = specialtyId;
  selectedProcedure.value = null;
  appointment.value.specialty = specialtyCode;

  const specialty = props.doctor.services.find(
    (s) => s.medical_specialty.code === specialtyCode
  );

  if (specialty?.procedures?.length) {
    const firstProcedure = specialty.procedures[0];
    selectedProcedure.value = firstProcedure.procedure.code;
    selectedProcedureId.value = firstProcedure.procedure.id;
    appointment.value.service = selectedProcedure.value;
  }
};

const filteredProcedures = computed<Procedure[]>(() => {
  if (!props.doctor?.services?.length) {
    return [];
  }

  if (!selectedSpecialty.value && props.doctor.services.length > 0) {
    const firstServiceProcedures = props.doctor.services[0].procedures || [];
    return firstServiceProcedures;
  }

  const specialty = props.doctor.services.find(
    (s) => s.medical_specialty.code === selectedSpecialty.value
  );

  if (!specialty) {
    return [];
  }

  const procedures = specialty.procedures || [];
  return procedures;
});

const selectProcedure = (procedureCode: string, procedureId: number) => {
  selectedProcedure.value = procedureCode;
  selectedProcedureId.value = procedureId;
  appointment.value.service = procedureCode;
};

const filteredPackages = computed<Package[]>(() => {
  if (!props.doctor) {
    return [];
  }

  if (!hasServices.value) {
    return [citaValoracionPackage.value];
  }

  const procedures = filteredProcedures.value;

  if (procedures.length === 0) {
    return [citaValoracionPackage.value];
  }

  let packages: Package[] = [];
  let selectedProcedureData = null;

  if (!selectedProcedure.value && procedures.length > 0) {
    selectedProcedureData = procedures[0];
    packages = procedures[0].packages || [];
  } else if (selectedProcedure.value) {
    selectedProcedureData = procedures.find(
      (p) => p.procedure.code === selectedProcedure.value
    );

    if (selectedProcedureData) {
      packages = selectedProcedureData.packages || [];
    } else {
      console.warn("Selected procedure not found in filtered procedures");
    }
  }

  const finalPackages = [citaValoracionPackage.value, ...packages];
  return finalPackages;
});

const getAssesmentLabel = (assesmentCode: string) => {
  if (!assessmentDetails.value) return assesmentCode;
  const detail = assessmentDetails.value.find(
    (item) => item.code === assesmentCode
  );
  return detail ? detail.name : assesmentCode;
};

const doctorReviews = (): ProcessedDoctorReview[] => {
  if (!props.doctor?.reviews) return [];

  return props.doctor.reviews.map((review) => ({
    first_name: review.customer.split(" ")[0] || "Anónimo",
    last_name: review.is_annonymous ? "" : review.customer.split(" ")[1] || "",
    message: review.comment,
    pacient_type: "Paciente",
    score: review.stars_average,
  }));
};

const getPackagePrice = (pkg: Package) => {
  const price = parseFloat(pkg.product.value1);
  const discount = pkg.discount / 100;
  return price - price * discount;
};

watch(
  () => props.doctor,
  (newDoctor) => {
    if (newDoctor && props.open) {
      setDefaultSpecialtyAndProcedure();
    }
  },
  { immediate: true }
);

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && props.doctor) {
      setDefaultSpecialtyAndProcedure();
    }
  }
);

onMounted(() => {
  modalTitleId.value = `modal-title-${Math.random().toString(36).substring(2, 11)}`;

  if (props.doctor && props.open) {
    setDefaultSpecialtyAndProcedure();
  }
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
  height: 90vh;

  &-content {
    background: $white;
    border-radius: 16px;
    max-width: 1000px;
    height: 90vh;
    width: 100%;
    overflow-y: auto;
    position: relative;

    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 24px;
      border-bottom: 1px solid #e4e7ec;
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

  &-tab {
    padding: 24px;
    overflow-y: auto;
    flex: 1;

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

.no-services-message {
  padding: 20px;

  .alert {
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #ffeaa7;
    background-color: #fff3cd;
    color: #856404;

    h4 {
      margin: 0 0 10px 0;
      font-size: 18px;
      font-weight: 600;
    }

    p {
      margin: 0 0 10px 0;
      line-height: 1.5;

      &:last-child {
        margin-bottom: 0;
      }
    }

    &.alert-warning {
      border-color: #ffeaa7;
      background-color: #fff3cd;
      color: #856404;
    }
  }
}
</style>
