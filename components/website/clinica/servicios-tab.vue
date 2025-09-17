<template>
  <div class="services">
    <div v-if="pending" class="services__loading">
      <p>Cargando servicios...</p>
    </div>

    <div v-else-if="error" class="services__error">
      <p>{{ error }}</p>
    </div>

    <div
      v-else-if="packages && packages.length > 0"
      class="services__accordion"
    >
      <div class="services__header-controls">
        <div class="services__select-all">
          <input
            id="select-all"
            type="checkbox"
            class="services__checkbox"
            :checked="isAllSelected"
            :indeterminate="isIndeterminate"
            @change="toggleSelectAll"
          />
          <label for="select-all" class="services__checkbox-label">
            Seleccionar todos
          </label>
        </div>
        <h3 class="services__header-title">Nombre Servicio</h3>
      </div>

      <div v-for="pkg in packages" :key="pkg.id" class="services__item">
        <div class="services__header">
          <div class="services__main-info">
            <input
              :id="`service-${pkg.id}`"
              type="checkbox"
              class="services__checkbox"
              :checked="selectedServices.includes(pkg.id)"
              @change="toggleService(pkg.id)"
            />
            <div class="services__info">
              <span class="services__title">{{
                pkg.procedure?.name || "Servicio"
              }}</span>
              <small class="services__specialty">{{
                pkg.product?.description || "Especialidad médica"
              }}</small>
            </div>
          </div>
          <div class="services__actions">
            <MedicosModalesAgregarServicio :package="pkg">
              <template #trigger="{ open }">
                <button
                  class="services__action services__action--edit"
                  @click="open"
                >
                  <span class="services__action-icon">
                    <AtomsIconsEditPencilIcon />
                  </span>
                  Editar
                </button>
              </template>
            </MedicosModalesAgregarServicio>
            <medicos-modales-confirmar-eliminacion>
              <template #trigger="{ open }">
                <button
                  class="services__action services__action--remove"
                  @click="open"
                >
                  <span class="services__action-icon">
                    <AtomsIconsTrashIcon />
                  </span>
                  Eliminar
                </button>
              </template>
            </medicos-modales-confirmar-eliminacion>

            <button
              class="services__toggle"
              :class="{
                'services__toggle--active': expandedServices.includes(pkg.id),
              }"
              @click="toggleExpanded(pkg.id)"
            >
              Ver detalles
              <AtomsIconsChevronDown size="20" />
            </button>
          </div>
        </div>

        <div v-if="expandedServices.includes(pkg.id)" class="services__content">
          <nav class="services__tabs">
            <button
              class="services__tab"
              :class="{ 'services__tab--active': activeTab === 'info' }"
              @click="activeTab = 'info'"
            >
              Información general
            </button>
            <button
              class="services__tab"
              :class="{ 'services__tab--active': activeTab === 'packs' }"
              @click="activeTab = 'packs'"
            >
              Precios y packs
            </button>
          </nav>

          <section v-if="activeTab === 'info'" class="services__info-section">
            <div class="services__form">
              <div class="services__field">
                <label class="services__label">Especialidades Médicas:</label>
                <input
                  type="text"
                  :value="pkg.product?.name || 'No especificado'"
                  disabled
                  class="services__input"
                />
              </div>

              <div class="services__field">
                <label class="services__label">Descripción</label>
                <textarea
                  rows="5"
                  disabled
                  class="services__textarea"
                  :value="
                    pkg.product?.description || 'Sin descripción disponible'
                  "
                />
              </div>

              <div class="services__hospital-info">
                <div class="services__hospital-header">
                  <p class="services__hospital-title">Hospital de atención</p>
                  <p class="services__hospital-subtitle">
                    Indica el/los lugares donde tendrá disponibilidad este
                    servicio
                  </p>
                </div>

                <div class="services__hospital-card">
                  <div class="services__hospital-details">
                    <h5 class="services__hospital-name">Hospital CIMA</h5>
                    <p class="services__hospital-address">
                      Autop. Próspero Fernández, San José, San Rafael, Costa
                      Rica
                    </p>
                    <small class="services__hospital-location"
                      >Piso 1 - Pasillo 3</small
                    >
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section v-if="activeTab === 'packs'" class="services__packs-section">
            <p class="services__packs-title">Packs:</p>
            <div class="services__packs-grid">
              <div class="services__pack">
                <div class="services__pack-header">OPCIÓN 1</div>
                <div class="services__pack-body">
                  <h5 class="services__pack-price">
                    ${{ pkg.discounted_price?.toLocaleString() || "0" }} USD
                  </h5>
                  <p class="services__pack-original">
                    Precio original ${{
                      pkg.reference_price?.toLocaleString() || "0"
                    }}
                    USD
                  </p>
                  <p class="services__pack-rating">
                    <span class="services__pack-icon">
                      <img src="@/assets/star.svg" alt="Rating" />
                    </span>
                    5.0 <span class="services__pack-reviews">(13 Reseñas)</span>
                  </p>
                  <ul class="services__pack-features">
                    <li
                      v-for="service in pkg.services_offer
                        ?.ASSESSMENT_DETAILS || []"
                      :key="service"
                      class="services__pack-feature"
                    >
                      <span class="services__pack-feature-icon">
                        <img src="@/assets/check.svg" alt="Incluido" />
                      </span>
                      {{ service }}
                    </li>
                  </ul>
                  <p class="services__pack-availability-title">
                    Próxima Disponibilidad:
                  </p>
                  <p class="services__pack-availability">
                    <span class="services__pack-date">
                      <span class="services__pack-icon">
                        <img src="@/assets/calendar.svg" alt="Fecha" />
                      </span>
                      19/10/2024
                    </span>
                    <span class="services__pack-time">
                      <span class="services__pack-icon">
                        <img src="@/assets/clock.svg" alt="Hora" />
                      </span>
                      11:00 am
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <div v-else class="services__empty">
      <p>No hay servicios disponibles.</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { AtomsIconsChevronDown, AtomsIconsTrashIcon } from "#components";
