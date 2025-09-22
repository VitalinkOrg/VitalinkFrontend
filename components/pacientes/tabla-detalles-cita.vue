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
          {{ formatDate(appointment.appointment_date) }}
        </td>
      </tr>

      <tr v-if="!canShowHourAndTime" class="appointment-table__row">
        <td class="appointment-table__label">Hora de la cita:</td>
        <td class="appointment-table__value">
          {{ formatTime(appointment.appointment_hour) }}
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
          {{ appointment.customer.phone_number }}
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
            @click="downloadProform"
          >
            <AtomsIconsDownloadIcon />
            Descargar Proforma
          </button>
        </td>
      </tr>

      <tr
        v-if="
          appointment.appointment_status.code ===
          'VALUED_VALORATION_APPOINTMENT'
        "
      >
        <td class="appointment-table__label">Apto para crédito:</td>
        <td class="appointment-table__value">
          {{ isCreditDisabled ? "No" : "Sí" }}
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
            appointment.appointment_type.code === "PROCEDURE_APPOINTMENT"
              ? formatCurrency(appointment.price_procedure)
              : formatCurrency(appointment.price_valoration_appointment)
          }}
        </td>
      </tr>

      <tr>
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
            formatCurrency(appointment.appointment_credit?.approved_amount) ||
            formatCurrency("0.00")
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
          {{ formatCurrency(calculateBalance()) }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts" setup>
import type { Appointment } from "~/types/appointment";

const token = useCookie("token");
const config = useRuntimeConfig();

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

const formatCurrency = (amount: number | string): string => {
  const numericAmount = Number(amount) || 0;
  return (
    "₡" +
    numericAmount.toLocaleString("es-CR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

const downloadProform = async () => {
  try {
    const response = await $fetch<ArrayBuffer>(
      config.public.API_BASE_URL + "/document/get_by_code",
      {
        method: "GET",
        headers: {
          Authorization: token.value ?? "",
        },
        query: {
          code: props.appointment.proforma_file_code,
        },
        responseType: "blob",
      }
    );

    const blob = new Blob([response]);
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;

    link.download = `proforma_${props.appointment.proforma_file_code}.pdf`;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error descargando archivo:", error);
  }
};

const isCreditDisabled = computed(() => {
  return (
    props.appointment.appointment_credit?.credit_status?.code === "REQUIRED"
  );
});

const formatDate = (date: string | Date): string => {
  const dateObj = new Date(date);
  const formatted = dateObj.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const formatTime = (time: string): string => {
  if (!time) return "";

  const parts = time.split(":");
  if (parts.length < 2) return time;

  const hours = parts[0];
  const minutes = parts[1];

  return `${hours}:${minutes} hs`;
};
</script>

<style lang="scss" scoped>
.appointment-table {
  width: 100%;
  margin: 1.5rem 0;
  border-collapse: separate;
  font-size: 0.9rem;
  background-color: #f8faff;
  border-radius: 20px;
  gap: 5px;
  padding: 10px 20px;
  border-spacing: 0;
  overflow: hidden;

  &__row {
    td {
      border-bottom: 1px solid #e1e4ed;
    }
  }

  &__label,
  &__value {
    padding: $spacing-sm 0;
    vertical-align: top;
    font-size: 14px;
  }

  &__label {
    font-family: $font-family-main;
    font-weight: 300;
    font-size: 16px;
    line-height: 20px;
    color: #6d758f;
    padding: 10px;
  }

  &__value {
    font-family: $font-family-main;
    font-weight: 500;
    font-size: 16px;
    line-height: 20px;
    color: $color-foreground;
    padding: 10px;
  }

  &__payment-status {
    display: inline-block;
    margin-right: 6px;
    width: 8px;
    height: 8px;
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
      padding: 8px 14px;
    }
  }

  &__textarea {
    width: 100%;
    height: 128px;
    border-radius: 8px;
    border: 1px solid #d0d5dd;
    background-color: #f9fafb;
    box-shadow: 0px 1px 2px 0px #1018280d;
    padding: 10px 14px;

    font-family: $font-family-main;
    font-size: 16px;
    font-weight: 400;
    line-height: 24px;
    letter-spacing: 0;
    color: #667085;

    resize: vertical;
    outline: none;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;

    &:focus {
      border-color: #4338ca;
      box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.3);
      outline: 2px solid transparent;
      outline-offset: 2px;
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
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
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
    background-color: #fac6d0;
    color: $color-foreground;
  }
}
</style>
