<template>
  <NuxtLayout name="medicos-dashboard">
    <header class="my-practitioners__header">
      <UiHeaderBreadcrumb title="Mis médicos" />
    </header>

    <nav
      class="my-practitioners__tabs"
      role="tablist"
      aria-label="Secciones principales"
    >
      <button
        role="tab"
        class="my-practitioners__tab"
        :class="{ 'my-practitioners__tab--active': activeTab === 'doctors' }"
        :aria-selected="activeTab === 'doctors'"
        :tabindex="activeTab === 'doctors' ? 0 : -1"
        aria-controls="panel-doctors"
        @click="activeTab = 'doctors'"
        @keydown="handleTabKeydown($event, 'hospitals')"
      >
        Médicos
      </button>
      <button
        role="tab"
        class="my-practitioners__tab"
        :class="{ 'my-practitioners__tab--active': activeTab === 'hospitals' }"
        :aria-selected="activeTab === 'hospitals'"
        :tabindex="activeTab === 'hospitals' ? 0 : -1"
        aria-controls="panel-hospitals"
        @click="activeTab = 'hospitals'"
        @keydown="handleTabKeydown($event, 'doctors')"
      >
        Hospitales
      </button>
    </nav>

    <!-- ═══════════════════ DOCTORS PANEL ═══════════════════ -->
    <section
      v-if="activeTab === 'doctors'"
      id="panel-doctors"
      role="tabpanel"
      aria-label="Panel de médicos"
    >
      <div class="my-practitioners__toolbar">
        <UiSearchInput
          v-model="doctorSearchQuery"
          placeholder="Buscar médico"
          aria-label="Buscar médico por nombre, código o documento"
        />

        <MedicosModalesFormularioMedicoRelacionado
          v-model="formModelValue"
          edit-mode="create"
          @supplier-added="refreshDoctorsList"
        >
          <template #trigger="{ open }">
            <button
              class="my-practitioners__action-button--primary"
              @click="open"
            >
              <AtomsIconsPlusIcon size="20" aria-hidden="true" />
              Añadir médico
            </button>
          </template>
        </MedicosModalesFormularioMedicoRelacionado>
      </div>

      <WebsitePerfilDoctorPantallaCarga v-if="isDoctorsLoading" />

      <UiAppointmentTableBase
        v-else
        :items="filteredDoctors"
        :columns="DOCTOR_TABLE_COLUMNS"
        title="Lista de médicos relacionados"
        aria-label="Tabla de médicos relacionados"
        :items-per-page="10"
        default-sort-column="name"
        default-sort-direction="asc"
        empty-state-title="No hay médicos registrados"
        empty-state-description="Agrega médicos relacionados para gestionar tus servicios."
        empty-state-action="Agregar primer médico"
        @empty-action="() => {}"
      >
        <template #cell-name="{ value }">
          <strong class="my-practitioners__cell-name">{{ value }}</strong>
        </template>

        <template #cell-num_medical_enrollment="{ value }">
          <code class="my-practitioners__cell-code">{{ value || "—" }}</code>
        </template>

        <template #cell-documentNumber="{ item }">
          <div class="my-practitioners__cell-document">
            <span class="my-practitioners__cell-document-type">
              {{ item.id_type?.name || "" }}
            </span>
            <span class="my-practitioners__cell-document-number">
              {{ item.card_id }}
            </span>
          </div>
        </template>

        <template #cell-services_names="{ item }">
          <ul
            class="my-practitioners__specialty-list"
            aria-label="Especialidades"
          >
            <li
              v-for="(serviceName, serviceIndex) in item.services_names"
              :key="serviceIndex"
              class="my-practitioners__badge my-practitioners__badge--specialty"
            >
              {{ serviceName }}
            </li>
          </ul>
        </template>

        <template #cell-actions="{ item }">
          <div
            class="my-practitioners__row-actions"
            role="group"
            :aria-label="`Acciones para ${item.name}`"
          >
            <MedicosModalesFormularioMedicoRelacionado
              v-model="formModelValue"
              :edit-mode="editDoctorAction"
              :selected-supplier-for-edit="selectedDoctorForEdit"
              @supplier-updated="refreshDoctorsList"
            >
              <template #trigger="{ open }">
                <button
                  class="my-practitioners__icon-button my-practitioners__icon-button--edit"
                  :aria-label="`Editar médico ${item.name}`"
                  @click="
                    initiateDoctorEditing(item);
                    open();
                  "
                >
                  <AtomsIconsEditPencilIcon size="18" aria-hidden="true" />
                </button>
              </template>
            </MedicosModalesFormularioMedicoRelacionado>

            <button
              class="my-practitioners__icon-button my-practitioners__icon-button--delete"
              :aria-label="`Eliminar médico ${item.name}`"
              @click="promptDoctorDeletion(item)"
            >
              <AtomsIconsTrashIcon size="18" aria-hidden="true" />
            </button>
          </div>
        </template>

        <template #empty-state>
          <div class="my-practitioners__empty-state" role="status">
            <AtomsIconsUserIcon
              size="48"
              class="my-practitioners__empty-state-icon"
              aria-hidden="true"
            />
            <h3 class="my-practitioners__empty-state-title">
              {{
                doctorSearchQuery.trim()
                  ? "No se encontraron resultados"
                  : "No hay médicos registrados"
              }}
            </h3>
            <p class="my-practitioners__empty-state-description">
              {{
                doctorSearchQuery.trim()
                  ? `No hay médicos que coincidan con "${doctorSearchQuery.trim()}".`
                  : "Agrega médicos relacionados para gestionar tus servicios."
              }}
            </p>

            <MedicosModalesFormularioMedicoRelacionado
              v-if="!doctorSearchQuery.trim()"
              v-model="formModelValue"
              edit-mode="create"
              @supplier-added="refreshDoctorsList"
            >
              <template #trigger="{ open }">
                <button
                  class="my-practitioners__action-button--primary"
                  @click="open"
                >
                  <AtomsIconsPlusIcon size="20" aria-hidden="true" />
                  Agregar primer médico
                </button>
              </template>
            </MedicosModalesFormularioMedicoRelacionado>
          </div>
        </template>
      </UiAppointmentTableBase>

      <!-- Doctor Deletion Confirmation -->
      <AtomsModalBase
        :is-open="isDoctorDeletionDialogVisible"
        size="small"
        role="alertdialog"
        aria-label="Confirmar eliminación de médico"
        @close="dismissDoctorDeletionDialog"
      >
        <template #title>Confirmar eliminación</template>

        <div class="my-practitioners__deletion-dialog">
          <p>
            ¿Estás seguro de que deseas eliminar al médico
            <strong>{{ doctorPendingDeletion?.name }}</strong
            >?
          </p>
          <p class="my-practitioners__deletion-dialog-warning" role="alert">
            Esta acción no se puede deshacer.
          </p>
        </div>

        <template #footer>
          <button
            class="my-practitioners__modal-button--cancel"
            :disabled="isDoctorDeletionInProgress"
            @click="dismissDoctorDeletionDialog"
          >
            Cancelar
          </button>
          <button
            class="my-practitioners__modal-button--danger"
            :disabled="isDoctorDeletionInProgress"
            :aria-busy="isDoctorDeletionInProgress"
            @click="executeDoctorDeletion"
          >
            {{ isDoctorDeletionInProgress ? "Eliminando..." : "Eliminar" }}
          </button>
        </template>
      </AtomsModalBase>
    </section>

    <!-- ═══════════════════ HOSPITALS PANEL ═══════════════════ -->
    <section
      v-if="activeTab === 'hospitals'"
      id="panel-hospitals"
      role="tabpanel"
      aria-label="Panel de hospitales"
    >
      <div
        class="my-practitioners__toolbar my-practitioners__toolbar--hospitals"
      >
        <UiSearchInput
          v-model="hospitalSearchQuery"
          placeholder="Buscar hospital"
          aria-label="Buscar hospital por nombre o dirección"
        />

        <button
          class="my-practitioners__action-button--primary"
          @click="openHospitalModal('create')"
        >
          <AtomsIconsPlusIcon size="20" aria-hidden="true" />
          Añadir hospital
        </button>
      </div>

      <WebsitePerfilDoctorPantallaCarga v-if="isHospitalsLoading" />

      <template v-else>
        <ul
          v-if="filteredHospitals.length > 0"
          class="my-practitioners__hospital-list"
          aria-label="Lista de hospitales"
        >
          <li
            v-for="hospital in filteredHospitals"
            :key="hospital.id"
            class="my-practitioners__hospital-card"
          >
            <div class="my-practitioners__hospital-info">
              <h4 class="my-practitioners__hospital-name">
                {{ hospital.name }}
              </h4>
              <address class="my-practitioners__hospital-address">
                <span>{{ hospital.address }}, {{ hospital.city_name }}</span>
                <span>{{ hospital.province }}</span>
              </address>
            </div>

            <div
              class="my-practitioners__row-actions"
              role="group"
              :aria-label="`Acciones para ${hospital.name}`"
            >
              <button
                class="my-practitioners__icon-button my-practitioners__icon-button--edit"
                :aria-label="`Editar hospital ${hospital.name}`"
                @click="openHospitalModal('edit', hospital)"
              >
                <AtomsIconsEditPencilIcon size="18" aria-hidden="true" />
              </button>
              <button
                class="my-practitioners__icon-button my-practitioners__icon-button--delete"
                :aria-label="`Eliminar hospital ${hospital.name}`"
                @click="promptHospitalDeletion(hospital)"
              >
                <AtomsIconsTrashIcon size="18" aria-hidden="true" />
              </button>
            </div>
          </li>
        </ul>

        <div v-else class="my-practitioners__empty-state" role="status">
          <h3 class="my-practitioners__empty-state-title">
            {{
              hospitalSearchQuery.trim()
                ? "No se encontraron hospitales"
                : "No hay hospitales registrados"
            }}
          </h3>
          <p class="my-practitioners__empty-state-description">
            {{
              hospitalSearchQuery.trim()
                ? `No hay hospitales que coincidan con "${hospitalSearchQuery.trim()}".`
                : "No tienes hospitales asociados actualmente."
            }}
          </p>
          <button
            v-if="!hospitalSearchQuery.trim()"
            class="my-practitioners__action-button--primary"
            @click="openHospitalModal('create')"
          >
            <AtomsIconsPlusIcon size="20" aria-hidden="true" />
            Agregar primer hospital
          </button>
        </div>
      </template>

      <!-- Hospital Add/Edit Modal -->
      <MedicosModalesAgregarHospital
        :is-open="isHospitalModalOpen"
        :edit-mode="hospitalModalMode"
        :hospital="hospitalSelectedForEdit"
        @update:is-open="isHospitalModalOpen = $event"
        @hospital-created="handleHospitalCreated"
        @hospital-updated="handleHospitalUpdated"
      />

      <!-- Hospital Deletion Confirmation -->
      <AtomsModalBase
        :is-open="isHospitalDeletionDialogVisible"
        size="small"
        role="alertdialog"
        aria-label="Confirmar eliminación de hospital"
        @close="dismissHospitalDeletionDialog"
      >
        <template #title>Confirmar eliminación</template>

        <div class="my-practitioners__deletion-dialog">
          <p>
            ¿Estás seguro de que deseas eliminar el hospital
            <strong>{{ hospitalPendingDeletion?.name }}</strong
            >?
          </p>
          <p class="my-practitioners__deletion-dialog-warning" role="alert">
            Esta acción no se puede deshacer.
          </p>
        </div>

        <template #footer>
          <button
            class="my-practitioners__modal-button--cancel"
            :disabled="isHospitalDeletionInProgress"
            @click="dismissHospitalDeletionDialog"
          >
            Cancelar
          </button>
          <button
            class="my-practitioners__modal-button--danger"
            :disabled="isHospitalDeletionInProgress"
            :aria-busy="isHospitalDeletionInProgress"
            @click="executeHospitalDeletion"
          >
            {{ isHospitalDeletionInProgress ? "Eliminando..." : "Eliminar" }}
          </button>
        </template>
      </AtomsModalBase>
    </section>
  </NuxtLayout>
  <MedicosRegistroOnboarding />