import type { Package } from "~/types";

const config = useRuntimeConfig();
const token = useCookie("token");
const { withErrorHandling } = useErrorHandler();

const activeTab = ref<"info" | "packs">("info");
const expandedServices = ref<number[]>([]);
const selectedServices = ref<number[]>([]);
const packages = ref<Package[]>([]);
const pending = ref(true);
const error = ref<string | null>(null);

const isAllSelected = computed(() => {
  return (
    packages.value.length > 0 &&
    selectedServices.value.length === packages.value.length
  );
});

const isIndeterminate = computed(() => {
  return (
    selectedServices.value.length > 0 &&
    selectedServices.value.length < packages.value.length
  );
});

const toggleExpanded = (serviceId: number) => {
  const index = expandedServices.value.indexOf(serviceId);
  if (index > -1) {
    expandedServices.value.splice(index, 1);
  } else {
    expandedServices.value.push(serviceId);
  }
};

const toggleService = (serviceId: number) => {
  const index = selectedServices.value.indexOf(serviceId);
  if (index > -1) {
    selectedServices.value.splice(index, 1);
  } else {
    selectedServices.value.push(serviceId);
  }
};

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedServices.value = [];
  } else {
    selectedServices.value = packages.value.map((pkg) => pkg.id);
  }
};

const fetchPackages = async () => {
  if (!token.value) {
    error.value = "Token de autorización no encontrado";
    pending.value = false;
    return;
  }

  const { data, error: fetchError } = await withErrorHandling(
    $fetch<any>(`${config.public.API_BASE_URL}/package/get_all`, {
      headers: {
        Authorization: token.value as string,
      },
    }),
    pending
  );

  if (fetchError) {
    error.value = fetchError;
  } else if (data) {
    packages.value = data?.data || data || [];
  }
};

watch(
  isIndeterminate,
  (newValue) => {
    nextTick(() => {
      const selectAllCheckbox = document.getElementById(
        "select-all"
      ) as HTMLInputElement;
      if (selectAllCheckbox) {
        selectAllCheckbox.indeterminate = newValue;
      }
    });
  },
  { immediate: true }
);

await fetchPackages();
</script>

