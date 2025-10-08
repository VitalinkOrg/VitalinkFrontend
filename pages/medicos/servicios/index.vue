<script lang="ts" setup>
import { jwtDecode } from "jwt-decode";
import { onMounted, ref } from "vue";
import { useSupplier } from "~/composables/api";
import type { Service, Supplier } from "~/types";

definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});

interface DecodedToken {
  id: string;
}

const { getToken } = useAuthToken();
const { fetchAllSuppliers, fetchSupplier } = useSupplier();

const decodedToken = jwtDecode<DecodedToken>(getToken()!);
const userId = decodedToken.id;

const isLoading = ref<boolean>(false);
const errorMessage = ref<string | null>(null);
const services = ref<Service[]>([]);
const supplier = ref<Supplier | null>(null);
const supplierId = ref<number | null>(null);

const fetchSupplierId = async (): Promise<number | null> => {
  const api = fetchAllSuppliers();
  await api.request();

  const response = api.response.value;
  const apiError = api.error.value;

  if (response?.data) {
    supplier.value = response.data[0];
    supplierId.value = supplier.value.id;
    return supplier.value.id;
  }

  if (apiError) {
    errorMessage.value = "No se encontró un proveedor asociado a este usuario.";
  }

  return null;
};

const fetchServices = async (): Promise<void> => {
  if (!supplierId.value) {
    errorMessage.value = "ID de proveedor no disponible.";
    return;
  }

  const api = fetchSupplier(supplierId.value);
  await api.request();

  const response = api.response.value;
  const error = api.error.value;

  if (response?.data) {
    services.value = response.data.services;
  }

  if (error) {
    errorMessage.value = error.info;
    return;
  }
};

onMounted(async () => {
  isLoading.value = true;
  const id = await fetchSupplierId();
  if (id) {
    await fetchServices();
  }
  isLoading.value = false;
});
</script>

<template>
  <NuxtLayout name="medicos-dashboard">
    <div class="services__header">
      <MedicosCompartidosEncabezadoBreadcrumb title="Mis servicios" />
      <MedicosModalesAgregarServicio>
        <template #trigger="{ open }">
          <button class="services__button--primary" @click="open">
            <AtomsIconsPlusIcon size="20" />
            Añadir servicio
          </button>
        </template>
      </MedicosModalesAgregarServicio>
    </div>

    <div class="services-controls">
      <UiSearchBar placeholder="Buscar" aria-label="Buscar en servicios" />

      <div class="services-controls__sort-wrapper">
        <div class="sort-dropdown">
          <button
            class="sort-dropdown__button--outline"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Ordenar por
            <AtomsIconsChevronDown size="20" />
          </button>
          <ul class="sort-dropdown__menu">
            <li><a class="sort-dropdown__item" href="#">Action</a></li>
            <li><a class="sort-dropdown__item" href="#">Another action</a></li>
            <li>
              <a class="sort-dropdown__item" href="#">Something else here</a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <WebsitePerfilDoctorPantallaCarga v-if="isLoading" />

    <div v-else-if="errorMessage" class="services__error">
      <p>{{ errorMessage }}</p>
    </div>

    <MedicosServicios
      v-else-if="services.length > 0 && supplier"
      :service="services[0]"
      :supplier="supplier"
    />

    <div v-else class="services__empty">
      <p>No hay servicios disponibles.</p>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.services {
  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__error,
  &__empty {
    text-align: center;
    padding: 2rem;
    color: #6c757d;
  }

  &__error {
    color: #dc3545;
  }

  &__button {
    &--outline {
      @include outline-button;
    }
    &--primary {
      @include primary-button;
      padding: 0.5rem 0.875rem;
      gap: 0.5rem;
    }
  }
}

.services-controls {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  gap: 1rem;

  &__search-wrapper {
    width: 100%;
  }

  &__sort-wrapper {
    flex: 0 0 auto;
    margin-left: auto;
    display: flex;
  }
}

.search-input {
  &__wrapper {
    position: relative;
    display: flex;
    align-items: center;
    overflow: hidden;
  }

  &__icon {
    position: absolute;
    left: 1rem;
    color: #667085;
  }

  &__field {
    @include input-base;
    width: 100%;
    padding: 0.625rem 0.875rem 0.625rem 3rem;
    font-weight: 300;
    font-size: 1rem;
    line-height: 1.5rem;
    letter-spacing: 0;
  }
}

.sort-dropdown {
  width: 100%;
  position: relative;

  &__button {
    &--outline {
      @include outline-button;
    }
  }

  &__menu {
    position: absolute;
    top: 100%;
    left: 0;
    z-index: 1000;
    display: none;
    min-width: 10rem;
    padding: 0.5rem 0;
    margin: 0;
    background-color: #fff;
    border: 1px solid rgba(0, 0, 0, 0.15);
    border-radius: 0.375rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    list-style: none;

    &.show {
      display: block;
    }
  }

  &__item {
    display: block;
    width: 100%;
    padding: 0.25rem 1rem;
    clear: both;
    font-weight: 400;
    color: #353e5c;
    text-align: inherit;
    text-decoration: none;
    white-space: nowrap;
    background-color: transparent;
    border: 0;
    cursor: pointer;

    &:hover,
    &:focus {
      color: #1e2125;
      background-color: #e9ecef;
    }
  }
}
</style>
