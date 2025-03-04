<template>
  <div class="stepper" ref="stepper">
    <div
      v-for="(step, index) in steps"
      :key="index"
      class="step"
      :class="{ active: currentStep === index + 1, completed: currentStep > index + 1 }"
    >
      <div class="step-circle">
        <span v-if="currentStep > index + 1">✓</span>
        <span v-else-if="currentStep === index + 1">
          <svg xmlns="http://www.w3.org/2000/svg" width="31" height="31" viewBox="0 0 31 31" fill="none">
            <rect opacity="0.2" width="31" height="31" rx="15.5" fill="#0CADBB"/>
            <rect x="5.66669" y="5.6665" width="19.6667" height="19.6667" rx="9.83333" stroke="#0CADBB"/>
            <rect x="10.8333" y="10.8335" width="9.33333" height="9.33333" rx="4.66667" fill="#0CADBB" stroke="#0CADBB"/>
          </svg>
        </span>
        <span v-else></span>
      </div>
      <div class="step-label" :class="{ 'active': currentStep === index + 1, 'completed': currentStep > index + 1 }">{{ step }}</div>
    </div>
    <div class="line"></div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
export default {
  props: {
    steps: {
      type: Array,
      required: true,
    },
    currentStep: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const stepper = ref(null);

    onMounted(() => {
      const line = stepper.value.querySelector('.line');
      const steps = stepper.value.querySelectorAll('.step');
      let totalStepsWidth = 0;

      steps.forEach(step => {
        totalStepsWidth += step.offsetWidth; // Include margins if needed
      });

      //Add the gaps between the steps
      totalStepsWidth += (steps.length -1) * 80

      line.style.width = `${totalStepsWidth}px`;
      line.style.left = `calc(50% - ${totalStepsWidth/2}px)`
    });

    return { stepper };
  },
};
</script>

<style scoped>
.stepper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  position: relative; /* Needed for absolute positioning of the line */
  gap: 80px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1; /* Ensure circles are above the line */
}

/* Removed ::after pseudo-element */

.line {
  position: absolute;
  top: 30%;
  transform: translateY(-1px);
  height: 2px;
  background-color: #e0e0e0;
  z-index: 0;
}

.step-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #e0e0e0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #fff;
  margin-bottom: 8px;
}

.step.completed .step-circle {
  background-color: #0CADBB;
}

.step-label {
  font-size: 12px;
  color: #666;
}

.step.completed .step-label{
  color: #0CADBB;
}
</style>