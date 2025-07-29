<template>
  <div>
    <div v-if="shouldShowProcedureRequestButton()">
      <button
        v-if="!showStatus"
        role="button"
        class="appointment-procedure-modal__button--outline"
        @click="openProcedureModal()"
        :disabled="isProcedureButtonDisabled()"
      >
        {{ getProcedureButtonText() }}
      </button>
      <span
        v-else
        @click="openProcedureModal()"
        role="button"
        class="appointment-procedure-modal__status"
        :class="statusClass(appointment.appointment_status.code)"
      >
        {{ appointment.appointment_status.value1 }}
      </span>
    </div>

    <div v-if="shouldShowPaidStatus()">
      <div
        v-if="!showStatus"
        role="button"
        class="d-flex gap-2 align-items-center"
        @click="openModal"
      >
        <img src="@/src/assets/success.svg" class="mr-2" alt="Success" />
        <p class="text-success mb-0">Pagado</p>
      </div>
      <span
        v-else
        @click="openModal"
        role="button"
        class="appointment-procedure-modal__status"
        :class="statusClass(appointment.appointment_status.code)"
      >
        {{ appointment.appointment_status.value1 }}
      </span>
    </div>
  </div>

  <div
    class="modal fade"
    :class="{ show: open }"
    v-if="open"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
    style="display: block; background-color: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div
          class="modal-header border-0 align-items-center d-flex justify-content-between"
        >
          <button
            type="button"
            class="btn-close btn btn-light me-2"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="open = false"
          ></button>
        </div>
        <div class="modal-body">
          <div v-if="step === 1">
            <h5 class="fw-bold">
              Detalles
              {{
                appointment.reservation_type?.code ==
                "PRE_RESERVATION_VALORATION_APPOINTMENT"
                  ? "de la valoración"
                  : "del procedimiento"
              }}
            </h5>
            <table class="table table-borderless">
              <tbody>
                <tr>
                  <td><strong>Tipo de servicio:</strong></td>
                  <td>
                    {{
                      appointment.reservation_type?.code ==
                      "PRE_RESERVATION_VALORATION_APPOINTMENT"
                        ? "Cita de valoración"
                        : "Procedimiento médico"
                    }}
                  </td>
                </tr>
                <tr>
                  <td><strong>Fecha de la cita:</strong></td>
                  <td>{{ formatDate(appointment.appointment_date) }}</td>
                </tr>
                <tr>
                  <td><strong>Hora de la cita:</strong></td>
                  <td>{{ appointment.appointment_hour }}</td>
                </tr>
                <tr>
                  <td><strong>Paciente titular:</strong></td>
                  <td>{{ appointment.customer.name }}</td>
                </tr>
                <tr>
                  <td><strong>Teléfono de Contacto:</strong></td>
                  <td>{{ appointment.customer.phone_number }}</td>
                </tr>
                <tr>
                  <td><strong>Profesional Médico:</strong></td>
                  <td>{{ appointment.supplier.name }}</td>
                </tr>
                <tr>
                  <td><strong>Estado:</strong></td>
                  <td>
                    <span
                      class="appointment-procedure-modal__status"
                      :class="statusClass(appointment.appointment_status.code)"
                    >
                      {{ appointment.appointment_status.value1 }}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td><strong>Procedimiento:</strong></td>
                  <td>{{ appointment.package?.procedure.name }}</td>
                </tr>
                <tr>
                  <td><strong>Costo del servicio:</strong></td>
                  <td>{{ getServiceCost() }}</td>
                </tr>
                <!-- Mostrar información de crédito si existe -->
                <tr v-if="hasApprovedCredit()">
                  <td><strong>Monto aprobado del crédito:</strong></td>
                  <td>{{ formatCurrency(getApprovedCreditAmount()) }}</td>
                </tr>
                <tr v-if="hasApprovedCredit()">
                  <td><strong>Saldo a pagar:</strong></td>
                  <td>{{ calculateRemainingAmount() }}</td>
                </tr>
              </tbody>
            </table>

            <div
              v-if="shouldShowActionButtons()"
              class="d-flex justify-content-between gap-2"
            >
              <button
                v-if="canRequestProcedure()"
                class="btn btn-outline-dark w-50"
                @click="step = 4"
              >
                Reservar el procedimiento
              </button>

              <button
                v-if="canRequestCredit()"
                class="btn btn-primary w-50"
                @click="step = 2"
              >
                Solicitar crédito
              </button>

              <div v-if="isCreditPending()" class="w-100 text-center">
                <p class="b-0">
                  <strong>Esperando respuesta de crédito</strong><br />
                  <small
                    >Tu solicitud está siendo evaluada por la asociación
                    solidarista.</small
                  >
                </p>
              </div>
            </div>
          </div>

          <div v-if="step === 2">
            <div class="d-flex flex-column">
              <h5 class="fw-bold">Solicitar crédito</h5>
            </div>
            <p class="text-muted">
              Para continuar con la reserva del procedimiento, solicita un
              crédito por un monto igual o menor al costo total de la cita.
            </p>
            <form>
              <div class="row mb-3">
                <div class="col-8 d-flex w-100 mb-2">
                  <label
                    for="procedureAmount"
                    class="form-label col-4 text-muted"
                  >
                    Monto total del procedimiento:
                  </label>
                  <input
                    type="text"
                    class="form-control"
                    id="procedureAmount"
                    :value="formatCurrency(getProcedureCost())"
                    disabled
                  />
                </div>
                <div class="col-8 d-flex w-100">
                  <label for="loanAmount" class="form-label col-4 text-muted">
                    Monto del crédito a solicitar:
                  </label>
                  <input
                    type="number"
                    class="form-control"
                    id="loanAmount"
                    v-model="loanAmount"
                    :max="getProcedureCost()"
                    min="1000"
                    step="1000"
                  />
                </div>
              </div>

              <div
                v-if="loanAmount && !isValidCreditAmount"
                class="text-danger small mb-3"
              >
                El monto debe estar entre ₡1,000 y
                {{ formatCurrency(getProcedureCost()) }}
              </div>

              <div class="d-flex justify-content-between gap-2">
                <button class="btn btn-outline-dark w-50" @click="step = 1">
                  Cancelar
                </button>
                <button
                  class="btn btn-primary w-50"
                  @click.prevent="processRequest"
                  :disabled="!isValidCreditAmount || loading"
                >
                  <span
                    v-if="loading"
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                  ></span>
                  Enviar solicitud
                </button>
              </div>
            </form>
          </div>

          <div v-if="step === 3">
            <div class="d-flex flex-column align-items-center">
              <img
                src="@/src/assets/check.svg"
                width="48"
                class="mr-2"
                alt="Vitalink"
              />
              <h2 class="text-center">¡Felicidades!</h2>
              <p class="mb-4 text-center">
                Tu solicitud de crédito por {{ formatCurrency(loanAmount) }} se
                ha enviado con éxito
              </p>
              <p class="text-muted text-center">
                La asociación solidarista evaluará tu solicitud y te responderá
                en 24-48 horas.
              </p>
            </div>
            <div class="col-12 d-flex justify-content-between gap-2">
              <button
                class="btn btn-outline-dark me-2 text-sm w-50"
                @click="goToStep(1)"
              >
                Ir al home
              </button>
              <button class="btn btn-primary w-50" @click="open = false">
                Ver en Citas
              </button>
            </div>
          </div>

          <div v-if="step === 4">
            <h5 class="fw-bold">Confirmar Reserva</h5>
            <table class="table table-borderless">
              <tbody>
                <tr>
                  <td><strong>Paciente titular:</strong></td>
                  <td>{{ appointment.customer.name }}</td>
                </tr>
                <tr>
                  <td><strong>Doctor:</strong></td>
                  <td>{{ appointment.supplier.name }}</td>
                </tr>
                <tr>
                  <td><strong>Costo del servicio:</strong></td>
                  <td>{{ formatCurrency(getProcedureCost()) }}</td>
                </tr>
                <!-- Resumen financiero mejorado según punto 8 del backlog -->
                <tr v-if="hasApprovedCredit()">
                  <td><strong>Monto crédito aprobado:</strong></td>
                  <td class="text-success">
                    -{{ formatCurrency(getApprovedCreditAmount()) }}
                  </td>
                </tr>
                <tr v-if="hasApprovedCredit()" class="total">
                  <td><strong>Saldo a pagar:</strong></td>
                  <td class="fw-bold">{{ calculateRemainingAmount() }}</td>
                </tr>
                <tr>
                  <td><strong>Fecha de la cita:</strong></td>
                  <td>
                    <div class="dropdown">
                      <button
                        class="btn btn-outline-secondary dropdown-toggle gap-2"
                        type="button"
                        id="dateDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                      >
                        <img
                          src="@/src/assets/calendar.svg"
                          alt="Busca centro medico"
                          class="img-fluid"
                        />
                        {{ selectedDate || "Seleccionar fecha" }}
                      </button>
                      <ul class="dropdown-menu" aria-labelledby="dateDropdown">
                        <li v-for="date in availableDates" :key="date">
                          <a
                            class="dropdown-item"
                            href="#"
                            @click="selectDate(date)"
                            >{{ formatDisplayDate(date) }}</a
                          >
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td><strong>Hora de la cita:</strong></td>
                  <td>
                    <div class="dropdown">
                      <button
                        class="btn btn-outline-secondary dropdown-toggle gap-2"
                        type="button"
                        id="timeDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        :disabled="!selectedDate"
                      >
                        <img
                          src="@/src/assets/clock.svg"
                          alt="Busca centro medico"
                          class="img-fluid"
                        />
                        {{ selectedTime || "Seleccionar hora" }}
                      </button>
                      <ul class="dropdown-menu" aria-labelledby="timeDropdown">
                        <li v-for="time in availableTimes" :key="time">
                          <a
                            class="dropdown-item"
                            href="#"
                            @click="selectTime(time)"
                            >{{ time }}</a
                          >
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="d-flex justify-content-between gap-2">
              <button class="btn btn-outline-dark w-50" @click="step = 1">
                Cancelar
              </button>
              <button
                class="btn btn-primary w-50"
                @click="confirmReservation"
                :disabled="!selectedDate || !selectedTime || loading"
              >
                <span
                  v-if="loading"
                  class="spinner-border spinner-border-sm me-2"
                  role="status"
                ></span>
                Confirmar Reserva
              </button>
            </div>
          </div>

          <div v-if="step === 6">
            <div class="d-flex flex-column align-items-center">
              <img
                src="@/src/assets/check.svg"
                width="48"
                class="mr-2"
                alt="Vitalink"
              />
              <h2 class="text-center">¡Solicitud de reserva enviada!</h2>
              <p class="mb-4 text-center">
                Una vez que el médico confirme la reserva te enviaremos un
                correo electrónico de confirmación
              </p>
            </div>
            <div class="col-12 d-flex justify-content-between gap-2">
              <button
                class="btn btn-outline-dark me-2 text-sm w-50"
                @click="goToStep(1)"
              >
                Ir al home
              </button>
              <button class="btn btn-primary w-50" @click="open = false">
                Ver en Citas
              </button>
            </div>
          </div>

          <div class="modal-footer justify-content-center" v-if="errorText">
            <p class="text-danger">{{ errorText }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineEmits, defineProps, ref } from "vue";

