<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    size="extra-small"
    class="confirmar-codigo"
    @close="handleCloseModal"
  >
    <div class="confirmar-codigo__content">
      <h2 class="confirmar-codigo__title">Confirmar uso de código</h2>

      <p class="confirmar-codigo__message">
        ¿Desea confirmar el canje del código válido por un crédito de
        <strong class="confirmar-codigo__amount">{{
          formatCurrency(creditAmount, { decimalPlaces: 0 })
        }}</strong
        >?
      </p>

      <div v-if="errorMessage" class="confirmar-codigo__error">
        {{ errorMessage }}
      </div>
    </div>

    <template #footer>
      <div class="confirmar-codigo__actions">
        <button
          class="confirmar-codigo__button confirmar-codigo__button--outline"
          @click="handleCloseModal"
          :disabled="isLoading"
          aria-label="Cancelar confirmación"
        >
          No
        </button>
        <button
          class="confirmar-codigo__button confirmar-codigo__button--primary"
          @click="handleConfirm"
          :disabled="isLoading"
          aria-label="Confirmar uso de código"
        >
          {{ isLoading ? "Procesando..." : "Sí" }}
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useAppointmentCredit } from "@/composables/api";
import { useMedicalModalManager } from "@/composables/useMedicalModalManager";

interface ModalData {
  creditId: number;
  creditAmount: number;
  onSuccess?: () => void;
}

const { isOpen, closeModal, getSharedData } = useMedicalModalManager();
const { updateAppointmentCredit } = useAppointmentCredit();
const { formatCurrency } = useFormat();

const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");

const isModalOpen = computed(() => isOpen.confirmarCodigo);

const modalData = computed(() => getSharedData<ModalData>("confirmarCodigo"));

const creditId = computed(() => modalData.value?.creditId ?? null);
const creditAmount = computed(() => modalData.value?.creditAmount ?? 0);

const isLoading = ref<boolean>(false);
const errorMessage = ref<string>("");

const handleCloseModal = () => {
  if (!isLoading.value) {
    closeModal("confirmarCodigo");
    resetState();
  }
};

const resetState = () => {
  isLoading.value = false;
  errorMessage.value = "";
};

const handleConfirm = async () => {
  errorMessage.value = "";

  if (!creditId.value) {
    errorMessage.value = "No se encontró el crédito a confirmar";
    return;
  }

  try {
    isLoading.value = true;

    const payload = {
      already_been_used: 1,
    };

    const api = updateAppointmentCredit(payload, creditId.value);
    await api.request();

    if (api.error && api.error.value) {
      throw new Error(api.error.value.info);
    }

    await refreshAppointments?.();

    modalData.value?.onSuccess?.();

    handleCloseModal();
  } catch (err: any) {
    errorMessage.value =
      "Error al confirmar el uso del crédito. Intente nuevamente.";
    console.error("Error confirming credit usage:", err);
  } finally {
    isLoading.value = false;
  }
};

watch(isModalOpen, (newValue) => {
  if (!newValue) {
    resetState();
  }
});
</script>

<style lang="scss" scoped>
.confirmar-codigo {
  &__content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 1.5rem;
    line-height: 2rem;
    color: $color-foreground;
    margin: 0;
  }

  &__message {
    @include label-base;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: $color-text-secondary;
    margin: 0;
  }

  &__amount {
    font-weight: 600;
    color: $color-foreground;
  }

  &__error {
    @include label-base;
    color: #dc2626;
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.75rem;
    background-color: #fef2f2;
    border-radius: 0.375rem;
    border: 1px solid #fecaca;
    margin: 0;
  }

  &__actions {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__button {
    &--outline {
      @include outline-button;
      flex: 1;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    &--primary {
      @include primary-button;
      flex: 1;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
}
</style>
