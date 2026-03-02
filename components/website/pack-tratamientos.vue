<template>
  <AtomsModalBase
    :is-open="open"
    size="extra-large"
    :close-on-backdrop="false"
    :aria-labelledby="modalTitleId"
    role="dialog"
    aria-modal="true"
    @close="handleClose"
  >
    <template #title>
      <h2 :id="modalTitleId" class="pack-modal__title">
        Packs de tratamientos
      </h2>
    </template>

    <section class="pack-modal" aria-label="Packs de tratamientos">
      <div
        v-if="isLoading"
        class="pack-modal__loader"
        role="status"
        aria-live="polite"
        aria-label="Cargando packs de tratamientos"
      >
        <WebsitePerfilDoctorPantallaCarga />
      </div>

      <div
        v-else-if="loadError"
        class="pack-modal__error"
        role="alert"
        aria-live="assertive"
      >
        <div class="pack-modal__error-icon" aria-hidden="true">⚠</div>
        <h3 class="pack-modal__error-title">
          No se pudo cargar la información
        </h3>
        <p class="pack-modal__error-description">
          {{ loadError }}
        </p>
        <button class="pack-modal__error-retry" type="button" @click="loadData">
          Reintentar
        </button>
      </div>

      <template v-else-if="supplier">
        <div
          v-if="!hasServices"
          class="pack-modal__empty"
          role="status"
          aria-live="polite"
        >
          <div class="pack-modal__empty-icon" aria-hidden="true">📋</div>
          <h3 class="pack-modal__empty-title">
            Información de servicios no disponible
          </h3>
          <p class="pack-modal__empty-description">
            Este doctor aún no tiene servicios configurados en el sistema.
          </p>
          <p class="pack-modal__empty-description">
            Puedes agendar una cita de valoración para obtener más información
            sobre los tratamientos disponibles.
          </p>
        </div>

        <template v-else>
          <nav
            class="pack-modal__specialties"
            aria-label="Especialidades médicas"
          >
            <ul class="pack-modal__specialties-list" role="tablist">
              <li
                v-for="specialty in specialties"
                :key="specialty.code"
                role="presentation"
              >
                <button
                  role="tab"
                  type="button"
                  :id="`tab-specialty-${specialty.code}`"
                  :aria-selected="selectedSpecialty?.code === specialty.code"
                  :aria-controls="`panel-specialty-${specialty.code}`"
                  :tabindex="
                    selectedSpecialty?.code === specialty.code ? 0 : -1
                  "
                  class="pack-modal__specialty-tab"
                  :class="{
                    'pack-modal__specialty-tab--active':
                      selectedSpecialty?.code === specialty.code,
                  }"
                  @click="handleSpecialtySelect(specialty)"
                  @keydown="handleSpecialtyKeydown($event, specialty)"
                >
                  {{ specialty.name }}
                </button>
              </li>
            </ul>
          </nav>

          <div
            v-if="currentProcedures.length > 0"
            class="pack-modal__procedures"
            role="tabpanel"
            :id="`panel-specialty-${selectedSpecialty?.code}`"
            :aria-labelledby="`tab-specialty-${selectedSpecialty?.code}`"
          >
            <span class="pack-modal__procedures-label" id="procedures-label">
              Procedimientos:
            </span>
            <div
              class="pack-modal__procedures-list"
              role="tablist"
              aria-labelledby="procedures-label"
            >
              <button
                v-for="procedure in currentProcedures"
                :key="procedure.procedure.code"
                role="tab"
                type="button"
                :aria-selected="
                  selectedProcedure?.procedure.code === procedure.procedure.code
                "
                :tabindex="
                  selectedProcedure?.procedure.code === procedure.procedure.code
                    ? 0
                    : -1
                "
                class="pack-modal__procedure-tab"
                :class="{
                  'pack-modal__procedure-tab--active':
                    selectedProcedure?.procedure.code ===
                    procedure.procedure.code,
                }"
                @click="handleProcedureSelect(procedure)"
                @keydown="handleProcedureKeydown($event, procedure)"
              >
                {{ procedure.procedure.name }}
              </button>
            </div>
          </div>

          <div
            v-if="currentPackages.length > 0"
            class="pack-modal__packages"
            role="region"
            aria-label="Paquetes disponibles"
          >
            <WebsitePerfilDoctorTarjetaServicio
              v-for="pkg in currentPackages"
              :key="pkg.id"
              :pkg="pkg"
              :supplier="supplier"
              :supplierReviews="formattedReviews"
              :getPackagePrice="calculatePackagePrice"
              :getAssessmentLabel="resolveAssessmentLabel"
              :customer="userInfo"
              :selectedSpecialtyId="selectedSpecialty?.id ?? 0"
              :selectedProcedureId="selectedProcedure?.procedure.id ?? 0"
              :procedureName="activeProcedureName"
            />
          </div>

          <div
            v-else-if="currentProcedures.length === 0"
            class="pack-modal__notice"
            role="status"
            aria-live="polite"
          >
            No hay procedimientos disponibles para esta especialidad.
          </div>

          <div
            v-else
            class="pack-modal__notice"
            role="status"
            aria-live="polite"
          >
            No hay paquetes disponibles para este procedimiento.
          </div>
        </template>
      </template>
    </section>
  </AtomsModalBase>
