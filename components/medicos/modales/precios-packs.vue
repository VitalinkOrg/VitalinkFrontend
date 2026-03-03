<template>
  <div class="packs-config" role="region" aria-label="Configuración de packs">
    <p class="packs-config__subtitle">Configura tus packs:</p>
    <p class="packs-config__description">
      Cada pack puede tener su propio precio y costo de valoración.
    </p>

    <nav
      class="packs-config__tabs"
      role="tablist"
      aria-label="Packs disponibles"
    >
      <button
        v-for="(pack, packIndex) in internalPacks"
        :key="`tab-${packIndex}`"
        type="button"
        role="tab"
        class="packs-config__tab"
        :class="{ 'packs-config__tab--active': activePackIndex === packIndex }"
        :aria-selected="activePackIndex === packIndex"
        :aria-controls="`pack-panel-${packIndex}`"
        @click="activatePack(packIndex)"
      >
        Pack {{ packIndex + 1 }}
        <span
          v-if="isPackComplete(pack)"
          class="packs-config__tab-check"
          aria-label="Completo"
        >
          ✓
        </span>
      </button>

      <button
        type="button"
        class="packs-config__tab packs-config__tab--add"
        aria-label="Agregar nuevo pack"
        @click="appendNewPack"
      >
        + Nuevo pack
      </button>
    </nav>

    <div
      v-for="(pack, packIndex) in internalPacks"
      :key="`panel-${packIndex}`"
      v-show="activePackIndex === packIndex"
      :id="`pack-panel-${packIndex}`"
      role="tabpanel"
      class="packs-config__panel"
      :aria-label="`Configuración del Pack ${packIndex + 1}`"
    >
      <div class="packs-config__panel-header">
        <h5 class="packs-config__panel-title">Pack {{ packIndex + 1 }}</h5>
        <button
          v-if="internalPacks.length > 1"
          type="button"
          class="packs-config__panel-remove"
          :aria-label="`Eliminar Pack ${packIndex + 1}`"
          @click="removePackAtIndex(packIndex)"
        >
          Eliminar
        </button>
      </div>

      <div class="packs-config__field">
        <label :id="`label-specialty-${packIndex}`" class="packs-config__label">
          Especialidad médica
        </label>
        <UiDropdownBase
          :model-value="pack.specialty_code"
          :items="specialtyDropdownItems"
          placeholder="Seleccione una especialidad"
          searchable
          clearable
          :aria-labelledby="`label-specialty-${packIndex}`"
          @update:model-value="
            handleSpecialtyChange(packIndex, $event as string)
          "
        />
      </div>

      <div class="packs-config__field">
        <label :id="`label-procedure-${packIndex}`" class="packs-config__label">
          Procedimiento
        </label>
        <UiDropdownBase
          :model-value="pack.procedure_code"
          :items="procedureItemsForPack(pack)"
          :loading="isLoadingProcedures"
          :disabled="!pack.specialty_code"
          placeholder="Seleccione un procedimiento"
          searchable
          clearable
          :aria-labelledby="`label-procedure-${packIndex}`"
          @update:model-value="
            handleProcedureChange(packIndex, $event as string)
          "
        />
        <span v-if="!pack.specialty_code" class="packs-config__field-hint">
          Primero seleccione una especialidad
        </span>
      </div>

      <div class="packs-config__field">
        <label :for="`input-product-${packIndex}`" class="packs-config__label">
          Producto
        </label>
        <div class="packs-config__product-input-wrapper">
          <input
            :id="`input-product-${packIndex}`"
            type="text"
            class="packs-config__input"
            :value="pack.product_name"
            :disabled="!pack.procedure_code"
            placeholder="Escriba o seleccione un producto"
            autocomplete="off"
            :list="`product-suggestions-${packIndex}`"
            @input="
              handleProductInput(
                packIndex,
                ($event.target as HTMLInputElement).value,
              )
            "
          />
          <datalist :id="`product-suggestions-${packIndex}`">
            <option
              v-for="product in productSuggestionsForPack(pack)"
              :key="product.code"
              :value="product.name"
            >
              {{
                product.value1
                  ? `${product.name} — ₡${Number(product.value1).toLocaleString("es-CR")}`
                  : product.name
              }}
            </option>
          </datalist>
        </div>
        <span v-if="!pack.procedure_code" class="packs-config__field-hint">
          Primero seleccione un procedimiento
        </span>
      </div>

      <div class="packs-config__field">
        <label :id="`label-services-${packIndex}`" class="packs-config__label">
          Servicios incluidos
        </label>

        <div class="packs-config__inline-group">
          <UiDropdownBase
            :model-value="pendingServiceCode"
            :items="availableServiceItemsForPack(pack)"
            placeholder="Seleccione un servicio"
            searchable
            :aria-labelledby="`label-services-${packIndex}`"
            @update:model-value="pendingServiceCode = $event as string"
          />
          <button
            type="button"
            class="packs-config__add-service-button"
            :disabled="!pendingServiceCode"
            @click="addServiceToPack(packIndex)"
          >
            Agregar
          </button>
        </div>

        <ul
          v-if="pack.services_offer.length > 0"
          class="packs-config__service-list"
          :aria-label="`Servicios incluidos en Pack ${packIndex + 1}`"
        >
          <li
            v-for="(serviceCode, serviceIndex) in pack.services_offer"
            :key="serviceCode"
            class="packs-config__service-item"
          >
            <span class="packs-config__service-item-name">
              {{ resolveAssessmentDisplayName(serviceCode) }}
            </span>
            <button
              type="button"
              class="packs-config__service-item-remove"
              :aria-label="`Eliminar servicio ${resolveAssessmentDisplayName(serviceCode)}`"
              @click="removeServiceFromPack(packIndex, serviceIndex)"
            >
              ×
            </button>
          </li>
        </ul>
      </div>

      <div class="packs-config__field">
        <label :for="`input-price-${packIndex}`" class="packs-config__label">
          Precio del pack
          <span class="packs-config__label-hint">(opcional)</span>
        </label>
        <div class="packs-config__currency-wrapper">
          <span class="packs-config__currency-symbol" aria-hidden="true"
            >₡</span
          >
          <input
            :id="`input-price-${packIndex}`"
            type="number"
            min="0"
            step="1000"
            :value="pack.reference_price"
            class="packs-config__currency-input"
            placeholder="0"
            @input="
              updatePackNumericField(packIndex, 'reference_price', $event)
            "
          />
        </div>
      </div>

      <div class="packs-config__field">
        <label
          :for="`input-valoration-${packIndex}`"
          class="packs-config__label"
        >
          Costo de cita de valoración
        </label>
        <div class="packs-config__currency-wrapper">
          <span class="packs-config__currency-symbol" aria-hidden="true"
            >₡</span
          >
          <input
            :id="`input-valoration-${packIndex}`"
            type="number"
            min="0"
            step="1000"
            :value="pack.product_valoration_price"
            class="packs-config__currency-input"
            :class="{
              'packs-config__currency-input--error':
                !pack.product_valoration_price ||
                pack.product_valoration_price <= 0,
            }"
            placeholder="18000"
            required
            aria-required="true"
            :aria-invalid="
              !pack.product_valoration_price ||
              pack.product_valoration_price <= 0
            "
            @input="
              updatePackNumericField(
                packIndex,
                'product_valoration_price',
                $event,
              )
            "
          />
        </div>
        <span
          v-if="
            !pack.product_valoration_price || pack.product_valoration_price <= 0
          "
          class="packs-config__error-message"
          role="alert"
        >
          El costo de valoración es requerido
        </span>
      </div>

      <div class="packs-config__field">
        <label class="packs-config__checkbox-wrapper">
          <input
            type="checkbox"
            :checked="pack.apply_discount"
            class="packs-config__checkbox"
            @change="toggleDiscount(packIndex, $event)"
          />
          <span class="packs-config__checkbox-label">
            Aplicar precio descuento Vitalink
          </span>
        </label>

        <div v-if="pack.apply_discount" class="packs-config__discount-field">
          <label
            :for="`input-discount-${packIndex}`"
            class="packs-config__label"
          >
            Precio descuento
          </label>
          <div class="packs-config__currency-wrapper">
            <span class="packs-config__currency-symbol" aria-hidden="true"
              >₡</span
            >
            <input
              :id="`input-discount-${packIndex}`"
              type="number"
              min="0"
              step="1000"
              :value="pack.discount"
              class="packs-config__currency-input"
              placeholder="0"
              @input="updatePackNumericField(packIndex, 'discount', $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { DropdownItem } from "@/components/ui/dropdown-base.vue";
