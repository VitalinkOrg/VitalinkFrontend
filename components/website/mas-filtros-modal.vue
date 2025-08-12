<script setup>
import axios from "axios";
import { nextTick, onMounted, onUnmounted, reactive, ref, watch } from "vue";

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
  clearFilters: {
    type: Function,
    default: () => {},
  },
});

const emit = defineEmits(["search", "close"]);

const open = ref(false);
const specialties = ref([]);
const rating = ref(0);
const place = ref("");
const selectedSpecialty = ref("");
const autocomplete = ref(null);
const modalDialog = ref(null);

const localFilters = reactive({
  lugar: "",
  valoracion: 0,
  disponibilidad: [],
  min: null,
  max: null,
  entity: "",
});

watch(place, (newVal) => {
  localFilters.lugar = newVal;
});

watch(rating, (newVal) => {
  localFilters.valoracion = newVal;
});

watch(open, async (newVal) => {
  if (newVal) {
    document.body.setAttribute("aria-hidden", "true");
    await nextTick();
    const firstFocusable = modalDialog.value?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (firstFocusable) {
      firstFocusable.focus();
    }
  } else {
    document.body.removeAttribute("aria-hidden");
  }
});

const openConfirmationModal = () => {
  open.value = true;
};

const closeModal = () => {
  open.value = false;
  emit("close");
};

const searchFilters = () => {
  const combinedFilters = {
    ...props.filters,
    ...localFilters,
  };

  emit("search", combinedFilters);
  open.value = false;
};

const handleKeyDown = (event) => {
  if (event.key === "Escape" && open.value) {
    closeModal();
  }
};

const getSpecialties = async () => {
  try {
    const config = useRuntimeConfig();
    const token = useCookie("token");

    const authHeader = token.value ? { Authorization: token.value } : undefined;

    const response = await axios.get(
      config.public.API_BASE_URL + "/specialties",
      {
        headers: authHeader,
      }
    );

    specialties.value = response.data.data;
    localFilters.disponibilidad = response.data.data;
  } catch (e) {
    console.error("Error fetching specialties:", e);
  }
};

const initAutocomplete = () => {
  const input = document.getElementById("placeInput");
  if (!input || !window.google) return;

  autocomplete.value = new google.maps.places.Autocomplete(input, {
    fields: ["address_components", "geometry", "formatted_address"],
  });

  autocomplete.value.addListener("place_changed", () => {
    const selectedPlace = autocomplete.value.getPlace();
    if (selectedPlace.geometry) {
      place.value = selectedPlace.formatted_address || input.value;
    } else {
      place.value = input.value;
    }
  });
};

const setRating = (value) => {
  rating.value = value;
};

const getRatingLabel = (ratingValue) => {
  const labels = {
    1: "Una estrella",
    2: "Dos estrellas",
    3: "Tres estrellas",
    4: "Cuatro estrellas",
    5: "Cinco estrellas",
  };
  return labels[ratingValue] || "";
};

const resetFilters = () => {
  rating.value = 0;
  place.value = "";
  selectedSpecialty.value = "";
  Object.assign(localFilters, {
    lugar: "",
    valoracion: 0,
    min: null,
    max: null,
    entity: "",
  });
  props.clearFilters();
};

onMounted(() => {
  getSpecialties();
  initAutocomplete();
  document.addEventListener("keydown", handleKeyDown);

  // Inicializar filtros locales con los props
  if (props.filters) {
    Object.assign(localFilters, props.filters);
    rating.value = props.filters.valoracion || 0;
    place.value = props.filters.lugar || "";
  }
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyDown);
  if (autocomplete.value) {
    google.maps.event.clearInstanceListeners(autocomplete.value);
  }
});

defineExpose({
  openModal: openConfirmationModal,
  closeModal,
  resetFilters,
});
</script>

