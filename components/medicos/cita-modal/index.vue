<!-- components/medicos/cita-modal/index.vue -->
<template>
  <Teleport to="body">
    <div
      class="modal"
      :id="appointment?.id"
      :class="{ 'modal--show': open }"
      @click.self="emit('close-modal')"
      @keydown.esc="emit('close-modal')"
      tabindex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
      v-if="appointment"
    >
      <div class="modal__dialog">
        <!-- Step 1: Appointment Details -->
        <MedicosCitaModalDetallesCita
          v-if="localStep === 1"
          :appointment="appointment"
          :proforma-file-name="proformaFileName"
          :proforma-guardado="proformaGuardado"
          :description="description"
          :qr-code-input="qrCodeInput"
          :qr-validated="qrValidated"
          :credit-amount="creditAmount"
          :credit-used="creditUsed"
          :error-text="errorText"
          :close-modal="closeModal"
          :file-removed="fileRemoved"
          :existing-proforma-removed="existingProformaRemoved"
          @update:qr-code-input="qrCodeInput = $event"
          @not-suitable-procedure="handleNotSuitableProcedure"
          @edit-date-time="localStep = 6"
          @confirm-reservation="localStep = 2"
          @cancel-appointment="localStep = 4"
          @reschedule="localStep = 6"
          @mark-completed="localStep = 2"
          @edit-recommendations="editRecommendations"
          @save-recommendations="saveRecommendations"
          @handle-proforma-upload="handleProformaUpload"
          @validate-qr-code="validateQRCode"
          @use-credit="useCredit"
          @remove-proforma="handleRemoveProforma"
          @remove-existing-proforma="handleRemoveExistingProforma"
        />

        <!-- Step 2: Payment Details -->
        <MedicosCitaModalConfirmacionReserva
          v-if="localStep === 2"
          :appointment="appointment"
          :close-modal="closeModal"
          :is-loading="isLoading"
          @cancel="localStep = 1"
          @confirm-appointment="confirmAppointment"
          @confirm-procedure="confirmProcedure"
          @finish-procedure="finishProcedure"
          @confirm-valoration="confirmValoration"
        />

        <!-- Step 3: Confirmation -->
        <MedicosCitaModalExitoConfirmacion
          v-if="localStep === 3"
          :appointment="appointment"
          :is-loading="isLoading"
          @go-to-start="localStep = 1"
          @view-appointments="open = false"
          :close-modal="closeModal"
          @upload-proforma="handleUploadProforma"
          @not-suitable-procedure="handleNotSuitableProcedure"
        />

        <!-- Step 4: Cancellation Confirmation -->
        <MedicosCitaModalConfirmacionCancelacion
          v-if="localStep === 4"
          :is-loading="isLoading"
          @go-back="localStep = 1"
          @cancel-appointment="cancelAppointment"
        />

        <!-- Step 5: Appointment Details 
        <MedicosCitaModalDetallesAlternativos
          v-if="localStep === 5"
          :appointment="appointment"
          :proforma-file-name="proformaFileName"
          :proforma-guardado="proformaGuardado"
          :description="description"
          :close-modal="closeModal"
          @handle-proforma-upload="handleProformaUpload"
        />
        -->

        <!-- Step 6: Date and Time Editor -->
        <MedicosCitaModalEditorFechaHora
          v-if="localStep === 6"
          :appointment="appointment"
          :selected-date="selectedDate"
          :selected-time="selectedTime"
          :available-times="availableTimes"
          :attrs="attrs"
          @update:selected-date="selectedDate = $event"
          @update:selected-time="selectedTime = $event"
          @cancel="localStep = 1"
          @save-changes="handleSaveChanges"
        />

        <!-- Step 7: Valoración Details  -->
        <MedicosCitaModalDetallesValoracion
          v-if="localStep === 7"
          :appointment="appointment"
          :proforma-file-name="proformaFileName"
          :proforma-guardado="proformaGuardado"
          :description="recommendationPostAppointment"
          :close-modal="closeModal"
          :procedure-price="procedurePrice"
          @go-back="localStep = 1"
          @handle-proforma-upload="handleProformaUpload"
          @save-valoration="handleSaveValoration"
          @update:description="recommendationPostAppointment = $event"
          @update:procedure-price="updateProcedurePrice"
          @remove-proforma="handleRemoveProforma"
        />

        <!-- Step 8: Confirmación de guardado -->
        <MedicosCitaModalConfirmacionGuardado
          v-if="localStep === 8"
          :close-modal="closeModal"
          :is-loading="isLoading"
          @confirm-save="confirmSaveValoration"
          @cancel-save="localStep = 7"
        />

        <!-- Step 9: Confirmación "No apto para procedimiento" -->
        <MedicosCitaModalConfirmacionNoApto
          v-if="localStep === 9"
          :close-modal="closeModal"
          @confirm-not-suitable="confirmNotSuitable"
          @cancel="localStep = 3"
        />

        <div class="modal__footer modal__footer--center" v-if="errorText">
          <p class="modal__error-text">{{ errorText }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, toRef, watch } from "vue";

