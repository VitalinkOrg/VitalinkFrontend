<template>
  <AtomsModalBase
    :is-open="modalManager.isOpen.rejection"
    @close="modalManager.closeModal('rejection')"
    size="extra-small"
    :close-on-backdrop="false"
  >
    <template #title>
      <img
        src="@/src/assets/trash.svg"
        alt="Alerta"
        class="credit-rejection__alert-icon"
      />
    </template>
    <div class="credit-rejection">
      <h5 class="credit-rejection__title">
        ¿Seguro que quieres rechazar esta solicitud?
      </h5>

      <p class="credit-rejection__description">
        ¿Está seguro de rechazar esta solicitud? Al rechazar, el paciente
        recibirá un voucher de descuento de Vitalink.
      </p>
    </div>

    <template #footer>
      <div class="credit-rejection__actions">
        <button
          class="credit-rejection__button credit-rejection__button--outline"
          @click="handleGoBack"
          :disabled="isLoading"
        >
          Volver
        </button>
        <button
          class="credit-rejection__button credit-rejection__button--danger"
          @click="handleConfirm"
          :disabled="isLoading"
        >
          {{ isLoading ? "Procesando..." : "Si, rechazar y enviar voucher" }}
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useAppointmentCredit } from "@/composables/api";
import { useModalManager } from "@/composables/useModalManager";

const { updateAppointmentCredit } = useAppointmentCredit();
const modalManager = useModalManager();
const isLoading = ref<boolean>(false);

const handleConfirm = async () => {
  if (!modalManager.credit.value) return;

  try {
    isLoading.value = true;

    const payload = {
      appointment: modalManager.credit.value.appointment.id,
      credit_status_code: "REJECTED",
    };

    const api = updateAppointmentCredit(
      payload,
      modalManager.credit.value.id as number
    );
    await api.request();

    const response = api.response.value;

    if (!response || api.error.value) {
      throw new Error("Error rejecting credit request");
    }

    // Refresh credits if function is available
    if (modalManager.refreshCredits.value) {
      await modalManager.refreshCredits.value();
    }

    modalManager.closeModal("rejection");
    modalManager.openModal("success");
  } catch (error) {
    console.error("Error rejecting credit request:", error);
  } finally {
    isLoading.value = false;
  }
};

const handleGoBack = () => {
  modalManager.closeModal("rejection");
  modalManager.openModal("details");
};
</script>

<style lang="scss" scoped>
.credit-rejection {
  width: 100%;
  padding: 0px 24px;

  &__alert-icon {
    height: 3rem;
    margin-bottom: 1rem;
  }

  &__title {
    font-weight: 600;
    font-size: 20px;
    line-height: 30px;
    letter-spacing: 0;
    color: #19213d;
  }

  &__description {
    font-weight: 500;
    font-size: 14px;
    line-height: 24px;
    letter-spacing: 0;
    color: #6d758f;
  }

  &__actions {
    display: flex;
    justify-content: space-between;
    gap: 0.5rem;
    width: 100%;
  }

  &__button {
    &--danger {
      @include danger-button;
      text-wrap: nowrap;
      font-weight: 600;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0;
      padding: 10px 16px;
      width: 100%;
    }

    &--outline {
      @include outline-button;
      text-wrap: nowrap;
      font-weight: 600;
      font-size: 14px;
      line-height: 20px;
      letter-spacing: 0%;
      padding: 10px 16px;
      width: 100%;
    }
  }
}
</style>
