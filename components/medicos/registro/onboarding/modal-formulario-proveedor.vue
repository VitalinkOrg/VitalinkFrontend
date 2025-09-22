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
                  {{ selectedMedico || "Selecciona un médico" }}
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
                  :aria-selected="selectedMedico === supplier.name"
                >
                  {{ supplier.name }}
                </li>
              </ul>
            </div>
          </fieldset>

          <div class="onboarding-modal__field-group">
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
                    {{ selectedProcedimiento || "Selecciona un procedimiento" }}
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
                    v-for="procedimiento in procedimientos"
                    :key="procedimiento.id"
                    class="dropdown__item"
                    @click="selectProcedimiento(procedimiento)"
                    role="option"
                    :aria-selected="
                      selectedProcedimiento === procedimiento.name
                    "
                  >
                    {{ procedimiento.name }}
                  </li>
                </ul>
              </div>
            </fieldset>

            <fieldset class="onboarding-modal__field">
              <legend
                class="onboarding-modal__label"
                :class="{
                  'onboarding-modal__label--disabled': !selectedProcedimiento,
                }"
                :disabled="!selectedProcedimiento"
              >
                Producto
              </legend>
              <div class="dropdown" ref="productDropdown" @click.stop>
                <button
                  type="button"
                  class="dropdown__trigger"
                  @click="toggleDropdown('producto')"
                  :class="{
                    'dropdown__trigger--active': activeDropdown === 'producto',
                    'dropdown__trigger--disabled': !selectedProcedimiento,
                  }"
                  :disabled="!selectedProcedimiento"
                  :aria-expanded="activeDropdown === 'producto'"
                  aria-haspopup="listbox"
                  role="combobox"
                >
                  <span class="dropdown__selected">
                    {{
                      !selectedProcedimiento
                        ? "Selecciona un producto"
                        : selectedProducto || "Selecciona un producto"
                    }}
                  </span>
                  <Icon
                    name="mdi:chevron-down"
                    class="dropdown__icon"
                    :class="{
                      'dropdown__icon--rotated': activeDropdown === 'producto',
                      'dropdown__icon--disabled': !selectedProcedimiento,
                    }"
                    aria-hidden="true"
                  />
                </button>
                <ul
                  class="dropdown__menu"
                  :class="{
                    'dropdown__menu--open':
                      activeDropdown === 'producto' && selectedProcedimiento,
                  }"
                  role="listbox"
                  aria-label="Lista de productos"
                >
                  <li
                    v-for="producto in productos"
                    :key="producto.id"
                    class="dropdown__item"
                    @click="selectProduct(producto)"
                    role="option"
                    :aria-selected="selectedProducto === producto.name"
                  >
                    {{ producto.name }}
                  </li>
                </ul>
              </div>
            </fieldset>
          </div>

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
              v-model="valoracionesPostOperatorias"
              min="0"
              :aria-describedby="`${preoperativeAssessment.code}-help`"
            />
          </fieldset>

          <section class="onboarding-modal__services">
            <!-- Servicios incluidos dinámicos -->
            <div v-if="generalAssessments.length > 0">
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
                      v-for="assessment in generalAssessments"
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
                          :aria-labelledby="`${assessment.code}-label`"
                        >
                          <legend
                            :id="`${assessment.code}-label`"
                            class="sr-only"
                          >
                            {{ assessment.name }}
                          </legend>
                          <label class="radio-group__item">
                            <input
                              type="radio"
                              :name="assessment.code"
                              value="si"
                              class="radio-group__input"
                              v-model="dynamicServices[assessment.code]"
                            />
                            <span class="radio-group__label">Sí</span>
                          </label>
                          <label class="radio-group__item">
                            <input
                              type="radio"
                              :name="assessment.code"
                              value="no"
                              class="radio-group__input"
                              v-model="dynamicServices[assessment.code]"
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
                v-model="observaciones"
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
      >
        Volver
      </button>
      <button
        type="button"
        @click="handleFinish"
        class="onboarding-modal__button onboarding-modal__button--primary"
      >
        Finalizar
      </button>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { onClickOutside } from "@vueuse/core";
import {
  useAssessment,
  useProcedure,
  useProducts,
  useSupplier,
} from "~/composables/api";
import type { AssessmentDetail, Procedure, Product, Supplier } from "~/types";

const { fetchProducts } = useProducts();
const { fetchProcedure } = useProcedure();
const { fetchAssessment } = useAssessment();
const { fetchSupplier } = useSupplier();

const isModalOpen = ref<boolean>(false);
const activeDropdown = ref<string | null>(null);

const selectedMedico = ref<string>("");
const selectedProcedimiento = ref<string>("");
const selectedProducto = ref<string>("");
const valoracionesPostOperatorias = ref<number>(0);
const observaciones = ref<string>("");

const supplierDropdown = ref<HTMLElement | null>(null);
const procedureDropdown = ref<HTMLElement | null>(null);
const productDropdown = ref<HTMLElement | null>(null);

const suppliers = ref<Supplier[]>([]);
const procedimientos = ref<Procedure[]>([]);
const productos = ref<Product[]>();
const assessments = ref<AssessmentDetail[]>([]);

const dynamicServices = reactive<Record<string, string>>({});
const dynamicTreatment = reactive<Record<string, string>>({});

interface Emits {
  (e: "openWelcomeModal"): void;
  (e: "openSuccessModal"): void;
  (e: "closeWelcomeModal"): void;
}
const emit = defineEmits<Emits>();

