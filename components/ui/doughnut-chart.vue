<script lang="ts" setup>
import {
  ArcElement,
  Chart as ChartJS,
  Colors,
  Legend,
  Title,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from "chart.js";
import { Doughnut } from "vue-chartjs";

interface Props {
  attendedValue: number;
  totalValue: number;
  title?: string;
  description?: string;
  centerLabel?: string;
  chartSize?: number;
  centerLabelMaxWidth?: number;
  cutout?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  description: "",
  centerLabel: "",
  centerLabelMaxWidth: 100,
  cutout: "65%",
});

if (process.client) {
  ChartJS.register(Title, Tooltip, Legend, ArcElement, Colors);
}

const percentage = computed(() => {
  if (props.totalValue === 0) return 0;
  return Math.round((props.attendedValue / props.totalValue) * 100);
});

const remainingValue = computed(() => {
  return Math.max(0, props.totalValue - props.attendedValue);
});

const overlappingSegmentsPlugin = {
  id: "overlappingSegments",
  afterDatasetDraw(chart: any, args: any, plugins: any) {
    const { ctx, data } = chart;

    data.datasets.forEach((dataset: any, datasetIndex: number) => {
      const meta = chart.getDatasetMeta(datasetIndex);

      meta.data.forEach((segment: any, index: number) => {
        const x = segment.x;
        const y = segment.y;
        const angle = Math.PI / 180;
        const length = data.labels.length - 1;

        if (index < length && chart.getDataVisibility(index)) {
          const innerRadius = segment.innerRadius;
          const outerRadius = segment.outerRadius;
          const endAngle = segment.endAngle;
          const radius = (outerRadius - innerRadius) / 2;

          const coordinates = [];

          for (let i = -0.05; i <= 0.05; i += 0.02) {
            const xCoor =
              (innerRadius + radius) * Math.cos(endAngle + Math.PI + i);
            const yCoor = (innerRadius + radius) * Math.sin(endAngle + i);
            coordinates.push({ x: xCoor, y: yCoor });
          }

          ctx.save();

          let fillColor = dataset.backgroundColor[index];

          const hoveredElements = chart.getActiveElements();
          const isHovered = hoveredElements.some(
            (el: any) => el.datasetIndex === datasetIndex && el.index === index
          );

          if (isHovered && dataset.hoverBackgroundColor) {
            fillColor = dataset.hoverBackgroundColor[index];
          }

          ctx.fillStyle = fillColor;
          ctx.translate(x, y);
          ctx.beginPath();

          coordinates.forEach(({ x: coordX, y: coordY }) => {
            ctx.arc(-coordX, coordY, radius - 0, 0, angle * 360, false);
          });

          ctx.fill();
          ctx.restore();
        }
      });
    });
  },
};

