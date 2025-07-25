<template>
  <div
    class="modal fade"
    id="userModal"
    :class="open ? 'show' : ''"
    tabindex="-1"
    aria-labelledby="userModalLabel"
    aria-hidden="true"
    v-if="appointment"
  >
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content custom-modal">
        <div
          class="modal-header custom-header d-flex justify-content-between align-items-center"
        >
          <h5 class="fw-bold">Informacion del usuario</h5>
          <button
            type="button"
            class="btn-close custom-close"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="emit('close-modal')"
          ></button>
        </div>

        <div class="modal-body custom-body">
          <div class="profile-section form-group">
            <label>Foto de Perfil Publico</label>
            <div class="profile-image">
              <img src="@/src/assets/picture.svg" alt="Profile" />
            </div>
          </div>

          <div class="form-group">
            <label>Nombre y Apellido</label>
            <input type="text" :value="appointment.patient_name" disabled />
          </div>

          <div class="form-group">
            <label>Email</label>
            <input type="email" :value="appointment.patient_email" disabled />
          </div>

          <div class="form-group">
            <label>Número de teléfono</label>
            <input type="tel" :value="appointment.patient_phone" disabled />
          </div>

          <div class="form-group">
            <label>Dirección</label>
            <input type="text" :value="appointment.patient_address" disabled />
          </div>

          <div class="form-group d-flex gap-2 justify-content-between">
            <div class="col">
              <label>Código Postal</label>
              <input
                type="text"
                :value="appointment.patient_postal_code"
                disabled
              />
            </div>
            <div class="col">
              <label>Ciudad</label>
              <input type="text" :value="appointment.patient_city" disabled />
            </div>
            <div class="col">
              <label>País</label>
              <input
                type="text"
                :value="appointment.patient_country"
                disabled
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from "vue";
const emit = defineEmits(["close-modal"]);
const props = defineProps(["appointment", "open"]);
</script>

<style lang="scss" scoped>
.show {
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
}

.custom-modal {
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.custom-header {
  border-bottom: none;
  padding: 1rem;
}

.custom-close {
  background-color: transparent;
  border: none;
  font-size: 1.5rem;
  opacity: 0.7;
}

.custom-body {
  padding: 1rem;
}

.profile-section {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 20px;
  flex-direction: column;
}

.profile-image {
  border-radius: 18px;
  border: 3px solid var(--Primary-Gradients-Violet-02, #c2c6e9);
  background: #f8faff;
  width: 130px;
  height: 132px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-group {
  margin-bottom: 15px;

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 5px;
  }

  input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-sizing: border-box;
    background-color: #f9f9f9;
  }

  input:disabled {
    background-color: #f0f0f0;
    cursor: not-allowed;
  }
}
</style>
