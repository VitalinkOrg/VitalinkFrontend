<template>
  <slot name="trigger" :open="handleOpenModal"></slot>

  <AtomsModalBase
    :is-open="isModalOpen"
    :close-on-backdrop="false"
    @close="handleGoBack"
    size="extra-large"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
  >
    <template #title>
      <h1 class="onboarding-modal__title">Onboarding Bienvenida</h1>
    </template>

    <template #default>
      <main class="onboarding-modal__content">
        <aside class="onboarding-modal__wrapper">
          <img
            src="@/src/assets/background-pattern.svg"
            alt="Patrón de fondo decorativo"
            class="onboarding-modal__background-image"
          />
          <h2 class="onboarding-modal__form-title">
            FORMULARIO DE REGISTRO DE PROVEEDOR DE SERVICIOS MEDICOS
          </h2>
        </aside>

        <form class="onboarding-modal__form">
          <fieldset class="onboarding-modal__field">
            <legend class="onboarding-modal__label">Médico Relacionado</legend>
            <div class="dropdown" ref="supplierDropdown" @click.stop>
              <button
                type="button"
                class="dropdown__trigger"
                @click="toggleDropdown('medico')"
                :class="{
                  'dropdown__trigger--active': activeDropdown === 'medico',
                }"
                :aria-expanded="activeDropdown === 'medico'"
                aria-haspopup="listbox"
                role="combobox"
              >
                <span class="dropdown__selected">
                  {{ selectedSupplier?.name || "Selecciona un médico" }}
                </span>
                <Icon
                  name="mdi:chevron-down"
                  class="dropdown__icon"
                  :class="{
                    'dropdown__icon--rotated': activeDropdown === 'medico',
                  }"
                  aria-hidden="true"
                />
              </button>
              <ul
                class="dropdown__menu"
                :class="{
                  'dropdown__menu--open': activeDropdown === 'medico',
                }"
                role="listbox"
                aria-label="Lista de médicos"
              >
                <li
                  v-for="supplier in suppliers"
                  :key="supplier.id"
                  class="dropdown__item"
                  @click="selectSupplier(supplier)"
                  role="option"
                  :aria-selected="selectedSupplier?.id === supplier.id"
                >
                  {{ supplier.name }}
                </li>
              </ul>
            </div>
          </fieldset>

          <fieldset class="onboarding-modal__field">
            <legend class="onboarding-modal__label">
              Tipo de Procedimiento
            </legend>
            <div class="dropdown" ref="procedureDropdown" @click.stop>
              <button
                type="button"
                class="dropdown__trigger"
                @click="toggleDropdown('procedimiento')"
                :class="{
                  'dropdown__trigger--active':
                    activeDropdown === 'procedimiento',
                }"
                :aria-expanded="activeDropdown === 'procedimiento'"
                aria-haspopup="listbox"
                role="combobox"
              >
                <span class="dropdown__selected">
                  {{ selectedProcedure?.name || "Selecciona un procedimiento" }}
                </span>
                <Icon
                  name="mdi:chevron-down"
                  class="dropdown__icon"
                  :class="{
                    'dropdown__icon--rotated':
                      activeDropdown === 'procedimiento',
                  }"
                  aria-hidden="true"
                />
              </button>
              <ul
                class="dropdown__menu"
                :class="{
                  'dropdown__menu--open': activeDropdown === 'procedimiento',
                }"
                role="listbox"
                aria-label="Lista de procedimientos"
              >
                <li
                  v-for="procedure in procedures"
                  :key="procedure.id"
                  class="dropdown__item"
                  @click="selectProcedure(procedure)"
                  role="option"
                  :aria-selected="selectedProcedure?.id === procedure.id"
                >
                  {{ procedure.name }}
                </li>
              </ul>
            </div>
          </fieldset>

          <section class="onboarding-modal__section">
            <h3 class="onboarding-modal__section-title">Packs y Precios</h3>

            <fieldset class="onboarding-modal__field">
              <legend class="onboarding-modal__label">Producto</legend>
              <input
                type="text"
                class="onboarding-modal__input"
                placeholder="Ingresa el producto"
                v-model="productName"
              />
            </fieldset>
          </section>

          <fieldset
            v-if="preoperativeAssessment"
            class="onboarding-modal__field onboarding-modal__field--row"
          >
            <legend class="onboarding-modal__label">
              {{ preoperativeAssessment.name }}
            </legend>
            <input
              type="number"
              placeholder="0"
              class="onboarding-modal__input onboarding-modal__input--number"
              v-model="PostoperativeAssessments"
              min="0"
              :aria-describedby="`${preoperativeAssessment.code}-help`"
            />
          </fieldset>

          <section class="onboarding-modal__services">
            <div>
              <h3 class="onboarding-modal__services-title">
                Servicios incluidos
              </h3>

              <section aria-labelledby="servicios-title">
                <h4 id="servicios-title" class="sr-only">Servicios médicos</h4>
                <table class="services-table" role="table">
                  <caption class="sr-only">
                    Selección de servicios médicos incluidos
                  </caption>
                  <tbody>
                    <tr
                      v-for="service in fixedServices"
                      :key="service.code"
                      class="services-table__row"
                    >
                      <th scope="row" class="services-table__header">
                        {{ service.name }}
                      </th>
                      <td class="services-table__cell">
                        <fieldset
                          class="radio-group"
                          role="radiogroup"
                          :aria-labelledby="`${service.code}-label`"
                        >
                          <legend :id="`${service.code}-label`" class="sr-only">
                            {{ service.name }}
                          </legend>
                          <label class="radio-group__item">
                            <input
                              type="radio"
                              :name="service.code"
                              value="si"
                              class="radio-group__input"
                              v-model="fixedServicesModel[service.code]"
                            />
                            <span class="radio-group__label">Sí</span>
                          </label>
                          <label class="radio-group__item">
                            <input
                              type="radio"
                              :name="service.code"
                              value="no"
                              class="radio-group__input"
                              v-model="fixedServicesModel[service.code]"
                            />
                            <span class="radio-group__label">No</span>
                          </label>
                        </fieldset>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </section>
            </div>

            <section
              v-if="postopTreatmentAssessments.length > 0"
              class="treatment-table"
              aria-labelledby="tratamiento-title"
            >
              <h4 id="tratamiento-title" class="treatment-table__title">
                Tratamiento médico
              </h4>
              <table class="services-table" role="table">
                <caption class="sr-only">
                  Selección de opciones de tratamiento médico
                </caption>
                <tbody>
                  <tr
                    v-for="assessment in postopTreatmentAssessments"
                    :key="assessment.id"
                    class="services-table__row"
                  >
                    <th scope="row" class="services-table__header">
                      {{ assessment.name }}
                    </th>
                    <td class="services-table__cell">
                      <fieldset
                        class="radio-group"
                        role="radiogroup"
                        :aria-labelledby="`${assessment.code}-treatment-label`"
                      >
                        <legend
                          :id="`${assessment.code}-treatment-label`"
                          class="sr-only"
                        >
                          {{ assessment.name }}
                        </legend>
                        <label class="radio-group__item">
                          <input
                            type="radio"
                            :name="`${assessment.code}-treatment`"
                            value="si"
                            class="radio-group__input"
                            v-model="dynamicTreatment[assessment.code]"
                          />
                          <span class="radio-group__label">Sí</span>
                        </label>
                        <label class="radio-group__item">
                          <input
                            type="radio"
                            :name="`${assessment.code}-treatment`"
                            value="no"
                            class="radio-group__input"
                            v-model="dynamicTreatment[assessment.code]"
                          />
                          <span class="radio-group__label">No</span>
                        </label>
                      </fieldset>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            <fieldset class="onboarding-modal__field">
              <legend class="onboarding-modal__label">Observaciones</legend>
              <textarea
                class="onboarding-modal__textarea"
                placeholder="Escribe las observaciones aquí"
                v-model="observations"
                aria-describedby="observaciones-help"
              ></textarea>
            </fieldset>
          </section>
        </form>
      </main>
    </template>

    <template #footer>
      <button
        type="button"
        @click="handleGoBack"
        class="onboarding-modal__button onboarding-modal__button--outline"
        :disabled="isLoading"
      >
        Volver
      </button>
      <button
        type="button"
        @click="handleFinish"
        class="onboarding-modal__button onboarding-modal__button--primary"
        :disabled="isLoading"
      >
        {{ isLoading ? "Procesando..." : "Finalizar" }}
      </button>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { usePackage, useSupplier, useUdc } from "@/composables/api";