</template>

<script setup lang="ts">
import { useSupplier, useUdc } from "@/composables/api";
import { useLogger } from "@/composables/useLogger";
import { useToast } from "@/composables/useToast";

interface PackTratamientosProps {
  supplierId: number;
  open: boolean;
  userInfo: ICustomer;
  specialtyCode?: string;
  procedureCode?: string;
}

interface FormattedReview {
  first_name: string;
  last_name: string;
  message: string;
  pacient_type: string;
  score: number;
}

const props = defineProps<PackTratamientosProps>();
const emit = defineEmits<{
  (event: "close-modal"): void;
}>();

const { getSupplierById } = useSupplier();
const { getAllUdcs } = useUdc();
const logger = useLogger("PackTratamientos");
const toast = useToast();

const modalTitleId = `modal-title-${Date.now()}`;
const isLoading = ref<boolean>(false);
const loadError = ref<string | null>(null);
const supplier = ref<ISupplierDetail | null>(null);
const assessmentDetails = ref<IUdc[]>([]);
const selectedSpecialty = ref<IUdc | null>(null);
const selectedProcedure = ref<IProcedures | null>(null);

const hasServices = computed<boolean>(() => {
  const services = supplier.value?.services;
  return Array.isArray(services) && services.length > 0;
});

const specialties = computed<IUdc[]>(() => {
  if (!hasServices.value) return [];
  return supplier.value?.services?.map((s) => s.medical_specialty) ?? [];
});

const currentProcedures = computed<IProcedures[]>(() => {
  if (!hasServices.value) return [];

  const matchingService = selectedSpecialty.value
    ? supplier.value?.services?.find(
        (s) => s.medical_specialty.code === selectedSpecialty.value?.code,
      )
    : supplier.value?.services?.[0];

  return matchingService?.procedures ?? [];
});

const currentPackages = computed<IPackage[]>(() => {
  if (!hasServices.value || currentProcedures.value.length === 0) return [];

  const activeProcedure = selectedProcedure.value ?? currentProcedures.value[0];
  const packages = activeProcedure?.packages ?? [];

  return filterOutAssessmentPackages(packages);
});

const activeProcedureName = computed<string>(() => {
  return (
    selectedProcedure.value?.procedure.name ??
    currentProcedures.value[0]?.procedure.name ??
    ""
  );
});

const formattedReviews = computed<FormattedReview[]>(() => {
  const reviews = supplier.value?.reviews;
  if (!Array.isArray(reviews)) return [];

  return reviews.map(formatReview);
});

