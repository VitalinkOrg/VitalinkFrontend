<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay">
      <div
        class="modal-content packs z-3"
        :class="{ confirmation: internalCurrentStep === 4 }"
      >
        <header v-if="internalCurrentStep != 4" class="modal-header">
          <h2>
            {{
              internalCurrentStep === 1
                ? "Packs de tratamientos"
                : "Solicitar cita de valoración"
            }}
          </h2>
          <button @click="openConfirmationModal">
            <AtomsIconsXIcon />
          </button>
        </header>
        <div class="modal-body">
          <WebsiteStepper
            v-if="internalCurrentStep !== 0 && internalCurrentStep !== 4"
            :steps="steps"
            :currentStep="internalCurrentStep"
          />
          <!-- Step 1: Display Plans -->
          <div v-if="internalCurrentStep === 0">
            <div class="container">
              <div class="row">
                <!-- Option 1 -->
                <div class="col-4">
                  <div class="custom-card">
                    <div class="card-header text-center">OPCIÓN 1</div>
                    <div class="card-body">
                      <h5 class="card-title">19.000 USD</h5>
                      <p class="card-text">Precio original 28.000 USD</p>
                      <p class="card-text rating">
                        <span class="icon">
                          <img
                            src="@/src/assets/star.svg"
                            alt="Busca centro medico"
                            class="img-fluid"
                          />
                        </span>
                        5.0 <span class="text-muted">(13 Reseñas)</span>
                      </p>
                      <ul class="list-group list-group-flush">
                        <li class="list-group-item">
                          <span class="icon">
                            <img
                              src="@/src/assets/check.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                          </span>
                          Cita de valoración
                        </li>
                        <li class="list-group-item">
                          <span class="icon">
                            <img
                              src="@/src/assets/check.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                          </span>
                          Medicamentos
                        </li>
                        <li class="list-group-item">
                          <span class="icon">
                            <img
                              src="@/src/assets/check.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                          </span>
                          Cita de seguimiento 1 mes después.
                        </li>
                      </ul>
                      <p class="text-muted">Próxima Disponibilidad:</p>
                      <p class="card-text availability">
                        <span class="availability-text">
                          <span class="icon">
                            <img
                              src="@/src/assets/calendar.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                          </span>
                          19/10/2024
                        </span>
                        <span class="time-text">
                          <span class="icon">
                            <img
                              src="@/src/assets/clock.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                          </span>
                          11:00 am
                        </span>
                      </p>
                      <button
                        @click="goToStep(1)"
                        class="btn btn-outline-primary"
                      >
                        Cita de valoración
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Option 2 -->
                <div class="col-4">
                  <div class="custom-card">
                    <div
                      class="card-header selected text-center d-flex gap-2 align-items-center justify-content-center"
                    >
                      <span>
                        <img
                          src="@/src/assets/crown.svg"
                          alt="Busca centro medico"
                          class="img-fluid"
                        />
                      </span>
                      <p class="m-0">OPCIÓN 2</p>
                    </div>
                    <div class="card-body">
                      <h5 class="card-title">23.000 USD</h5>
                      <p class="card-text">Precio original 28.000 USD</p>
                      <p class="card-text rating">
                        <span class="icon">
                          <img
                            src="@/src/assets/star.svg"
                            alt="Busca centro medico"
                            class="img-fluid"
                          />
                        </span>
                        5.0 <span class="text-muted">(13 Reseñas)</span>
                      </p>
                      <ul class="list-group list-group-flush">
                        <li class="list-group-item">
                          <span class="icon">
                            <img
                              src="@/src/assets/check.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                          </span>
                          Cita de valoración
                        </li>
                        <li class="list-group-item">
                          <span class="icon">
                            <img
                              src="@/src/assets/check.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                          </span>
                          Medicamentos
                        </li>
                        <li class="list-group-item">
                          <span class="icon">
                            <img
                              src="@/src/assets/check.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                          </span>
                          Cita de seguimiento 1 mes después.
                        </li>
                      </ul>
                      <p class="text-muted">Próxima Disponibilidad:</p>
                      <p class="card-text availability">
                        <span class="availability-text">
                          <span class="icon">
                            <img
                              src="@/src/assets/calendar.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                          </span>
                          19/10/2024
                        </span>
                        <span class="time-text">
                          <span class="icon">
                            <img
                              src="@/src/assets/clock.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                          </span>
                          11:00 am
                        </span>
                      </p>
                      <button
                        @click="goToStep(1)"
                        class="btn btn-outline-primary"
                      >
                        Cita de valoración
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Option 3 -->
                <div class="col-4">
                  <div class="custom-card">
                    <div class="card-header text-center">OPCIÓN 3</div>
                    <div class="card-body">
                      <h5 class="card-title">26.000 USD</h5>
                      <p class="card-text">Precio original 28.000 USD</p>
                      <p class="card-text rating">
                        <span class="icon">
                          <img
                            src="@/src/assets/star.svg"
                            alt="Busca centro medico"
                            class="img-fluid"
                          />
                        </span>
                        5.0 <span class="text-muted">(13 Reseñas)</span>
                      </p>
                      <ul class="list-group list-group-flush">
                        <li class="list-group-item">
                          <span class="icon">
                            <img
                              src="@/src/assets/check.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                          </span>
                          Cita con nutricionista
                        </li>
                        <li class="list-group-item">
                          <span class="icon">
                            <img
                              src="@/src/assets/check.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                          </span>
                          Cita con alergólogo
                        </li>
                        <li class="list-group-item">
                          <span class="icon">
                            <img
                              src="@/src/assets/cross.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                          </span>
                          Cita de seguimiento 1 mes después.
                        </li>
                      </ul>
                      <p class="text-muted">Próxima Disponibilidad:</p>
                      <p class="card-text availability">
                        <span class="availability-text">
                          <span class="icon">
                            <img
                              src="@/src/assets/calendar.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                          </span>
                          19/10/2024
                        </span>
                        <span class="time-text">
                          <span class="icon">
                            <img
                              src="@/src/assets/clock.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                          </span>
                          11:00 am
                        </span>
                      </p>
                      <button
                        @click="goToStep(1)"
                        class="btn btn-outline-primary"
                      >
                        Cita de valoración
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Availability Section -->
          <div v-if="internalCurrentStep === 1">
            <div class="card mb-4 rounded-4">
              <div class="card-body">
                <!-- Date Selection -->
                <div class="mb-4">
                  <h4 class="h6 fw-semibold">
                    Selecciona las fechas de preferencia
                  </h4>
                  <p class="text-muted m-0 mb-3">
                    Los días y horas que tengas disponibles para que lo tengamos
                    de referencia para poder concretar una cita con tu médico.
                  </p>
                  <div
                    class="d-flex justify-content-between align-items-center"
                  >
                    <h4 class="h6 fw-semibold mb-3">Seleccione una fecha</h4>
                    <div
                      class="calendar-container badge rounded-5 bg-primary text-primary p-2"
                      style="--bs-bg-opacity: 0.07"
                    >
                      <img
                        src="@/src/assets/calendar.svg"
                        alt="Busca centro medico"
                        class="img-fluid text-primary"
                      />
                      <div class="custom-select-wrapper">
                        <select
                          v-model="selectedMonth"
                          class="form-select badge bg-transparent border-0 shadow-none text-primary text-left text-start"
                          style="--bs-bg-opacity: 0.07"
                          @change="handleMonthChange"
                        >
                          <option :value="null" disabled selected>
                            Seleccione un mes
                          </option>
                          <option
                            v-for="month in months"
                            :key="month.value"
                            :value="month.value"
                          >
                            {{ month.label }}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div class="d-flex gap-2 overflow-auto pb-2">
                    <button
                      v-for="day in availableDays"
                      :key="day.date"
                      @click="selectDay(day.date)"
                      class="btn btn-outline-info d-flex flex-column align-items-center"
                      :class="{ active: localSelectedDay === day.date }"
                      style="
                        min-width: 60px;
                        padding: 8px 12px;
                        border-radius: 8px;
                      "
                    >
                      <span
                        class="small text-info"
                        :class="{ 'text-white': selectedDay === day.date }"
                      >
                        {{ day.day }}
                      </span>
                      <span
                        class="fw-semibold text-info"
                        :class="{ 'text-white': selectedDay === day.date }"
                        >{{ day.number }}
                      </span>
                    </button>
                  </div>
                </div>

                <!-- Time Selection -->
                <div v-if="localSelectedDay" class="mt-4">
                  <h4 class="h6 fw-semibold mb-3">Seleccione la hora</h4>
                  <div class="d-flex flex-wrap gap-2">
                    <button
                      v-for="(time, index) in availableHours"
                      :key="index"
                      @click="localSelectedHour = time"
                      class="btn btn-outline-info position-relative hover-info"
                      :class="{
                        'active border-info text-white hover-info':
                          localSelectedHour === time,
                      }"
                    >
                      {{ formatTime(time) }}
                    </button>
                  </div>
                </div>

                <div v-else class="text-muted mt-4">
                  Por favor seleccione una fecha para ver los horarios
                  disponibles
                </div>

                <!-- Reservation Button -->
                <div class="row mt-4">
                  <div class="col-12 d-flex justify-content-between">
                    <button
                      class="btn btn-primary w-50"
                      :disabled="!localSelectedHour"
                      @click="reserveAppointment"
                    >
                      Reservar Cita de valoración
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="internalCurrentStep === 2">
            <div class="card mb-4 rounded-4">
              <div class="card-body">
                <h4 class="h6 fw-semibold">
                  Completar Formulario antes de reservar
                </h4>
                <p class="text-muted">Agregar Descripción</p>
                <p class="text-muted">
                  Puedes agregar una descripción sobre la razón de tu reserva,
                  datos importantes que el médico deba tener en cuenta o los
                  síntomas y dolencias.
                </p>
                <textarea
                  v-model="description"
                  class="form-control mb-4"
                  rows="3"
                  placeholder="Escribe alguna descripción..."
                ></textarea>

                <h4 class="h6 fw-semibold">¿Para quién es la cita?</h4>
                <div class="form-check mb-3">
                  <input
                    v-model="appointmentFor"
                    class="form-check-input"
                    type="radio"
                    name="appointmentFor"
                    id="forMe"
                    value="me"
                  />
                  <label class="form-check-label" for="forMe"> Para mi </label>
                </div>
                <div class="form-check mb-4">
                  <input
                    v-model="appointmentFor"
                    class="form-check-input"
                    type="radio"
                    name="appointmentFor"
                    id="forSomeoneElse"
                    value="someoneElse"
                  />
                  <label class="form-check-label" for="forSomeoneElse">
                    Para otra persona
                  </label>
                </div>

                <h4 class="h6 fw-semibold">
                  Completa tu información de contacto
                </h4>
                <p class="text-muted">
                  Para asegurarnos de que podamos coordinar tu cita, necesitamos
                  tu número de teléfono.
                </p>
                <input
                  v-model="phoneNumber"
                  type="tel"
                  class="form-control mb-4"
                  placeholder="Número de Teléfono"
                />

                <h4 class="h6 fw-semibold">Resumen de pago:</h4>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Precio</span>
                  <span>₡18000</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span class="text-muted">Descuento</span>
                  <span>₡0</span>
                </div>
                <div class="d-flex justify-content-between mb-4">
                  <span class="text-muted">Precio Final</span>
                  <span>₡18000</span>
                </div>

                <div class="row mt-4">
                  <div class="col-12 d-flex justify-content-end">
                    <button
                      class="btn btn-primary w-50"
                      @click="continueToStep3"
                      :disabled="!isStep2Valid"
                    >
                      Continuar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="internalCurrentStep === 3">
            <div class="card mb-4 rounded-4">
              <div class="card-body">
                <h4 class="h6 fw-semibold">
                  Revisa los datos antes de confirmar la cita:
                </h4>
                <table class="table table-borderless">
                  <tbody>
                    <tr>
                      <td><strong>Tipo de servicio:</strong></td>
                      <td>{{ getSelectedServiceName }}</td>
                    </tr>
                    <tr>
                      <td><strong>Fecha de la cita:</strong></td>
                      <td>{{ formatDate(this.localSelectedDay) }}</td>
                    </tr>
                    <tr>
                      <td><strong>Hora de la cita:</strong></td>
                      <td>{{ formatTime(this.localSelectedHour) }}</td>
                    </tr>
                    <tr>
                      <td><strong>Paciente titular:</strong></td>
                      <td>{{ this.userInfo?.name || "N/A" }}</td>
                    </tr>
                    <tr>
                      <td><strong>Teléfono de Contacto:</strong></td>
                      <td>{{ this.phoneNumber }}</td>
                    </tr>
                    <tr>
                      <td><strong>Profesional Médico:</strong></td>
                      <td>{{ this.doctorInfo?.name || "N/A" }}</td>
                    </tr>
                    <tr>
                      <td><strong>Procedimiento:</strong></td>
                      <td>{{ getSelectedProcedureName }}</td>
                    </tr>
                    <tr>
                      <td><strong>Costo del servicio:</strong></td>
                      <td>₡18000</td>
                    </tr>
                  </tbody>
                </table>

                <div class="row mt-4">
                  <div class="col-12 d-flex justify-content-between">
                    <button
                      class="btn btn-outline-dark me-2 w-50"
                      @click="goToStep(2)"
                    >
                      Volver
                    </button>
                    <button
                      class="btn btn-primary w-50"
                      @click="confirmReservation"
                    >
                      {{ isLoading ? "Procesando..." : "Confirmar" }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-if="internalCurrentStep === 4">
            <div class="card mb-4 rounded-4">
              <div class="card-body">
                <div class="confirmation-container">
                  <div class="confirmation-content">
                    <div class="confirmation-header">
                      <h4 class="confirmation-title text-primary">
                        ¡Felicitaciones!
                      </h4>
                      <p class="confirmation-subtitle">
                        Te avisaremos cuando tu solicitud<br />de cita sea
                        aceptada
                      </p>
                    </div>
                    <div class="confirmation-details">
                      <div class="detail-item">
                        <span class="detail-label">Tipo de servicio:</span>
                        <span class="detail-value">{{
                          getSelectedServiceName
                        }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Fecha de la cita:</span>
                        <span class="detail-value">{{
                          formatDate(this.selectedDay)
                        }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Hora de la cita:</span>
                        <span class="detail-value">{{
                          formatTime(this.selectedHour)
                        }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Paciente titular:</span>
                        <span class="detail-value">{{
                          this.userInfo?.name || "N/A"
                        }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Teléfono de Contacto:</span>
                        <span class="detail-value">{{ this.phoneNumber }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Profesional Médico:</span>
                        <span class="detail-value">{{
                          this.doctorInfo?.name || "N/A"
                        }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Procedimiento:</span>
                        <span class="detail-value">{{
                          getSelectedProcedureName
                        }}</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Pago:</span>
                        <span class="detail-value">Pendiente</span>
                      </div>
                      <div class="detail-item">
                        <span class="detail-label">Monto a Pagar:</span>
                        <span class="detail-value">₡18000</span>
                      </div>
                    </div>
                    <div class="row mt-4">
                      <div class="col-12 d-flex justify-content-between">
                        <button
                          class="btn btn-outline-dark me-2 w-50"
                          @click="goToStep(1)"
                        >
                          Descargar comprobante
                        </button>
                        <NuxtLink
                          class="btn btn-primary w-50"
                          href="/pacientes/citas"
                        >
                          Ver En Citas
                        </NuxtLink>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <WebsiteReservarCancelModal
      :isOpen="isConfirmationModalOpen"
      @close="closeConfirmationModal"
      @confirm-exit="closeMainModal"
    />
  </Teleport>
</template>

<script>
export default {
  props: {
    selectedPackage: {
      type: Object,
      required: true,
    },
    selectedProcedureId: {
      type: String,
      required: true,
    },
    selectedSpecialtyId: {
      type: String,
      required: true,
    },
    userInfo: {
      type: Object,
      required: true,
    },
    doctorInfo: {
      type: Object,
      required: true,
    },
    selectedDay: {
      type: String,
      default: null,
    },
    selectedHour: {
      type: String,
      default: null,
    },
    isOpen: Boolean,
    currentStep: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      isConfirmationModalOpen: false,
      isLoading: false,
      selectedMonth: null,
      localSelectedDay: this.selectedDay,
      localSelectedHour: this.selectedHour,
      availableDays: [],
      availableHours: [],
      steps: ["1", "2", "3"],
      description: "",
      appointmentFor: "me",
      phoneNumber: "",
      months: [
        { value: 0, label: "Enero" },
        { value: 1, label: "Febrero" },
        { value: 2, label: "Marzo" },
        { value: 3, label: "Abril" },
        { value: 4, label: "Mayo" },
        { value: 5, label: "Junio" },
        { value: 6, label: "Julio" },
        { value: 7, label: "Agosto" },
        { value: 8, label: "Septiembre" },
        { value: 9, label: "Octubre" },
        { value: 10, label: "Noviembre" },
        { value: 11, label: "Diciembre" },
      ],
      availability: {
        "2025-01-10": ["09:00", "11:00", "14:00"],
        "2025-01-15": ["08:30", "10:30"],
        "2025-01-25": ["09:00", "13:00"],

        "2025-02-10": ["09:00", "10:00", "11:00", "14:00"],
        "2025-02-11": ["10:30", "12:00", "15:00"],
        "2025-02-12": ["08:00", "09:30", "11:00", "13:00", "16:00"],

        "2025-03-05": ["08:00", "12:00"],
        "2025-03-14": ["09:30", "11:00", "14:30"],
        "2025-03-28": ["10:00", "13:00", "16:00"],

        "2025-04-03": ["09:00", "10:00"],
        "2025-04-20": ["10:00", "11:30"],
        "2025-04-29": ["08:00", "13:00", "15:30"],

        "2025-05-06": ["08:30", "10:00"],
        "2025-05-18": ["09:00", "13:00", "15:00"],
        "2025-05-25": ["09:00", "11:00", "14:00"],

        "2025-06-08": ["09:00", "10:30"],
        "2025-06-17": ["11:00", "13:00"],
        "2025-06-25": ["10:30", "14:00"],

        "2025-07-07": ["08:30", "10:00", "16:00"],
        "2025-07-15": ["09:00", "12:00"],
        "2025-07-28": ["10:00", "13:00", "15:00"],

        "2025-08-05": ["09:00", "10:30", "14:00"],
        "2025-08-12": ["09:00", "11:00", "13:30"],
        "2025-08-27": ["08:00", "10:00", "12:00"],

        "2025-09-02": ["09:00", "11:30"],
        "2025-09-13": ["10:00", "13:00"],
        "2025-09-21": ["07:00", "08:30"],

        "2025-10-06": ["08:00", "09:30"],
        "2025-10-20": ["10:00", "12:00", "14:00"],
        "2025-10-30": ["09:00", "10:00", "14:00"],

        "2025-11-01": ["08:30", "11:00"],
        "2025-11-11": ["09:30", "12:00"],
        "2025-11-19": ["10:00", "14:00", "16:00"],

        "2025-12-05": ["09:00", "10:30", "12:00"],
        "2025-12-15": ["08:00", "09:00", "11:00"],
        "2025-12-24": ["10:00", "11:30", "13:00"],
      },

      internalCurrentStep: this.currentStep || 1,
    };
  },
  computed: {
    debugButtonDisabled() {
      const disabled = !this.selectedHour;
      return disabled;
    },
    isStep2Valid() {
      return this.appointmentFor && this.phoneNumber.trim() !== "";
    },
    getSelectedServiceName() {
      try {
        if (!this.doctorInfo?.services || !this.selectedSpecialtyId) {
          return "N/A";
        }
        const service = this.doctorInfo.services.find(
          (service) =>
            service.medical_specialty?.id === this.selectedSpecialtyId
        );
        return service?.medical_specialty?.name || "N/A";
      } catch (error) {
        console.error("Error getting service name:", error);
        return "N/A";
      }
    },
    getSelectedProcedureName() {
      try {
        if (!this.doctorInfo?.services || !this.selectedProcedureId) {
          return "N/A";
        }
        const allProcedures = this.doctorInfo.services.flatMap(
          (service) => service.procedures || []
        );
        const procedure = allProcedures.find(
          (procedure) => procedure.procedure?.id === this.selectedProcedureId
        );
        return procedure?.procedure?.name || "N/A";
      } catch (error) {
        console.error("Error getting procedure name:", error);
        return "N/A";
      }
    },
  },
  watch: {
    currentStep: {
      handler(newVal) {
        this.internalCurrentStep = newVal;
      },
      immediate: true,
    },
    internalCurrentStep(newVal) {},
    // Limpiar datos cuando el modal se cierra
    isOpen: {
      handler(newVal) {
        if (!newVal) {
          // Cuando el modal se cierra, limpiar los datos después de un pequeño delay
          // para evitar que se vea el reseteo antes de que el modal se cierre
          setTimeout(() => {
            this.resetModalData();
          }, 300);
        }
      },
      immediate: false,
    },
  },
  methods: {
    openConfirmationModal() {
      this.isConfirmationModalOpen = true;
    },
    closeConfirmationModal() {
      this.isConfirmationModalOpen = false;
    },
    resetModalData() {
      this.description = "";
      this.appointmentFor = "me";
      this.phoneNumber = "";

      this.selectedMonth = null;
      this.localSelectedDay = null;
      this.localSelectedHour = null;
      this.availableDays = [];
      this.availableHours = [];

      this.internalCurrentStep = 1;

      this.isConfirmationModalOpen = false;
    },

    closeMainModal() {
      this.resetModalData();
      this.$emit("close");
    },
    goToStep(step) {
      this.internalCurrentStep = step;
      this.$emit("update:currentStep", step);
    },
    continueToStep3() {
      if (this.isStep2Valid) {
        this.$emit("update:selectedDay", this.localSelectedDay);
        this.$emit("update:selectedHour", this.localSelectedHour);
        this.goToStep(3);
      }
    },
    handleMonthChange() {
      this.localSelectedDay = null;
      this.localSelectedHour = null;
      this.availableHours = [];
      this.availableDays = this.getAvailableDaysForMonth(this.selectedMonth);
    },
    getAvailableDaysForMonth(month) {
      const year = new Date().getFullYear();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const availableDays = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateString = date.toISOString().split("T")[0];

        if (date >= today && this.availability[dateString]) {
          availableDays.push({
            date: dateString,
            day: date
              .toLocaleDateString("es-ES", { weekday: "short" })
              .slice(0, 3),
            number: date.getDate(),
          });
        }
      }

      return availableDays;
    },
    selectDay(date) {
      this.localSelectedDay = date;
      this.localSelectedHour = null;
      this.availableHours = this.availability[date] || [];
    },
    reserveAppointment() {
      if (this.localSelectedHour && this.localSelectedDay) {
        this.goToStep(2);
      }
    },
    formatTime(time) {
      if (!time || typeof time !== "string") {
        return "N/A";
      }
      try {
        const [hours, minutes] = time.split(":");
        if (!hours || !minutes) {
          return "N/A";
        }
        const numHours = parseInt(hours, 10);
        const period = numHours >= 12 ? "PM" : "AM";
        const displayHours = numHours % 12 || 12;
        return `${displayHours}:${minutes} ${period}`;
      } catch (error) {
        console.error("Error formatting time:", error);
        return "N/A";
      }
    },
    formatDate(dateString) {
      if (!dateString || typeof dateString !== "string") {
        return "N/A";
      }
      try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          return "N/A";
        }
        return date.toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
        });
      } catch (error) {
        console.error("Error formatting date:", error);
        return "N/A";
      }
    },
    async confirmReservation() {
      if (!this.isOpen) {
        console.warn("Modal no abierto. Cancelando POST.");
        return;
      }

      if (!this.doctorInfo?.id) {
        console.error("Doctor ID is missing");
        alert(
          "Error: Información del doctor no disponible. Por favor, intente nuevamente."
        );
        return;
      }

      if (!this.selectedPackage?.id) {
        console.error("Package ID is missing");
        alert(
          "Error: Información del paquete no disponible. Por favor, intente nuevamente."
        );
        return;
      }

      if (!this.localSelectedDay || !this.localSelectedHour) {
        alert(
          "Error: Fecha u hora no seleccionada. Por favor, complete la información."
        );
        return;
      }

      const token = useCookie("token");
      const config = useRuntimeConfig();
      const user_info = useCookie("user_info");

      this.isLoading = true;

      try {
        const formattedHour = this.localSelectedHour.includes(":")
          ? this.localSelectedHour.split(":").length === 2
            ? `${this.localSelectedHour}:00`
            : this.localSelectedHour
          : `${this.localSelectedHour}:00:00`;

        const payload = {
          customer_id: user_info.value?.id || "",
          appointment_date: this.localSelectedDay,
          appointment_hour: formattedHour,
          supplier_id: this.doctorInfo.id,
          package_id: 4,
          user_description: this.description || "Consulta general preventiva.",
          is_for_external_user: this.appointmentFor === "someoneElse",
          phone_number_external_user: this.phoneNumber,
        };

        const response = await $fetch(
          config.public.API_BASE_URL + "/appointment/add",
          {
            method: "POST",
            body: payload,
            headers: { Authorization: token.value },
          }
        );

        console.log("Appointment created successfully:", response);
        this.goToStep(4);
      } catch (error) {
        console.error("Error creating appointment:", error);
        console.error("Payload que causó el error:", payload);

        let errorMessage =
          "Error al crear la cita. Por favor, intente nuevamente.";

        if (error.response?.status === 400) {
          errorMessage =
            "Datos inválidos. Por favor, verifique la información ingresada.";
        } else if (error.response?.status === 401) {
          errorMessage =
            "Sesión expirada. Por favor, inicie sesión nuevamente.";
        } else if (error.response?.status === 500) {
          errorMessage = "Error del servidor. Por favor, intente más tarde.";
        }

        alert(errorMessage);
      } finally {
        this.isLoading = false;
      }
    },
    resetModalData() {
      this.description = "";
      this.appointmentFor = "me";
      this.phoneNumber = "";

      this.selectedMonth = null;
      this.localSelectedDay = null;
      this.localSelectedHour = null;
      this.availableDays = [];
      this.availableHours = [];

      this.internalCurrentStep = 1;

      this.isConfirmationModalOpen = false;

      this.isLoading = false;
    },
  },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 900px;
  width: 100%;
  height: 98vh;
  overflow-y: auto;
}

.modal-content.confirmation {
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.day-container {
  display: flex;
  /* margin-top: 20px; */
}

.nav-link.info {
  color: #0cadbb;
}

.day {
  width: 41px;
  height: 40px;
  text-align: center;
  line-height: 40px;
  background-color: #f0f0f0;
  border-radius: 5px;
  margin: 10px;
}

.day-active {
  background-color: #007bff;
  color: white;
}

.hour {
  width: auto;
  height: 40px;
  text-align: center;
  line-height: 40px;
  background-color: #f0f0f0;
  border-radius: 5px;
  margin: 10px;
}

.hour > span {
  padding: 16px;
}

.custom-card {
  border: 1px solid var(--Gray-Scale-300, #f1f3f7);
  background: var(--Gray-Scale-White, #fff);
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.08);
}

.custom-card .card-header {
  font-weight: bold;
  padding: 15px;
  background: linear-gradient(
    188deg,
    #f8faff 65.03%,
    rgba(248, 250, 255, 0.1) 112.13%
  );
  border: none;
}

.custom-card .card-header.selected {
  background: linear-gradient(
    180deg,
    #fffcf5 70.16%,
    rgba(255, 252, 245, 0.05) 100%
  );
}

.custom-card .card-body {
  padding: 20px;
}

.custom-card .card-title {
  font-size: 1.5em;
  margin-bottom: 10px;
}

.custom-card .card-text {
  margin-bottom: 10px;
}

.custom-card .list-group-item {
  border: none;
  padding-left: 0;
  padding-right: 0;
}

.custom-card .btn {
  width: 100%;
  margin-top: 15px;
}

.custom-card .rating .icon {
  color: #ffc107;
}

.custom-card .icon {
  margin-right: 5px;
}

.availability {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.availability .availability-text,
.availability .time-text {
  display: flex;
  align-items: center;
}

.availability .icon {
  margin-right: 5px;
}

.btn-outline-primary {
  border-color: #dee2e6;
  color: #6c757d;
}

.btn-outline-primary:hover {
  border-color: #0d6efd;
  background-color: rgba(13, 110, 253, 0.05);
}

.btn-outline-primary.active {
  background-color: rgba(13, 110, 253, 0.1);
  border-color: #0d6efd;
  color: #0d6efd;
}

.btn-outline-primary.active span {
  color: #0d6efd;
}

.day-container {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.day-container::-webkit-scrollbar {
  height: 4px;
}

.day-container::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.day-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

.day-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

.btn-outline-info:hover .text-info {
  color: white !important;
}

.hover-info:hover {
  color: white !important;
}

/* Ensure text is white when active (selected) */
.active .text-info {
  color: white !important;
}

select {
  appearance: none; /* Remove default arrow */
  -webkit-appearance: none; /* For Safari */
  -moz-appearance: none; /* For Firefox */
  background-image: none; /* Remove any background image */
  padding-right: 1rem; /* Add padding to prevent text overlap */
}

/* Optional: Add a custom arrow if needed */
.custom-select-wrapper {
  position: relative;
  display: inline-block;
}

.custom-select-wrapper::after {
  content: ""; /* Custom arrow */
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none; /* Ensure clicks go to the select element */
  color: #000; /* Arrow color */
}
.confirmation-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%; /* Or adjust as needed */
}

.confirmation-content {
  background-color: white;
  border-radius: 8px;
  padding: 30px;
  text-align: left; /* Align text to the left */
}

.confirmation-header {
  text-align: center;
  margin-bottom: 20px;
}

.confirmation-icon {
  width: 80px;
  height: 80px;
  margin-bottom: 10px;
}

.confirmation-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.confirmation-subtitle {
  font-size: 16px;
  color: #666;
}

.confirmation-details {
  margin-bottom: 30px;
}

.detail-item {
  display: flex;
  margin-bottom: 10px;
}

.detail-label {
  font-weight: bold;
  width: 150px; /* Adjust width as needed */
  color: #333;
}

.detail-value {
  color: #666;
}

.confirmation-buttons {
  display: flex;
  justify-content: space-between;
}

.confirmation-button-download,
.confirmation-button-view {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
}

.confirmation-button-download {
  background-color: #eee;
  color: #333;
}

.confirmation-button-view {
  background-color: #007bff;
  color: white;
}
</style>