import type { AssessmentDetail, IUdc, Supplier } from "@/types";
import { onClickOutside } from "@vueuse/core";

interface Emits {
  (e: "openWelcomeModal"): void;
  (e: "openSuccessModal"): void;
  (e: "closeWelcomeModal"): void;
}

const emit = defineEmits<Emits>();

const { createPackage } = usePackage();
const { fetchUdc } = useUdc();
const { fetchAllSuppliers, fetchSpecialtyBySupplier } = useSupplier();

const isModalOpen = ref<boolean>(false);
const activeDropdown = ref<string | null>(null);
const isLoading = ref<boolean>(false);

const selectedSupplier = ref<Supplier | null>(null);
const selectedProcedure = ref<IUdc | null>(null);
const productName = ref<string>("");
const PostoperativeAssessments = ref<number>(0);
const observations = ref<string>("");

const supplierDropdown = ref<HTMLElement | null>(null);
const procedureDropdown = ref<HTMLElement | null>(null);

const suppliers = ref<Supplier[]>([]);
const procedures = ref<IUdc[]>([]);
const assessments = ref<AssessmentDetail[]>([]);

const fixedServices = [
  { code: "SALA_OPERACIONES", name: "Sala de Operaciones" },
  { code: "INSUMOS_MEDICOS", name: "Insumos Médicos" },
  { code: "ANESTESIA_CONTROL", name: "Anestesia y Control del dolor" },
  { code: "IMAGENES_DIAGNOSTICO", name: "Imágenes y diagnóstico" },
  { code: "MEDICAMENTOS_POSTOP", name: "Medicamentos post operatorios" },
];

