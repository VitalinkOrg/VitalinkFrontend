import type { Appointment } from "@/types";
import { reactive, readonly, ref, type Ref } from "vue";

const modalNames = [
  "anularCita",
  "cambiosGuardados",
  "confirmacionNoApto",
  "confirmacionReprogramacion",
  "confirmacionReserva",
  "confirmValoration",
  "confirmarEliminacion",
  "detallesCita",
  "detallesValoracion",
  "editorFechaHora",
  "exitoConfirmacion",
  "subirProforma",
  "confirmarCodigo",
  "advertenciaPago",
] as const;

export type ModalName = (typeof modalNames)[number];

export interface ModalManager {
  isOpen: Readonly<Record<ModalName, boolean>>;
  sharedData: Readonly<Ref<Record<string, any>>>;
  appointment: Ref<Appointment | undefined>;
  refreshAppointments: Ref<(() => Promise<void>) | null>;
  openModal: (name: ModalName, data?: any) => void;
  closeModal: (name: ModalName) => void;
  closeAllModals: () => void;
  getSharedData: <T = any>(key: string) => T;
  setSharedData: (key: string, value: any) => void;
  clearSharedData: () => void;
  setAppointment: (appointment: Appointment) => void;
  setRefreshAppointments: (fn: (() => Promise<void>) | null) => void;
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
const appointment = ref<Appointment>();
const refreshAppointments = ref<(() => Promise<void>) | null>(null);

export function useMedicalModalManager(): ModalManager {
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

  const setAppointment = (newAppointment: Appointment): void => {
    appointment.value = newAppointment;
  };

  const setRefreshAppointments = (fn: (() => Promise<void>) | null): void => {
    refreshAppointments.value = fn;
  };

  return {
    isOpen: readonly(modalState),
    sharedData: readonly(sharedData),
    appointment,
    refreshAppointments,
    openModal,
    closeModal,
    closeAllModals,
    getSharedData,
    setSharedData,
    clearSharedData,
    setAppointment,
    setRefreshAppointments,
  };
}
