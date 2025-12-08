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
const menuRef = ref<HTMLElement>();
const searchInputRef = ref<HTMLInputElement>();
const isOpen = ref(false);
const searchText = ref("");
const menuPosition = ref({ top: 0, left: 0, width: 0 });

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

const updateMenuPosition = () => {
  if (!dropdownRef.value) return;

  const rect = dropdownRef.value.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

  menuPosition.value = {
    top: rect.bottom + scrollTop,
    left: rect.left + scrollLeft,
    width: rect.width,
  };
};

const toggleDropdown = () => {
  if (!canOpen.value) return;

  isOpen.value = !isOpen.value;

  if (isOpen.value) {
    updateMenuPosition();
    if (props.searchable) {
      nextTick(() => {
        searchInputRef.value?.focus();
      });
    }
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
    updateMenuPosition();
  }
};

const handleInputClick = (event: Event) => {
  if (props.searchable) {
    event.stopPropagation();
    if (!isOpen.value && canOpen.value) {
      isOpen.value = true;
      updateMenuPosition();
    }
  }
};

const handleScroll = () => {
  if (isOpen.value) {
    updateMenuPosition();
  }
};

const handleResize = () => {
  if (isOpen.value) {
    updateMenuPosition();
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

watch(isOpen, (newValue) => {
  if (newValue) {
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleResize);
  } else {
    window.removeEventListener("scroll", handleScroll, true);
    window.removeEventListener("resize", handleResize);
  }
});

onMounted(() => {
  if (props.searchable) {
    searchText.value = selectedItem.value?.label || "";
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll, true);
  window.removeEventListener("resize", handleResize);
});

onClickOutside(dropdownRef, (event) => {
  // Check if click is not on the menu
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
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

      <div class="dropdown__content">
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
      </div>

      <div class="dropdown__actions">
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
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="isOpen"
        ref="menuRef"
        class="dropdown__menu dropdown__menu--open"
        :style="{
          top: `${menuPosition.top}px`,
          left: `${menuPosition.left}px`,
          width: `${menuPosition.width}px`,
        }"
      >
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
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
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
      border: 0.125rem solid $color-primary;

      &:hover:not(.dropdown__toggle--disabled) {
        border-color: #6941c6;
      }
    }
  }

  &--filled {
    .dropdown__toggle {
      background: $color-primary;
      color: #ffffff;
      border: 1px solid $color-primary;

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
        background: #6941c6;
        border-color: #6941c6;
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
    background: #ffffff;
    border: 1px solid #d0d5dd;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;

    &:hover:not(&--disabled) {
      border-color: #98a2b3;
    }

    &:focus-within {
      outline: none;
      border-color: #3541b4;
      box-shadow:
        0 0 0 4px rgba(53, 65, 180, 0.2),
        0 0 1.05px rgba(53, 65, 180, 0.4),
        0 1.05px 2.1px rgba(50, 50, 71, 0.1);
    }

    &--active {
      border-color: $color-primary;
    }

    &--disabled {
      background-color: #f9fafb;
      border-color: #d0d5dd;
      color: #98a2b3;
      cursor: not-allowed;

      &:hover {
        border-color: #d0d5dd;
      }
    }

    &--loading {
      pointer-events: none;
    }

    &--error {
      border-color: #dc3545;

      &:hover,
      &:focus-within {
        border-color: #dc3545;
      }
    }
  }

  &__icon {
    flex-shrink: 0;
    color: #9ca3af;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
  }

  &__content {
    flex: 1;
    min-width: 0;
    margin-right: 0.5rem;
  }

  &__search-input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
    color: #374151;
    font-size: 1rem;
    line-height: 1.5rem;
    font-family: inherit;
    padding: 0;
    margin: 0;

    &::placeholder {
      color: #9ca3af;
    }

    &:disabled {
      color: #98a2b3;
      cursor: not-allowed;
    }
  }

  &__text {
    display: block;
    font-size: 1rem;
    line-height: 1.5rem;
    color: #374151;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &--placeholder {
      color: #9ca3af;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    flex-shrink: 0;
  }

  &__clear-button {
    width: 1.5rem;
    height: 1.5rem;
    border: none;
    background: transparent;
    color: #9ca3af;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.25rem;
    transition: all 0.2s ease;
    padding: 0;

    &:hover {
      background-color: #f3f4f6;
      color: #374151;
    }

    &:focus {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }

  &__arrow {
    width: 1.25rem;
    height: 1.25rem;
    color: #9ca3af;
    transition: transform 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;

    &--rotated {
      transform: rotate(180deg);
    }
  }

  &__loading {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
  }

  &__loading-spinner {
    color: $color-primary;
    animation: dropdown-spin 1s linear infinite;
  }

  &__menu {
    position: fixed;
    z-index: 9999;
    background: #ffffff;
    border: 1px solid #d0d5dd;
    border-radius: 0.5rem;
    box-shadow:
      0 0.625rem 1.25rem -0.1875rem rgba(0, 0, 0, 0.1),
      0 0.25rem 0.375rem -0.125rem rgba(0, 0, 0, 0.05);
    max-height: 16rem;
    overflow-y: auto;
    margin-top: 0.25rem;

    &::-webkit-scrollbar {
      width: 0.5rem;
    }

    &::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: 0.5rem;
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
    color: #9ca3af;
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
    color: #374151;
    transition: background-color 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    font-family: inherit;

    &:hover:not(&--disabled) {
      background-color: #f9fafb;
    }

    &:focus {
      outline: none;
      background-color: #f3f4f6;
    }

    &--active {
      background-color: #f9fafb;
      color: #374151;
      font-weight: 500;
    }

    &--disabled {
      color: #98a2b3;
      cursor: not-allowed;
      opacity: 0.5;

      &:hover {
        background-color: transparent;
      }
    }

    &:first-child {
      border-top-left-radius: calc(0.5rem - 2px);
      border-top-right-radius: calc(0.5rem - 2px);
    }

    &:last-child {
      border-bottom-left-radius: calc(0.5rem - 2px);
      border-bottom-right-radius: calc(0.5rem - 2px);
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
    color: $color-primary;
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
