<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div
        v-if="isOpen"
        class="modal"
        @click="handleBackdropClick"
        @keydown.esc="closeModal"
        :id="modalId"
        :style="{ zIndex: modalZIndex }"
        tabindex="-1"
        role="dialog"
        :aria-labelledby="headerId"
        :aria-describedby="contentId"
        aria-modal="true"
      >
        <dialog
          class="modal__dialog"
          :class="modalClasses"
          :style="customStyles"
          @click.stop
          ref="dialogRef"
          open
        >
          <header class="modal__header" :class="headerClass" v-if="!hideHeader">
            <h2 class="modal__title" :id="headerId" v-if="$slots.title">
              <slot name="title" />
            </h2>

            <nav
              class="modal__controls"
              v-if="showCloseButton || showCloseAllButton"
              aria-label="Controles del modal"
            >
              <button
                v-if="showCloseButton"
                class="modal__close"
                type="button"
                @click="closeModal"
                :aria-label="closeButtonLabel"
              >
                <AtomsIconsXIcon
                  class="modal__close-icon"
                  width="24"
                  height="24"
                  aria-hidden="true"
                />
              </button>
            </nav>
          </header>

          <main class="modal__content" :class="contentClass" :id="contentId">
            <slot />
          </main>

          <footer
            class="modal__footer"
            :class="footerClass"
            v-if="$slots.footer"
          >
            <slot name="footer" />
          </footer>
        </dialog>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  isOpen: boolean;
  title?: string;
  size?:
    | "extra-small"
    | "small"
    | "medium"
    | "large"
    | "extra-large"
    | "fullscreen"
    | "custom";
  width?: string | number;
  maxWidth?: string | number;
  height?: string | number;
  maxHeight?: string | number;
  hideHeader?: boolean;
  showCloseButton?: boolean;
  showCloseAllButton?: boolean;
  closeOnBackdrop?: boolean;
  closeButtonLabel?: string;
  closeAllButtonLabel?: string;
  persistent?: boolean;
  headerClass?: string;
  contentClass?: string;
  footerClass?: string;
  modalClass?: string;
}

const emit = defineEmits(["close", "close-all", "opened", "closed"]);

const props = withDefaults(defineProps<Props>(), {
  title: "",
  size: "medium",
  width: undefined,
  maxWidth: undefined,
  height: undefined,
  maxHeight: undefined,
  hideHeader: false,
  showCloseButton: true,
  showCloseAllButton: true,
  closeOnBackdrop: true,
  closeButtonLabel: "Cerrar modal",
  closeAllButtonLabel: "Cerrar todos los modales",
  persistent: false,
  headerClass: "",
  contentClass: "",
  footerClass: "",
  modalClass: "",
});

const dialogRef = ref<HTMLElement>();
const modalZIndex = ref(1000);

const modalId = ref("");
const headerId = computed(() => `modal-header-${modalId.value}`);
const contentId = computed(() => `modal-content-${modalId.value}`);

const openModalsCount = useState("openModalsCount", () => 0);
const baseZIndex = useState("baseModalZIndex", () => 1000);
const activeModals = useState<Set<string>>("activeModals", () => new Set());
const closeAllTrigger = useState("closeAllTrigger", () => 0);
const isScrollLocked = useState("isScrollLocked", () => false);
const originalBodyPadding = useState("originalBodyPadding", () => "");
const originalBodyOverflow = useState("originalBodyOverflow", () => "");

onMounted(() => {
  modalId.value = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
});

const modalClasses = computed(() => ({
  [`modal__dialog--${props.size}`]: props.size !== "custom",
  "modal__dialog--persistent": props.persistent,
  "modal__dialog--custom": props.size === "custom",
  "height-full":
    props.size === "fullscreen" || props.modalClass.includes("height-full"),
  ...(props.modalClass ? { [props.modalClass]: true } : {}),
}));

const customStyles = computed(() => {
  const styles: Record<string, string> = {
    zIndex: modalZIndex.value.toString(),
  };

  if (props.size === "custom") {
    if (props.width) {
      styles.width =
        typeof props.width === "number" ? `${props.width}px` : props.width;
    }

    if (props.maxWidth) {
      styles.maxWidth =
        typeof props.maxWidth === "number"
          ? `${props.maxWidth}px`
          : props.maxWidth;
    }

    if (props.height) {
      styles.height =
        typeof props.height === "number" ? `${props.height}px` : props.height;
    }

    if (props.maxHeight) {
      styles.maxHeight =
        typeof props.maxHeight === "number"
          ? `${props.maxHeight}px`
          : props.maxHeight;
    }
  }

  return styles;
});

const getScrollbarWidth = (): number => {
  if (typeof window === "undefined") return 0;
  return window.innerWidth - document.documentElement.clientWidth;
};

const lockBodyScroll = () => {
  if (typeof window === "undefined" || isScrollLocked.value) return;

  const body = document.body;
  const scrollbarWidth = getScrollbarWidth();

  originalBodyPadding.value = body.style.paddingRight || "";
  originalBodyOverflow.value = body.style.overflow || "";

  const computedPaddingRight = window.getComputedStyle(body).paddingRight;
  const currentPaddingRight = parseInt(computedPaddingRight, 10) || 0;

  body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
  body.style.overflow = "hidden";

  isScrollLocked.value = true;
};

