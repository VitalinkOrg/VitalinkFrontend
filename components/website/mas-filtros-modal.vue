<script setup lang="ts">
import {
  computed,
  nextTick,
  onMounted,
  onUnmounted,
  reactive,
  ref,
  watch,
} from "vue";

interface ISupplierParams {
  specialty_code?: string;
  procedure_code?: string;
  min_stars?: number;
  province?: string;
  min_price?: number;
  max_price?: number;
  size?: number;
  page?: number;
}

interface Props {
  filters?: Partial<ISupplierParams>;
  clearFilters?: () => void;
}

const MAX_RATING = 5;
const MIN_PRICE_VALUE = 0;
const BLUR_DELAY_MS = 200;

const PROVINCES: readonly string[] = [
  "San José",
  "Alajuela",
  "Cartago",
  "Heredia",
  "Guanacaste",
  "Puntarenas",
  "Limón",
] as const;

const RATING_LABELS: Readonly<Record<number, string>> = {
  1: "Una estrella",
  2: "Dos estrellas",
  3: "Tres estrellas",
  4: "Cuatro estrellas",
  5: "Cinco estrellas",
};

const props = withDefaults(defineProps<Props>(), {
  filters: () => ({}),
  clearFilters: () => {},
});

const emit = defineEmits<{
  "filters-changed": [filters: ISupplierParams];
  close: [];
}>();

const isOpen = ref<boolean>(false);
const rating = ref<number>(0);
const place = ref<string>("");
const showProvinceDropdown = ref<boolean>(false);
const hasError = ref<boolean>(false);
const errorMessage = ref<string>("");

const modalDialogRef = ref<HTMLElement | null>(null);
const placeInputRef = ref<HTMLInputElement | null>(null);

const localFilters = reactive<ISupplierParams>({
  min_stars: 0,
  province: "",
  min_price: undefined,
  max_price: undefined,
});

const filteredProvinces = computed<string[]>(() => {
  if (!place.value) return [...PROVINCES];

  const searchTerm = place.value.toLowerCase();
  return PROVINCES.filter((province) =>
    province.toLowerCase().includes(searchTerm),
  );
});

const isValidPriceRange = computed<boolean>(() => {
  if (localFilters.min_price != null && localFilters.max_price != null) {
    return localFilters.min_price <= localFilters.max_price;
  }
  return true;
});

const getRatingLabel = (value: number): string => {
  return RATING_LABELS[value] ?? "";
};

const buildFiltersPayload = (): ISupplierParams => {
  const payload: ISupplierParams = {};

  if (rating.value > 0) {
    payload.min_stars = rating.value;
  }
  if (place.value.trim()) {
    payload.province = place.value.trim();
  }
  if (localFilters.min_price != null && localFilters.min_price >= 0) {
    payload.min_price = localFilters.min_price;
  }
  if (localFilters.max_price != null && localFilters.max_price >= 0) {
    payload.max_price = localFilters.max_price;
  }

  return payload;
};

const clearError = (): void => {
  hasError.value = false;
  errorMessage.value = "";
};

const setError = (message: string): void => {
  hasError.value = true;
  errorMessage.value = message;
};

watch(place, (newVal: string) => {
  localFilters.province = newVal;
  showProvinceDropdown.value = true;
});

watch(rating, (newVal: number) => {
  localFilters.min_stars = newVal;
});

watch(isOpen, async (newVal: boolean) => {
  if (newVal) {
    document.body.setAttribute("aria-hidden", "true");
    await nextTick();

    try {
      const firstFocusable = modalDialogRef.value?.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      firstFocusable?.focus();
    } catch {
      // Focus fallback silently handled
    }
  } else {
    document.body.removeAttribute("aria-hidden");
  }
});

const handleOpenModal = (): void => {
  clearError();
  isOpen.value = true;
};

const handleCloseModal = (): void => {
  isOpen.value = false;
  emit("close");
};

const handleSubmitFilters = (): void => {
  try {
    clearError();

    if (!isValidPriceRange.value) {
      setError("El precio mínimo no puede ser mayor al precio máximo.");
      return;
    }

    const payload = buildFiltersPayload();
    emit("filters-changed", payload);
    isOpen.value = false;
  } catch (error) {
    setError("Ocurrió un error al aplicar los filtros. Intente de nuevo.");
    console.error("Error submitting filters:", error);
  }
};

const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.key === "Escape" && isOpen.value) {
    handleCloseModal();
  }
};

