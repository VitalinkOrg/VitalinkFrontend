<script setup lang="ts">
import { useUdc } from "@/composables/api";
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from "vue";
import type { DropdownItem } from "../ui/dropdown-base.vue";

interface Specialty {
  code: string;
  name: string;
}

interface FilterData {
  lugar: string;
  valoracion: number;
  disponibilidad: Specialty[];
  min: number | null;
  max: number | null;
  entity: string;
  procedimiento?: string;
  procedures?: Specialty[];
}

interface Props {
  filters?: Partial<FilterData>;
  clearFilters?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  filters: () => ({}),
  clearFilters: () => {},
});

const emit = defineEmits<{
  "filters-changed": [filters: FilterData];
  close: [];
}>();

const { fetchUdc } = useUdc();

const provinces = [
  "San José",
  "Alajuela",
  "Cartago",
  "Heredia",
  "Guanacaste",
  "Puntarenas",
  "Limón",
];

const open = ref<boolean>(false);
const specialties = ref<Specialty[]>([]);
const rating = ref<number>(0);
const place = ref<string>("");
const selectedSpecialty = ref<string>("");
const modalDialog = ref<HTMLElement | null>(null);
const showProvinceDropdown = ref<boolean>(false);
const placeInputRef = ref<HTMLInputElement | null>(null);

const localFilters = reactive<FilterData>({
  lugar: "",
  valoracion: 0,
  disponibilidad: [],
  min: null,
  max: null,
  entity: "",
});

const specialtyDropdownItems = computed<DropdownItem[]>(() => {
  return localFilters.disponibilidad.map((specialty) => ({
    value: specialty.code,
    label: specialty.name,
  }));
});

const filteredProvinces = computed<string[]>(() => {
  if (!place.value) {
    return provinces;
  }
  const searchTerm = place.value.toLowerCase();
  return provinces.filter((province) =>
    province.toLowerCase().includes(searchTerm)
  );
});

watch(place, (newVal: string) => {
  localFilters.lugar = newVal;
  showProvinceDropdown.value = true;
});

watch(rating, (newVal: number) => {
  localFilters.valoracion = newVal;
});

watch(open, async (newVal: boolean) => {
  if (newVal) {
    document.body.setAttribute("aria-hidden", "true");
    await nextTick();

    const firstFocusable = modalDialog.value?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (firstFocusable) {
      firstFocusable.focus();
    }
  } else {
    document.body.removeAttribute("aria-hidden");
  }
});

const openConfirmationModal = (): void => {
  open.value = true;
};

const closeModal = (): void => {
  open.value = false;
  emit("close");
};

const searchFilters = (): void => {
  const combinedFilters: FilterData = {
    ...localFilters,
    disponibilidad: localFilters.disponibilidad,
  };

  emit("filters-changed", combinedFilters);
  open.value = false;
};

const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.key === "Escape" && open.value) {
    closeModal();
  }
};

const handleSpecialtySelect = (item: DropdownItem): void => {
  selectedSpecialty.value = item.value as string;
};

const handleSpecialtyClear = (): void => {
  selectedSpecialty.value = "";
};

const selectProvince = (province: string): void => {
  place.value = province;
  showProvinceDropdown.value = false;
};

const handlePlaceInput = (): void => {
  showProvinceDropdown.value = true;
};

const handlePlaceFocus = (): void => {
  showProvinceDropdown.value = true;
};

const handlePlaceBlur = (): void => {
  setTimeout(() => {
    showProvinceDropdown.value = false;
  }, 200);
};

const getSpecialties = async (): Promise<void> => {
  try {
    const { response, request } = fetchUdc("MEDICAL_SPECIALTY");
    await request();

    if (response.value?.data) {
      specialties.value = response.value.data.map((item) => ({
        code: item.code,
        name: item.name,
      }));
      localFilters.disponibilidad = specialties.value;
    }
  } catch (error) {
    console.error("Error fetching specialties:", error);
  }
};

const setRating = (value: number): void => {
  rating.value = value;
};

