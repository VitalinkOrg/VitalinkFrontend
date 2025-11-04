<template>
  <AtomsModalBase
    :isOpen="isOpen"
    size="medium"
    @close="handleCloseModal('appointmentDetails')"
    :close-on-backdrop="false"
    header-class="header-border-bottom"
    :footer-class="
      appointment.appointment_status.code !== 'CANCEL_APPOINTMENT'
        ? 'footer-border-top'
        : 'padding-0'
    "
  >
    <div class="appointment-details-modal__content">
      <h2 class="appointment-details-modal__title">
        {{
          isProcedureDetails
            ? "Detalles de la cita"
            : "Detalles del procedimiento"
        }}
      </h2>

      <MedicosTablaDetallesCita :rows="tableRows">
        <template #data-status="{ row }">
          <span class="status-badge" :class="getStatusClass()">
            {{ getStatusText() }}
          </span>
        </template>

        <template #data-valoration-conclusion="{ row }">
          <span
            class="appointment-table__payment-status"
            :class="setPaymentStatusClass(appointment)"
          ></span>
          {{ appointment?.appointment_result?.name }}
        </template>

        <template #data-proforma="{ row }">
          <button
            class="appointment-table__button--outline"
            :disabled="isLoadingProforma"
            @click="downloadProforma"
          >
            <AtomsIconsDownloadIcon />
            Descargar Proforma
          </button>
        </template>

        <template #data-payment-status="{ row }">
          <span
            v-if="!appointment.appointment_credit"
            class="appointment-table__payment-status"
            :class="setPaymentStatusClass(appointment)"
          ></span>
          {{ row.value }}
        </template>

        <template #data-recommendations="{ row }">
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
        </template>
      </MedicosTablaDetallesCita>

      <div
        v-if="canShowPaymentMethods"
        class="appointment-details-modal__payment-information"
      >
        <p class="appointment-details-modal__payment-information--title">
          Información de métodos de Pago:
        </p>
        <div class="appointment-details-modal__payment-information--content">
          <AtomsIconsCircleCheckBigIcon
            size="12"
            class="appointment-details-modal__payment-information--icon"
          />
          <div class="appointment-details-modal__payment-information--wrapper">
            <p class="appointment-details-modal__payment-information--subtitle">
              Pagar en línea con tarjeta.
            </p>
            <p class="appointment-details-modal__payment-information--subtext">
              Paga ahora de forma segura con tu tarjeta.
            </p>
          </div>
        </div>
        <div class="appointment-details-modal__payment-information--content">
          <AtomsIconsCircleCheckBigIcon
            size="12"
            class="appointment-details-modal__payment-information--icon"
          />
          <div class="appointment-details-modal__payment-information--wrapper">
            <p class="appointment-details-modal__payment-information--subtitle">
              Pagar en consulta.
            </p>
            <p class="appointment-details-modal__payment-information--subtext">
              Pagaras directamente el día de tu cita.
            </p>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div
        v-if="appointment.appointment_status.code === 'CANCEL_APPOINTMENT'"
      ></div>
      <div
        v-else-if="canLeaveRating"
        class="appointment-details-modal__footer appointment-details-modal__footer--full-width"
      >
        <button
          class="appointment-details-modal__button--outline"
          @click="
            () => {
              handleOpenModal('leaveReview', props.appointment.id);
              handleCloseModal('appointmentDetails');
            }
          "
        >
          Dejar una reseña
        </button>
      </div>

      <div
        v-else-if="
          appointment.appointment_credit?.credit_status?.code === 'REQUIRED'
        "
        class="appointment-details-modal__footer appointment-details-modal__footer--full-width"
      >
        <p class="appointment-details-modal__credit-information">
          <span class="appointment-details-modal__credit-information--text"
            >Esperando respuesta de crédito</span
          >
          <span class="appointment-details-modal__credit-information--subtext">
            Tu solicitud está siendo evaluada por la asociación solidarista.
          </span>
        </p>
      </div>

      <div
        v-else-if="
          appointment.appointment_status.code !==
          'VALUED_VALORATION_APPOINTMENT'
        "
        class="appointment-details-modal__footer"
      >
        <button
          class="appointment-details-modal__button--danger"
          @click="handleOpenModal('cancelAppointment')"
        >
          Anular cita
        </button>
        <button
          v-if="hasOutstandingBalance && shouldShowContinueButton"
          class="appointment-details-modal__button--primary"
          @click="handleOpenModal('payAppointment')"
        >
          Pagar ahora
        </button>
      </div>
      <div
        v-else-if="!waitingForCreditResponse"
        class="appointment-details-modal__footer appointment-details-modal__footer--full-width"
      >
        <button
          class="appointment-details-modal__button--outline"
          @click="handleOpenModal('scheduleProcedure')"
        >
          Reservar procedimiento
        </button>
        <button
          v-if="canRequestCredit"
          class="appointment-details-modal__button--primary"
          @click="handleOpenModal('applyCredit')"
        >
          Solicitar Crédito
        </button>
      </div>
      <div
        v-else
        class="appointment-details-modal__footer appointment-details-modal__footer--full-width"
      >
        <button
          class="appointment-details-modal__button--primary"
          @click="handleOpenModal('scheduleProcedure')"
        >
          Reservar procedimiento
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import { useAppointment } from "@/composables/api";
import type { TablaBaseRow } from "~/components/medicos/tabla-detalles-cita.vue";
import type { ModalName } from "~/types";
import type { Appointment } from "~/types/appointment";

