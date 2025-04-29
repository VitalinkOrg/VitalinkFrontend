<template>
  <div v-if="isOpen" class="modal-overlay z-3">
    <div
      class="modal-content packs z-3"
      :class="{ confirmation: internalCurrentStep === 3 }"
    >
      <div class="modal-header">
        <h2 v-if="internalCurrentStep !== 3">Nuevo Servicio</h2>
        <button @click="closeMainModal">×</button>
      </div>
      <div class="modal-body">
        <WebsiteStepper
          v-if="internalCurrentStep !== 0 && internalCurrentStep !== 3"
          :steps="steps"
          :currentStep="internalCurrentStep"
        />
        <!-- Step 1: Display Plans -->
        <div v-if="internalCurrentStep === 0"></div>

        <!-- Step 2: Availability Section -->
        <div v-if="internalCurrentStep === 1">
          <div class="mb-4 rounded-4">
            <div class="card-body">
              <div class="form-group">
                <label>Nombre del Servicio</label>
                <input type="text" />
              </div>

              <div class="form-group">
                <label>Especialidad Medica</label>
                <select
                  id="disponibilidad"
                  class="form-select"
                  v-model="selectedSpecialty"
                  aria-describedby="especialidad-help"
                >
                  <option value="" disabled selected>
                    Buscar por especialidad
                  </option>
                  <option
                    v-for="specialty in specialties"
                    :key="specialty.code"
                    :value="specialty.code"
                  >
                    {{ specialty.name }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label>Escribe una breve descripcion</label>
                <textarea
                  type="text"
                  rows="5"
                  class="form-control bg-white text-dark"
                ></textarea>
              </div>

              <div class="form-group">
                <label>Selecciona un hospital de atencion</label>
                <p class="text-muted">
                  Indica el/los lugares donde tendrá disponibilidad este
                  servicio
                </p>

                <!-- Hospital inputs container -->
                <div class="hospital-inputs w-50">
                  <div
                    v-for="(hospital, index) in hospitals"
                    :key="index"
                    class="hospital-input-group"
                  >
                    <div class="d-flex mb-2">
                      <input
                        type="text"
                        class="form-control"
                        v-model="hospital.name"
                        placeholder="Nombre del hospital"
                      />
                      <button
                        class="btn ms-2"
                        @click="removeHospital(index)"
                        title="Eliminar"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>

                <button class="btn btn-info text-white" @click="addHospital">
                  Añadir Hospital de Atencion
                </button>
              </div>

              <div class="row mt-4">
                <div class="col-12 d-flex justify-content-end">
                  <button
                    class="btn btn-outline-dark me-2"
                    @click="closeConfirmationModal"
                  >
                    Cancelar
                  </button>
                  <button class="btn btn-primary" @click="goToStep(2)">
                    Continuar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Packs Configuration -->
        <div v-if="internalCurrentStep === 2">
          <div class="mb-4 rounded-4">
            <div class="card-body">
              <p class="fw-bold">Configura tus packs:</p>
              <p class="text-muted">
                Puedes agregar multiples packs a tu servicio
              </p>

              <!-- Display each pack -->
              <div
                v-for="(pack, packIndex) in packs"
                :key="packIndex"
                class="pack-container mb-4 p-3 border rounded"
              >
                <div
                  class="d-flex justify-content-between align-items-center mb-3"
                >
                  <h5 class="mb-0 text-muted">Pack {{ packIndex + 1 }}</h5>
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="removePack(packIndex)"
                  >
                    Eliminar Pack
                  </button>
                </div>

                <div class="form-group">
                  <label>Nombre</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="pack.name"
                    placeholder="Escribe aquí un nombre"
                  />
                </div>
                <div class="form-group">
                  <label>Incluye:</label>
                  <input
                    type="text"
                    class="form-control"
                    v-model="pack.services"
                    placeholder="Escribe aquí un nombre"
                  />
                </div>

                <div class="form-group">
                  <label>Establece el precio del servicio:</label>
                  <div class="input-group d-flex align-items-center gap-2">
                    <span class="text-muted mb-0 mr-2">Desde</span>
                    <div class="d-flex align-items-center">
                      <input
                        type="number"
                        v-model="pack.price"
                        placeholder="0.00"
                        class="form-control w-50"
                      />
                      <select
                        class="form-select"
                        v-model="pack.currency"
                        style="max-width: 100px"
                      >
                        <option
                          v-for="currency in currencies"
                          :key="currency.code"
                          :value="currency.code"
                        >
                          {{ currency.code }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label>Disponibilidad</label>
                  <p class="text-muted">
                    Selecciona los días y horarios disponibles para este pack
                  </p>

                  <div
                    v-for="(day, dayIndex) in weekDays"
                    :key="dayIndex"
                    class="day-selector mb-3 p-2"
                  >
                    <div class="d-flex align-items-center">
                      <div
                        class="form-check form-switch align-items-center d-flex gap-2"
                      >
                        <input
                          style="width: 40px; padding: 0.5rem"
                          class="form-check-reverse form-check-input rounded-5"
                          type="checkbox"
                          :id="`day-${packIndex}-${dayIndex}`"
                          v-model="pack.availability[dayIndex].active"
                        />
                        <label
                          class="form-check-label mb-0"
                          :for="`day-${packIndex}-${dayIndex}`"
                        >
                          {{ day }}
                        </label>
                      </div>
                    </div>

                    <div v-if="pack.availability[dayIndex].active" class="mt-2">
                      <!-- Time slot container -->
                      <div
                        v-for="(timeSlot, timeIndex) in pack.availability[
                          dayIndex
                        ].timeSlots"
                        :key="timeIndex"
                        class="d-flex gap-2 align-items-center mb-2 w-50"
                      >
                        <div class="time-input">
                          <label class="small">Desde</label>
                          <input
                            type="time"
                            class="form-control"
                            v-model="timeSlot.from"
                            placeholder="00:00"
                          />
                        </div>
                        <div class="time-input">
                          <label class="small">Hasta</label>
                          <input
                            type="time"
                            class="form-control"
                            v-model="timeSlot.to"
                            placeholder="00:00"
                          />
                        </div>
                        <button
                          class="btn btn-sm btn-outline-danger mt-3"
                          @click="
                            removeTimeSlot(
                              pack.availability[dayIndex].timeSlots,
                              timeIndex
                            )
                          "
                          title="Eliminar horario"
                        >
                          ×
                        </button>
                      </div>

                      <!-- Add time slot button -->
                      <button
                        class="btn btn-sm btn-outline-secondary mt-1"
                        @click="
                          addTimeSlot(pack.availability[dayIndex].timeSlots)
                        "
                      >
                        <i class="bi bi-plus-circle"></i> Añadir horario
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <button class="btn btn-outline-secondary" @click="addPack">
                + Agregar un pack
              </button>

              <div class="row mt-4">
                <div class="col-12 d-flex justify-content-end">
                  <button
                    class="btn btn-outline-dark me-2"
                    @click="goToStep(1)"
                  >
                    Volver
                  </button>
                  <button class="btn btn-primary" @click="saveService">
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="internalCurrentStep === 3">
          <div
            class="d-flex justify-content-center gap-2 rounded-circle w-100 p-3 my-3"
          >
            <img
              src="@/src/assets/check.svg"
              width="48"
              class="mr-2"
              alt="Vitalink"
            />
          </div>
          <h5 class="fw-bold text-center">Servicio creado exitosamente</h5>

          <p class="text-muted text-center">
            Tu servicio se creado correctamente, ahora puedes verlo y
            administrarlo en el menú de servicios.
          </p>

          <div class="d-flex justify-content-between gap-2">
            <NuxtLink href="/medicos/inicio" class="btn btn-outline-dark w-50">
              Ir al home</NuxtLink
            >

            <button class="btn btn-primary w-50" @click="closeMainModal">
              Ver en servicios
            </button>
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
</template>

<script>
export default {
  props: {
    isOpen: Boolean,
    specialties: Array,
    currentStep: {
      type: Number,
      default: 1, // Default value if no prop is passed
    },
  },
  data() {
    return {
      steps: ["Detalles", "Packs y precio"],
      internalCurrentStep: this.currentStep, // Initialize with the prop value
      isConfirmationModalOpen: false,
      selectedSpecialty: "",
      hospitals: [],
      packs: [],
      weekDays: [
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
        "Domingo",
      ],
      currencies: [
        { code: "USD", symbol: "$" },
        { code: "EUR", symbol: "€" },
        { code: "GBP", symbol: "£" },
        { code: "MXN", symbol: "$" },
        { code: "COP", symbol: "$" },
        { code: "ARS", symbol: "$" },
      ],
    };
  },
  watch: {
    // Watch for changes in the prop and update the internal state
    currentStep(newVal) {
      this.internalCurrentStep = newVal;
    },
  },
  methods: {
    openConfirmationModal() {
      this.$emit("confirm-exit");
    },
    closeConfirmationModal() {
      this.isConfirmationModalOpen = false;
    },
    closeMainModal() {
      this.isConfirmationModalOpen = false;
      this.$emit("close");
    },
    goToStep(step) {
      this.internalCurrentStep = step; // Update the internal state
      this.$emit("update:currentStep", step); // Emit an event to update the prop
    },
    // Add a new hospital input
    addHospital() {
      this.hospitals.push({ name: "" });
    },
    // Remove a hospital input at the specified index
    removeHospital(index) {
      this.hospitals.splice(index, 1);
    },
    // Add a new pack with default availability structure
    addPack() {
      const availability = this.weekDays.map(() => ({
        active: false,
        timeSlots: [{ from: "", to: "" }], // Initialize with one time slot
      }));

      this.packs.push({
        name: "",
        services: "",
        price: 0,
        currency: "USD", // Default currency
        availability,
      });
    },
    // Remove a pack at the specified index
    removePack(index) {
      this.packs.splice(index, 1);
    },
    // Add a new time slot to a specific day
    addTimeSlot(timeSlots) {
      timeSlots.push({ from: "", to: "" });
    },
    // Remove a time slot from a specific day
    removeTimeSlot(timeSlots, index) {
      // Don't remove if it's the only time slot
      if (timeSlots.length > 1) {
        timeSlots.splice(index, 1);
      }
    },
    // Save the service (placeholder for future implementation)
    saveService() {
      // Here you would typically save the data to your backend
      console.log("Service data:", {
        hospitals: this.hospitals,
        packs: this.packs,
      });

      // For now, just navigate to the confirmation step
      this.goToStep(3);
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
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
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

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 5px;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box;
  background-color: #f9f9f9;
}

.form-group input:disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
}

.hospital-input-group {
  margin-bottom: 10px;
}

.pack-container {
  background-color: #f9f9f9;
}

.day-selector {
  padding: 10px;
  border-radius: 5px;
}

.time-input {
  flex: 1;
}

.form-check-input {
  cursor: pointer;
  margin-top: 0;
}
</style>
