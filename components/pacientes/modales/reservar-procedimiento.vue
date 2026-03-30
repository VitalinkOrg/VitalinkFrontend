<template>
  <AtomsModalBase
    :is-open="isModalOpen"
    size="medium"
    @close="handleCloseModal('scheduleProcedure')"
    header-class="header-border-bottom"
    footer-class="footer-border-top"
  >
    <template #title>
      <h2 class="schedule-procedure-modal__title">
        Reservar Procedimiento Médico
      </h2>
    </template>
    <div class="schedule-procedure-modal__content">
      <MedicosTablaDetallesCita :rows="tableRows" />
    </div>
    <template #footer>
      <div class="schedule-procedure-modal__footer">
        <button
          class="schedule-procedure-modal__button--outline"
          :disabled="isLoading"
          @click="handleCloseModal('scheduleProcedure')"
        >
          Cancelar
        </button>
        <button
          class="schedule-procedure-modal__button--primary"
          @click="handleConfirmReservation"
          :disabled="isLoading"
        >
          <span v-if="!isLoading">Confirmar reserva</span>
          <span v-else class="schedule-procedure-modal__loading">
            <span class="schedule-procedure-modal__spinner"></span>
            Confirmando...
          </span>
        </button>
      </div>
    </template>
  </AtomsModalBase>
</template>

<script lang="ts" setup>
import type { TablaBaseRow } from "@/components/medicos/tabla-detalles-cita.vue";
import { useFormat } from "@/composables/useFormat";

const { formatCurrency } = useFormat();

const refreshAppointments = inject<() => Promise<void>>("refreshAppointments");

const token = useCookie("token");
const config = useRuntimeConfig();

interface Props {
  appointment: IAppointment;
  isOpen: boolean;
}

