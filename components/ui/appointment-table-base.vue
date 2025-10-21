<template>
  <section
    class="appointment-table-base"
    role="region"
    :aria-labelledby="headingId"
  >
    <h2 :id="headingId" class="sr-only">{{ title }}</h2>

    <div v-if="hasItems" class="appointment-table-base__container">
      <div class="appointment-table-base__wrapper">
        <table
          class="appointment-table-base__table"
          role="table"
          :aria-label="ariaLabel"
        >
          <thead class="appointment-table-base__header">
            <tr class="appointment-table-base__header-row" role="row">
              <th
                v-for="column in columns"
                :key="column.key"
                scope="col"
                class="appointment-table-base__header-cell"
                :class="column.headerClass"
                :style="column.width ? { width: column.width } : undefined"
              >
                <slot
                  :name="`header-${column.key}`"
                  :column="column"
                  :is-active="sortColumn === column.key"
                  :direction="sortDirection"
                >
                  <button
                    v-if="column.sortable !== false"
                    class="appointment-table-base__sort-button"
                    @click="handleSort(column.key)"
                    :aria-label="getSortAriaLabel(column)"
                  >
                    <span class="appointment-table-base__header-text">
                      {{ column.label }}
                    </span>
                    <slot
                      name="sort-icon"
                      :column="column"
                      :is-active="sortColumn === column.key"
                      :direction="sortDirection"
                    >
                      <AtomsIconsChevronsUpDown
                        size="16"
                        :class="[
                          'appointment-table-base__sort-icon',
                          {
                            'appointment-table-base__sort-icon--active':
                              sortColumn === column.key,
                            'appointment-table-base__sort-icon--asc':
                              sortColumn === column.key &&
                              sortDirection === 'asc',
                            'appointment-table-base__sort-icon--desc':
                              sortColumn === column.key &&
                              sortDirection === 'desc',
                          },
                        ]"
                      />
                    </slot>
                  </button>
                  <span v-else class="appointment-table-base__header-text">
                    {{ column.label }}
                  </span>
                </slot>
              </th>
            </tr>
          </thead>

          <tbody class="appointment-table-base__body">
            <template
              v-for="(item, index) in paginatedItems"
              :key="getItemKey(item, index)"
            >
              <tr
                class="appointment-table-base__row"
                :class="getRowClass(item)"
              >
                <td
                  v-for="column in columns"
                  :key="column.key"
                  class="appointment-table-base__cell"
                  :class="column.cellClass"
                >
                  <slot
                    :name="`cell-${column.key}`"
                    :item="item"
                    :value="getColumnValue(item, column.key)"
                    :index="index"
                    :column="column"
                  >
                    {{ getColumnValue(item, column.key) }}
                  </slot>
                </td>
              </tr>

              <slot name="row-expanded" :item="item" :index="index" />
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <div v-else class="appointment-table-base__empty-state">
      <slot name="empty-state">
        <div class="appointment-table-base__empty-content">
          <div class="appointment-table-base__empty-icon">
            <slot name="empty-icon">
              <AtomsIconsChartVacio />
            </slot>
          </div>
          <div class="appointment-table-base__empty-text">
            <p class="appointment-table-base__empty-title">
              {{ emptyStateTitle }}
            </p>
            <p class="appointment-table-base__empty-description">
              {{ emptyStateDescription }}
            </p>
            <button
              v-if="emptyStateAction"
              class="appointment-table-base__empty-cta"
              @click="$emit('empty-action')"
            >
              {{ emptyStateAction }}
            </button>
          </div>
        </div>
      </slot>
    </div>

    <slot
      name="pagination"
      :current-page="currentPage"
      :total-pages="totalPages"
      :total-items="totalItems"
      :items-per-page="itemsPerPage"
      :on-page-change="handlePageChange"
    >
      <MedicosPaginacion
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-items="totalItems"
        :items-per-page="itemsPerPage"
        :show-info="showPaginationInfo"
        @page-changed="handlePageChange"
      />
    </slot>
  </section>
</template>

<script setup lang="ts" generic="T extends TableItem">
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  headerClass?: string;
  cellClass?: string;
  sortField?: string;
}

export interface TableItem {
  id?: string | number;
  [key: string]: any;
}

