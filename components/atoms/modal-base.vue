<template>
  <Teleport to="body">
    <Transition :name="transitionName" appear>
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
          <div class="modal__drag-handle" aria-hidden="true" />

          <header class="modal__header" :class="headerClass" v-if="!hideHeader">
            <h2 class="modal__title" :id="headerId" v-if="$slots.title">
              <slot name="title" />
            </h2>

            <nav
              class="modal__controls"
              v-if="showCloseButton"
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

const { lock, unlock } = useScrollLock();

const dialogRef = ref<HTMLElement>();
const triggerElement = ref<HTMLElement | null>(null);
const modalZIndex = ref(1000);
const modalId = ref("");
const headerId = computed(() => `modal-header-${modalId.value}`);
const contentId = computed(() => `modal-content-${modalId.value}`);

const activeModals = useState<Set<string>>("activeModals", () => new Set());
const closeAllTrigger = useState("closeAllTrigger", () => 0);

const isMobile = ref(false);
const transitionName = computed(() =>
  isMobile.value ? "modal-sheet" : "modal",
);

onMounted(() => {
  modalId.value = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const mq = window.matchMedia("(max-width: 47.9375rem)");
  isMobile.value = mq.matches;
  mq.addEventListener("change", (e) => {
    isMobile.value = e.matches;
  });
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

watch(closeAllTrigger, () => {
  if (props.isOpen && activeModals.value.has(modalId.value)) {
    closeModal();
  }
});

watch(
  () => props.isOpen,
  (newValue, oldValue) => {
    if (newValue && !oldValue) {
      triggerElement.value = document.activeElement as HTMLElement;
      activeModals.value.add(modalId.value);
      lock();
      nextTick(() => dialogRef.value?.focus());
    } else if (!newValue && oldValue) {
      activeModals.value.delete(modalId.value);
      unlock();
      nextTick(() => triggerElement.value?.focus());
    }
  },
);

onUnmounted(() => {
  if (props.isOpen) {
    activeModals.value.delete(modalId.value);
    unlock();
    triggerElement.value?.focus();
  }
  document.removeEventListener("keydown", trapFocus);
});

const trapFocus = (e: KeyboardEvent) => {
  if (!props.isOpen || !dialogRef.value) return;

  // Only trap focus in the topmost active modal
  const modals = Array.from(activeModals.value);
  if (modals[modals.length - 1] !== modalId.value) return;

  const focusableElements = dialogRef.value.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
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

defineExpose({
  modalId,
});
</script>

<style lang="scss" scoped>
$modal-backdrop-color: rgba(0, 0, 0, 0.2);
$modal-border-radius: 0.9375rem;
$modal-padding: 1.5rem;
$modal-focus-color: #3b82f6;
$modal-breakpoint: 48rem;

// ─── Mobile-first base (bottom-sheet) ───────────────────────────────────────

.modal {
  position: fixed;
  inset: 0;
  background-color: $modal-backdrop-color;
  display: flex;
  align-items: flex-end; // bottom-sheet on mobile
  justify-content: center;
  overflow: hidden;

  &__drag-handle {
    width: 2.5rem;
    height: 0.25rem;
    background: #e2e8f0;
    border-radius: 0.125rem;
    margin: 0.75rem auto 0;
    flex-shrink: 0;
  }

  &__dialog {
    background: white;
    box-shadow:
      0 -0.25rem 0.5rem -0.125rem #1018280a,
      0 -0.5rem 1.5rem -0.25rem #1018281a;
    display: flex;
    flex-direction: column;
    outline: none;
    border: none;
    padding: 0;
    margin: 0;
    width: 100%;
    max-width: 100%;
    max-height: 90dvh;
    border-radius: $modal-border-radius $modal-border-radius 0 0;

    // All size variants collapse to full-width sheet on mobile
    &--extra-small,
    &--small,
    &--medium,
    &--large,
    &--extra-large,
    &--fullscreen {
      width: 100%;
      max-width: 100%;
    }

    &--fullscreen {
      max-height: 100dvh;
      border-radius: 0;
    }

    &--custom {
      max-width: 100%;
      max-height: 90dvh;
    }

  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem $modal-padding 0 $modal-padding;
    border-radius: $modal-border-radius $modal-border-radius 0 0;
  }

  &__title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #1a202c;
  }

  &__controls {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-left: auto;
  }

  &__close {
    // 44×44 px touch target
    min-width: 2.75rem;
    min-height: 2.75rem;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 0.375rem;
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
      outline: none;
    }

    &:focus-visible {
      outline: 2px solid $modal-focus-color;
      outline-offset: 2px;
    }
  }

  &__close-icon {
    width: 1.5rem;
    height: 1.5rem;
    pointer-events: none;
  }

  &__content {
    flex: 1;
    padding: 0;
    overflow-y: auto;
    color: #374151;
    line-height: 1.6;
    // Smooth momentum scrolling on iOS
    -webkit-overflow-scrolling: touch;
  }

  &__footer {
    padding: $modal-padding;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    border-radius: 0 0 $modal-border-radius $modal-border-radius;
    flex-shrink: 0;
  }
}

// ─── Desktop override (centered dialog) ─────────────────────────────────────

@media (min-width: $modal-breakpoint) {
  .modal {
    align-items: center;
    padding: 1rem;

    &__drag-handle {
      display: none;
    }

    &__dialog {
      border-radius: $modal-border-radius;
      box-shadow:
        0 0.5rem 0.5rem -0.25rem #1018280a,
        0 1.25rem 1.5rem -0.25rem #1018281a;
      margin: 0 auto;

      &--extra-small {
        width: 25rem;
        max-width: 90vw;
        max-height: 90vh;
      }

      &--small {
        width: 33.5rem;
        max-width: 90vw;
        max-height: 90vh;
      }

      &--medium {
        width: 39.75rem;
        max-width: 90vw;
        max-height: 90vh;
      }

      &--large {
        width: 44.875rem;
        max-width: 90vw;
        max-height: 90vh;
      }

      &--extra-large {
        width: 62.5rem;
        max-width: 90vw;
        max-height: 90vh;
      }

      &--fullscreen {
        width: 95vw;
        max-width: 95vw;
        max-height: 95vh;
        border-radius: $modal-border-radius;
      }

      &--custom {
        max-width: 90vw;
        max-height: 90vh;
      }
    }

    &__header {
      padding: $modal-padding $modal-padding 0 $modal-padding;
    }

    &__title {
      font-size: 1.25rem;
    }

    &__controls {
      gap: 0.5rem;
    }
  }
}

// ─── Shared utility classes ──────────────────────────────────────────────────

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

.height-full {
  height: 100%;
  display: flex;
  flex-direction: column;
}

// ─── Mobile: slide-up transition ────────────────────────────────────────────

.modal-sheet-enter-active,
.modal-sheet-leave-active {
  transition: opacity 0.25s ease;

  .modal__dialog {
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

.modal-sheet-enter-from,
.modal-sheet-leave-to {
  opacity: 0;

  .modal__dialog {
    transform: translateY(100%);
  }
}

// ─── Desktop: scale + fade transition ───────────────────────────────────────

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;

  .modal__dialog {
    transition: transform 0.25s ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal__dialog {
    transform: scale(0.95) translateY(-0.5rem);
  }
}
</style>
