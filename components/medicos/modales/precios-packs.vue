<template>
  <div class="packs-config">
    <p class="packs-config__subtitle">Configura tus packs:</p>
    <p class="packs-config__description">
      Cada pack puede tener su propio precio y costo de valoración.
    </p>

    <div class="packs-config__tabs">
      <button
        v-for="(pack, index) in internalPacks"
        :key="index"
        type="button"
        class="packs-config__tab"
        :class="{ 'packs-config__tab--active': activePackIndex === index }"
        @click="setActivePack(index)"
      >
        Pack {{ index + 1 }}
        <span v-if="isPackComplete(pack)" class="packs-config__tab-check">
          ✓
        </span>
      </button>

      <button
        type="button"
        class="packs-config__tab packs-config__tab--add"
        @click="addPack"
      >
        + Nuevo pack
      </button>
    </div>

    <div
      v-for="(pack, packIndex) in internalPacks"
      :key="packIndex"
      v-show="activePackIndex === packIndex"
      class="packs-config__pack"
    >
      <div class="packs-config__pack-header">
        <h5 class="packs-config__pack-title">Pack {{ packIndex + 1 }}</h5>
        <button
          v-if="internalPacks.length > 1"
          type="button"
          class="packs-config__pack-remove"
          @click="removePack(packIndex)"
        >
          Eliminar
        </button>
      </div>

      <div class="packs-config__field">
        <label class="packs-config__label">Especialidad médica</label>
        <UiDropdownBase
          v-model="pack.especialidad"
          :items="specialtiesForDropdown"
          placeholder="Seleccione una especialidad"
          searchable
          clearable
        />
      </div>

      <div class="packs-config__field">
        <label class="packs-config__label">Procedimiento</label>
        <input
          class="packs-config__input"
          type="text"
          :value="getProcedureName(pack.procedimiento)"
          @input="updateProcedure(pack, $event)"
          :list="`procedures-list-${packIndex}`"
          placeholder="Escriba o seleccione un procedimiento"
        />
        <datalist :id="`procedures-list-${packIndex}`">
          <option
            v-for="procedure in procedures"
            :key="procedure.code"
            :value="procedure.name"
          >
            {{ procedure.name }}
          </option>
        </datalist>
      </div>

      <div class="packs-config__field">
        <label class="packs-config__label">Producto</label>
        <UiDropdownBase
          v-model="pack.producto"
          :items="productos"
          placeholder="Seleccione un producto"
          searchable
          clearable
        />
      </div>

      <div class="packs-config__field">
        <label class="packs-config__label">Servicios incluidos</label>

        <div class="packs-config__services-selector">
          <UiDropdownBase
            v-model="selectedService"
            :items="availableServices"
            placeholder="Seleccione un servicio"
            searchable
          />
          <button
            type="button"
            class="packs-config__add-service-button"
            :disabled="!selectedService"
            @click="addService(pack)"
          >
            Agregar
          </button>
        </div>

        <div v-if="pack.servicios.length" class="packs-config__services-list">
          <div
            v-for="(srv, i) in pack.servicios"
            :key="i"
            class="packs-config__service-item"
          >
            <span>{{ getServiceName(srv) }}</span>
            <button @click="removeService(pack, i)">×</button>
          </div>
        </div>
      </div>

      <div class="packs-config__field">
        <label class="packs-config__label">Precio del pack</label>
        <div class="packs-config__price-input-wrapper">
          <span class="packs-config__currency-symbol">₡</span>
          <input
            type="number"
            min="0"
            step="1000"
            v-model.number="pack.precio"
            class="packs-config__price-input packs-config__price-input--with-symbol"
          />
        </div>
      </div>

      <div class="packs-config__field">
        <label class="packs-config__label">Costo de cita de valoración</label>
        <div class="packs-config__price-input-wrapper">
          <span class="packs-config__currency-symbol">₡</span>
          <input
            type="number"
            min="0"
            step="1000"
            v-model.number="pack.precioValoracion"
            class="packs-config__price-input packs-config__price-input--with-symbol"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUdc } from "@/composables/api";
import type { IUdc } from "@/types";

interface Pack {
  especialidad: string;
  procedimiento: string;
  producto: string;
  servicios: string[];
  precio: number;
  precioValoracion?: number;
  disponibilidad: DayAvailability[];
}

interface TimeSlot {
  from: string;
  to: string;
}

interface DayAvailability {
  active: boolean;
  timeSlots: TimeSlot[];
}

interface Props {
  modelValue?: Pack[];
  availableSpecialties?: Array<{ code: string; name: string }>;
}

const DEFAULT_VALORACION_COST = 25000;

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  availableSpecialties: () => [],
});