function filterOutAssessmentPackages(packages: IPackage[]): IPackage[] {
  return packages.filter(
    (pkg) => pkg.product?.code !== "ASSESSMENT_APPOINTMENT",
  );
}

function formatReview(review: any): FormattedReview {
  const nameParts = (review.customer ?? "").split(" ");

  return {
    first_name: nameParts[0] || "Anónimo",
    last_name: review.is_annonymous ? "" : (nameParts[1] ?? ""),
    message: review.comment ?? "",
    pacient_type: "Paciente",
    score: review.stars_average ?? 0,
  };
}

function calculatePackagePrice(pkg: IPackage): number {
  const price = parseFloat(pkg.product?.value1 ?? "0");
  if (isNaN(price) || price <= 0) return 0;

  const discountRate = Math.min(Math.max(pkg.discount ?? 0, 0), 100) / 100;
  return price * (1 - discountRate);
}

function resolveAssessmentLabel(assessmentCode: string): string {
  if (!assessmentCode) return "";

  const detail = assessmentDetails.value.find(
    (item) => item.code === assessmentCode,
  );
  return detail?.name ?? assessmentCode;
}

function findMatchingService(
  services: ISupplierService[],
  specialtyCode?: string,
  procedureCode?: string,
): ISupplierService | undefined {
  if (!specialtyCode) return undefined;

  return services.find(
    (s) =>
      s.medical_specialty.code === specialtyCode &&
      (!procedureCode ||
        s.procedures.some((p) => p.procedure.code === procedureCode)),
  );
}

function findProcedureByCode(
  procedures: IProcedures[],
  code?: string,
): IProcedures | undefined {
  if (!code) return undefined;
  return procedures.find((p) => p.procedure.code === code);
}

function handleClose(): void {
  emit("close-modal");
}

function handleSpecialtySelect(specialty: IUdc): void {
  selectedSpecialty.value = specialty;

  const service = supplier.value?.services?.find(
    (s) => s.medical_specialty.code === specialty.code,
  );
  selectedProcedure.value = service?.procedures?.[0] ?? null;
}

function handleProcedureSelect(procedure: IProcedures): void {
  selectedProcedure.value = procedure;
}

function handleSpecialtyKeydown(event: KeyboardEvent, current: IUdc): void {
  navigateTabList(
    event,
    specialties.value,
    current,
    "code",
    handleSpecialtySelect,
  );
}

function handleProcedureKeydown(
  event: KeyboardEvent,
  current: IProcedures,
): void {
  const items = currentProcedures.value;
  const currentCode = current.procedure.code;
  const currentIndex = items.findIndex((p) => p.procedure.code === currentCode);

  if (currentIndex === -1) return;

  let nextIndex: number | null = null;

  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    event.preventDefault();
    nextIndex = (currentIndex + 1) % items.length;
  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    event.preventDefault();
    nextIndex = (currentIndex - 1 + items.length) % items.length;
  } else if (event.key === "Home") {
    event.preventDefault();
    nextIndex = 0;
  } else if (event.key === "End") {
    event.preventDefault();
    nextIndex = items.length - 1;
  }

  if (nextIndex !== null) {
    handleProcedureSelect(items[nextIndex]);
    nextTick(() => {
      const tablist = event.currentTarget as HTMLElement;
      const parent = tablist?.parentElement;
      const buttons =
        parent?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      buttons?.[nextIndex!]?.focus();
    });
  }
}

