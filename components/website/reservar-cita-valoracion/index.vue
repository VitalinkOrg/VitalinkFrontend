<template>
  <button
    v-if="currentStep === 1"
    class="schedule-appointment-modal__trigger--outline"
    @click="openModal"
  >
    Cita de valoración
  </button>

  <button
    v-else
    class="schedule-appointment-modal__trigger--primary"
    @click="openModal"
  >
    Reservar Cita de valoración
  </button>

  <AtomsModalBase
    :isOpen="isOpen"
    @close="closeModal"
    size="large"
    title="Solicitar cita de valoración"
    header-class="header-border-bottom"
    footerClass="footer-border-top"
    modalClass="height-full"
    ref="modalRef"
  >
    <template #title>
      <h1 class="schedule-appointment-modal__title">
        Solicitar cita de valoración
      </h1>
    </template>

    <main class="schedule-appointment-modal__content">
      <WebsiteStepper
        v-if="internalCurrentStep !== 0 && internalCurrentStep !== 4"
        :steps="steps"
        :currentStep="internalCurrentStep"
      />
      <WebsiteReservarCitaValoracionSeleccionarFechaHora
        v-if="internalCurrentStep === 1"
        :selected-day="localSelectedDay"
        :selected-hour="localSelectedHour"
        :supplier-id="props.supplierId"
        @set-selected-day="setSelectedDate"
        @set-selected-hour="setSelectedHour"
      />

      <WebsiteReservarCitaValoracionFormularioReserva
        v-if="internalCurrentStep === 2"
        :phone-number="phoneNumber"
        :alternative-phone-number="alternativePhoneNumber"
        @set-alternative-phone-number="setAlternativePhoneNumber"
        @is-for-external-user="setIsForExternalUser"
        @set-user-description="setUserDescription"
      />

      <WebsiteReservarCitaValoracionConfirmacionReserva
        v-if="internalCurrentStep === 3"
        :selected-day="localSelectedDay ?? selectedDay"
        :selected-hour="localSelectedHour ?? selectedHour"
        :supplier-id="supplierId"
        :customer-id="customerId ?? 0"
        :customer-name="customerName ?? ''"
        :customer-phone="alternativePhoneNumber ?? phoneNumber"
        :user-description="userDescription"
        :selected-procedure-id="selectedProcedureId"
        :selected-package="selectedPackage"
        :services="services"
      />
    </main>

    <template #footer>
      <footer class="schedule-appointment-modal__footer">
        <button
          class="schedule-appointment-modal__button schedule-appointment-modal__button--outline"
          @click="prevStep"
          :disabled="internalCurrentStep === 1 || isLoading"
          type="button"
          aria-label="Volver al paso anterior"
        >
          Volver
        </button>
        <button
          class="schedule-appointment-modal__button schedule-appointment-modal__button--primary"
          @click="nextStep"
          type="button"
          aria-label="Continuar al siguiente paso"
          :disabled="
            isLoading ||
            (internalCurrentStep === 1 &&
              (!localSelectedDay || !localSelectedHour))
          "
        >
          <span
            v-if="isLoading"
            class="schedule-appointment-modal__spinner"
          ></span>
          {{ isLoading ? "Procesando..." : "Continuar" }}
        </button>
      </footer>
    </template>
  </AtomsModalBase>

  <WebsiteReservarCitaValoracionReservaExitosa
    :is-open="isOpenSuccessModal"
    :selected-day="localSelectedDay ?? selectedDay"
    :selected-hour="localSelectedHour ?? selectedHour"
    :supplier-id="supplierId"
    :supplier-name="supplierName"
    :customer-name="customerName ?? ''"
    :customer-phone="alternativePhoneNumber ?? phoneNumber"
    :selected-procedure-id="selectedProcedureId"
    :services="services"
    @close-modal="closeSuccessModal"
  />

  <WebsiteReservarCancelModal
    :is-open="isOpenCancelModal"
    @close-modal="closeCancelModal"
    @confirm-close-modal="confirmCloseModal"
  />
</template>

<script lang="ts" setup>
import type { ApiResponse, Package, Service } from "~/types";

import { useErrorHandler } from "~/composables/useErrorHandler";

