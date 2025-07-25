<template>
  <nav
    class="pagination"
    aria-label="Navegación de páginas"
    v-if="totalPages > 1"
  >
    <div class="pagination__info" v-if="showInfo">
      <p class="pagination__info-text">
        Mostrando {{ startItem }} - {{ endItem }} de {{ totalItems }} resultados
      </p>
    </div>

    <ul class="pagination__list" role="list">
      <!-- Botón Anterior -->
      <li class="pagination__item">
        <button
          class="pagination__btn pagination__btn--prev"
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

      <!-- Primera página -->
      <li class="pagination__item" v-if="showFirstPage">
        <button
          class="pagination__btn"
          :class="{ 'pagination__btn--active': currentPage === 1 }"
          @click="goToPage(1)"
          :aria-label="
            currentPage === 1 ? 'Página 1, página actual' : 'Ir a página 1'
          "
          :aria-current="currentPage === 1 ? 'page' : undefined"
        >
          1
        </button>
      </li>

      <!-- Puntos suspensivos izquierda -->
      <li class="pagination__item" v-if="showLeftEllipsis">
        <span class="pagination__ellipsis" aria-hidden="true">...</span>
      </li>

      <!-- Páginas del rango visible -->
      <li
        class="pagination__item"
        v-for="page in visiblePages"
        :key="page"
        v-if="page !== 1 && page !== totalPages"
      >
        <button
          class="pagination__btn"
          :class="{ 'pagination__btn--active': currentPage === page }"
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

      <!-- Puntos suspensivos derecha -->
      <li class="pagination__item" v-if="showRightEllipsis">
        <span class="pagination__ellipsis" aria-hidden="true">...</span>
      </li>

      <!-- Última página -->
      <li class="pagination__item" v-if="showLastPage">
        <button
          class="pagination__btn"
          :class="{ 'pagination__btn--active': currentPage === totalPages }"
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

      <!-- Botón Siguiente -->
      <li class="pagination__item">
        <button
          class="pagination__btn pagination__btn--next"
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

<script setup>
import { computed } from "vue";

// Props
const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
    default: 1,
  },
  totalPages: {
    type: Number,
    required: true,
    default: 1,
  },
  totalItems: {
    type: Number,
    default: 0,
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
  maxVisiblePages: {
    type: Number,
    default: 5,
  },
  showInfo: {
    type: Boolean,
    default: false,
  },
});

// Emits
const emit = defineEmits(["page-changed"]);

// Computed properties
const visiblePages = computed(() => {
  const pages = [];
  const maxVisible = props.maxVisiblePages;
  const current = props.currentPage;
  const total = props.totalPages;

  if (total <= maxVisible) {
    // Si hay pocas páginas, mostrar todas
    for (let i = 1; i <= total; i++) {
      pages.push(i);
    }
  } else {
    // Calcular el rango de páginas a mostrar
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(total, start + maxVisible - 1);

    // Ajustar si estamos cerca del final
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

// Methods
const goToPage = (page) => {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit("page-changed", page);
  }
};

const goToPreviousPage = () => {
  if (props.currentPage > 1) {
    goToPage(props.currentPage - 1);
  }
};

const goToNextPage = () => {
  if (props.currentPage < props.totalPages) {
    goToPage(props.currentPage + 1);
  }
};
</script>

<style lang="scss" scoped>
// Variables (asumiendo que tienes estas variables definidas)
$color-primary: #007bff !default;
$white: #ffffff !default;

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

  &__btn {
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

    &:hover:not(:disabled) {
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
        background: $color-primary;
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

// Responsive design
@media (max-width: 576px) {
  .pagination {
    padding: 0.75rem;

    &__btn {
      padding: 0.375rem 0.5rem;
      font-size: 0.75rem;
      min-width: 2rem;
    }

    &__btn--prev,
    &__btn--next {
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

// High contrast mode support
@media (prefers-contrast: high) {
  .pagination {
    &__btn {
      border: 1px solid #dee2e6;

      &--active {
        border-color: $color-primary;
      }
    }
  }
}

// Reduced motion support
@media (prefers-reduced-motion: reduce) {
  .pagination {
    * {
      transition: none !important;
    }
  }
}

// Focus visible support
.pagination {
  &__btn:focus:not(:focus-visible) {
    outline: none;
  }

  &__btn:focus-visible {
    outline: 2px solid $color-primary;
    outline-offset: 2px;
  }
}
</style>
