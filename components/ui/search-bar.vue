<script lang="ts" setup>
interface Props {
  modelValue?: string;
  placeholder?: string;
  ariaLabel?: string;
  disabled?: boolean;
  iconSize?: string | number;
  maxWidth?: string;
  fullWidth?: boolean;
}

interface Emits {
  (e: "update:modelValue", value: string): void;
  (e: "search", value: string): void;
  (e: "clear"): void;
  (e: "focus"): void;
  (e: "blur"): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "Buscar",
  ariaLabel: "Campo de búsqueda",
  disabled: false,
  iconSize: "20",
  maxWidth: "none",
  fullWidth: false,
});

const emit = defineEmits<Emits>();

const searchInput: Ref<HTMLInputElement | undefined> = ref();
const clearButton: Ref<HTMLButtonElement | undefined> = ref();
const internalValue: Ref<string> = ref(props.modelValue);
const isFocused: Ref<boolean> = ref(false);

const handleInput = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  internalValue.value = target.value;
  emit("update:modelValue", target.value);
};

const handleSearch = (): void => {
  emit("search", internalValue.value);
};

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key === "Enter") {
    event.preventDefault();
    handleSearch();
  }
  if (event.key === "Escape" && internalValue.value) {
    event.preventDefault();
    clearSearch();
  }
};

const clearSearch = (): void => {
  internalValue.value = "";
  emit("update:modelValue", "");
  emit("clear");
  searchInput.value?.focus();
};

const handleFocus = (): void => {
  isFocused.value = true;
  emit("focus");
};

const handleBlur = (): void => {
  isFocused.value = false;
  emit("blur");
};

const focus = (): void => {
  searchInput.value?.focus();
};

watch(
  () => props.modelValue,
  (newValue) => {
    internalValue.value = newValue;
  }
);

defineExpose({
  focus,
  clear: clearSearch,
});
</script>

<template>
  <div
    class="search-input-wrapper"
    role="search"
    :style="{ maxWidth: fullWidth ? '100%' : maxWidth }"
  >
    <div class="search-input" :class="{ 'search-input--focused': isFocused }">
      <label :for="`search-input-${$.uid}`" class="sr-only">
        {{ ariaLabel }}
      </label>

      <span
        class="search-input__icon search-input__icon--search"
        aria-hidden="true"
      >
        <AtomsIconsSearchIcon :size="iconSize" />
      </span>

      <input
        :id="`search-input-${$.uid}`"
        ref="searchInput"
        v-model="internalValue"
        type="search"
        class="search-input__field"
        :placeholder="placeholder"
        :aria-label="ariaLabel"
        :disabled="disabled"
        :aria-describedby="internalValue ? `clear-button-${$.uid}` : undefined"
        autocomplete="off"
        role="searchbox"
        @input="handleInput"
        @keydown="handleKeydown"
        @focus="handleFocus"
        @blur="handleBlur"
      />

      <button
        v-if="internalValue && !disabled"
        :id="`clear-button-${$.uid}`"
        ref="clearButton"
        type="button"
        class="search-input__clear"
        :aria-label="`Limpiar búsqueda: ${internalValue}`"
        @click="clearSearch"
        @keydown.enter.prevent="clearSearch"
        @keydown.space.prevent="clearSearch"
      >
        <span class="search-input__clear-icon" aria-hidden="true"> × </span>
      </button>
    </div>

    <div class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      <span v-if="internalValue">
        {{ internalValue.length }} caracteres ingresados
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sr-only {
  @include visually-hidden;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  background-color: $white;
  border-radius: 0.5rem;
  border: 1px solid #f1f3f7;
  box-shadow: 0px 1px 2px 0px #1018280d;
  transition: all 0.2s ease;

  &--focused {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
    border-color: $color-primary;
    box-shadow: 0 0 0 3px rgba($color-primary, 0.2);
  }

  &--full-width {
    max-width: 100%;
  }

  &__icon {
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-shrink: 0;
    color: $color-text-muted;
    transition: color 0.2s ease;
    pointer-events: none;

    &--search {
      left: 0.75rem;
      width: 1.25rem;
      height: 1.25rem;

      @include respond-to-max(sm) {
        margin-left: 0.75rem;
      }
    }
  }

  &__field {
    padding: 0.625rem 2.5rem 0.625rem 2.5rem;
    font-weight: 300;
    font-size: 0.875rem;
    color: #6d758f;
    border-radius: 8px;
    border: 1px solid #f1f3f7;
    box-shadow: 0 1px 2px #1018280d;
    background-color: #fff;
    width: 100%;
    transition: all 0.2s ease;

    @include respond-to(sm) {
      font-size: 1rem;
      padding: 0.75rem 3rem 0.75rem 2.5rem;
    }

    &:focus {
      outline: none;
      border-color: transparent;
      box-shadow: none;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
      background-color: #f5f5f5;
    }

    &::placeholder {
      color: #9ca3af;

      @include respond-to-max(sm) {
        font-size: 0.875rem;
      }
    }

    &::-webkit-search-decoration,
    &::-webkit-search-cancel-button,
    &::-webkit-search-results-button,
    &::-webkit-search-results-decoration {
      display: none;
    }
  }

  &__clear {
    position: absolute;
    right: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    background-color: transparent;
    border: none;
    border-radius: 0.25rem;
    color: $color-text-muted;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover {
      background-color: rgba($color-primary, 0.1);
      color: $color-primary;
    }

    &:focus {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
      background-color: rgba($color-primary, 0.1);
      color: $color-primary;
    }

    &:active {
      transform: scale(0.95);
    }

    &-icon {
      font-size: 1.25rem;
      line-height: 1;
      font-weight: 400;
    }
  }
}

@media (prefers-contrast: high) {
  .search-input {
    border-width: 2px;

    &--focused {
      outline-width: 3px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .search-input,
  .search-input__icon,
  .search-input__field,
  .search-input__clear {
    transition: none;
  }
}
</style>
