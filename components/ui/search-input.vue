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
  min-width: 0;
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  background-color: $white;
  border-radius: 0.375rem;
  border: 1px solid #f1f3f7;
  box-shadow: 0px 1px 2px 0px #1018280d;
  transition: all 0.2s ease;

  @media (min-width: 576px) {
    border-radius: 0.5rem;
  }

  &--focused {
    outline: 2px solid $color-primary;
    outline-offset: 1px;
    border-color: $color-primary;
    box-shadow: 0 0 0 2px rgba($color-primary, 0.15);

    @media (min-width: 576px) {
      outline-offset: 2px;
      box-shadow: 0 0 0 3px rgba($color-primary, 0.2);
    }
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
      left: 0.625rem;
      width: 1rem;
      height: 1rem;

      @media (min-width: 576px) {
        left: 0.75rem;
        width: 1.25rem;
        height: 1.25rem;
      }
    }
  }

  &__field {
    padding: 0.5rem 2rem 0.5rem 2rem;
    font-weight: 300;
    font-size: 0.8125rem;
    line-height: 1.25;
    color: #6d758f;
    border-radius: 0.375rem;
    border: 1px solid #f1f3f7;
    box-shadow: 0 1px 2px #1018280d;
    background-color: $white;
    width: 100%;
    min-width: 0;
    transition: all 0.2s ease;

    @media (min-width: 375px) {
      padding: 0.5625rem 2.25rem 0.5625rem 2.125rem;
      font-size: 0.875rem;
    }

    @media (min-width: 576px) {
      padding: 0.625rem 2.75rem 0.625rem 2.5rem;
      font-size: 0.9375rem;
      border-radius: 0.5rem;
    }

    @media (min-width: 768px) {
      padding: 0.75rem 3rem 0.75rem 2.5rem;
      font-size: 1rem;
    }

    &:hover:not(:disabled) {
      border-color: $color-primary;
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
      font-size: 0.8125rem;

      @media (min-width: 375px) {
        font-size: 0.875rem;
      }

      @media (min-width: 576px) {
        font-size: 0.9375rem;
      }

      @media (min-width: 768px) {
        font-size: 1rem;
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
    right: 0.375rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    min-width: 1.25rem;
    padding: 0;
    background-color: transparent;
    border: none;
    border-radius: 0.25rem;
    color: $color-text-muted;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;

    @media (min-width: 576px) {
      right: 0.5rem;
      width: 1.5rem;
      height: 1.5rem;
      min-width: 1.5rem;
    }

    @media (min-width: 768px) {
      right: 0.625rem;
      width: 1.625rem;
      height: 1.625rem;
      min-width: 1.625rem;
    }

    &:hover {
      background-color: rgba($color-primary, 0.1);
      color: $color-primary;
    }

    &:focus {
      outline: 2px solid $color-primary;
      outline-offset: 1px;
      background-color: rgba($color-primary, 0.1);
      color: $color-primary;

      @media (min-width: 576px) {
        outline-offset: 2px;
      }
    }

    &:active {
      transform: scale(0.95);
    }

    &-icon {
      font-size: 1.125rem;
      line-height: 1;
      font-weight: 400;

      @media (min-width: 576px) {
        font-size: 1.25rem;
      }

      @media (min-width: 768px) {
        font-size: 1.375rem;
      }
    }
  }
}

@media (max-width: 374px) {
  .search-input {
    &__field {
      padding: 0.4375rem 1.75rem 0.4375rem 1.875rem;
      font-size: 0.75rem;
    }

    &__icon--search {
      left: 0.5rem;
      width: 0.875rem;
      height: 0.875rem;
    }

    &__clear {
      right: 0.25rem;
      width: 1.125rem;
      height: 1.125rem;
      min-width: 1.125rem;

      &-icon {
        font-size: 1rem;
      }
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

  .search-input__clear:focus {
    outline-width: 3px;
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

@media (hover: none) and (pointer: coarse) {
  .search-input__clear {
    width: 2rem;
    height: 2rem;
    min-width: 2rem;

    &-icon {
      font-size: 1.5rem;
    }
  }
}
</style>
