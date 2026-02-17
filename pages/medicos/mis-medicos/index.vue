<template>
  <NuxtLayout name="medicos-dashboard">
    <div class="panel__header">
      <UiHeaderBreadcrumb title="Mis médicos" />
    </div>

    <div class="panel__tabs">
      <button
        class="panel__tab"
        :class="{ 'panel__tab--active': activeTab === 'doctors' }"
        @click="activeTab = 'doctors'"
      >
        Médicos
      </button>
      <button
        class="panel__tab"
        :class="{ 'panel__tab--active': activeTab === 'hospitals' }"
        @click="activeTab = 'hospitals'"
      >
        Hospitales
      </button>
    </div>

    <template v-if="activeTab === 'doctors'">
      <div class="doctors__controls">
        <UiSearchInput
          v-model="searchQuery"
          placeholder="Buscar médico por nombre, código o documento"
        />

        <MedicosModalesAgregarMedicoRelacionado
          @doctor-added="handleDoctorAdded"
        >
          <template #trigger="{ open }">
            <button class="panel__button--primary" @click="open">
              <AtomsIconsPlusIcon size="20" />
              Añadir médico
            </button>
          </template>
        </MedicosModalesAgregarMedicoRelacionado>
      </div>

      <WebsitePerfilDoctorPantallaCarga v-if="isLoading" />

      <div v-else-if="errorMessage" class="panel__error">
        <AtomsIconsAlertCircleIcon size="24" />
        <p>{{ errorMessage }}</p>
      </div>

      <UiAppointmentTableBase
        v-else
        :items="filteredDoctors"
        :columns="columns"
        title="Lista de médicos relacionados"
        aria-label="Tabla de médicos relacionados"
        :items-per-page="10"
        default-sort-column="fullName"
        default-sort-direction="asc"
        empty-state-title="No hay médicos registrados"
        empty-state-description="Agrega médicos relacionados para gestionar tus servicios."
        empty-state-action="Agregar primer médico"
        @empty-action="() => {}"
      >
        <template #cell-fullName="{ value }">
          <strong class="doctors__table-name">{{ value }}</strong>
        </template>

        <template #cell-medicalCode="{ value }">
          <span class="doctors__code">{{ value }}</span>
        </template>

        <template #cell-documentNumber="{ item }">
          <div class="doctors__document">
            <span class="doctors__document-type">{{ item.documentType }}</span>
            <span class="doctors__document-number">{{
              item.documentNumber
            }}</span>
          </div>
        </template>

        <template #cell-medicalType="{ value }">
          <span class="doctors__type-badge">{{ value }}</span>
        </template>

        <template #cell-specialties="{ item }">
          <div class="doctors__specialties">
            <span
              v-for="spec in item.specialties"
              :key="spec.code"
              class="doctors__specialty-badge"
            >
              {{ spec.name }}
            </span>
          </div>
        </template>

        <template #cell-actions="{ item }">
          <div class="doctors__actions">
            <button
              class="doctors__action-button doctors__action-button--edit"
              :class="{
                'doctors__action-button--loading': loadingDoctorId === item.id,
              }"
              :disabled="loadingDoctorId === item.id"
              @click="handleEditDoctor(item)"
              :title="
                loadingDoctorId === item.id ? 'Cargando...' : 'Editar médico'
              "
            >
              <div
                v-if="loadingDoctorId === item.id"
                class="doctors__spinner"
              ></div>
              <AtomsIconsEditPencilIcon v-else size="18" />
            </button>

            <button
              class="doctors__action-button doctors__action-button--delete"
              @click="confirmDeleteDoctor(item)"
              title="Eliminar médico"
            >
              <AtomsIconsTrashIcon size="18" />
            </button>
          </div>
        </template>

        <template #empty-state>
          <div class="doctors__empty-state">
            <AtomsIconsUserIcon size="48" class="doctors__empty-icon" />
            <h3 class="doctors__empty-title">No hay médicos registrados</h3>
            <p class="doctors__empty-text">
              Agrega médicos relacionados para gestionar tus servicios.
            </p>

            <MedicosModalesAgregarMedicoRelacionado
              @doctor-added="handleDoctorAdded"
            >
              <template #trigger="{ open }">
                <button class="doctors__empty-button" @click="open">
                  <AtomsIconsPlusIcon size="20" />
                  Agregar primer médico
                </button>
              </template>
            </MedicosModalesAgregarMedicoRelacionado>
          </div>
        </template>
      </UiAppointmentTableBase>

      <!-- Delete doctor modal -->
      <AtomsModalBase
        :is-open="showDeleteModal"
        size="small"
        @close="cancelDelete"
      >
        <template #title>Confirmar eliminación</template>

        <div class="doctors__delete-modal-content">
          <p>
            ¿Estás seguro de que deseas eliminar al médico
            <strong>{{ doctorToDelete?.fullName }}</strong
            >?
          </p>
          <p class="doctors__delete-modal-warning">
            Esta acción no se puede deshacer.
          </p>
        </div>

        <template #footer>
          <button class="doctors__modal-button--cancel" @click="cancelDelete">
            Cancelar
          </button>
          <button
            class="doctors__modal-button--delete"
            :disabled="isDeleting"
            @click="handleDeleteDoctor"
          >
            {{ isDeleting ? "Eliminando..." : "Eliminar" }}
          </button>
        </template>
      </AtomsModalBase>

      <!-- Edit doctor modal -->
      <MedicosModalesAgregarMedicoRelacionado
        ref="editModalRef"
        :edit-mode="isEditModalOpen"
        :doctor-data="doctorToEdit || undefined"
        :existing-packs="editDoctorPacks"
        :supplier-id="doctorToEdit?.id"
        @doctor-updated="handleDoctorUpdated"
      >
        <template #trigger="{ open }"> </template>
      </MedicosModalesAgregarMedicoRelacionado>
    </template>

    <!-- ===================== HOSPITALS TAB ===================== -->
    <template v-if="activeTab === 'hospitals'">
      <div class="hospitals__controls">
        <UiSearchInput
          placeholder="Buscar"
          aria-label="Buscar en hospitales"
          @update:model-value="handleHospitalSearch"
        />
        <div class="hospitals__controls-right">
          <div class="dropdown">
            <button
              class="panel__button--outline"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Ordenar por
              <AtomsIconsChevronDown size="20" />
            </button>
            <ul class="dropdown-menu">
              <li>
                <button class="dropdown-item" @click="handleSortChange('name')">
                  Por nombre
                </button>
              </li>
              <li>
                <button
                  class="dropdown-item"
                  @click="handleSortChange('recent')"
                >
                  Más recientes
                </button>
              </li>
            </ul>
          </div>
          <button
            class="panel__button--primary"
            @click="handleAddOrEditHospital()"
          >
            <AtomsIconsPlusIcon size="20" />
            Agregar
          </button>
        </div>
      </div>

      <p class="hospitals__subtext">
        Listado de hospitales donde tendrás disponibilidad para atender a sus
        pacientes
      </p>

      <div v-if="isLoadingHospitals" class="hospitals__loading">
        <p>Cargando hospitales...</p>
      </div>

      <div
        v-else-if="sortedHospitals.length === 0 && !hospitalSearchQuery"
        class="hospitals__empty"
      >
        <p>No tienes hospitales registrados</p>
        <button
          class="panel__button--primary"
          @click="handleAddOrEditHospital()"
        >
          <AtomsIconsPlusIcon size="20" />
          Agregar primer hospital
        </button>
      </div>

      <div
        v-else-if="sortedHospitals.length === 0 && hospitalSearchQuery"
        class="hospitals__empty"
      >
        <p>
          No se encontraron hospitales que coincidan con "{{
            hospitalSearchQuery
          }}"
        </p>
      </div>

      <section v-else class="hospitals__main">
        <div
          v-for="hospital in sortedHospitals"
          :key="hospital.id"
          class="hospitals__card"
        >
          <div>
            <h2 class="hospitals__card-title">{{ hospital.name }}</h2>
            <ul class="hospitals__card-info">
              <li class="hospitals__card-info--item">
                {{
                  [
                    hospital.address,
                    hospital.street_number,
                    hospital.city_name,
                    hospital.province,
                  ]
                    .filter(Boolean)
                    .join(", ")
                }}
              </li>
              <li
                v-if="hospital.floor || hospital.door_number"
                class="hospitals__card-info--item"
              >
                <span v-if="hospital.floor">Piso {{ hospital.floor }}</span>
                <span v-if="hospital.floor && hospital.door_number"> - </span>
                <span v-if="hospital.door_number"
                  >Puerta {{ hospital.door_number }}</span
                >
              </li>
            </ul>
          </div>
          <div class="hospitals__card-actions">
            <button
              class="panel__button--outline"
              aria-label="Editar hospital"
              @click="handleAddOrEditHospital(hospital)"
            >
              <AtomsIconsPenLineIcon size="20" />
            </button>
            <button
              class="panel__button--outline"
              aria-label="Eliminar hospital"
              @click="handleDeleteHospital(hospital)"
            >
              <AtomsIconsTrashIcon size="20" />
            </button>
          </div>
        </div>
      </section>

      <MedicosModalesEliminarHospital
        @hospital-deleted="handleHospitalModalClosed"
      />
      <MedicosModalesAgregarHospital
        @hospital-created="handleHospitalModalClosed"
        @hospital-updated="handleHospitalModalClosed"
      />
    </template>
  </NuxtLayout>
  <MedicosRegistroOnboarding />
