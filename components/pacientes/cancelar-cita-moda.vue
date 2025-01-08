<template>
  <!-- Button trigger modal -->
  <AtomsIconsTrashIcon @click="open = true" class="cursor-pointer" />
  <!-- Modal -->
  <div
    class="modal fade"
    id="appointment.id"
    :class="open ? 'show' : ''"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header border-0 align-items-center d-flex">
          <img src="@/src/assets/trash.svg" alt="Alerta" style="height: 3rem" />
          <button
            type="button"
            class="btn-close btn btn-light me-2"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="open = false"
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
              @click="open = false"
            >
              No, volver
            </button>
          </div>
          <div class="col">
            <button
              type="button"
              class="btn btn-danger border w-100"
              data-bs-dismiss="modal"
              @click="cancelAppointment"
            >
              Si, cancelar
            </button>
          </div>
        </div>
        <div class="modal-footer justify-content-center" v-if="errorText">
          <p>{{ errorText }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps } from "vue";
const props = defineProps(["appointment"]);
const config = useRuntimeConfig();
const token = useCookie("token");
const open = ref(false);
const errorText = ref(null);
const cancelAppointment = async () => {
  const { data, error } = await useFetch(
    "https://stg.vitalink.cr" + "/appointments/" + props.appointment.id,
    {
      method: "PUT",
      headers: { Authorization: token.value },
      body: {
        status: "CANCELED",
      },
    }
  );
  if (data.value) {
    open.value = false;
  }
  if (error.value) {
    console.log(error.value, "data");
    errorText.value = error.value.data.info;
  }
};
</script>

<style lang="scss" scoped>
.show {
  display: block;
  background-color: rgba(0, 0, 0, 0.1);
}
.stepper {
  &-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 2rem;
    &-icon {
      font-size: 2rem;
    }
  }
}
</style>
