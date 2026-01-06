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
        <label class="packs-config__label">Nombre del pack</label>
        <input
          type="text"
          class="packs-config__input"
          v-model="pack.name"
          placeholder="Ej: Pack Premium, Pack Básico"
        />
      </div>

      <div class="packs-config__field">
        <label class="packs-config__label">Producto</label>
        <input
          type="text"
          class="packs-config__input"
          v-model="pack.producto"
          placeholder="Nombre del producto o procedimiento"
        />
      </div>

      <div class="packs-config__field">
        <label class="packs-config__label">Servicios incluidos</label>
        <textarea
          rows="3"
          class="packs-config__textarea"
          v-model="pack.servicios"
          placeholder="Ej: Consulta inicial, valoración, seguimiento post-operatorio"
        ></textarea>
      </div>

      <div class="packs-config__field">
        <label class="packs-config__label">Precio del pack</label>
        <div class="packs-config__price-group">
          <span class="packs-config__price-label">Desde</span>
          <div class="packs-config__price-inputs">
            <input
              type="number"
              v-model.number="pack.precio"
              placeholder="0.00"
              min="0"
              step="0.01"
              class="packs-config__price-input"
            />
            <select class="packs-config__currency-select" v-model="pack.moneda">
              <option
                v-for="currency in currencies"
                :key="currency.code"
                :value="currency.code"
              >
                {{ currency.code }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="packs-config__field">
        <label class="packs-config__label">
          Costo de cita de valoración (opcional)
        </label>
        <div class="packs-config__price-inputs">
          <input
            type="number"
            v-model.number="pack.costoValoracion"
            placeholder="0.00"
            min="0"
            step="0.01"
            class="packs-config__price-input"
          />
          <select
            class="packs-config__currency-select"
            v-model="pack.monedaValoracion"
          >
            <option
              v-for="currency in currencies"
              :key="currency.code"
              :value="currency.code"
            >
              {{ currency.code }}
            </option>
          </select>
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
interface TimeSlot {
  from: string;
  to: string;
}

interface DayAvailability {
  active: boolean;
  timeSlots: TimeSlot[];
}

interface Pack {
  name: string;
  producto: string;
  servicios: string;
  precio: number;
  moneda: string;
  costoValoracion: number;
  monedaValoracion: string;
  disponibilidad: DayAvailability[];
}

interface Currency {
  code: string;
  symbol: string;
}

interface Props {
  modelValue?: Pack[];
}

interface Emits {
  (e: "update:modelValue", value: Pack[]): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
});

const emit = defineEmits<Emits>();

const weekDays = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const currencies: Currency[] = [
  { code: "CRC", symbol: "₡" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "GBP", symbol: "£" },
];

const createEmptyPack = (): Pack => ({
  name: "",
  producto: "",
  servicios: "",
  precio: 0,
  moneda: "USD",
  costoValoracion: 0,
  monedaValoracion: "USD",
  disponibilidad: weekDays.map(() => ({
    active: false,
    timeSlots: [{ from: "", to: "" }],
  })),
});

const internalPacks = ref<Pack[]>(
  props.modelValue.length > 0 ? [...props.modelValue] : [createEmptyPack()]
);

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

  &__price-input {
    @include input-base;
    flex: 1;
    max-width: 12rem;
  }

  &__currency-select {
    @include input-base;
    width: 6.25rem;
    cursor: pointer;
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
