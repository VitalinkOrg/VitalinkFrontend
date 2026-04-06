<template>
  <AtomsModalBase
    :isOpen="isModalOpen"
    title="¡Pago Exitoso!"
    size="small"
    @close="closeModal"
  >
    <template #title>
      <h2 class="payment-successes-modal__header">Detalle del pago</h2>
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
              {{ serviceType }}
            </td>
          </tr>
          <tr>
            <td class="payment-successes-modal__table--label">
              Fecha de la cita:
            </td>
            <td class="payment-successes-modal__table--value">
              <time
                :datetime="new Date(appointment.application_date).toISOString()"
              >
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
              {{
                formatPhone(
                  appointment.phone_number_external_user ??
                    appointment.customer.phone_number,
                )
              }}
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
              {{ displayPrice }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <template #footer>
      <div class="payment-successes-modal__footer">
        <button
          class="payment-successes-modal__button--outline"
          :disabled="isGeneratingPdf"
          @click="downloadReceipt"
        >
          {{ isGeneratingPdf ? "Generando..." : "Descargar Comprobante" }}
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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useFormat } from "~/composables/useFormat";

const { formatCurrency, formatPhone } = useFormat();

interface Props {
  appointment: IAppointment;
  isOpen: boolean;
}

interface Emits {
  (e: "open-modal", modalName: ModalName): void;
  (e: "close-modal", modalName: ModalName): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const displayPrice = computed(() => {
  const { appointment } = props;

  const isValoration =
    appointment?.appointment_type?.code === "VALORATION_APPOINTMENT";
  const pkg = appointment?.package;

  let amount;

  if (isValoration) {
    amount = pkg?.discount > 0 ? pkg?.discount : Number(pkg?.product?.value2);
  } else {
    amount = appointment?.price_procedure;
  }

  return formatCurrency(Number(amount ?? 0), { decimalPlaces: 0 });
});

const serviceType = computed(() =>
  normalizeAppointmentTypeCode(props.appointment.appointment_type.code),
);

function normalizeAppointmentTypeCode(code: string) {
  if (code === "VALORATION_APPOINTMENT") return "Cita de Valoración";
  else if (code === "PROCEDURE_APPOINTMENT") return "Procedimiento";
}

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
  emit("close-modal", "payAppointment");
  emit("close-modal", "appointmentDetails");
};

const isGeneratingPdf = ref(false);

async function downloadReceipt() {
  isGeneratingPdf.value = true;

  try {
    const { appointment } = props;
    const doc = new jsPDF();

    const primaryColor: [number, number, number] = [3, 152, 85];
    const headerBg: [number, number, number] = [236, 253, 243];

    doc.setFillColor(...headerBg);
    doc.rect(0, 0, 210, 40, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...primaryColor);
    doc.text("Comprobante de Pago", 105, 18, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("¡Pago Exitoso y Cita Confirmada!", 105, 28, { align: "center" });

    const issuedDate = new Date().toLocaleDateString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.setFontSize(9);
    doc.text(`Emitido el: ${issuedDate}`, 105, 36, { align: "center" });

    const appointmentDate = new Date(
      appointment.application_date,
    ).toLocaleDateString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const phone =
      appointment.phone_number_external_user ??
      appointment.customer.phone_number;

    autoTable(doc, {
      startY: 50,
      head: [["Detalle", "Información"]],
      body: [
        ["Tipo de servicio", serviceType.value ?? "—"],
        ["Fecha de la cita", appointmentDate],
        ["Hora de la cita", appointment.appointment_hour ?? "—"],
        ["Paciente titular", appointment.customer.name ?? "—"],
        ["Teléfono de contacto", formatPhone(phone) ?? "—"],
        ["Personal médico", appointment.supplier?.name ?? "—"],
        ["Procedimiento", appointment.package?.procedure?.name ?? "—"],
        ["Monto pagado", displayPrice.value.replace("₡", "CRC ")],
      ],
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 10,
      },
      bodyStyles: { fontSize: 10 },
      alternateRowStyles: { fillColor: [248, 250, 255] },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 70, textColor: [80, 80, 100] },
        1: { cellWidth: "auto" },
      },
      margin: { left: 14, right: 14 },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 16;
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(14, finalY, 196, finalY);

    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text("Vitalink — Plataforma de salud digital", 105, finalY + 8, {
      align: "center",
    });

    const patientSlug = appointment.customer.name
      ?.toLowerCase()
      .replace(/\s+/g, "-");
    doc.save(`comprobante-pago-${patientSlug}-${Date.now()}.pdf`);
  } finally {
    isGeneratingPdf.value = false;
  }
}
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
