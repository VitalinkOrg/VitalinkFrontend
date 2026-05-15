const lockCount = ref(0);
let savedScrollY = 0;
let savedOverflow = "";
let savedPosition = "";
let savedTop = "";
let savedWidth = "";

// Detects iPhone/iPad via UA or the navigator.standalone hint (iOS 13+ iPads
// report a desktop UA but expose standalone). Using position:fixed on iOS
// prevents momentum-scroll bleed-through; on Android it causes a visible
// double-paint layout jump, so we use overflow:hidden there instead.
function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
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
    savedPosition = body.style.position;
    savedTop = body.style.top;
    savedWidth = body.style.width;

    if (isIOS()) {
      // position:fixed prevents momentum-scroll bleed-through on iOS Safari.
      // We save scrollY and restore it on unlock so the page doesn't jump to top.
      // overflow:hidden is intentionally NOT set here: on iOS Safari, combining
      // position:fixed + overflow:hidden on <body> triggers a compositing-layer
      // clip bug that makes the underlying page content invisible. position:fixed
      // alone is sufficient to prevent scrolling on iOS.
      body.style.position = "fixed";
      body.style.top = `-${savedScrollY}px`;
      body.style.width = "100%";
    } else {
      // scrollbar-gutter: stable (set globally on body) keeps the gutter space
      // reserved even when overflow is hidden, so no padding compensation needed.
      body.style.overflow = "hidden";
    }
  };

  const unlock = (): void => {
    if (typeof window === "undefined") return;
    if (lockCount.value <= 0) return;
    lockCount.value--;
    if (lockCount.value > 0) return;

    const body = document.body;

    if (isIOS()) {
      if (savedPosition === "") body.style.removeProperty("position");
      else body.style.position = savedPosition;

      if (savedTop === "") body.style.removeProperty("top");
      else body.style.top = savedTop;

      if (savedWidth === "") body.style.removeProperty("width");
      else body.style.width = savedWidth;

      // Restore the scroll position saved before locking.
      window.scrollTo(0, savedScrollY);
    } else {
      if (savedOverflow === "") body.style.removeProperty("overflow");
      else body.style.overflow = savedOverflow;
    }

    savedScrollY = 0;
    savedOverflow = "";
    savedPosition = "";
    savedTop = "";
    savedWidth = "";
  };

  return { lock, unlock, isLocked };
}
