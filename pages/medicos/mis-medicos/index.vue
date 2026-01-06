<script lang="ts" setup>
import MedicosModalesEditarMedicoRelacionado from "@/components/medicos/modales/editar-medico-relacionado.vue";
import { useSupplier } from "@/composables/api";
import type { IRelatedMedicalFormData, Supplier } from "@/types";
import { onClickOutside } from "@vueuse/core";
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

type SortOption = "name" | "medicalCode" | "createdAt";

const { getToken } = useAuthToken();
const { fetchAllSuppliers, fetchSpecialtyBySupplier, deleteSupplier } =
  useSupplier();

const decodedToken = jwtDecode<DecodedToken>(getToken()!);

const showSort = ref(false);
const sortDropdownRef = ref<HTMLElement | null>(null);

const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const supplier = ref<Supplier | null>(null);
const supplierId = ref<number | null>(null);
const relatedDoctors = ref<Doctor[]>([]);

const searchQuery = ref("");
const isDeleting = ref(false);
const showDeleteModal = ref(false);
const doctorToDelete = ref<Doctor | null>(null);

const editModalRef = ref<InstanceType<
  typeof MedicosModalesEditarMedicoRelacionado
> | null>(null);

const sortBy = ref<SortOption>("name");
const sortDirection = ref<"asc" | "desc">("asc");

onClickOutside(sortDropdownRef, () => {
  showSort.value = false;
});

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
            e
          );
        }

        return {
          id: supplier.id,
          documentType:
            typeof supplier.id_type === "string"
              ? supplier.id_type
              : supplier.id_type?.name || "",
          documentNumber: supplier.card_id,
          fullName: supplier.name,
          identityDocumentFile: null,
          medicalCode: supplier.num_medical_enrollment || "N/A",
          validLicenseFile: null,
          medicalType:
            supplier.medical_type?.name || supplier.medical_type_code || "N/A",
          specialties,
          codeCardIdFile: supplier.code_card_id_file || "",
          codeMedicalLicenseFile: supplier.code_medical_license_file || "",
          createdAt: supplier.created_date,
        };
      })
    );

    relatedDoctors.value = doctors;
  } catch (error) {
    console.error("❌ Error cargando médicos:", error);
    errorMessage.value = "Error al cargar los médicos relacionados";
  }
};

const filteredDoctors = computed(() => {
  let list = [...relatedDoctors.value];

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (d) =>
        d.fullName.toLowerCase().includes(q) ||
        d.medicalCode.toLowerCase().includes(q) ||
        d.documentNumber.toLowerCase().includes(q)
    );
  }

  list.sort((a, b) => {
    let result = 0;

    switch (sortBy.value) {
      case "name":
        result = a.fullName.localeCompare(b.fullName);
        break;
      case "medicalCode":
        result = a.medicalCode.localeCompare(b.medicalCode);
        break;
      case "createdAt":
        result =
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime();
        break;
    }

    return sortDirection.value === "asc" ? result : -result;
  });

  return list;
});

const setSort = (field: SortOption) => {
  if (sortBy.value === field) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = field;
    sortDirection.value = "asc";
  }
  showSort.value = false;
};

const handleDoctorAdded = async () => loadRelatedDoctors();
const handleDoctorUpdated = async () => loadRelatedDoctors();