const token = useCookie("token");
const config = useRuntimeConfig();

const props = defineProps({
  appointment: {
    type: Object,
    required: true,
  },
  showStatus: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["refresh"]);

const open = ref(false);
const step = ref(1);
const loading = ref(false);
const errorText = ref("");

const loanAmount = ref(null);
const selectedDate = ref("");
const selectedTime = ref("");

const availableDates = ref([
  new Date(Date.now() + 86400000).toISOString().split("T")[0],
  new Date(Date.now() + 172800000).toISOString().split("T")[0],
  new Date(Date.now() + 259200000).toISOString().split("T")[0],
]);
const availableTimes = ref([]);

const shouldShowProcedureRequestButton = () => {
  return (
    props.appointment.appointment_status.code ===
      "VALUED_VALORATION_APPOINTMENT" &&
    props.appointment.appointment_result?.code === "FIT_FOR_PROCEDURE"
  );
};

const isProcedureButtonDisabled = () => {
  return isCreditPending();
};

const getProcedureButtonText = () => {
  if (isProcedureButtonDisabled()) {
    return "Solicitar Procedimiento";
  }
  return "Solicitar Procedimiento";
};

const isCreditPending = () => {
  return (
    props.appointment.appointment_credit?.credit_status_code === "REQUIRED" &&
    !props.appointment.appointment_credit.approved_amount
  );
};

const shouldShowPaidStatus = () => {
  return (
    props.appointment.appointment_status.code ===
      "VALUATION_PENDING_VALORATION_APPOINTMENT" ||
    props.appointment.payment_status?.code ===
      "PAYMENT_STATUS_PAID_PROCEDURE" ||
    props.appointment.appointment_status.code === "CONCRETED_APPOINTMENT"
  );
};

const shouldShowActionButtons = () => {
  return (
    props.appointment.appointment_status.code ===
    "VALUED_VALORATION_APPOINTMENT"
  );
};

const canRequestProcedure = () => {
  return (
    !isCreditPending() &&
    (hasApprovedCredit() || !props.appointment.appointment_credit)
  );
};

const canRequestCredit = () => {
  return (
    !hasApprovedCredit() &&
    !isCreditPending() &&
    props.appointment.appointment_credit?.credit_status_code !== "REJECTED"
  );
};

const hasApprovedCredit = () => {
  const credit = props.appointment.appointment_credit;

  if (!credit) return false;

  const approvedStatuses = ["APPROVED", "APPROVED_PERCENTAGE"];
  return (
    approvedStatuses.includes(credit.credit_status_code) &&
    credit.approved_amount > 0
  );
};

const getApprovedCreditAmount = () => {
  if (!hasApprovedCredit()) return 0;
  return props.appointment.appointment_credit.approved_amount || 0;
};

const isValidCreditAmount = computed(() => {
  const amount = parseInt(loanAmount.value);
  const maxAmount = getProcedureCost();
  return amount >= 1000 && amount <= maxAmount;
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatDisplayDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
  }).format(amount || 0);
};

