<template>
  <div class="appointment-pay-modal">
    <div
      v-if="
        (appointment.appointment_status.code ===
          'CONFIRM_VALIDATION_APPOINTMENT' &&
          (appointment.payment_status.code ===
            'PAYMENT_STATUS_NOT_PAID_VALORATION_APPOINTMENT' ||
            appointment.payment_status.code ===
              'PAYMENT_STATUS_NOT_PAID_PROCEDURE')) ||
        (appointment.appointment_status.code === 'CONFIRM_PROCEDURE' &&
          appointment.payment_status.code ===
            'PAYMENT_STATUS_NOT_PAID_PROCEDURE') ||
        (appointment.appointment_status?.code === 'PENDING_PROCEDURE' &&
          appointment.payment_status?.code ===
            'PAYMENT_STATUS_NOT_PAID_PROCEDURE')
      "
    >
      <button
        v-if="
          !showStatus &&
          Number(appointment.price_procedure) -
            Number(
              appointment.appointment_credit
                ? appointment.appointment_credit.approved_amount
                : 0
            ) !==
            0
        "
        role="button"
        class="appointment-pay-modal__button--outline"
        @click="handleOpen"
      >
        <span> Pagar ahora </span>
      </button>
      <div
        v-else-if="!showStatus"
        role="button"
        class="appointment-pay-modal__button-item"
        @click="handleOpen"
      >
        <img src="@/src/assets/success.svg" class="mr-2" alt="Success" />
        <p class="text-success mb-0">Pagado</p>
      </div>
      <span
        v-else
        role="button"
        @click="handleOpen"
        class="appointment-pay-modal__status"
        :class="statusClass(appointment.appointment_status.code)"
      >
        {{ appointment.appointment_status.value1 }}
      </span>
    </div>

    <div
      v-if="
        appointment.appointment_status.code === 'VALUED_VALORATION_APPOINTMENT'
      "
    >
      —
      <span
        v-if="!showStatus"
        role="button"
        @click="openProcedureModal"
        class="appointment-pay-modal__status"
        :class="statusClass(appointment.appointment_status.code)"
      >
        {{ appointment.appointment_status.value1 }}
      </span>
    </div>

    <div v-if="shouldShowPaidStatus()">
      <div
        v-if="!showStatus"
        role="button"
        class="appointment-pay-modal__button-item"
        @click="handleOpen"
      >
        <img src="@/src/assets/success.svg" class="mr-2" alt="Success" />
        <p class="text-success mb-0">Pagado</p>
      </div>
      <span
        v-else
        @click="handleOpen"
        role="button"
        class="appointment-pay-modal__status"
        :class="statusClass(appointment.appointment_status.code)"
      >
        {{ appointment.appointment_status.value1 }}
      </span>
    </div>

    <div
      v-else-if="
        appointment.appointment_status.code === 'CONCRETED_APPOINTMENT'
      "
    >
      <span
        v-if="showStatus"
        role="button"
        @click="handleOpen"
        class="appointment-pay-modal__status"
        :class="statusClass(appointment.appointment_status.code)"
      >
        {{ appointment.appointment_status.value1 }}
      </span>
    </div>

    <div
      v-else-if="
        appointment.payment_status.code === 'PAYMENT_STATUS_PAID_PROCEDURE'
      "
      role="button"
    >
      <div v-if="!showStatus" class="d-flex gap-2">
        <img src="@/src/assets/success.svg" class="mr-2" alt="Success" />
        <p class="text-success mb-0">Pagado</p>
      </div>
      <span
        v-else
        role="button"
        class="appointment-pay-modal__status"
        :class="statusClass(appointment.appointment_status.code)"
      >
        {{ appointment.appointment_status.value1 }}
      </span>
    </div>

    <div
      v-else-if="
        appointment.appointment_status.code === 'PENDING_VALORATION_APPOINTMENT'
      "
    >
      <button
        v-if="!showStatus"
        role="button"
        class="appointment-pay-modal__button--outline"
        @click="handleOpen"
      >
        Cancelar cita
      </button>
      <span
        v-else
        role="button"
        @click="handleOpen"
        class="appointment-pay-modal__status"
        :class="statusClass(appointment.appointment_status.code)"
      >
        {{ appointment.appointment_status.value1 }}
      </span>
    </div>
    <div
      v-else-if="appointment.appointment_status.code === 'CANCEL_APPOINTMENT'"
    >
      <span
        v-if="showStatus"
        role="button"
        class="appointment-pay-modal__status"
        :class="statusClass(appointment.appointment_status.code)"
      >
        {{ appointment.appointment_status.value1 }}
      </span>
    </div>

    <div
      v-else-if="
        appointment.appointment_credit?.credit_status?.code === 'REQUIRED' &&
        appointment.appointment_status.code === 'VALUED_VALORATION_APPOINTMENT'
      "
    >
      <button
        v-if="!showStatus"
        role="button"
        class="appointment-pay-modal__button--outline appointment-pay-modal__button--disabled"
        disabled
      >
        Esperando respuesta de crédito
      </button>
      <span v-else role="button" class="appointment-pay-modal__status--warning">
        Crédito pendiente
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
              Detalles de
              {{
                appointment.appointment_type.code == "VALORATION_APPOINTMENT"
                  ? "la cita"
                  : "la reserva"
              }}
            </h5>
            <p class="text-muted">
              Te avisaremos cuando tu solicitud de cita sea aceptada.
            </p>
            <table class="table table-borderless">
              <tbody>
                <tr>
                  <td><strong>Tipo de servicio:</strong></td>
                  <td>
                    {{
                      appointment.appointment_type.code ===
                      "PROCEDURE_APPOINTMENT"
                        ? "Cita de procedimiento"
                        : "Cita de valoración"
                    }}
                  </td>
                </tr>
                <tr>
                  <td><strong>Fecha de la cita:</strong></td>
                  <td>
                    {{
                      new Date(
                        appointment.appointment_date
                      ).toLocaleDateString()
                    }}
                  </td>
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
                      class="appointment-pay-modal__status"
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
                  <td><strong>Monto del procedimiento:</strong></td>
                  <td>
                    {{
                      appointment.appointment_type.code ===
                      "PROCEDURE_APPOINTMENT"
                        ? "₡" + appointment.price_procedure
                        : "₡" + appointment.price_valoration_appointment
                    }}
                  </td>
                </tr>
                <tr v-if="appointment.appointment_credit">
                  <td><strong>Crédito aprobado:</strong></td>
                  <td>
                    {{
                      appointment.appointment_credit
                        ? "₡" + appointment.appointment_credit.approved_amount
                        : "₡" + "0.00"
                    }}
                  </td>
                </tr>
                <tr v-if="appointment.appointment_credit">
                  <td><strong>Saldo pendiente:</strong></td>
                  <td v-if="appointment.appointment_credit">
                    {{
                      "₡" +
                      (Number(appointment.price_procedure) -
                        Number(
                          appointment.appointment_credit
                            ? appointment.appointment_credit.approved_amount
                            : 0
                        )) +
                      ".00"
                    }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div
              v-if="
                (appointment.appointment_status.code ===
                  'CONFIRM_VALIDATION_APPOINTMENT' &&
                  appointment.payment_status.code ===
                    'PAYMENT_STATUS_NOT_PAID_VALORATION_APPOINTMENT') ||
                (appointment.appointment_status.code === 'CONFIRM_PROCEDURE' &&
                  appointment.payment_status.code ===
                    'PAYMENT_STATUS_NOT_PAID_PROCEDURE') ||
                (appointment.appointment_status?.code === 'PENDING_PROCEDURE' &&
                  appointment.payment_status?.code ===
                    'PAYMENT_STATUS_NOT_PAID_PROCEDURE')
              "
              class="mb-3"
            >
              <p class="mb-1 fw-bold">
                <strong>Información de métodos de Pago:</strong>
              </p>
              <div class="d-flex gap-2">
                <img
                  src="@/src/assets/check.svg"
                  width="20px"
                  class="mr-2"
                  alt="Vitalink"
                />
                <p class="ml-2 fw-bold mb-0">Pagar en línea con tarjeta.</p>
              </div>
              <p>Paga ahora de forma segura con tu tarjeta.</p>
              <div class="d-flex gap-2">
                <img src="@/src/assets/check.svg" class="mr-2" alt="Vitalink" />
                <p class="ml-2 fw-bold mb-0">Pagar en consulta.</p>
              </div>
              <p>Pagaras directamente el día de tu cita.</p>
            </div>
            <div
              v-if="
                appointment.appointment_status.code !==
                'VALUATION_PENDING_VALORATION_APPOINTMENT'
              "
              class="d-flex justify-content-between gap-2"
            >
              <button class="btn btn-outline-dark w-50" @click="step = 4">
                Anular cita
              </button>

              <div
                class="button-next"
                v-if="
                  Number(appointment.price_procedure) -
                    Number(
                      appointment.appointment_credit
                        ? appointment.appointment_credit.approved_amount
                        : 0
                    ) !==
                  0
                "
              >
                <button
                  v-if="
                    (appointment.appointment_status.code ===
                      'CONFIRM_VALIDATION_APPOINTMENT' &&
                      (appointment.payment_status.code ===
                        'PAYMENT_STATUS_NOT_PAID_VALORATION_APPOINTMENT' ||
                        appointment.payment_status.code ===
                          'PAYMENT_STATUS_NOT_PAID_PROCEDURE')) ||
                    (appointment.appointment_status.code ===
                      'CONFIRM_PROCEDURE' &&
                      appointment.payment_status.code ===
                        'PAYMENT_STATUS_NOT_PAID_PROCEDURE') ||
                    (appointment.appointment_status?.code ===
                      'PENDING_PROCEDURE' &&
                      appointment.payment_status?.code ===
                        'PAYMENT_STATUS_NOT_PAID_PROCEDURE')
                  "
                  class="btn btn-primary w-50"
                  @click="step = 2"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>

          <div v-if="step === 2">
            <div class="d-flex flex-column">
              <img
                src="@/src/assets/card.svg"
                width="24"
                class="mr-2"
                alt="Vitalink"
              />
              <h5 class="fw-bold">Detalles del pago</h5>
            </div>
            <p class="text-muted">Rellena los datos de tu tarjeta.</p>
            <form>
              <div class="row mb-3">
                <div class="col-8">
                  <label for="cardName" class="form-label">Nombre</label>
                  <input
                    type="text"
                    class="form-control"
                    id="cardName"
                    v-model="cardName"
                  />
                </div>
                <div class="col-4">
                  <label for="expiryDate" class="form-label">Vence</label>
                  <input
                    type="text"
                    class="form-control"
                    id="expiryDate"
                    v-model="expiryDate"
                  />
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-8">
                  <label for="cardNumber" class="form-label"
                    >Número de tarjeta</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="cardNumber"
                    v-model="cardNumber"
                  />
                </div>
                <div class="col-4">
                  <label for="cvv" class="form-label">CVV</label>
                  <input
                    type="text"
                    class="form-control"
                    id="cvv"
                    v-model="cvv"
                  />
                </div>
              </div>

              <div class="row mb-3">
                <div class="col-12">
                  <label for="email" class="form-label"
                    >Correo electrónico</label
                  >
                  <input
                    type="text"
                    class="form-control"
                    id="email"
                    v-model="email"
                  />
                </div>
              </div>
              <p class="fw-bold mb-0">Resumen de pago</p>
              <table class="table table-borderless">
                <tbody>
                  <tr>
                    <td><strong>Subtotal:</strong></td>
                    <td>
                      {{
                        appointment.appointment_type.code ==
                        "VALORATION_APPOINTMENT"
                          ? "₡" + appointment.price_valoration_appointment
                          : "₡" + appointment.price_procedure
                      }}
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Descuento:</strong></td>
                    <td>₡0</td>
                  </tr>
                  <tr
                    v-if="
                      appointment.appointment_type.code !==
                      'VALORATION_APPOINTMENT'
                    "
                  >
                    <td><strong>Monto del credito:</strong></td>
                    <td>
                      {{
                        appointment.appointment_credit?.credit_status.code ==
                          "APPROVED" ||
                        appointment.appointment_credit?.credit_status.code ==
                          "APPROVED_PERCENTAGE"
                          ? "-₡" +
                            appointment.appointment_credit?.approved_amount
                          : "₡0"
                      }}
                    </td>
                  </tr>
                  <tr class="total">
                    <td><strong>Saldo a pagar:</strong></td>
                    <td class="fw-bold">
                      {{ "₡" + balanceToPay(appointment) }}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div class="d-flex justify-content-between gap-2">
                <button class="btn btn-outline-dark w-50" @click="step = 1">
                  Atrás
                </button>
                <button
                  v-if="
                    appointment.appointment_status.code ===
                    'CONFIRM_VALIDATION_APPOINTMENT'
                  "
                  class="btn btn-primary w-50"
                  @click.prevent="processPayment"
                >
                  Pagar
                </button>
                <button
                  v-else-if="
                    appointment.appointment_status.code ===
                      'CONFIRM_PROCEDURE' ||
                    appointment.appointment_status.code === 'PENDING_PROCEDURE'
                  "
                  class="btn btn-primary w-50"
                  @click.prevent="processPaymentProcedure"
                >
                  Pagar
                </button>
                <button
                  v-if="balanceToPay(appointment) === 0"
                  class="btn btn-primary w-50"
                >
                  Confirmar Reserva
                </button>
              </div>
            </form>
          </div>

          <div v-if="step === 3">
            <img
              src="@/src/assets/check.svg"
              width="48"
              class="mr-2"
              alt="Vitalink"
            />
            <h2>¡Pago Exitoso y Cita Confirmada!</h2>
            <p class="mb-4">¡Todo está listo para tu consulta!</p>
            <p>
              <strong>Tipo de servicio:</strong>
              {{
                appointment.appointment_type.code == "VALORATION_APPOINTMENT"
                  ? "Cita de valoración"
                  : "Cita de procedimiento"
              }}
            </p>
            <p>
              <strong>Fecha de la cita:</strong>
              {{ appointment.appointment_date }}
            </p>
            <p>
              <strong>Hora de la cita:</strong>
              {{ appointment.appointment_hour }}
            </p>
            <p>
              <strong>Paciente titular:</strong>{{ appointment.customer.name }}
            </p>
            <p>
              <strong>Teléfono de Contacto:</strong>
              {{ appointment.phone_number }}
            </p>
            <p>
              <strong>Profesional Médico:</strong>
              {{ appointment.supplier.name }}
            </p>
            <p>
              <strong>Procedimiento:</strong
              >{{ appointment.package?.procedure.name }}
            </p>
            <p>
              <strong>Subtotal:</strong>
              {{
                appointment.appointment_type.code == "VALORATION_APPOINTMENT"
                  ? "₡" + appointment.price_valoration_appointment
                  : "₡" + appointment.price_procedure
              }}
            </p>

            <p>
              <strong>Monto Pagado:</strong>
              {{
                appointment.appointment_type.code == "VALORATION_APPOINTMENT"
                  ? "₡" + appointment.price_valoration_appointment
                  : "₡" + appointment.price_procedure
              }}
            </p>
            <div class="col-12 d-flex justify-content-between gap-2">
              <button
                class="btn btn-outline-dark me-2 text-sm w-50"
                @click="goToStep(1)"
              >
                Descargar comprobante
              </button>
              <button class="btn btn-primary w-50" @click="open = false">
                Ver en Citas
              </button>
            </div>
          </div>

          <div v-if="step === 4">
            <h5 class="fw-bold">¿Seguro que quieres cancelar esta cita?</h5>
            <p class="text-muted">
              Se le enviará un correo electrónico automático al usuario
              avisándole que su cita ha sido cancelada.
            </p>
            <div class="d-flex justify-content-between gap-2">
              <button class="btn btn-outline-dark w-50" @click="step = 1">
                No, volver
              </button>
              <button class="btn btn-danger w-50" @click="cancelAppointment">
                Sí, cancelar
              </button>
            </div>
          </div>

          <div v-if="step === 5">
            <h5 class="fw-bold">Detalles de la cita</h5>
            <table class="table table-borderless">
              <tbody>
                <tr>
                  <td><strong>Tipo de servicio:</strong></td>
                  <td>Cita de valoración</td>
                </tr>
                <tr>
                  <td><strong>Fecha de la cita:</strong></td>
                  <td>{{ formatDate(appointment.date) }}</td>
                </tr>
                <tr>
                  <td><strong>Hora de la cita:</strong></td>
                  <td>{{ appointment.hour }}</td>
                </tr>
                <tr>
                  <td><strong>Paciente titular:</strong></td>
                  <td>{{ appointment.patient_name }}</td>
                </tr>
                <tr>
                  <td><strong>Teléfono de Contacto:</strong></td>
                  <td>{{ appointment.phone }}</td>
                </tr>
                <tr>
                  <td><strong>Profesional Médico:</strong></td>
                  <td>{{ appointment.professional_name }}</td>
                </tr>
                <tr>
                  <td><strong>Estado:</strong></td>
                  <td>
                    <span
                      class="appointment-pay-modal__status"
                      :class="statusClass('Cancelada')"
                    >
                      Cancelada
                    </span>
                  </td>
                </tr>
                <tr>
                  <td><strong>Procedimiento:</strong></td>
                  <td>{{ appointment.notes }}</td>
                </tr>
                <tr>
                  <td><strong>Costo del servicio:</strong></td>
                  <td>{{ appointment.cost }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="modal-footer justify-content-center" v-if="errorText">
            <p class="text-danger">{{ errorText }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    class="modal fade"
    :class="{ show: showProcedureModal }"
    v-if="showProcedureModal"
    tabindex="-1"
    aria-labelledby="procedureModalLabel"
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
            @click="closeProcedureModal"
          ></button>
        </div>
        <div class="modal-body">
          <h5 class="fw-bold">Detalles del procedimiento</h5>
          <table class="table table-borderless">
            <tbody>
              <tr>
                <td><strong>Tipo de servicio:</strong></td>
                <td>Procedimiento médico</td>
              </tr>
              <tr>
                <td><strong>Fecha de la cita:</strong></td>
                <td>
                  {{
                    new Date(appointment.appointment_date).toLocaleDateString()
                  }}
                </td>
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
                  <span class="appointment-pay-modal__status"> Valorado </span>
                </td>
              </tr>
              <tr>
                <td><strong>Procedimiento:</strong></td>
                <td>{{ appointment.package?.procedure.name }}</td>
              </tr>
              <tr>
                <td><strong>Monto del procedimiento:</strong></td>
                <td>₡{{ appointment.price_procedure }}</td>
              </tr>
            </tbody>
          </table>

          <div class="d-flex justify-content-between gap-2 mt-4">
            <button
              class="btn btn-outline-primary w-100"
              @click="reserveProcedure"
              :disabled="isCreditDisabled"
            >
              Reservar el procedimiento
            </button>
            <button
              class="btn btn-primary w-100"
              @click="requestCredit"
              :disabled="isCreditDisabled"
            >
              Solicitar crédito
            </button>
          </div>

          <div v-if="procedureMessage" class="alert alert-info mt-3">
            {{ procedureMessage }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const token = useCookie("token");
const config = useRuntimeConfig();
import { computed, defineProps, ref } from "vue";
const props = defineProps(["appointment", "step", "showStatus"]);
const emit = defineEmits(["refresh"]);

const handleOpen = () => {
  open.value = true;
};

const open = ref(false);
const step = ref(1);
const errorText = ref("");
const cardName = ref("");
const cardNumber = ref("");
const expiryDate = ref("");
const cvv = ref("");
const email = ref("");

const showProcedureModal = ref(false);
const procedureMessage = ref("");

const isCreditDisabled = computed(() => {
  return (
    props.appointment.appointment_credit?.credit_status?.code === "REQUIRED"
  );
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const openProcedureModal = () => {
  showProcedureModal.value = true;
};

const closeProcedureModal = () => {
  showProcedureModal.value = false;
  procedureMessage.value = "";
};

const balanceToPay = (appointment) => {
  if (appointment.appointment_type.code == "VALORATION_APPOINTMENT") {
    return appointment.price_valoration_appointment;
  }
  return (
    appointment.price_procedure -
    0 - // Descuento (siempre 0 para MVP)
    (appointment.appointment_credit?.approved_amount || 0)
  );
};

const reserveProcedure = async () => {
  try {
    const { data, error } = await useFetch(
      config.public.API_BASE_URL + "/appointment/reserve_procedure",
      {
        method: "PUT",
        headers: { Authorization: token.value },
        params: {
          id: props.appointment.id,
        },
      }
    );

    if (data.value) {
      procedureMessage.value =
        "Procedimiento reservado exitosamente. El médico confirmará tu reserva.";
      emit("refresh");
      setTimeout(() => {
        closeProcedureModal();
      }, 2000);
    }

    if (error.value) {
      procedureMessage.value =
        "Error al reservar el procedimiento. Intenta nuevamente.";
      console.error("Error reserving procedure:", error.value);
    }
  } catch (err) {
    procedureMessage.value =
      "Error al reservar el procedimiento. Intenta nuevamente.";
    console.error("Error reserving procedure:", err);
  }
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

const requestCredit = async () => {
  try {
    const { data, error } = await useFetch(
      config.public.API_BASE_URL + "/appointmentcredit/add",
      {
        method: "POST",
        headers: { Authorization: token.value },
        body: {
          appointment: props.appointment.id,
          requested_amount: props.appointment.price_procedure,
        },
      }
    );

    if (data.value) {
      procedureMessage.value =
        "Solicitud de crédito enviada exitosamente. Esperando respuesta de la asociación solidarista.";
      emit("refresh");
      setTimeout(() => {
        closeProcedureModal();
      }, 2000);
    }

    if (error.value) {
      procedureMessage.value =
        "Error al solicitar el crédito. Intenta nuevamente.";
      console.error("Error requesting credit:", error.value);
    }
  } catch (err) {
    procedureMessage.value =
      "Error al solicitar el crédito. Intenta nuevamente.";
    console.error("Error requesting credit:", err);
  }
};

const processPayment = async () => {
  if (cardName.value && cardNumber.value && expiryDate.value && cvv.value) {
    errorText.value = "";
  } else {
    errorText.value = "Por favor, complete todos los campos.";
  }

  const { data, error } = await useFetch(
    config.public.API_BASE_URL +
      "/appointment/success_payment_valoration_appointment",
    {
      method: "PUT",
      headers: { Authorization: token.value },
      params: {
        id: props.appointment.id,
      },
      body: {
        payment_method_code: "ON_CONSULTATION",
      },
    }
  );
  if (data) {
    emit("refresh");
    step.value = 3;
  }
  if (error.value) {
    console.log(error.value, "data");
  }
};

const processPaymentProcedure = async () => {
  if (cardName.value && cardNumber.value && expiryDate.value && cvv.value) {
    errorText.value = "";
  } else {
    errorText.value = "Por favor, complete todos los campos.";
  }

  const { data, error } = await useFetch(
    config.public.API_BASE_URL + "/appointment/success_payment_procedure",
    {
      method: "PUT",
      headers: { Authorization: token.value },
      params: {
        id: props.appointment.id,
      },
      body: {
        payment_method_code: "ON_CONSULTATION",
      },
    }
  );
  if (data) {
    emit("refresh");
    step.value = 3;
  }
  if (error.value) {
    console.log(error.value, "data");
  }
};

const statusClass = (status) => {
  const statusMap = {
    CANCEL_APPOINTMENT: "appointment-pay-modal__status--cancelled",
    PENDING_VALORATION_APPOINTMENT: "appointment-pay-modal__status--warning",
    PENDING_PROCEDURE: "appointment-pay-modal__status--warning",
    CONFIRM_PROCEDURE: "appointment-pay-modal__status--primary",
    CONCRETED_APPOINTMENT: "appointment-pay-modal__status--primary",
    VALUED_VALORATION_APPOINTMENT: "appointment-pay-modal__status--success",
    CONFIRM_VALIDATION_APPOINTMENT: "appointment-pay-modal__status--success",
    VALUATION_PENDING_VALORATION_APPOINTMENT:
      "appointment-pay-modal__status--primary",
    WAITING_PROCEDURE: "appointment-pay-modal__status--warning",
  };
  return statusMap[status] || "";
};

const cancelAppointment = async () => {
  emit("refresh");
  step.value = 5;
};
</script>

<style lang="scss" scoped>
.appointment-pay-modal {
  &__button {
    &--outline {
      @include outline-button;
      font-weight: 600;
      font-size: 12px;
      line-height: 18px;
      padding: 8px 16px;
      width: 100%;
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
      background-color: rgba(#3541b4, 0.1);
    }

    &--cancelled {
      background-color: #fac6d0;
    }
  }

  &__button-item {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
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

.button-next {
  width: 100%;
}
</style>
