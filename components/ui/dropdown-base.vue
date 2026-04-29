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

const rootRef = ref<HTMLElement>();
const triggerRef = ref<HTMLButtonElement>();
const searchRef = ref<HTMLInputElement>();
const listRef = ref<HTMLUListElement>();

const isOpen = ref(false);
const query = ref("");
const activeIndex = ref(-1);
const menuPos = ref({ top: 0, left: 0, width: 0 });

const uid = Math.random().toString(36).slice(2, 9);
const triggerId = `db-trigger-${uid}`;
const listId = `db-list-${uid}`;

const selectedItem = computed(() =>
  props.items.find((item) => item.value === props.modelValue),
);

const displayLabel = computed(() => {
  if (props.searchable && isOpen.value) return query.value;
  return selectedItem.value?.label ?? props.placeholder;
});

const visibleItems = computed(() => {
  if (!props.searchable || !query.value.trim()) return props.items;
  const q = query.value.toLowerCase();
  return props.items.filter((i) => i.label.toLowerCase().includes(q));
});

const canInteract = computed(() => !props.disabled && !props.loading);

const showClear = computed(
  () => props.clearable && props.modelValue !== undefined && !props.disabled,
);

const activeOptionId = computed(() =>
  activeIndex.value >= 0 && activeIndex.value < visibleItems.value.length
    ? `${listId}-opt-${activeIndex.value}`
    : undefined,
);

const firstEnabledIdx = computed(() =>
  visibleItems.value.findIndex((i) => !i.disabled),
);

const lastEnabledIdx = computed(() => {
  for (let i = visibleItems.value.length - 1; i >= 0; i--) {
    if (!visibleItems.value[i].disabled) return i;
  }
  return -1;
});

function nextEnabled(from: number, step: 1 | -1): number {
  const items = visibleItems.value;
  for (let i = from + step; i >= 0 && i < items.length; i += step) {
    if (!items[i].disabled) return i;
  }
  return from;
}

function refreshMenuPos() {
  if (!rootRef.value) return;
  const r = rootRef.value.getBoundingClientRect();
  menuPos.value = { top: r.bottom, left: r.left, width: r.width };
}

function scrollActiveIntoView() {
  if (!listRef.value || !activeOptionId.value) return;
  listRef.value
    .querySelector<HTMLElement>(`#${CSS.escape(activeOptionId.value)}`)
    ?.scrollIntoView({ block: "nearest" });
}

function returnFocus() {
  nextTick(() =>
    (props.searchable ? searchRef.value : triggerRef.value)?.focus(),
  );
}

function open() {
  if (!canInteract.value) return;
  refreshMenuPos();
  isOpen.value = true;

  const selIdx = visibleItems.value.findIndex(
    (i) => i.value === props.modelValue,
  );
  activeIndex.value = selIdx >= 0 ? selIdx : firstEnabledIdx.value;

  nextTick(() => {
    if (props.searchable) searchRef.value?.focus();
    else listRef.value?.focus();
    scrollActiveIntoView();
  });
}

function close(label?: string) {
  isOpen.value = false;
  activeIndex.value = -1;
  if (props.searchable) {
    query.value = label !== undefined ? label : (selectedItem.value?.label ?? "");
  }
}

function closeWithFocus(label?: string) {
  close(label);
  returnFocus();
}

function toggle() {
  isOpen.value ? closeWithFocus() : open();
}

function select(item: DropdownItem) {
  if (item.disabled) return;
  emit("update:modelValue", item.value);
  emit("select", item);
  closeWithFocus(item.label);
}

function clear(e: MouseEvent) {
  e.stopPropagation();
  emit("update:modelValue", undefined);
  emit("clear");
  query.value = "";
}

function onTriggerKeydown(e: KeyboardEvent) {
  if (!canInteract.value) return;
  switch (e.key) {
    case "Enter":
    case " ":
      e.preventDefault();
      toggle();
      break;
    case "ArrowDown":
      e.preventDefault();
      if (isOpen.value) {
        activeIndex.value = nextEnabled(activeIndex.value, 1);
        scrollActiveIntoView();
      } else {
        open();
      }
      break;
    case "ArrowUp":
      e.preventDefault();
      if (isOpen.value) {
        activeIndex.value = nextEnabled(activeIndex.value, -1);
        scrollActiveIntoView();
      } else {
        open();
      }
      break;
    case "Escape":
      e.preventDefault();
      if (isOpen.value) closeWithFocus();
      break;
    case "Tab":
      if (isOpen.value) close();
      break;
  }
}

function onListKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      activeIndex.value = nextEnabled(activeIndex.value, 1);
      scrollActiveIntoView();
      break;
    case "ArrowUp":
      e.preventDefault();
      activeIndex.value = nextEnabled(activeIndex.value, -1);
      scrollActiveIntoView();
      break;
    case "Home":
      e.preventDefault();
      activeIndex.value = firstEnabledIdx.value;
      scrollActiveIntoView();
      break;
    case "End":
      e.preventDefault();
      activeIndex.value = lastEnabledIdx.value;
      scrollActiveIntoView();
      break;
    case "Enter":
    case " ":
      e.preventDefault();
      if (activeIndex.value >= 0) select(visibleItems.value[activeIndex.value]);
      break;
    case "Escape":
      e.preventDefault();
      closeWithFocus();
      break;
    case "Tab":
      e.preventDefault();
      if (e.shiftKey) {
        activeIndex.value = nextEnabled(activeIndex.value, -1);
      } else {
        activeIndex.value = nextEnabled(activeIndex.value, 1);
      }
      scrollActiveIntoView();
      break;
  }
}

function onSearchKeydown(e: KeyboardEvent) {
  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      if (isOpen.value) {
        activeIndex.value = nextEnabled(activeIndex.value, 1);
        scrollActiveIntoView();
      } else {
        open();
      }
      break;
    case "ArrowUp":
      e.preventDefault();
      if (isOpen.value) {
        activeIndex.value = nextEnabled(activeIndex.value, -1);
        scrollActiveIntoView();
      }
      break;
    case "Enter":
      e.preventDefault();
      if (isOpen.value && activeIndex.value >= 0)
        select(visibleItems.value[activeIndex.value]);
      break;
    case "Escape":
      e.preventDefault();
      closeWithFocus();
      break;
    case "Tab":
      if (isOpen.value) {
        e.preventDefault();
        if (e.shiftKey) {
          activeIndex.value = nextEnabled(activeIndex.value, -1);
        } else {
          activeIndex.value = nextEnabled(activeIndex.value, 1);
        }
        scrollActiveIntoView();
      }
      break;
  }
}

function onSearchInput() {
  if (!isOpen.value) {
    isOpen.value = true;
    refreshMenuPos();
  }
  nextTick(() => {
    activeIndex.value = firstEnabledIdx.value;
  });
}

function onScrollOrResize() {
  if (isOpen.value) refreshMenuPos();
}

watch(isOpen, (opened) => {
  if (opened) {
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
  } else {
    window.removeEventListener("scroll", onScrollOrResize, true);
    window.removeEventListener("resize", onScrollOrResize);
  }
});

watch(
  () => props.modelValue,
  () => {
    if (props.searchable) query.value = selectedItem.value?.label ?? "";
  },
);

onMounted(() => {
  if (props.searchable) query.value = selectedItem.value?.label ?? "";
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScrollOrResize, true);
  window.removeEventListener("resize", onScrollOrResize);
});

onClickOutside(rootRef, () => {
  if (isOpen.value) close();
}, { ignore: [listRef] });
</script>

<template>
  <div
    ref="rootRef"
    class="db"
    :class="[`db--${size}`, `db--${variant}`, { 'db--disabled': disabled }]"
  >
    <div
      class="db__field"
      :class="{
        'db__field--open': isOpen,
        'db__field--disabled': disabled,
        'db__field--loading': loading,
        'db__field--error': error,
      }"
    >
      <button
        v-if="!searchable"
        :id="triggerId"
        ref="triggerRef"
        type="button"
        class="db__trigger"
        aria-haspopup="listbox"
        :aria-expanded="isOpen"
        :aria-controls="listId"
        :disabled="disabled || loading"
        @click="toggle"
        @keydown="onTriggerKeydown"
      >
        <span v-if="$slots.icon" class="db__icon" aria-hidden="true">
          <slot name="icon" />
        </span>
        <span
          class="db__label"
          :class="{ 'db__label--placeholder': !modelValue }"
        >
          {{ displayLabel }}
        </span>
      </button>

      <div
        v-else
        class="db__trigger db__trigger--combobox"
        @click="!isOpen && canInteract && open()"
      >
        <span v-if="$slots.icon" class="db__icon" aria-hidden="true">
          <slot name="icon" />
        </span>
        <input
          :id="triggerId"
          ref="searchRef"
          v-model="query"
          type="text"
          class="db__search"
          role="combobox"
          :aria-expanded="isOpen"
          :aria-controls="listId"
          aria-haspopup="listbox"
          aria-autocomplete="list"
          :aria-activedescendant="activeOptionId"
          :placeholder="!modelValue ? placeholder : ''"
          :disabled="disabled"
          @input="onSearchInput"
          @keydown="onSearchKeydown"
        />
      </div>

      <div class="db__suffix">
        <button
          v-if="showClear"
          type="button"
          class="db__clear"
          aria-label="Limpiar selección"
          @click="clear"
        >
          <slot name="clear-icon">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
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

        <span v-if="loading" class="db__spinner-wrap" aria-hidden="true">
          <slot name="loading-icon">
            <svg class="db__spinner" width="16" height="16" viewBox="0 0 16 16">
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
        </span>

        <span
          class="db__chevron"
          :class="{ 'db__chevron--open': isOpen }"
          aria-hidden="true"
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
        </span>
      </div>
    </div>

    <Teleport to="body">
      <ul
        v-if="isOpen"
        :id="listId"
        ref="listRef"
        role="listbox"
        class="db__list"
        :class="`db__list--${size}`"
        :aria-labelledby="triggerId"
        :aria-activedescendant="activeOptionId"
        tabindex="-1"
        :style="{
          top: `${menuPos.top}px`,
          left: `${menuPos.left}px`,
          width: `${menuPos.width}px`,
        }"
        @keydown="onListKeydown"
      >
        <li
          v-if="visibleItems.length === 0"
          role="presentation"
          class="db__empty"
        >
          {{ noResultsText }}
        </li>

        <li
          v-for="(item, index) in visibleItems"
          :id="`${listId}-opt-${index}`"
          :key="item.value"
          role="option"
          class="db__option"
          :class="{
            'db__option--selected': modelValue === item.value,
            'db__option--disabled': item.disabled,
            'db__option--active': activeIndex === index,
          }"
          :aria-selected="modelValue === item.value"
          :aria-disabled="item.disabled ?? false"
          @click="select(item)"
          @mouseenter="!item.disabled && (activeIndex = index)"
        >
          <span class="db__option-label">{{ item.label }}</span>
          <span
            v-if="modelValue === item.value"
            class="db__option-check"
            aria-hidden="true"
          >
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
          </span>
        </li>
      </ul>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