interface Props<T extends TableItem> {
  items: T[];
  columns: TableColumn[];
  title?: string;
  ariaLabel?: string;
  itemsPerPage?: number;
  defaultSortColumn?: string;
  defaultSortDirection?: "asc" | "desc";
  itemKey?: string;
  rowClass?: string | ((item: T) => string);
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  emptyStateAction?: string;
  showPaginationInfo?: boolean;
}

const props = withDefaults(defineProps<Props<T>>(), {
  itemsPerPage: 10,
  defaultSortColumn: "created_date",
  defaultSortDirection: "desc",
  itemKey: "id",
  emptyStateTitle: "Aún no tienes actividad en tu tablero",
  emptyStateDescription:
    "Muy pronto podrás administrar y verificar tu actividad.",
  showPaginationInfo: false,
});

const emit = defineEmits<{
  "sort-changed": [{ column: string; direction: "asc" | "desc" }];
  "page-changed": [page: number];
  "empty-action": [];
}>();

const sortColumn = ref(props.defaultSortColumn);
const sortDirection = ref<"asc" | "desc">(props.defaultSortDirection);
const currentPage = ref(1);

const headingId = computed(() => {
  const randomId = Math.random().toString(36).substring(2, 11);
  return `table-heading-${randomId}`;
});

const handleSort = (columnKey: string) => {
  if (sortColumn.value === columnKey) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortColumn.value = columnKey;
    sortDirection.value = "asc";
  }

  currentPage.value = 1;

  emit("sort-changed", {
    column: sortColumn.value,
    direction: sortDirection.value,
  });
};

const getSortAriaLabel = (column: TableColumn): string => {
  const action =
    sortColumn.value === column.key && sortDirection.value === "asc"
      ? "descendente"
      : "ascendente";
  return `Ordenar por ${column.label} ${action}`;
};

const getColumnValue = (item: TableItem, columnKey: string): any => {
  const keys = columnKey.split(".");
  let value = item;

  for (const key of keys) {
    if (value && typeof value === "object") {
      value = value[key];
    } else {
      return undefined;
    }
  }

  return value;
};

const getSortValue = (item: TableItem, columnKey: string): any => {
  const column = props.columns.find((col) => col.key === columnKey);
  const field = column?.sortField || columnKey;
  const value = getColumnValue(item, field);

  if (value instanceof Date || !isNaN(Date.parse(value))) {
    return new Date(value);
  }

  return value || "";
};

const sortedItems = computed(() => {
  if (!props.items || !Array.isArray(props.items)) {
    return [];
  }

  return [...props.items].sort((a, b) => {
    const valueA = getSortValue(a, sortColumn.value);
    const valueB = getSortValue(b, sortColumn.value);

    let comparison = 0;

    if (valueA < valueB) {
      comparison = -1;
    } else if (valueA > valueB) {
      comparison = 1;
    }

    return sortDirection.value === "asc" ? comparison : -comparison;
  });
});

const totalItems = computed(() => sortedItems.value.length);

const totalPages = computed(() =>
  Math.ceil(totalItems.value / props.itemsPerPage)
);

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage;
  const end = start + props.itemsPerPage;
  return sortedItems.value.slice(start, end);
});

const hasItems = computed(
  () => props.items && Array.isArray(props.items) && props.items.length > 0
);

const getItemKey = (item: TableItem, index: number): string | number => {
  return getColumnValue(item, props.itemKey) || `item-${index}`;
};

const getRowClass = (item: TableItem): string | string[] | undefined => {
  if (typeof props.rowClass === "function") {
    return props.rowClass(item as T);
  }
  return props.rowClass;
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  emit("page-changed", page);
};

watch(
  () => props.items,
  () => {
    if (currentPage.value > totalPages.value && totalPages.value > 0) {
      currentPage.value = totalPages.value;
    }
  }
);

defineExpose({
  sortColumn,
  sortDirection,
  currentPage,
  totalPages,
  totalItems,
  resetPagination: () => {
    currentPage.value = 1;
  },
});
</script>

<style lang="scss" scoped>
.sr-only {
  @include visually-hidden;
}

