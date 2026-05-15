<template>
  <Teleport to="body">
    <Transition :name="transitionName" appear>
      <div
        v-if="isOpen"
        class="modal"
        :style="{ zIndex: MODAL_Z_INDEX }"
        @click="handleBackdropClick"
        tabindex="-1"
        ref="backdropRef"
      >
        <div
          role="dialog"
          class="modal__dialog"
          :class="modalClasses"
          :style="customStyles"
          :aria-labelledby="hasHeader ? headerId : undefined"
          :aria-describedby="contentId"
          aria-modal="true"
          @click.stop
          ref="dialogRef"
          tabindex="-1"
        >
          <div class="modal__drag-handle" aria-hidden="true" />

          <header v-if="!hideHeader" class="modal__header" :class="headerClass">
            <h2
              v-if="title || $slots.title"
              :id="headerId"
              class="modal__title"
            >
              <slot name="title">{{ title }}</slot>
            </h2>

            <nav
              v-if="showCloseButton"
              class="modal__controls"
              aria-label="Controles del modal"
            >
              <button
                class="modal__close"
                type="button"
                :aria-label="closeButtonLabel"
                @click="closeModal"
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
            v-if="$slots.footer"
            class="modal__footer"
            :class="footerClass"
          >
            <slot name="footer" />
          </footer>
        </div>
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
  closeOnBackdrop?: boolean;
  closeButtonLabel?: string;
  persistent?: boolean;
  headerClass?: string;
  contentClass?: string;
  footerClass?: string;
  modalClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: "",
  size: "medium",
  hideHeader: false,
  showCloseButton: true,
  closeOnBackdrop: true,
  closeButtonLabel: "Cerrar modal",
  persistent: false,
  headerClass: "",
  contentClass: "",
  footerClass: "",
  modalClass: "",
});

const emit = defineEmits<{
  close: [];
  opened: [];
  closed: [];
}>();

// ─── IDs ─────────────────────────────────────────────────────────────────────
// Stable module-level counter, equivalent to useId() (available in Nuxt ≥3.9).
let _idCounter = 0;
const _uid = ++_idCounter;
const headerId = `modal-header-${_uid}`;
const contentId = `modal-content-${_uid}`;

const hasHeader = computed(
  () => !props.hideHeader && !!(props.title || useSlots().title),
);

// ─── Scroll lock ─────────────────────────────────────────────────────────────
const { lock, unlock } = useScrollLock();

// ─── Template refs ───────────────────────────────────────────────────────────
const backdropRef = ref<HTMLElement | null>(null);
const dialogRef = ref<HTMLElement | null>(null);
const triggerElement = ref<HTMLElement | null>(null);

// ─── Constants ───────────────────────────────────────────────────────────────
const MODAL_Z_INDEX = 1000;

// ─── Mobile detection ────────────────────────────────────────────────────────
const isMobile = ref(false);
const transitionName = computed(() =>
  isMobile.value ? "modal-sheet" : "modal",
);

// ─── Multi-modal stack (only the topmost modal traps focus) ──────────────────
const modalStack = useState<string[]>("uiModalStack", () => []);
const modalId = `ui-modal-${_uid}`;
const isTopmost = computed(() => {
  const s = modalStack.value;
  return s.length > 0 && s[s.length - 1] === modalId;
});

// ─── Computed classes / styles ───────────────────────────────────────────────
const modalClasses = computed(() => ({
  [`modal__dialog--${props.size}`]: props.size !== "custom",
  "modal__dialog--custom": props.size === "custom",
  "modal__dialog--persistent": props.persistent,
  "height-full":
    props.size === "fullscreen" ||
    (props.modalClass ? props.modalClass.includes("height-full") : false),
  ...(props.modalClass ? { [props.modalClass]: true } : {}),
}));

const customStyles = computed(() => {
  if (props.size !== "custom") return {};
  const s: Record<string, string> = {};
  const px = (v: string | number) => (typeof v === "number" ? `${v}px` : v);
  if (props.width) s.width = px(props.width);
  if (props.maxWidth) s.maxWidth = px(props.maxWidth);
  if (props.height) s.height = px(props.height);
  if (props.maxHeight) s.maxHeight = px(props.maxHeight);
  return s;
});

// ─── Focus trapping ──────────────────────────────────────────────────────────
const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "details > summary:not([disabled])",
  "audio[controls]",
  "video[controls]",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

function getFocusable(): HTMLElement[] {
  return dialogRef.value
    ? Array.from(dialogRef.value.querySelectorAll<HTMLElement>(FOCUSABLE))
    : [];
}

