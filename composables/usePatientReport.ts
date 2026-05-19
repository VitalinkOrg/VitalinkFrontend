import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface ReportColumn {
  header: string;
  width: number;
  extractor: (patient: ICustomer) => string;
}

const REPORT_COLUMNS: readonly ReportColumn[] = [
  { header: "Paciente", width: 40, extractor: (p) => p.name ?? "N/A" },
  { header: "Dirección", width: 50, extractor: (p) => p.address ?? "N/A" },
  { header: "Teléfono", width: 40, extractor: (p) => p.phone_number ?? "N/A" },
  { header: "Correo", width: 40, extractor: (p) => p.email ?? "N/A" },
] as const;

const PAGE_MARGIN = 15;
const PAGE_BREAK_THRESHOLD = 270;
const ROW_HEIGHT = 8;
const ROW_GAP = 4;
const REPORT_TITLE = "Reporte de Pacientes";
const FOOTER_TEXT = "Sistema de Gestión Médica - Vitalink";

function buildFileName(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `Reporte_Pacientes_${date}.pdf`;
}

function renderHeader(
  doc: jsPDF,
  pageWidth: number,
  formattedDate: string,
): number {
  let y = 20;

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(REPORT_TITLE, pageWidth / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Generado el: ${formattedDate}`, pageWidth / 2, y, {
    align: "center",
  });
  y += 15;

  return y;
}

function renderColumnHeaders(doc: jsPDF, y: number, pageWidth: number): number {
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");

  let x = PAGE_MARGIN;
  for (const column of REPORT_COLUMNS) {
    doc.text(column.header, x, y);
    x += column.width;
  }

  y += ROW_HEIGHT;
  doc.line(PAGE_MARGIN, y, pageWidth - PAGE_MARGIN, y);
  y += 10;

  return y;
}

function renderRow(doc: jsPDF, patient: ICustomer, y: number): void {
  let x = PAGE_MARGIN;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  for (const column of REPORT_COLUMNS) {
    doc.text(column.extractor(patient), x, y);
    x += column.width;
  }
}

function renderRowSeparator(doc: jsPDF, y: number, pageWidth: number): void {
  doc.setDrawColor(220, 220, 220);
  doc.line(PAGE_MARGIN, y - 2, pageWidth - PAGE_MARGIN, y - 2);
  doc.setDrawColor(0, 0, 0);
}

function renderFooter(doc: jsPDF, totalCount: number, pageWidth: number): void {
  doc.setFontSize(8);
  doc.setTextColor(100);
  doc.text(`Total pacientes: ${totalCount}`, PAGE_MARGIN, 280);
  doc.text(FOOTER_TEXT, pageWidth / 2, 280, { align: "center" });
}

export function usePatientReport() {
  const { formatDate } = useFormat();
  const logger = useLogger("PatientReport");
  const toast = useToast();

  function generateReport(patients: ICustomer[]): void {
    if (patients.length === 0) {
      toast.warning("No hay pacientes para generar el reporte");
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const formattedDate = formatDate(new Date().toISOString());

      let y = renderHeader(doc, pageWidth, formattedDate);
      y = renderColumnHeaders(doc, y, pageWidth);

      const lastIndex = patients.length - 1;

      patients.forEach((patient, index) => {
        if (y > PAGE_BREAK_THRESHOLD) {
          doc.addPage();
          y = 20;
        }

        renderRow(doc, patient, y);
        y += ROW_HEIGHT;

        if (index < lastIndex) {
          renderRowSeparator(doc, y, pageWidth);
          y += ROW_GAP;
        }
      });

      renderFooter(doc, patients.length, pageWidth);
      doc.save(buildFileName());

      toast.success("Reporte descargado correctamente");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error al generar el reporte";
      logger.error(message);
      toast.error("No se pudo generar el reporte. Inténtalo de nuevo.");
    }
  }

  return { generateReport };
}