</template>

<script lang="ts" setup>
import type { TableColumn } from "@/components/ui/appointment-table-base.vue";
import { usePackage, useSupplier } from "@/composables/api";
import type { CreateHospital } from "@/composables/api/useSupplier";
import { useDebounceFn } from "@/composables/useDebounce";
import type { IRelatedMedicalFormData, Supplier } from "@/types";
import { jwtDecode } from "jwt-decode";

definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});

interface DecodedToken {
  id: string;
}

interface Doctor extends IRelatedMedicalFormData {
  id: number;
  createdAt?: string;
}

const activeTab = ref<"doctors" | "hospitals">("doctors");

const { getToken } = useAuthToken();
const { fetchAllSuppliers, fetchSpecialtyBySupplier, deleteSupplier } =
  useSupplier();
const { fetchPackagesBySupplierId } = usePackage();

const decodedToken = jwtDecode<DecodedToken>(getToken()!);

const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const supplier = ref<Supplier | null>(null);
const supplierId = ref<number | null>(null);
const relatedDoctors = ref<Doctor[]>([]);

const searchQuery = ref("");
const isDeleting = ref(false);
const showDeleteModal = ref(false);
const doctorToDelete = ref<Doctor | null>(null);

const isEditModalOpen = ref(false);
const doctorToEdit = ref<Doctor | null>(null);
const editDoctorPacks = ref<any[]>([]);
const loadingDoctorId = ref<number | null>(null);
const editModalRef = ref<any>(null);