function handleKeydown(e: KeyboardEvent) {
  if (!props.isOpen) return;

  if (e.key === "Escape") {
    if (!props.persistent) {
      e.preventDefault();
      closeModal();
    }
    return;
  }

  if (e.key !== "Tab" || !isTopmost.value) return;

  const focusable = getFocusable();

  if (focusable.length === 0) {
    e.preventDefault();
    dialogRef.value?.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement;

  // If focus escaped the dialog somehow, bring it back
  const insideDialog = dialogRef.value?.contains(active) ?? false;

  if (e.shiftKey) {
    if (!insideDialog || active === first) {
      e.preventDefault();
      last.focus();
    }
  } else {
    if (!insideDialog || active === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

// ─── Open / close logic ──────────────────────────────────────────────────────
function closeModal() {
  emit("close");
}

function handleBackdropClick() {
  if (props.closeOnBackdrop && !props.persistent) closeModal();
}

// ─── Watch isOpen ────────────────────────────────────────────────────────────
watch(
  () => props.isOpen,
  async (isOpen, wasOpen) => {
    if (isOpen && !wasOpen) {
      triggerElement.value = document.activeElement as HTMLElement;
      modalStack.value = [...modalStack.value, modalId];
      lock();
      await nextTick();
      const focusable = getFocusable();
      (focusable[0] ?? dialogRef.value)?.focus();
      emit("opened");
    } else if (!isOpen && wasOpen) {
      modalStack.value = modalStack.value.filter((id) => id !== modalId);
      unlock();
      await nextTick();
      triggerElement.value?.focus();
      emit("closed");
    }
  },
);

// ─── Lifecycle ───────────────────────────────────────────────────────────────
onMounted(() => {
  const mq = window.matchMedia("(max-width: 47.9375rem)");
  isMobile.value = mq.matches;
  mq.addEventListener("change", (e) => {
    isMobile.value = e.matches;
  });
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  if (props.isOpen) {
    modalStack.value = modalStack.value.filter((id) => id !== modalId);
    unlock();
    triggerElement.value?.focus();
  }
});

defineExpose({ modalId });
</script>

<style lang="scss" scoped>
$modal-backdrop-color: rgba(0, 0, 0, 0.2);
$modal-border-radius: 0.9375rem;
$modal-padding: 1.5rem;
$modal-focus-color: #3b82f6;
$modal-breakpoint: 48rem;

// ─── Mobile-first base (bottom-sheet) ────────────────────────────────────────

.modal {
  position: fixed;
  inset: 0;
  background-color: $modal-backdrop-color;
  display: flex;
  align-items: flex-end;
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
    max-height: 90vh;
    max-height: 90dvh;
    border-radius: $modal-border-radius $modal-border-radius 0 0;

    &--extra-small,
    &--small,
    &--medium,
    &--large,
    &--extra-large {
      width: 100%;
      max-width: 100%;
    }

    &--fullscreen {
      max-height: 100vh;
      max-height: 100dvh;
      border-radius: 0;
    }

    &--custom {
      max-width: 100%;
      max-height: 90vh;
      max-height: 90dvh;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem $modal-padding 0 $modal-padding;
    flex-shrink: 0;
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
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    min-height: 0;
    height: 100%;
  }

  &__footer {
    padding: $modal-padding;
    padding-bottom: calc(#{$modal-padding} + env(safe-area-inset-bottom, 0px));
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    flex-shrink: 0;
  }
}

// ─── Desktop ─────────────────────────────────────────────────────────────────

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
        max-height: 90dvh;
      }

      &--small {
        width: 33.5rem;
        max-width: 90vw;
        max-height: 90vh;
        max-height: 90dvh;
      }

      &--medium {
        width: 39.75rem;
        max-width: 90vw;
        max-height: 90vh;
        max-height: 90dvh;
      }

      &--large {
        width: 44.875rem;
        max-width: 90vw;
        max-height: 90vh;
        max-height: 90dvh;
      }

      &--extra-large {
        width: 62.5rem;
        max-width: 90vw;
        max-height: 90vh;
        max-height: 90dvh;
      }

      &--fullscreen {
        width: 95vw;
        max-width: 95vw;
        height: 95vh;
        height: 95dvh;
        max-height: 95vh;
        max-height: 95dvh;
        border-radius: $modal-border-radius;
      }

      &--custom {
        max-width: 90vw;
        max-height: 90vh;
        max-height: 90dvh;
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

    &__footer {
      padding-bottom: $modal-padding;
    }
  }
}

// ─── Utility modifier classes (applied via headerClass / footerClass) ─────────

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

// ─── Transitions ─────────────────────────────────────────────────────────────

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
