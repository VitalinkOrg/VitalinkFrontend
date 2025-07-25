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
        <DetallesCita
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
        />

        <!-- Step 2: Payment Details -->
        <ConfirmacionReserva
          v-if="localStep === 2"
          :appointment="appointment"
          @cancel="localStep = 1"
          @confirm-appointment="confirmAppointment"
          @confirm-procedure="confirmProcedure"
          @finish-procedure="finishProcedure"
          @confirm-valoration="confirmValoration"
        />

        <!-- Step 3: Confirmation -->
        <ExitoConfirmacion
          v-if="localStep === 3"
          :appointment="appointment"
          @go-to-start="localStep = 1"
          @view-appointments="open = false"
          @upload-proforma="handleUploadProforma"
          @not-suitable-procedure="handleNotSuitableProcedure"
        />

        <!-- Step 4: Cancellation Confirmation -->
        <ConfirmacionCancelacion
          v-if="localStep === 4"
          @go-back="localStep = 1"
          @cancel-appointment="cancelAppointment"
        />

        <!-- Step 5: Appointment Details (Alternative view) -->
        <DetallesAlternativos
          v-if="localStep === 5"
          :appointment="appointment"
          :proforma-file-name="proformaFileName"
          :proforma-guardado="proformaGuardado"
          :description="description"
          @handle-proforma-upload="handleProformaUpload"
        />

        <!-- Step 6: Date and Time Editor -->
        <EditorFechaHora
          v-if="localStep === 6"
          :appointment="appointment"
          :selected-date="selectedDate"
          :selected-time="selectedTime"
          :available-times="availableTimes"
          :attrs="attrs"
          @update:selected-date="selectedDate = $event"
          @update:selected-time="selectedTime = $event"
          @cancel="localStep = 1"
          @save-changes="localStep = 2"
        />

        <!-- Step 7: Valoración Details - Nueva ventana para detalles de valoración -->
        <DetallesValoracion
          v-if="localStep === 7"
          :appointment="appointment"
          :proforma-file-name="proformaFileName"
          :proforma-guardado="proformaGuardado"
          :description="description"
          @handle-proforma-upload="handleProformaUpload"
          @save-valoration="handleSaveValoration"
          @not-suitable-procedure="handleNotSuitableProcedure"
          @update:description="description = $event"
        />

        <!-- Step 8: Confirmación de guardado -->
        <ConfirmacionGuardado
          v-if="localStep === 8"
          @confirm-save="confirmSaveValoration"
          @cancel-save="localStep = 7"
        />

        <!-- Step 9: Confirmación "No apto para procedimiento" -->
        <ConfirmacionNoApto
          v-if="localStep === 9"
          @confirm-not-suitable="confirmNotSuitable"
          @cancel="localStep = 7"
        />

        <div class="modal__footer modal__footer--center" v-if="errorText">
          <p class="modal__error-text">{{ errorText }}</p>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, toRef, watch } from "vue";
import ConfirmacionCancelacion from "./confirmacion-cancelacion.vue";
import ConfirmacionGuardado from "./confirmacion-guardado.vue";
import ConfirmacionNoApto from "./confirmacion-no-apto.vue";
import ConfirmacionReserva from "./confirmacion-reserva.vue";
import DetallesAlternativos from "./detalles-alternativos.vue";
import DetallesCita from "./detalles-cita.vue";
import DetallesValoracion from "./detalles-valoracion.vue";
import EditorFechaHora from "./editor-fecha-hora.vue";
import ExitoConfirmacion from "./exito-confirmacion.vue";

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
const description = ref("");

// Mock data for available dates and times
const availableDates = ref(["2023-10-19", "2023-10-20", "2023-10-21"]);
const availableTimes = ref([]);

const attrs = ref([
  {
    key: "today",
    dot: true,
    dates: new Date(),
  },
]);