const { withErrorHandling } = useErrorHandler();

const config = useRuntimeConfig();
const token = useCookie("token");

interface Props {
  selectedDay: string | null;
  selectedHour: string | null;
  currentStep: number;
  supplierId: number;
  supplierName: string;
  customerId: number;
  customerName: string;
  customerPhone: string;
  serviceCost?: number;
  selectedProcedureId?: number;
  selectedPackage?: Package;
  services?: Service[];
}

const props = defineProps<Props>();

const isOpen = ref<boolean>(false);
const isOpenCancelModal = ref<boolean>(false);
const isOpenSuccessModal = ref<boolean>(false);

const isLoading = ref<boolean>(false);

const phoneNumber = ref<string>(props.customerPhone || "");
const alternativePhoneNumber = ref<string | null>(null);
const isForExternalUser = ref<"me" | "someoneElse">("me");
const userDescription = ref<string>("");

const internalCurrentStep = ref<number>(props.currentStep);
const steps = ["1", "2", "3"];
const localSelectedDay = ref<string | null>(props.selectedDay || null);
const localSelectedHour = ref<string | null>(props.selectedHour || null);

const modalRef = ref();

const openModal = (): void => {
  isOpen.value = true;
};

const confirmCloseModal = (): void => {
  isOpen.value = false;
  isOpenCancelModal.value = false;
};

const openSuccessModal = () => {
  isOpenSuccessModal.value = true;
  isOpen.value = false;
};

const closeSuccessModal = () => {
  closeModal();
  isOpenSuccessModal.value = false;
  internalCurrentStep.value = 1;
};

const closeCancelModal = (): void => {
  isOpenCancelModal.value = false;
};

const closeModal = (): void => {
  if (isOpenSuccessModal.value === false) {
    isOpenCancelModal.value = true;
  }
};

const setIsForExternalUser = (user: "me" | "someoneElse") => {
  isForExternalUser.value = user;
};

const setUserDescription = (description: string) => {
  userDescription.value = description;
};

const nextStep = (): void => {
  if (internalCurrentStep.value === 2) {
    handleConfirmReservation();
    return;
  }

  if (internalCurrentStep.value < 4) {
    internalCurrentStep.value++;
  }
};

const prevStep = (): void => {
  if (internalCurrentStep.value > 1) {
    internalCurrentStep.value--;
  }
};

const setSelectedDate = (date: string): void => {
  localSelectedDay.value = date;
};

const setSelectedHour = (hour: string): void => {
  localSelectedHour.value = hour;
};

const setAlternativePhoneNumber = (phone: string): void => {
  alternativePhoneNumber.value = phone;
};

const handleConfirmReservation = async () => {
  const payload = {
    customer_id: props.customerId,
    appointment_date: localSelectedDay.value ?? props.selectedDay,
    appointment_hour: localSelectedHour.value ?? props.selectedHour,
    supplier_id: props.supplierId,
    package_id: props.selectedPackage?.id,
    user_description: userDescription.value,
    is_for_external_user: isForExternalUser.value === "someoneElse",
    phone_number_external_user:
      alternativePhoneNumber.value ?? phoneNumber.value,
    procedure_id: props.selectedProcedureId,
  };

  const { error } = await withErrorHandling(
    $fetch<ApiResponse>(config.public.API_BASE_URL + "/appointment/add", {
      method: "POST",
      body: payload,
      headers: {
        Authorization: token.value ?? "",
        "Content-Type": "application/json",
      },
    }),
    isLoading,
    {
      customMessage: "Error al confirmar la reservación",
    }
  );

  if (!error) {
    openSuccessModal();
  }
};
</script>

