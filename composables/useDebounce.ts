import { getCurrentInstance, onUnmounted, ref, watch, type Ref } from "vue";

/**
 * Hook for debouncing a function
 * @param fn - Function to execute with debounce
 * @param delay - Wait time in milliseconds (default: 300ms)
 * @returns Function with debounce applied
 */
export function useDebounceFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, delay);
  };

  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    });
  }

  return debouncedFn;
}

/**
 * Hook for debouncing a reactive value
 * @param value - Reactive value to watch
 * @param delay - Wait time in milliseconds (default: 300ms)
 * @returns Value with debounce applied
 */
export function useDebounce<T>(value: Ref<T>, delay: number = 300): Ref<T> {
  const debouncedValue = ref<T>(value.value) as Ref<T>;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  watch(
    value,
    (newValue) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        debouncedValue.value = newValue;
        timeoutId = null;
      }, delay);
    },
    { immediate: false }
  );

  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    });
  }

  return debouncedValue;
}

/**
 * Hook for throttling a function
 * @param fn - Function to execute with throttle
 * @param delay - Minimum time between executions in milliseconds (default: 300ms)
 * @returns Function with throttle applied
 */
export function useThrottleFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let lastRun = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const throttledFn = (...args: Parameters<T>) => {
    const now = Date.now();

    if (now - lastRun >= delay) {
      fn(...args);
      lastRun = now;
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(
        () => {
          fn(...args);
          lastRun = Date.now();
          timeoutId = null;
        },
        delay - (now - lastRun)
      );
    }
  };

  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    });
  }

  return throttledFn;
}

/**
 * Hook for throttling a reactive value
 * @param value - Reactive value to watch
 * @param delay - Minimum time between updates in milliseconds (default: 300ms)
 * @returns Value with throttle applied
 */
export function useThrottle<T>(value: Ref<T>, delay: number = 300): Ref<T> {
  const throttledValue = ref<T>(value.value) as Ref<T>;
  let lastRun = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  watch(
    value,
    (newValue) => {
      const now = Date.now();

      if (now - lastRun >= delay) {
        throttledValue.value = newValue;
        lastRun = now;
      } else {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(
          () => {
            throttledValue.value = newValue;
            lastRun = Date.now();
            timeoutId = null;
          },
          delay - (now - lastRun)
        );
      }
    },
    { immediate: false }
  );

  if (getCurrentInstance()) {
    onUnmounted(() => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    });
  }

  return throttledValue;
}

/**
 * Main composable that exports all utilities
 */
export default function useDebounceComposable() {
  return {
    useDebounceFn,
    useDebounce,
    useThrottleFn,
    useThrottle,
  };
}
