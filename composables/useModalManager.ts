import type { Credit } from "@/types";
import { reactive, readonly, ref, type Ref } from "vue";

const modalNames = [
  "approval",
  "confirmation",
  "details",
  "rejection",
  "success",
] as const;

export type ModalName = (typeof modalNames)[number];

export interface ModalManager {
  isOpen: Readonly<Record<ModalName, boolean>>;
  sharedData: Readonly<Ref<Record<string, any>>>;
  credit: Ref<Credit | undefined>;
  refreshCredits: Ref<(() => Promise<void>) | null>;
  openModal: (name: ModalName, data?: any) => void;
  closeModal: (name: ModalName) => void;
  closeAllModals: () => void;
  getSharedData: <T = any>(key: string) => T;
  setSharedData: (key: string, value: any) => void;
  clearSharedData: () => void;
  setCredit: (credits: Credit) => void;
  setRefreshCredits: (fn: (() => Promise<void>) | null) => void;
}

const modalState = reactive<Record<ModalName, boolean>>(
  modalNames.reduce(
    (acc, name) => {
      acc[name] = false;
      return acc;
    },
    {} as Record<ModalName, boolean>
  )
);

const sharedData = ref<Record<string, any>>({});
const credit = ref<Credit>();
const refreshCredits = ref<(() => Promise<void>) | null>(null);

export function useModalManager(): ModalManager {
  const openModal = (name: ModalName, data?: any): void => {
    modalState[name] = true;

    if (data !== undefined) {
      sharedData.value[name] = data;
    }
  };

  const closeModal = (name: ModalName): void => {
    modalState[name] = false;
  };

  const closeAllModals = (): void => {
    modalNames.forEach((name) => {
      modalState[name] = false;
    });
  };

  const getSharedData = <T = any>(key: string): T => {
    return sharedData.value[key] as T;
  };

  const setSharedData = (key: string, value: any): void => {
    sharedData.value[key] = value;
  };

  const clearSharedData = (): void => {
    sharedData.value = {};
  };

  const setCredit = (newCredit: Credit): void => {
    credit.value = newCredit;
  };

  const setRefreshCredits = (fn: (() => Promise<void>) | null): void => {
    refreshCredits.value = fn;
  };

  return {
    isOpen: readonly(modalState),
    sharedData: readonly(sharedData),
    credit,
    refreshCredits,
    openModal,
    closeModal,
    closeAllModals,
    getSharedData,
    setSharedData,
    clearSharedData,
    setCredit,
    setRefreshCredits,
  };
}
