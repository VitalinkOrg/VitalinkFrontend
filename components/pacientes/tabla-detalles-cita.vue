<template>
  <table class="appointment-table">
    <tbody>
      <tr :class="canShowHourAndTime ? 'appointment-table__row' : ''">
        <td class="appointment-table__label">Tipo de servicio:</td>
        <td class="appointment-table__value">
          {{
            appointment.appointment_type.code === "PROCEDURE_APPOINTMENT"
              ? "Cita de procedimiento"
              : appointment.appointment_type.code ===
                    "VALORATION_APPOINTMENT" &&
                  appointment.appointment_status.code ===
                    "VALUED_VALORATION_APPOINTMENT"
                ? "Procedimiento médico"
                : "Cita de valoración"
          }}
        </td>
      </tr>

      <tr v-if="!canShowHourAndTime">
        <td class="appointment-table__label">Fecha de la cita:</td>
        <td class="appointment-table__value">
          {{ formatDate(appointment.application_date) }}
        </td>
      </tr>

      <tr v-if="!canShowHourAndTime" class="appointment-table__row">
        <td class="appointment-table__label">Hora de la cita:</td>
        <td class="appointment-table__value">
          {{ formatTime(appointment.appointment_hour, "hs") }}
        </td>
      </tr>

      <tr>
        <td class="appointment-table__label">Paciente titular:</td>
        <td class="appointment-table__value">
          {{ appointment.customer.name }}
        </td>
      </tr>

      <tr>
        <td class="appointment-table__label">Teléfono de Contacto:</td>
        <td class="appointment-table__value">
          {{
            formatPhone(
              appointment.phone_number_external_user ??
                appointment.customer.phone_number
            )
          }}
        </td>
      </tr>

      <tr>
        <td class="appointment-table__label">Profesional Médico:</td>
        <td class="appointment-table__value">
          {{ appointment.supplier.name }}
        </td>
      </tr>

      <tr>
        <td class="appointment-table__label">Procedimiento:</td>
        <td class="appointment-table__value">
          {{ appointment.package?.procedure?.name }}
        </td>
      </tr>

      <tr>
        <td class="appointment-table__label">Estado:</td>
        <td class="appointment-table__value">
          <span class="status-badge" :class="getStatusClass()">
            {{ getStatusText() }}
          </span>
        </td>
      </tr>

      <tr
        v-if="
          appointment.appointment_status.code ===
          'VALUED_VALORATION_APPOINTMENT'
        "
      >
        <td class="appointment-table__label">Conclusión de valoración:</td>
        <td class="appointment-table__value">
          <span
            class="appointment-table__payment-status"
            :class="setPaymentStatusClass(appointment)"
          ></span>
          {{ appointment?.appointment_result?.name }}
        </td>
      </tr>

      <tr
        v-if="
          appointment.appointment_status.code ===
          'VALUED_VALORATION_APPOINTMENT'
        "
        class="appointment-table__row"
      >
        <td class="appointment-table__label">Proforma:</td>
        <td class="appointment-table__value">
          <button
            class="appointment-table__button--outline"
            :disabled="isLoadingProforma"
            @click="downloadProforma"
          >
            <AtomsIconsDownloadIcon />
            Descargar Proforma
          </button>
        </td>
      </tr>

      <tr v-if="canShowCreditStatus">
        <td class="appointment-table__label">Apto para crédito:</td>
        <td class="appointment-table__value">
          {{ isCreditDisabled ? "Sí" : "No" }}
        </td>
      </tr>

      <tr
        v-if="
          appointment.appointment_type.code !== 'VALORATION_APPOINTMENT' &&
          appointment.appointment_status.code !==
            'VALUED_VALORATION_APPOINTMENT'
        "
      >
        <td class="appointment-table__label">Procedimiento:</td>
        <td class="appointment-table__value">
          {{ appointment.package?.procedure?.name }}
        </td>
      </tr>

      <tr>
        <td class="appointment-table__label">
          {{
            appointment.appointment_type.code === "PROCEDURE_APPOINTMENT"
              ? "Monto del procedimiento"
              : "Costo del servicio"
          }}:
        </td>
        <td class="appointment-table__value">
          {{
            appointment.appointment_type.code === "PROCEDURE_APPOINTMENT" ||
            appointment.appointment_status.code ===
              "VALUED_VALORATION_APPOINTMENT"
              ? formatCurrency(appointment.price_procedure, {
                  decimalPlaces: 0,
                })
              : formatCurrency(appointment.price_valoration_appointment, {
                  decimalPlaces: 0,
                })
          }}
        </td>
      </tr>

      <tr
        v-if="
          appointment.appointment_status.code !==
            'VALUED_VALORATION_APPOINTMENT' &&
          appointment.appointment_status.code !==
            'PENDING_VALORATION_APPOINTMENT'
        "
      >
        <td class="appointment-table__label">Estado de pago:</td>
        <td
          v-if="!appointment.appointment_credit"
          class="appointment-table__value"
        >
          <span
            class="appointment-table__payment-status"
            :class="setPaymentStatusClass(appointment)"
          ></span>
          {{ setPaymentValueName(appointment) }}
        </td>
        <td v-else class="appointment-table__value">Cubierto por el crédito</td>
      </tr>

      <tr v-if="appointment.appointment_status.code === 'CANCEL_APPOINTMENT'">
        <td class="appointment-table__label">Recomendaciones o anotaciones:</td>
        <td class="appointment-table__value">
          <textarea
            id="appointment-recommendations"
            class="appointment-table__textarea"
            name="recommendations"
            aria-labelledby="recommendations-label"
            aria-readonly="true"
            aria-describedby="recommendations-hint"
            :value="
              appointment.recommendation_post_appointment ??
              'No hay recomendaciones'
            "
            disabled
            readonly
          ></textarea>
        </td>
      </tr>

      <tr
        v-if="
          appointment.appointment_credit &&
          appointment.appointment_type.code !== 'PROCEDURE_APPOINTMENT'
        "
      >
        <td class="appointment-table__label">Crédito aprobado:</td>
        <td class="appointment-table__value">
          {{
            formatCurrency(appointment.appointment_credit?.approved_amount, {
              decimalPlaces: 0,
            }) || formatCurrency("0", { decimalPlaces: 0 })
          }}
        </td>
      </tr>

      <tr
        v-if="
          appointment.appointment_credit &&
          appointment.appointment_type.code !== 'PROCEDURE_APPOINTMENT'
        "
      >
        <td class="appointment-table__label">Saldo pendiente:</td>
        <td class="appointment-table__value">
          {{ formatCurrency(calculateBalance(), { decimalPlaces: 0 }) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import { useAppointment } from "@/composables/api";
import type { Appointment } from "@/types/appointment";

const { formatCurrency, formatPhone, formatDate, formatTime } = useFormat();
const { fetchDocumentByCode } = useAppointment();

interface Props {
  appointment: Appointment;
}

const props = defineProps<Props>();

const calculateBalance = () => {
  return (
    Number(props.appointment.price_procedure) -
    Number(props.appointment.appointment_credit?.approved_amount || 0)
  );
};

const canShowHourAndTime = computed(() => {
  return (
    props.appointment.appointment_status.code ===
      "VALUED_VALORATION_APPOINTMENT" &&
    props.appointment.appointment_type.code === "VALORATION_APPOINTMENT" &&
    props.appointment.appointment_result?.code === "FIT_FOR_PROCEDURE"
  );
});

const isLoadingProforma = ref<boolean>(false);

const getStatusClass = () => {
  const statusMap: Record<
    | "CANCEL_APPOINTMENT"
    | "PENDING_VALORATION_APPOINTMENT"
    | "PENDING_PROCEDURE"
    | "CONFIRM_PROCEDURE"
    | "CONCRETED_APPOINTMENT"
    | "VALUED_VALORATION_APPOINTMENT"
    | "CONFIRM_VALIDATION_APPOINTMENT"
    | "VALUATION_PENDING_VALORATION_APPOINTMENT"
    | "WAITING_PROCEDURE",
    string
  > = {
    CANCEL_APPOINTMENT: "status-badge--cancelled",
    PENDING_VALORATION_APPOINTMENT: "status-badge--warning",
    PENDING_PROCEDURE: "status-badge--warning",
    CONFIRM_PROCEDURE: "status-badge--primary",
    CONCRETED_APPOINTMENT: "status-badge--primary",
    VALUED_VALORATION_APPOINTMENT: "status-badge--success",
    CONFIRM_VALIDATION_APPOINTMENT: "status-badge--success",
    VALUATION_PENDING_VALORATION_APPOINTMENT: "status-badge--primary",
    WAITING_PROCEDURE: "status-badge--warning",
  };
  return (
    statusMap[
      props.appointment.appointment_status.code as keyof typeof statusMap
    ] || ""
  );
};

const getStatusText = () => {
  return props.appointment.appointment_status.value1;
};

const PAID_STATUS_CLASSES = {
  PENDING: "appointment-table__payment-status--pending",
  PAID: "appointment-table__payment-status--paid",
  NOT_PAID: "appointment-table__payment-status--not-paid",
};

const setPaymentStatusClass = (appointment: Appointment) => {
  const paymentStatusCode = appointment.payment_status.code;
  const appointmentStatusCode = appointment.appointment_status.code;

  if (
    paymentStatusCode === "PAYMENT_STATUS_PAID_VALORATION_APPOINTMENT" ||
    paymentStatusCode === "PAYMENT_STATUS_PAID_PROCEDURE"
  )
    return PAID_STATUS_CLASSES.PAID;

  if (appointmentStatusCode === "CANCEL_APPOINTMENT")
    return PAID_STATUS_CLASSES.NOT_PAID;

  if (
    appointmentStatusCode === "PENDING_VALORATION_APPOINTMENT" ||
    appointmentStatusCode === "PENDING_PROCEDURE"
  )
    return PAID_STATUS_CLASSES.PENDING;

  if (
    paymentStatusCode === "PAYMENT_STATUS_NOT_PAID_VALORATION_APPOINTMENT" ||
    paymentStatusCode === "PAYMENT_STATUS_NOT_PAID_PROCEDURE"
  )
    return PAID_STATUS_CLASSES.PAID;

  return PAID_STATUS_CLASSES.NOT_PAID;
};

const setPaymentValueName = (appointment: Appointment) => {
  const paymentStatusCode = appointment.payment_status.code;
  const appointmentStatusCode = appointment.appointment_status.code;

  if (
    paymentStatusCode === "PAYMENT_STATUS_PAID_VALORATION_APPOINTMENT" ||
    paymentStatusCode === "PAYMENT_STATUS_PAID_PROCEDURE"
  )
    return "Pagado";

  if (appointmentStatusCode === "CANCEL_APPOINTMENT") return "No Pagada";

  if (
    appointmentStatusCode === "PENDING_VALORATION_APPOINTMENT" ||
    appointmentStatusCode === "PENDING_PROCEDURE"
  )
    return "Pendiente";

  if (
    paymentStatusCode === "PAYMENT_STATUS_NOT_PAID_VALORATION_APPOINTMENT" ||
    paymentStatusCode === "PAYMENT_STATUS_NOT_PAID_PROCEDURE"
  )
    return "Pendiente de pago";

  return "No Pagada";
};

const downloadProforma = async () => {
  try {
    isLoadingProforma.value = true;
    if (!props.appointment.proforma_file_code)
      throw new Error("No proforma file code");

    const api = fetchDocumentByCode(props.appointment.proforma_file_code);
    await api.request();

    const response = api.response.value;
    const error = api.error.value;

    if (response?.data?.url) {
      const link = document.createElement("a");
      link.href = response.data.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    if (error) throw new Error(error.raw);
  } catch (error) {
    console.error("Error descargando archivo:", error);
  } finally {
    isLoadingProforma.value = false;
  }
};

const isCreditDisabled = computed(() => {
  if (!props.appointment.appointment_credit) return false;
  if (props.appointment.appointment_credit.credit_status?.code === "REJECTED")
    return false;
  return true;
});

const canShowCreditStatus = computed(() => {
  if (!props.appointment.appointment_credit) return false;
  if (
    props.appointment.appointment_status.code ===
      "VALUED_VALORATION_APPOINTMENT" &&
    props.appointment.appointment_credit?.credit_status_code !== "REQUIRED"
  )
    return true;
});
</script>

<style lang="scss" scoped>
.appointment-table {
  width: 100%;
  margin: 1.5rem 0;
  border-collapse: separate;
  font-size: 0.9rem;
  background-color: #f8faff;
  border-radius: 1.25rem;
  gap: 0.3125rem;
  padding: 0.625rem 1.25rem;
  border-spacing: 0;
  overflow: hidden;

  &__row {
    td {
      border-bottom: 0.0625rem solid #e1e4ed;
    }
  }

  &__label,
  &__value {
    padding: $spacing-sm 0;
    vertical-align: top;
    font-size: 0.875rem;
  }

  &__label {
    font-family: $font-family-main;
    font-weight: 300;
    font-size: 1rem;
    line-height: 1.25rem;
    color: $color-text-secondary;
    padding: 0.625rem;
  }

  &__value {
    font-family: $font-family-main;
    font-weight: 500;
    font-size: 1rem;
    line-height: 1.25rem;
    color: $color-foreground;
    padding: 0.625rem;
  }

  &__payment-status {
    display: inline-block;
    margin-right: 0.375rem;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;

    &--pending {
      background-color: #fdb022;
    }

    &--paid {
      background-color: #12b76a;
    }
    &--not-paid {
      background-color: #f04438;
    }
  }

  &__button {
    &--outline {
      @include outline-button;
      padding: 0.5rem 0.875rem;
    }
  }

  &__textarea {
    width: 100%;
    height: 8rem;
    border-radius: 0.5rem;
    border: 0.0625rem solid #d0d5dd;
    background-color: #f9fafb;
    box-shadow: 0 0.0625rem 0.125rem 0 #1018280d;
    padding: 0.625rem 0.875rem;

    font-family: $font-family-main;
    font-size: 1rem;
    font-weight: 400;
    line-height: 1.5rem;
    letter-spacing: 0;
    color: $color-text-muted;

    resize: vertical;
    outline: none;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &:focus {
      border-color: #4338ca;
      box-shadow: 0 0 0 0.1875rem rgba(67, 56, 202, 0.3);
      outline: 0.125rem solid transparent;
      outline-offset: 0.125rem;
    }

    &:disabled {
      background-color: #f2f4f7;
      color: #98a2b3;
      border-color: #d0d5dd;
      cursor: not-allowed;
    }

    &::placeholder {
      color: #98a2b3;
      opacity: 1;
    }
  }
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 0.75rem;
  font-size: 0.75rem;
  font-weight: 500;

  &--success {
    background-color: #dcfce7;
    color: $color-foreground;
  }

  &--warning {
    background-color: #fef3c7;
    color: $color-foreground;
  }

  &--primary {
    background-color: #dbeafe;
    color: $color-foreground;
  }

  &--cancelled {
    background-color: $color-cancel;
    color: $color-foreground;
  }
}
</style>