</template>

<script lang="ts" setup>
import { useLocation } from "@/composables/api/useLocation";
import { useSupplier } from "@/composables/api/useSupplier";
import { useLogger } from "@/composables/useLogger";
import { useToast } from "@/composables/useToast";
import type { TableColumn } from "~/components/ui/appointment-table-base.vue";

definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});

/* ──────────────────────────── Types ──────────────────────────── */

type PanelTab = "doctors" | "hospitals";
type HospitalModalMode = "create" | "edit";

/* ──────────────────────────── Dependencies ───────────────────── */

const toast = useToast();
const logger = useLogger("MyPractitionersPage");
const { getAllMainSuppliers, deleteSupplier } = useSupplier();
const { getAllLocations, deleteLocation } = useLocation();
const { getUserInfo } = useUserInfo();

/* ──────────────────────────── Shared State ───────────────────── */

const activeTab = ref<PanelTab>("doctors");

/* ──────────────────────────── Doctors State ──────────────────── */

const allDoctors = ref<ISupplierMain[]>([]);
const isDoctorsLoading = ref(false);
const doctorSearchQuery = ref("");
const selectedDoctorForEdit = ref<ISupplierMain | undefined>(undefined);
const editDoctorAction = ref<"edit" | "create">("create");
const formModelValue = ref<any[]>([]);