const columns: TableColumn[] = [
  { key: "fullName", label: "Nombre completo", sortable: true },
  { key: "medicalCode", label: "Código médico", sortable: true },
  { key: "documentNumber", label: "Documento", sortable: true },
  { key: "medicalType", label: "Tipo", sortable: true },
  { key: "specialties", label: "Especialidades", sortable: false },
  {
    key: "actions",
    label: "Acciones",
    sortable: false,
    headerClass: "appointment-table-base__header-cell--right",
    cellClass: "appointment-table-base__cell--actions",
  },
];

const fetchSupplierId = async (): Promise<number | null> => {
  const api = fetchAllSuppliers();
  await api.request();

  if (api.response.value?.data?.length) {
    supplier.value = api.response.value.data[0];
    supplierId.value = supplier.value.id;
    return supplier.value.id;
  }

  errorMessage.value = "No se encontró un proveedor asociado a este usuario.";
  return null;
};

const loadRelatedDoctors = async (): Promise<void> => {
  try {
    const api = fetchAllSuppliers();
    await api.request();

    if (!api.response.value?.data?.length) {
      relatedDoctors.value = [];
      return;
    }

    const doctors: Doctor[] = await Promise.all(
      api.response.value.data.map(async (supplier: Supplier) => {
        let specialties: any[] = [];

        try {
          const specApi = fetchSpecialtyBySupplier(supplier.id);
          await specApi.request();

          specialties =
            specApi.response.value?.data?.map((spec: any) => ({
              code: spec.medical_specialty?.code || spec.medical_specialty_code,
              name: spec.medical_specialty?.name || "Especialidad",
              id: spec.id,
            })) || [];
        } catch (e) {
          console.warn(
            `⚠️ Error cargando especialidades para ${supplier.name}`,
            e,
          );
        }

        return {
          id: supplier.id,
          documentType: supplier.id_type?.name || "N/A",
          documentNumber: supplier.card_id,
          fullName: supplier.name,
          identityDocumentFile: null,
          medicalCode: supplier.num_medical_enrollment || "N/A",
          validLicenseFile: null,
          medicalType: supplier.medical_type?.name || "N/A",
          specialties,
          codeCardIdFile: supplier.code_card_id_file || "",
          codeMedicalLicenseFile: supplier.code_medical_license_file || "",
          createdAt: supplier.created_date,
          valoracionCost: 0,
        };
      }),
    );

    relatedDoctors.value = doctors;
  } catch (error) {
    console.error("❌ Error cargando médicos:", error);
    errorMessage.value = "Error al cargar los médicos relacionados";
  }
};