const handleEditDoctor = (doctor: Doctor) => {
  editModalRef.value?.openModal(doctor);
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

<template>
  <NuxtLayout name="medicos-dashboard">
    <div class="doctors__header">
      <UiHeaderBreadcrumb title="Mis médicos" />

      <MedicosModalesAgregarMedicoRelacionado @doctor-added="handleDoctorAdded">
        <template #trigger="{ open }">
          <button class="doctors__button--primary" @click="open">
            <AtomsIconsPlusIcon size="20" />
            Añadir médico
          </button>
        </template>
      </MedicosModalesAgregarMedicoRelacionado>
    </div>

    <div class="doctors__controls">
      <UiSearchInput
        v-model="searchQuery"
        placeholder="Buscar médico por nombre, código o documento"
      />

      <div ref="sortDropdownRef" class="doctors__sort-dropdown">
        <button
          class="doctors__sort-button"
          type="button"
          @click="showSort = !showSort"
        >
          Ordenar por
          <AtomsIconsChevronDown size="18" />
        </button>

        <ul v-if="showSort" class="doctors__sort-menu">
          <li>
            <a class="doctors__sort-item" @click.prevent="setSort('name')">
              Nombre
            </a>
          </li>
          <li>
            <a
              class="doctors__sort-item"
              @click.prevent="setSort('medicalCode')"
            >
              Código médico
            </a>
          </li>
          <li>
            <a class="doctors__sort-item" @click.prevent="setSort('createdAt')">
              Fecha de registro
            </a>
          </li>
        </ul>
      </div>
    </div>

    <WebsitePerfilDoctorPantallaCarga v-if="isLoading" />

    <div v-else-if="errorMessage" class="doctors__error">
      <AtomsIconsAlertCircleIcon size="24" />
      <p>{{ errorMessage }}</p>
    </div>

    <div v-else-if="filteredDoctors.length > 0" class="doctors__table-wrapper">
      <table class="doctors__table">
        <thead class="doctors__table-head">
          <tr>
            <th>Nombre completo</th>
            <th>Código médico</th>
            <th>Documento</th>
            <th>Tipo</th>
            <th>Especialidades</th>
            <th class="doctors__table-header--actions">Acciones</th>
          </tr>
        </thead>

        <tbody class="doctors__table-body">
          <tr
            v-for="doctor in filteredDoctors"
            :key="doctor.id"
            class="doctors__table-row"
          >
            <td>
              <strong class="doctors__table-name">{{ doctor.fullName }}</strong>
            </td>

            <td>
              <span class="doctors__code">
                {{ doctor.medicalCode }}
              </span>
            </td>

            <td>
              <div class="doctors__document">
                <span class="doctors__document-type">
                  {{ doctor.documentType }}
                </span>
                <span class="doctors__document-number">
                  {{ doctor.documentNumber }}
                </span>
              </div>
            </td>

            <td>
              <span class="doctors__type-badge">
                {{ doctor.medicalType }}
              </span>
            </td>

            <td>
              <div class="doctors__specialties">
                <span
                  v-for="spec in doctor.specialties"
                  :key="spec.code"
                  class="doctors__specialty-badge"
                >
                  {{ spec.name }}
                </span>
              </div>
            </td>

            <td class="doctors__table-cell--actions">
              <div class="doctors__actions">
                <button
                  class="doctors__action-button doctors__action-button--edit"
                  @click="handleEditDoctor(doctor)"
                  title="Editar médico"
                >
                  <AtomsIconsEditPencilIcon size="18" />
                </button>

                <button
                  class="doctors__action-button doctors__action-button--delete"
                  @click="confirmDeleteDoctor(doctor)"
                  title="Eliminar médico"
                >
                  <AtomsIconsTrashIcon size="18" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="doctors__empty">
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
    </div>

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

    <MedicosModalesEditarMedicoRelacionado
      ref="editModalRef"
      :doctor="null"
      @doctor-updated="handleDoctorUpdated"
    />
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.doctors__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: $spacing-lg;
  gap: $spacing-md;

  @include respond-to-max(sm) {
    flex-direction: column;
    align-items: stretch;
  }
}

.doctors__button--primary {
  @include primary-button;

  @include respond-to-max(sm) {
    width: 100%;
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

.doctors__sort-dropdown {
  position: relative;
}

.doctors__sort-button {
  @include outline-button;
  gap: $spacing-sm;
  white-space: nowrap;

  @include respond-to-max(md) {
    width: 100%;
  }
}

.doctors__sort-arrow {
  font-size: 16px;
  color: $color-text-muted;
}

.doctors__sort-menu {
  position: absolute;
  top: calc(100% + $spacing-sm);
  right: 0;
  min-width: 200px;
  background-color: $white;
  border: 1px solid #e5e7eb;
  border-radius: $border-radius-md;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: $spacing-sm 0;
  list-style: none;
  z-index: 50;
  animation: fadeInDown 0.2s ease;

  @include respond-to-max(md) {
    left: 0;
    right: 0;
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.doctors__sort-item {
  @include link-base;
  display: block;
  padding: 10px 16px;
  font-size: 14px;
  color: $color-foreground;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: #f3f4f6;
  }

  &:active {
    background-color: #e5e7eb;
  }
}

.doctors__table-wrapper {
  background-color: $white;
  border-radius: $border-radius-md;
  border: 1px solid #e5e7eb;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.doctors__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  font-family: $font-family-main;
}

.doctors__table-head {
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;

  th {
    color: $color-text-secondary;
    font-weight: 600;
    text-align: left;
    padding: $spacing-md;
    white-space: nowrap;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
}

.doctors__table-header--actions {
  text-align: right;
}

.doctors__table-body {
  tr {
    transition: background-color 0.15s ease;
  }
}

.doctors__table-row {
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #f9fafb;
  }

  td {
    padding: $spacing-md;
    vertical-align: middle;
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

.doctors__table-cell--actions {
  text-align: right;
}

.doctors__actions {
  display: inline-flex;
  gap: $spacing-sm;
}

.doctors__action-button {
  @include button-base;
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: $border-radius-md;
  background-color: transparent;
  color: $color-text-muted;

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

.doctors__empty {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 80px 20px;
}

.doctors__empty-state {
  text-align: center;
  max-width: 480px;
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
  padding: $spacing-sm 0;

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

@include respond-to-max(lg) {
  .doctors__table-wrapper {
    overflow-x: auto;
  }

  .doctors__table {
    min-width: 800px;
  }
}

@include respond-to-max(sm) {
  .doctors__header {
    margin-bottom: 20px;
  }

  .doctors__controls {
    margin-bottom: 20px;
  }

  .doctors__table-head th {
    padding: 12px;
    font-size: 12px;
  }

  .doctors__table-row td {
    padding: 12px;
  }
}
</style>