const doctorPendingDeletion = ref<ISupplierMain | null>(null);
const isDoctorDeletionDialogVisible = ref(false);
const isDoctorDeletionInProgress = ref(false);

/* ──────────────────────────── Hospitals State ────────────────── */

const allHospitals = ref<ILocation[]>([]);
const isHospitalsLoading = ref(false);
const hospitalSearchQuery = ref("");

const isHospitalModalOpen = ref(false);
const hospitalModalMode = ref<HospitalModalMode>("create");
const hospitalSelectedForEdit = ref<ILocation | null>(null);

const hospitalPendingDeletion = ref<ILocation | null>(null);
const isHospitalDeletionDialogVisible = ref(false);
const isHospitalDeletionInProgress = ref(false);

/* ──────────────────────────── Constants ──────────────────────── */

const DOCTOR_TABLE_COLUMNS: TableColumn[] = [
  { key: "name", label: "Nombre completo", sortable: false },
  { key: "num_medical_enrollment", label: "Código médico", sortable: false },
  { key: "documentNumber", label: "Documento", sortable: false },
  { key: "services_names", label: "Especialidades", sortable: false },
  {
    key: "actions",
    label: "Acciones",
    sortable: false,
    headerClass: "appointment-table-base__header-cell--right",
    cellClass: "appointment-table-base__cell--actions",
  },
];