const handleSetRating = (value: number): void => {
  if (value < 1 || value > MAX_RATING) return;
  rating.value = value === rating.value ? 0 : value;
};

const handleSelectProvince = (province: string): void => {
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
  }, BLUR_DELAY_MS);
};

const handleResetFilters = (): void => {
  rating.value = 0;
  place.value = "";
  clearError();

  Object.assign(localFilters, {
    min_stars: 0,
    province: "",
    min_price: undefined,
    max_price: undefined,
  });

  props.clearFilters?.();
};

const initializeFromProps = (): void => {
  try {
    if (!props.filters) return;

    const { min_stars, province, min_price, max_price } = props.filters;

    Object.assign(localFilters, {
      min_stars: min_stars ?? 0,
      province: province ?? "",
      min_price: min_price ?? undefined,
      max_price: max_price ?? undefined,
    });

    rating.value = min_stars ?? 0;
    place.value = province ?? "";
  } catch (error) {
    console.error("Error initializing filters from props:", error);
    setError("No se pudieron cargar los filtros previos.");
  }
};

onMounted(() => {
  document.addEventListener("keydown", handleKeyDown);
  initializeFromProps();
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
});

defineExpose({
  openModal: handleOpenModal,
  closeModal: handleCloseModal,
  resetFilters: handleResetFilters,
});
</script>

