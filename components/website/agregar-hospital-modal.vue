<template>
  <div v-if="isOpen" class="modal-overlay z-3">
    <div
      class="modal-content packs z-3"
      :class="{ confirmation: internalCurrentStep === 3 }"
    >
      <div class="modal-header">
        <h2 v-if="internalCurrentStep !== 3">
          {{
            hospitalInfo
              ? "Editar Hospital o Clínica"
              : "Añade un Hospital o Clínica"
          }}
        </h2>
        <button @click="closeMainModal">×</button>
      </div>
      <div class="modal-body">
        <!-- Step 1: Display Plans -->
        <div v-if="internalCurrentStep === 0"></div>

        <!-- Step 2: Availability Section -->
        <div v-if="internalCurrentStep === 1">
          <div class="mb-4 rounded-4">
            <div class="card-body">
              <div class="form-group">
                <label class="mb-2">Buscar por nombre</label>
                <div
                  class="input-group shadow-sm mb-2"
                  style="flex-wrap: nowrap"
                >
                  <span
                    class="input-group-text bg-transparent border-end-0 rounded-start-3"
                    id="basic-addon1"
                  >
                    <AtomsIconsSearchIcon />
                  </span>
                  <input
                    type="text"
                    class="form-control border-start-0 rounded-end-3"
                    placeholder="Buscar por nombre"
                    aria-label="Buscar"
                    aria-describedby="basic-addon1"
                    v-model="searchQuery"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>O escribe el nombre del Hospital</label>
                <input type="text" v-model="formData.name" />
              </div>
              <div class="form-group d-flex gap-2 justify-content-between">
                <div class="col">
                  <label>Dirección física</label>
                  <input type="text" v-model="formData.address" />
                </div>
                <div class="col">
                  <label>Nº de calle</label>
                  <input type="text" v-model="formData.streetNumber" />
                </div>
              </div>
              <div class="form-group d-flex gap-2 justify-content-between">
                <div class="col">
                  <label>Código Postal</label>
                  <input type="text" v-model="formData.postalCode" />
                </div>
                <div class="col">
                  <label>Ciudad *</label>
                  <input type="text" v-model="formData.city" />
                </div>
                <div class="col">
                  <label>País *</label>
                  <input type="text" v-model="formData.country" />
                </div>
              </div>
              <div class="form-group d-flex gap-2 justify-content-between">
                <div class="col">
                  <label>Piso</label>
                  <input type="text" v-model="formData.floor" />
                </div>
                <div class="col">
                  <label>Nº de puerta</label>
                  <input type="text" v-model="formData.doorNumber" />
                </div>
              </div>

              <div class="row mt-4">
                <div class="col-12 d-flex">
                  <button
                    class="btn btn-primary w-100"
                    @click="hospitalInfo ? editHospital() : addHospital()"
                  >
                    {{ hospitalInfo ? "Guardar cambios" : "Agregar" }}
                  </button>
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
</template>

<script>
export default {
  props: {
    isOpen: Boolean,
    hospitalInfo: {
      type: Object,
      default: null,
    },
    currentStep: {
      type: Number,
      default: 1,
    },
  },
  data() {
    return {
      internalCurrentStep: this.currentStep,
      isConfirmationModalOpen: false,
      searchQuery: "",
      formData: {
        name: "",
        address: "",
        streetNumber: "",
        postalCode: "",
        city: "",
        country: "",
        floor: "",
        doorNumber: "",
      },
    };
  },
  watch: {
    currentStep(newVal) {
      this.internalCurrentStep = newVal;
    },
    hospitalInfo: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          // Fill the form with existing hospital data
          this.formData = {
            name: newVal.name || "",
            address: newVal.address || "",
            streetNumber: newVal.streetNumber || "",
            postalCode: newVal.postalCode || "",
            city: newVal.city || "",
            country: newVal.country || "",
            floor: newVal.floor || "",
            doorNumber: newVal.doorNumber || "",
          };
        } else {
          // Reset the form for new hospital
          this.resetForm();
        }
      },
    },
  },
  methods: {
    resetForm() {
      this.formData = {
        name: "",
        address: "",
        streetNumber: "",
        postalCode: "",
        city: "",
        country: "",
        floor: "",
        doorNumber: "",
      };
      this.searchQuery = "";
    },
    openConfirmationModal() {
      this.$emit("confirm-exit");
    },
    closeConfirmationModal() {
      this.isConfirmationModalOpen = false;
    },
    closeMainModal() {
      this.isConfirmationModalOpen = false;
      this.resetForm();
      this.$emit("close");
    },
    goToStep(step) {
      this.internalCurrentStep = step;
      this.$emit("update:currentStep", step);
    },
    addHospital() {
      // Emit an event with the new hospital data
      this.$emit("add-hospital", this.formData);
      this.resetForm();
      this.closeMainModal();
    },
    editHospital() {
      // Emit an event with the updated hospital data
      this.$emit("edit-hospital", {
        ...this.hospitalInfo, // keep original ID and other fields
        ...this.formData, // update with new data
      });
      this.closeMainModal();
    },
  },
};
</script>

<style scoped>
/* Your existing styles remain the same */
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
