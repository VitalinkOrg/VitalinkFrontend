export function useModalController<T extends IAppointment>(
  items: Readonly<Ref<T[]>> | ComputedRef<T[]>,
) {
  const activeModal = ref<ModalName | null>(null);
  const activeItemId = ref<number | null>(null);

  const activeItem = computed<T | undefined>(() => {
    if (activeItemId.value === null) return undefined;
    return unref(items).find((item) => item.id === activeItemId.value);
  });

  function open(modalName: ModalName, itemId?: number): void {
    activeModal.value = modalName;
    if (itemId !== undefined) {
      activeItemId.value = itemId;
    }
  }

  function close(): void {
    activeModal.value = null;
    activeItemId.value = null;
  }

  function isActive(modalName: ModalName): boolean {
    return activeModal.value === modalName && activeItem.value !== undefined;
  }

  return {
    activeModal: readonly(activeModal),
    activeItem,
    open,
    close,
    isActive,
  };
}

export function useDropdownController() {
  const openId = ref<number | null>(null);

  function toggle(id: number): void {
    openId.value = openId.value === id ? null : id;
  }

  function close(): void {
    openId.value = null;
  }

  function isOpen(id: number): boolean {
    return openId.value === id;
  }

  function handleClickOutside(event: MouseEvent, selector: string): void {
    if (openId.value === null) return;
    const target = event.target as HTMLElement;
    if (!target.closest(selector)) close();
  }

  function handleEscapeKey(event: KeyboardEvent): void {
    if (event.key === "Escape") close();
  }

  return {
    openId: readonly(openId),
    toggle,
    close,
    isOpen,
    handleClickOutside,
    handleEscapeKey,
  };
}
