<template>
  <div class="stepper" ref="stepper">
    <div
      v-for="(step, index) in steps"
      :key="index"
      class="stepper__step"
      :class="{
        'stepper__step--active': currentStep === index + 1,
        'stepper__step--completed': currentStep > index + 1,
      }"
    >
      <div class="stepper__circle-container">
        <div class="stepper__circle">
          <span v-if="currentStep > index + 1">✓</span>
          <span v-else>
            <svg
              class="stepper__icon"
              xmlns="http://www.w3.org/2000/svg"
              width="31"
              height="31"
              viewBox="0 0 31 31"
              fill="none"
            >
              <rect
                class="stepper__icon-bg"
                opacity="0.2"
                width="31"
                height="31"
                rx="15.5"
              />
              <rect
                class="stepper__icon-border"
                x="5.66669"
                y="5.6665"
                width="19.6667"
                height="19.6667"
                rx="9.83333"
              />
              <rect
                class="stepper__icon-center"
                x="10.8333"
                y="10.8335"
                width="9.33333"
                height="9.33333"
                rx="4.66667"
              />
            </svg>
          </span>
        </div>
      </div>
      <div class="stepper__label">
        {{ step }}
      </div>
    </div>
    <div class="stepper__line"></div>
  </div>
</template>

<script>
import { nextTick, onMounted, ref } from "vue";
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

    const updateLinePosition = () => {
      if (!stepper.value) return;

      const line = stepper.value.querySelector(".stepper__line");
      const circles = stepper.value.querySelectorAll(".stepper__circle");

      if (circles.length < 2) {
        if (line) line.style.display = "none";
        return;
      }

      const firstCircle = circles[0];
      const lastCircle = circles[circles.length - 1];

      const firstRect = firstCircle.getBoundingClientRect();
      const lastRect = lastCircle.getBoundingClientRect();
      const stepperRect = stepper.value.getBoundingClientRect();

      const start = firstRect.left + 54 / 2 - stepperRect.left;
      const end = lastRect.left + lastRect.width / 2 - stepperRect.left;
      const width = end - start;

      if (line) {
        line.style.display = "block";
        line.style.left = `${start}px`;
        line.style.width = `${width}px`;
      }
    };

    onMounted(() => {
      nextTick(() => {
        updateLinePosition();
        window.addEventListener("resize", updateLinePosition);
      });
    });

    return { stepper };
  },
};
</script>

<style lang="scss" scoped>
.stepper {
  position: relative;
  display: flex;
  justify-content: space-between;
  margin: 12px 0;
  width: 100%;

  &__step {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 0 1 auto;
    min-width: 0;
    z-index: 1;
  }

  &__circle-container {
    display: flex;
    justify-content: flex-start;
    width: 100%;
  }

  &__circle {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    background-color: #fff;
    color: #fff;
    margin-bottom: 8px;
    flex-shrink: 0;
  }

  &__icon {
    width: 31px;
    height: 31px;

    &-bg {
      fill: $primary-aqua-light;
    }

    &-border {
      stroke: $primary-aqua-light;
      fill: none;
    }

    &-center {
      fill: $primary-aqua-light;
      stroke: $primary-aqua-light;
    }
  }

  &__line {
    position: absolute;
    top: 11px;
    height: 2px;
    background-color: $primary-aqua;
    z-index: 0;
  }

  &__label {
    font-family: $font-family-montserrat-alt;
    font-size: 16px;
    color: $primary-aqua-light;
    white-space: normal;
    word-break: break-word;
    width: 100%;
    position: relative;
    max-width: max-content;
    font-weight: 600;
    line-height: 18px;
    letter-spacing: 0;
    vertical-align: middle;
    max-width: 281px;
  }

  &__step--completed {
    .stepper__icon {
      &-bg {
        fill: $primary-aqua;
      }

      &-border {
        stroke: $primary-aqua;
        fill: none;
      }

      &-center {
        fill: $primary-aqua;
        stroke: $primary-aqua;
      }
    }

    .stepper__label {
      font-family: $font-family-main;
      color: $primary-aqua;
    }

    .stepper__circle {
      background-color: $primary-aqua;
    }
  }

  &__step--active {
    .stepper__icon {
      &-bg {
        fill: $primary-aqua;
      }

      &-border {
        stroke: $primary-aqua;
        fill: none;
      }

      &-center {
        fill: $primary-aqua;
        stroke: $primary-aqua;
      }
    }

    .stepper__label {
      font-family: $font-family-main;
      color: $primary-aqua;
    }
  }
}
</style>
