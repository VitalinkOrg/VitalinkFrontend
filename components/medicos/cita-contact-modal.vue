<template>
  <div
    class="modal fade"
    id="appointment.id"
    :class="open ? 'show' : ''"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
    v-if="appointment"
  >
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <!-- Modal Header -->
        <div class="modal-header border-0 align-items-center d-flex">
          <img
            src="@/src/assets/call.svg"
            alt="Alerta"
            height="40px"
            width="40px"
          />
          <button
            type="button"
            class="btn-close btn btn-light me-2"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="emit('close-modal')"
          ></button>
        </div>

        <!-- Modal Body -->
        <div class="modal-body">
          <h5 class="fw-bold">Contacta con el paciente ahora:</h5>

          <!-- Mocked Information -->
          <div class="mt-3">
            <div class="d-flex justify-content-between">
              <div class="d-flex gap-2 w-50">
                <img
                  src="@/src/assets/globe.svg"
                  height="20px"
                  width="20px"
                  alt="Alerta"
                />
                <label class="form-check-label text-muted" for="tipo">
                  Tipo
                </label>
              </div>
              <div class="form-check">
                <label class="form-check-label" for="numeroCostaRica">
                  Número de Costa Rica
                </label>
              </div>
            </div>
            <div class="d-flex justify-content-between">
              <div class="d-flex gap-2 w-50">
                <img
                  src="@/src/assets/call-out.svg"
                  alt="Alerta"
                  height="20px"
                  width="20px"
                />
                <label class="form-check-label text-muted" for="tipo">
                  N° de teléfono
                </label>
              </div>
              <div class="form-check">
                <label class="form-check-label" for="numeroCostaRica">
                  (1555) 52184931545
                </label>
              </div>
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

console.log(props);
</script>

<style lang="scss" scoped>
.show {
  display: block;
  background-color: rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 1rem 1rem 0 1rem; /* Adjust padding to match the first modal */
}

.modal-body {
  padding: 1rem; /* Adjust padding to match the first modal */
}

.form-check {
  margin-bottom: 0.5rem; /* Add spacing between checkboxes */
}

.form-check-input {
  margin-right: 0.5rem; /* Add spacing between checkbox and label */
}
</style>
