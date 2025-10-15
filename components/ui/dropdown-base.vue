<script setup lang="ts">
import { onClickOutside } from "@vueuse/core";

export interface DropdownItem {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface Props {
  items: DropdownItem[];
  modelValue?: string | number;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  noResultsText?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "outline" | "filled";
}

interface Emits {
  (e: "update:modelValue", value: string | number | undefined): void;
  (e: "select", item: DropdownItem): void;
  (e: "clear"): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "Seleccionar opción",
  disabled: false,
  loading: false,
  error: false,
  searchable: false,
  clearable: false,
  noResultsText: "No se encontraron resultados",
  size: "md",
  variant: "default",
});

const emit = defineEmits<Emits>();

const dropdownRef = ref<HTMLElement>();
const searchInputRef = ref<HTMLInputElement>();
const isOpen = ref(false);
const searchText = ref("");

const selectedItem = computed(() => {
  return props.items.find((item) => item.value === props.modelValue);
});

const displayText = computed(() => {
  if (props.searchable && isOpen.value) {
    return searchText.value;
  }
  return selectedItem.value?.label || props.placeholder;
});

const filteredItems = computed(() => {
  if (!props.searchable || !searchText.value.trim()) {
    return props.items;
  }
  return props.items.filter((item) =>
    item.label.toLowerCase().includes(searchText.value.toLowerCase())
  );
});

const canOpen = computed(() => {
  return !props.disabled && !props.loading;
});

const showClearButton = computed(() => {
  return props.clearable && props.modelValue !== undefined && !props.disabled;
});

const toggleDropdown = () => {
  if (!canOpen.value) return;

  isOpen.value = !isOpen.value;

  if (isOpen.value && props.searchable) {
    nextTick(() => {
      searchInputRef.value?.focus();
    });
  }
};

const selectItem = (item: DropdownItem) => {
  if (item.disabled) return;

  emit("update:modelValue", item.value);
  emit("select", item);
  closeDropdown();
};

const clearSelection = (event: Event) => {
  event.stopPropagation();
  emit("update:modelValue", undefined);
  emit("clear");
  searchText.value = "";
};

const closeDropdown = () => {
  isOpen.value = false;
  if (props.searchable) {
    searchText.value = selectedItem.value?.label || "";
  }
};

const handleSearchInput = () => {
  if (!isOpen.value) {
    isOpen.value = true;
  }
};

const handleInputClick = (event: Event) => {
  if (props.searchable) {
    event.stopPropagation();
    if (!isOpen.value && canOpen.value) {
      isOpen.value = true;
    }
  }
};

watch(
  () => props.modelValue,
  () => {
    if (props.searchable) {
      searchText.value = selectedItem.value?.label || "";
    }
  }
);

onMounted(() => {
  if (props.searchable) {
    searchText.value = selectedItem.value?.label || "";
  }
});

onClickOutside(dropdownRef, () => {
  closeDropdown();
});
</script>

