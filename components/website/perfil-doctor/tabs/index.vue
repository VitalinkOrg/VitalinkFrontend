<script lang="ts" setup>
import type {
  AssessmentDetail,
  Customer,
  MedicalSpecialty,
  Package,
  Procedures,
  ReviewDetail,
  Service,
  Supplier,
} from "~/types";

interface Props {
  supplier?: Supplier | Partial<Supplier> | null;
  searchSpecialtyCode?: string | null;
  searchProcedureCode?: string | null;
}

interface AppointmentForm {
  specialty: string | null;
  service: string | null;
  location: string | null;
  type: string | null;
  date: string | null;
  time: string | null;
}

const props = defineProps<Props>();

const { createAssessmentPackage } = useAssessmentPackage();
const { withErrorHandling } = useErrorHandler();

const panel = ref<boolean>(false);
const user = useCookie<Customer>("user_info");
const tab = ref<number>(1);
const appointment = reactive<AppointmentForm>({
  specialty: null,
  service: null,
  location: null,
  type: null,
  date: null,
  time: null,
});
const result = ref<any>(null);
const open = ref<boolean>(false);
const selectedSpecialty = ref<string | null>(null);
const selectedSpecialtyId = ref<number | null>(null);
const selectedPackage = ref<Package | null>(null);
const selectedProcedure = ref<string | null>(null);
const selectedProcedureId = ref<number | null>(null);
const reviewDetails = ref<ReviewDetail[]>([]);
const assessmentDetails = ref<AssessmentDetail[]>([]);
const isLoadingData = ref<boolean>(false);

const currentSupplier = computed<Supplier | Partial<Supplier> | null>(() => {
  return props.supplier || null;
});

const supplierServices = computed<Service[]>(() => {
  const services = currentSupplier.value?.services;
  return Array.isArray(services) ? services : [];
});

const hasServices = computed<boolean>(() => {
  return supplierServices.value.length > 0;
});

const selectedSpecialtyName = computed<string>(() => {
  if (!selectedSpecialty.value || !hasServices.value) return "";

  const service = supplierServices.value.find(
    (s) => s.medical_specialty?.code === selectedSpecialty.value
  );
  return service?.medical_specialty?.name || selectedSpecialty.value;
});

const selectedProcedureName = computed<string>(() => {
  if (!selectedProcedure.value || !hasServices.value) return "";

  for (const service of supplierServices.value) {
    if (!service.procedures || !Array.isArray(service.procedures)) continue;

    const procedure = service.procedures.find(
      (p) => p.procedure?.code === selectedProcedure.value
    );
    if (procedure?.procedure?.name) {
      return procedure.procedure.name;
    }
  }
  return selectedProcedure.value;
});

const isSearchMode = computed<boolean>(() => {
  return Boolean(props.searchSpecialtyCode || props.searchProcedureCode);
});

const specialties = computed<MedicalSpecialty[]>(() => {
  return supplierServices.value
    .map((service) => service.medical_specialty)
    .filter(
      (specialty): specialty is MedicalSpecialty => specialty !== undefined
    );
});

const filteredProcedures = computed<Procedures[]>(() => {
  if (!selectedSpecialty.value && hasServices.value) {
    const firstService = supplierServices.value[0];
    if (firstService?.medical_specialty?.code) {
      selectedSpecialty.value = firstService.medical_specialty.code;
      appointment.specialty = selectedSpecialty.value;
      return Array.isArray(firstService.procedures)
        ? firstService.procedures
        : [];
    }
  }

  const specialty = supplierServices.value.find(
    (s) => s.medical_specialty?.code === selectedSpecialty.value
  );

  return Array.isArray(specialty?.procedures) ? specialty.procedures : [];
});

const filteredPackages = computed<Package[]>(() => {
  let packages: Package[] = [];

  if (!selectedProcedure.value && filteredProcedures.value.length > 0) {
    const firstProcedure = filteredProcedures.value[0];
    if (firstProcedure?.procedure) {
      selectedProcedure.value = firstProcedure.procedure.code;
      selectedProcedureId.value = firstProcedure.procedure.id;
      appointment.service = selectedProcedure.value;
      packages = Array.isArray(firstProcedure.packages)
        ? firstProcedure.packages
        : [];
    }
  } else {
    const procedure = filteredProcedures.value.find(
      (p) => p.procedure?.code === selectedProcedure.value
    );
    packages = Array.isArray(procedure?.packages) ? procedure.packages : [];
  }

  try {
    const packageId = packages.length > 0 ? packages[0].id : 0;

    const assessmentPackage = createAssessmentPackage(18000, 0, packageId);

    return [assessmentPackage, ...packages];
  } catch (error) {
    console.error("Error creating assessment package:", error);
    return packages;
  }
});

console.log("filteredPackages: ", filteredPackages.value);

const getAssessmentLabel = (assessmentCode: string): string => {
  if (!assessmentCode || !Array.isArray(assessmentDetails.value)) {
    return assessmentCode || "Código desconocido";
  }

  const detail = assessmentDetails.value.find(
    (item) => item?.code === assessmentCode
  );
  return detail?.name || assessmentCode;
};

