<template>
  <div class="packs-config">
    <p class="packs-config__subtitle">Configura tus packs:</p>
    <p class="packs-config__description">
      Puedes agregar múltiples packs para este médico. Cada pack puede tener su
      propio precio y disponibilidad.
    </p>

    <div
      v-for="(pack, packIndex) in internalPacks"
      :key="packIndex"
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
          Eliminar Pack
        </button>
      </div>

      <div class="packs-config__field">
        <label class="packs-config__label">Especialidad médica</label>
        <UiDropdownBase
          v-model="pack.especialidad"
          :loading="isLoadingSpecialties"
          :items="specialtiesForDropdown"
          placeholder="Seleccione una especialidad"
          searchable
          clearable
        />
      </div>

      <div class="packs-config__field">
        <label class="packs-config__label">Nombre del procedimiento</label>
        <input
          type="text"
          class="packs-config__input"
          v-model="pack.procedimiento"
          placeholder="Ej: Rinoplastia, Liposucción, etc."
        />
      </div>

      <div class="packs-config__field">
        <label class="packs-config__label">Producto</label>
        <UiDropdownBase
          v-model="pack.producto"
          :loading="isLoadingProducts"
          :items="productos"
          placeholder="Seleccione un producto"
          searchable
          clearable
        />
      </div>

      <div class="packs-config__field">
        <label class="packs-config__label">Servicios incluidos</label>
        <p class="packs-config__field-description">
          Selecciona los servicios que incluye este pack
        </p>
        <div class="packs-config__services-selector">
          <UiDropdownBase
            v-model="selectedService"
            :loading="isLoadingServices"
            :items="availableServices"
            placeholder="Seleccione un servicio"
            searchable
          />
          <button
            type="button"
            class="packs-config__add-service-button"
            :disabled="
              !selectedService || pack.servicios.includes(selectedService)
            "
            @click="addService(pack, selectedService)"
          >
            Agregar
          </button>
        </div>

        <div
          v-if="pack.servicios.length > 0"
          class="packs-config__services-list"
        >
          <div
            v-for="(serviceCode, serviceIdx) in pack.servicios"
            :key="serviceIdx"
            class="packs-config__service-item"
          >
            <span class="packs-config__service-name">
              {{ getServiceName(serviceCode) }}
            </span>
            <button
              type="button"
              class="packs-config__service-remove"
              @click="removeService(pack, serviceIdx)"
              title="Eliminar servicio"
            >
              <AtomsIconsXIcon size="16" />
            </button>
          </div>
        </div>
      </div>

      <div class="packs-config__field">
        <label class="packs-config__label">Precio del pack</label>
        <div class="packs-config__price-group">
          <span class="packs-config__price-label">Desde</span>
          <div class="packs-config__price-input-wrapper">
            <span class="packs-config__currency-symbol">₡</span>
            <input
              type="number"
              v-model.number="pack.precio"
              placeholder="0.00"
              min="0"
              step="1000"
              class="packs-config__price-input packs-config__price-input--with-symbol"
            />
          </div>
        </div>
      </div>

      <div class="packs-config__field">
        <label class="packs-config__label"> Costo de cita de valoración </label>
        <div class="packs-config__valoracion-info">
          <div class="packs-config__price-display">
            <span class="packs-config__currency-symbol">₡</span>
            <span class="packs-config__valoracion-price">{{
              VALORACION_COST.toLocaleString("es-CR")
            }}</span>
          </div>
          <p class="packs-config__valoracion-note">
            Costo fijo para todas las citas de valoración
          </p>
        </div>
      </div>

      <div class="packs-config__field">
        <label class="packs-config__label">Disponibilidad horaria</label>
        <p class="packs-config__description">
          Selecciona los días y horarios disponibles para este pack
        </p>

        <div
          v-for="(day, dayIndex) in weekDays"
          :key="dayIndex"
          class="packs-config__day"
        >
          <div class="packs-config__day-header">
            <div class="packs-config__switch">
              <input
                class="packs-config__switch-input"
                type="checkbox"
                :id="`day-${packIndex}-${dayIndex}`"
                v-model="pack.disponibilidad[dayIndex].active"
              />
              <label
                class="packs-config__switch-label"
                :for="`day-${packIndex}-${dayIndex}`"
              >
                {{ day }}
              </label>
            </div>
          </div>

          <div
            v-if="pack.disponibilidad[dayIndex].active"
            class="packs-config__time-slots"
          >
            <div
              v-for="(timeSlot, timeIndex) in pack.disponibilidad[dayIndex]
                .timeSlots"
              :key="timeIndex"
              class="packs-config__time-slot"
            >
              <div class="packs-config__time-input">
                <label class="packs-config__time-label">Desde</label>
                <input
                  type="time"
                  class="packs-config__time"
                  v-model="timeSlot.from"
                />
              </div>
              <div class="packs-config__time-input">
                <label class="packs-config__time-label">Hasta</label>
                <input
                  type="time"
                  class="packs-config__time"
                  v-model="timeSlot.to"
                />
              </div>
              <button
                type="button"
                class="packs-config__time-remove"
                @click="
                  removeTimeSlot(
                    pack.disponibilidad[dayIndex].timeSlots,
                    timeIndex
                  )
                "
                title="Eliminar horario"
              >
                ×
              </button>
            </div>

            <button
              type="button"
              class="packs-config__time-add"
              @click="addTimeSlot(pack.disponibilidad[dayIndex].timeSlots)"
            >
              <AtomsIconsPlusCircleIcon size="16" /> Añadir horario
            </button>
          </div>
        </div>
      </div>
    </div>

    <button type="button" class="packs-config__add-pack" @click="addPack">
      + Agregar un pack adicional
    </button>
  </div>
