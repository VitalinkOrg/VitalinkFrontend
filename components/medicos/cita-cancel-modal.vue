<script setup>
import { defineProps } from "vue";
const emit = defineEmits(["close-modal"]);
const props = defineProps(["appointment", "open"]);
</script>
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
        <div class="modal-header border-0 align-items-center d-flex">
          <img
            src="@/src/assets/trash.svg"
            alt="Alerta"
            style="height: 3rem"
          />
          <button
            type="button"
            class="btn-close btn btn-light me-2"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="emit('close-modal')"
          ></button>
        </div>
        <div class="modal-body">
          <h5 class="fw-bold">Seguro que quieres cancelar esta cita?</h5>
          <p>
            Se le enviará un correo electrónico automático al usuario avisándole
            que su cita ha sido cancelada.
          </p>
        </div>
        <div class="modal-footer">
          <div class="col">
            <button
              type="button"
              class="btn btn-white border w-100"
              data-bs-dismiss="modal"
              @click="emit('close-modal')"
            >
              No, volver
            </button>
          </div>
          <div class="col">
            <button
              type="button"
              class="btn btn-danger border w-100"
              data-bs-dismiss="modal"
              @click="emit('close-modal')"
            >
              Si, cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.show {
  display: block;
  background-color: rgba(0, 0, 0, 0.1);
}
</style>