/* ──────────────────────────── Search Helpers ─────────────────── */

const normalizeSearchTerm = (value: string): string =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const filteredDoctors = computed<ISupplierMain[]>(() => {
  const query = normalizeSearchTerm(doctorSearchQuery.value.trim());
  if (!query) return allDoctors.value;

  return allDoctors.value.filter((doctor) => {
    const searchableFields = [
      doctor.name,
      doctor.num_medical_enrollment,
      doctor.card_id,
      doctor.id_type?.name,
      ...(doctor.services_names ?? []),
    ];

    return searchableFields.some((field) =>
      normalizeSearchTerm(field ?? "").includes(query),
    );
  });
});

const filteredHospitals = computed<ILocation[]>(() => {
  const query = normalizeSearchTerm(hospitalSearchQuery.value.trim());
  if (!query) return allHospitals.value;

  return allHospitals.value.filter((hospital) => {
    const searchableFields = [
      hospital.name,
      hospital.address,
      hospital.city_name,
      hospital.province,
    ];

    return searchableFields.some((field) =>
      normalizeSearchTerm(field ?? "").includes(query),
    );
  });
});

/* ──────────────────────────── Tab Keyboard Nav (a11y) ────────── */

function handleTabKeydown(event: KeyboardEvent, targetTab: PanelTab): void {
  if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
    event.preventDefault();
    activeTab.value = targetTab;

    nextTick(() => {
      const targetButton = document.querySelector<HTMLButtonElement>(
        `[aria-controls="panel-${targetTab}"]`,
      );
      targetButton?.focus();
    });
  }
}

/* ──────────────────────────── Doctors CRUD ────────────────────── */

