<script lang="ts" setup>
import { jwtDecode } from "jwt-decode";
import { onMounted, ref } from "vue";
import { useErrorHandler } from "~/composables/api/useErrorHandler";
import type { Service, Supplier } from "~/types";

definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});

interface DecodedToken {
  id: string;
}

const config = useRuntimeConfig();
const token = useCookie("token");

const decodedToken = jwtDecode<DecodedToken>(token.value!);
const userId = decodedToken.id;

const isLoading = ref<boolean>(false);
const errorMessage = ref<string | null>(null);
const services = ref<Service[]>([]);
const supplier = ref<Supplier | null>(null);
const supplierId = ref<number | null>(null);

const { withErrorHandling } = useErrorHandler();

const fetchSupplierId = async (): Promise<number | null> => {
  const fetchOperation = $fetch<{ data: Supplier[] }>(
    `${config.public.API_BASE_URL}/supplier/get_all`,
    {
      headers: {
        Authorization: token.value!,
      },
      params: {
        legal_representative_id: userId,
      },
    }
  );

  const { data, error } = await withErrorHandling(fetchOperation, isLoading, {
    customMessage:
      "Error al cargar el proveedor. Por favor intenta nuevamente.",
    logError: true,
  });

  if (error || !data?.data || data.data.length === 0) {
    errorMessage.value = "No se encontró un proveedor asociado a este usuario.";
    return null;
  }

  supplier.value = data.data[0];
  supplierId.value = supplier.value.id;
  return supplier.value.id;
};

const fetchServices = async (): Promise<void> => {
  if (!supplierId.value) {
    errorMessage.value = "ID de proveedor no disponible.";
    return;
  }

  const fetchOperation = $fetch<{ data: Supplier }>(
    `${config.public.API_BASE_URL}/supplier/get`,
    {
      headers: {
        Authorization: token.value!,
      },
      params: {
        id: supplierId.value,
      },
    }
  );

  const { data, error } = await withErrorHandling(fetchOperation, isLoading, {
    customMessage:
      "Error al cargar los servicios. Por favor intenta nuevamente.",
    logError: true,
  });

  if (error) {
    errorMessage.value = error;
    return;
  }

  const supplier = data?.data;
  services.value = supplier?.services || [];
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
      <div class="services-controls__search-wrapper">
        <div class="search-input__wrapper">
          <span class="search-input__icon">
            <AtomsIconsSearchIcon size="20" />
          </span>
          <input
            type="text"
            class="search-input__field"
            placeholder="Buscar"
            aria-label="Buscar"
          />
        </div>
      </div>

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
      padding: 8px 14px;
      gap: 8px;
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
    left: 16px;
    color: #667085;
  }

  &__field {
    @include input-base;
    width: 100%;
    padding: 10px 14px 10px 48px;
    font-weight: 300;
    font-size: 16px;
    line-height: 24px;
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