import { useUdc } from "@/composables/api/useUdc";
import { useLogger } from "@/composables/useLogger";

export interface PackFormItem {
  id?: number;
  productId?: number;
  procedure_code: string;
  product_code: string;
  discount: number | null;
  reference_price: number | null;
  services_offer: string[];

  specialty_code: string;
  product_name: string;
  product_valoration_price: number | null;
  apply_discount: boolean;
}

interface SelectedSpecialty {
  code: string;
  name: string;
}

interface Props {
  modelValue: PackFormItem[];
  availableSpecialties?: SelectedSpecialty[];
  medicalTypeCode?: string;
  supplierId?: number | null;
}

interface Emits {
  (event: "update:modelValue", packs: PackFormItem[]): void;
  (event: "update:activePackIndex", index: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  availableSpecialties: () => [],
  medicalTypeCode: "",
  supplierId: null,
});

const emit = defineEmits<Emits>();
const logger = useLogger("PreciosPacks");
const { getAllUdcs } = useUdc();

const activePackIndex = ref(0);
const pendingServiceCode = ref("");

const allProcedures = ref<IUdc[]>([]);
const allProducts = ref<IUdc[]>([]);
const assessmentDetails = ref<IUdc[]>([]);

const isLoadingProcedures = ref(false);
const isLoadingProducts = ref(false);