const emit = defineEmits<{
  (e: "update:modelValue", value: Pack[]): void;
  (e: "update:activePackIndex", index: number): void;
}>();

const { fetchUdc } = useUdc();

const productos = ref<Array<{ value: string; label: string }>>([]);
const services = ref<IUdc[]>([]);
const procedures = ref<IUdc[]>([]);
const selectedService = ref<string>("");
const activePackIndex = ref<number>(0);

const specialtiesForDropdown = computed(() =>
  props.availableSpecialties.map((s) => ({
    value: s.code,
    label: s.name,
  }))
);

const availableServices = computed(() =>
  services.value.map((s) => ({
    value: s.code,
    label: s.name,
  }))
);

const internalPacks = ref<Pack[]>(
  props.modelValue.length
    ? [...props.modelValue]
    : [
        {
          especialidad: "",
          procedimiento: "",
          producto: "",
          servicios: [],
          precio: 0,
          precioValoracion: DEFAULT_VALORACION_COST,
          disponibilidad: [],
        },
      ]
);

watch(internalPacks, (val) => emit("update:modelValue", val), { deep: true });

watch(activePackIndex, (val) => emit("update:activePackIndex", val));

const isPackComplete = (pack: Pack): boolean => {
  return !!(
    pack.especialidad &&
    pack.procedimiento &&
    pack.producto &&
    pack.servicios.length > 0 &&
    pack.precio > 0
  );
};

const setActivePack = (index: number) => {
  activePackIndex.value = index;
};

const addPack = () => {
  internalPacks.value.push({
    especialidad: "",
    procedimiento: "",
    producto: "",
    servicios: [],
    precio: 0,
    precioValoracion: DEFAULT_VALORACION_COST,
    disponibilidad: [],
  });
  activePackIndex.value = internalPacks.value.length - 1;
};

const removePack = (i: number) => {
  internalPacks.value.splice(i, 1);
  if (activePackIndex.value >= internalPacks.value.length) {
    activePackIndex.value = Math.max(0, internalPacks.value.length - 1);
  }
};

const addService = (pack: Pack) => {
  if (!pack.servicios.includes(selectedService.value)) {
    pack.servicios.push(selectedService.value);
    selectedService.value = "";
  }
};

const removeService = (pack: Pack, i: number) => {
  pack.servicios.splice(i, 1);
};

const getServiceName = (code: string) =>
  services.value.find((s) => s.code === code)?.name || code;

const getProcedureName = (code: string) => {
  if (!code) return "";
  const procedure = procedures.value.find((p) => p.code === code);
  return procedure?.name || code;
};

const updateProcedure = (pack: Pack, event: Event) => {
  const input = event.target as HTMLInputElement;
  const name = input.value;

  const procedure = procedures.value.find((p) => p.name === name);

  if (procedure) {
    pack.procedimiento = procedure.code;
  } else {
    pack.procedimiento = name;
  }
};

onMounted(async () => {
  const productsApi = fetchUdc("MEDICAL_PRODUCT", {}, { authRequired: false });
  const servicesApi = fetchUdc(
    "ASSESSMENT_DETAIL",
    {},
    { authRequired: false }
  );
  const proceduresApi = fetchUdc(
    "MEDICAL_PROCEDURE",
    {},
    { authRequired: false }
  );

  await Promise.all([
    productsApi.request(),
    servicesApi.request(),
    proceduresApi.request(),
  ]);

  productos.value =
    productsApi.response.value?.data?.map((p: any) => ({
      value: p.code,
      label: p.name,
    })) ?? [];

  services.value = servicesApi.response.value?.data ?? [];
  procedures.value = proceduresApi.response.value?.data ?? [];
});
</script>

<style scoped lang="scss">
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

  &__pack-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  &__pack-title {
    font-weight: 600;
    font-size: 1.125rem;
    color: #344054;
    margin: 0;
  }

  &__pack {
    border: 1px solid #e4e7ec;
    border-radius: 8px;
    padding: 1.5rem;
    background: #f9fafb;
    @include space-y(1rem);
  }

  &__pack-remove {
    @include danger-button;
    padding: 8px 12px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__label {
    font-weight: 600;
    font-size: 0.875rem;
    color: #344054;
  }

  &__input,
  &__price-input {
    @include input-base;
    width: 100%;
  }

  &__price-input-wrapper {
    position: relative;
    max-width: 280px;
  }

  &__currency-symbol {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    font-weight: 600;
    color: #667085;
  }

  &__price-input--with-symbol {
    padding-left: 2.25rem;
  }

  &__services-selector {
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

  &__services-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 0.5rem;
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

    span {
      color: #344054;
    }

    button {
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
      transition: all 0.2s ease;

      &:hover {
        background: #fee2e2;
      }
    }
  }
}
</style>