function navigateTabList<T>(
  event: KeyboardEvent,
  items: T[],
  current: T,
  key: keyof T,
  onSelect: (item: T) => void,
): void {
  const currentIndex = items.findIndex((item) => item[key] === current[key]);
  if (currentIndex === -1) return;

  let nextIndex: number | null = null;

  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    event.preventDefault();
    nextIndex = (currentIndex + 1) % items.length;
  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    event.preventDefault();
    nextIndex = (currentIndex - 1 + items.length) % items.length;
  } else if (event.key === "Home") {
    event.preventDefault();
    nextIndex = 0;
  } else if (event.key === "End") {
    event.preventDefault();
    nextIndex = items.length - 1;
  }

  if (nextIndex !== null) {
    onSelect(items[nextIndex]);
    nextTick(() => {
      const parent = (event.currentTarget as HTMLElement)?.closest(
        '[role="tablist"]',
      );
      const buttons =
        parent?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      buttons?.[nextIndex!]?.focus();
    });
  }
}

function initializeSelection(): void {
  if (!hasServices.value || !supplier.value?.services) return;

  const services = supplier.value.services;

  const matchedService = findMatchingService(
    services,
    props.specialtyCode,
    props.procedureCode,
  );

  const service = matchedService ?? services[0];
  if (!service) return;

  selectedSpecialty.value = service.medical_specialty;

  const matchedProcedure = findProcedureByCode(
    service.procedures,
    props.procedureCode,
  );
  selectedProcedure.value = matchedProcedure ?? service.procedures[0] ?? null;
}

async function loadData(): Promise<void> {
  isLoading.value = true;
  loadError.value = null;

  try {
    const [supplierData, assessmentData] = await Promise.allSettled([
      executeGetSupplierById(),
      executeGetAssessmentDetails(),
    ]);

    if (supplierData.status === "rejected") {
      throw new Error(
        supplierData.reason?.message ?? "Error al cargar datos del doctor",
      );
    }

    if (supplierData.status === "fulfilled" && supplierData.value) {
      supplier.value = supplierData.value;
    }

    if (assessmentData.status === "fulfilled" && assessmentData.value) {
      assessmentDetails.value = assessmentData.value;
    } else if (assessmentData.status === "rejected") {
      logger.warn("No se pudieron cargar detalles de valoración", {
        error: assessmentData.reason,
      });
    }

    initializeSelection();
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Ocurrió un error inesperado al cargar los datos";

    loadError.value = message;
    logger.error("Error al cargar datos del pack de tratamientos", {
      supplierId: props.supplierId,
      error: String(error),
    });
    toast.error(message);
  } finally {
    isLoading.value = false;
  }
}

async function executeGetSupplierById(): Promise<ISupplierDetail | null> {
  const { data, error } = await getSupplierById(props.supplierId);

  if (error && !data) {
    logger.error("Failed to fetch suppliers", { info: error.info });
    toast.error(error.info);
    throw new Error(error.info || "Error al cargar médico/clínica");
  }

  return data ?? null;
}

async function executeGetAssessmentDetails(): Promise<IUdc[] | null> {
  const { data, error } = await getAllUdcs({ type: "ASSESSMENT_DETAIL" });

  if (error && !data) {
    logger.error("Error al cargar los datos", { info: error.info });
    toast.error(error.info);
    throw new Error(error.info || "Error al cargar los datos");
  }

  return data ?? null;
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return;

    if (!supplier.value) {
      loadData();
    } else {
      initializeSelection();
    }
  },
);

onMounted(() => {
  if (props.open) {
    loadData();
  }
});
</script>