<style lang="scss" scoped>
.services {
  &__loading,
  &__error,
  &__empty {
    padding: 2rem;
    text-align: center;
    color: #6c757d;
  }

  &__error {
    color: #dc3545;
  }

  &__accordion {
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    overflow: hidden;
  }

  &__header-controls {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 24px;
    background: #f9fafb;
    border-bottom: 1px solid #eaecf0;
  }

  &__header-title {
    @include text-base;
    font-weight: 500;
    font-size: 12px;
    line-height: 18px;
    color: #667085;
  }

  &__select-all {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__checkbox {
    width: 1rem;
    height: 1rem;
    accent-color: $color-primary;
    border: 1px solid #d0d5dd;
    border-radius: 6px;
    cursor: pointer;
  }

  &__checkbox-label {
    @include visually-hidden;
  }

  &__item {
    border-bottom: 1px solid #dee2e6;

    &:last-child {
      border-bottom: none;
    }
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #fff;
  }

  &__main-info {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__info {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  &__title {
    @include text-base;
    font-weight: 500;
    line-height: 20px;
    color: #101828;
  }

  &__specialty {
    @include text-base;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: #667085;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__action {
    display: flex;
    align-items: center;
    font-weight: 600;
    gap: 0.25rem;
    padding: 0.375rem 0.75rem;
    border: none;
    background: none;
    color: #667085;
    font-size: 14px;
    cursor: pointer;
    transition: color 0.15s ease-in-out;

    &:hover {
      color: #495057;
    }

    &--edit:hover {
      color: #0d6efd;
    }

    &--remove:hover {
      color: #dc3545;
    }

    &-icon {
      display: flex;
      align-items: center;
    }
  }

  &__toggle {
    @include outline-button;
    border-radius: 8px;
    gap: 8px;
    border-width: 1px;
    padding: 10px 16px;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    color: #344054;

    &--active {
      color: $primary-aqua;
      border: none;

      svg {
        transform: rotate(180deg);
      }
    }
  }

  &__content {
    background: #e7f3ff;
  }

  &__tabs {
    display: flex;
    border-bottom: 1px solid #dee2e6;
  }

  &__tab {
    padding: 0.75rem 1rem;
    border: none;
    background: none;
    color: #6c757d;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.15s ease-in-out;

    &:hover {
      color: #0d6efd;
    }

    &--active {
      color: #0d6efd;
      border-bottom-color: #0d6efd;
    }
  }

  &__info-section,
  &__packs-section {
    padding: 1rem;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__label {
    font-weight: 500;
    color: #212529;
  }

  &__input,
  &__textarea {
    padding: 0.5rem 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 0.375rem;
    background: #fff;
    color: #212529;

    &:disabled {
      background: #f8f9fa;
      opacity: 1;
    }
  }

  &__textarea {
    resize: vertical;
    min-height: 100px;
  }

  &__hospital-info {
    margin-top: 1rem;
  }

  &__hospital-header {
    margin-bottom: 1rem;
  }

  &__hospital-title {
    margin: 0 0 0.25rem 0;
    font-weight: 500;
  }

  &__hospital-subtitle {
    margin: 0;
    color: #6c757d;
    font-size: 0.875rem;
  }

  &__hospital-card {
    border: 1px solid #dee2e6;
    border-radius: 0.5rem;
    background: #fff;
    overflow: hidden;
  }

  &__hospital-details {
    padding: 1rem;
  }

  &__hospital-name {
    margin: 0 0 0.5rem 0;
    font-size: 1.125rem;
    font-weight: 600;
  }

  &__hospital-address {
    margin: 0 0 0.25rem 0;
    color: #6c757d;
  }

  &__hospital-location {
    color: #6c757d;
    font-size: 0.875rem;
  }

  &__packs-title {
    margin: 0 0 1rem 0;
    font-weight: 600;
  }

  &__packs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
  }

  &__pack {
    border: 1px solid #f1f3f7;
    border-radius: 0.5rem;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  &__pack-header {
    padding: 1rem;
    font-weight: 700;
    text-align: center;
    background: linear-gradient(
      188deg,
      #f8faff 65.03%,
      rgba(248, 250, 255, 0.1) 112.13%
    );

    &--selected {
      background: linear-gradient(
        180deg,
        #fffcf5 70.16%,
        rgba(255, 252, 245, 0.05) 100%
      );
    }
  }

  &__pack-body {
    padding: 1.25rem;
  }

  &__pack-price {
    font-size: 1.5rem;
    margin: 0 0 0.5rem 0;
    color: #212529;
  }

  &__pack-original {
    margin: 0 0 0.5rem 0;
    color: #6c757d;
  }

  &__pack-rating {
    margin: 0 0 1rem 0;
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  &__pack-reviews {
    color: #6c757d;
  }

  &__pack-features {
    list-style: none;
    padding: 0;
    margin: 0 0 1rem 0;
  }

  &__pack-feature {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0;
    border-bottom: 1px solid #f8f9fa;

    &:last-child {
      border-bottom: none;
    }
  }

  &__pack-feature-icon,
  &__pack-icon {
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }

  &__pack-availability-title {
    margin: 1rem 0 0.5rem 0;
    color: #6c757d;
    font-size: 0.875rem;
  }

  &__pack-availability {
    display: flex;
    gap: 1rem;
    margin: 0;
  }

  &__pack-date,
  &__pack-time {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
}
</style>
