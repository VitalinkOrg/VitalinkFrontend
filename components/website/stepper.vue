<template>
  <div class="stepper" ref="stepper">
    <div
      v-for="(step, index) in steps"
      :key="index"
      class="step"
      :class="{
        active: currentStep === index + 1,
        completed: currentStep > index + 1,
      }"
    >
      <div class="step-circle-container">
        <div class="step-circle" ref="stepCircles">
          <span v-if="currentStep > index + 1">✓</span>
          <span v-else-if="currentStep === index + 1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="31"
              height="31"
              viewBox="0 0 31 31"
              fill="none"
            >
              <rect
                opacity="0.2"
                width="31"
                height="31"
                rx="15.5"
                fill="#0CADBB"
              />
              <rect
                x="5.66669"
                y="5.6665"
                width="19.6667"
                height="19.6667"
                rx="9.83333"
                stroke="#0CADBB"
              />
              <rect
                x="10.8333"
                y="10.8335"
                width="9.33333"
                height="9.33333"
                rx="4.66667"
                fill="#0CADBB"
                stroke="#0CADBB"
              />
            </svg>
          </span>
          <span v-else></span>
        </div>
      </div>
      <div class="step-label">
        {{ step }}
      </div>
    </div>
    <div class="line" ref="line"></div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";

interface Props {
  steps: Array<string>;
  currentStep: number;
}

const props = defineProps<Props>();

const stepper = ref<HTMLElement | null>(null);
const line = ref<HTMLElement | null>(null);
const stepCircles = ref<HTMLElement[]>([]);

let resizeObserver: ResizeObserver | null = null;
let timeoutId: number | null = null;

const updateLinePosition = () => {
  if (!stepper.value || !line.value || stepCircles.value.length < 2) return;

  const circles = stepCircles.value.filter((circle) => circle !== null);
  if (circles.length < 2) return;

  const firstCircle = circles[0];
  const lastCircle = circles[circles.length - 1];

  const stepperRect = stepper.value.getBoundingClientRect();
  const firstRect = firstCircle.getBoundingClientRect();
  const lastRect = lastCircle.getBoundingClientRect();

  if (
    stepperRect.width === 0 ||
    firstRect.width === 0 ||
    lastRect.width === 0
  ) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = window.setTimeout(updateLinePosition, 50);
    return;
  }

  const start = firstRect.left + firstRect.width / 2 - stepperRect.left;
  const end = lastRect.left + lastRect.width / 2 - stepperRect.left;

  line.value.style.left = `${start}px`;
  line.value.style.width = `${Math.max(0, end - start)}px`;
};

const scheduleUpdate = () => {
  if (timeoutId) clearTimeout(timeoutId);
  timeoutId = window.setTimeout(() => {
    nextTick(() => {
      requestAnimationFrame(updateLinePosition);
    });
  }, 100);
};

onMounted(async () => {
  await nextTick();
  await new Promise((resolve) => setTimeout(resolve, 150));

  updateLinePosition();

  if (stepper.value && "ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(() => {
      scheduleUpdate();
    });
    resizeObserver.observe(stepper.value);
  }

  window.addEventListener("resize", scheduleUpdate);

  window.addEventListener("load", scheduleUpdate);
});

watch(
  () => [props.steps.length, props.currentStep],
  () => {
    scheduleUpdate();
  },
  { flush: "post" }
);

watch(
  stepCircles,
  () => {
    scheduleUpdate();
  },
  { deep: true, flush: "post" }
);

onBeforeUnmount(() => {
  if (timeoutId) clearTimeout(timeoutId);
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
  window.removeEventListener("resize", scheduleUpdate);
  window.removeEventListener("load", scheduleUpdate);
});
</script>

<style scoped>
.stepper {
  display: flex;
  justify-content: center;
  position: relative;
  margin: 40px 0;
  width: 100%;
  min-height: 50px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  flex: 0 1 auto;
  min-width: 0;
  padding: 0 40px;
}

.step-circle-container {
  display: flex;
  justify-content: center;
  width: 100%;
}

.step-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 1px solid #e0e0e0;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #fff;
  margin-bottom: 8px;
  flex-shrink: 0;
}

.line {
  position: absolute;
  top: 12px;
  height: 2px;
  background-color: #0cadbb;
  z-index: 0;
  transition: all 0.2s ease;
  opacity: 0;
  animation: fadeIn 0.3s ease-in-out 0.2s forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.step.completed .step-circle {
  background-color: #0cadbb;
}

.step-label {
  font-size: 12px;
  color: #666;
  text-align: center;
  white-space: normal;
  word-break: break-word;
  width: 100%;
  position: relative;
  left: 50%;
  transform: translateX(-50%);
  max-width: max-content;
}

.step.completed .step-label {
  color: #0cadbb;
}

.step.active .step-label {
  color: #0cadbb;
  font-weight: bold;
}
</style>