const formatNumber = (amount) => {
  return new Intl.NumberFormat("es-CR").format(amount || 0);
};

const getServiceCost = () => {
  const isValoration =
    props.appointment.reservation_type?.code ==
    "PRE_RESERVATION_VALORATION_APPOINTMENT";

  if (isValoration) {
    return formatCurrency(
      props.appointment.price_valoration_appointment || 18000
    );
  } else {
    return formatCurrency(getProcedureCost());
  }
};

const getProcedureCost = () => {
  return (
    props.appointment.price_procedure || props.appointment.package?.price || 0
  );
};

const calculateRemainingAmount = () => {
  const total = getProcedureCost();
  const credit = hasApprovedCredit() ? getApprovedCreditAmount() : 0;
  const remaining = Math.max(0, total - credit);

  return formatCurrency(remaining);
};

const openModal = () => {
  open.value = true;
  step.value = 1;
  clearForm();
};

const openProcedureModal = () => {
  open.value = true;
  step.value = 1;
  clearForm();
};

const closeModal = () => {
  open.value = false;
  step.value = 1;
  clearForm();
};

const clearForm = () => {
  loanAmount.value = getProcedureCost();
  selectedDate.value = "";
  selectedTime.value = "";
  errorText.value = "";
  availableTimes.value = [];
};

