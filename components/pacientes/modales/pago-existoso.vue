<template>
  <AtomsModalBase
    :isOpen="isModalOpen"
    title="¡Pago Exitoso!"
    size="small"
    @close="closeModal"
  >
    <template #title>
      <h2 class="payment-successes-modal__header">Reservar una Cita</h2>
    </template>
    <div class="payment-successes-modal__content">
      <div>
        <AtomsIconsCircleCheckBigIcon
          size="24"
          class="payment-successes-modal__icon"
        />
        <div>
          <h3 class="payment-successes-modal__title">
            ¡Pago Exitoso y Cita Confirmada!
          </h3>
          <p class="payment-successes-modal__subtext">
            ¡Todo está listo para tu consulta!
          </p>
        </div>
      </div>

      <table class="payment-successes-modal__table">
        <tbody class="payment-successes-modal__table-body">
          <tr>
            <td class="payment-successes-modal__table--label">
              Tipo de servicio:
            </td>
            <td class="payment-successes-modal__table--value">
              Cita de valoración
            </td>
          </tr>
          <tr>
            <td class="payment-successes-modal__table--label">
              Fecha de la cita:
            </td>
            <td class="payment-successes-modal__table--value">
              <time :datetime="appointment.application_date">
                {{
                  new Date(appointment.application_date).toLocaleDateString()
                }}
              </time>
            </td>
          </tr>
          <tr class="payment-successes-modal__table--row">
            <td class="payment-successes-modal__table--label">
              Hora de la cita:
            </td>
            <td class="payment-successes-modal__table--value">
              {{ appointment.appointment_hour }}
            </td>
          </tr>
          <tr>
            <td class="payment-successes-modal__table--label">
              Paciente titular:
            </td>
            <td class="payment-successes-modal__table--value">
              {{ appointment.customer.name }}
            </td>
          </tr>
          <tr>
            <td class="payment-successes-modal__table--label">
              Telefono contacto:
            </td>
            <td class="payment-successes-modal__table--value">
              {{ appointment.customer.phone_number }}
            </td>
          </tr>
          <tr>
            <td class="payment-successes-modal__table--label">
              Personal médico:
            </td>
            <td class="payment-successes-modal__table--value">
              {{ appointment.supplier.name }}
            </td>
          </tr>
          <tr>
            <td class="payment-successes-modal__table--label">
              Procedimiento:
            </td>
            <td class="payment-successes-modal__table--value">
              {{ appointment.package.procedure.name }}
            </td>
          </tr>
          <tr>
            <td class="payment-successes-modal__table--label">Monto Pagado:</td>
            <td class="payment-successes-modal__table--value">
              {{
                appointment.appointment_type.code === "VALORATION_APPOINTMENT"
                  ? formatCurrency("18000")
                  : formatCurrency(appointment.price_procedure)
              }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <template #footer>
      <div class="payment-successes-modal__footer">
        <button class="payment-successes-modal__button--outline">
          Descargar Comprobante
        </button>
        <button
          class="payment-successes-modal__button--primary"
          @click="closeModal"
        >
          Ver en citas
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useCurrency } from "~/composables/useCurrency";
import type { ModalName } from "~/types";
import type { Appointment } from "~/types/appointment";

const { formatCurrency } = useCurrency();

interface Props {
  appointment: Appointment;
  isOpen: boolean;
}

interface Emits {
  (e: "open-modal", modalName: ModalName): void;
  (e: "close-modal", modalName: ModalName): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isModalOpen = computed({
  get: () => props.isOpen,
  set: (value: boolean) => {
    if (!value) {
      emit("close-modal", "successfulPayment");
    }
  },
});

const closeModal = (): void => {
  emit("close-modal", "successfulPayment");
};
</script>

<style lang="scss" scoped>
.payment-successes-modal {
  &__header {
    @include label-base;
    font-family: Montserrat;
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    color: #353e5c;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 26px;
    padding: 24px;
  }

  &__icon {
    border-radius: 50%;
    width: 48px;
    height: 48px;
    background: #d1fadf;
    border: 8px solid #ecfdf3;
    color: #039855;
    margin-bottom: 12px;
    padding: 3.6px;
  }

  &__title {
    @include label-base;
    font-weight: 700;
    font-size: 24px;
    line-height: 29.5px;
    color: $color-foreground;
  }

  &__subtext {
    @include label-base;
    font-weight: 400;
    font-size: 18px;
    line-height: 24px;
    color: #6d758f;
  }

  &__table {
    width: 100%;
    border-collapse: separate;
    padding: 20px;
    background-color: #f8faff;
    border-radius: 20px;

    &--row {
      td {
        border-bottom: 1px solid #e1e4ed;
      }
    }

    &--label {
      font-family: $font-family-main;
      font-weight: 300;
      font-size: 16px;
      line-height: 20px;
      letter-spacing: 0;
      color: #6d758f;
      padding: 6px 0px;
    }

    &--value {
      font-family: $font-family-main;
      font-weight: 500;
      font-size: 16px;
      line-height: 20px;
      letter-spacing: 0;
      color: $color-foreground;
      padding: 6px 0px;
    }
  }

  &__footer {
    width: 100%;
    display: flex;
    gap: 12px;
  }

  &__button {
    &--outline {
      @include outline-button;
      width: 100%;
      font-weight: 600;
      font-size: 16px;
      line-height: 24px;
      padding: 12px 0px;
    }

    &--primary {
      @include primary-button;
      width: 100%;
      font-weight: 600;
      font-size: 16px;
      line-height: 24px;
      letter-spacing: 0;
      padding: 12px 0px;
    }
  }
}
</style>