const config = useRuntimeConfig();
const token = useCookie("token");

const selectedDate = ref("");
const selectedTime = ref("");
const proformaFileName = ref("");
const proformaGuardado = ref(false);
const qrCodeInput = ref("");
const qrValidated = ref(false);
const creditAmount = ref(0);
const creditUsed = ref(false);
const creditId = ref(null);
const errorText = ref("");
const recommendationPostAppointment = ref("");
const existingProformaRemoved = ref(false);
const fileRemoved = ref(false);
const procedurePrice = ref("");
const isLoading = ref(false);

const availableDates = ref(["2023-10-19", "2023-10-20", "2023-10-21"]);
const availableTimes = ref([]);

const timeSlotsByDay = {
  weekday: [
    "08:30",
    "10:00",
    "10:30",
    "12:30",
    "14:00",
    "15:00",
    "15:30",
    "17:00",
    "17:30",
  ],
  saturday: ["08:00", "09:30", "10:00", "10:30", "12:00"],
};

const handleUpdateQRCode = (newValue) => {
  qrCodeInput.value = newValue;

  qrValidated.value = false;
  errorText.value = "";
};

const getAvailableTimesForDate = (date) => {
  if (!date) {
    availableTimes.value = [];
    return;
  }

  const dateObj = typeof date === "string" ? new Date(date) : date;
  const dayOfWeek = dateObj.getDay();

  let baseTimeSlots = [];

  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    baseTimeSlots = [...timeSlotsByDay.weekday];
  } else if (dayOfWeek === 6) {
    baseTimeSlots = [...timeSlotsByDay.saturday];
  } else {
    availableTimes.value = [];
    return;
  }

  const occupiedSlots = Math.floor(Math.random() * 3) + 1;
  const shuffledSlots = [...baseTimeSlots].sort(() => Math.random() - 0.5);
  const slotsToRemove = shuffledSlots.slice(0, occupiedSlots);

  let availableSlots = baseTimeSlots.filter(
    (slot) => !slotsToRemove.includes(slot)
  );

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const selectedDateStr =
    typeof date === "string" ? date : date.toISOString().split("T")[0];

  if (selectedDateStr === today) {
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, "0")}:${Math.floor(currentMinutes / 30) * 30 === 0 ? "00" : "30"}`;

    availableSlots = availableSlots.filter((slot) => slot > currentTimeStr);
  }

  availableTimes.value = availableSlots;
};

const attrs = computed(() => {
  const today = new Date();
  const attrsArray = [
    {
      key: "today",
      dot: true,
      dates: new Date(),
    },
  ];

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  attrsArray.push({
    key: "disabled-past",
    dates: { end: yesterday },
    disabled: true,
  });

  const endDate = new Date("2025-12-31");
  const current = new Date(today);

  while (current <= endDate) {
    if (current.getDay() === 0) {
      attrsArray.push({
        key: `sunday-${current.getTime()}`,
        dates: new Date(current),
        disabled: true,
      });
    }
    current.setDate(current.getDate() + 1);
  }

  return attrsArray;
});

const props = defineProps({
  appointment: Object,
  open: Boolean,
  step: {
    type: Number,
    default: 1,
  },
  openValoration: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:step", "close-modal", "refresh"]);

const localStep = ref(props.step);
console.log(props.appointment);

watch(
  () => props.step,
  (newVal) => {
    localStep.value = newVal;
  }
);

watch(
  () => props.openValoration,
  (newVal) => {
    if (newVal && props.open) {
      localStep.value = 7;
    }
  },
  { immediate: true }
);

watch(
  () => props.open,
  (newVal) => {
    if (newVal && props.openValoration) {
      localStep.value = 7;
    } else if (newVal) {
      localStep.value = props.step;
    }
  }
);

const step = toRef(props, "step");

watch(selectedDate, (newDate) => {
  if (newDate) {
    selectedTime.value = "";
    getAvailableTimesForDate(newDate);
  }
});

const selectDay = (date) => {
  this.localSelectedDay = date;
  this.localSelectedHour = null;
  this.availableHours = this.availability[date] || [];
};

const formatDateForLookup = (date) => {
  return date.includes(":")
    ? date.split(":").length === 2
      ? `${date}:00`
      : date
    : `${date}:00:00`;
};

const handleProformaUpload = (event) => {
  const file = event.target.files[0];

  if (file) {
    proformaFileName.value = file.name;
  }
};

const handleRemoveExistingProforma = () => {
  existingProformaRemoved.value = true;

  fileRemoved.value = true;

  proformaFileName.value = "";
  proformaGuardado.value = false;

  const fileInput = document.getElementById("proforma-file-input");
  if (fileInput) {
    fileInput.value = "";
  }
};

const restoreExistingProforma = () => {
  existingProformaRemoved.value = false;
  fileRemoved.value = false;
};

const handleRemoveProforma = () => {
  proformaFileName.value = "";
  proformaGuardado.value = false;
  fileRemoved.value = true;

  const fileInput = document.getElementById("proforma-file-input");
  if (fileInput) {
    fileInput.value = "";
  }
};

const isValidPrice = (price) => {
  const priceRegex = /^\d{1,3}(,\d{3})*(\.\d{2})?$|^\d+(\.\d{2})?$/;
  return priceRegex.test(price.toString());
};

const updateProcedurePrice = (newPrice) => {
  procedurePrice.value = newPrice;

  if (newPrice && !isValidPrice(newPrice)) {
    console.warn("Formato de precio inválido");
  }
};

const editRecommendations = async () => {
  try {
    if (proformaGuardado.value) {
      proformaGuardado.value = false;
    } else {
      proformaFileName.value = "";
    }
  } catch (error) {
    console.error("Error saving recommendations:", error);
    errorText.value = "Error al guardar los cambios";
  }
};

const saveRecommendations = async () => {
  try {
    proformaGuardado.value = true;

    isLoading.value = true;

    const payload = {
      price_procedure: procedurePrice.value,
      recommendation_post_appointment: recommendationPostAppointment.value,
      appointment_result_code: "FIT_FOR_PROCEDURE",
      proforma_file_code: "PERSONAL_DOCUMENT____6__DOC__652025134811",
    };

    if (existingProformaRemoved.value) {
      payload.remove_existing_proforma = true;
    }

    const { data, error } = await useFetch(
      config.public.API_BASE_URL + "/appointment/upload_proforma",
      {
        method: "PUT",
        headers: { Authorization: token.value },
        params: {
          id: props.appointment.id,
        },
        body: payload,
      }
    );

    if (data) {
      isLoading.value = false;
      emit("refresh");
      closeModal();
    }
    if (error.value) {
      console.log(error.value, "data");
    }
  } catch (error) {
    console.error("Error saving recommendations:", error);
    errorText.value = "Error al guardar los cambios";
  }
};

const handleUploadProforma = () => {
  localStep.value = 7;
};

const handleNotSuitableProcedure = () => {
  localStep.value = 9;
};

const handleSaveValoration = () => {
  localStep.value = 8;
};

const handleSaveChanges = async () => {
  isLoading.value = true;

  const year = selectedDate.value.getFullYear();
  const month = String(selectedDate.value.getMonth() + 1).padStart(2, "0");
  const day = String(selectedDate.value.getDate()).padStart(2, "0");

  const dateString = `${year}-${month}-${day}`;

  const formattedHour = selectedTime.value.includes(":")
    ? selectedTime.value.split(":").length === 2
      ? `${selectedTime.value}:00`
      : selectedTime.value
    : `${selectedTime.value}:00:00`;

  const payload = {
    customer_id: props.appointment.customer.id,
    appointment_date: dateString || props.appointment.appointment_date,
    appointment_hour: formattedHour || props.appointment.appointment_hour,
    reservation_type: props.appointment.reservation_type.type,
    supplier_id: props.appointment.supplier.id,
  };

  const { data, error } = await useFetch(
    config.public.API_BASE_URL + "/appointment/edit",
    {
      method: "PUT",
      headers: { Authorization: token.value },
      params: {
        id: props.appointment.id,
      },
      body: payload,
    }
  );
  if (data) {
    isLoading.value = false;
    emit("refresh");
    localStep.value = 1;
  }
  if (error.value) {
    console.log(error.value, "data");
  }
};

const confirmSaveValoration = async () => {
  isLoading.value = true;

  const payload = {
    price_procedure: procedurePrice.value,
    recommendation_post_appointment: recommendationPostAppointment.value,
    appointment_result_code: "FIT_FOR_PROCEDURE",
    proforma_file_code: "PERSONAL_DOCUMENT____6__DOC__652025134811",
  };

  if (existingProformaRemoved.value) {
    payload.remove_existing_proforma = true;
  }

  const { data, error } = await useFetch(
    config.public.API_BASE_URL + "/appointment/upload_proforma",
    {
      method: "PUT",
      headers: { Authorization: token.value },
      params: {
        id: props.appointment.id,
      },
      body: payload,
    }
  );

  if (data) {
    isLoading.value = false;
    emit("refresh");
    closeModal();
  }
  if (error.value) {
    console.log(error.value, "data");
  }
};

const confirmNotSuitable = async () => {
  try {
    const { data, error } = await useFetch(
      config.public.API_BASE_URL + "/appointment/upload_proforma",
      {
        method: "PUT",
        headers: { Authorization: token.value },
        params: { id: props.appointment.id },
        body: {
          recommendation_post_appointment:
            "Paciente no apto para procedimiento",
          appointment_result_code: "NOT_FIT_FOR_PROCEDURE",
        },
      }
    );

    if (data) {
      props.appointment.appointment_status.code =
        "VALUED_VALORATION_APPOINTMENT";
      emit("refresh");
      closeModal();
    }

    if (error.value) {
      errorText.value = "Error al procesar la valoración";
    }
  } catch (error) {
    errorText.value = "Error al procesar la valoración";
  }
};

const confirmAppointment = async () => {
  isLoading.value = true;
  const { data, error } = await useFetch(
    config.public.API_BASE_URL + "/appointment/confirm_valoration_appointment",
    {
      method: "PUT",
      headers: { Authorization: token.value },
      params: {
        id: props.appointment.id,
      },
    }
  );
  if (data) {
    isLoading.value = false;
    emit("refresh");
    localStep.value = 3;
  }
  if (error.value) {
    console.log(error.value, "data");
  }
};

const confirmValoration = async () => {
  localStep.value = 3;
};

const confirmProcedure = async () => {
  isLoading.value = true;
  const { data, error } = await useFetch(
    config.public.API_BASE_URL + "/appointment/confirm_procedure",
    {
      method: "PUT",
      headers: { Authorization: token.value },
      params: {
        id: props.appointment.id,
      },
    }
  );
  if (data) {
    isLoading.value = false;
    emit("refresh");
    localStep.value = 3;
  }
  if (error.value) {
    console.log(error.value, "data");
  }
};

const finishProcedure = async () => {
  isLoading.value = true;
  const { data, error } = await useFetch(
    config.public.API_BASE_URL + "/appointment/set_procedure_realized",
    {
      method: "PUT",
      headers: { Authorization: token.value },
      params: {
        id: props.appointment.id,
      },
    }
  );
  if (data) {
    isLoading.value = false;
    emit("refresh");
    localStep.value = 3;
  }
  if (error.value) {
    console.log(error.value, "data");
  }
};

const validateQRCode = async () => {
  try {
    errorText.value = "";
    const { data, error } = await useFetch(
      `${config.public.API_BASE_URL}/appointmentcredit/get_all`,
      {
        method: "GET",
        headers: { Authorization: token.value },
        params: {
          appointment_qr_code: qrCodeInput.value,
        },
      }
    );

    if (error.value) {
      throw new Error(
        error.value.data?.message || "Error al validar el código QR"
      );
    }

    if (!data.value || data.value.length === 0) {
      throw new Error("No se encontró crédito asociado a este código QR");
    }

    const credit = data.value.data[0];

    if (credit.already_been_used) {
      throw new Error("Este crédito ya ha sido utilizado");
    }

    qrValidated.value = true;
    creditAmount.value = credit.approved_amount;
    creditId.value = credit.id;
  } catch (err) {
    errorText.value = err.message;
    qrValidated.value = false;
  }
};

const useCredit = async () => {
  try {
    errorText.value = "";
    const { data, error } = await useFetch(
      `${config.public.API_BASE_URL}/appointmentcredit/edit`,
      {
        method: "PUT",
        headers: { Authorization: token.value },
        params: {
          id: creditId.value,
        },
        body: {
          already_been_used: true,
        },
      }
    );

    if (error.value) {
      throw new Error(
        error.value.data?.message || "Error al utilizar el crédito"
      );
    }

    creditUsed.value = true;
    emit("refresh");
  } catch (err) {
    errorText.value = err.message;
  }
};

const cancelAppointment = async () => {
  localStep.value = 3;
};

const resetSteps = () => {
  localStep.value = 1;
};

const closeModal = () => {
  resetSteps();
  existingProformaRemoved.value = false;
  fileRemoved.value = false;
  proformaFileName.value = "";
  proformaGuardado.value = false;

  emit("close-modal");
};
</script>

<style lang="scss" scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1055;
  display: none;
  width: 100%;
  height: 100dvh;

  overflow-x: hidden;
  overflow-y: auto;
  outline: 0;
  background-color: rgba(0, 0, 0, 0.5);

  &--show {
    display: block;
  }

  &__dialog {
    position: relative;
    width: auto;
    pointer-events: none;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
}

.modal {
  transition: opacity 0.15s linear;
}

.modal--show {
  opacity: 1;
}

.modal:not(.modal--show) {
  opacity: 0;
}
</style>
