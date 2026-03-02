import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Colors,
  Legend,
  LinearScale,
  Title,
  Tooltip,
  type ChartOptions,
  type Plugin,
} from "chart.js";

const MONTH_LABELS: readonly string[] = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
] as const;

const CHART_COLORS = {
  reference1: { bg: "rgba(53, 65, 180, 0.8)", border: "#3541B4" },
  reference2: { bg: "rgba(12, 173, 187, 0.8)", border: "#0CADBB" },
  axis: "#9CA3AF",
  grid: "rgba(156, 163, 175, 0.1)",
  text: "#353E5C",
} as const;

const FONT_FAMILY = "'Montserrat', sans-serif";

function generateRandomData(length: number, max: number): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * max));
}

export function useDashboardCharts() {
  function registerPlugins(): void {
    ChartJS.register(
      Title,
      Tooltip,
      Legend,
      ArcElement,
      BarElement,
      CategoryScale,
      LinearScale,
      Colors,
    );
  }

  const barChartData = computed(() => ({
    labels: [...MONTH_LABELS],
    datasets: [
      {
        label: "Referencia 1",
        data: generateRandomData(12, 100),
        backgroundColor: CHART_COLORS.reference1.bg,
        borderColor: CHART_COLORS.reference1.border,
        borderWidth: 0,
        borderRadius: 8,
        barPercentage: 0.4,
        categoryPercentage: 0.7,
        hoverBackgroundColor: CHART_COLORS.reference1.border,
      },
      {
        label: "Referencia 2",
        data: generateRandomData(12, 100),
        backgroundColor: CHART_COLORS.reference2.bg,
        borderColor: CHART_COLORS.reference2.border,
        borderWidth: 0,
        borderRadius: 8,
        barPercentage: 0.4,
        categoryPercentage: 0.7,
        hoverBackgroundColor: CHART_COLORS.reference2.border,
      },
    ],
  }));

  const barChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: {
        position: "top",
        align: "start",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          padding: 25,
          font: { size: 12, family: FONT_FAMILY },
          color: CHART_COLORS.text,
          boxWidth: 8,
          boxHeight: 8,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: CHART_COLORS.axis,
          font: { size: 12, family: FONT_FAMILY },
          maxRotation: 0,
          padding: 10,
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: CHART_COLORS.grid },
        border: { display: false },
        ticks: {
          color: CHART_COLORS.axis,
          font: { size: 12, family: FONT_FAMILY },
          padding: 15,
          stepSize: 20,
        },
      },
    },
    elements: { bar: { borderSkipped: false } },
  };

  const legendSpacingPlugin: Plugin<"bar"> = {
    id: "legendSpacing",
    beforeInit(chart: any) {
      const originalFit = chart.legend.fit.bind(chart.legend);
      chart.legend.fit = function fit() {
        originalFit();
        this.height += 40;
      };
    },
  };

  return {
    registerPlugins,
    barChartData,
    barChartOptions,
    legendSpacingPlugin,
  };
}