const fixedServicesModel = reactive<Record<string, string>>({
  SALA_OPERACIONES: "si",
  INSUMOS_MEDICOS: "si",
  ANESTESIA_CONTROL: "si",
  IMAGENES_DIAGNOSTICO: "si",
  MEDICAMENTOS_POSTOP: "si",
});

const dynamicTreatment = reactive<Record<string, string>>({});

const preoperativeAssessment = computed(() => {
  return assessments.value.find(
    (assessment) => assessment.code === "PREOPERATIVE_ASSESSMENT",
  );
});

const postopTreatmentAssessments = computed(() => {
  return assessments.value.filter(
    (assessment) => assessment.code === "POSTOP_TREATMENT",
  );
});

const handleOpenModal = () => {
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
  closeAllDropdowns();
};

const handleGoBack = () => {
  handleCloseModal();
  emit("openWelcomeModal");
};

const handleFinish = async () => {
  if (!selectedSupplier.value) return;

  try {
    isLoading.value = true;
    const specialtyId = await handleFetchSpecialtyBySupplier(
      selectedSupplier.value.id,
    );

    const formData = {
      specialty_id: specialtyId,
      procedure_code: selectedProcedure.value?.code || "",
      product_code: productName.value || "",
      discount: 7,
      services_offer: {
        ASSESSMENT_DETAILS: [
          ...Object.entries(fixedServicesModel)
            .filter(([_, value]) => value === "si")
            .map(([code]) => code),
          ...Object.entries(dynamicTreatment)
            .filter(([_, value]) => value === "si")
            .map(([code]) => code),
        ],
      },
      is_king: 0,
      observations: observations.value,
      postoperative_assessments: PostoperativeAssessments.value,
    };

    const api = createPackage(formData);
    await api.request();

    const data = api.response.value?.data;

    if (data) {
      handleCloseModal();
      localStorage.removeItem("onboarding");
      emit("openSuccessModal");
    } else {
      console.error("Error creating package:");
    }
  } catch (error) {
    console.error("Error creating package:", error);
  } finally {
    isLoading.value = false;
  }
};