<template>
  <div
    ref="dropdownRef"
    class="dropdown"
    :class="[
      `dropdown--${size}`,
      `dropdown--${variant}`,
      { 'dropdown--disabled': disabled },
    ]"
  >
    <div
      class="dropdown__toggle"
      :class="{
        'dropdown__toggle--active': isOpen,
        'dropdown__toggle--disabled': disabled,
        'dropdown__toggle--loading': loading,
        'dropdown__toggle--error': error,
        'dropdown__toggle--searchable': searchable,
      }"
      @click="toggleDropdown"
    >
      <div v-if="$slots.icon" class="dropdown__icon">
        <slot name="icon" />
      </div>

      <input
        v-if="searchable"
        ref="searchInputRef"
        v-model="searchText"
        type="text"
        class="dropdown__search-input"
        :placeholder="!modelValue ? placeholder : ''"
        :disabled="disabled"
        @input="handleSearchInput"
        @click="handleInputClick"
      />

      <span
        v-else
        class="dropdown__text"
        :class="{ 'dropdown__text--placeholder': !modelValue }"
      >
        {{ displayText }}
      </span>

      <button
        v-if="showClearButton"
        type="button"
        class="dropdown__clear-button"
        @click="clearSelection"
      >
        <slot name="clear-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M12 4L4 12M4 4l8 8"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </slot>
      </button>

      <div
        class="dropdown__arrow"
        :class="{ 'dropdown__arrow--rotated': isOpen }"
      >
        <slot name="arrow">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              stroke-width="1.67"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </slot>
      </div>

      <div v-if="loading" class="dropdown__loading">
        <slot name="loading-icon">
          <svg
            class="dropdown__loading-spinner"
            width="16"
            height="16"
            viewBox="0 0 16 16"
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-dasharray="37.7"
              stroke-dashoffset="37.7"
            >
              <animate
                attributeName="stroke-dashoffset"
                dur="1s"
                values="37.7;0"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </slot>
      </div>
    </div>

    <div class="dropdown__menu" :class="{ 'dropdown__menu--open': isOpen }">
      <div v-if="filteredItems.length === 0" class="dropdown__no-results">
        {{ noResultsText }}
      </div>

      <button
        v-for="item in filteredItems"
        :key="item.value"
        type="button"
        class="dropdown__item"
        :class="{
          'dropdown__item--active': modelValue === item.value,
          'dropdown__item--disabled': item.disabled,
        }"
        :disabled="item.disabled"
        @click="selectItem(item)"
      >
        <span class="dropdown__item-text">{{ item.label }}</span>

        <div v-if="modelValue === item.value" class="dropdown__item-check">
          <slot name="check-icon">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M13.5 4.5L6 12L2.5 8.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </slot>
        </div>
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
$dropdown-border-color: #d0d5dd;
$dropdown-border-radius: 0.5rem;
$dropdown-bg-color: #ffffff;
$dropdown-text-color: #374151;
$dropdown-text-muted: #9ca3af;
$dropdown-hover-bg: #f9fafb;
$dropdown-focus-bg: #f3f4f6;
$dropdown-disabled-bg: #f9fafb;
$dropdown-disabled-color: #98a2b3;
$dropdown-error-color: #dc3545;
$dropdown-primary-color: #7f56d9;
$dropdown-shadow:
  0 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1),
  0 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06);