const props = defineProps({
  appointment: Object,
  open: Boolean,
  step: {
    type: Number,
    default: 1,
  },
  // Nueva prop para indicar si se debe abrir directamente en valoración
  openValoration: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:step", "close-modal", "refresh"]);

const localStep = ref(props.step);

// Sync cuando prop cambia
watch(
  () => props.step,
  (newVal) => {
    localStep.value = newVal;
  }
);

// Watch para abrir directamente en valoración
watch(
  () => props.openValoration,
  (newVal) => {
    if (newVal && props.open) {
      localStep.value = 7; // Ir directamente a detalles de valoración
    }
  },
  { immediate: true }
);

// Watch para abrir modal
watch(
  () => props.open,
  (newVal) => {
    if (newVal && props.openValoration) {
      localStep.value = 7; // Ir directamente a detalles de valoración
    } else if (newVal) {
      localStep.value = props.step;
    }
  }
);

const step = toRef(props, "step");

const availableTimesByDate = {
  "2025-04-01": ["09:00", "10:00", "11:00", "15:30"],
  "2023-10-20": ["10:30", "14:00", "16:00"],
  "2023-10-21": ["09:30", "11:30", "15:00"],
};

watch(selectedDate, (newDate) => {
  if (newDate) {
    const formattedDate = formatDateForLookup(newDate);
    availableTimes.value = availableTimesByDate[formattedDate] || [];
    selectedTime.value = "";
  }
});

const formatDateForLookup = (date) => {
  const d = new Date(date);
  let month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("-");
};

const handleProformaUpload = (event) => {
  if (event === null) {
    proformaFileName.value = "";
    return;
  }

  if (event && event.target && event.target.files) {
    const file = event.target.files[0];
    if (file) {
      proformaFileName.value = file.name;
    }
    return;
  }

  if (event && event.name) {
    proformaFileName.value = event.name;
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
  } catch (error) {
    console.error("Error saving recommendations:", error);
    errorText.value = "Error al guardar los cambios";
  }
};

const handleUploadProforma = () => {
  // Flujo automático: ir directamente a detalles de valoración
  localStep.value = 7;
};

const handleNotSuitableProcedure = () => {
  // Mostrar confirmación para "No apto para procedimiento"
  localStep.value = 9;
};

const handleSaveValoration = () => {
  // Mostrar confirmación antes de guardar
  localStep.value = 8;
};

const confirmSaveValoration = async () => {
  try {
    // Actualizar estado a "Valorado"
    const { data, error } = await useFetch(
      config.public.API_BASE_URL + "/appointment/finalize_valoration",
      {
        method: "PUT",
        headers: { Authorization: token.value },
        params: { id: props.appointment.id },
        body: {
          description: description.value,
          proforma_file: proformaFileName.value,
          appointment_result_code: "FIT_FOR_PROCEDURE",
        },
      }
    );

    if (data) {
      // Cambiar estado local
      props.appointment.appointment_status.code =
        "VALUED_VALORATION_APPOINTMENT";
      emit("refresh");
      // Cerrar modal
      closeModal();
    }

    if (error.value) {
      errorText.value = "Error al guardar la valoración";
    }
  } catch (error) {
    errorText.value = "Error al guardar la valoración";
  }
};

const confirmNotSuitable = async () => {
  try {
    // Actualizar estado a "Valorado" como "No apto"
    const { data, error } = await useFetch(
      config.public.API_BASE_URL + "/appointment/finalize_valoration",
      {
        method: "PUT",
        headers: { Authorization: token.value },
        params: { id: props.appointment.id },
        body: {
          description: "Paciente no apto para procedimiento",
          appointment_result_code: "NOT_FIT_FOR_PROCEDURE",
        },
      }
    );

    if (data) {
      // Cambiar estado local
      props.appointment.appointment_status.code =
        "VALUED_VALORATION_APPOINTMENT";
      emit("refresh");
      // Cerrar modal
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
    emit("refresh");
    localStep.value = 3;
  }
  if (error.value) {
    console.log(error.value, "data");
  }
};

const confirmValoration = async () => {
  const { data, error } = await useFetch(
    config.public.API_BASE_URL + "/appointment/upload_proforma",
    {
      method: "PUT",
      headers: { Authorization: token.value },
      params: {
        id: props.appointment.id,
      },
      body: {
        appointment_result_code: "FIT_FOR_PROCEDURE",
        proforma_file_code: "PERSONAL_DOCUMENT____6__DOC__652025134811",
      },
    }
  );
  if (data) {
    emit("refresh");
    localStep.value = 3;
  }
  if (error.value) {
    console.log(error.value, "data");
  }
};

const confirmProcedure = async () => {
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
    emit("refresh");
    localStep.value = 3;
  }
  if (error.value) {
    console.log(error.value, "data");
  }
};

const finishProcedure = async () => {
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
  } catch (err) {
    errorText.value = err.message;
  }
};

const cancelAppointment = async () => {
  // Implementation for canceling appointment
  console.log("Cancelando cita...");
  localStep.value = 3;
};

const resetSteps = () => {
  localStep.value = 1;
};

const closeModal = () => {
  resetSteps();
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

// Animation for modal fade
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
