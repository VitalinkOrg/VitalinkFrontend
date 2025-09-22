export const useModalManager = () => {
  const openModalsCount = useState("openModalsCount", () => 0);
  const closeAllTrigger = useState("closeAllTrigger", () => 0);
  const activeModals = useState<Set<string>>("activeModals", () => new Set());

  const closeAllModals = () => {
    closeAllTrigger.value++;
  };

  const hasMultipleModals = computed(() => openModalsCount.value > 1);

  const getOpenModalsCount = computed(() => openModalsCount.value);

  const forceCloseAllModals = () => {
    openModalsCount.value = 0;
    activeModals.value.clear();
    document.body.style.overflow = "";
    closeAllTrigger.value++;
  };

  return {
    openModalsCount: readonly(openModalsCount),
    hasMultipleModals,
    getOpenModalsCount,
    closeAllModals,
    forceCloseAllModals,
  };
};
