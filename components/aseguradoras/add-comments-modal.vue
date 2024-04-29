<script setup>
import { defineProps } from "vue";
const emit = defineEmits(["close-modal"]);
const props = defineProps(["voucher", "open"]);
</script>
<template>
  <div
    class="modal fade"
    id="voucher"
    :class="open ? 'show' : ''"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
    v-if="voucher"
  >
    <div
      class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable bg-transparent"
    >
      <div class="modal-content">
        <div class="modal-header align-items-center d-flex">
          <h1
            class="modal-title fs-5 fw-normal ms-2 mt-2"
            id="exampleModalLabel"
          >
            Agregar comentarios
          </h1>
          <button
            type="button"
            class="btn-close btn btn-light me-2"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="emit('close-modal')"
          ></button>
        </div>
        <div class="modal-body bg-light m-3">
          <label for="" class="form-label text-capitalize fw-normal">Descripción</label>
          <textarea
            type="text"
            class="form-control"
            placeholder="Escribe una descripción"
            id="email"
            rows="4"
            required
          ></textarea>
        </div>
        <div class="modal-footer">
          <div class="col">
            <button
              type="button"
              class="btn btn-white border w-100"
              data-bs-dismiss="modal"
              @click="emit('close-modal')"
            >
              Cancelar
            </button>
          </div>
          <div class="col">
            <button
              type="button"
              class="btn btn-primary border w-100"
              data-bs-dismiss="modal"
              @click="emit('close-modal')"
            >
              Guardar
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