const unlockBodyScroll = () => {
  if (typeof window === "undefined" || !isScrollLocked.value) return;

  const body = document.body;

  if (originalBodyPadding.value === "") {
    body.style.removeProperty("padding-right");
  } else {
    body.style.paddingRight = originalBodyPadding.value;
  }

  if (originalBodyOverflow.value === "") {
    body.style.removeProperty("overflow");
  } else {
    body.style.overflow = originalBodyOverflow.value;
  }

  isScrollLocked.value = false;
  originalBodyPadding.value = "";
  originalBodyOverflow.value = "";
};

const closeModal = () => {
  if (!props.persistent) {
    emit("close");
  }
};

const handleBackdropClick = () => {
  if (props.closeOnBackdrop && !props.persistent) {
    closeModal();
  }
};

const previousActiveElement = ref<HTMLElement | null>(null);

watch(closeAllTrigger, () => {
  if (props.isOpen && activeModals.value.has(modalId.value)) {
    closeModal();
  }
});

watch(
  () => props.isOpen,
  (newValue, oldValue) => {
    if (newValue && !oldValue) {
      openModalsCount.value++;
      activeModals.value.add(modalId.value);

      if (openModalsCount.value === 1) {
        lockBodyScroll();
      }

      nextTick(() => dialogRef.value?.focus());
    } else if (!newValue && oldValue) {
      openModalsCount.value = Math.max(0, openModalsCount.value - 1);
      activeModals.value.delete(modalId.value);

      if (openModalsCount.value === 0) {
        unlockBodyScroll();
      }
    }
  }
);

onUnmounted(() => {
  if (props.isOpen) {
    const wasLastModal = openModalsCount.value === 1;

    openModalsCount.value = Math.max(0, openModalsCount.value - 1);
    activeModals.value.delete(modalId.value);

    if (wasLastModal) {
      unlockBodyScroll();
    }
  }
});

const trapFocus = (e: KeyboardEvent) => {
  if (!props.isOpen || !dialogRef.value) return;

  const focusableElements = dialogRef.value.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (e.key === "Tab") {
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement?.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement?.focus();
        e.preventDefault();
      }
    }
  }
};

onMounted(() => {
  document.addEventListener("keydown", trapFocus);
});

onUnmounted(() => {
  document.removeEventListener("keydown", trapFocus);
});

defineExpose({
  modalId,
});
</script>

<style lang="scss" scoped>
$modal-backdrop-color: rgba(0, 0, 0, 0.2);
$modal-border-radius: 0.9375rem;
$modal-padding: 1.5rem;

@mixin modal-size($width, $max-height: 90vh) {
  width: $width;
  max-width: 90vw;
  max-height: $max-height;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: $modal-backdrop-color;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow: hidden;

  &__dialog {
    background: white;
    border-radius: $modal-border-radius;
    box-shadow:
      0 0.5rem 0.5rem -0.25rem #1018280a,
      0 1.25rem 1.5rem -0.25rem #1018281a;
    display: flex;
    flex-direction: column;
    outline: none;
    border: none;
    padding: 0;
    margin: 0 auto;

    @include modal-size(31.25rem);

    &--extra-small {
      @include modal-size(25rem);
    }

    &--small {
      @include modal-size(33.5rem);
    }

    &--medium {
      @include modal-size(39.75rem);
    }

    &--large {
      @include modal-size(44.875rem);
    }

    &--extra-large {
      @include modal-size(62.5rem);
    }

    &--fullscreen {
      @include modal-size(95vw, 95vh);
    }

    &--custom {
      max-width: 90vw;
      max-height: 90vh;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: $modal-padding $modal-padding 0 $modal-padding;
    border-radius: $modal-border-radius $modal-border-radius 0 0;
  }

  &__title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a202c;
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-left: auto;
  }

  &__close,
  &__close-all {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
    color: #64748b;

    &:hover {
      background-color: #f1f5f9;
      color: #374151;
    }

    &:focus {
      outline: 0.125rem solid #3b82f6;
      outline-offset: 0.125rem;
    }
  }

  &__close-all {
    color: #dc2626;

    &:hover {
      background-color: #fef2f2;
      color: #b91c1c;
    }

    &:focus {
      outline: 0.125rem solid #dc2626;
    }
  }

  &__close-icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  &__close-all-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  &__content {
    flex: 1;
    padding: 0;
    overflow-y: auto;
    color: #374151;
    line-height: 1.6;
  }

  &__footer {
    padding: $modal-padding;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    border-radius: 0 0 $modal-border-radius $modal-border-radius;
  }
}

.header-border-bottom {
  padding-bottom: 0.625rem;
  border-bottom: 1px solid #e4e7ec;
}

.footer-border-top {
  border-top: 1px solid #e4e7ec;
}

.padding-0 {
  padding: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;

  .modal__dialog {
    transition: transform 0.3s ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal__dialog {
    transform: scale(0.9) translateY(-1.25rem);
  }
}

@media (max-width: 48rem) {
  .modal {
    padding: 0.5rem;

    &__dialog {
      @include modal-size(95vw, 95vh);

      &--small,
      &--medium,
      &--large {
        @include modal-size(95vw, 95vh);
      }
    }

    &__header,
    &__content,
    &__footer {
      padding: 1rem;
    }
  }

  .modal__controls {
    gap: 0.25rem;
  }
}

.height-full {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>
