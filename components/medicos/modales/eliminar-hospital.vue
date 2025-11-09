<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    size="extra-small"
    class="delete-hospital"
    @close="handleCloseModal"
  >
    <template #title>
      <div class="delete-hospital__title-icon">
        <AtomsIconsTrashIcon size="20" />
      </div>
    </template>

    <div class="delete-hospital__content">
      <h2 class="delete-hospital__content-title">
        ¿Seguro que quieres eliminar este hospital?
      </h2>
      <p class="delete-hospital__description">
        Esta acción no se puede deshacer
      </p>
    </div>

    <template #footer>
      <div class="delete-hospital__actions">
        <button
          :disabled="isLoading"
          class="delete-hospital__button--outline"
          @click="handleCloseModal"
        >
          Cancelar
        </button>
        <button
          :disabled="isLoading"
          class="delete-hospital__button--danger"
          @click="handleDeleteHospital"
        >
          {{ isLoading ? "Eliminando..." : "Eliminar" }}
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useSupplier } from "@/composables/api";

const emit = defineEmits<{
  "hospital-deleted": [];
}>();

const { isOpen, closeModal, getSharedData } = useMedicalModalManager();
const { deleteHospital } = useSupplier();

const isModalOpen = computed(() => isOpen.eliminarHospital);
const isLoading = ref<boolean>(false);

const modalData = computed(() => getSharedData("eliminarHospital"));
const hospitalId = computed(() => modalData.value?.hospitalId);

const handleCloseModal = () => {
  if (isLoading.value) return;
  closeModal("eliminarHospital");
};

const handleDeleteHospital = async () => {
  if (!hospitalId.value || isLoading.value) return;

  isLoading.value = true;

  try {
    const { response, request, error } = deleteHospital(hospitalId.value);
    await request();

    if (error.value) {
      console.error("Error al eliminar hospital:", error.value);
      return;
    }

    if (response.value) {
      emit("hospital-deleted");

      window.dispatchEvent(new Event("hospital-deleted"));

      closeModal("eliminarHospital");
    }
  } catch (err) {
    console.error("Error inesperado al eliminar hospital:", err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.delete-hospital {
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
    margin-bottom: 0.5rem;
  }

  &__hospital-name {
    @include label-base;
    font-weight: 600;
    font-size: 1rem;
    line-height: 1.5rem;
    color: $color-primary;
    margin-bottom: 0.5rem;
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
