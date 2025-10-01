<template>
  <div v-if="packages && packages.length > 0" class="services__accordion">
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

    <div
      v-for="procedure in service.procedures"
      :key="procedure.procedure.id"
      class="services__item"
    >
      <div class="services__header">
        <div class="services__main-info">
          <input
            :id="`service-${procedure.procedure.id}`"
            type="checkbox"
            class="services__checkbox"
            :checked="selectedServices.includes(procedure.procedure.id)"
            @change="toggleService(procedure.procedure.id)"
          />
          <div class="services__info">
            <span class="services__title">{{ procedure.procedure.name }}</span>
            <small class="services__specialty">{{
              service.medical_specialty.name || "Especialidad médica"
            }}</small>
          </div>
        </div>
        <div class="services__actions">
          <MedicosModalesAgregarServicio :procedure="procedure.procedure">
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
          <MedicosModalesConfirmarEliminacion>
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
          </MedicosModalesConfirmarEliminacion>

          <button
            class="services__toggle"
            :class="{
              'services__toggle--active': expandedServices.includes(
                procedure.procedure.id
              ),
            }"
            @click="toggleExpanded(procedure.procedure.id)"
          >
            Ver detalles
            <AtomsIconsChevronDown size="20" />
          </button>
        </div>
      </div>

      <div
        v-if="expandedServices.includes(procedure.procedure.id)"
        class="services__content"
      >
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
                :value="procedure.procedure.name || 'No especificado'"
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
                  procedure.procedure.description ||
                  'Sin descripción disponible'
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
                    Autop. Próspero Fernández, San José, San Rafael, Costa Rica
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
          <p class="services__packs-title">Tus Packs:</p>
          <div class="services__packs-grid">
            <div
              v-for="pkg in procedure.packages"
              :key="pkg.id"
              class="services__pack"
            >
              <div class="services__pack-header">
                <h2 class="services__pack-header--title">
                  {{ pkg.product.name }}
                </h2>
              </div>
              <div class="services__pack-body">
                <h5 class="services__pack-price">
                  {{
                    formatCurrency(pkg.discounted_price, {
                      decimalPlaces: 0,
                    })
                  }}
                </h5>
                <p class="services__pack-original">
                  Precio original
                  <span class="services__original-price">
                    {{
                      formatCurrency(pkg.reference_price, {
                        decimalPlaces: 0,
                      })
                    }}
                  </span>
                </p>
                <p class="services__pack-rating">
                  <span class="services__pack-icon--star">
                    <AtomsIconsStarFilled size="20" />
                  </span>
                  5.0 <span class="services__pack-reviews">(13 Reseñas)</span>
                </p>
                <ul class="services__pack-features">
                  <li
                    v-for="assessment in pkg.services_offer.ASSESSMENT_DETAILS"
                    class="services__pack-feature"
                  >
                    <span class="services__pack-feature-icon">
                      <AtomsIconsCheckIcon size="14" />
                    </span>
                    {{ getAssessmentLabel(assessment) }}
                  </li>
                </ul>
                <p class="services__pack-availability-title">
                  Próxima Disponibilidad:
                </p>
                <p class="services__pack-availability">
                  <span class="services__pack-date">
                    <span class="services__pack-icon">
                      <AtomsIconsCalendarDaysIcon />
                    </span>
                    19/10/2024
                  </span>
                  <span class="services__pack-time">
                    <span class="services__pack-icon">
                      <AtomsIconsClockIcon />
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
</template>

<script lang="ts" setup>
import { usePackage, useUdc } from "~/composables/api";
import type { AssessmentDetail, Package, Service, Supplier } from "~/types";

interface Props {
  service: Service;
  supplier: Supplier;
}

const props = defineProps<Props>();

const { formatCurrency } = useFormat();

const { fetchUdc } = useUdc();
const { fetchPackages } = usePackage();

const activeTab = ref<"info" | "packs">("info");
const expandedServices = ref<number[]>([]);
const selectedServices = ref<number[]>([]);
const packages = ref<Package[]>([]);
const assessments = ref<AssessmentDetail[]>([]);

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

const getAssessmentLabel = (assessmentCode: string) => {
  console.log(assessments.value);
  console.log(assessmentCode);
  if (!assessmentCode || !Array.isArray(assessments.value)) {
    return assessmentCode || "Código desconocido";
  }

  const detail = assessments.value.find(
    (item) => item?.code === assessmentCode
  );
  return detail?.name || assessmentCode;
};

