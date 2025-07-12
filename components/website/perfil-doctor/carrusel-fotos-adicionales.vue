<script setup lang="ts">
interface Props {
  isOpen: boolean;
  images?: string[];
}

const props = withDefaults(defineProps<Props>(), {
  images: () => [
    "/_nuxt/src/assets/img-clinica-thumbnail-md.png",
    "/_nuxt/src/assets/img-clinica-thumbnail-md.png",
    "/_nuxt/src/assets/img-clinica-thumbnail-md.png",
    "/_nuxt/src/assets/img-clinica-thumbnail-md.png",
    "/_nuxt/src/assets/img-clinica-thumbnail-md.png",
  ],
});

const emit = defineEmits<{
  close: [];
}>();

const currentIndex = ref(0);
const isTransitioning = ref(false);

const nextSlide = () => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  currentIndex.value = (currentIndex.value + 1) % props.images.length;
  setTimeout(() => {
    isTransitioning.value = false;
  }, 300);
};

const prevSlide = () => {
  if (isTransitioning.value) return;
  isTransitioning.value = true;
  currentIndex.value =
    currentIndex.value === 0 ? props.images.length - 1 : currentIndex.value - 1;
  setTimeout(() => {
    isTransitioning.value = false;
  }, 300);
};

const goToSlide = (index: number) => {
  if (isTransitioning.value || index === currentIndex.value) return;
  isTransitioning.value = true;
  currentIndex.value = index;
  setTimeout(() => {
    isTransitioning.value = false;
  }, 300);
};

const handleClose = () => {
  emit("close");
};

const handleKeydown = (e: KeyboardEvent) => {
  if (!props.isOpen) return;

  switch (e.key) {
    case "Escape":
      handleClose();
      break;
    case "ArrowLeft":
      prevSlide();
      break;
    case "ArrowRight":
      nextSlide();
      break;
  }
};

// Touch support for mobile
let touchStartX = 0;
let touchEndX = 0;

const handleTouchStart = (e: TouchEvent) => {
  touchStartX = e.changedTouches[0].screenX;
};

const handleTouchEnd = (e: TouchEvent) => {
  touchEndX = e.changedTouches[0].screenX;
  handleSwipe();
};

const handleSwipe = () => {
  const swipeThreshold = 50;
  const diff = touchStartX - touchEndX;

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      nextSlide();
    } else {
      prevSlide();
    }
  }
};

// Auto-advance carousel
let autoAdvanceInterval: NodeJS.Timeout | null = null;

const startAutoAdvance = () => {
  if (autoAdvanceInterval) return;
  autoAdvanceInterval = setInterval(() => {
    nextSlide();
  }, 5000);
};

const stopAutoAdvance = () => {
  if (autoAdvanceInterval) {
    clearInterval(autoAdvanceInterval);
    autoAdvanceInterval = null;
  }
};

// Watchers y lifecycle
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      document.body.style.overflow = "hidden";
      startAutoAdvance();
    } else {
      document.body.style.overflow = "";
      stopAutoAdvance();
      currentIndex.value = 0; // Reset to first image
    }
  }
);

onMounted(() => {
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  document.body.style.overflow = "";
  stopAutoAdvance();
});
</script>

<template>
  <Teleport to="body">
    <Transition name="carousel-backdrop">
      <div v-if="isOpen" class="carousel-overlay" @click="handleClose">
        <div
          class="carousel-container"
          @click.stop
          @touchstart="handleTouchStart"
          @touchend="handleTouchEnd"
        >
          >
          <!-- Close button -->
          <button
            class="carousel-close"
            @click="handleClose"
            aria-label="Cerrar carrusel"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>

          <!-- Main carousel -->
          <div class="carousel-main">
            <!-- Navigation arrows -->
            <button
              class="carousel-nav carousel-nav--prev"
              @click="prevSlide"
              :disabled="isTransitioning"
              aria-label="Imagen anterior"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18l-6-6 6-6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <button
              class="carousel-nav carousel-nav--next"
              @click="nextSlide"
              :disabled="isTransitioning"
              aria-label="Siguiente imagen"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 18l6-6-6-6"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>

            <!-- Images container -->
            <div class="carousel-images">
              <div
                class="carousel-track"
                :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
              >
                <div
                  v-for="(image, index) in images"
                  :key="index"
                  class="carousel-slide"
                >
                  <img
                    :src="image"
                    :alt="`Imagen ${index + 1}`"
                    class="carousel-image"
                    @mouseenter="stopAutoAdvance"
                    @mouseleave="startAutoAdvance"
                    @touchstart="stopAutoAdvance"
                    @touchend="startAutoAdvance"
                  />
                </div>
              </div>
            </div>

            <!-- Counter -->
            <div class="carousel-counter">
              {{ currentIndex + 1 }} / {{ images.length }}
            </div>
          </div>

          <!-- Thumbnails -->
          <div class="carousel-thumbnails">
            <button
              v-for="(image, index) in images"
              :key="index"
              class="carousel-thumbnail"
              :class="{ 'carousel-thumbnail--active': index === currentIndex }"
              @click="goToSlide(index)"
              :aria-label="`Ir a imagen ${index + 1}`"
            >
              <img
                :src="image"
                :alt="`Miniatura ${index + 1}`"
                class="carousel-thumbnail-image"
              />
            </button>
          </div>

          <!-- Dots indicator -->
          <div class="carousel-dots">
            <button
              v-for="(_, index) in images"
              :key="index"
              class="carousel-dot"
              :class="{ 'carousel-dot--active': index === currentIndex }"
              @click="goToSlide(index)"
              :aria-label="`Ir a imagen ${index + 1}`"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style lang="scss" scoped>
