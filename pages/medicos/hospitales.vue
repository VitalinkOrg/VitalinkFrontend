<script lang="ts" setup>
import { useSupplier } from "@/composables/api";
import type { CreateHospital } from "@/composables/api/useSupplier";
import { useDebounceFn } from "@/composables/useDebounce";
import type { Supplier } from "@/types";

definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});

const { fetchAllSuppliers } = useSupplier();
const { openModal } = useMedicalModalManager();

const isLoading = ref(true);
const hospitals = ref<Supplier[]>([]);
const searchQuery = ref("");
const sortOrder = ref("name");

const loadHospitals = async () => {
  isLoading.value = true;
  try {
    const { response, error, request } = fetchAllSuppliers();
    await request();

    if (error.value) {
      console.error("Error al cargar hospitales:", error.value);
      return;
    }

    if (response.value?.data) {
      hospitals.value = response.value.data.filter(
        (supplier: Supplier) => supplier.is_hospital
      );
    }
  } catch (err) {
    console.error("Error al cargar hospitales:", err);
  } finally {
    isLoading.value = false;
  }
};

const filteredHospitals = computed(() => {
  if (!searchQuery.value) return hospitals.value;

  const query = searchQuery.value.toLowerCase();
  return hospitals.value.filter(
    (hospital) =>
      hospital.name.toLowerCase().includes(query) ||
      hospital.city_name?.toLowerCase().includes(query) ||
      hospital.address?.toLowerCase().includes(query)
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
          new Date(a.created_date || 0).getTime()
      );
    default:
      return sorted;
  }
});

const mapSupplierToHospitalData = (
  supplier: Supplier
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
    openModal("agregarHospital", {
      mode: "create",
    });
  }
};

const handleDeleteHospital = (hospital: Supplier) => {
  openModal("eliminarHospital", {
    hospitalId: hospital.id.toString(),
    hospitalName: hospital.name,
  });
};

const handleSearch = useDebounceFn((value: string) => {
  searchQuery.value = value;
}, 300);

const handleSortChange = (value: string) => {
  sortOrder.value = value;
};

const handleModalClosed = () => {
  loadHospitals();
};

onMounted(() => {
  loadHospitals();
});

onMounted(() => {
  window.addEventListener("hospital-updated", handleModalClosed);
  window.addEventListener("hospital-created", handleModalClosed);
  window.addEventListener("hospital-deleted", handleModalClosed);
});

onUnmounted(() => {
  window.removeEventListener("hospital-updated", handleModalClosed);
  window.removeEventListener("hospital-created", handleModalClosed);
  window.removeEventListener("hospital-deleted", handleModalClosed);
});
</script>

<template>
  <NuxtLayout name="medicos-dashboard">
    <header class="hospitals__header">
      <nav class="breadcrumb-nav" aria-label="Navegación de migas de pan">
        <ol class="breadcrumb-nav__list">
          <li class="breadcrumb-nav__item">
            <NuxtLink
              href="/medicos/inicio"
              class="breadcrumb-nav__link breadcrumb-nav__link--muted"
            >
              Inicio
            </NuxtLink>
          </li>
          <li
            class="breadcrumb-nav__item breadcrumb-nav__item--active"
            aria-current="page"
          >
            <span class="breadcrumb-nav__text">Hospitales</span>
          </li>
        </ol>
      </nav>

      <h1 class="hospitals__title">Mis Hospitales</h1>

      <div class="hospitals__toolbar">
        <UiSearchInput
          placeholder="Buscar"
          aria-label="Buscar en hospitales"
          @update:model-value="handleSearch"
        />
        <div class="dropdown">
          <button
            class="hospitals__button--outline"
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
              <button class="dropdown-item" @click="handleSortChange('recent')">
                Más recientes
              </button>
            </li>
          </ul>
        </div>
      </div>

      <p class="hospitals__subtext">
        Listado de hospitales donde tendrás disponibilidad para atender a sus
        pacientes
      </p>
    </header>

    <!-- Loading state -->
    <div v-if="isLoading" class="hospitals__loading">
      <p>Cargando hospitales...</p>
    </div>

    <div
      v-else-if="sortedHospitals.length === 0 && !searchQuery"
      class="hospitals__empty"
    >
      <p>No tienes hospitales registrados</p>
      <button
        class="hospitals__button--priamry"
        @click="handleAddOrEditHospital()"
      >
        <AtomsIconsPlusIcon size="20" />
        Agregar primer hospital
      </button>
    </div>

    <div
      v-else-if="sortedHospitals.length === 0 && searchQuery"
      class="hospitals__empty"
    >
      <p>No se encontraron hospitales que coincidan con "{{ searchQuery }}"</p>
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
            class="hospitals__button--outline"
            aria-label="Editar hospital"
            @click="handleAddOrEditHospital(hospital)"
          >
            <AtomsIconsPenLineIcon size="20" />
          </button>
          <button
            class="hospitals__button--outline"
            aria-label="Eliminar hospital"
            @click="handleDeleteHospital(hospital)"
          >
            <AtomsIconsTrashIcon size="20" />
          </button>
        </div>
      </div>
    </section>

    <div v-if="!isLoading && hospitals.length > 0">
      <button
        class="hospitals__button--priamry"
        @click="handleAddOrEditHospital()"
      >
        <AtomsIconsPlusIcon size="20" />
        Agregar
      </button>
    </div>
  </NuxtLayout>

  <MedicosModalesEliminarHospital @hospital-deleted="handleModalClosed" />
  <MedicosModalesAgregarHospital
    @hospital-created="handleModalClosed"
    @hospital-updated="handleModalClosed"
  />
