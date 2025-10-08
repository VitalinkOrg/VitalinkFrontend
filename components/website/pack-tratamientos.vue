<template>
  <AtomsModalBase
    :is-open="open"
    size="extra-large"
    :close-on-backdrop="false"
    @close="emit('close-modal')"
  >
    <template #title>
      <h2 :id="modalTitleId" class="modal-content__title">
        Packs de tratamientos
      </h2>
    </template>

    <div class="modal-tab">
      <div v-if="isLoading">
        <WebsitePerfilDoctorPantallaCarga />
      </div>

      <template v-else-if="supplier">
        <div v-if="!hasServices" class="no-services-message">
          <div class="alert alert-warning">
            <h4>Información de servicios no disponible</h4>
            <p>
              Este doctor aún no tiene servicios configurados en el sistema.
            </p>
            <p>
              Puedes agendar una cita de valoración para obtener más información
              sobre los tratamientos disponibles.
            </p>
          </div>
        </div>

        <template v-else>
          <div class="modal-tab__badges-wrapper">
            <button
              v-for="specialty in specialties"
              :key="specialty.code"
              @click="selectSpecialty(specialty)"
              class="modal-tab__badge"
              style="--bs-bg-opacity: 0.07"
              :class="{
                'modal-tab__badge--active':
                  selectedSpecialty?.code === specialty.code,
              }"
            >
              {{ specialty.name }}
            </button>
          </div>

          <div class="modal-tab__procedures-wrapper">
            <button
              v-for="procedure in currentProcedures"
              :key="procedure.procedure.code"
              @click="selectProcedure(procedure)"
              class="modal-tab__procedure-badge"
              :class="{
                'modal-tab__procedure-badge--active':
                  selectedProcedure?.procedure.code ===
                  procedure.procedure.code,
              }"
            >
              {{ procedure.procedure.name }}
            </button>
          </div>

          <div v-if="currentPackages.length > 0" class="modal-tab__packages">
            <WebsitePerfilDoctorTarjetaServicio
              v-for="pkg in currentPackages"
              :key="pkg.id"
              :pkg="pkg"
              :supplier="supplier"
              :supplierReviews="doctorReviews"
              :getPackagePrice="getPackagePrice"
              :getAssessmentLabel="getAssessmentLabel"
              :customer="userInfo"
              :selectedSpecialtyId="selectedSpecialty?.id || 0"
              :selectedProcedureId="selectedProcedure?.procedure.id || 0"
              :procedureName="
                selectedProcedure?.procedure.name ||
                currentProcedures[0]?.procedure.name ||
                ''
              "
            />
          </div>

          <div
            v-else-if="currentProcedures.length === 0"
            class="alert alert-info"
          >
            No hay procedimientos disponibles para esta especialidad
          </div>
          <div v-else class="alert alert-info">
            No hay paquetes disponibles para este procedimiento
          </div>
        </template>

        <div v-if="!hasServices" class="modal-tab__packages">
          <WebsitePerfilDoctorTarjetaServicio
            :key="`assessment-${assessmentPackage.id}`"
            :pkg="assessmentPackage"
            :supplier="supplier"
            :supplierReviews="doctorReviews"
            :getPackagePrice="getPackagePrice"
            :getAssessmentLabel="getAssessmentLabel"
            :selectedSpecialtyId="0"
            :selectedProcedureId="0"
            :customer="userInfo"
            :procedureName="''"
          />
        </div>
      </template>
    </div>
  </AtomsModalBase>
</template>

<script setup lang="ts">
import { useSupplier, useUdc } from "@/composables/api";
import type {
  AssessmentDetail,
  Customer,
  MedicalSpecialty,
  Package,
  Procedures,
  Supplier,
} from "@/types";

const props = defineProps<{
  supplierId: number;
  open: boolean;
  userInfo: Customer;
  specialtyCode?: string;
  procedureCode?: string;
}>();

const emit = defineEmits(["close-modal"]);

const modalTitleId = ref(
  `modal-title-${Math.random().toString(36).substring(2, 11)}`
);
const isLoading = ref(false);
const supplier = ref<Supplier | null>(null);
const assessmentDetails = ref<AssessmentDetail[]>([]);
const selectedSpecialty = ref<MedicalSpecialty | null>(null);
const selectedProcedure = ref<Procedures | null>(null);