const closeModal = (): void => {
  open.value = false;
};

const reserveAppointment = (): void => {
  if (panel.value) {
    panel.value = false;
    return;
  }
  panel.value = true;
};

const selectSpecialty = (specialtyCode: string, specialtyId: number): void => {
  if (!specialtyCode || !specialtyId) {
    console.warn("Invalid specialty selection parameters");
    return;
  }

  selectedSpecialty.value = specialtyCode;
  selectedSpecialtyId.value = specialtyId;
  selectedProcedure.value = null;
  selectedProcedureId.value = null;
  appointment.specialty = specialtyCode;

  const specialty = supplierServices.value.find(
    (s) => s.medical_specialty?.code === specialtyCode
  );

  if (
    specialty?.procedures &&
    Array.isArray(specialty.procedures) &&
    specialty.procedures.length > 0
  ) {
    const firstProcedure = specialty.procedures[0];
    if (firstProcedure?.procedure) {
      selectedProcedure.value = firstProcedure.procedure.code;
      selectedProcedureId.value = firstProcedure.procedure.id;
      appointment.service = firstProcedure.procedure.code;
    }
  }
};

const selectPackage = (selectedPkg: Package): void => {
  if (!selectedPkg) {
    console.warn("Invalid package selection");
    return;
  }

  selectedPackage.value = selectedPkg;
  tab.value = 2;
};

const selectPackageAutomatically = (packages: Package[]): void => {
  if (!Array.isArray(packages) || packages.length === 0) return;

  const nonAssessmentPackage = packages.find(
    (pkg) => pkg.product?.name !== "Cita de Valoración"
  );

  selectedPackage.value = nonAssessmentPackage || packages[0];
};

const selectProcedure = (procedureCode: string, procedureId: number): void => {
  if (!procedureCode || !procedureId) {
    console.warn("Invalid procedure selection parameters");
    return;
  }

  selectedProcedure.value = procedureCode;
  selectedProcedureId.value = procedureId;
  selectedPackage.value = null;
  appointment.service = procedureCode;

  nextTick(() => {
    if (filteredPackages.value.length > 0) {
      selectPackageAutomatically(filteredPackages.value);
    }
  });
};

const initializeDefaults = (): void => {
  if (!hasServices.value) return;

  if (isSearchMode.value) return;

  const firstService = supplierServices.value[0];
  if (!firstService?.medical_specialty) return;

  selectedSpecialty.value = firstService.medical_specialty.code;
  selectedSpecialtyId.value = firstService.medical_specialty.id;
  appointment.specialty = firstService.medical_specialty.code;

  if (
    Array.isArray(firstService.procedures) &&
    firstService.procedures.length > 0
  ) {
    const firstProcedure = firstService.procedures[0];
    if (firstProcedure?.procedure) {
      selectedProcedure.value = firstProcedure.procedure.code;
      selectedProcedureId.value = firstProcedure.procedure.id;
      appointment.service = firstProcedure.procedure.code;
    }
  }

  nextTick(() => {
    if (filteredPackages.value.length > 0 && !selectedPackage.value) {
      selectPackageAutomatically(filteredPackages.value);
    }
  });
};

const loadAssessmentDetails = async (): Promise<void> => {
  const token = useCookie<string>("token");
  const config = useRuntimeConfig();

  if (!token.value) {
    console.warn("No authorization token available");
    return;
  }

  const assessmentOperation = $fetch<{ data: AssessmentDetail[] }>(
    config.public.API_BASE_URL + "/udc/get_all",
    {
      headers: { Authorization: token.value },
      params: { type: "ASSESSMENT_DETAIL" },
    }
  );

  const { data: assessmentData, error: assessmentError } =
    await withErrorHandling(assessmentOperation, isLoadingData, {
      customMessage: "Error al cargar detalles de evaluación",
    });

  if (assessmentData?.data && Array.isArray(assessmentData.data)) {
    assessmentDetails.value = assessmentData.data;
  }

  if (assessmentError) {
    console.error("Assessment details loading error:", assessmentError);
  }
};

const loadApiData = async (): Promise<void> => {
  const token = useCookie<string>("token");
  const config = useRuntimeConfig();

  if (!token.value) {
    console.warn("No authorization token available");
    return;
  }

  const reviewOperation = $fetch<{ data: ReviewDetail[] }>(
    config.public.API_BASE_URL + "/udc/get_all",
    {
      headers: { Authorization: token.value },
      params: { type: "REVIEW" },
    }
  );

  const { data: reviewData, error: reviewError } = await withErrorHandling(
    reviewOperation,
    isLoadingData,
    { customMessage: "Error al cargar detalles de reseñas" }
  );

  if (reviewData?.data && Array.isArray(reviewData.data)) {
    reviewDetails.value = reviewData.data;
  }

  if (reviewError) {
    console.error("Review details loading error:", reviewError);
  }

  await loadAssessmentDetails();
};