interface Emits {
  (e: "open-modal", modalName: ModalName): void;
  (e: "close-modal", modalName: ModalName): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const calculateBalance = () => {
  return (
    Number(props.appointment.price_procedure) -
    Number(props.appointment.appointment_credit?.approved_amount || 0)
  );
};

const selectedDate = ref("");
const selectedTime = ref("");
const isLoading = ref(false);
const availableDates = ref([
  new Date(Date.now() + 86400000).toISOString().split("T")[0],
  new Date(Date.now() + 172800000).toISOString().split("T")[0],
  new Date(Date.now() + 259200000).toISOString().split("T")[0],
]);
const availableTimes = ref([
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:30",
  "16:00",
]);

const isModalOpen = computed({
  get: () => props.isOpen,
  set: (value: boolean) => {
    if (!value) {
      handleCloseModal("scheduleProcedure");
    }
  },
});

const handleOpenModal = (modalName: ModalName) => {
  emit("open-modal", modalName);
};

const handleCloseModal = (modalName: ModalName): void => {
  emit("close-modal", modalName);
};

const isCreditDisabled = computed(() => {
  if (!props.appointment.appointment_credit) return false;
  if (props.appointment.appointment_credit.credit_status?.code === "REJECTED")
    return false;
  return true;
});

const canShowCreditStatus = computed(() => {
  if (!props.appointment.appointment_credit) return false;
  if (
    props.appointment.appointment_status.code ===
      "VALUED_VALORATION_APPOINTMENT" &&
    props.appointment.appointment_credit?.credit_status_code !== "REQUIRED"
  )
    return true;
});

const tableRows = computed((): TablaBaseRow[] => {
  const rows: TablaBaseRow[] = [
    {
      key: "patient",
      header: "Paciente titular:",
      value: props.appointment.customer.name,
    },
    {
      key: "doctor",
      header: "Doctor:",
      value: props.appointment.supplier.name,
    },
  ];

  if (canShowCreditStatus.value) {
    rows.push({
      key: "credit-eligible",
      header: "Apto para crédito:",
      value: isCreditDisabled.value ? "Sí" : "No",
    });
  }

  rows.push({
    key: "service-cost",
    header: "Costo del servicio:",
    value: formatCurrency(props.appointment.price_procedure, {
      decimalPlaces: 0,
    }),
    isEndRow: !props.appointment.appointment_credit,
  });

  if (props.appointment.appointment_credit) {
    rows.push(
      {
        key: "approved-credit",
        header: "Crédito aprobado:",
        value: formatCurrency(
          props.appointment.appointment_credit?.approved_amount || 0,
          {
            decimalPlaces: 0,
          },
        ),
      },
      {
        key: "pending-balance",
        header: "Saldo pendiente:",
        value: formatCurrency(calculateBalance(), { decimalPlaces: 0 }),
        isEndRow: true,
      },
    );
  }

  return rows;
});

const formatDisplayDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const selectDate = (date: string) => {
  selectedDate.value = date;
  availableTimes.value = ["09:00", "10:00", "11:00", "14:00", "15:30", "16:00"];
  selectedTime.value = "";

  nextTick(() => {
    const dropdownElement = document.getElementById("dateDropdown");
    if (dropdownElement) {
      const dropdownInstance = (window as any).bootstrap?.Dropdown.getInstance(
        dropdownElement,
      );
      if (dropdownInstance) {
        dropdownInstance.hide();
      } else {
        dropdownElement.blur();
        document.body.click();
      }
    }
  });
};

const selectTime = (time: string) => {
  selectedTime.value = time;

  nextTick(() => {
    const dropdownElement = document.getElementById("timeDropdown");
    if (dropdownElement) {
      const dropdownInstance = (window as any).bootstrap?.Dropdown.getInstance(
        dropdownElement,
      );
      if (dropdownInstance) {
        dropdownInstance.hide();
      } else {
        dropdownElement.blur();
        document.body.click();
      }
    }
  });
};

const handleConfirmReservation = async () => {
  isLoading.value = true;

  try {
    const { data, error } = await useFetch(
      config.public.API_BASE_URL + "/appointment/reserve_procedure",
      {
        method: "PUT",
        headers: {
          Authorization: token.value ?? "",
          "Content-Type": "application/json",
        },
        params: {
          id: props.appointment.id,
        },
        body: {
          proposed_date: null,
          proposed_time: null,
        },
      },
    );

    if (error.value) {
      throw new Error(
        error.value.data?.message || "Error al reservar el procedimiento",
      );
    }

    if (data.value) {
      await refreshAppointments?.();
      handleCloseModal("scheduleProcedure");
      handleCloseModal("appointmentDetails");
      handleOpenModal("scheduleProcedureSuccess");
    }
  } catch (error) {
    console.error("Error al confirmar reserva:", error);
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.isOpen,
  (newValue) => {
    if (newValue) {
      selectedDate.value = "";
      selectedTime.value = "";
    }
  },
);
</script>

<style lang="scss" scoped>
.schedule-procedure-modal {
  &__content {
    padding: 1.5rem;
  }

  &__title {
    @include label-base;
    font-weight: 600;
    font-size: 1.125rem;
    line-height: 1.75rem;
    color: $color-foreground;
  }

  &__dropdown {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  &__dropdown-button {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.75rem 1rem;
    background-color: $white;
    border: 0.0625rem solid #d1d5db;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 400;
    color: $color-foreground;
    cursor: pointer;
    transition: all 0.2s ease;
    gap: 0.5rem;

    &:hover:not(:disabled) {
      border-color: #9ca3af;
      box-shadow: 0 0.0625rem 0.1875rem rgba(0, 0, 0, 0.1);
    }

    &:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 0.1875rem rgba(59, 130, 246, 0.1);
    }

    &:disabled {
      background-color: #f9fafb;
      color: #9ca3af;
      cursor: not-allowed;
      border-color: #e5e7eb;
    }

    span {
      flex: 1;
      text-align: left;
    }

    &::after {
      content: "";
      display: none;
    }
  }

  &__dropdown-arrow {
    width: 1rem;
    height: 1rem;
    color: #6b7280;
    transition: transform 0.2s ease;
    flex-shrink: 0;

    .dropdown.show & {
      transform: rotate(180deg);
    }
  }

  &__dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 1000;
    margin-top: 0.25rem;
    background-color: $white;
    border: 0.0625rem solid #e5e7eb;
    border-radius: 0.5rem;
    box-shadow:
      0 0.625rem 0.9375rem -0.1875rem rgba(0, 0, 0, 0.1),
      0 0.25rem 0.375rem -0.125rem rgba(0, 0, 0, 0.05);
    max-height: 12.5rem;
    overflow-y: auto;

    min-width: auto;
    padding: 0.25rem 0;
    margin: 0;
    font-size: 0.875rem;
    text-align: left;
    list-style: none;
    background-clip: padding-box;

    li {
      margin: 0;
      padding: 0;
    }
  }

  &__dropdown-item {
    display: block;
    width: 100%;
    padding: 0.5rem 1rem;
    clear: both;
    font-weight: 400;
    color: $color-foreground;
    text-decoration: none;
    white-space: nowrap;
    background-color: transparent;
    border: 0;
    transition: all 0.15s ease;

    &:hover,
    &:focus {
      color: #1f2937;
      background-color: #f3f4f6;
      text-decoration: none;
    }

    &:active {
      background-color: #e5e7eb;
    }
  }

  &__footer {
    width: 100%;
    display: flex;
    gap: 0.75rem;
  }

  &__button {
    &--primary {
      @include primary-button;
      width: 100%;
      padding: 0.75rem;
    }

    &--outline {
      @include outline-button;
      width: 100%;
      padding: 0.75rem;
    }
  }

  &__loading {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  &__spinner {
    width: 0.875rem;
    height: 0.875rem;
    border: 0.125rem solid rgba(255, 255, 255, 0.3);
    border-top: 0.125rem solid $white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