const filteredDoctors = computed(() => {
  if (!searchQuery.value) return relatedDoctors.value;

  const q = searchQuery.value.toLowerCase();
  return relatedDoctors.value.filter(
    (d) =>
      d.fullName.toLowerCase().includes(q) ||
      d.medicalCode.toLowerCase().includes(q) ||
      d.documentNumber.toLowerCase().includes(q),
  );
});

const handleEditDoctor = async (doctor: Doctor) => {
  try {
    loadingDoctorId.value = doctor.id;

    doctorToEdit.value = {
      ...doctor,
      documentType:
        typeof doctor.documentType === "string"
          ? doctor.documentType
          : (doctor as any).id_type?.code || "",
      medicalType:
        typeof doctor.medicalType === "string"
          ? doctor.medicalType
          : (doctor as any).medical_type?.code || "",
    };

    editDoctorPacks.value = [];

    const packagesApi = fetchPackagesBySupplierId(doctor.id);
    await packagesApi.request();
    const packages = packagesApi.response.value?.data || [];

    editDoctorPacks.value = packages.map((pkg: any) => {
      let precio = 0;

      if (pkg.product?.value1) {
        precio = parseFloat(pkg.product.value1);
        if (pkg.discount && pkg.discount > 0) {
          const discountAmount = (precio * pkg.discount) / 100;
          precio = precio - discountAmount;
        }
      } else if (pkg.reference_price) {
        precio = parseFloat(pkg.reference_price);
      } else if (pkg.discounted_price) {
        precio = parseFloat(pkg.discounted_price);
      }

      return {
        especialidad: pkg.specialty?.medical_specialty?.code || "",
        procedimiento: pkg.procedure?.code || "",
        producto: pkg.product?.code || "",
        servicios: pkg.services_offer?.ASSESSMENT_DETAILS || [],
        precio,
        precioValoracion: 25000,
        disponibilidad: [],
      };
    });

    isEditModalOpen.value = true;

    await nextTick();

    if (editModalRef.value?.openModal) {
      editModalRef.value.openModal();
    }
  } catch (error) {
    console.error("❌ Error cargando datos del médico:", error);
    errorMessage.value = "Error al cargar los datos del médico";
  } finally {
    loadingDoctorId.value = null;
  }
};

const handleDoctorAdded = async () => {
  await loadRelatedDoctors();
};

const handleDoctorUpdated = async () => {
  if (editModalRef.value?.closeModal) {
    editModalRef.value.closeModal();
  }

  isEditModalOpen.value = false;
  doctorToEdit.value = null;
  editDoctorPacks.value = [];

  await loadRelatedDoctors();
};

const confirmDeleteDoctor = (doctor: Doctor) => {
  doctorToDelete.value = doctor;
  showDeleteModal.value = true;
};

const cancelDelete = () => {
  doctorToDelete.value = null;
  showDeleteModal.value = false;
};

const handleDeleteDoctor = async () => {
  if (!doctorToDelete.value) return;

  try {
    isDeleting.value = true;
    const token = getToken();
    if (!token) throw new Error("Token no encontrado");

    const api = deleteSupplier(doctorToDelete.value.id, token);
    await api.request();

    await loadRelatedDoctors();
    cancelDelete();
  } catch (error) {
    console.error("❌ Error eliminando médico:", error);
    errorMessage.value = "Error al eliminar el médico";
  } finally {
    isDeleting.value = false;
  }
};

const { openModal } = useMedicalModalManager();

const isLoadingHospitals = ref(true);
const hospitals = ref<Supplier[]>([]);
const hospitalSearchQuery = ref("");
const sortOrder = ref("name");