<template>
  <div>
    <!-- Trigger Button -->
    <button
      @click="openConfirmationModal"
      class="filter-trigger"
      type="button"
      :aria-expanded="open"
      aria-haspopup="dialog"
      aria-controls="filter-modal"
    >
      <AtomsIconsListFilterIcon size="20" aria-hidden="true" />
      <span>Más Filtros</span>
    </button>

    <!-- Modal Backdrop -->
    <Teleport to="body">
      <div
        v-if="open"
        class="modal"
        :class="{ 'modal--open': open }"
        @click.self="closeModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
        id="filter-modal"
      >
        <div class="modal__dialog" ref="modalDialog" @click.stop>
          <div class="modal__content">
            <header class="modal__header">
              <h1 class="modal__title" id="modal-title">Filtros de búsqueda</h1>
              <p class="modal__description sr-only" id="modal-description">
                Configure los filtros para refinar su búsqueda de especialistas
                médicos
              </p>
              <button
                type="button"
                class="modal__close"
                @click="closeModal"
                aria-label="Cerrar modal de filtros"
              >
                <span aria-hidden="true">
                  <AtomsIconsXIcon size="24" />
                </span>
              </button>
            </header>

            <form @submit.prevent="searchFilters" class="modal__form">
              <div class="modal__body">
                <div class="filter-section">
                  <div class="form-field">
                    <div class="form-field__group">
                      <span class="form-field__label form-field__group--label"
                        >Valoraciones</span
                      >
                      <div
                        class="rating"
                        role="radiogroup"
                        aria-label="Seleccione valoración mínima"
                      >
                        <button
                          v-for="n in 5"
                          :key="n"
                          type="button"
                          class="rating__star"
                          :class="{ 'rating__star--active': n <= rating }"
                          @click="setRating(n)"
                          :aria-label="`${getRatingLabel(n)} - ${n <= rating ? 'seleccionado' : 'no seleccionado'}`"
                          :aria-pressed="n <= rating"
                          role="radio"
                          :aria-checked="n === rating"
                        >
                          <Icon
                            :name="
                              n <= rating
                                ? 'fa6-solid:star'
                                : 'fa6-regular:star'
                            "
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div class="form-field__group">
                    <label
                      for="placeInput"
                      class="form-field__label form-field__group--label"
                    >
                      Filtrar por lugar
                    </label>
                    <input
                      type="text"
                      class="form-field__input"
                      id="placeInput"
                      v-model="place"
                      placeholder="Ciudad o provincia"
                      aria-describedby="place-help"
                    />
                  </div>

                  <div class="form-field__group">
                    <label
                      for="disponibilidad"
                      class="form-field__label form-field__group--label"
                    >
                      Disponibilidad de citas
                    </label>
                    <select
                      id="disponibilidad"
                      class="form-field__select"
                      v-model="selectedSpecialty"
                      aria-describedby="specialty-help"
                    >
                      <option value="" disabled>Seleccione especialidad</option>
                      <option
                        v-for="specialty in localFilters.disponibilidad"
                        :key="specialty.code"
                        :value="specialty.code"
                      >
                        {{ specialty.name }}
                      </option>
                    </select>
                  </div>

                  <hr class="separator" role="separator" />

                  <fieldset class="form-field__fieldset">
                    <legend class="form-field__label">Rango de precios</legend>
                    <p class="form-field__description">
                      Agregue un precio mínimo y un precio máximo por el que
                      esté dispuesto a pagar el servicio
                    </p>
                    <div class="price-range">
                      <div class="price-range__field">
                        <label for="min-price" class="sr-only"
                          >Precio mínimo</label
                        >
                        <input
                          type="number"
                          class="form-field__input"
                          placeholder="Mínimo"
                          id="min-price"
                          v-model.number="localFilters.min"
                          min="0"
                          aria-describedby="price-help"
                        />
                      </div>
                      <span class="price-range__separator" aria-hidden="true"
                        >-</span
                      >
                      <div class="price-range__field">
                        <label for="max-price" class="sr-only"
                          >Precio máximo</label
                        >
                        <input
                          type="number"
                          class="form-field__input"
                          placeholder="Máximo"
                          id="max-price"
                          v-model.number="localFilters.max"
                          min="0"
                          aria-describedby="price-help"
                        />
                      </div>
                    </div>
                  </fieldset>

                  <hr class="separator" role="separator" />

                  <fieldset class="form-field__fieldset">
                    <legend class="form-field__label">
                      Servicios Integrales
                    </legend>
                    <div class="radio-group">
                      <label class="radio">
                        <input
                          class="radio__input"
                          type="radio"
                          name="entityType"
                          id="entityType1"
                          value="hospital"
                          v-model="localFilters.entity"
                        />
                        <span class="radio__custom"></span>
                        <span class="radio__label">
                          Por Hospitales que cubran ese procedimiento y la sala
                          de cirugía
                        </span>
                      </label>

                      <label class="radio">
                        <input
                          class="radio__input"
                          type="radio"
                          name="entityType"
                          id="entityType2"
                          value="doctor"
                          v-model="localFilters.entity"
                        />
                        <span class="radio__custom"></span>
                        <span class="radio__label">
                          Por médico o especialista que cubran el procedimiento
                        </span>
                      </label>

                      <label class="radio">
                        <input
                          class="radio__input"
                          type="radio"
                          name="entityType"
                          id="entityType3"
                          value=""
                          v-model="localFilters.entity"
                        />
                        <span class="radio__custom"></span>
                        <span class="radio__label"> Todas las opciones </span>
                      </label>
                    </div>
                  </fieldset>
                </div>
              </div>

              <footer class="modal__footer">
                <button
                  type="button"
                  class="modal__footer--outline-button"
                  @click="closeModal"
                >
                  Cancelar
                </button>
                <button type="submit" class="modal__footer--primary-button">
                  Confirmar
                </button>
              </footer>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.sr-only {
  @include visually-hidden;
}