const { fetchSupplier } = useSupplier();
const { fetchUdc } = useUdc();

const hasServices = computed(() => {
  return supplier.value?.services && supplier.value.services.length > 0;
});

const specialties = computed(
  () => supplier.value?.services?.map((s) => s.medical_specialty) || []
);

const currentProcedures = computed(() => {
  if (!hasServices.value) return [];

  const service = selectedSpecialty.value
    ? supplier.value?.services?.find(
        (s) => s.medical_specialty.code === selectedSpecialty.value?.code
      )
    : supplier.value?.services?.[0];

  return service?.procedures || [];
});

const currentPackages = computed(() => {
  if (!hasServices.value) return [assessmentPackage.value];
  if (currentProcedures.value.length === 0) return [assessmentPackage.value];

  const procedure = selectedProcedure.value || currentProcedures.value[0];
  const packages = procedure?.packages || [];

  return [assessmentPackage.value, ...packages];
});

const assessmentPackage = computed<Package>(() => ({
  id: selectedProcedure.value?.packages?.[0]?.id || 0,
  product: {
    id: 9999,
    code: "ASSESSMENT_APPOINTMENT",
    name: "Cita de Valoración",
    type: "MEDICAL_PRODUCT",
    description: "Cita de valoración médica inicial",
    father_code: null,
    value1: "18000",
    value2: null,
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
  is_deleted: 0,
  created_date: new Date().toISOString(),
  updated_date: null,
}));

const doctorReviews = computed(
  () =>
    supplier.value?.reviews?.map((review) => ({
      first_name: review.customer.split(" ")[0] || "Anónimo",
      last_name: review.is_annonymous
        ? ""
        : review.customer.split(" ")[1] || "",
      message: review.comment,
      pacient_type: "Paciente",
      score: review.stars_average,
    })) || []
);

const selectSpecialty = (specialty: MedicalSpecialty) => {
  selectedSpecialty.value = specialty;

  const service = supplier.value?.services?.find(
    (s) => s.medical_specialty.code === specialty.code
  );
  selectedProcedure.value = service?.procedures?.[0] || null;
};

const selectProcedure = (procedure: Procedures) => {
  selectedProcedure.value = procedure;
};

const getPackagePrice = (pkg: Package) => {
  const price = parseFloat(pkg.product.value1);
  const discount = pkg.discount / 100;
  return price - price * discount;
};

const getAssessmentLabel = (assessmentCode: string) => {
  const detail = assessmentDetails.value?.find(
    (item) => item.code === assessmentCode
  );
  return detail?.name || assessmentCode;
};

const initializeSelection = () => {
  if (!hasServices.value) return;

  const matchedService = supplier.value?.services?.find(
    (s) =>
      s.medical_specialty.code === props.specialtyCode &&
      s.procedures.some((p) => p.procedure.code === props.procedureCode)
  );

  const service = matchedService || supplier.value?.services?.[0];
  if (!service) return;

  selectedSpecialty.value = service.medical_specialty;

  const procedure =
    service.procedures.find((p) => p.procedure.code === props.procedureCode) ||
    service.procedures[0];

  selectedProcedure.value = procedure || null;
};

const loadData = async () => {
  isLoading.value = true;

  try {
    console.log({ supplierId: props.supplierId });
    const supplierApi = fetchSupplier(props.supplierId);
    await supplierApi.request();

    if (supplierApi.response.value?.data) {
      supplier.value = supplierApi.response.value.data;
    }

    const assessmentApi = fetchUdc("ASSESSMENT_DETAIL");
    await assessmentApi.request();

    if (assessmentApi.response.value?.data) {
      assessmentDetails.value = assessmentApi.response.value.data;
    }

    initializeSelection();
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen && !supplier.value) {
      loadData();
    } else if (isOpen && supplier.value) {
      initializeSelection();
    }
  }
);

onMounted(() => {
  if (props.open) loadData();
});
</script>

<style lang="scss" scoped>
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
      padding: 10px 0px;
      overflow: auto;
      margin-top: 20px;
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