<style lang="scss" scoped>
.pack-modal {
  padding: $spacing-lg;
  overflow-y: auto;
  flex: 1;
  min-height: 200px;

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    color: $color-foreground;
    margin: 0;
  }

  &__loader {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
  }

  &__error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $spacing-md;
    padding: $spacing-xl;
    text-align: center;
    min-height: 300px;
  }

  &__error-icon {
    font-size: 48px;
    line-height: 1;
  }

  &__error-title {
    font-family: $font-family-main;
    font-size: 18px;
    font-weight: 600;
    color: $color-foreground;
    margin: 0;
  }

  &__error-description {
    font-family: $font-family-main;
    font-size: 14px;
    color: $color-text-secondary;
    margin: 0;
    max-width: 400px;
    line-height: 1.6;
  }

  &__error-retry {
    @include primary-button;
    margin-top: $spacing-sm;
  }

  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: $spacing-md;
    padding: $spacing-xl;
    text-align: center;
    min-height: 250px;
    background-color: #fff9e6;
    border: 1px solid #ffeaa7;
    border-radius: $border-radius-md;
  }

  &__empty-icon {
    font-size: 40px;
    line-height: 1;
  }

  &__empty-title {
    font-family: $font-family-main;
    font-size: 18px;
    font-weight: 600;
    color: #856404;
    margin: 0;
  }

  &__empty-description {
    font-family: $font-family-main;
    font-size: 14px;
    color: #856404;
    margin: 0;
    max-width: 480px;
    line-height: 1.6;
  }

  &__specialties {
    margin-bottom: $spacing-md;
  }

  &__specialties-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin: 10px 0;
    padding: 0;
    list-style: none;

    @include respond-to-max(sm) {
      gap: $spacing-xs;
    }
  }

  &__specialty-tab {
    @include button-base;
    border-radius: 10px;
    padding: 10px 20px;
    border: 1px solid transparent;
    font-weight: 400;
    color: $color-text-secondary;
    background-color: #f8faff;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      color 0.2s ease,
      box-shadow 0.2s ease;

    @include respond-to-max(sm) {
      padding: $spacing-xs $spacing-sm;
      font-size: 12px;
    }

    &:hover:not(&--active) {
      background-color: #eef1fa;
      border-color: #d0d5dd;
    }

    &:focus-visible {
      outline: 2px solid $primary-aqua;
      outline-offset: 2px;
      box-shadow: 0 0 0 4px rgba($primary-aqua, 0.2);
    }

    &--active {
      color: $primary-aqua;
      background-color: #e7f7f8;
      border-color: $primary-aqua;
    }
  }

  &__procedures {
    margin-bottom: $spacing-md;
  }

  &__procedures-label {
    @include visually-hidden;
  }

  &__procedures-list {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    @include respond-to-max(sm) {
      gap: $spacing-xs;
    }
  }

  &__procedure-tab {
    @include button-base;
    border-radius: 16px;
    padding: 2px $spacing-sm;
    border: 1px solid transparent;
    font-weight: 400;
    font-size: 12px;
    color: $color-text-secondary;
    background-color: #f8faff;
    transition:
      background-color 0.2s ease,
      border-color 0.2s ease,
      color 0.2s ease,
      box-shadow 0.2s ease;

    @include respond-to-max(sm) {
      padding: $spacing-xs $spacing-sm;
      font-size: 12px;
    }

    &:hover:not(&--active) {
      background-color: #eef1fa;
      border-color: #d0d5dd;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
      box-shadow: 0 0 0 4px rgba($color-primary, 0.2);
    }

    &--active {
      color: #242d7c;
      background-color: #ebecf7;
      border-color: #3541b4;
    }
  }

  &__packages {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: 20px;
    width: 100%;
    align-items: stretch;
    padding: 10px 0;
    overflow-x: auto;
    margin-top: 20px;
    -webkit-overflow-scrolling: touch;
    scroll-behavior: smooth;

    @include respond-to-max(sm) {
      flex-direction: column;
      gap: $spacing-md;
    }

    &::-webkit-scrollbar {
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 4px;

      &:hover {
        background: #aaa;
      }
    }

    > * {
      flex: 0 0 auto;
      min-width: 280px;
    }
  }

  &__notice {
    padding: $spacing-md $spacing-lg;
    background-color: #e8f4fd;
    border: 1px solid #b8daff;
    border-radius: $border-radius-md;
    color: #0c5460;
    font-family: $font-family-main;
    font-size: 14px;
    line-height: 1.5;
    margin-top: $spacing-md;
  }
}
</style>