.filter-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  color: #374151;
  border-radius: 52px;
  padding: 8px 16px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f9fafb;
    border-color: #d1d5db;
  }

  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  &:active {
    transform: translateY(1px);
  }
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1055;
  display: none;
  width: 100%;
  height: 100dvh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;

  &--open {
    opacity: 1;
    visibility: visible;
  }

  &__dialog {
    position: relative;
    width: auto;
    pointer-events: none;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }

  &__content {
    position: relative;
    display: flex;
    flex-direction: column;
    max-width: 719px;
    width: 100%;
    max-height: calc(100vh - 3rem);
    pointer-events: auto;
    background-color: $white;
    background-clip: padding-box;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    outline: 0;
    overflow: hidden;
    box-shadow:
      0px 8px 8px -4px #1018280a,
      0px 20px 24px -4px #1018281a;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $spacing-lg;
    border-bottom: 1px solid #e4e7ec;
    background-color: $white;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    letter-spacing: 0%;
    color: #19213d;
  }

  &__description {
    margin: 0.25rem 0 0;
    color: #6b7280;
    font-size: 0.875rem;
  }

  &__close {
    @include button-base;
    background-color: transparent;
    border: none;
    padding: $spacing-sm;
    color: #353e5c;
    border-radius: 50%;
    margin-left: auto;
    transition: all 0.15s ease-in-out;

    &:hover {
      color: $black;
      background-color: #f5f5f5;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }

  &__footer {
    display: flex;
    gap: 12px;
    padding: 24px;

    &--outline-button {
      @include outline-button;
      width: 100%;
    }

    &--primary-button {
      @include primary-button;
      width: 100%;
    }
  }

  &__form {
    padding: 20px 24px;
    overflow-y: auto;
    flex: 1;
  }
}

.filter-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  &__group {
    display: flex;
    align-items: center;
    gap: 20px;

    &--label {
      width: 100%;
      max-width: 139px;
    }
  }

  &__fieldset {
    border: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
  }

  &__label {
    @include label-base;
    font-weight: 400;
    font-size: 18px;
    line-height: 20px;
    color: #19213d;
    margin: 0;
    padding: 0;
  }

  &__description {
    font-size: 0.875rem;
    color: #6b7280;
    margin-bottom: 1rem;
  }

  &__input,
  &__select {
    @include input-base;
    width: 100%;
  }
}