const internalPacks = computed<PackFormItem[]>({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const specialtyDropdownItems = computed<DropdownItem[]>(() =>
  props.availableSpecialties.map((s) => ({ value: s.code, label: s.name })),
);

function procedureItemsForPack(pack: PackFormItem): DropdownItem[] {
  if (!pack.specialty_code) return [];
  const filtered = allProcedures.value.filter(
    (p) => p.father_code === pack.specialty_code,
  );
  const source = filtered.length > 0 ? filtered : allProcedures.value;
  return source.map((p) => ({ value: p.code, label: p.name }));
}

function productSuggestionsForPack(pack: PackFormItem): IUdc[] {
  if (!pack.procedure_code) return [];
  const filtered = allProducts.value.filter(
    (p) => p.father_code === pack.procedure_code,
  );
  return filtered.length > 0 ? filtered : allProducts.value;
}

function availableServiceItemsForPack(pack: PackFormItem): DropdownItem[] {
  const alreadySelected = new Set(pack.services_offer);
  return assessmentDetails.value
    .filter((d) => !alreadySelected.has(d.code))
    .map((d) => ({ value: d.code, label: d.name }));
}

function resolveAssessmentDisplayName(code: string): string {
  return assessmentDetails.value.find((d) => d.code === code)?.name ?? code;
}

function createEmptyPack(): PackFormItem {
  return {
    procedure_code: "",
    product_code: "",
    discount: null,
    reference_price: null,
    services_offer: [],
    specialty_code: "",
    product_name: "",
    product_valoration_price: null,
    apply_discount: false,
  };
}

function isPackComplete(pack: PackFormItem): boolean {
  return Boolean(
    pack.procedure_code &&
      pack.product_valoration_price &&
      pack.product_valoration_price > 0,
  );
}

function activatePack(index: number) {
  activePackIndex.value = index;
  emit("update:activePackIndex", index);
}

function appendNewPack() {
  const updatedPacks = [...internalPacks.value, createEmptyPack()];
  internalPacks.value = updatedPacks;
  activatePack(updatedPacks.length - 1);
}

function removePackAtIndex(index: number) {
  if (internalPacks.value.length <= 1) return;
  const updatedPacks = internalPacks.value.filter((_, i) => i !== index);
  internalPacks.value = updatedPacks;
  activatePack(Math.min(activePackIndex.value, updatedPacks.length - 1));
}

function cloneAndUpdate(packIndex: number, updates: Partial<PackFormItem>) {
  const updatedPacks = [...internalPacks.value];
  updatedPacks[packIndex] = { ...updatedPacks[packIndex], ...updates };
  internalPacks.value = updatedPacks;
}

function handleSpecialtyChange(packIndex: number, code: string) {
  cloneAndUpdate(packIndex, {
    specialty_code: code ?? "",
    procedure_code: "",
    product_code: "",
    product_name: "",
    reference_price: null,
    product_valoration_price: null,
  });
  if (code) fetchProceduresBySpecialty(code);
}

function handleProcedureChange(packIndex: number, code: string) {
  cloneAndUpdate(packIndex, {
    procedure_code: code ?? "",
    product_code: "",
    product_name: "",
  });
  if (code) fetchProductsByProcedure(code);
}

function handleProductInput(packIndex: number, value: string) {
  const matchedProduct = allProducts.value.find((p) => p.name === value);

  if (matchedProduct) {
    cloneAndUpdate(packIndex, {
      product_name: matchedProduct.name,
      product_code: matchedProduct.code,
      reference_price: matchedProduct.value1
        ? Number(matchedProduct.value1)
        : null,
      product_valoration_price: matchedProduct.value2
        ? Number(matchedProduct.value2)
        : null,
    });
  } else {
    cloneAndUpdate(packIndex, {
      product_name: value,
      product_code: "",
    });
  }
}

function updatePackNumericField(
  packIndex: number,
  field: "reference_price" | "product_valoration_price" | "discount",
  event: Event,
) {
  const raw = (event.target as HTMLInputElement).value;
  const parsed = raw === "" ? null : Number(raw);
  cloneAndUpdate(packIndex, {
    [field]: parsed !== null && !isNaN(parsed) ? parsed : null,
  });
}

function toggleDiscount(packIndex: number, event: Event) {
  const checked = (event.target as HTMLInputElement).checked;
  cloneAndUpdate(packIndex, {
    apply_discount: checked,
    discount: checked ? internalPacks.value[packIndex].discount : null,
  });
}

function addServiceToPack(packIndex: number) {
  if (!pendingServiceCode.value) return;
  const pack = internalPacks.value[packIndex];
  if (pack.services_offer.includes(pendingServiceCode.value)) return;
  cloneAndUpdate(packIndex, {
    services_offer: [...pack.services_offer, pendingServiceCode.value],
  });
  pendingServiceCode.value = "";
}

function removeServiceFromPack(packIndex: number, serviceIndex: number) {
  const pack = internalPacks.value[packIndex];
  cloneAndUpdate(packIndex, {
    services_offer: pack.services_offer.filter((_, i) => i !== serviceIndex),
  });
}

async function fetchProceduresBySpecialty(specialtyCode: string) {
  isLoadingProcedures.value = true;
  try {
    const { data, error } = await getAllUdcs(
      {
        type: "MEDICAL_PROCEDURE",
        father_code: specialtyCode,
      } as Partial<IUdcParams>,
      false,
    );
    if (error) {
      logger.error("Failed to fetch procedures", {
        specialty: specialtyCode,
        info: error.info,
      });
    }
    let fetched = data ?? [];

    if (fetched.length === 0) {
      logger.debug("No procedures found for specialty, loading all", {
        specialtyCode,
      });
      const { data: allData, error: allError } = await getAllUdcs(
        { type: "MEDICAL_PROCEDURE" } as Partial<IUdcParams>,
        false,
      );
      if (allError) {
        logger.error("Failed to fetch all procedures", { info: allError.info });
      }
      fetched = allData ?? [];
    }

    const existingCodes = new Set(allProcedures.value.map((p) => p.code));
    const newItems = fetched.filter((p) => !existingCodes.has(p.code));
    allProcedures.value = [...allProcedures.value, ...newItems];
  } finally {
    isLoadingProcedures.value = false;
  }
}

async function fetchProductsByProcedure(procedureCode: string) {
  isLoadingProducts.value = true;
  try {
    const params: Partial<IUdcParams> & { supplier_id?: number } = {
      type: "MEDICAL_PRODUCT",
      father_code: procedureCode,
    };
    if (props.supplierId) params.supplier_id = props.supplierId;

    const { data, error } = await getAllUdcs(
      params as Partial<IUdcParams>,
      false,
    );
    if (error) {
      logger.error("Failed to fetch products", {
        procedure: procedureCode,
        info: error.info,
      });
      return;
    }
    const fetched = data ?? [];
    const existingCodes = new Set(allProducts.value.map((p) => p.code));
    const newItems = fetched.filter((p) => !existingCodes.has(p.code));
    allProducts.value = [...allProducts.value, ...newItems];
  } finally {
    isLoadingProducts.value = false;
  }
}

async function fetchAssessmentDetails() {
  try {
    const { data, error } = await getAllUdcs(
      { type: "ASSESSMENT_DETAIL" } as Partial<IUdcParams>,
      false,
    );
    if (error) {
      logger.error("Failed to fetch assessment details", { info: error.info });
      return;
    }
    assessmentDetails.value = data ?? [];
  } catch (err) {
    logger.error("Unexpected error fetching assessments", {
      error: err instanceof Error ? err.message : "Unknown",
    });
  }
}

watch(activePackIndex, (newIndex) => {
  emit("update:activePackIndex", newIndex);
});

watch(
  () => props.availableSpecialties,
  (newSpecialties) => {
    if (newSpecialties.length > 0) {
      for (const { code } of newSpecialties) {
        const alreadyHas = allProcedures.value.some(
          (p) => p.father_code === code,
        );
        if (!alreadyHas) fetchProceduresBySpecialty(code);
      }
    }
  },
  { immediate: true },
);

watch(
  () => props.modelValue,
  async (packs) => {
    for (const pack of packs) {
      if (pack.specialty_code) {
        const hasProcedures = allProcedures.value.some(
          (p) => p.father_code === pack.specialty_code,
        );
        if (!hasProcedures)
          await fetchProceduresBySpecialty(pack.specialty_code);
      }
      if (pack.procedure_code) {
        const hasProducts = allProducts.value.some(
          (p) => p.father_code === pack.procedure_code,
        );
        if (!hasProducts) await fetchProductsByProcedure(pack.procedure_code);
      }
    }
  },
  { immediate: true },
);

onMounted(async () => {
  await fetchAssessmentDetails();
});

defineExpose({
  isPackComplete,
  createEmptyPack,
});
</script>

<style lang="scss" scoped>
.packs-config {
  @include space-y(1.5rem);

  &__subtitle {
    font-weight: 600;
    font-size: 1rem;
    color: #344054;
    margin: 0 0 0.25rem 0;
  }

  &__description {
    font-size: 0.875rem;
    color: #667085;
    margin: 0;
  }

  &__tabs {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
  }

  &__tab {
    @include button-base;
    padding: 0.5rem 1rem;
    border: 2px solid #e4e7ec;
    border-radius: 8px;
    background: white;
    font-weight: 500;
    color: #667085;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
      border-color: $color-primary;
      color: $color-primary;
    }

    &--active {
      border-color: $color-primary;
      background: $color-primary;
      color: white;
      &:hover {
        background: darken($color-primary, 5%);
      }
      .packs-config__tab-check {
        background: white;
        color: $color-primary;
      }
    }

    &--add {
      border-style: dashed;
      color: $color-primary;
      &:hover {
        background: lighten($color-primary, 45%);
      }
    }
  }

  &__tab-check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    background: #22c55e;
    color: white;
    border-radius: 50%;
    font-size: 12px;
    font-weight: bold;
  }

  &__panel {
    border: 1px solid #e4e7ec;
    border-radius: 8px;
    padding: 1.5rem;
    background: #f9fafb;
    @include space-y(1rem);
  }

  &__panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  &__panel-title {
    font-weight: 600;
    font-size: 1.125rem;
    color: #344054;
    margin: 0;
  }

  &__panel-remove {
    @include danger-button;
    padding: 8px 12px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__field-hint {
    font-size: 0.8125rem;
    color: #98a2b3;
    font-style: italic;
  }

  &__label {
    font-weight: 600;
    font-size: 0.875rem;
    color: #344054;
  }

  &__label-hint {
    font-weight: 400;
    color: #98a2b3;
  }

  &__input {
    @include input-base;
    width: 100%;
  }

  &__product-input-wrapper {
    position: relative;
  }

  &__currency-wrapper {
    position: relative;
    &--compact {
      flex: 1;
      min-width: 0;
    }
  }

  &__currency-symbol {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-weight: 600;
    color: #667085;
    pointer-events: none;
  }

  &__currency-input {
    @include input-base;
    width: 100%;
    padding-left: 2.25rem;

    &--error {
      border-color: #dc2626 !important;
      background-color: #fef2f2 !important;
      &:focus {
        border-color: #dc2626 !important;
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
      }
    }
  }

  &__error-message {
    display: block;
    color: #dc2626;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    line-height: 1.25;
  }

  &__inline-group {
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
  }

  &__add-service-button {
    @include primary-button;
    white-space: nowrap;
    padding: 0.625rem 1rem;
    flex-shrink: 0;
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__service-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.5rem;
    list-style: none;
    padding: 0;
  }

  &__service-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: white;
    border: 1px solid #e4e7ec;
    border-radius: 6px;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }

  &__service-item-name {
    color: #344054;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
  }

  &__service-item-remove {
    @include button-base;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    color: #dc2626;
    font-size: 1.25rem;
    line-height: 1;
    flex-shrink: 0;
    padding: 0;
    &:hover {
      background: #fee2e2;
    }
  }

  &__checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }

  &__checkbox {
    width: 1rem;
    height: 1rem;
    accent-color: $color-primary;
    cursor: pointer;
  }

  &__checkbox-label {
    font-weight: 500;
    font-size: 0.875rem;
    color: #344054;
  }

  &__discount-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
}
</style>
