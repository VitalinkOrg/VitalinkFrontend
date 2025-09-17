<script lang="ts" setup>
import { ref } from "vue";
import type { Service } from "~/types";

const isLoading = ref<boolean>(false);
const errorMessage = ref<string | null>(null);

definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});

const config = useRuntimeConfig();
const { withErrorHandling } = useErrorHandler();

const fetchServices = async (): Promise<Service[]> => {
  const fetchOperation = $fetch<{ data: Service[] }>(
    config.public.API_BASE_URL + "/services"
  );

  const { data, error } = await withErrorHandling(fetchOperation, isLoading, {
    customMessage:
      "Error al cargar los servicios. Por favor intenta nuevamente.",
    logError: true,
  });

  if (error) {
    errorMessage.value = error;
    return [];
  }

  return data?.data || [];
};

const services = ref<Service[]>([]);

onMounted(async () => {
  services.value = await fetchServices();
});

const filteredArray: Service[] = [];
</script>

<template>
  <NuxtLayout name="medicos-dashboard">
    <nav class="breadcrumb-nav" aria-label="breadcrumb">
      <ol class="breadcrumb-nav__list">
        <li class="breadcrumb-nav__item">
          <NuxtLink href="/medicos/inicio" class="breadcrumb-nav__link">
            Inicio
          </NuxtLink>
        </li>
        <li
          class="breadcrumb-nav__item breadcrumb-nav__item--active"
          aria-current="page"
        >
          Servicios
        </li>
      </ol>
    </nav>

    <div class="services-header">
      <p class="services-header__title">
        <span class="services-header__text">Mis servicios</span>
      </p>

      <MedicosModalesAgregarServicio>
        <template #trigger="{ open }">
          <button class="services-header__button--primary" @click="open">
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

    <WebsiteClinicaServiciosTab :services="filteredArray" />
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.breadcrumb-nav {
  --breadcrumb-divider: "/";

  &__list {
    display: flex;
    flex-wrap: wrap;
    padding: 0;
    margin: 0;
    list-style: none;
  }

  &__item {
    font-family: $font-family-main;
    font-size: 14px;
    line-height: 20px;
    &:not(:last-child)::after {
      content: var(--breadcrumb-divider);
      margin: 0 6px 0 3px;
      color: #353e5c;
    }

    &--active {
      font-weight: 600;
      color: #353e5c;
    }
  }

  &__link {
    color: #6c757d;
    text-decoration: none;

    &:hover {
      color: #495057;
      text-decoration: underline;
    }
  }
}

.services-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;

  &__title {
    margin: 0;
  }

  &__text {
    @include text-base;
    font-weight: 600;
    font-size: 20px;
    line-height: 20px;
    letter-spacing: 0;
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

  &__toggle {
    width: 100%;
    padding: 0.375rem 0.75rem;
    background-color: transparent;
    border: 1px solid #6c757d;
    border-radius: 0.375rem;
    color: #212529;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &::after {
      content: "";
      display: inline-block;
      margin-left: 0.255em;
      vertical-align: 0.255em;
      border-top: 0.3em solid;
      border-right: 0.3em solid transparent;
      border-bottom: 0;
      border-left: 0.3em solid transparent;
    }

    &:hover {
      background-color: #f8f9fa;
      border-color: #5c636a;
    }

    &:focus {
      outline: 0;
      box-shadow: 0 0 0 0.25rem rgba(108, 117, 125, 0.25);
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

  &__button {
    &--outline {
      @include outline-button;
    }
  }
}
</style>