.rating {
  display: flex;
  gap: 0.25rem;

  &__star {
    background: none;
    border: none;
    font-size: 1.25rem;
    color: #d1d5db;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.1);
    }

    &:focus {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }

    &--active {
      color: #fbbf24;
    }
  }
}

.price-range {
  display: flex;
  align-items: center;
  gap: 1rem;

  &__field {
    flex: 1;
  }

  &__separator {
    color: #6b7280;
    font-weight: 500;
  }
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
}

.radio {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  user-select: none;
  position: relative;
  gap: 12px;

  &:hover .radio__custom {
    border-color: $primary-aqua;
    opacity: 0.8;
  }

  &__input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  &__custom {
    position: relative;
    height: 24px;
    width: 24px;
    min-width: 24px;
    border: 2px solid #6d758f;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    margin-top: 2px;

    &::after {
      content: "";
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: $primary-aqua;
      transform: scale(0);
      transition: transform 0.2s ease;
    }
  }

  &__input:checked + &__custom {
    border-color: $primary-aqua;

    &::after {
      transform: scale(1);
    }
  }

  &__input:focus + &__custom {
    outline: 2px solid $primary-aqua;
    outline-offset: 2px;
  }

  &__label {
    flex: 1;
    font-size: 14px;
    line-height: 1.5;
    color: #374151;
    cursor: pointer;

    &:hover {
      color: #111827;
    }
  }

  &--disabled {
    opacity: 0.6;
    cursor: not-allowed;

    .radio__custom,
    .radio__label {
      cursor: not-allowed;
    }

    &:hover .radio__custom {
      border-color: #6d758f;
      opacity: 0.6;
    }
  }
}
.separator {
  border: none;
  height: 1px;
  background-color: #e4e7ec;
  margin: 0;
}

.button {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  white-space: nowrap;

  &:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &--primary {
    flex: 2;
    background-color: #3b82f6;
    color: white;

    &:hover:not(:disabled) {
      background-color: #2563eb;
    }

    &:active:not(:disabled) {
      background-color: #1d4ed8;
    }
  }

  &--secondary {
    flex: 1;
    background-color: #f3f4f6;
    color: #374151;
    border-color: #d1d5db;

    &:hover:not(:disabled) {
      background-color: #e5e7eb;
      border-color: #9ca3af;
    }

    &:active:not(:disabled) {
      background-color: #d1d5db;
    }
  }

  &--tertiary {
    flex: 1;
    background-color: white;
    color: #6b7280;
    border-color: #d1d5db;

    &:hover:not(:disabled) {
      background-color: #f9fafb;
      color: #374151;
    }

    &:active:not(:disabled) {
      background-color: #f3f4f6;
    }
  }
}

@media (max-width: 768px) {
  .modal {
    &__dialog {
      width: 95%;
      max-height: 95vh;
    }

    &__header,
    &__body,
    &__footer {
      padding: 1rem;
    }

    &__footer {
      flex-direction: column;
    }
  }

  .filter-section {
    padding: 1rem;
  }

  .price-range {
    flex-direction: column;
    align-items: stretch;

    &__separator {
      text-align: center;
    }
  }
}

@media (prefers-contrast: high) {
  .form-field__input,
  .form-field__select {
    border-width: 2px;
  }

  .button {
    border-width: 2px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .modal,
  .modal__dialog,
  .filter-trigger,
  .button,
  .rating__star {
    transition: none;
  }
}
</style>
