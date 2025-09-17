<template>
  <slot name="trigger" :open="handleOpenModal"></slot>

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

const handleOpenModal = () => {
  isModalOpen.value = true;
};

const handleCloseModal = () => {
  isModalOpen.value = false;
};

const handleDelete = async () => {
  isLoading.value = true;
  await emit("handle-delete").finally(() => {
    isLoading.value = false;
  });
};

defineExpose({
  handleOpenModal,
  handleCloseModal,
  isOpen: readonly(isModalOpen),
  isLoading: readonly(isLoading),
});
</script>

<style lang="scss" scoped>
.confirm-delete {
  &__title-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border: 6.5px solid #fac6d0;
    background-color: #ff2d46;
    border-radius: 50%;
    padding: 6px;

    svg {
      color: $white;
    }
  }

  &__content {
    padding: 20px 24px 0px 24px;
  }

  &__content-title {
    @include label-base;
    font-weight: 600;
    font-size: 20px;
    line-height: 30px;
    color: #19213d;
  }

  &__description {
    @include label-base;
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
    color: #6d758f;
  }

  &__actions {
    width: 100%;
    display: flex;
    gap: 12px;
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