const preoperativeAssessment = computed(() => {
  return assessments.value.find(
    (assessment) => assessment.code === "PREOPERATIVE_ASSESSMENT"
  );
});

const generalAssessments = computed(() => {
  const excludedCodes = [
    "PREOPERATIVE_ASSESSMENT",
    "POSTOP_TREATMENT",
    "GENERAL",
  ];
  return assessments.value.filter(
    (assessment) => !excludedCodes.includes(assessment.code)
  );
});

const postopTreatmentAssessments = computed(() => {
  return assessments.value.filter(
    (assessment) => assessment.code === "POSTOP_TREATMENT"
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

const handleFinish = () => {
  const formData = {
    selectedMedico: selectedMedico.value,
    selectedProcedimiento: selectedProcedimiento.value,
    selectedProducto: selectedProducto.value,
    valoracionesPostOperatorias: valoracionesPostOperatorias.value,
    dynamicServices: { ...dynamicServices },
    dynamicTreatment: { ...dynamicTreatment },
    observaciones: observaciones.value,
  };

  console.log("Form data:", formData);
  handleCloseModal();
  localStorage.removeItem("onboarding");
  emit("openSuccessModal");
};

const toggleDropdown = (dropdownName: string) => {
  if (dropdownName === "producto" && !selectedProcedimiento.value) {
    return;
  }

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
  selectedMedico.value = medico.name;
  closeAllDropdowns();
};

const loadAssessment = async () => {
  try {
    const api = fetchAssessment();
    await api.request();

    if (api.response.value?.data) {
      assessments.value = api.response.value.data;

      initializeDynamicStates();
    }

    console.log("Assessment data:", assessments.value);
  } catch (error) {
    console.error("Error loading assessments:", error);
  }
};

const initializeDynamicStates = () => {
  generalAssessments.value.forEach((assessment) => {
    if (!dynamicServices[assessment.code]) {
      dynamicServices[assessment.code] = "";
    }
  });

  postopTreatmentAssessments.value.forEach((assessment) => {
    if (!dynamicTreatment[assessment.code]) {
      dynamicTreatment[assessment.code] = "";
    }
  });
};

const loadSuppliers = async () => {
  try {
    const api = fetchSupplier();
    await api.request();

    suppliers.value = api.response.value?.data || [];
  } catch (error) {
    console.error("Error loading suppliers:", error);
  }
};

const loadProcedures = async () => {
  try {
    const api = fetchProcedure();
    await api.request();

    procedimientos.value = api.response.value?.data || [];
  } catch (error) {
    console.error("Error loading procedures:", error);
  }
};

const loadProductos = async (procedimientoCode: string) => {
  if (!procedimientoCode) return;

  try {
    const api = fetchProducts({ father_code: procedimientoCode });
    await api.request();

    productos.value = api.response.value?.data || [];
  } catch (error) {
    console.error("Error loading products:", error);
  }
};

const selectProcedimiento = (procedimiento: Procedure) => {
  selectedProcedimiento.value = procedimiento.name;
  selectedProducto.value = "";
  closeAllDropdowns();

  loadProductos(procedimiento.code);
};

const selectProduct = (product: Product) => {
  selectedProducto.value = product.name;
  closeAllDropdowns();
};

onClickOutside(supplierDropdown, () => {
  if (activeDropdown.value === "medico") activeDropdown.value = null;
});

onClickOutside(procedureDropdown, () => {
  if (activeDropdown.value === "procedimiento") activeDropdown.value = null;
});

onClickOutside(productDropdown, () => {
  if (activeDropdown.value === "producto") activeDropdown.value = null;
});

await loadProcedures();
await loadSuppliers();
await loadAssessment();

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
    max-width: 255px;
    min-height: fit-content;
    background: #ebecf7;
    border-radius: 15px;
    margin: 10px;
    padding: 20px;
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
    font-size: 20px;
    line-height: 27px;
    letter-spacing: 0;
    margin-top: 6rem;
    color: $color-primary;
  }

  &__form {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 20px;
    margin: 10px;
    border-radius: 15px;
    background-color: #f8faff;
    padding: 20px;
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

  &__field-group {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  }

  &__label {
    @include form-label;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
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
      max-width: 40px;
      padding: 10px 14px;

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
    min-height: 128px;
    resize: vertical;
  }

  &__services {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  &__services-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #2d3748;
    margin: 0;
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

    padding: 15px 17px;
    font-family: $font-family-main;
    font-size: 14.7px;
    background: $white;
    border: 1px solid #d4dae0;
    box-shadow:
      0 0 1.05px rgba(50, 50, 71, 0.2),
      0 1.05px 2.1px rgba(50, 50, 71, 0.08);
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
      border: 1px solid #0cadbb;
    }

    &--active {
      border-color: #0cadbb;
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
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    max-height: 200px;
    overflow-y: auto;
    background-color: white;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.1),
      0 4px 6px -2px rgba(0, 0, 0, 0.05);
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-8px);
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
      border-top-left-radius: 6px;
      border-top-right-radius: 6px;
    }

    &:last-child {
      border-bottom-left-radius: 6px;
      border-bottom-right-radius: 6px;
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
  border-radius: 6px;
  overflow: hidden;

  &__row {
    &:nth-child(even) {
      background-color: #f7fafc;
    }
  }

  &__header {
    @include label-base;
    font-weight: 500;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0;
    width: 60%;
    color: #344054;
  }

  &__cell {
    padding: 8px;
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