const { formatCurrency, formatPhone, formatDate, formatTime } = useFormat();
const { fetchDocumentByCode } = useAppointment();

interface Props {
  appointment: Appointment;
  isOpen: boolean;
}

interface Emits {
  (e: "open-modal", modalName: ModalName, appointmentId?: number): void;
  (e: "close-modal", modalName: ModalName): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isLoadingProforma = ref<boolean>(false);

const handleOpenModal = (modalName: ModalName, appointmentId?: number) => {
  emit("open-modal", modalName, appointmentId);
};

const handleCloseModal = (modalName: ModalName) => {
  emit("close-modal", modalName);
};

const hasOutstandingBalance = computed(() => {
  const creditAmount = props.appointment.appointment_credit
    ? Number(props.appointment.appointment_credit.approved_amount)
    : 0;
  return Number(props.appointment.price_procedure) - creditAmount !== 0;
});

const shouldShowContinueButton = computed(() => {
  const { code: statusCode } = props.appointment.appointment_status;
  const { code: paymentCode } = props.appointment.payment_status;

  return (
    (statusCode === "CONFIRM_VALIDATION_APPOINTMENT" &&
      (paymentCode === "PAYMENT_STATUS_NOT_PAID_VALORATION_APPOINTMENT" ||
        paymentCode === "PAYMENT_STATUS_NOT_PAID_PROCEDURE")) ||
    (statusCode === "CONFIRM_PROCEDURE" &&
      paymentCode === "PAYMENT_STATUS_NOT_PAID_PROCEDURE")
  );
});

const isProcedureDetails = computed(() => {
  return (
    props.appointment.appointment_type.code === "VALORATION_APPOINTMENT" &&
    props.appointment.appointment_status.code !==
      "VALUED_VALORATION_APPOINTMENT"
  );
});

const waitingForCreditResponse = computed(
  () => props.appointment.appointment_credit?.credit_status_code === "REQUIRED"
);
const canRequestCredit = computed(() => !props.appointment.appointment_credit);

const canShowPaymentMethods = computed(() => {
  const paymentStatusCode = props.appointment.payment_status.code;
  const appointmentStatusCode = props.appointment.appointment_status.code;

  if (
    paymentStatusCode === "PAYMENT_STATUS_NOT_PAID_VALORATION_APPOINTMENT" ||
    paymentStatusCode === "PAYMENT_STATUS_NOT_PAID_PROCEDURE"
  ) {
    if (
      appointmentStatusCode === "CONFIRM_VALIDATION_APPOINTMENT" ||
      appointmentStatusCode == "PENDING_VALORATION_APPOINTMENT"
    ) {
      return true;
    }
  }

  return false;
});

const canLeaveRating = computed(() => {
  if (props.appointment.appointment_result?.code === "NOT_FIT_FOR_PROCEDURE") {
    return true;
  }

  if (props.appointment.appointment_status.code === "CONCRETED_APPOINTMENT") {
    return true;
  }

  return false;
});

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

const tableRows = computed((): TablaBaseRow[] => {
  const rows: TablaBaseRow[] = [];

  const serviceTypeValue =
    props.appointment.appointment_type.code === "PROCEDURE_APPOINTMENT"
      ? "Cita de procedimiento"
      : props.appointment.appointment_type.code === "VALORATION_APPOINTMENT" &&
          props.appointment.appointment_status.code ===
            "VALUED_VALORATION_APPOINTMENT"
        ? "Procedimiento médico"
        : "Cita de valoración";

  rows.push({
    key: "service-type",
    header: "Tipo de servicio:",
    value: serviceTypeValue,
    isEndRow: canShowHourAndTime.value,
  });

  if (!canShowHourAndTime.value) {
    rows.push(
      {
        key: "appointment-date",
        header: "Fecha de la cita:",
        value: formatDate(props.appointment.application_date),
      },
      {
        key: "appointment-time",
        header: "Hora de la cita:",
        value: formatTime(props.appointment.appointment_hour, "hs"),
        isEndRow: true,
      }
    );
  }

  rows.push({
    key: "patient",
    header: "Paciente titular:",
    value: props.appointment.customer.name,
  });

  rows.push({
    key: "phone",
    header: "Teléfono de Contacto:",
    value: formatPhone(
      props.appointment.phone_number_external_user ??
        props.appointment.customer.phone_number
    ),
  });

  rows.push({
    key: "doctor",
    header: "Profesional Médico:",
    value: props.appointment.supplier.name,
  });

  rows.push({
    key: "procedure",
    header: "Procedimiento:",
    value: props.appointment.package?.procedure?.name,
  });

  rows.push({
    key: "status",
    header: "Estado:",
    value: "",
  });

  if (
    props.appointment.appointment_status.code ===
    "VALUED_VALORATION_APPOINTMENT"
  ) {
    rows.push({
      key: "valoration-conclusion",
      header: "Conclusión de valoración:",
      value: "",
    });

    rows.push({
      key: "proforma",
      header: "Proforma:",
      value: "",
      isEndRow: true,
    });
  }

  if (canShowCreditStatus.value) {
    rows.push({
      key: "credit-eligible",
      header: "Apto para crédito:",
      value: isCreditDisabled.value ? "Sí" : "No",
    });
  }

  if (
    props.appointment.appointment_type.code !== "VALORATION_APPOINTMENT" &&
    props.appointment.appointment_status.code !==
      "VALUED_VALORATION_APPOINTMENT"
  ) {
    rows.push({
      key: "procedure-2",
      header: "Procedimiento:",
      value: props.appointment.package?.procedure?.name,
    });
  }

  const costLabel =
    props.appointment.appointment_type.code === "PROCEDURE_APPOINTMENT"
      ? "Monto del procedimiento"
      : "Costo del servicio";

  const costValue =
    props.appointment.appointment_type.code === "PROCEDURE_APPOINTMENT" ||
    props.appointment.appointment_status.code ===
      "VALUED_VALORATION_APPOINTMENT"
      ? formatCurrency(props.appointment.price_procedure, { decimalPlaces: 0 })
      : formatCurrency(props.appointment.price_valoration_appointment, {
          decimalPlaces: 0,
        });

  rows.push({
    key: "cost",
    header: `${costLabel}:`,
    value: costValue,
  });

  if (props.appointment.appointment_status.code === "CANCEL_APPOINTMENT") {
    rows.push({
      key: "recommendations",
      header: "Recomendaciones o anotaciones:",
      value: "",
    });
  }

  if (
    props.appointment.appointment_status.code === "CONFIRM_PROCEDURE" ||
    (props.appointment.appointment_credit &&
      props.appointment.appointment_type.code !== "PROCEDURE_APPOINTMENT")
  ) {
    if (props.appointment.appointment_credit) {
      rows.push({
        key: "approved-credit",
        header: "Crédito aprobado:",
        value: formatCurrency(
          props.appointment.appointment_credit?.approved_amount || 0,
          {
            decimalPlaces: 0,
          }
        ),
      });
    }

    rows.push({
      key: "pending-balance",
      header: "Saldo pendiente:",
      value: formatCurrency(calculateBalance(), { decimalPlaces: 0 }),
    });
  }

  if (
    props.appointment.appointment_status.code !==
      "VALUED_VALORATION_APPOINTMENT" &&
    props.appointment.appointment_status.code !==
      "PENDING_VALORATION_APPOINTMENT"
  ) {
    let paymentStatusValue: string;

    if (props.appointment.appointment_credit) {
      const balance = calculateBalance();

      if (balance === 0) {
        paymentStatusValue = "Cubierto por el crédito";
      } else {
        paymentStatusValue = "Cubierto parcialmente por el crédito";
      }
    } else {
      paymentStatusValue = setPaymentValueName(props.appointment);
    }

    rows.push({
      key: "payment-status",
      header: "Estado de pago:",
      value: paymentStatusValue,
    });
  }

  return rows;
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
</script>

<style lang="scss">
.appointment-details-modal {
  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 1.125rem;
    line-height: 1.75rem;
    color: $color-foreground;
  }

  &__content {
    padding: 1.5rem;
  }

  &__payment-information {
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: #f8faff;
    border-radius: 1.25rem;
    gap: 0.625rem;
    padding: 0.625rem 1.25rem;
    margin-top: 1.5rem;

    &--content {
      display: flex;
      gap: 0.625rem;
    }

    &--icon {
      width: 1.4375rem;
      height: 1.4375rem;
      border: 0.25rem solid #d1fadf;
      color: #039855;
      border-radius: 50%;
      padding: 0.0625rem;
    }

    &--title {
      @include label-base;
      font-weight: 600;
      font-size: 0.875rem;
      line-height: 1.5rem;
      color: $black;
    }

    &--subtitle {
      @include label-base;
      font-family: $font-family-main;
      font-weight: 600;
      font-size: 0.875rem;
      line-height: 1.5rem;
      color: $black;
    }

    &--subtext {
      @include label-base;
      font-weight: 500;
      font-size: 0.875rem;
      line-height: 1.5rem;
      color: $color-text-secondary;
    }
  }

  &__credit-information {
    width: 100%;
    &--text {
      @include label-base;
      font-weight: 600;
      font-size: 1rem;
      line-height: 1.5rem;
      color: $color-foreground;
      text-align: center;
      display: block;
    }

    &--subtext {
      @include label-base;
      font-weight: 500;
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: $color-text-secondary;
      display: block;
      text-align: center;
      margin-top: 0.25rem;
    }
  }

  &__button {
    &--primary {
      @include primary-button;
      padding: 0.75rem 0;
    }

    &--outline {
      @include outline-button;
      padding: 0.75rem 0;
    }

    &--danger {
      @include outline-danger-button;
    }
  }

  &__footer {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(0, 1fr));
    gap: 0.75rem;
    width: 100%;

    &:has(button:only-child) {
      grid-template-columns: auto;
      justify-content: flex-start;
    }

    &--full-width {
      &:has(button:only-child) {
        grid-template-columns: 1fr;
        justify-content: stretch;
      }
    }
  }
}

// Estilos de la tabla (de PacientesTablaDetallesCita)
.appointment-table {
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
