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
            Datos de la Cita
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
          <span>
            <div class="modal-body">
              <div
                class="bg-primary rounded-4 px-4 py-2"
                style="--bs-bg-opacity: 0.3"
              >
                <dl>
                  <dt class="text-white">Fecha</dt>
                  <dd class="text-primary fw-bold">
                    {{
                      new Date(appointment.date).toDateString() +
                      " a las " +
                      appointment.time_from
                    }}
                  </dd>
                </dl>
                <dl>
                  <dt class="text-white">Hospital o centro</dt>
                  <dd class="text-primary fw-bold">
                    {{ appointment.hospital_name }}
                  </dd>
                </dl>
                <dl>
                  <dt class="text-white">Especialidad / motivo</dt>
                  <dd class="text-primary fw-bold">
                    {{ appointment.service_name }}
                  </dd>
                </dl>
                <dl>
                  <dt class="text-white">Médico / Especialista</dt>
                  <dd class="text-primary fw-bold">
                    {{ appointment.doctor_name }}
                  </dd>
                </dl>
                <dl>
                  <dt class="text-white">Paciente titular</dt>
                  <dd class="text-primary fw-bold">
                    {{ appointment.patient_name }}
                  </dd>
                </dl>
                <!-- <dl>
                <dt class="text-white">Modelo de servicio</dt>
                <dd class="text-primary fw-bold">Seguro Médico: ASIS</dd>
              </dl> -->
                <!-- <dl>
                  <dt class="text-white">Precio Final del servicio</dt>
                  <dd class="text-primary fw-bold">
                    {{ parseFloat(result.price).toLocaleString() }}
                    {{ result.currency }}
                  </dd>
                </dl> -->
              </div>
            </div>
          </span>
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