<style lang="scss" scoped>
.schedule-appointment-modal {
  &__trigger {
    &--primary {
      @include primary-button;
    }
    &--outline {
      @include outline-button;
      width: 100%;
      text-wrap: nowrap;
    }
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 20px;
    line-height: 28px;
    color: #19213d;
    margin: 0;
  }

  &__content {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 20px 24px;
  }

  &__step-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__step-description {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__step-text {
    @include label-base;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    color: #19213d;
    margin: 0;
  }

  &__step-subtext {
    @include label-base;
    font-weight: 400;
    font-size: 14px;
    line-height: 20px;
    color: #6d758f;
    margin: 0;
  }

  &__date-selection {
    width: 100%;
    background: #f8faff;
    border-radius: 15px;
    gap: 20px;
    padding: 15px 10px;
    box-shadow: 0px 1px 4px 0px #19213d14;
  }

  &__date-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }

  &__date-title {
    @include label-base;
    font-weight: 600;
    font-size: 16px;
    line-height: 21px;
    color: #19213d;
    margin: 0;
  }

  &__calendar-container {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background-color: #e2e4fa;
    border-radius: 20px;
  }

  &__calendar-icon {
    width: 20px;
    height: 20px;
    color: #3541b4;
  }

  &__dropdown-button {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    color: #3541b4 !important;
    padding: 0 !important;
    font-size: 14px;
    font-weight: 500;

    &:hover,
    &:focus,
    &:active {
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
      color: #3541b4 !important;
    }

    &::after {
      display: none;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  &__error {
    background: #fee2e2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    padding: 12px;
    margin-top: 8px;
    color: #dc2626;

    p {
      margin: 0 0 8px 0;
      font-size: 14px;
    }
  }

  &__retry-button {
    background: #dc2626;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background: #b91c1c;
    }
  }

  &__loading {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-radius: 8px;
    padding: 12px;
    margin-top: 8px;
    color: #0369a1;
    text-align: center;

    p {
      margin: 0;
      font-size: 14px;
      font-style: italic;
    }
  }

  &__days-container {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding-bottom: 8px;
    margin-top: 8px;

    &::-webkit-scrollbar {
      height: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }
  }

  &__day-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 60px;
    padding: 8px 12px;
    border: 1px solid #17a2b8;
    border-radius: 8px;
    background: transparent;
    color: #17a2b8;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    flex-shrink: 0;

    &:hover {
      background-color: rgba(23, 162, 184, 0.1);
    }

    &--active {
      background-color: #17a2b8;
      color: white;
      border-color: #17a2b8;

      .schedule-appointment-modal__day-text,
      .schedule-appointment-modal__day-number {
        color: white;
      }
    }
  }

  &__day-text {
    font-size: 12px;
    color: #17a2b8;
    margin-bottom: 2px;
  }

  &__day-number {
    font-weight: 600;
    font-size: 14px;
    color: #17a2b8;
  }

  &__time-section {
    margin-top: 24px;
  }

  &__time-title {
    @include label-base;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    color: #19213d;
    margin: 0 0 16px 0;
  }

  &__time-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  &__time-button {
    padding: 8px 16px;
    border: 1px solid #17a2b8;
    border-radius: 6px;
    background: transparent;
    color: #17a2b8;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s ease-in-out;
    position: relative;

    &:hover {
      background-color: rgba(23, 162, 184, 0.1);
      transform: translateY(-1px);
    }

    &--active {
      background-color: #17a2b8;
      color: white;
      border-color: #17a2b8;
    }
  }

  &__time-placeholder {
    color: #6c757d;
    margin-top: 24px;
    padding: 16px;
    text-align: center;
    background: #f8f9fa;
    border-radius: 8px;
    font-style: italic;
  }

  &__footer {
    display: flex;
    width: 100%;
    gap: 12px;
  }

  &__button {
    @include button-base;
    flex: 1;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &--outline {
      @include outline-button;
    }

    &--primary {
      @include primary-button;
    }
  }

  &__spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

.dropdown {
  position: relative;
}

:deep(.dropdown-menu) {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  display: none;
  min-width: 10rem;
  padding: 0.5rem 0;
  margin: 0;
  background-color: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  max-height: 200px;
  overflow-y: auto;

  &.show {
    display: block;
  }

  .dropdown-item {
    display: block;
    width: 100%;
    padding: 8px 16px;
    clear: both;
    font-weight: 400;
    color: #374151;
    text-align: inherit;
    text-decoration: none;
    white-space: nowrap;
    background-color: transparent;
    border: 0;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover,
    &:focus {
      background-color: #f3f4f6;
      color: #111827;
    }

    &.active {
      background-color: #0d6efd;
      color: white;
    }
  }
}
</style>