const loadAssessment = async () => {
  try {
    const api = fetchUdc("ASSESSMENT_DETAIL");
    await api.request();

    assessments.value = api.response.value?.data || [];
  } catch (error) {
    console.error("Error loading packages:", error);
  }
};

const loadPackages = async () => {
  try {
    const api = fetchPackages();
    await api.request();

    packages.value = api.response.value?.data || [];
  } catch (error) {
    console.error("Error loading packages:", error);
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

await loadPackages();
await loadAssessment();
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
    padding: 20px;
    background: #e7f3ff;
  }

  &__tabs {
    display: flex;
    gap: 20px;
  }

  &__tab {
    padding: 10px 0px;
    border: none;
    background: none;
    color: #6d758f;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.15s ease-in-out;
    font-weight: 600;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: 0;

    &:hover {
      color: $primary-aqua;
    }

    &--active {
      color: $primary-aqua;
      border-bottom-color: $primary-aqua;
    }
  }

  &__info-section {
    padding: 20px;
  }

  &__packs-section {
    padding: 20px 0px;
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
    @include form-label;
    color: #353e5c;
  }

  &__input,
  &__textarea {
    @include input-base;
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
    @include text-base;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0;
    color: #353e5c;
  }

  &__hospital-subtitle {
    @include text-base;
    font-weight: 300;
    font-size: 14px;
    line-height: 140%;
    letter-spacing: -2%;
    color: #6d758f;
  }

  &__hospital-card {
    border: 1px solid #dee2e6;
    border-radius: 15px;
    background: $white;
    overflow: hidden;
  }

  &__hospital-details {
    padding: 1rem;
  }

  &__hospital-name {
    @include text-base;
    font-weight: 600;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: 0%;
    color: #19213d;
  }

  &__hospital-address {
    @include text-base;
    margin: 0 0 0.25rem 0;
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: 0;
    color: #6d758f;
  }

  &__hospital-location {
    @include text-base;
    color: #6d758f;
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: 0;
  }

  &__packs-title {
    @include text-base;
    margin: 0 0 1rem 0;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0;
    color: #353e5c;
  }

  &__packs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, 310px);
    gap: 1rem;
  }

  &__pack {
    max-width: 310px;
    border: 1px solid #f1f3f7;
    border-radius: 20px;
    background: $white;
    box-shadow: 0px 2px 8px 0px #00000014;
    border: 1px solid #f1f3f7;
    overflow: hidden;
  }

  &__pack-header {
    padding: 20px 15px;
    font-weight: 700;
    background: linear-gradient(
      187.59deg,
      #f8faff 65.03%,
      rgba(248, 250, 255, 0.1) 112.13%
    );

    &--title {
      @include text-base;
      font-weight: 600;
      font-size: 16px;
      line-height: 22px;
      letter-spacing: 0;
      text-transform: uppercase;
      color: $color-foreground;
    }

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
    @include text-base;
    font-weight: 600;
    font-size: 18px;
    line-height: 20px;
    letter-spacing: 0;
  }
  &__original-price,
  &__pack-original {
    @include text-base;
    display: flex;
    gap: 8px;
    font-weight: 500;
    font-size: 12px;
    line-height: 16px;
    letter-spacing: 0;
    color: #6d758f;
  }

  &__original-price {
    text-decoration: line-through;
  }

  &__pack-rating {
    @include text-base;
    display: flex;
    align-items: center;
    gap: 3px;
    font-weight: 400;
    font-size: 14px;
    line-height: 25.21px;
    letter-spacing: 0;
    color: #fdb022;

    &--icon {
      width: 20px;
      height: 20px;
    }
  }

  &__pack-reviews {
    @include text-base;
    font-weight: 300;
    font-size: 14px;
    line-height: 25.21px;
    letter-spacing: 0;
    color: #6d758f;
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
    width: 14px;
    height: 14px;
    border-radius: 7px;
    align-items: center;
    flex-shrink: 0;
    background: #e7f7f8;
    svg {
      padding: 2px;
      color: $primary-aqua;
    }
  }

  &__pack-icon {
    svg {
      color: $color-primary;
    }
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
    @include text-base;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-weight: 500;
    font-style: Medium;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: 0;
    color: #353e5c;
  }
}
</style>