const toggleDropdown = (dropdownName: string) => {
  if (activeDropdown.value === dropdownName) {
    activeDropdown.value = null;
  } else {
    activeDropdown.value = dropdownName;
  }
};

const closeAllDropdowns = () => {
  activeDropdown.value = null;
};

const selectSupplier = (medico: Supplier) => {
  selectedSupplier.value = medico;
  closeAllDropdowns();
};

const selectProcedure = (procedure: IUdc) => {
  selectedProcedure.value = procedure;
  closeAllDropdowns();
};

const handleFetchSpecialtyBySupplier = async (
  supplierId: number,
): Promise<number> => {
  try {
    const api = fetchSpecialtyBySupplier(supplierId);
    await api.request();

    const data = api.response.value?.data;

    if (data) {
      return data[0].id;
    }

    return 0;
  } catch (error) {
    console.error(error);
    throw new Error("Error al obtener la especialidad del médico");
  }
};

const loadAssessment = async () => {
  try {
    const api = fetchUdc("ASSESSMENT");
    await api.request();

    if (api.response.value?.data) {
      assessments.value = api.response.value.data;
      initializeDynamicStates();
    }
  } catch (error) {
    console.error("Error loading assessments:", error);
  }
};

const loadSuppliers = async () => {
  try {
    const api = fetchAllSuppliers();
    await api.request();

    suppliers.value = api.response.value?.data || [];
  } catch (error) {
    console.error("Error loading suppliers:", error);
  }
};

const loadProcedures = async () => {
  try {
    const api = fetchUdc("MEDICAL_PROCEDURE");
    await api.request();

    procedures.value = api.response.value?.data || [];
  } catch (error) {
    console.error("Error loading procedures:", error);
  }
};

const initializeDynamicStates = () => {
  postopTreatmentAssessments.value.forEach((assessment) => {
    if (!dynamicTreatment[assessment.code]) {
      dynamicTreatment[assessment.code] = "";
    }
  });
};

onClickOutside(supplierDropdown, () => {
  if (activeDropdown.value === "medico") activeDropdown.value = null;
});

onClickOutside(procedureDropdown, () => {
  if (activeDropdown.value === "procedimiento") activeDropdown.value = null;
});

onMounted(async () => {
  await loadSuppliers();
  await loadAssessment();
  await loadProcedures();
});

defineExpose({
  handleOpenModal,
  handleCloseModal,
  isOpen: readonly(isModalOpen),
});
</script>

<style lang="scss" scoped>
.sr-only {
  @include visually-hidden;
}

.onboarding-modal {
  &__title {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 600;
    color: #2d3748;
  }

  &__content {
    display: flex;
    min-height: fit-content;
  }

  &__wrapper {
    position: relative;
    max-width: 15.9375rem;
    min-height: fit-content;
    background: #ebecf7;
    border-radius: 0.9375rem;
    margin: 0.625rem;
    padding: 1.25rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    overflow: hidden;
  }

  &__background-image {
    z-index: 0;
    position: absolute;
    height: 100%;
    margin-bottom: 1rem;
  }

  &__form-title {
    @include text-base;
    z-index: 10;
    font-weight: 800;
    font-size: 1.25rem;
    line-height: 1.6875rem;
    letter-spacing: 0;
    margin-top: 6rem;
    color: $color-primary;
  }

  &__form {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 1.25rem;
    margin: 0.625rem;
    border-radius: 0.9375rem;
    background-color: #f8faff;
    padding: 1.25rem;
    min-height: fit-content;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border: none;
    padding: 0;

    &--row {
      flex-direction: row;
      align-items: center;
    }
  }

  &__section {
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
  }

  &__section-title {
    font-size: 1rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
  }

  &__label {
    @include form-label;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.25rem;
    letter-spacing: 0;
    width: min-content;
    text-wrap: nowrap;
    color: #344054;

    &--disabled {
      color: #b4b9c9;
    }
  }

  &__input {
    @include input-base;

    &--number {
      text-align: center;
      max-width: 2.5rem;
      padding: 0.625rem 0.875rem;

      appearance: textfield;
      -moz-appearance: textfield;

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    }
  }

  &__textarea {
    @extend .onboarding-modal__input;
    min-height: 8rem;
    resize: vertical;
  }

  &__services {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  &__services-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
    padding: 0 0 0.25rem 0;
  }

  &__button {
    width: 100%;

    &--primary {
      @include primary-button;
    }

    &--outline {
      @include outline-button;
    }
  }
}