function initiateDoctorEditing(doctor: ISupplierMain): void {
  selectedDoctorForEdit.value = doctor;
  editDoctorAction.value = "edit";
}

function promptDoctorDeletion(doctor: ISupplierMain): void {
  doctorPendingDeletion.value = doctor;
  isDoctorDeletionDialogVisible.value = true;
}

function dismissDoctorDeletionDialog(): void {
  doctorPendingDeletion.value = null;
  isDoctorDeletionDialogVisible.value = false;
}

async function refreshDoctorsList(): Promise<void> {
  isDoctorsLoading.value = true;

  try {
    const { data, error } = await getAllMainSuppliers();

    if (error) {
      logger.error("Failed to fetch doctors", { info: error.info });
      toast.error(error.info);
      return;
    }

    const currentUser = getUserInfo();
    allDoctors.value = (data ?? []).filter(
      (supplier) => supplier.legal_representative?.id === currentUser.id,
    );
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar médicos";
    logger.error("Unexpected error fetching doctors", { error: message });
    toast.error(message);
  } finally {
    isDoctorsLoading.value = false;
  }
}

async function executeDoctorDeletion(): Promise<void> {
  if (!doctorPendingDeletion.value) return;

  isDoctorDeletionInProgress.value = true;

  try {
    const { error } = await deleteSupplier(doctorPendingDeletion.value.id);

    if (error) {
      logger.error("Failed to delete doctor", { info: error.info });
      toast.error(error.info);
      return;
    }

    dismissDoctorDeletionDialog();
    toast.success("Médico eliminado correctamente");
    await refreshDoctorsList();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al eliminar médico";
    logger.error("Unexpected error deleting doctor", { error: message });
    toast.error(message);
  } finally {
    isDoctorDeletionInProgress.value = false;
  }
}

/* ──────────────────────────── Hospitals CRUD ─────────────────── */

function openHospitalModal(
  mode: HospitalModalMode,
  hospital?: ILocation,
): void {
  hospitalModalMode.value = mode;
  hospitalSelectedForEdit.value = hospital ?? null;
  isHospitalModalOpen.value = true;
}

function promptHospitalDeletion(hospital: ILocation): void {
  hospitalPendingDeletion.value = hospital;
  isHospitalDeletionDialogVisible.value = true;
}

function dismissHospitalDeletionDialog(): void {
  hospitalPendingDeletion.value = null;
  isHospitalDeletionDialogVisible.value = false;
}

function handleHospitalCreated(_hospital: ILocation): void {
  refreshHospitalsList();
}

function handleHospitalUpdated(_hospital: ILocation): void {
  refreshHospitalsList();
}

async function refreshHospitalsList(): Promise<void> {
  isHospitalsLoading.value = true;

  try {
    const { data, error } = await getAllLocations();

    if (error) {
      logger.error("Failed to fetch hospitals", { info: error.info });
      toast.error(error.info);
      return;
    }

    allHospitals.value = data ?? [];
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al cargar hospitales";
    logger.error("Unexpected error fetching hospitals", { error: message });
    toast.error(message);
  } finally {
    isHospitalsLoading.value = false;
  }
}

async function executeHospitalDeletion(): Promise<void> {
  if (!hospitalPendingDeletion.value) return;

  isHospitalDeletionInProgress.value = true;

  try {
    const { error } = await deleteLocation(hospitalPendingDeletion.value.id);

    if (error) {
      logger.error("Failed to delete hospital", { info: error.info });
      toast.error(error.info);
      return;
    }

    dismissHospitalDeletionDialog();
    toast.success("Hospital eliminado correctamente");
    await refreshHospitalsList();
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al eliminar hospital";
    logger.error("Unexpected error deleting hospital", { error: message });
    toast.error(message);
  } finally {
    isHospitalDeletionInProgress.value = false;
  }
}

/* ──────────────────────────── Lifecycle ───────────────────────── */

onMounted(() => {
  refreshDoctorsList();
  refreshHospitalsList();
});
</script>