const getRatingLabel = (ratingValue: number): string => {
  const labels: Record<number, string> = {
    1: "Una estrella",
    2: "Dos estrellas",
    3: "Tres estrellas",
    4: "Cuatro estrellas",
    5: "Cinco estrellas",
  };
  return labels[ratingValue] || "";
};

const resetFilters = (): void => {
  rating.value = 0;
  place.value = "";
  selectedSpecialty.value = "";

  Object.assign(localFilters, {
    lugar: "",
    valoracion: 0,
    disponibilidad: specialties.value,
    min: null,
    max: null,
    entity: "",
  });

  props.clearFilters?.();
};

onMounted(() => {
  getSpecialties();

  document.addEventListener("keydown", handleKeyDown);

  if (props.filters) {
    Object.assign(localFilters, {
      lugar: props.filters.lugar || "",
      valoracion: props.filters.valoracion || 0,
      min: props.filters.min || null,
      max: props.filters.max || null,
      entity: props.filters.entity || "",
      disponibilidad: props.filters.disponibilidad || [],
    });

    rating.value = props.filters.valoracion || 0;
    place.value = props.filters.lugar || "";
  }
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
});

defineExpose({
  openModal: openConfirmationModal,
  closeModal,
  resetFilters,
});
</script>

<template>
  <div class="filter-modal">
    <button
      @click="openConfirmationModal"
      class="filter-modal__trigger"
      type="button"
      :aria-expanded="open"
      aria-haspopup="dialog"
      aria-controls="filter-modal"
    >
      <AtomsIconsListFilterIcon size="20" aria-hidden="true" />
      <span>Más Filtros</span>
    </button>

    <AtomsModalBase :is-open="open" size="large" @close="closeModal">
      <template #title>
        <h2 class="filter-modal__title" id="modal-title">Filtros</h2>
      </template>

      <form @submit.prevent="searchFilters" class="filter-modal__form">
        <div class="filter-modal__content">
          <section class="filter-modal__section">
            <div class="filter-field">
              <label class="filter-field__label">Valoraciones</label>
              <div
                class="rating-selector"
                role="radiogroup"
                aria-label="Seleccione valoración mínima"
              >
                <button
                  v-for="n in 5"
                  :key="n"
                  type="button"
                  class="rating-selector__star"
                  :class="{ 'rating-selector__star--selected': n <= rating }"
                  @click="setRating(n)"
                  :aria-label="`${getRatingLabel(n)} - ${n <= rating ? 'seleccionado' : 'no seleccionado'}`"
                  :aria-pressed="n <= rating"
                  role="radio"
                  :aria-checked="n === rating"
                >
                  <Icon
                    :name="n <= rating ? 'fa6-solid:star' : 'fa6-regular:star'"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>

            <div class="filter-field">
              <label for="placeInput" class="filter-field__label">
                Filtrar por ciudad o provincia
              </label>
              <div class="autocomplete">
                <div class="input-with-icon">
                  <AtomsIconsLocationIcon
                    class="input-with-icon__icon"
                    aria-hidden="true"
                    size="20"
                  />
                  <input
                    ref="placeInputRef"
                    type="text"
                    class="filter-field__input filter-field__input--with-icon"
                    id="placeInput"
                    v-model="place"
                    placeholder="Ciudad o provincia"
                    aria-describedby="place-help"
                    autocomplete="off"
                    @input="handlePlaceInput"
                    @focus="handlePlaceFocus"
                    @blur="handlePlaceBlur"
                  />
                </div>
                <ul
                  v-if="showProvinceDropdown && filteredProvinces.length > 0"
                  class="autocomplete__list"
                  role="listbox"
                >
                  <li
                    v-for="province in filteredProvinces"
                    :key="province"
                    class="autocomplete__item"
                    role="option"
                    @click="selectProvince(province)"
                  >
                    {{ province }}
                  </li>
                </ul>
                <div
                  v-else-if="
                    showProvinceDropdown && filteredProvinces.length === 0
                  "
                  class="autocomplete__empty"
                >
                  No se encontraron resultados
                </div>
              </div>
              <span id="place-help" class="visually-hidden">
                Ingrese el nombre de una ciudad o provincia para filtrar
                resultados
              </span>
            </div>

            <div class="filter-field">
              <label class="filter-field__label">
                Disponibilidad de citas
              </label>
              <UiDropdownBase
                v-model="selectedSpecialty"
                :items="specialtyDropdownItems"
                :searchable="true"
                placeholder="Próximas semanas"
                no-results-text="No se encontraron resultados"
                @select="handleSpecialtySelect"
                @clear="handleSpecialtyClear"
              />
              <span id="specialty-help" class="visually-hidden">
                Seleccione para filtrar por disponibilidad
              </span>
            </div>

            <hr
              class="filter-modal__divider"
              role="separator"
              aria-hidden="true"
            />

            <fieldset class="filter-field__fieldset">
              <legend class="filter-field__label">Rango de precios</legend>
              <p class="filter-field__description" id="price-help">
                Agregue un precio mínimo y un precio máximo por el que esté
                dispuesto a pagar el servicio
              </p>
              <div class="price-range">
                <div class="price-range__wrapper">
                  <label for="min-price" class="visually-hidden">
                    Precio mínimo
                  </label>
                  <input
                    type="number"
                    class="filter-field__input filter-field__input--price"
                    placeholder="Mínimo"
                    id="min-price"
                    v-model.number="localFilters.min"
                    min="0"
                    aria-describedby="price-help"
                  />
                </div>
                <span class="price-range__separator" aria-hidden="true">
                  -
                </span>
                <div class="price-range__wrapper">
                  <label for="max-price" class="visually-hidden">
                    Precio máximo
                  </label>
                  <input
                    type="number"
                    class="filter-field__input filter-field__input--price"
                    placeholder="Máximo"
                    id="max-price"
                    v-model.number="localFilters.max"
                    min="0"
                    aria-describedby="price-help"
                  />
                </div>
              </div>
            </fieldset>

            <hr
              class="filter-modal__divider"
              role="separator"
              aria-hidden="true"
            />

            <fieldset class="filter-field__fieldset">
              <legend class="filter-field__label">Servicios Integrales</legend>
              <div class="radio-group">
                <div class="radio-group__option">
                  <input
                    class="radio-group__input"
                    type="radio"
                    name="entityType"
                    id="entityType-hospital"
                    value="hospital"
                    v-model="localFilters.entity"
                  />
                  <label for="entityType-hospital" class="radio-group__label">
                    <span class="radio-group__indicator"></span>
                    <span class="radio-group__text">
                      Por Hospitales que cubran ese procedimiento y la sala de
                      cirugía
                    </span>
                  </label>
                </div>

                <div class="radio-group__option">
                  <input
                    class="radio-group__input"
                    type="radio"
                    name="entityType"
                    id="entityType-doctor"
                    value="doctor"
                    v-model="localFilters.entity"
                  />
                  <label for="entityType-doctor" class="radio-group__label">
                    <span class="radio-group__indicator"></span>
                    <span class="radio-group__text">
                      Por médico o especialista que cubran el procedimiento
                    </span>
                  </label>
                </div>

                <div class="radio-group__option">
                  <input
                    class="radio-group__input"
                    type="radio"
                    name="entityType"
                    id="entityType-all"
                    value=""
                    v-model="localFilters.entity"
                  />
                  <label for="entityType-all" class="radio-group__label">
                    <span class="radio-group__indicator"></span>
                    <span class="radio-group__text"> Todas las opciones </span>
                  </label>
                </div>
              </div>
            </fieldset>
          </section>
        </div>
      </form>

      <template #footer>
        <div class="filter-modal__actions">
          <button
            type="button"
            class="filter-modal__button filter-modal__button--outline"
            @click="closeModal"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="filter-modal__button filter-modal__button--primary"
            @click="searchFilters"
          >
            Confirmar
          </button>
        </div>
      </template>
    </AtomsModalBase>
  </div>
