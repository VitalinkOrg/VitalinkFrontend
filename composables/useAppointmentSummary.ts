import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const PROCEDURE_CONFIRMED_STATUSES = new Set([
  "CONFIRM_PROCEDURE",
  "WAITING_PROCEDURE",
  "CONCRETED_APPOINTMENT",
]);

interface AppointmentSummary {
  qrCode: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  procedure: string;
  procedureDate: string | null;
  status: string;
  reservationType: string;
  cost: string;
  phone: string;
  paymentStatus: string;
}

const PAGE_MARGIN = 15;
const REPORT_TITLE = "Resumen de Cita Médica";
const FOOTER_DISCLAIMER =
  "Este documento es un resumen oficial de la cita médica registrada";
const FOOTER_BRAND = "Sistema de Gestión Médica — Vitalink";

function formatSafeDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("es-ES");
  } catch {
    return "—";
  }
}

function extractSummary(appointment: IAppointment): AppointmentSummary {
  const isValoration =
    appointment.appointment_type?.code === "VALORATION_APPOINTMENT";

  const statusCode = appointment.appointment_status?.code ?? "";
  const procedureConfirmed = PROCEDURE_CONFIRMED_STATUSES.has(statusCode);
  const procedureDate = procedureConfirmed
    ? `${formatSafeDate(appointment.appointment_date)}${appointment.appointment_hour ? ` ${appointment.appointment_hour}` : ""}`
    : null;

  return {
    qrCode: appointment.appointment_qr_code ?? "N/A",
    patientName: appointment.customer?.name ?? "N/A",
    doctorName: appointment.supplier?.name ?? "N/A",
    date: formatSafeDate(appointment.appointment_date),
    time: appointment.appointment_hour ?? "N/A",
    procedure: appointment.package?.procedure?.name ?? "N/A",
    procedureDate,
    status: appointment.appointment_status?.value1 ?? "N/A",
    reservationType: appointment.reservation_type?.name ?? "N/A",
    cost: isValoration
      ? (appointment.price_valoration_appointment ?? "N/A")
      : (appointment.price_procedure ?? "N/A"),
    phone: appointment.customer?.phone_number ?? "No disponible",
    paymentStatus: appointment.payment_status?.value1 ?? "Pendiente",
  };
}

function buildLocalPdf(summary: AppointmentSummary): jsPDF {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(REPORT_TITLE, pageWidth / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(
    `Generado el: ${new Date().toLocaleDateString("es-ES")}`,
    pageWidth / 2,
    y,
    { align: "center" },
  );
  y += 15;

  const writeSection = (title: string): void => {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, PAGE_MARGIN, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
  };

  const writeLine = (label: string, value: string): void => {
    doc.text(`${label}: ${value}`, PAGE_MARGIN, y);
    y += 6;
  };

  writeSection("Información General");
  writeLine("Código de Reserva", summary.qrCode);
  writeLine("Estado", summary.status);
  y += 4;

  writeSection("Datos del Paciente");
  writeLine("Nombre", summary.patientName);
  writeLine("Teléfono", summary.phone);
  y += 4;

  writeSection("Datos de la Cita");
  writeLine("Doctor/Centro", summary.doctorName);
  writeLine("Fecha", summary.date);
  writeLine("Hora", summary.time);
  writeLine("Procedimiento", summary.procedure);
  if (summary.procedureDate) {
    writeLine("Fecha del procedimiento", summary.procedureDate);
  }
  writeLine("Tipo de Reserva", summary.reservationType);
  y += 4;

  writeSection("Información Financiera");

  autoTable(doc, {
    startY: y,
    head: [["Costo del Servicio", "Estado de Pago"]],
    body: [[`₡${summary.cost}`, summary.paymentStatus]],
    theme: "grid",
    styles: { fontSize: 10, halign: "center" as const },
    headStyles: { fillColor: [41, 128, 185] },
  });

  y = (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(FOOTER_DISCLAIMER, pageWidth / 2, y, { align: "center" });
  y += 5;
  doc.text(FOOTER_BRAND, pageWidth / 2, y, { align: "center" });

  return doc;
}

function triggerBlobDownload(blobData: BlobPart, filename: string): void {
  const blob = new Blob([blobData], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function useAppointmentSummary() {
  const config = useRuntimeConfig();
  const token = useCookie("token");
  const logger = useLogger("AppointmentSummary");
  const toast = useToast();

  const isDownloading = ref(false);

  async function fetchRemotePdf(
    appointmentId: number,
  ): Promise<BlobPart | null> {
    try {
      const { data, error } = await useFetch(
        `${config.public.API_BASE_URL}/appointment/summary/${appointmentId}`,
        {
          method: "GET",
          headers: { Authorization: token.value as string },
        },
      );

      if (data.value && !error.value) return data.value as BlobPart;
      return null;
    } catch {
      return null;
    }
  }

  async function download(appointment: IAppointment): Promise<void> {
    if (isDownloading.value) return;
    isDownloading.value = true;

    try {
      const remotePdf = await fetchRemotePdf(appointment.id);
      const fileIdentifier =
        appointment.appointment_qr_code ?? String(appointment.id);

      if (remotePdf) {
        triggerBlobDownload(remotePdf, `resumen-${fileIdentifier}.pdf`);
        toast.success("Resumen descargado correctamente.");
        return;
      }

      logger.info("API no disponible, generando resumen local");
      const summary = extractSummary(appointment);
      const doc = buildLocalPdf(summary);
      doc.save(`resumen-cita-${summary.qrCode}.pdf`);
      toast.success("Resumen generado y descargado correctamente.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      logger.error("Error al descargar resumen", { error: message });
      toast.error("No se pudo generar el resumen. Inténtalo de nuevo.");
    } finally {
      isDownloading.value = false;
    }
  }

  return {
    isDownloading: readonly(isDownloading),
    download,
  };
}
