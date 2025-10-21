<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    size="extra-small"
    class="confirm-delete"
    @close="handleCloseModal"
  >
    <template #title>
      <div class="confirm-delete__title-icon">
        <AtomsIconsCircleXIcon />
      </div>
    </template>

    <div class="confirm-delete__content">
      <h2 class="confirm-delete__content-title">
        Seguro que quieres eliminar esto?
      </h2>
      <p class="confirm-delete__description">
        Esta acción no se puede deshacer
      </p>
    </div>

    <template #footer>
      <div class="confirm-delete__actions">
        <button
          :disabled="isLoading"
          class="confirm-delete__button--outline"
          @click="handleCloseModal"
        >
          Cancelar
        </button>
        <button
          :disabled="isLoading"
          class="confirm-delete__button--danger"
          @click="handleDelete"
        >
          {{ isLoading ? "Procesando..." : "Eliminar" }}
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
interface Emits {
  (e: "handle-delete"): Promise<void>;
}

const emit = defineEmits<Emits>();

const isModalOpen = ref<boolean>(false);
const isLoading = ref<boolean>(false);

const handleCloseModal = () => {
  isModalOpen.value = false;
};

const handleDelete = async () => {
  isLoading.value = true;
  await emit("handle-delete").finally(() => {
    isLoading.value = false;
  });
};
</script>

<style lang="scss" scoped>
.confirm-delete {
  &__title-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 2.5rem;
    height: 2.5rem;
    border: 0.40625rem solid $color-cancel;
    background-color: $color-danger;
    border-radius: 50%;
    padding: 0.375rem;

    svg {
      color: $white;
    }
  }

  &__content {
    padding: 1.25rem 1.5rem 0 1.5rem;
  }

  &__content-title {
    @include label-base;
    font-weight: 600;
    font-size: 1.25rem;
    line-height: 1.875rem;
    color: $color-foreground;
  }

  &__description {
    @include label-base;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: $color-text-secondary;
  }

  &__actions {
    width: 100%;
    display: flex;
    gap: 0.75rem;
  }

  &__button {
    &--outline {
      @include outline-button;
      width: 100%;
    }

    &--danger {
      @include danger-button;
      width: 100%;
    }
  }
}
</style>
