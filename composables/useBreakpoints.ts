const BREAKPOINTS = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1400,
} as const;

type BreakpointKey = keyof typeof BREAKPOINTS;

function createMediaQuery(minWidth: number): MediaQueryList | null {
  if (!process.client) return null;
  return window.matchMedia(`(min-width: ${minWidth}px)`);
}

function useMediaQuery(minWidth: number) {
  const matches = ref(false);

  if (process.client) {
    const mq = window.matchMedia(`(min-width: ${minWidth}px)`);
    matches.value = mq.matches;

    const handler = (e: MediaQueryListEvent) => {
      matches.value = e.matches;
    };

    onMounted(() => {
      mq.addEventListener("change", handler);
    });

    onUnmounted(() => {
      mq.removeEventListener("change", handler);
    });
  }

  return matches;
}

export function useBreakpoints() {
  const isSm = useMediaQuery(BREAKPOINTS.sm);
  const isMd = useMediaQuery(BREAKPOINTS.md);
  const isLg = useMediaQuery(BREAKPOINTS.lg);
  const isXl = useMediaQuery(BREAKPOINTS.xl);
  const isXxl = useMediaQuery(BREAKPOINTS.xxl);

  const isMobile = computed(() => !isSm.value);
  const isTablet = computed(() => isSm.value && !isLg.value);
  const isDesktop = computed(() => isLg.value);

  function isAbove(breakpoint: BreakpointKey): Ref<boolean> {
    return useMediaQuery(BREAKPOINTS[breakpoint]);
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    isSm,
    isMd,
    isLg,
    isXl,
    isXxl,
    isAbove,
  };
}
