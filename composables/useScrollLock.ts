const lockCount = ref(0);
let savedScrollY = 0;
let savedPaddingRight = "";
let savedOverflow = "";
let savedPosition = "";
let savedTop = "";
let savedWidth = "";

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
    savedScrollY = window.scrollY;
    savedOverflow = body.style.overflow;
    savedPaddingRight = body.style.paddingRight;
    savedPosition = body.style.position;
    savedTop = body.style.top;
    savedWidth = body.style.width;

    const scrollbarWidth = getScrollbarWidth();
    if (scrollbarWidth > 0) {
      const computedPadding =
        parseInt(window.getComputedStyle(body).paddingRight, 10) || 0;
      body.style.paddingRight = `${computedPadding + scrollbarWidth}px`;
    }

    // iOS Safari: position:fixed prevents momentum-scroll bleed-through.
    // Saving scrollY and restoring it on unlock prevents the page from
    // jumping to top when the fixed body is removed.
    body.style.position = "fixed";
    body.style.top = `-${savedScrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
  };

  const unlock = (): void => {
    if (typeof window === "undefined") return;
    if (lockCount.value <= 0) return;
    lockCount.value--;
    if (lockCount.value > 0) return;

    const body = document.body;

    if (savedOverflow === "") body.style.removeProperty("overflow");
    else body.style.overflow = savedOverflow;

    if (savedPaddingRight === "") body.style.removeProperty("padding-right");
    else body.style.paddingRight = savedPaddingRight;

    if (savedPosition === "") body.style.removeProperty("position");
    else body.style.position = savedPosition;

    if (savedTop === "") body.style.removeProperty("top");
    else body.style.top = savedTop;

    if (savedWidth === "") body.style.removeProperty("width");
    else body.style.width = savedWidth;

    // Restore the scroll position that was saved before locking.
    window.scrollTo(0, savedScrollY);

    savedScrollY = 0;
    savedOverflow = "";
    savedPaddingRight = "";
    savedPosition = "";
    savedTop = "";
    savedWidth = "";
  };

  return { lock, unlock, isLocked };
}