.appointment-table-base {
  &__container {
    background: $white;
    border-radius: 0.625rem;
    overflow: hidden;
    min-height: 25rem;
    display: flex;
    flex-direction: column;
  }

  &__wrapper {
    overflow-x: auto;
  }

  &__table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
    table-layout: auto;
  }

  &__header {
    background-color: #f8f9fa;
    border-bottom: 0.125rem solid #dee2e6;
  }

  &__header-row {
    border: none;
  }

  &__header-cell {
    padding: 1rem 0.75rem;
    text-align: left;
    font-size: 0.75rem;
    letter-spacing: 0;
    font-weight: 500;
    color: $color-text-secondary;
    border: none;
    background-color: $white;
    white-space: nowrap;

    &--center {
      text-align: center;
    }

    &--right {
      text-align: right;
    }
  }

  &__header-text {
    font-family: $font-family-main;
    font-weight: 500;
    font-size: 0.75rem;
    line-height: 1rem;
    letter-spacing: 0;
    vertical-align: middle;
  }

  &__sort-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
    color: inherit;
    font: inherit;
    padding: 0;
    width: 100%;

    &:hover {
      .appointment-table-base__sort-icon {
        transform: scale(110%);
        color: $color-primary;
      }
    }

    &:focus-visible {
      outline: 0.125rem solid $color-primary;
      outline-offset: 0.125rem;
      border-radius: 0.25rem;
    }
  }

  &__sort-icon {
    color: #121212;
    transition:
      transform 0.2s ease,
      color 0.2s ease;
    flex-shrink: 0;

    &--active {
      color: $color-primary;
    }

    &--asc {
      transform: rotate(180deg);
    }

    &--desc {
      transform: rotate(0deg);
    }
  }

  &__body {
    background: $white;
  }

  &__row {
    border-bottom: 0.0625rem solid #dee2e6;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba($color-primary, 0.02);
    }

    &--selected {
      background-color: rgba($color-primary, 0.05);
    }

    &--highlighted {
      background-color: rgba($color-warning, 0.05);
    }
  }

  &__cell {
    padding: 1rem 0.75rem;
    vertical-align: middle;
    border: none;
    font-family: $font-family-main;
    font-weight: 300;
    font-size: 0.75rem;
    color: $color-foreground;
    line-height: 1.25rem;

    &--center {
      text-align: center;
    }

    &--right {
      text-align: right;
    }

    &--actions {
      text-align: center;
      width: 1%;
      white-space: nowrap;
    }
  }

  &__empty-state {
    background: $white;
    border-radius: 0.625rem;
    padding: 3rem 2rem;
  }

  &__empty-content {
    display: flex;
    align-items: center;
    gap: 2rem;
    max-width: 37.5rem;
    margin: 0 auto;
  }

  &__empty-icon {
    flex-shrink: 0;
    width: 50%;
    text-align: center;
  }

  &__empty-text {
    flex: 1;
  }

  &__empty-title {
    font-size: 1.25rem;
    font-weight: 500;
    color: #6c757d;
    margin: 0 0 0.5rem 0;
  }

  &__empty-description {
    color: #6c757d;
    margin: 0 0 1rem 0;
    line-height: 1.5;
  }

  &__empty-cta {
    background: $color-primary;
    color: $white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: $color-primary-darkened-10;
    }

    &:focus-visible {
      outline: 0.125rem solid $color-primary;
      outline-offset: 0.125rem;
    }
  }
}

@media (max-width: $breakpoint-md) {
  .appointment-table-base {
    &__container {
      border-radius: 0;
      box-shadow: none;
      border: 0.0625rem solid #dee2e6;
    }

    &__table {
      font-size: 0.75rem;
    }

    &__header-cell,
    &__cell {
      padding: 0.5rem;
    }

    &__empty-content {
      flex-direction: column;
      text-align: center;
      gap: 1rem;
    }

    &__empty-icon {
      width: auto;
    }
  }
}

@media (max-width: $breakpoint-sm) {
  .appointment-table-base {
    &__header-text {
      font-size: 0.625rem;
    }

    &__cell {
      font-size: 0.625rem;
    }
  }
}

@media (prefers-contrast: high) {
  .appointment-table-base {
    &__container {
      border: 0.125rem solid #dee2e6;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .appointment-table-base {
    * {
      transition: none !important;
      animation: none !important;
    }
  }
}

.appointment-table-base {
  button:focus:not(:focus-visible) {
    outline: none;
  }

  button:focus-visible {
    outline: 0.125rem solid $color-primary;
    outline-offset: 0.125rem;
  }
}
</style>
