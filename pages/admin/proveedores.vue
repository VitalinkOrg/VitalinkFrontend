<script setup lang="ts">
import { useSupplier } from "@/composables/api/useSupplier";

useSeoMeta({
  title: "Proveedores — Panel de Administración Vitalink",
  description:
    "Gestiona la visibilidad de doctores y clínicas en la plataforma Vitalink.",
});

definePageMeta({
  middleware: ["auth-admin"],
});

const { getAllSuppliersAdmin, toggleSupplierActive } = useSupplier();
const toast = useToast();

type StatusFilter = "all" | "active" | "inactive";

const suppliers = ref<IAdminSupplierListItem[]>([]);
const total = ref(0);
const page = ref(1);
const limit = 20;
const search = ref("");
const statusFilter = ref<StatusFilter>("all");
const loading = ref(false);

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / limit)));

const isDeletedParam = computed<0 | 1 | undefined>(() => {
  if (statusFilter.value === "active") return 0;
  if (statusFilter.value === "inactive") return 1;
  return undefined;
});

const fetchSuppliers = async () => {
  loading.value = true;
  const { data, error, pagination } = await getAllSuppliersAdmin({
    search: search.value || undefined,
    page: page.value,
    limit,
    isDeleted: isDeletedParam.value,
  });

  if (error) {
    toast.error(error.info || "No se pudo cargar la lista de proveedores.");
    loading.value = false;
    return;
  }

  suppliers.value = data ?? [];
  total.value = pagination?.total ?? suppliers.value.length;
  loading.value = false;
};

const debouncedSearch = useDebounceFn(() => {
  page.value = 1;
  fetchSuppliers();
}, 400);

watch(search, () => {
  debouncedSearch();
});

const setStatusFilter = (filter: StatusFilter) => {
  if (statusFilter.value === filter) return;
  statusFilter.value = filter;
  page.value = 1;
  fetchSuppliers();
};

const goToPage = (newPage: number) => {
  page.value = newPage;
  fetchSuppliers();
};

// ─── Toggle confirmation modal ──────────────────────────────────────────────

const confirmModalOpen = ref(false);
const selectedSupplier = ref<IAdminSupplierListItem | null>(null);
const toggling = ref(false);

const nextIsDeleted = computed<0 | 1>(() =>
  selectedSupplier.value?.is_deleted ? 0 : 1,
);

const openConfirm = (supplier: IAdminSupplierListItem) => {
  selectedSupplier.value = supplier;
  confirmModalOpen.value = true;
};

const closeConfirm = () => {
  if (toggling.value) return;
  confirmModalOpen.value = false;
  selectedSupplier.value = null;
};

const confirmToggle = async () => {
  if (!selectedSupplier.value) return;

  toggling.value = true;
  const supplierId = selectedSupplier.value.id;
  const newIsDeleted = nextIsDeleted.value;

  const { data, error } = await toggleSupplierActive({
    supplierId,
    isDeleted: newIsDeleted,
  });

  toggling.value = false;

  if (error) {
    toast.error(error.info || "No se pudo actualizar el estado del proveedor.");
    return;
  }

  const target = suppliers.value.find((s) => s.id === supplierId);
  if (target) {
    target.is_deleted = data?.is_deleted ?? newIsDeleted;
  }

  toast.success(
    newIsDeleted === 1
      ? "Proveedor desactivado correctamente."
      : "Proveedor activado correctamente.",
  );

  confirmModalOpen.value = false;
  selectedSupplier.value = null;
};

const specialtiesLabel = (supplier: IAdminSupplierListItem): string => {
  const names = (supplier.specialties ?? []).map((specialty) => specialty.name);
  const unique = Array.from(new Set(names));
  return unique.length ? unique.join(", ") : "—";
};

onMounted(() => {
  fetchSuppliers();
});
</script>

