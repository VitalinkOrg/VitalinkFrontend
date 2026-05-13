const lockCount = ref(0);
let savedPaddingRight = "";
let savedOverflow = "";

function getScrollbarWidth(): number {
  if (typeof window === "undefined") return 0;
  return window.innerWidth - document.documentElement.clientWidth;
}

export function useScrollLock() {
  const isLocked = computed(() => lockCount.value > 0);

  const lock = (): void => {
    if (typeof window === "undefined") return;
    lockCount.value++;
    if (lockCount.value !== 1) return;

    const body = document.body;
    savedOverflow = body.style.overflow;
    savedPaddingRight = body.style.paddingRight;

    const scrollbarWidth = getScrollbarWidth();
    if (scrollbarWidth > 0) {
      const computedPadding =
        parseInt(window.getComputedStyle(body).paddingRight, 10) || 0;
      body.style.paddingRight = `${computedPadding + scrollbarWidth}px`;
    }
    body.style.overflow = "hidden";
  };

  const unlock = (): void => {
    if (typeof window === "undefined") return;
    if (lockCount.value <= 0) return;
    lockCount.value--;
    if (lockCount.value > 0) return;

    const body = document.body;
    if (savedOverflow === "") {
      body.style.removeProperty("overflow");
    } else {
      body.style.overflow = savedOverflow;
    }
    if (savedPaddingRight === "") {
      body.style.removeProperty("padding-right");
    } else {
      body.style.paddingRight = savedPaddingRight;
    }
    savedOverflow = "";
    savedPaddingRight = "";
  };

  return { lock, unlock, isLocked };
}
