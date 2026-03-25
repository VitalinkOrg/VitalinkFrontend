<script lang="ts" setup>
import { useDocuments } from "@/composables/api";
import type { TablaBaseRow } from "~/components/medicos/tabla-detalles-cita.vue";

const { formatCurrency, formatPhone, formatDate, formatTime } = useFormat();
const { getDocumentByCode } = useDocuments();
const { show: showToast } = useToast();

interface Props {
  appointment: IAppointment;
  isOpen: boolean;
}

interface Emits {
  (e: "open-modal", modalName: ModalName, appointmentId?: number): void;
  (e: "close-modal", modalName: ModalName): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const isProformaDownloading = ref(false);

const statusCode = computed(() => props.appointment.appointment_status.code);
const paymentCode = computed(() => props.appointment.payment_status.code);
const appointmentTypeCode = computed(
  () => props.appointment.appointment_type.code,
);
const creditData = computed(() => props.appointment.appointment_credit);
const resultCode = computed(() => props.appointment.appointment_result?.code);

const isValoration = computed(
  () => appointmentTypeCode.value === "VALORATION_APPOINTMENT",
);

const isProcedureType = computed(
  () => appointmentTypeCode.value === "PROCEDURE_APPOINTMENT",
);

const isCancelled = computed(() => statusCode.value === "CANCEL_APPOINTMENT");

const isValorationCompleted = computed(
  () => statusCode.value === "VALUED_VALORATION_APPOINTMENT",
);

const isConcluded = computed(
  () => statusCode.value === "CONCRETED_APPOINTMENT",
);

const isConfirmedProcedure = computed(
  () => statusCode.value === "CONFIRM_PROCEDURE",
);

const isPendingValoration = computed(
  () => statusCode.value === "PENDING_VALORATION_APPOINTMENT",
);

const isConfirmedValidation = computed(
  () => statusCode.value === "CONFIRM_VALIDATION_APPOINTMENT",
);

const isFitForProcedure = computed(
  () => resultCode.value === "FIT_FOR_PROCEDURE",
);

const isNotFitForProcedure = computed(
  () => resultCode.value === "NOT_FIT_FOR_PROCEDURE",
);

const isPaidValoration = computed(
  () => paymentCode.value === "PAYMENT_STATUS_PAID_VALORATION_APPOINTMENT",
);

const isPaidProcedure = computed(
  () => paymentCode.value === "PAYMENT_STATUS_PAID_PROCEDURE",
);

const isUnpaidValoration = computed(
  () => paymentCode.value === "PAYMENT_STATUS_NOT_PAID_VALORATION_APPOINTMENT",
);

const isUnpaidProcedure = computed(
  () => paymentCode.value === "PAYMENT_STATUS_NOT_PAID_PROCEDURE",
);

const isPaid = computed(() => isPaidValoration.value || isPaidProcedure.value);
const isUnpaid = computed(
  () => isUnpaidValoration.value || isUnpaidProcedure.value,
);

const procedureCost = computed(() => Number(props.appointment.price_procedure));

const approvedCreditAmount = computed(() =>
  Number(creditData.value?.approved_amount || 0),
);

const outstandingBalance = computed(
  () => procedureCost.value - approvedCreditAmount.value,
);

const hasOutstandingBalance = computed(() => outstandingBalance.value !== 0);

const isAwaitingCreditResponse = computed(
  () =>
    creditData.value?.credit_status?.code === "REQUIRED" ||
    creditData.value?.credit_status_code === "REQUIRED",
);

const canRequestCredit = computed(() => !creditData.value);

const isCreditRejected = computed(
  () => creditData.value?.credit_status?.code === "REJECTED",
);

const hasCreditEligibilityInfo = computed(
  () =>
    creditData.value &&
    isValorationCompleted.value &&
    !isAwaitingCreditResponse.value,
);

const isCreditActive = computed(
  () => creditData.value && !isCreditRejected.value,
);

const modalTitle = computed(() =>
  isValoration.value && !isValorationCompleted.value
    ? "Detalles de la cita"
    : "Detalles del procedimiento",
);

const shouldDisplayScheduleInfo = computed(
  () =>
    isValorationCompleted.value &&
    isValoration.value &&
    isFitForProcedure.value,
);

const shouldShowPayButton = computed(() => {
  if (!hasOutstandingBalance.value) return false;

  return (
    (isConfirmedValidation.value &&
      (isUnpaidValoration.value || isUnpaidProcedure.value)) ||
    (isConfirmedProcedure.value && isUnpaidProcedure.value)
  );
});

const canDisplayPaymentMethods = computed(() => {
  if (!isUnpaid.value) return false;
  return isConfirmedValidation.value || isPendingValoration.value;
});

const canLeaveReview = computed(
  () => isNotFitForProcedure.value || isConcluded.value,
);

type FooterVariant =
  | "cancelled"
  | "review"
  | "awaiting-credit"
  | "default-actions"
  | "valued-with-credit"
  | "valued-standard";

const activeFooterVariant = computed((): FooterVariant => {
  if (isCancelled.value) return "cancelled";
  if (canLeaveReview.value) return "review";
  if (isAwaitingCreditResponse.value) return "awaiting-credit";
  if (!isValorationCompleted.value) return "default-actions";
  if (isAwaitingCreditResponse.value) return "awaiting-credit";
  return canRequestCredit.value ? "valued-with-credit" : "valued-standard";
});

const footerContainerClass = computed(() => {
  const base = "appointment-detail__footer";
  const fullWidthVariants: FooterVariant[] = [
    "review",
    "awaiting-credit",
    "valued-with-credit",
    "valued-standard",
  ];
  return fullWidthVariants.includes(activeFooterVariant.value)
    ? `${base} ${base}--expanded`
    : base;
});

const STATUS_APPEARANCE: Record<AppointmentStatusCode, { className: string }> =
  {
    CANCEL_APPOINTMENT: { className: "appointment-detail__badge--cancelled" },
    PENDING_VALORATION_APPOINTMENT: {
      className: "appointment-detail__badge--warning",
    },
    PENDING_PROCEDURE: { className: "appointment-detail__badge--warning" },
    WAITING_PROCEDURE: { className: "appointment-detail__badge--warning" },
    CONFIRM_PROCEDURE: { className: "appointment-detail__badge--info" },
    CONCRETED_APPOINTMENT: { className: "appointment-detail__badge--info" },
    VALUATION_PENDING_VALORATION_APPOINTMENT: {
      className: "appointment-detail__badge--info",
    },
    VALUED_VALORATION_APPOINTMENT: {
      className: "appointment-detail__badge--success",
    },
    CONFIRM_VALIDATION_APPOINTMENT: {
      className: "appointment-detail__badge--success",
    },
  };

const statusBadgeClass = computed(
  () => STATUS_APPEARANCE[statusCode.value]?.className || "",
);

const statusDisplayText = computed(
  () => props.appointment.appointment_status.value1,
);

const resolvePaymentIndicator = (appointment: IAppointment): string => {
  const status = appointment.appointment_status.code;
  const payment = appointment.payment_status.code;

  if (
    payment === "PAYMENT_STATUS_PAID_VALORATION_APPOINTMENT" ||
    payment === "PAYMENT_STATUS_PAID_PROCEDURE"
  ) {
    return "appointment-detail__payment-dot--paid";
  }

  if (status === "CANCEL_APPOINTMENT") {
    return "appointment-detail__payment-dot--unpaid";
  }

  if (
    status === "PENDING_VALORATION_APPOINTMENT" ||
    status === "PENDING_PROCEDURE"
  ) {
    return "appointment-detail__payment-dot--pending";
  }

  if (
    payment === "PAYMENT_STATUS_NOT_PAID_VALORATION_APPOINTMENT" ||
    payment === "PAYMENT_STATUS_NOT_PAID_PROCEDURE"
  ) {
    return "appointment-detail__payment-dot--paid";
  }

  return "appointment-detail__payment-dot--unpaid";
};

const resolvePaymentLabel = (appointment: IAppointment): string => {
  const status = appointment.appointment_status.code;
  const payment = appointment.payment_status.code;

  if (
    payment === "PAYMENT_STATUS_PAID_VALORATION_APPOINTMENT" ||
    payment === "PAYMENT_STATUS_PAID_PROCEDURE"
  ) {
    return "Pagado";
  }

  if (status === "CANCEL_APPOINTMENT") return "No Pagada";

  if (
    status === "PENDING_VALORATION_APPOINTMENT" ||
    status === "PENDING_PROCEDURE"
  ) {
    return "Pendiente";
  }

  if (
    payment === "PAYMENT_STATUS_NOT_PAID_VALORATION_APPOINTMENT" ||
    payment === "PAYMENT_STATUS_NOT_PAID_PROCEDURE"
  ) {
    return "Pendiente de pago";
  }

  return "No Pagada";
};

const serviceCostLabel = computed(() =>
  isProcedureType.value ? "Monto del procedimiento" : "Costo del servicio",
);

const serviceCostValue = computed(() => {
  const { appointment } = props;

  const isProcedurePrice = isProcedureType.value || isValorationCompleted.value;

  let amount;

  if (isProcedurePrice) {
    amount = appointment.price_procedure;
  } else {
    const discount = Number(appointment.package?.discount);
    const basePrice = appointment.package?.product?.value2;

    amount = discount || basePrice;
  }

  if (amount === null || amount === undefined || amount === "") {
    return "Precio a consultar";
  }

  return formatCurrency(amount, { decimalPlaces: 0 });
});

const tableRows = computed((): TablaBaseRow[] => {
  const rows: TablaBaseRow[] = [];
  const appt = props.appointment;

  const serviceTypeLabel =
    isProcedureType.value || (isValoration.value && isValorationCompleted.value)
      ? "Procedimiento médico"
      : "Cita de valoración";

  rows.push({
    key: "service-type",
    header: "Tipo de servicio:",
    value: serviceTypeLabel,
    isEndRow: shouldDisplayScheduleInfo.value,
  });

  if (!shouldDisplayScheduleInfo.value) {
    rows.push(
      {
        key: "appointment-date",
        header:
          appt.appointment_type.code === "PROCEDURE_APPOINTMENT"
            ? "Fecha:"
            : "Fechade la cita:",
        value: appt.appointment_date ? formatDate(appt.appointment_date) : "—",
      },
      {
        key: "appointment-time",
        header:
          appt.appointment_type.code === "PROCEDURE_APPOINTMENT"
            ? "Hora:"
            : "Hora de la cita:",
        value: appt.appointment_hour
          ? formatTime(appt.appointment_hour, "hs")
          : "—",
        isEndRow: true,
      },
    );
  }

  rows.push(
    {
      key: "patient",
      header: "Paciente titular:",
      value: appt.customer.name,
    },
    {
      key: "phone",
      header: "Teléfono de Contacto:",
      value: formatPhone(
        appt.phone_number_external_user ?? appt.customer.phone_number,
      ),
    },
    {
      key: "doctor",
      header: "Profesional Médico:",
      value: appt.supplier.name,
    },
    {
      key: "procedure",
      header: "Procedimiento:",
      value: appt.package?.procedure?.name,
    },
    {
      key: "status",
      header: "Estado:",
      value: "",
    },
  );

  if (isValorationCompleted.value) {
    rows.push(
      {
        key: "valoration-conclusion",
        header: "Conclusión de valoración:",
        value: "",
      },
      {
        key: "proforma",
        header: "Proforma:",
        value: "",
        isEndRow: true,
      },
    );
  }

  if (hasCreditEligibilityInfo.value) {
    rows.push({
      key: "credit-eligible",
      header: "Apto para crédito:",
      value: isCreditActive.value ? "Sí" : "No",
    });
  }

  if (!isValoration.value && !isValorationCompleted.value) {
    rows.push({
      key: "procedure-2",
      header: "Procedimiento:",
      value: appt.package?.procedure?.name,
    });
  }

  rows.push({
    key: "cost",
    header: `${serviceCostLabel.value}:`,
    value: serviceCostValue.value,
  });

  if (isCancelled.value) {
    rows.push({
      key: "recommendations",
      header: "Recomendaciones o anotaciones:",
      value: "",
    });
  }

  if (
    isConfirmedProcedure.value ||
    (creditData.value && !isProcedureType.value)
  ) {
    if (creditData.value) {
      rows.push({
        key: "approved-credit",
        header: "Crédito aprobado:",
        value: formatCurrency(approvedCreditAmount.value, { decimalPlaces: 0 }),
      });
    }

    rows.push({
      key: "pending-balance",
      header: "Saldo pendiente:",
      value: formatCurrency(outstandingBalance.value, { decimalPlaces: 0 }),
    });
  }

  const shouldShowPaymentRow =
    !isValorationCompleted.value && !isPendingValoration.value;

  if (shouldShowPaymentRow) {
    let paymentLabel: string;

    if (creditData.value) {
      paymentLabel =
        outstandingBalance.value === 0
          ? "Cubierto por el crédito"
          : "Cubierto parcialmente por el crédito";
    } else {
      paymentLabel = resolvePaymentLabel(appt);
    }

    rows.push({
      key: "payment-status",
      header: "Estado de pago:",
      value: paymentLabel,
    });
  }

  return rows;
});

const openModal = (name: ModalName, appointmentId?: number) => {
  emit("open-modal", name, appointmentId);
};

const closeModal = (name: ModalName) => {
  emit("close-modal", name);
};

const handleCloseDetail = () => {
  closeModal("appointmentDetails");
};

const handleNavigateToReview = () => {
  openModal("leaveReview", props.appointment.id);
  closeModal("appointmentDetails");
};

const handleDownloadProforma = async () => {
  const fileCode = props.appointment.proforma_file_code;

  if (!fileCode) {
    showToast("No se encontró el archivo de proforma", "error");
    return;
  }

  isProformaDownloading.value = true;

  try {
    const { data, error } = await getDocumentByCode(fileCode);

    console.log({ data });

    if (error) {
      showToast(error.info || "Error al obtener la proforma", "error");
      return;
    }

    if (!data?.url) {
      showToast("La URL del documento no está disponible", "error");
      return;
    }

    const response = await fetch(data.url);

    if (!response.ok) {
      showToast("Error al descargar el archivo", "error");
      return;
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = blobUrl;
    anchor.download = data.name || `proforma-${fileCode}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    URL.revokeObjectURL(blobUrl);
  } catch {
    showToast("Error inesperado al descargar la proforma", "error");
  } finally {
    isProformaDownloading.value = false;
  }
};
</script>

<template>
  <AtomsModalBase
    :is-open="isOpen"
    size="medium"
    :close-on-backdrop="false"
    header-class="header-border-bottom"
    :footer-class="isCancelled ? 'padding-0' : 'footer-border-top'"
    @close="handleCloseDetail"
  >
    <template #title>
      <h2 id="detail-modal-title" class="appointment-detail__title">
        {{ modalTitle }}
      </h2>
    </template>
    <div
      class="appointment-detail__body"
      role="region"
      aria-labelledby="detail-modal-title"
    >
      <MedicosTablaDetallesCita :rows="tableRows">
        <template #data-status>
          <span
            class="appointment-detail__badge"
            :class="statusBadgeClass"
            role="status"
          >
            {{ statusDisplayText }}
          </span>
        </template>

        <template #data-valoration-conclusion>
          <span
            class="appointment-detail__payment-dot"
            :class="resolvePaymentIndicator(appointment)"
            aria-hidden="true"
          />
          {{ appointment.appointment_result?.name }}
        </template>

        <template #data-proforma>
          <button
            type="button"
            class="appointment-detail__proforma-button"
            :disabled="isProformaDownloading"
            :aria-busy="isProformaDownloading"
            @click="handleDownloadProforma"
          >
            <AtomsIconsDownloadIcon aria-hidden="true" />
            {{
              isProformaDownloading ? "Descargando..." : "Descargar Proforma"
            }}
          </button>
        </template>

        <template #data-payment-status="{ row }">
          <span
            v-if="!creditData"
            class="appointment-detail__payment-dot"
            :class="resolvePaymentIndicator(appointment)"
            aria-hidden="true"
          />
          {{ row.value }}
        </template>

        <template #data-recommendations>
          <label
            id="recommendations-label"
            class="appointment-detail__visually-hidden"
          >
            Recomendaciones o anotaciones
          </label>
          <textarea
            class="appointment-detail__notes-field"
            aria-labelledby="recommendations-label"
            aria-readonly="true"
            :value="
              appointment.recommendation_post_appointment ??
              'No hay recomendaciones'
            "
            disabled
            readonly
          />
        </template>
      </MedicosTablaDetallesCita>

      <aside
        v-if="canDisplayPaymentMethods"
        class="appointment-detail__payment-methods"
        aria-label="Métodos de pago disponibles"
      >
        <p class="appointment-detail__payment-methods-title">
          Información de métodos de Pago:
        </p>

        <div class="appointment-detail__payment-option">
          <AtomsIconsCircleCheckBigIcon
            size="12"
            class="appointment-detail__payment-option-icon"
            aria-hidden="true"
          />
          <div>
            <p class="appointment-detail__payment-option-name">
              Pagar en línea con tarjeta.
            </p>
            <p class="appointment-detail__payment-option-description">
              Paga ahora de forma segura con tu tarjeta.
            </p>
          </div>
        </div>

        <div class="appointment-detail__payment-option">
          <AtomsIconsCircleCheckBigIcon
            size="12"
            class="appointment-detail__payment-option-icon"
            aria-hidden="true"
          />
          <div>
            <p class="appointment-detail__payment-option-name">
              Pagar en consulta.
            </p>
            <p class="appointment-detail__payment-option-description">
              Pagarás directamente el día de tu cita.
            </p>
          </div>
        </div>
      </aside>
    </div>

    <template #footer>
      <div v-if="isCancelled" />

      <div
        v-else-if="activeFooterVariant === 'review'"
        :class="footerContainerClass"
      >
        <button
          type="button"
          class="appointment-detail__action appointment-detail__action--outline"
          @click="handleNavigateToReview"
        >
          Dejar una reseña
        </button>
      </div>

      <div
        v-else-if="activeFooterVariant === 'awaiting-credit'"
        :class="footerContainerClass"
      >
        <div
          class="appointment-detail__credit-notice"
          role="status"
          aria-live="polite"
        >
          <span class="appointment-detail__credit-notice-title">
            Esperando respuesta de crédito
          </span>
          <span class="appointment-detail__credit-notice-subtitle">
            Tu solicitud está siendo evaluada por la asociación solidarista.
          </span>
        </div>
      </div>

      <div
        v-else-if="activeFooterVariant === 'default-actions'"
        :class="footerContainerClass"
      >
        <button
          type="button"
          class="appointment-detail__action appointment-detail__action--danger"
          @click="openModal('cancelAppointment')"
        >
          Anular cita
        </button>
        <button
          v-if="shouldShowPayButton"
          type="button"
          class="appointment-detail__action appointment-detail__action--primary"
          @click="openModal('payAppointment')"
        >
          Pagar ahora
        </button>
      </div>

      <div
        v-else-if="activeFooterVariant === 'valued-with-credit'"
        :class="footerContainerClass"
      >
        <button
          type="button"
          class="appointment-detail__action appointment-detail__action--outline"
          @click="openModal('scheduleProcedure')"
        >
          Reservar procedimiento
        </button>
        <button
          type="button"
          class="appointment-detail__action appointment-detail__action--primary"
          @click="openModal('applyCredit')"
        >
          Solicitar Crédito
        </button>
      </div>

      <div v-else :class="footerContainerClass">
        <button
          type="button"
          class="appointment-detail__action appointment-detail__action--primary"
          @click="openModal('scheduleProcedure')"
        >
          Reservar procedimiento
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<style lang="scss">
.appointment-detail {
  &__body {
    padding: 1.5rem;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 1.125rem;
    line-height: 1.75rem;
    color: $color-foreground;
  }

  &__badge {
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

    &--info {
      background-color: #dbeafe;
      color: $color-foreground;
    }

    &--cancelled {
      background-color: $color-cancel;
      color: $color-foreground;
    }
  }

  &__payment-dot {
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

    &--unpaid {
      background-color: #f04438;
    }
  }

  &__proforma-button {
    @include outline-button;
    padding: 0.5rem 0.875rem;
    gap: 0.375rem;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__notes-field {
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

  &__payment-methods {
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: #f8faff;
    border-radius: 1.25rem;
    gap: 0.625rem;
    padding: 0.625rem 1.25rem;
    margin-top: 1.5rem;
  }

  &__payment-methods-title {
    @include label-base;
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: $black;
  }

  &__payment-option {
    display: flex;
    gap: 0.625rem;
  }

  &__payment-option-icon {
    width: 1.4375rem;
    height: 1.4375rem;
    border: 0.25rem solid #d1fadf;
    color: #039855;
    border-radius: 50%;
    padding: 0.0625rem;
    flex-shrink: 0;
  }

  &__payment-option-name {
    @include label-base;
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: $black;
  }

  &__payment-option-description {
    @include label-base;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.5rem;
    color: $color-text-secondary;
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

    &--expanded {
      &:has(button:only-child) {
        grid-template-columns: 1fr;
        justify-content: stretch;
      }
    }
  }

  &__action {
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

  &__credit-notice {
    width: 100%;
    text-align: center;
  }

  &__credit-notice-title {
    @include label-base;
    font-weight: 600;
    font-size: 1rem;
    line-height: 1.5rem;
    color: $color-foreground;
    display: block;
  }

  &__credit-notice-subtitle {
    @include label-base;
    font-weight: 500;
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: $color-text-secondary;
    display: block;
    margin-top: 0.25rem;
  }

  &__visually-hidden {
    @include visually-hidden;
  }
}
</style>