</template>

<style lang="scss" scoped>
.filter-modal {
  &__trigger {
    display: flex;
    border-radius: 6.56375rem;
    border-width: 0.065625rem;
    padding: 0.525rem 1.05rem;
    gap: 0.525rem;
    font-weight: 400;
    font-size: 0.875rem;
    line-height: 1.3125rem;
    letter-spacing: 0;
    color: #374151;
    background: #ffffff;
    border: 0.065625rem solid #e5e7eb;
    box-shadow: 0rem 0.065625rem 0.13125rem 0rem #1f293714;
  }

  &__title {
    font-weight: 600;
    font-size: 1.25rem;
    line-height: 1.75rem;
    letter-spacing: 0;
    color: $color-foreground;
  }

  &__form {
    padding: 1.5rem;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    width: 100%;
  }

  &__button {
    &--primary {
      @include primary-button;
      width: 100%;
    }

    &--outline {
      @include outline-button;
      width: 100%;
    }
  }
}

.rating-selector {
  display: flex;
  gap: 0.5rem;
  align-items: center;

  &__star {
    background: none;
    border: none;
    padding: 0.25rem;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #d1d5db;
    font-size: 1.5rem;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.25rem;

    &:hover {
      transform: scale(1.1);
      color: #fbbf24;
    }

    &:focus {
      outline: 0.125rem solid $primary-aqua;
      outline-offset: 0.125rem;
    }

    &:focus:not(:focus-visible) {
      outline: none;
    }

    &:focus-visible {
      outline: 0.125rem solid $primary-aqua;
      outline-offset: 0.125rem;
    }

    &--selected {
      color: #fbbf24;

      &:hover {
        color: #f59e0b;
      }
    }

    &:active {
      transform: scale(0.95);
    }
  }
}