const doughnutCenterTextPlugin = {
  id: "doughnutCenterText",
  afterDatasetsDraw: (chart: any) => {
    const { ctx } = chart;
    if (chart.config.type !== "doughnut") return;

    const meta = chart.getDatasetMeta(0);
    const firstArc = meta.data[0];
    if (!firstArc || !firstArc.endAngle) return;

    const centerX = firstArc.x;
    const centerY = firstArc.y;

    ctx.save();

    ctx.font = "bold 44px Montserrat";
    ctx.fillStyle = "#0CADBB";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${percentage.value}%`, centerX, centerY - 10);

    ctx.font = "18px Montserrat";
    ctx.fillStyle = "#6D758F";

    const maxWidth = props.centerLabelMaxWidth;
    const lineHeight = 20;
    const spacingFromPercentage = 40;
    const words = props.centerLabel.split(" ");
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const testLine = currentLine + " " + words[i];
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    const startY =
      centerY + spacingFromPercentage - ((lines.length - 1) * lineHeight) / 2;
    lines.forEach((line, index) => {
      ctx.fillText(line, centerX, startY + index * lineHeight);
    });

    ctx.restore();
  },
};

const registerCustomPlugins = () => {
  if (process.client) {
    if (!ChartJS.registry.plugins.get("overlappingSegments")) {
      ChartJS.register(overlappingSegmentsPlugin);
    }
    if (!ChartJS.registry.plugins.get("doughnutCenterText")) {
      ChartJS.register(doughnutCenterTextPlugin);
    }
  }
};

const doughnutData = computed<ChartData<"doughnut">>(() => ({
  labels: ["Atendidos", "Restantes"],
  datasets: [
    {
      label: "Pacientes",
      data: [props.attendedValue, remainingValue.value],
      backgroundColor: ["#0CADBB", "#F3F4FB"],
      hoverBackgroundColor: ["#0A9AA7", "#EAEBF2"],
      borderColor: "transparent",
      borderRadius: [
        {
          outerStart: 30,
          outerEnd: 0,
          innerStart: 30,
          innerEnd: 0,
        },
        {
          outerStart: 0,
          outerEnd: 30,
          innerStart: 0,
          innerEnd: 30,
        },
      ],
      spacing: 0,
      order: 1,
    },
  ],
}));

const singleValueOptions = computed<ChartOptions<"doughnut">>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 300,
  },
  interaction: {
    intersect: false,
    mode: "index",
  },
  hover: {
    mode: "index",
    intersect: false,
  },
  onHover: (event: any, elements: any, chart: any) => {
    chart.update("none");
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: true,
      backgroundColor: "#333",
      titleColor: "#fff",
      bodyColor: "#fff",
      borderColor: "#666",
      borderWidth: 1,
      cornerRadius: 8,
      callbacks: {
        label: (context: any) => {
          const label = context.label || "";
          const value = context.parsed;
          const total = context.dataset.data.reduce(
            (a: number, b: number) => a + b,
            0
          );
          const percentage = Math.round((value / total) * 100);
          return `${label}: ${value} (${percentage}%)`;
        },
      },
    },
    title: {
      display: false,
    },
  },
  circumference: 270,
  rotation: -134,
  cutout: props.cutout,
  elements: {
    arc: {
      borderWidth: 0,
      hoverBorderWidth: 0,
    },
  },
  layout: {
    padding: 0,
  },
}));

const unregisterCustomPlugins = () => {
  if (process.client) {
    ChartJS.unregister(overlappingSegmentsPlugin);
    ChartJS.unregister(doughnutCenterTextPlugin);
  }
};

onMounted(() => {
  registerCustomPlugins();
});

onUnmounted(() => {
  unregisterCustomPlugins();
});

onBeforeUnmount(() => {
  unregisterCustomPlugins();
});
</script>

<template>
  <div class="doughnut-chart">
    <div
      class="doughnut-chart__body"
      :style="{ maxHeight: chartSize ? `${chartSize}px` : '' }"
    >
      <div class="doughnut-chart__wrapper">
        <Doughnut
          class="doughnut-chart__canvas"
          :data="doughnutData"
          :options="singleValueOptions"
          :aria-label="`Gráfico circular mostrando ${title}`"
        />
      </div>
      <h3 class="doughnut-chart__title">{{ title }}</h3>
      <p class="doughnut-chart__description">{{ description }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.doughnut-chart {
  width: 100%;
  height: 100%;

  &__body {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    max-height: 228px;
    position: relative;
    height: 100%;
  }

  &__wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__canvas {
    width: 100%;
    height: 100%;
  }

  &__title {
    font-family: $font-family-main;
    font-weight: 600;
    font-size: 16px;
    line-height: 100%;
    color: #353e5c;
    margin: $spacing-md 0 $spacing-xs;
    text-align: center;
  }

  &__description {
    font-family: $font-family-main;
    font-weight: 300;
    font-size: 14px;
    line-height: 100%;
    color: #6d758f;
    margin: 0;
    text-align: center;
  }
}
</style>