:global(:root) {
  --db-primary: #3541b4;
  --db-primary-ring: rgba(53, 65, 180, 0.2);
  --db-border: #d0d5dd;
  --db-border-hover: #98a2b3;
  --db-bg: #ffffff;
  --db-bg-disabled: #f9fafb;
  --db-text: #374151;
  --db-text-muted: #9ca3af;
  --db-text-disabled: #98a2b3;
  --db-option-hover: #f9fafb;
  --db-option-active: #f3f4f6;
  --db-radius: 0.5rem;
  --db-shadow: 0 0.625rem 1.25rem -0.1875rem rgba(0, 0, 0, 0.1),
    0 0.25rem 0.375rem -0.125rem rgba(0, 0, 0, 0.05);
}

.db {
  position: relative;
  width: 100%;

  &--disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  &--sm {
    .db__field {
      min-height: 2.5rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
    .db__trigger {
      padding: 0.5rem 0 0.5rem 0.75rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
    .db__search {
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
  }

  &--md {
    .db__field {
      min-height: 3rem;
      font-size: 1rem;
      line-height: 1.5rem;
    }
    .db__trigger {
      padding: 0.75rem 0 0.75rem 1rem;
      font-size: 1rem;
      line-height: 1.5rem;
    }
    .db__search {
      font-size: 1rem;
      line-height: 1.5rem;
    }
  }

  &--lg {
    .db__field {
      min-height: 3.5rem;
      font-size: 1.125rem;
      line-height: 1.75rem;
    }
    .db__trigger {
      padding: 1rem 0 1rem 1.25rem;
      font-size: 1.125rem;
      line-height: 1.75rem;
    }
    .db__search {
      font-size: 1.125rem;
      line-height: 1.75rem;
    }
  }

  &--outline {
    .db__field {
      background: transparent;
      border: 2px solid var(--db-primary);

      &:hover:not(.db__field--disabled) {
        border-color: #2a3490;
      }
    }
  }

  &--filled {
    .db__field {
      background: var(--db-primary);
      border-color: var(--db-primary);

      &:focus-within {
        box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.25);
      }

      &:hover:not(.db__field--disabled) {
        background: #2a3490;
        border-color: #2a3490;
      }
    }

    .db__trigger,
    .db__label,
    .db__search {
      color: #ffffff;
    }

    .db__label--placeholder,
    .db__search::placeholder {
      color: rgba(255, 255, 255, 0.65);
    }

    .db__icon,
    .db__chevron,
    .db__spinner-wrap {
      color: rgba(255, 255, 255, 0.8);
    }

    .db__clear {
      color: rgba(255, 255, 255, 0.8);

      &:hover {
        background: rgba(255, 255, 255, 0.15);
        color: #ffffff;
      }
    }
  }

  &__field {
    display: flex;
    align-items: center;
    width: 100%;
    background: var(--db-bg);
    border: 1px solid var(--db-border);
    border-radius: var(--db-radius);
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
    overflow: hidden;

    &:hover:not(.db__field--disabled) {
      border-color: var(--db-border-hover);
    }

    &:focus-within {
      outline: none;
      border-color: var(--db-primary);
      box-shadow:
        0 0 0 4px var(--db-primary-ring),
        0 0 1.05px rgba(53, 65, 180, 0.4),
        0 1.05px 2.1px rgba(50, 50, 71, 0.1);
    }

    &:has(:focus-visible) {
      outline: 2px solid var(--db-primary);
      outline-offset: 2px;
    }

    &--open {
      border-color: var(--db-primary);
    }

    &--disabled {
      background: var(--db-bg-disabled);
      border-color: var(--db-border);
      color: var(--db-text-disabled);
      cursor: not-allowed;

      &:hover {
        border-color: var(--db-border);
      }
    }

    &--error {
      border-color: #dc3545;

      &:focus-within {
        border-color: #dc3545;
        box-shadow: 0 0 0 4px rgba(220, 53, 69, 0.2);
      }
    }
  }

  &__trigger {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    color: var(--db-text);

    &:focus {
      outline: none;
    }
    &:disabled {
      cursor: not-allowed;
    }
    &--combobox {
      cursor: text;
    }
  }

  &__icon {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    color: var(--db-text-muted);
  }

  &__label {
    flex: 1;
    min-width: 0;
    display: block;
    text-align: left;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--db-text);

    &--placeholder {
      color: var(--db-text-muted);
    }
  }

  &__search {
    flex: 1;
    min-width: 0;
    border: none;
    outline: none;
    background: transparent;
    color: var(--db-text);
    font-family: inherit;
    padding: 0;
    margin: 0;

    &::placeholder {
      color: var(--db-text-muted);
    }
    &:disabled {
      color: var(--db-text-disabled);
      cursor: not-allowed;
    }
  }

  &__suffix {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0 0.75rem;
    flex-shrink: 0;
  }

  &__clear {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.5rem;
    height: 1.5rem;
    border: none;
    background: transparent;
    color: var(--db-text-muted);
    cursor: pointer;
    border-radius: 0.25rem;
    padding: 0;
    transition:
      background-color 0.15s ease,
      color 0.15s ease;

    &:hover {
      background: #f3f4f6;
      color: var(--db-text);
    }
    &:focus-visible {
      outline: 2px solid var(--db-primary);
      outline-offset: 2px;
    }
  }

  &__spinner-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    color: var(--db-primary);
  }

  &__spinner {
    animation: db-spin 1s linear infinite;
  }

  &__chevron {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1.25rem;
    height: 1.25rem;
    color: var(--db-text-muted);
    transition: transform 0.2s ease;
    pointer-events: none;

    &--open {
      transform: rotate(180deg);
    }
  }

  &__list {
    position: fixed;
    z-index: 9999;
    list-style: none;
    margin: 0.25rem 0 0;
    padding: 0;
    background: var(--db-bg);
    border: 1px solid var(--db-border);
    border-radius: var(--db-radius);
    box-shadow: var(--db-shadow);
    max-height: 16rem;
    overflow-y: auto;
    outline: none;

    &--sm .db__option {
      padding: 0.5rem 0.75rem;
      font-size: 0.875rem;
      line-height: 1.25rem;
    }
    &--lg .db__option {
      padding: 1rem 1.25rem;
      font-size: 1.125rem;
      line-height: 1.75rem;
    }

    &::-webkit-scrollbar {
      width: 0.5rem;
    }
    &::-webkit-scrollbar-track {
      background: #f1f5f9;
      border-radius: var(--db-radius);
    }
    &::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 0.25rem;

      &:hover {
        background: #94a3b8;
      }
    }
  }

  &__empty {
    padding: 1rem;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: var(--db-text-muted);
    font-style: italic;
    text-align: center;
  }

  &__option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    font-size: 1rem;
    line-height: 1.5rem;
    color: var(--db-text);
    cursor: pointer;
    user-select: none;
    border: 2px solid transparent;
    border-radius: 10px;
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease;

    &:first-child {
      border-top-left-radius: calc(var(--db-radius) - 1px);
      border-top-right-radius: calc(var(--db-radius) - 1px);
    }

    &:last-child {
      border-bottom-left-radius: calc(var(--db-radius) - 1px);
      border-bottom-right-radius: calc(var(--db-radius) - 1px);
    }

    &:hover:not(&--disabled) {
      background: var(--db-option-hover);
    }

    &--active:not(&--disabled) {
      background: var(--db-option-active);
    }

    &--selected {
      background: #eef0fa;
      color: #2a3490;
      font-weight: 600;
      padding-left: calc(1rem - 3px);

      &:hover {
        background: #eef0fa;
      }
    }

    &--disabled {
      color: var(--db-text-disabled);
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  &__option-label {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__option-check {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 1rem;
    height: 1rem;
    color: var(--db-primary);
  }
}

@keyframes db-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