// Variables (ajusta las rutas según tu proyecto)
$color-primary: #3541b4;
$color-foreground: #19213d;
$color-primary-darkened-5: darken($color-primary, 5%);
$color-primary-darkened-10: darken($color-primary, 10%);
$color-text-secondary: #6d758f;
$color-text-muted: #667085;
$primary-aqua: #0cadbb;
$primary-aqua-light: #9edee4;
$font-family-main: "Montserrat", sans-serif;
$font-family-alt: "Inter", sans-serif;
$font-family-montserrat-alt: "Montserrat Alternates", sans-serif;
$font-family-mulish: "Mulish", sans-serif;
$border-radius-md: 8px;
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 24px;
$breakpoint-xs: 320px;
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;
$breakpoint-xxl: 1400px;

.carousel-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $spacing-lg;
}

.carousel-container {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: $spacing-lg;
}

.carousel-close {
  position: absolute;
  top: -#{$spacing-lg};
  right: -#{$spacing-lg};
  z-index: 10;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
}

.carousel-main {
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 5;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-50%) scale(1.05);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--prev {
    left: -#{$spacing-lg};
  }

  &--next {
    right: -#{$spacing-lg};
  }
}

.carousel-images {
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: $border-radius-md;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.carousel-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel-slide {
  flex: 0 0 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: $border-radius-md;
  max-width: 100%;
  max-height: 100%;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
}

.carousel-counter {
  position: absolute;
  bottom: $spacing-md;
  right: $spacing-md;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: $spacing-xs $spacing-sm;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  backdrop-filter: blur(4px);
}

.carousel-thumbnails {
  display: flex;
  gap: $spacing-sm;
  justify-content: center;
  flex-wrap: wrap;
  max-width: 100%;
  padding: $spacing-sm;
}

.carousel-thumbnail {
  width: 80px;
  height: 60px;
  border: 2px solid transparent;
  border-radius: $border-radius-md;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: 0.6;
  background: none;

  &--active {
    border-color: $primary-aqua;
    opacity: 1;
    transform: scale(1.05);
  }

  &:hover {
    opacity: 1;
    transform: scale(1.02);
  }
}

.carousel-thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-dots {
  display: flex;
  justify-content: center;
  gap: $spacing-sm;
  margin-top: $spacing-md;
}

.carousel-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;

  &--active {
    background: $primary-aqua;
    transform: scale(1.2);
  }

  &:hover {
    background: rgba(255, 255, 255, 0.6);
  }
}

// Transitions
.carousel-backdrop-enter-active,
.carousel-backdrop-leave-active {
  transition: all 0.3s ease;
}

.carousel-backdrop-enter-from,
.carousel-backdrop-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

// Responsive design
@media (max-width: $breakpoint-lg) {
  .carousel-container {
    max-width: 95vw;
    max-height: 95vh;
    gap: $spacing-md;
  }

  .carousel-nav {
    width: 50px;
    height: 50px;

    &--prev {
      left: -#{$spacing-md};
    }

    &--next {
      right: -#{$spacing-md};
    }
  }

  .carousel-thumbnails {
    gap: $spacing-xs;
  }

  .carousel-thumbnail {
    width: 70px;
    height: 52px;
  }
}

@media (max-width: $breakpoint-md) {
  .carousel-overlay {
    padding: $spacing-md;
  }

  .carousel-container {
    max-width: 98vw;
    max-height: 98vh;
    gap: $spacing-sm;
  }

  .carousel-nav {
    width: 44px;
    height: 44px;

    &--prev {
      left: -#{$spacing-sm};
    }

    &--next {
      right: -#{$spacing-sm};
    }
  }

  .carousel-close {
    top: -#{$spacing-sm};
    right: -#{$spacing-sm};
    width: 42px;
    height: 42px;
  }

  .carousel-counter {
    bottom: $spacing-sm;
    right: $spacing-sm;
    font-size: 13px;
  }

  .carousel-thumbnails {
    display: none;
  }

  .carousel-dots {
    margin-top: $spacing-md;
    gap: $spacing-xs;
  }

  .carousel-dot {
    width: 10px;
    height: 10px;
  }
}

@media (max-width: $breakpoint-sm) {
  .carousel-overlay {
    padding: $spacing-sm;
  }

  .carousel-container {
    max-width: 100vw;
    max-height: 100vh;
  }

  .carousel-nav {
    width: 40px;
    height: 40px;

    &--prev {
      left: $spacing-xs;
    }

    &--next {
      right: $spacing-xs;
    }
  }

  .carousel-close {
    top: $spacing-xs;
    right: $spacing-xs;
    width: 38px;
    height: 38px;
  }

  .carousel-counter {
    bottom: $spacing-xs;
    right: $spacing-xs;
    font-size: 12px;
    padding: 6px 10px;
  }

  .carousel-main {
    flex: 1;
  }

  .carousel-images {
    border-radius: 6px;
  }

  .carousel-dots {
    margin-top: $spacing-sm;
  }
}

@media (max-width: $breakpoint-xs) {
  .carousel-nav {
    width: 36px;
    height: 36px;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  .carousel-close {
    width: 34px;
    height: 34px;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  .carousel-counter {
    font-size: 11px;
    padding: 4px 8px;
  }

  .carousel-dot {
    width: 8px;
    height: 8px;
  }
}
</style>
