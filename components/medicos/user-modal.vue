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
        <div class="modal-header border-bottom align-items-center d-flex">
          <h1
            class="modal-title fs-5 fw-normal ms-2 mt-2"
            id="exampleModalLabel"
          >
            Información del usuario
          </h1>
          <button
            type="button"
            class="btn-close btn btn-light me-2"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="emit('close-modal')"
          ></button>
        </div>
        <div class="modal-body">
          <div>
            <div class="row">
              <div class="form-group mb-3">
                <label for="nombre" class="form-label text-capitalize"
                  >Nombre y Apellido</label
                >
                <input
                  type="text"
                  class="form-control"
                  placeholder="Escribe tu nombre"
                  name="nombre"
                  :value="appointment.patient_name"
                  id="nombre"
                  disabled
                />
              </div>
              <div class="form-group mb-3">
                <label for="nombre" class="form-label text-capitalize"
                  >Email</label
                >
                <input
                  type="email"
                  class="form-control"
                  placeholder="Escribe tu nombre"
                  name="nombre"
                  :value="appointment.patient_email"
                  id="nombre"
                  disabled
                />
              </div>
              <div class="form-group mb-3">
                <label
                  for="direccion"
                  class="form-label text-capitalize"
                  name="direccion"
                  >Dirección</label
                >
                <input
                  type="text"
                  placeholder="Dirección"
                  id="direccion"
                  name="direccion"
                  :value="appointment.patient_address"
                  class="form-control"
                  disabled
                />
              </div>
            </div>
            <div class="row row-cols-2">
              <div class="form-group mb-3">
                <label class="form-label text-capitalize" for="postal"
                  >Código Postal</label
                >
                <input
                  type="number"
                  placeholder="00000000"
                  id="postal"
                  name="postal"
                  class="form-control"
                  :value="appointment.patient_postal_code"
                  disabled
                />
              </div>
              <div class="form-group mb-3">
                <label class="form-label text-capitalize" for="ciudad"
                  >Ciudad*</label
                >
                <input
                  type="text"
                  placeholder="Ciudad"
                  id="ciudad"
                  name="ciudad"
                  class="form-control"
                  required
                  :value="appointment.patient_city"
                  disabled
                />
              </div>
            </div>
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