<style lang="scss" scoped>
.my-practitioners {
  &__header {
    margin-bottom: $spacing-lg;
  }

  &__tabs {
    display: flex;
    gap: 0;
    border-bottom: 2px solid #e4e7ec;
    margin-bottom: 1.25rem;
  }

  &__tab {
    padding: 0.625rem 1.25rem;
    font-weight: 600;
    font-size: 14px;
    color: #667085;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      color: $color-primary;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: -2px;
    }

    &--active {
      color: $color-primary;
      border-bottom-color: $color-primary;
    }
  }

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-md;
    margin-bottom: $spacing-lg;

    @include respond-to-max(md) {
      flex-direction: column;
      align-items: stretch;
    }

    &--hospitals {
      margin-bottom: 1rem;
    }
  }

  &__action-button--primary {
    @include primary-button;
    white-space: nowrap;

    @include respond-to-max(md) {
      width: 100%;
    }
  }

  &__cell-name {
    font-weight: 600;
    color: $color-foreground;
  }

  &__cell-code {
    font-family: "Monaco", "Courier New", monospace;
    background-color: #f3f4f6;
    padding: 6px 10px;
    border-radius: $border-radius-md;
    font-size: 13px;
    color: $color-foreground;
    font-weight: 500;
  }

  &__cell-document {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__cell-document-type {
    font-size: 12px;
    color: $color-text-muted;
    font-weight: 500;
  }

  &__cell-document-number {
    font-weight: 600;
    color: $color-foreground;
  }

  &__badge {
    display: inline-block;
    font-weight: 600;
    border-radius: 999px;

    &--phone {
      font-size: 13px;
      padding: 6px 12px;
      background-color: #e0e7ff;
      color: $color-primary;
    }

    &--specialty {
      font-size: 12px;
      padding: 4px 10px;
      background-color: #ecfeff;
      color: darken($primary-aqua, 15%);
      font-weight: 500;
    }
  }

  &__specialty-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  &__row-actions {
    display: inline-flex;
    gap: $spacing-sm;
    justify-content: flex-end;
  }

  &__icon-button {
    @include button-base;
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: $border-radius-md;
    background-color: transparent;
    color: $color-text-muted;
    transition: all 0.2s ease;

    &:hover {
      color: $color-foreground;
    }

    &--edit:hover {
      background-color: #dbeafe;
      color: $color-primary;
    }

    &--delete:hover {
      background-color: #fee2e2;
      color: $color-danger;
    }
  }

  &__empty-state {
    text-align: center;
    padding: 40px 20px;
  }

  &__empty-state-icon {
    color: #9ca3af;
    margin-bottom: $spacing-md;
  }

  &__empty-state-title {
    font-size: 20px;
    font-weight: 700;
    color: $color-foreground;
    margin: 0 0 $spacing-sm 0;
    font-family: $font-family-main;
  }

  &__empty-state-description {
    color: $color-text-muted;
    margin: 0 0 $spacing-lg 0;
    font-size: 15px;
    line-height: 1.6;
  }

  &__deletion-dialog {
    padding: 14px;

    p {
      @include text-base;
      margin: 0 0 12px 0;
      font-size: 15px;
      line-height: 1.6;
    }
  }

  &__deletion-dialog-warning {
    font-size: 13px;
    color: $color-error;
    font-weight: 500;
  }

  &__modal-button--cancel {
    @include secondary-button;
  }

  &__modal-button--danger {
    @include danger-button;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__hospital-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;
    list-style: none;
    padding: 0;

    @include respond-to(md) {
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
  }

  &__hospital-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: $white;
    border: 1px solid #f1f3f7;
    padding: 10px 14px;
    border-radius: 15px;
    transition: box-shadow 0.2s;

    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }
  }

  &__hospital-info {
    min-width: 0;
  }

  &__hospital-name {
    font-weight: 600;
    font-size: 14px;
    line-height: 24px;
    padding: 0;
    margin: 0;
    color: #19213d;
  }

  &__hospital-address {
    font-style: normal;
    display: flex;
    flex-direction: column;

    span {
      font-weight: 500;
      font-size: 14px;
      line-height: 24px;
      color: #6d758f;
    }
  }
}

@include respond-to-max(sm) {
  .my-practitioners__header {
    margin-bottom: 20px;
  }

  .my-practitioners__toolbar {
    margin-bottom: 20px;
  }
}
</style>
