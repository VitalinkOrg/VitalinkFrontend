<template>
  <NuxtLayout name="medicos-dashboard">
    <div class="doctors__header">
      <UiHeaderBreadcrumb title="Mis médicos" />
    </div>

    <div class="doctors__controls">
      <UiSearchInput
        v-model="searchQuery"
        placeholder="Buscar médico por nombre, código o documento"
      />

      <MedicosModalesAgregarMedicoRelacionado @doctor-added="handleDoctorAdded">
        <template #trigger="{ open }">
          <button class="doctors__button--primary" @click="open">
            <AtomsIconsPlusIcon size="20" />
            Añadir médico
          </button>
        </template>
      </MedicosModalesAgregarMedicoRelacionado>
    </div>

    <WebsitePerfilDoctorPantallaCarga v-if="isLoading" />

    <div v-else-if="errorMessage" class="doctors__error">
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
  </NuxtLayout>
  <MedicosRegistroOnboarding />
</template>

<script lang="ts" setup>
import type { TableColumn } from "@/components/ui/appointment-table-base.vue";
import { usePackage, useSupplier } from "@/composables/api";
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
  {
    key: "fullName",
    label: "Nombre completo",
    sortable: true,
  },
  {
    key: "medicalCode",
    label: "Código médico",
    sortable: true,
  },
  {
    key: "documentNumber",
    label: "Documento",
    sortable: true,
  },
  {
    key: "medicalType",
    label: "Tipo",
    sortable: true,
  },
  {
    key: "specialties",
    label: "Especialidades",
    sortable: false,
  },
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
  if (!searchQuery.value) {
    return relatedDoctors.value;
  }

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
    console.log("✏️ Editando médico:", doctor);

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

    console.log("📦 Packs recibidos del API:", packages);

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
        precio: precio,
        precioValoracion: 25000,
        disponibilidad: [],
      };
    });

    console.log("📦 Packs mapeados:", editDoctorPacks.value);

    isEditModalOpen.value = true;

    await nextTick();

    if (editModalRef.value?.openModal) {
      console.log("🔓 Abriendo modal de edición");
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
  console.log("✅ Doctor actualizado, limpiando estado");

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

onMounted(async () => {
  isLoading.value = true;
  const id = await fetchSupplierId();
  if (id) await loadRelatedDoctors();
  isLoading.value = false;
});
</script>

<style lang="scss" scoped>
.doctors__header {
  margin-bottom: $spacing-lg;
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

.doctors__button--primary {
  @include primary-button;
  white-space: nowrap;

  @include respond-to-max(md) {
    width: 100%;
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

.doctors__error {
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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@include respond-to-max(sm) {
  .doctors__header {
    margin-bottom: 20px;
  }

  .doctors__controls {
    margin-bottom: 20px;
  }
}
</style>