<template>
  <NuxtLayout name="admin-dashboard">
    <nav style="--bs-breadcrumb-divider: &quot;/&quot;" aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink href="/admin/inicio" class="text-muted">Inicio</NuxtLink>
        </li>
        <li class="breadcrumb-item active fw-semibold" aria-current="page">
          Proveedores
        </li>
      </ol>
    </nav>

    <div
      class="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4"
    >
      <span class="fw-medium fs-4">Proveedores</span>

      <div class="d-flex flex-wrap gap-2">
        <div class="btn-group" role="group" aria-label="Filtrar por estado">
          <button
            type="button"
            class="btn btn-sm"
            :class="statusFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'"
            @click="setStatusFilter('all')"
          >
            Todos
          </button>
          <button
            type="button"
            class="btn btn-sm"
            :class="
              statusFilter === 'active' ? 'btn-primary' : 'btn-outline-primary'
            "
            @click="setStatusFilter('active')"
          >
            Solo Activos
          </button>
          <button
            type="button"
            class="btn btn-sm"
            :class="
              statusFilter === 'inactive'
                ? 'btn-primary'
                : 'btn-outline-primary'
            "
            @click="setStatusFilter('inactive')"
          >
            Solo Inactivos
          </button>
        </div>

        <UiSearchInput
          v-model="search"
          placeholder="Buscar por nombre"
          aria-label="Buscar proveedores por nombre"
          max-width="16rem"
        />
      </div>
    </div>

    <div class="card border-0 shadow-sm rounded-3">
      <div class="card-body p-0">
        <div v-if="loading" class="text-center text-muted py-5">
          Cargando proveedores…
        </div>

        <div
          v-else-if="!suppliers.length"
          class="text-center text-muted py-5"
        >
          No se encontraron proveedores con los filtros seleccionados.
        </div>

        <div v-else class="table-responsive">
          <table class="table align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Email</th>
                <th scope="col">Teléfono</th>
                <th scope="col">Especialidades</th>
                <th scope="col">Tipo</th>
                <th scope="col">Estado</th>
                <th scope="col" class="text-end">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="supplier in suppliers" :key="supplier.id">
                <td class="fw-medium">{{ supplier.name || "—" }}</td>
                <td>{{ supplier.email }}</td>
                <td>{{ supplier.phone_number || "—" }}</td>
                <td>{{ specialtiesLabel(supplier) }}</td>
                <td>{{ supplier.is_hospital ? "Clínica" : "Doctor" }}</td>
                <td>
                  <span
                    class="badge rounded-pill"
                    :class="
                      supplier.is_deleted ? 'text-bg-secondary' : 'text-bg-success'
                    "
                  >
                    {{ supplier.is_deleted ? "Inactivo" : "Activo" }}
                  </span>
                </td>
                <td class="text-end">
                  <div class="form-check form-switch d-inline-flex m-0">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      role="switch"
                      :checked="!supplier.is_deleted"
                      :aria-label="`${supplier.is_deleted ? 'Activar' : 'Desactivar'} a ${supplier.name}`"
                      @click.prevent="openConfirm(supplier)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="d-flex justify-content-center mt-3" v-if="!loading && suppliers.length">
      <MedicosPaginacion
        :current-page="page"
        :total-pages="totalPages"
        :total-items="total"
        :items-per-page="limit"
        :show-info="true"
        @page-changed="goToPage"
      />
    </div>

    <UiModalBase
      :is-open="confirmModalOpen"
      title="Confirmar cambio de estado"
      size="small"
      @close="closeConfirm"
    >
      <p class="mb-0" v-if="selectedSupplier">
        ¿Estás seguro de
        <strong>{{ nextIsDeleted === 1 ? "desactivar" : "activar" }}</strong>
        a <strong>{{ selectedSupplier.name }}</strong>?
      </p>

      <template #footer>
        <button
          type="button"
          class="btn btn-outline-secondary"
          :disabled="toggling"
          @click="closeConfirm"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn"
          :class="nextIsDeleted === 1 ? 'btn-danger' : 'btn-success'"
          :disabled="toggling"
          @click="confirmToggle"
        >
          {{ toggling ? "Guardando…" : "Confirmar" }}
        </button>
      </template>
    </UiModalBase>
  </NuxtLayout>
</template>
