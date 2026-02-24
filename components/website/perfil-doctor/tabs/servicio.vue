<script lang="ts" setup>
import type {
  AssessmentDetail,
  Customer,
  MedicalSpecialty,
  Package,
  Procedures,
  Supplier,
} from "@/types";

interface Props {
  supplier?: Supplier | Partial<Supplier> | null;
  selectPackage: (selectedPackage: Package) => void;
  customer?: Customer | null;
  searchSpecialtyCode?: string | null;
  searchProcedureCode?: string | null;
  isSearchMode?: boolean;
  selectedSpecialty?: string | null;
  selectedProcedure?: string | null;
  filteredProcedures?: Procedures[];
  filteredPackages?: Package[];
  selectSpecialty?: (code: string, id: number) => void;
  selectProcedure?: (code: string, id: number) => void;
  specialties?: MedicalSpecialty[];
  getAssessmentLabel: (code: string) => string;
  assessmentDetails?: AssessmentDetail[];
}

const props = withDefaults(defineProps<Props>(), {
  supplier: null,
  customer: null,
  searchSpecialtyCode: null,
  searchProcedureCode: null,
  isSearchMode: false,
  selectedSpecialty: null,
  selectedProcedure: null,
  filteredProcedures: () => [],
  filteredPackages: () => [],
  selectSpecialty: undefined,
  selectProcedure: undefined,
  specialties: () => [],
  assessmentDetails: () => [],
});

const { formatCurrency } = useFormat();

const currentSupplier = computed<Supplier | Partial<Supplier> | null>(() => {
  return props.supplier || null;
});

const supplierServices = computed(() => {
  const services = currentSupplier.value?.services;
  return Array.isArray(services) ? services : [];
});

const hasServices = computed<boolean>(() => {
  return supplierServices.value.length > 0;
});

const availableSpecialties = computed<MedicalSpecialty[]>(() => {
  if (props.specialties && props.specialties.length > 0) {
    return props.specialties;
  }
  return supplierServices.value
    .map((service) => service.medical_specialty)
    .filter(
      (specialty): specialty is MedicalSpecialty => specialty !== undefined,
    );
});

const currentFilteredProcedures = computed<Procedures[]>(() => {
  if (props.filteredProcedures && props.filteredProcedures.length > 0) {
    return props.filteredProcedures;
  }

  if (!props.selectedSpecialty || !hasServices.value) return [];

  const specialty = supplierServices.value.find(
    (s) => s.medical_specialty?.code === props.selectedSpecialty,
  );

  return Array.isArray(specialty?.procedures) ? specialty.procedures : [];
});

const currentFilteredPackages = computed<Package[]>(() => {
  if (props.filteredPackages && props.filteredPackages.length > 0) {
    return props.filteredPackages.filter(
      (pkg) => pkg.product?.code !== "ASSESSMENT_APPOINTMENT",
    );
  }

  let packages: Package[] = [];

  if (!props.selectedProcedure && currentFilteredProcedures.value.length > 0) {
    const firstProcedure = currentFilteredProcedures.value[0];
    if (firstProcedure?.procedure && Array.isArray(firstProcedure.packages)) {
      packages = firstProcedure.packages;
    }
  } else {
    const procedure = currentFilteredProcedures.value.find(
      (p) => p.procedure?.code === props.selectedProcedure,
    );
    packages = Array.isArray(procedure?.packages) ? procedure.packages : [];
  }

  return packages.filter(
    (pkg) => pkg.product?.code !== "ASSESSMENT_APPOINTMENT",
  );
});

const handleSelectSpecialty = (
  specialtyCode: string,
  specialtyId: number,
): void => {
  if (props.selectSpecialty) {
    props.selectSpecialty(specialtyCode, specialtyId);
  }
};

const handleSelectProcedure = (
  procedureCode: string,
  procedureId: number,
): void => {
  if (props.selectProcedure) {
    props.selectProcedure(procedureCode, procedureId);
  }
};