const selectDate = (date) => {
  selectedDate.value = date;
  availableTimes.value = ["09:00", "10:00", "11:00", "14:00", "15:30", "16:00"];
  selectedTime.value = "";
};

const selectTime = (time) => {
  selectedTime.value = time;
};

const goToHome = () => {
  closeModal();
};

const statusClass = (status) => {
  const statusMap = {
    CANCEL_APPOINTMENT: "appointment-procedure-modal__status--cancelled",
    PENDING_VALORATION_APPOINTMENT:
      "appointment-procedure-modal__status--warning",
    PENDING_PROCEDURE: "appointment-procedure-modal__status--warning",
    CONFIRM_PROCEDURE: "appointment-procedure-modal__status--primary",
    CONCRETED_APPOINTMENT: "appointment-procedure-modal__status--primary",
    VALUED_VALORATION_APPOINTMENT:
      "appointment-procedure-modal__status--success",
    CONFIRM_VALIDATION_APPOINTMENT:
      "appointment-procedure-modal__status--success",
    VALUATION_PENDING_VALORATION_APPOINTMENT:
      "appointment-procedure-modal__status--primary",
    WAITING_PROCEDURE: "appointment-procedure-modal__status--warning",
  };
  return statusMap[status] || "";
};

const processRequest = async () => {
  if (!isValidCreditAmount.value) {
    errorText.value =
      "Por favor, ingrese un monto válido entre ₡1,000 y " +
      formatCurrency(getProcedureCost());
    return;
  }

  loading.value = true;
  errorText.value = "";

  try {
    const { data, error } = await useFetch(
      `${config.public.API_BASE_URL}/appointmentcredit/add`,
      {
        method: "POST",
        headers: {
          Authorization: token.value,
          "Content-Type": "application/json",
        },
        body: {
          appointment: props.appointment.id,
          requested_amount: loanAmount.value,
        },
      }
    );

    if (error.value) {
      throw new Error(
        error.value.data?.info || "Error al solicitar el crédito"
      );
    }

    if (data.value) {
      emit("refresh");
      step.value = 3;
    }
  } catch (error) {
    console.error("Error al solicitar crédito:", error);
    errorText.value =
      error.message ||
      "Error al procesar la solicitud. Por favor intenta nuevamente.";
  } finally {
    loading.value = false;
  }
};