.dropdown {
  position: relative;

  &__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    width: 100%;
    text-align: left;

    padding: 0.9375rem 1.0625rem;
    font-family: $font-family-main;
    font-size: 0.91875rem;
    background: $white;
    border: 1px solid #d4dae0;
    box-shadow:
      0 0 0.065625rem rgba(50, 50, 71, 0.2),
      0 0.065625rem 0.13125rem rgba(50, 50, 71, 0.08);
    transition: all 0.3s ease;
    border-radius: $border-radius-md;
    span {
      color: #425466;
    }

    &--disabled {
      background-color: #f9f9f9;
      cursor: not-allowed;
      border-color: #e0e0e0;
      span {
        color: #b4b9c9;
      }
    }

    &:hover:not(.dropdown__trigger--disabled) {
      border: 1px solid $primary-aqua;
    }

    &--active {
      border-color: $primary-aqua;
    }
  }

  &__selected {
    color: #2d3748;
    flex: 1;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:empty::after {
      content: attr(data-placeholder);
      color: #a0aec0;
    }
  }

  &__icon {
    width: 1.25rem;
    height: 1.25rem;
    color: #a0aec0;
    transition: transform 0.2s;

    &--disabled {
      color: #cbd5e0;
    }

    &--rotated {
      transform: rotate(180deg);
    }
  }

  &__menu {
    position: absolute;
    top: calc(100% + 0.25rem);
    left: 0;
    right: 0;
    max-height: 12.5rem;
    overflow-y: auto;
    background-color: $white;
    border: 1px solid #e2e8f0;
    border-radius: 0.375rem;
    box-shadow:
      0 0.625rem 0.9375rem -0.1875rem rgba(0, 0, 0, 0.1),
      0 0.25rem 0.375rem -0.125rem rgba(0, 0, 0, 0.05);
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-0.5rem);
    transition:
      opacity 0.2s,
      visibility 0.2s,
      transform 0.2s;
    list-style: none;
    margin: 0;
    padding: 0;

    &--open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
  }

  &__item {
    padding: 0.75rem;
    cursor: pointer;
    font-size: 0.875rem;
    color: #2d3748;
    transition: background-color 0.2s;

    &:hover {
      background-color: #f7fafc;
    }

    &:first-child {
      border-top-left-radius: 0.375rem;
      border-top-right-radius: 0.375rem;
    }

    &:last-child {
      border-bottom-left-radius: 0.375rem;
      border-bottom-right-radius: 0.375rem;
    }

    &[aria-selected="true"] {
      background-color: #edf2f7;
      font-weight: 600;
    }
  }
}

.services-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e2e8f0;
  border-radius: 0.375rem;
  overflow: hidden;

  &__row {
    &:nth-child(even) {
      background-color: #f7fafc;
    }
  }

  &__header {
    @include label-base;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.25rem;
    letter-spacing: 0;
    width: 60%;
    color: #344054;
  }

  &__cell {
    padding: 0.5rem;
    border-right: 1px solid #e2e8f0;
    width: 40%;
  }
}

.treatment-table {
  &__title {
    font-size: 1rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 1rem 0;
  }
}

.radio-group {
  display: flex;
  gap: 1rem;
  border: none;
  padding: 0;

  &__item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  &__input {
    margin: 0;
    accent-color: #3182ce;
  }

  &__label {
    font-size: 0.875rem;
    color: #2d3748;
    font-weight: normal;
  }
}
</style>