watch(
  () => currentSupplier.value,
  (newSupplier) => {
    if (newSupplier && hasServices.value) {
      initializeDefaults();
      nextTick(() => {
        if (filteredPackages.value.length > 0 && !selectedPackage.value) {
          selectPackageAutomatically(filteredPackages.value);
        }
      });
    }
  },
  { immediate: true }
);

onMounted(() => {
  loadApiData();
});

watch(
  [() => props.searchSpecialtyCode, () => props.searchProcedureCode],
  ([newSpecialtyCode, newProcedureCode]) => {
    if (!hasServices.value || !isSearchMode.value) return;

    const validSpecialty = supplierServices.value.find(
      (s) => s.medical_specialty?.code === newSpecialtyCode
    );

    if (validSpecialty && newSpecialtyCode) {
      selectedSpecialty.value = newSpecialtyCode;
      selectedSpecialtyId.value = validSpecialty.medical_specialty?.id || null;
      appointment.specialty = newSpecialtyCode;

      if (newProcedureCode && Array.isArray(validSpecialty.procedures)) {
        const validProcedure = validSpecialty.procedures.find(
          (p) => p.procedure?.code === newProcedureCode
        );

        if (validProcedure && validProcedure.procedure) {
          selectedProcedure.value = newProcedureCode;
          selectedProcedureId.value = validProcedure.procedure.id;
          appointment.service = newProcedureCode;
        } else {
          const firstProcedure = validSpecialty.procedures[0];
          if (firstProcedure?.procedure) {
            selectedProcedure.value = firstProcedure.procedure.code;
            selectedProcedureId.value = firstProcedure.procedure.id;
            appointment.service = firstProcedure.procedure.code;
          }
        }
      } else {
        const firstProcedure = validSpecialty.procedures[0];
        if (firstProcedure?.procedure) {
          selectedProcedure.value = firstProcedure.procedure.code;
          selectedProcedureId.value = firstProcedure.procedure.id;
          appointment.service = firstProcedure.procedure.code;
        }
      }

      nextTick(() => {
        if (filteredPackages.value.length > 0 && !selectedPackage.value) {
          selectPackageAutomatically(filteredPackages.value);
        }
      });
    } else {
      initializeDefaults();
    }
  },
  { immediate: true }
);
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
        :disabled="!selectedPackage"
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
        Perfil
      </button>
    </li>
  </ul>

  <section class="tabs-content">
    <div v-if="isLoadingData" class="loading-container">
      <p>Cargando información...</p>
    </div>

    <div v-else-if="!currentSupplier" class="empty-state">
      <p>No se encontró información del proveedor médico.</p>
    </div>

    <WebsitePerfilDoctorTabsServicio
      v-else-if="tab === 1 && hasServices"
      :supplier="currentSupplier"
      :select-specialty="selectSpecialty"
      :selected-specialty="selectedSpecialty"
      :selected-procedure="selectedProcedure"
      :filtered-procedures="filteredProcedures"
      :filtered-packages="filteredPackages"
      :select-package="selectPackage"
      :get-assessment-label="getAssessmentLabel"
      :select-procedure="selectProcedure"
      :specialties="specialties"
      :search-specialty-code="searchSpecialtyCode"
      :search-procedure-code="searchProcedureCode"
      :is-search-mode="isSearchMode"
      :customer="user"
      :assessment-details="assessmentDetails"
    />

    <div v-else-if="tab === 1 && !hasServices" class="empty-state">
      <p>Este proveedor no tiene servicios disponibles.</p>
    </div>

    <WebsitePerfilDoctorTabsDisponibilidad
      v-if="tab === 2 && selectedPackage"
      :supplier="currentSupplier"
      :selected-specialty="selectedSpecialtyName"
      :selected-procedure-id="selectedProcedureId"
      :selected-procedure-name="selectedProcedureName"
      :selected-package="selectedPackage"
      :customer="user"
      :reserve-appointment="reserveAppointment"
    />

    <div v-else-if="tab === 2 && !selectedPackage" class="empty-state">
      <p>
        Primero selecciona un paquete de servicios en la pestaña "Servicios".
      </p>
    </div>

    <WebsitePerfilDoctorTabsUbicacion
      v-if="tab === 3"
      :supplier="currentSupplier"
    />

    <WebsitePerfilDoctorTabsPerfil
      v-if="tab === 4"
      :supplier="currentSupplier"
    />
  </section>

  <WebsiteConfirmationCitaModal
    :open="open"
    :appointment="appointment"
    :result="result"
    @close-modal="closeModal"
  />
</template>

<style scoped>
.loading-container,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 2rem;
  text-align: center;
}

.empty-state p {
  color: #6b7280;
  font-size: 1rem;
}

.tab-item__link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

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

.loading-container,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  padding: 2rem;
  text-align: center;
}

.empty-state p {
  color: #6b7280;
  font-size: 1rem;
}

.tab-item__link:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