const loadHospitals = async () => {
  isLoadingHospitals.value = true;
  try {
    const { response, error, request } = fetchAllSuppliers();
    await request();

    if (error.value) {
      console.error("Error al cargar hospitales:", error.value);
      return;
    }

    if (response.value?.data) {
      hospitals.value = response.value.data.filter(
        (supplier: Supplier) => supplier.is_hospital,
      );
    }
  } catch (err) {
    console.error("Error al cargar hospitales:", err);
  } finally {
    isLoadingHospitals.value = false;
  }
};

const filteredHospitals = computed(() => {
  if (!hospitalSearchQuery.value) return hospitals.value;

  const query = hospitalSearchQuery.value.toLowerCase();
  return hospitals.value.filter(
    (hospital) =>
      hospital.name.toLowerCase().includes(query) ||
      hospital.city_name?.toLowerCase().includes(query) ||
      hospital.address?.toLowerCase().includes(query),
  );
});

const sortedHospitals = computed(() => {
  const sorted = [...filteredHospitals.value];

  switch (sortOrder.value) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "recent":
      return sorted.sort(
        (a, b) =>
          new Date(b.created_date || 0).getTime() -
          new Date(a.created_date || 0).getTime(),
      );
    default:
      return sorted;
  }
});

const mapSupplierToHospitalData = (
  supplier: Supplier,
): Partial<CreateHospital> => {
  const rep = supplier.legal_representative as any;
  const legalRepresentativeString =
    typeof supplier.legal_representative === "string"
      ? supplier.legal_representative
      : (rep?.name ?? rep?.full_name ?? "");

  return {
    name: supplier.name,
    email: supplier.email,
    phone_number: supplier.phone_number,
    country_iso_code: supplier.country_iso_code,
    province: supplier.province,
    city_name: supplier.city_name,
    address: supplier.address || "",
    street_number: supplier.street_number || "",
    postal_code: supplier.postal_code || "",
    floor: supplier.floor || "",
    door_number: supplier.door_number || "",
    id_type: "JURIDICAL_DNI",
    card_id: supplier.card_id,
    legal_representative: legalRepresentativeString,
    is_hospital: true,
    description: supplier.description || "",
  };
};

const handleAddOrEditHospital = (hospital: Supplier | null = null) => {
  if (hospital) {
    openModal("agregarHospital", {
      mode: "edit",
      hospitalId: hospital.id.toString(),
      hospitalData: mapSupplierToHospitalData(hospital),
    });
  } else {
    openModal("agregarHospital", { mode: "create" });
  }
};

const handleDeleteHospital = (hospital: Supplier) => {
  openModal("eliminarHospital", {
    hospitalId: hospital.id.toString(),
    hospitalName: hospital.name,
  });
};

const handleHospitalSearch = useDebounceFn((value: string) => {
  hospitalSearchQuery.value = value;
}, 300);

const handleSortChange = (value: string) => {
  sortOrder.value = value;
};

const handleHospitalModalClosed = () => {
  loadHospitals();
};

onMounted(async () => {
  isLoading.value = true;
  const id = await fetchSupplierId();
  if (id) await loadRelatedDoctors();
  isLoading.value = false;

  loadHospitals();

  window.addEventListener("hospital-updated", handleHospitalModalClosed);
  window.addEventListener("hospital-created", handleHospitalModalClosed);
  window.addEventListener("hospital-deleted", handleHospitalModalClosed);
});

onUnmounted(() => {
  window.removeEventListener("hospital-updated", handleHospitalModalClosed);
  window.removeEventListener("hospital-created", handleHospitalModalClosed);
  window.removeEventListener("hospital-deleted", handleHospitalModalClosed);
});
</script>

<style lang="scss" scoped>
.panel__header {
  margin-bottom: $spacing-lg;
}

.panel__tabs {
  display: flex;
  gap: 0;
  border-bottom: 2px solid #e4e7ec;
  margin-bottom: 1.25rem;
}

.panel__tab {
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

  &--active {
    color: $color-primary;
    border-bottom-color: $color-primary;
  }
}

.panel__button--primary {
  @include primary-button;
  white-space: nowrap;

  @include respond-to-max(md) {
    width: 100%;
  }
}

.panel__button--outline {
  @include outline-button;
  white-space: nowrap;
}