</template>

<style lang="scss" scoped>
.hospitals {
  &__header {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 0.5rem;

    @include respond-to(md) {
      margin-bottom: 1rem;
    }
  }

  &__title {
    font-family: $font-family-main;
    font-weight: 600;
    font-size: 20px;
    line-height: 20px;
    letter-spacing: 0;
  }

  &__main {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1rem;

    @include respond-to(md) {
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
  }

  &__toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
  }

  &__loading,
  &__empty {
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

  &__button {
    &--priamry {
      @include primary-button;
      text-wrap: nowrap;
      background: $primary-aqua;
      border: 1px solid $primary-aqua;
      padding: 8px 14px;
      gap: 8px;

      &:hover {
        background-color: darken($primary-aqua, 5%);
        border-color: darken($primary-aqua, 5%);
      }

      &:active {
        background-color: darken($primary-aqua, 10%);
      }

      &:disabled {
        background-color: #c2c6e9;
        color: #ffffff;
        cursor: not-allowed;
      }

      &:focus-visible {
        border-color: darken($primary-aqua, 10%);
        box-shadow: 0 0 0 3px rgba($primary-aqua, 0.4);
      }
    }

    &--outline {
      @include outline-button;
      text-wrap: nowrap;
    }
  }

  &__subtext {
    font-weight: 400;
    font-size: 14px;
    line-height: 140%;
    color: #6d758f;
  }

  &__card {
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

  &__card-title {
    font-weight: 600;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: 0;
    padding: 0;
    margin: 0;
    color: #19213d;
  }

  &__card-info {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;

    &--item {
      font-weight: 500;
      font-size: 14px;
      line-height: 24px;
      letter-spacing: 0;
      color: #6d758f;
    }
  }

  &__card-actions {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }
}

.breadcrumb-nav {
  display: flex;
  align-items: center;
  --breadcrumb-divider: "/";

  &__list {
    display: flex;
    list-style: none;
    padding: 0;
    margin: 0;
    flex-wrap: wrap;
    gap: 0.25rem;

    li + li::before {
      content: var(--breadcrumb-divider);
      padding: 0 0.5rem;
      color: #6c757d;

      @include respond-to-max(sm) {
        padding: 0 0.25rem;
      }
    }
  }

  &__item {
    font-size: 0.75rem;

    @include respond-to(sm) {
      font-size: 0.875rem;
    }

    &--active .breadcrumb-nav__text {
      color: #6c757d;
    }
  }

  &__link {
    text-decoration: none;
    color: inherit;

    &--muted {
      color: #6c757d;
    }

    &:hover,
    &:focus-visible {
      text-decoration: underline;
      outline: 2px solid transparent;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
      border-radius: 2px;
    }
  }

  &__text {
    color: inherit;
  }
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
</style>
