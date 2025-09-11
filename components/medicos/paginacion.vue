<template>
  <nav class="pagination" aria-label="Navegación de páginas">
    <div class="pagination__info" v-if="showInfo">
      <p class="pagination__info-text">
        Mostrando {{ startItem }} - {{ endItem }} de {{ totalItems }} resultados
      </p>
    </div>

    <ul class="pagination__list" role="list">
      <li class="pagination__item">
        <button
          class="pagination__button pagination__button--prev"
          @click="goToPreviousPage"
          :disabled="currentPage === 1"
          :aria-label="
            currentPage === 1 ? 'No hay página anterior' : 'Página anterior'
          "
        >
          <span aria-hidden="true">&laquo;</span>
          Anterior
        </button>
      </li>

      <li class="pagination__item" v-if="showFirstPage">
        <button
          class="pagination__button"
          :class="{ 'pagination__button--active': currentPage === 1 }"
          @click="goToPage(1)"
          :aria-label="
            currentPage === 1 ? 'Página 1, página actual' : 'Ir a página 1'
          "
          :aria-current="currentPage === 1 ? 'page' : undefined"
        >
          1
        </button>
      </li>

      <li class="pagination__item" v-if="showLeftEllipsis">
        <span class="pagination__ellipsis" aria-hidden="true">...</span>
      </li>

      <!-- Solución: Usar template wrapper para separar v-for y v-if -->
      <template v-for="page in visiblePages" :key="page">
        <li class="pagination__item">
          <button
            class="pagination__button"
            :class="{ 'pagination__button--active': currentPage === page }"
            @click="goToPage(page)"
            :aria-label="
              currentPage === page
                ? `Página ${page}, página actual`
                : `Ir a página ${page}`
            "
            :aria-current="currentPage === page ? 'page' : undefined"
          >
            {{ page }}
          </button>
        </li>
      </template>

      <li class="pagination__item" v-if="showRightEllipsis">
        <span class="pagination__ellipsis" aria-hidden="true">...</span>
      </li>

      <li class="pagination__item" v-if="showLastPage">
        <button
          class="pagination__button"
          :class="{ 'pagination__button--active': currentPage === totalPages }"
          @click="goToPage(totalPages)"
          :aria-label="
            currentPage === totalPages
              ? `Página ${totalPages}, página actual`
              : `Ir a página ${totalPages}`
          "
          :aria-current="currentPage === totalPages ? 'page' : undefined"
        >
          {{ totalPages }}
        </button>
      </li>

      <li class="pagination__item">
        <button
          class="pagination__button pagination__button--next"
          @click="goToNextPage"
          :disabled="currentPage === totalPages"
          :aria-label="
            currentPage === totalPages
              ? 'No hay página siguiente'
              : 'Página siguiente'
          "
        >
          Siguiente
          <span aria-hidden="true">&raquo;</span>
        </button>
      </li>
    </ul>
  </nav>
</template>

<script lang="ts" setup>
import { computed } from "vue";

interface Props {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  maxVisiblePages?: number;
  showInfo?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
  maxVisiblePages: 5,
  showInfo: false,
});

const emit = defineEmits<{
  "page-changed": [page: number];
}>();

const visiblePages = computed(() => {
  const pages: number[] = [];
  const maxVisible = props.maxVisiblePages;
  const current = props.currentPage;
  const total = props.totalPages;

  if (total <= maxVisible) {
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
  }

  return pages;
});

const showFirstPage = computed(() => {
  return props.totalPages > 1 && !visiblePages.value.includes(1);
});

const showLastPage = computed(() => {
  return props.totalPages > 1 && !visiblePages.value.includes(props.totalPages);
});

const showLeftEllipsis = computed(() => {
  return showFirstPage.value && visiblePages.value[0] > 2;
});

const showRightEllipsis = computed(() => {
  return (
    showLastPage.value &&
    visiblePages.value[visiblePages.value.length - 1] < props.totalPages - 1
  );
});

const startItem = computed(() => {
  return (props.currentPage - 1) * props.itemsPerPage + 1;
});

const endItem = computed(() => {
  return Math.min(props.currentPage * props.itemsPerPage, props.totalItems);
});

const goToPage = (page: number): void => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit("page-changed", page);
  }
};

const goToPreviousPage = (): void => {
  if (props.currentPage > 1) {
    goToPage(props.currentPage - 1);
  }
};

const goToNextPage = (): void => {
  if (props.currentPage < props.totalPages) {
    goToPage(props.currentPage + 1);
  }
};
</script>

<style lang="scss" scoped>
.pagination {
  background: transparent;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: space-between;
  }

  &__list {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    gap: 0.25rem;
    margin-left: auto;
  }

  &__item {
    display: flex;
  }

  &__button {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 0.5rem 0.75rem;
    border: 1px solid transparent;
    background: transparent;
    color: #6c757d;
    text-decoration: none;
    border-radius: 0.375rem;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
    min-width: 2.5rem;
    justify-content: center;

    &:hover:not(:disabled):not(.pagination__button--active) {
      background-color: #f8f9fa;
      color: $color-primary;
    }

    &:focus {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      color: #6c757d;

      &:hover {
        background: transparent;
        color: #6c757d;
      }
    }

    &--active {
      background: $color-primary;
      color: $white;
      border-color: $color-primary;

      &:hover {
        background: darken($color-primary, 1.5);
        color: $white;
      }
    }

    &--prev,
    &--next {
      white-space: nowrap;
      font-weight: 500;
    }
  }

  &__ellipsis {
    display: flex;
    align-items: center;
    padding: 0.5rem 0.75rem;
    color: #6c757d;
    font-size: 0.875rem;
  }

  &__info {
    order: -1;

    @media (min-width: 768px) {
      order: 0;
    }
  }

  &__info-text {
    @include label-base;
    font-weight: 300;
    font-size: 13px;
    color: #6c757d;
    margin: 0;
  }
}

@media (max-width: 576px) {
  .pagination {
    padding: 0.75rem;

    &__button {
      padding: 0.375rem 0.5rem;
      font-size: 0.75rem;
      min-width: 2rem;
    }

    &__button--prev,
    &__button--next {
      span:first-child,
      span:last-child {
        display: none;
      }
    }

    &__info-text {
      font-size: 0.75rem;
      text-align: center;
    }
  }
}

@media (prefers-contrast: high) {
  .pagination {
    &__button {
      border: 1px solid #dee2e6;

      &--active {
        border-color: $color-primary;
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .pagination {
    * {
      transition: none !important;
    }
  }
}

.pagination {
  &__button:focus:not(:focus-visible) {
    outline: none;
  }

  &__button:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }
}
</style>