const supplierReviews = (): {
  first_name: string;
  last_name: string;
  message: string;
  pacient_type: string;
  score: number;
}[] => {
  const reviews = currentSupplier.value?.reviews;
  if (!Array.isArray(reviews)) return [];

  return reviews.map((review) => {
    const customerParts = review.customer
      ? review.customer.split(" ")
      : ["Anónimo"];
    return {
      first_name: customerParts[0] || "Anónimo",
      last_name: review.is_annonymous ? "" : customerParts[1] || "",
      message: review.comment || "",
      pacient_type: "Paciente",
      score: review.stars_average || 0,
    };
  });
};

const getPackagePrice = (pkg: Package): number => {
  if (!pkg?.product?.value1) return 0;
  const price = parseFloat(pkg.product.value1);
  const discount = (pkg.discount || 0) / 100;
  return price - price * discount;
};

const formatPackagePrice = (pkg: Package): string => {
  const price = getPackagePrice(pkg);
  return formatCurrency(price);
};

const selectedSpecialityId = computed(() => {
  return props.supplier
    ? props.supplier.services?.find(
        (s) => s.medical_specialty?.code === props.selectedSpecialty,
      )?.medical_specialty?.id || 0
    : 0;
});

const selectedProcedureId = computed(() => {
  return props.selectedProcedure
    ? currentFilteredProcedures.value.find(
        (p) => p.procedure?.code === props.selectedProcedure,
      )?.procedure?.id || 0
    : 0;
});

const selectedProcedureName = computed(() => {
  return props.selectedProcedure
    ? currentFilteredProcedures.value.find(
        (p) => p.procedure?.code === props.selectedProcedure,
      )?.procedure?.name || ""
    : "";
});
</script>

<template>
  <div class="service-tab">
    <p class="service-tab__title">Servicios disponibles</p>

    <div v-if="!currentSupplier" class="empty-state">
      <p>No se encontró información del proveedor médico.</p>
    </div>

    <div v-else-if="!hasServices" class="empty-state">
      <p>Este proveedor no tiene servicios disponibles.</p>
    </div>

    <template v-else>
      <div class="service-tab__badges-wrapper">
        <button
          v-for="specialty in availableSpecialties"
          :key="specialty.code || specialty.id"
          @click="handleSelectSpecialty(specialty.code, specialty.id)"
          class="service-tab__badge"
          style="--bs-bg-opacity: 0.07"
          :class="{
            'service-tab__badge--active':
              props.selectedSpecialty === specialty.code,
          }"
        >
          {{ specialty.name || "Sin nombre" }}
        </button>
      </div>

      <div
        v-if="currentFilteredProcedures.length > 0"
        class="service-tab__procedures-wrapper"
      >
        <button
          v-for="procedure in currentFilteredProcedures"
          :key="procedure.procedure?.code || procedure.procedure?.id"
          @click="
            handleSelectProcedure(
              procedure.procedure?.code || '',
              procedure.procedure?.id || 0,
            )
          "
          class="service-tab__procedure-badge"
          :class="{
            'service-tab__procedure-badge--active':
              props.selectedProcedure === procedure.procedure?.code,
          }"
        >
          {{ procedure.procedure?.name || "Procedimiento sin nombre" }}
        </button>
      </div>

      <div
        v-if="currentFilteredPackages.length > 0"
        class="service-tab__packages"
      >
        <WebsitePerfilDoctorTarjetaServicio
          v-for="pkg in currentFilteredPackages"
          :key="pkg.id"
          :pkg="pkg"
          :supplier="currentSupplier"
          :supplier-reviews="supplierReviews()"
          :get-package-price="formatPackagePrice"
          :get-assessment-label="props.getAssessmentLabel"
          :customer="props.customer"
          :selected-specialty-id="selectedSpecialityId"
          :selected-procedure-id="selectedProcedureId"
          :procedure-name="selectedProcedureName"
          :select-package="props.selectPackage"
          :selected-package="pkg"
        />
      </div>
    </template>
  </div>
</template>

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
    margin-bottom: 16px;

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
    overflow-x: auto;
    margin-top: 20px;
    -webkit-overflow-scrolling: touch;

    @include respond-to-max(sm) {
      flex-direction: column;
      gap: $spacing-md;
      align-items: stretch;
    }

    &::-webkit-scrollbar {
      height: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 4px;
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

.button {
  &--outline {
    @include outline-button;
  }
}
</style>