.autocomplete {
  position: relative;
  width: 100%;

  &__list {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 0.0625rem solid #e5e7eb;
    border-radius: 0.5rem;
    margin-top: 0.25rem;
    max-height: 12.5rem;
    overflow-y: auto;
    z-index: 1000;
    box-shadow:
      0 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1),
      0 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06);
    list-style: none;
    padding: 0;
  }

  &__item {
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: $color-foreground;

    &:hover {
      background-color: #f3f4f6;
    }

    &:first-child {
      border-radius: 0.5rem 0.5rem 0 0;
    }

    &:last-child {
      border-radius: 0 0 0.5rem 0.5rem;
    }
  }

  &__empty {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: white;
    border: 0.0625rem solid #e5e7eb;
    border-radius: 0.5rem;
    margin-top: 0.25rem;
    padding: 0.75rem 1rem;
    z-index: 1000;
    box-shadow:
      0 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1),
      0 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06);
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #6d758f;
    text-align: center;
  }
}

.input-with-icon {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;

  &__icon {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #6d758f;
    pointer-events: none;
    z-index: 1;
  }
}

.filter-field {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 1rem;

  &__label {
    font-weight: 400;
    font-size: 1.125rem;
    line-height: 1.25rem;
    letter-spacing: 0;
    color: $color-foreground;
  }

  &__description {
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.25rem;
    letter-spacing: 0;
    color: #6d758f;
  }

  &__input {
    @include input-base;
    width: 100%;

    &--with-icon {
      padding-left: 2.5rem;
    }
  }
}

.price-range {
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &__wrapper {
    flex: 1;
  }

  &__separator {
    font-size: 1rem;
    line-height: 1.5rem;
    color: $color-foreground;
  }
}

.radio-group {
  margin-bottom: 0.75rem;

  &__option {
    display: flex;
    align-items: center;
    margin-bottom: 0.75rem;
  }

  &__text {
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.25rem;
    letter-spacing: 0;
    color: #6d758f;
    margin-left: 0.5rem;
  }

  &__input {
    @include custom-radio;

    &:checked {
      border-color: $primary-aqua;

      &::after {
        background-color: $primary-aqua;
      }
    }
  }
}
</style>