</template>

<script lang="ts" setup>
import { useUdc } from "@/composables/api";
import type { IUdc } from "@/types";

interface TimeSlot {
  from: string;
  to: string;
}

interface DayAvailability {
  active: boolean;
  timeSlots: TimeSlot[];
}

interface Pack {
  especialidad: string;
  procedimiento: string;
  producto: string;
  servicios: string[];
  precio: number;
  disponibilidad: DayAvailability[];
}

interface Props {
  modelValue?: Pack[];
  availableSpecialties?: Array<{ code: string; name: string }>;
}

interface Emits {
  (e: "update:modelValue", value: Pack[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  availableSpecialties: () => [],
});

const emit = defineEmits<Emits>();

const { fetchUdc } = useUdc();

const VALORACION_COST = 25000; // Costo fijo de valoración en colones

const isLoadingProducts = ref<boolean>(false);
const isLoadingServices = ref<boolean>(false);
const isLoadingSpecialties = ref<boolean>(false);

const productos = ref<Array<{ value: string; label: string }>>([]);
const services = ref<IUdc[]>([]);
const selectedService = ref<string>("");

const weekDays = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const specialtiesForDropdown = computed(() => {
  return props.availableSpecialties.map((s) => ({
    value: s.code,
    label: s.name,
  }));
});

const availableServices = computed(() => {
  return services.value.map((s) => ({
    value: s.code,
    label: s.name,
  }));
});

const createEmptyPack = (): Pack => ({
  especialidad: "",
  procedimiento: "",
  producto: "",
  servicios: [],
  precio: 0,
  disponibilidad: weekDays.map(() => ({
    active: false,
    timeSlots: [{ from: "", to: "" }],
  })),
});

const internalPacks = ref<Pack[]>(
  props.modelValue.length > 0 ? [...props.modelValue] : [createEmptyPack()]
);

const getServiceName = (code: string): string => {
  const service = services.value.find((s) => s.code === code);
  return service?.name || code;
};

const addService = (pack: Pack, serviceCode: string): void => {
  if (serviceCode && !pack.servicios.includes(serviceCode)) {
    pack.servicios.push(serviceCode);
    selectedService.value = "";
  }
};

const removeService = (pack: Pack, index: number): void => {
  pack.servicios.splice(index, 1);
};

const loadProducts = async () => {
  try {
    isLoadingProducts.value = true;
    const api = fetchUdc("MEDICAL_PRODUCT", {}, { authRequired: false });
    await api.request();
    const response = api.response.value;

    if (response && response.data) {
      productos.value = response.data.map((item: any) => ({
        value: item.code,
        label: item.name,
      }));
    }
  } catch (error) {
    console.error("Error loading products:", error);
  } finally {
    isLoadingProducts.value = false;
  }
};

const loadServices = async () => {
  try {
    isLoadingServices.value = true;
    const api = fetchUdc("ASSESSMENT_DETAIL", {}, { authRequired: false });
    await api.request();
    const response = api.response.value;

    if (response && response.data) {
      services.value = response.data;
    }
  } catch (error) {
    console.error("Error loading services:", error);
  } finally {
    isLoadingServices.value = false;
  }
};

watch(
  internalPacks,
  (newValue) => {
    emit("update:modelValue", newValue);
  },
  { deep: true }
);

watch(
  () => props.modelValue,
  (newValue) => {
    if (JSON.stringify(newValue) !== JSON.stringify(internalPacks.value)) {
      internalPacks.value =
        newValue.length > 0 ? [...newValue] : [createEmptyPack()];
    }
  }
);

const addPack = (): void => {
  internalPacks.value.push(createEmptyPack());
};

const removePack = (index: number): void => {
  if (internalPacks.value.length > 1) {
    internalPacks.value.splice(index, 1);
  }
};

const addTimeSlot = (timeSlots: TimeSlot[]): void => {
  timeSlots.push({ from: "", to: "" });
};

const removeTimeSlot = (timeSlots: TimeSlot[], index: number): void => {
  if (timeSlots.length > 1) {
    timeSlots.splice(index, 1);
  }
};

onMounted(async () => {
  await Promise.all([loadProducts(), loadServices()]);
});
</script>

<style lang="scss" scoped>
.packs-config {
  @include space-y(1.5rem);

  &__subtitle {
    @include label-base;
    font-weight: 600;
    font-size: 1rem;
    color: #101828;
    margin: 0;
  }

  &__description {
    @include text-base;
    font-size: 0.875rem;
    color: $color-text-muted;
    margin: 0;
  }

  &__pack {
    background-color: #f9fafb;
    border: 1px solid #e4e7ec;
    border-radius: 0.5rem;
    padding: 1.5rem;
    @include space-y(1.25rem);
  }

  &__pack-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  &__pack-title {
    @include label-base;
    font-weight: 600;
    font-size: 1rem;
    color: #344054;
    margin: 0;
  }

  &__pack-remove {
    @include button-base;
    background: none;
    border: 1px solid #f04438;
    color: #f04438;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;

    &:hover {
      background-color: #fef3f2;
    }
  }

  &__field {
    @include space-y(0.5rem);
  }

  &__field-description {
    @include text-base;
    font-size: 0.75rem;
    color: $color-text-muted;
    margin: 0;
    font-style: italic;
  }

  &__label {
    @include label-base;
    font-weight: 600;
    font-size: 0.875rem;
    color: #344054;
    display: block;
  }

  &__input {
    @include input-base;
    width: 100%;
  }

  &__textarea {
    @include input-base;
    width: 100%;
    resize: vertical;
    font-family: inherit;
    min-height: 100px;
  }

  &__price-group {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__price-label {
    @include text-base;
    font-size: 0.875rem;
    color: $color-text-muted;
    font-weight: 500;
  }

  &__price-inputs {
    display: flex;
    gap: 0.5rem;
    flex: 1;
  }

  &__price-input-wrapper {
    position: relative;
    flex: 1;
    max-width: 16rem;
  }

  &__currency-symbol {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    font-weight: 600;
    font-size: 1rem;
    color: #344054;
    pointer-events: none;
  }

  &__price-input--with-symbol {
    padding-left: 2.5rem;
  }

  &__valoracion-info {
    background-color: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 0.5rem;
    padding: 1rem;
    @include space-y(0.5rem);
  }

  &__price-display {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;

    .packs-config__currency-symbol {
      position: static;
      transform: none;
      font-size: 1.25rem;
      color: #0cadbb;
    }
  }

  &__valoracion-price {
    font-weight: 700;
    font-size: 1.5rem;
    color: #0cadbb;
  }

  &__valoracion-note {
    @include text-base;
    font-size: 0.875rem;
    color: #0369a1;
    margin: 0;
    font-style: italic;
  }

  &__services-selector {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  &__add-service-button {
    @include button-base;
    background-color: #7f56d9;
    color: white;
    border: none;
    padding: 0.625rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    white-space: nowrap;

    &:hover:not(:disabled) {
      background-color: #6941c6;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__services-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    background-color: #f9fafb;
    border: 1px solid #e4e7ec;
    border-radius: 0.5rem;
    padding: 0.75rem;
    max-height: 200px;
    overflow-y: auto;
  }

  &__service-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: white;
    border: 1px solid #e4e7ec;
    border-radius: 0.375rem;
    padding: 0.5rem 0.75rem;
    transition: all 0.2s;

    &:hover {
      border-color: #d0d5dd;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    }
  }

  &__service-name {
    @include text-base;
    font-size: 0.875rem;
    color: #344054;
    flex: 1;
  }

  &__service-remove {
    @include button-base;
    background: none;
    border: none;
    color: #f04438;
    padding: 0.25rem;
    border-radius: 0.25rem;
    line-height: 1;
    transition: all 0.2s;

    &:hover {
      background-color: #fef3f2;
    }
  }

  &__day {
    background-color: $white;
    border: 1px solid #e4e7ec;
    border-radius: 0.5rem;
    padding: 1rem;
    @include space-y(0.75rem);
  }

  &__day-header {
    display: flex;
    align-items: center;
  }

  &__switch {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__switch-input {
    width: 2.75rem;
    height: 1.5rem;
    border-radius: 0.75rem;
    border: none;
    background-color: #e4e7ec;
    cursor: pointer;
    appearance: none;
    position: relative;
    transition: background-color 0.2s;

    &:checked {
      background-color: #7f56d9;
    }

    &::before {
      content: "";
      position: absolute;
      width: 1.25rem;
      height: 1.25rem;
      border-radius: 50%;
      background-color: $white;
      top: 0.125rem;
      left: 0.125rem;
      transition: transform 0.2s;
    }

    &:checked::before {
      transform: translateX(1.25rem);
    }
  }

  &__switch-label {
    @include label-base;
    font-weight: 500;
    font-size: 0.875rem;
    color: #344054;
    cursor: pointer;
  }

  &__time-slots {
    @include space-y(0.75rem);
  }

  &__time-slot {
    display: flex;
    gap: 0.75rem;
    align-items: flex-end;
  }

  &__time-input {
    flex: 1;
    @include space-y(0.25rem);
  }

  &__time-label {
    @include label-base;
    font-size: 0.75rem;
    color: $color-text-muted;
    font-weight: 500;
  }

  &__time {
    @include input-base;
    width: 100%;
  }

  &__time-remove {
    @include button-base;
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #f04438;
    padding: 0.5rem;
    border-radius: 0.25rem;
    line-height: 1;

    &:hover {
      background-color: #fef3f2;
    }
  }

  &__time-add {
    @include button-base;
    background: none;
    border: 1px solid #d0d5dd;
    color: #344054;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;

    &:hover {
      background-color: #f9fafb;
    }
  }

  &__add-pack {
    @include button-base;
    background: none;
    border: 1px solid #d0d5dd;
    color: #344054;
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;

    &:hover {
      background-color: #f9fafb;
    }
  }
}
</style>
