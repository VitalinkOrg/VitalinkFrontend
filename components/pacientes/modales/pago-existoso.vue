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
              {{ appointment.package?.procedure?.name }}
            </td>
          </tr>
          <tr>
            <td class="payment-successes-modal__table--label">Monto Pagado:</td>
            <td class="payment-successes-modal__table--value">
              {{
                appointment.appointment_type.code === "VALORATION_APPOINTMENT"
                  ? formatCurrency(18000)
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
import { useFormat } from "~/composables/useFormat";
import type { ModalName } from "~/types";
import type { Appointment } from "~/types/appointment";

const { formatCurrency } = useFormat();

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
    font-size: 1.25rem;
    line-height: 1.75rem;
    color: #353e5c;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 1.625rem;
    padding: 1.5rem;
  }

  &__icon {
    border-radius: 50%;
    width: 3rem;
    height: 3rem;
    background: #d1fadf;
    border: 0.5rem solid #ecfdf3;
    color: #039855;
    margin-bottom: 0.75rem;
    padding: 0.225rem;
  }

  &__title {
    @include label-base;
    font-weight: 700;
    font-size: 1.5rem;
    line-height: 1.84375rem;
    color: $color-foreground;
  }

  &__subtext {
    @include label-base;
    font-weight: 400;
    font-size: 1.125rem;
    line-height: 1.5rem;
    color: $color-text-secondary;
  }

  &__table {
    width: 100%;
    border-collapse: separate;
    padding: 1.25rem;
    background-color: #f8faff;
    border-radius: 1.25rem;

    &--row {
      td {
        border-bottom: 0.0625rem solid #e1e4ed;
      }
    }

    &--label {
      font-family: $font-family-main;
      font-weight: 300;
      font-size: 1rem;
      line-height: 1.25rem;
      letter-spacing: 0;
      color: $color-text-secondary;
      padding: 0.375rem 0;
    }

    &--value {
      font-family: $font-family-main;
      font-weight: 500;
      font-size: 1rem;
      line-height: 1.25rem;
      letter-spacing: 0;
      color: $color-foreground;
      padding: 0.375rem 0;
    }
  }

  &__footer {
    width: 100%;
    display: flex;
    gap: 0.75rem;
  }

  &__button {
    &--outline {
      @include outline-button;
      width: 100%;
      font-weight: 600;
      font-size: 1rem;
      line-height: 1.5rem;
      padding: 0.75rem 0;
    }

    &--primary {
      @include primary-button;
      width: 100%;
      font-weight: 600;
      font-size: 1rem;
      line-height: 1.5rem;
      letter-spacing: 0;
      padding: 0.75rem 0;
    }
  }
}
</style>
