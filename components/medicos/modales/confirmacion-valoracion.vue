<template>
  <AtomsModalBase
    :is-open="isVisible"
    size="extra-small"
    class="valoration-confirmation"
    :close-on-backdrop="false"
    role="alertdialog"
    aria-labelledby="valoration-confirmation-title"
    aria-describedby="valoration-confirmation-description"
    @close="dismissModal"
  >
    <template #title>
      <div class="valoration-confirmation__icon-wrapper" aria-hidden="true">
        <AtomsIconsTriangleAlertIcon />
      </div>
    </template>

    <section class="valoration-confirmation__body">
      <h2
        id="valoration-confirmation-title"
        class="valoration-confirmation__heading"
      >
        ¿Está seguro de continuar?
      </h2>
      <p
        id="valoration-confirmation-description"
        class="valoration-confirmation__description"
      >
        Con estos cambios el estado de la
        <strong>reserva de la cita pasará de:</strong> pendiente a
        <strong>"Valorado"</strong>
      </p>
    </section>

    <template #footer>
      <div
        class="valoration-confirmation__actions"
        role="group"
        aria-label="Acciones de confirmación"
      >
        <button
          type="button"
          :disabled="isSubmitting"
          class="valoration-confirmation__action valoration-confirmation__action--cancel"
          @click="dismissModal"
        >
          No, volver
        </button>
        <button
          type="button"
          :disabled="isSubmitting"
          :aria-busy="isSubmitting"
          class="valoration-confirmation__action valoration-confirmation__action--confirm"
          @click="submitValoration"
        >
          <span v-if="isSubmitting">Procesando...</span>
          <span v-else>Continuar</span>
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useAppointment } from "@/composables/api";

interface ValorationSharedData {
  appointment: IAppointment;
  priceProcedure: string;
  recommendation: string;
  diagnostic: string;
  proformaCode: string;
}

const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");

const logger = useLogger("ValorationConfirmation");
const toast = useToast();

const { isOpen, closeModal, getSharedData, openModal } =
  useMedicalModalManager();

const { uploadProforma } = useAppointment();

const isSubmitting = ref(false);

const isVisible = computed(() => isOpen.confirmValoration);

const modalPayload = computed(() =>
  getSharedData<ValorationSharedData>("confirmValoration"),
);

const hasRequiredFields = computed(() => {
  const { priceProcedure, recommendation, diagnostic } = modalPayload.value;
  return Boolean(priceProcedure && recommendation && diagnostic);
});

function dismissModal(): void {
  closeModal("confirmValoration");
}

function buildProformaPayload(
  data: ValorationSharedData,
): IUploadProformaRequest {
  console.log("[PAYLOAD]", {
    price_procedure: data.priceProcedure,
    recommendation_post_appointment: data.recommendation,
    diagnostic: data.diagnostic,
    appointment_result_code: "FIT_FOR_PROCEDURE",
    proforma_file_code: data.proformaCode,
  });
  return {
    price_procedure: data.priceProcedure,
    recommendation_post_appointment: data.recommendation,
    diagnostic: data.diagnostic,
    appointment_result_code: "FIT_FOR_PROCEDURE",
    proforma_file_code: data.proformaCode,
  };
}

function transitionToSuccessModal(appointment: IAppointment): void {
  dismissModal();
  closeModal("detallesValoracion");
  openModal("exitoConfirmacion", { appointment });
}

async function submitValoration(): Promise<void> {
  if (!hasRequiredFields.value) {
    toast.warning("Complete todos los campos requeridos antes de continuar.");
    return;
  }

  const currentData = modalPayload.value;

  if (!currentData.appointment) {
    logger.error("No se encontró la cita asociada a la valoración.");
    toast.error("No se encontró la cita. Intente nuevamente.");
    return;
  }

  const payload = buildProformaPayload(currentData);

  isSubmitting.value = true;

  try {
    const { data, error } = await uploadProforma(
      currentData.appointment.id,
      payload,
    );

    if (error) {
      logger.error("Error al subir la proforma.", {
        appointmentId: currentData.appointment.id,
        error,
      });
      toast.error(
        "Ocurrió un error al procesar la valoración. Intente nuevamente.",
      );
      return;
    }

    if (data) {
      await refreshAppointments?.();
      transitionToSuccessModal(currentData.appointment);
    }
  } catch (exception) {
    const errorMessage =
      exception instanceof Error ? exception.message : String(exception);

    logger.error("Excepción inesperada al confirmar la valoración.", {
      message: errorMessage,
    });
    toast.error("Ocurrió un error inesperado. Intente nuevamente.");
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style lang="scss" scoped>
.valoration-confirmation {
  &__icon-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 3rem;
    height: 3rem;
    border: 0.5rem solid $color-warning;
    background-color: #fef0c7;
    border-radius: 50%;

    svg {
      color: #dc6803;
    }
  }

  &__body {
    padding: 1.25rem 1.5rem 0;
  }

  &__heading {
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
    display: flex;
    gap: 0.75rem;
    width: 100%;
  }

  &__action {
    width: 100%;

    &--cancel {
      @include outline-button;
      width: 100%;
    }

    &--confirm {
      @include primary-button;
      width: 100%;
    }
  }
}
</style>