<template>
  <div class="filter-modal">
    <button
      type="button"
      class="filter-modal__trigger"
      :aria-expanded="isOpen"
      aria-haspopup="dialog"
      aria-controls="filter-modal-dialog"
      @click="handleOpenModal"
    >
      <AtomsIconsListFilterIcon size="20" aria-hidden="true" />
      <span>Más Filtros</span>
    </button>

    <AtomsModalBase :is-open="isOpen" size="large" @close="handleCloseModal">
      <template #title>
        <h2 id="filter-modal-title" class="filter-modal__title">Filtros</h2>
      </template>

      <form
        class="filter-modal__form"
        novalidate
        @submit.prevent="handleSubmitFilters"
      >
        <div class="filter-modal__content" ref="modalDialogRef">
          <div
            v-if="hasError"
            class="filter-modal__error"
            role="alert"
            aria-live="assertive"
          >
            <p class="filter-modal__error-text">{{ errorMessage }}</p>
            <button
              type="button"
              class="filter-modal__error-dismiss"
              aria-label="Cerrar mensaje de error"
              @click="clearError"
            >
              ✕
            </button>
          </div>

          <section
            class="filter-modal__section"
            aria-label="Opciones de filtrado"
          >
            <div class="filter-field">
              <label class="filter-field__label" id="rating-label">
                Valoraciones
              </label>
              <div
                class="rating-selector"
                role="radiogroup"
                aria-labelledby="rating-label"
              >
                <button
                  v-for="n in MAX_RATING"
                  :key="n"
                  type="button"
                  role="radio"
                  class="rating-selector__star"
                  :class="{ 'rating-selector__star--selected': n <= rating }"
                  :aria-checked="n === rating"
                  :aria-label="`${getRatingLabel(n)} - ${n <= rating ? 'seleccionado' : 'no seleccionado'}`"
                  @click="handleSetRating(n)"
                >
                  <Icon
                    :name="n <= rating ? 'fa6-solid:star' : 'fa6-regular:star'"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </div>

            <div class="filter-field">
              <label for="place-input" class="filter-field__label">
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
                    id="place-input"
                    type="text"
                    class="filter-field__input filter-field__input--with-icon"
                    v-model="place"
                    placeholder="Ciudad o provincia"
                    aria-describedby="place-help"
                    aria-autocomplete="list"
                    :aria-expanded="
                      showProvinceDropdown && filteredProvinces.length > 0
                    "
                    aria-controls="province-listbox"
                    autocomplete="off"
                    @input="handlePlaceInput"
                    @focus="handlePlaceFocus"
                    @blur="handlePlaceBlur"
                  />
                </div>

                <ul
                  v-if="showProvinceDropdown && filteredProvinces.length > 0"
                  id="province-listbox"
                  class="autocomplete__list"
                  role="listbox"
                  aria-label="Provincias disponibles"
                >
                  <li
                    v-for="province in filteredProvinces"
                    :key="province"
                    class="autocomplete__item"
                    role="option"
                    :aria-selected="place === province"
                    @click="handleSelectProvince(province)"
                  >
                    {{ province }}
                  </li>
                </ul>

                <div
                  v-else-if="
                    showProvinceDropdown && filteredProvinces.length === 0
                  "
                  class="autocomplete__empty"
                  role="status"
                  aria-live="polite"
                >
                  No se encontraron resultados
                </div>
              </div>
              <span id="place-help" class="visually-hidden">
                Ingrese el nombre de una ciudad o provincia para filtrar
                resultados
              </span>
            </div>

            <hr
              class="filter-modal__divider"
              role="separator"
              aria-hidden="true"
            />

            <fieldset class="filter-field__fieldset">
              <legend class="filter-field__label">Rango de precios</legend>
              <p id="price-help" class="filter-field__description">
                Agregue un precio mínimo y un precio máximo por el que esté
                dispuesto a pagar el servicio
              </p>
              <div class="price-range">
                <div class="price-range__wrapper">
                  <label for="min-price" class="visually-hidden">
                    Precio mínimo
                  </label>
                  <input
                    id="min-price"
                    type="number"
                    class="filter-field__input filter-field__input--price"
                    :class="{
                      'filter-field__input--invalid': !isValidPriceRange,
                    }"
                    placeholder="Mínimo"
                    v-model.number="localFilters.min_price"
                    :min="MIN_PRICE_VALUE"
                    aria-describedby="price-help price-error"
                  />
                </div>
                <span class="price-range__separator" aria-hidden="true">–</span>
                <div class="price-range__wrapper">
                  <label for="max-price" class="visually-hidden">
                    Precio máximo
                  </label>
                  <input
                    id="max-price"
                    type="number"
                    class="filter-field__input filter-field__input--price"
                    :class="{
                      'filter-field__input--invalid': !isValidPriceRange,
                    }"
                    placeholder="Máximo"
                    v-model.number="localFilters.max_price"
                    :min="MIN_PRICE_VALUE"
                    aria-describedby="price-help price-error"
                  />
                </div>
              </div>
              <p
                v-if="!isValidPriceRange"
                id="price-error"
                class="filter-field__error"
                role="alert"
              >
                El precio mínimo no puede ser mayor al precio máximo.
              </p>
            </fieldset>
          </section>
        </div>
      </form>

      <template #footer>
        <div class="filter-modal__actions">
          <button
            type="button"
            class="filter-modal__button filter-modal__button--outline"
            @click="handleCloseModal"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="filter-modal__button filter-modal__button--primary"
            :disabled="!isValidPriceRange"
            @click="handleSubmitFilters"
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
    align-items: center;
    border-radius: 6.56375rem;
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
    cursor: pointer;
    transition: border-color 0.2s ease;

    &:hover {
      border-color: #d1d5db;
    }

    &:focus-visible {
      outline: 0.125rem solid $primary-aqua;
      outline-offset: 0.125rem;
    }
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

  &__section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__divider {
    border: none;
    border-top: 0.0625rem solid #e5e7eb;
    margin: 0.75rem 0;
  }

  &__error {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1rem;
    margin-bottom: 1rem;
    background-color: #fef2f2;
    border: 0.0625rem solid #fecaca;
    border-radius: 0.5rem;
  }

  &__error-text {
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: #991b1b;
    margin: 0;
  }

  &__error-dismiss {
    background: none;
    border: none;
    color: #991b1b;
    cursor: pointer;
    padding: 0.25rem;
    font-size: 0.875rem;
    line-height: 1;
    border-radius: 0.25rem;

    &:focus-visible {
      outline: 0.125rem solid $primary-aqua;
      outline-offset: 0.125rem;
    }
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

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
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

@media (prefers-reduced-motion: reduce) {
  .rating-selector__star {
    transition: none;

    &:hover,
    &:active {
      transform: none;
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
    background: #ffffff;
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
    margin: 0.25rem 0 0;
  }

  &__item {
    padding: 0.75rem 1rem;
    cursor: pointer;
    transition: background-color 0.15s ease;
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
    background: #ffffff;
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

  &__fieldset {
    border: none;
    padding: 0;
    margin: 0;
  }

  &__input {
    @include input-base;
    width: 100%;

    &--with-icon {
      padding-left: 2.5rem;
    }

    &--invalid {
      border-color: #dc2626;

      &:focus {
        border-color: #dc2626;
        box-shadow: 0 0 0 0.125rem rgba(220, 38, 38, 0.2);
      }
    }
  }

  &__error {
    font-size: 0.8125rem;
    line-height: 1.125rem;
    color: #dc2626;
    margin: 0.375rem 0 0;
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

.visually-hidden {
  position: absolute;
  width: 0.0625rem;
  height: 0.0625rem;
  padding: 0;
  margin: -0.0625rem;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
