<script setup lang="ts">
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
  customClass?: string;
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
  customClass: "",
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

const handleClickOutside = (event: Event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown();
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
  document.addEventListener("click", handleClickOutside);
  if (props.searchable) {
    searchText.value = selectedItem.value?.label || "";
  }
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div
    ref="dropdownRef"
    class="dropdown"
    :class="[customClass, { 'dropdown--disabled': disabled }]"
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

    <div class="dropdown__menu" :class="{ 'dropdown__menu--show': isOpen }">
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

        <div v-if="modelValue === item.value" class="dropdown__item-icon">
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
    }
  }

  &--md {
    .dropdown__toggle {
      min-height: 3.5rem;
      padding: 1rem;
      font-size: 1rem;
    }
  }

  &--lg {
    .dropdown__toggle {
      min-height: 4rem;
      padding: 1.25rem;
      font-size: 1.125rem;
    }
  }

  &--outline {
    .dropdown__toggle {
      background: transparent;
      border: 0.125rem solid var(--dropdown-accent-color, $primary-aqua);
    }
  }

  &--filled {
    .dropdown__toggle {
      background: var(--dropdown-accent-color, $primary-aqua);
      color: $white;
      border: 1px solid var(--dropdown-accent-color, $primary-aqua);

      .dropdown__text--placeholder {
        color: rgba(255, 255, 255, 0.7);
      }
    }
  }

  &__toggle {
    @include input-base;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;

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
    }

    &--searchable {
      padding-right: 3.125rem;
    }
  }

  &__icon {
    flex-shrink: 0;
    color: $color-text-muted;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__search-input {
    @include input-base;
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    color: #374151;
    font-size: 1rem;
    line-height: 1.5rem;
    min-width: 0;

    &::placeholder {
      color: $color-text-muted;
    }

    &:disabled {
      color: #98a2b3;
      cursor: not-allowed;
    }
  }

  &__text {
    flex: 1;
    font-size: 1rem;
    line-height: 1.5rem;
    color: #374151;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &--placeholder {
      color: $color-text-muted;
    }
  }

  &__clear-button {
    position: absolute;
    right: 2.8125rem;
    width: 1.5rem;
    height: 1.5rem;
    border: none;
    background: transparent;
    color: $color-text-muted;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.25rem;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover {
      background-color: #f3f4f6;
      color: #374151;
    }
  }

  &__arrow {
    width: 1.25rem;
    height: 1.25rem;
    color: $color-text-muted;
    transition: transform 0.2s ease;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    &--rotated {
      transform: rotate(180deg);
    }
  }

  &__loading {
    position: absolute;
    right: 2.8125rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
  }

  &__loading-spinner {
    color: $primary-aqua;
    animation: spin 1s linear infinite;
  }

  &__menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1000;
    background: $white;
    border: 1px solid #d0d5dd;
    border-radius: 0.5rem;
    box-shadow:
      0 0.25rem 0.375rem -0.0625rem rgba(0, 0, 0, 0.1),
      0 0.125rem 0.25rem -0.0625rem rgba(0, 0, 0, 0.06);
    max-height: 12.5rem;
    overflow-y: auto;
    margin-top: 0.25rem;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-0.625rem);
    transition: all 0.2s ease;

    &--show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }

    &::-webkit-scrollbar {
      width: 0.375rem;
    }

    &::-webkit-scrollbar-track {
      background: #f1f5f9;
    }

    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 0.1875rem;

      &:hover {
        background: #94a3b8;
      }
    }
  }

  &__no-results {
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    color: #6b7280;
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
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;

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
    }

    &--disabled {
      color: #98a2b3;
      cursor: not-allowed;
      opacity: 0.5;
    }

    &:first-child {
      border-top-left-radius: 0.4375rem;
      border-top-right-radius: 0.4375rem;
    }

    &:last-child {
      border-bottom-left-radius: 0.4375rem;
      border-bottom-right-radius: 0.4375rem;
    }
  }

  &__item-text {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    text-align: left;
  }

  &__item-icon {
    color: #7f56d9;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