.dropdown {
  position: relative;
  width: 100%;
  margin: 0;

  &--disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  &--sm {
    .dropdown__toggle {
      min-height: 2.5rem;
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
    }

    .dropdown__text,
    .dropdown__search-input {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
  }

  &--md {
    .dropdown__toggle {
      min-height: 3rem;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      line-height: 1.5rem;
    }

    .dropdown__text,
    .dropdown__search-input {
      font-size: 1rem;
      line-height: 1.5rem;
    }
  }

  &--lg {
    .dropdown__toggle {
      min-height: 3.5rem;
      padding: 1rem 1.25rem;
      font-size: 1.125rem;
      line-height: 1.75rem;
    }

    .dropdown__text,
    .dropdown__search-input {
      font-size: 1.125rem;
      line-height: 1.75rem;
    }
  }

  &--outline {
    .dropdown__toggle {
      background: transparent;
      border: 0.125rem solid $dropdown-primary-color;

      &:hover:not(.dropdown__toggle--disabled) {
        border-color: darken($dropdown-primary-color, 10%);
      }
    }
  }

  &--filled {
    .dropdown__toggle {
      background: $dropdown-primary-color;
      color: #ffffff;
      border: 1px solid $dropdown-primary-color;

      .dropdown__text--placeholder {
        color: rgba(255, 255, 255, 0.7);
      }

      .dropdown__text,
      .dropdown__search-input {
        color: #ffffff;

        &::placeholder {
          color: rgba(255, 255, 255, 0.7);
        }
      }

      .dropdown__icon,
      .dropdown__arrow,
      .dropdown__clear-button {
        color: #ffffff;
      }

      &:hover:not(.dropdown__toggle--disabled) {
        background: darken($dropdown-primary-color, 10%);
        border-color: darken($dropdown-primary-color, 10%);
      }
    }
  }

  &__toggle {
    width: 100%;
    min-height: 3rem;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: $dropdown-bg-color;
    border: 1px solid $dropdown-border-color;
    border-radius: $dropdown-border-radius;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;

    &:hover:not(&--disabled) {
      border-color: darken($dropdown-border-color, 10%);
    }

    &:focus-within {
      outline: 2px solid $dropdown-primary-color;
      outline-offset: 2px;
    }

    &--active {
      border-color: $dropdown-primary-color;
    }

    &--disabled {
      background-color: $dropdown-disabled-bg;
      border-color: $dropdown-border-color;
      color: $dropdown-disabled-color;
      cursor: not-allowed;

      &:hover {
        border-color: $dropdown-border-color;
      }
    }

    &--loading {
      pointer-events: none;
    }

    &--error {
      border-color: $dropdown-error-color;

      &:hover,
      &:focus-within {
        border-color: $dropdown-error-color;
      }
    }

    &--searchable {
      padding-right: 3.125rem;
    }
  }

  &__icon {
    flex-shrink: 0;
    color: $dropdown-text-muted;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
  }

  &__search-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: $dropdown-text-color;
    font-size: 1rem;
    line-height: 1.5rem;
    min-width: 0;
    font-family: inherit;
    padding: 0;
    margin: 0;

    &::placeholder {
      color: $dropdown-text-muted;
    }

    &:disabled {
      color: $dropdown-disabled-color;
      cursor: not-allowed;
    }
  }

  &__text {
    flex: 1;
    font-size: 1rem;
    line-height: 1.5rem;
    color: $dropdown-text-color;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &--placeholder {
      color: $dropdown-text-muted;
    }
  }

  &__clear-button {
    position: absolute;
    right: 2.5rem;
    width: 1.5rem;
    height: 1.5rem;
    border: none;
    background: transparent;
    color: $dropdown-text-muted;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.25rem;
    transition: all 0.2s ease;
    flex-shrink: 0;
    padding: 0;

    &:hover {
      background-color: $dropdown-focus-bg;
      color: $dropdown-text-color;
    }

    &:focus {
      outline: 2px solid $dropdown-primary-color;
      outline-offset: 2px;
    }
  }

  &__arrow {
    position: absolute;
    right: 1rem;
    width: 1.25rem;
    height: 1.25rem;
    color: $dropdown-text-muted;
    transition: transform 0.2s ease;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;

    &--rotated {
      transform: rotate(180deg);
    }
  }

  &__loading {
    position: absolute;
    right: 2.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
  }

  &__loading-spinner {
    color: $dropdown-primary-color;
    animation: dropdown-spin 1s linear infinite;
  }

  &__menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1000;
    background: $dropdown-bg-color;
    border: 1px solid $dropdown-border-color;
    border-radius: $dropdown-border-radius;
    box-shadow: $dropdown-shadow;
    max-height: 16rem;
    overflow-y: auto;
    margin-top: 0.25rem;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-0.625rem);
    transition: all 0.2s ease;

    &--open {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    &::-webkit-scrollbar {
      width: 0.5rem;
    }

    &::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: $dropdown-border-radius;
    }

    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 0.25rem;

      &:hover {
        background: #94a3b8;
      }
    }
  }

  &__no-results {
    padding: 1rem;
    font-size: 0.875rem;
    color: $dropdown-text-muted;
    font-style: italic;
    text-align: center;
  }

  &__item {
    width: 100%;
    padding: 0.75rem 1rem;
    text-align: left;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 1rem;
    line-height: 1.5rem;
    color: $dropdown-text-color;
    transition: background-color 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    font-family: inherit;

    &:hover:not(&--disabled) {
      background-color: $dropdown-hover-bg;
    }

    &:focus {
      outline: none;
      background-color: $dropdown-focus-bg;
    }

    &--active {
      background-color: $dropdown-hover-bg;
      color: $dropdown-text-color;
      font-weight: 500;
    }

    &--disabled {
      color: $dropdown-disabled-color;
      cursor: not-allowed;
      opacity: 0.5;

      &:hover {
        background-color: transparent;
      }
    }

    &:first-child {
      border-top-left-radius: calc(#{$dropdown-border-radius} - 2px);
      border-top-right-radius: calc(#{$dropdown-border-radius} - 2px);
    }

    &:last-child {
      border-bottom-left-radius: calc(#{$dropdown-border-radius} - 2px);
      border-bottom-right-radius: calc(#{$dropdown-border-radius} - 2px);
    }
  }

  &__item-text {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
  }

  &__item-check {
    color: $dropdown-primary-color;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
  }
}

@keyframes dropdown-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