.panel__error {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #fee2e2;
  color: $color-error;
  padding: $spacing-md;
  border-radius: $border-radius-md;
  border: 1px solid #fecaca;

  p {
    margin: 0;
    font-weight: 500;
  }
}

.doctors__controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-md;
  margin-bottom: $spacing-lg;

  @include respond-to-max(md) {
    flex-direction: column;
    align-items: stretch;
  }
}

.doctors__table-name {
  font-weight: 600;
  color: $color-foreground;
}

.doctors__code {
  font-family: "Monaco", "Courier New", monospace;
  background-color: #f3f4f6;
  padding: 6px 10px;
  border-radius: $border-radius-md;
  font-size: 13px;
  color: $color-foreground;
  font-weight: 500;
}

.doctors__document {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.doctors__document-type {
  font-size: 12px;
  color: $color-text-muted;
  font-weight: 500;
}

.doctors__document-number {
  font-weight: 600;
  color: $color-foreground;
}

.doctors__type-badge {
  display: inline-block;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 999px;
  background-color: #e0e7ff;
  color: $color-primary;
  font-weight: 600;
}

.doctors__specialties {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.doctors__specialty-badge {
  font-size: 12px;
  background-color: #ecfeff;
  color: darken($primary-aqua, 15%);
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 500;
}

.doctors__actions {
  display: inline-flex;
  gap: $spacing-sm;
  justify-content: flex-end;
}

.doctors__action-button {
  @include button-base;
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: $border-radius-md;
  background-color: transparent;
  color: $color-text-muted;
  position: relative;
  transition: all 0.2s ease;

  &:hover {
    color: $color-foreground;
  }

  &--edit:hover:not(.doctors__action-button--loading) {
    background-color: #dbeafe;
    color: $color-primary;
  }

  &--delete:hover {
    background-color: #fee2e2;
    color: $color-danger;
  }

  &--loading {
    opacity: 0.6;
    cursor: wait;
    pointer-events: none;
  }
}

.doctors__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(59, 130, 246, 0.3);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

.doctors__empty-state {
  text-align: center;
  padding: 40px 20px;
}

.doctors__empty-icon {
  color: #9ca3af;
  margin-bottom: $spacing-md;
}

.doctors__empty-title {
  font-size: 20px;
  font-weight: 700;
  color: $color-foreground;
  margin: 0 0 $spacing-sm 0;
  font-family: $font-family-main;
}

.doctors__empty-text {
  color: $color-text-muted;
  margin: 0 0 $spacing-lg 0;
  font-size: 15px;
  line-height: 1.6;
}

.doctors__empty-button {
  @include primary-button;
}

.doctors__delete-modal-content {
  padding: 14px;

  p {
    @include text-base;
    margin: 0 0 12px 0;
    font-size: 15px;
    line-height: 1.6;
  }
}

.doctors__delete-modal-warning {
  font-size: 13px;
  color: $color-error;
  font-weight: 500;
}

.doctors__modal-button--cancel {
  @include secondary-button;
}

.doctors__modal-button--delete {
  @include danger-button;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.hospitals__controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.5rem;

  @include respond-to-max(md) {
    flex-direction: column;
    align-items: stretch;
  }
}

.hospitals__controls-right {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-shrink: 0;
}

.hospitals__subtext {
  font-weight: 400;
  font-size: 14px;
  line-height: 140%;
  color: #6d758f;
  margin-bottom: 1rem;
}

.hospitals__main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;

  @include respond-to(md) {
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
}

.hospitals__loading,
.hospitals__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  gap: 1rem;

  p {
    color: #6d758f;
    font-size: 1rem;
  }
}

.hospitals__card {
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

.hospitals__card-title {
  font-weight: 600;
  font-size: 14px;
  line-height: 24px;
  padding: 0;
  margin: 0;
  color: #19213d;
}

.hospitals__card-info {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;

  &--item {
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
    color: #6d758f;
  }
}

.hospitals__card-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.dropdown-menu {
  min-width: 160px;
}

.dropdown-item {
  cursor: pointer;

  &:active {
    background-color: $primary-aqua;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@include respond-to-max(sm) {
  .panel__header {
    margin-bottom: 20px;
  }

  .doctors__controls {
    margin-bottom: 20px;
  }
}
</style>