const confirmReservation = async () => {
  if (!selectedDate.value || !selectedTime.value) {
    errorText.value = "Por favor, seleccione fecha y hora para la cita.";
    return;
  }

  loading.value = true;
  errorText.value = "";

  try {
    const { data, error } = await useFetch(
      config.public.API_BASE_URL + "/appointment/reserve_procedure",
      {
        method: "PUT",
        headers: {
          Authorization: token.value,
          "Content-Type": "application/json",
        },
        params: {
          id: props.appointment.id,
        },
        body: {
          proposed_date: selectedDate.value,
          proposed_time: selectedTime.value,
        },
      }
    );

    if (error.value) {
      throw new Error(
        error.value.data?.message || "Error al reservar el procedimiento"
      );
    }

    if (data.value) {
      if (data.value.success === false) {
        throw new Error(
          data.value.message || "No se pudo reservar el procedimiento"
        );
      }

      emit("refresh");
      step.value = 6;
    }
  } catch (error) {
    console.error("Error al confirmar reserva:", error);
    errorText.value =
      error.message ||
      "Error al procesar la reserva. Por favor intenta nuevamente.";
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.appointment-procedure-modal {
  &__button {
    &--outline {
      @include outline-button;
      font-weight: 600;
      font-size: 12px;
      line-height: 18px;
      padding: 8px 16px;
      width: 100%;

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }

  &__status {
    display: block;
    width: 100%;
    text-align: center;
    text-wrap: nowrap;
    font-family: $font-family-main;
    font-weight: 500;
    font-style: Light;
    font-size: 12px;
    color: #19213d;
    line-height: 18px;
    letter-spacing: 0px;
    border-radius: 30px;
    padding: 6px 10px;
    width: 100%;

    &--success {
      background-color: #d3f2dd;
    }

    &--warning {
      background-color: #faedbf;
    }

    &--primary {
      background-color: rgba($color-primary, 0.1);
    }

    &--danger {
      background-color: #fac6d0;
    }
  }
}

.modal-content {
  border-radius: 10px;
}

.modal-header {
  padding: 1rem;
}

.modal-body {
  padding: 2rem;
}

.modal-footer {
  padding: 1rem;
}

.total {
  border-top: 1px solid #e1e4ed;
}

.dropdown-toggle {
  display: flex;
  align-items: center;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}
</style>
