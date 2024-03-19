<script setup>
import { ref, defineProps } from "vue";
import { useStore } from "~/store";
const config = useRuntimeConfig();
const token = useCookie("token");
const store = useStore();
const user = store.user;
const props = defineProps(["open", "appointment", "result"]);
const step = ref(4);
const route = useRoute();
const errorText = ref(null);

const createAppointment = async () => {
  const { data, error } = await useFetch(
    config.public.API_BASE_URL + "/appointments",
    {
      method: "POST",
      headers: { Authorization: token.value },
      body: {
        date: props.appointment.date,
        time_from: props.appointment.time,
        time_to: "13:00",
        state: "pending",
        service_code: props.result.service_code,
        specialty_code: props.result.specialty_code,
        cpt_code: props.result.cpt_code,
        hospital_id: props.result.hospital_id,
        doctor_id: Number(route.params.doctor),
        patient_id: user.id,
        is_in_person: 1,
      },
    }
  );
  if (data.value) {
    step.value = 5;
  }
  if (error.value) {
    console.log(error.value, "data");
    errorText.value = error.value.data.info;
  }
};
</script>
<template>
  <div
    class="modal fade"
    :class="open ? 'show' : ''"
    id="exampleModal"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div
      class="modal-dialog modal-dialog-centered modal-dialog-scrollable"
      :class="step !== 5 ? 'modal-xl' : ''"
    >
      <div class="modal-content">
        <div class="modal-header border-bottom align-items-center d-flex">
          <h1
            class="modal-title fs-4 fw-normal ms-2 mt-2"
            id="exampleModalLabel"
          >
            Reservar una Cita
          </h1>
          <button
            type="button"
            class="btn-close btn btn-light me-2"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="$emit('close-modal')"
          ></button>
        </div>
        <!-- Step 4 -->
        <div class="modal-body" v-if="step === 4">
          <p class="my-4 fw-medium ps-4">
            Revisa los datos antes de confirmar la cita:
          </p>
          <div class="border p-3 rounded-4">
            <dl>
              <dt>Fecha</dt>
              <dd>{{ new Date(appointment.date).toDateString() + ' a las ' + appointment.time }}</dd>
            </dl>
            <dl>
              <dt>Hospital o centro</dt>
              <dd>{{ appointment.location }}</dd>
            </dl>
            <dl>
              <dt>Especialidad / motivo</dt>
              <dd>{{ appointment.service }}</dd>
            </dl>
            <dl v-if="result.doctor_name">
              <dt>Médico / Especialista</dt>
              <dd>{{ result.doctor_name }}</dd>
            </dl>
            <dl>
              <dt>Paciente titular</dt>
              <dd>{{ user.first_name + " " + user.last_name }}</dd>
            </dl>
            <!-- <dl>
              <dt>Modelo de servicio</dt>
              <dd></dd>
            </dl> -->
            <dl>
              <dt>Precio Final del servicio</dt>
              <dd>
                {{ parseFloat(result.price).toLocaleString() }}
                {{ result.currency }}
              </dd>
            </dl>
          </div>
        </div>
        <div v-if="step === 4">
          <div class="modal-footer">
            <div class="col">
              <button
                type="button"
                class="btn btn-white border w-100 btn-lg"
                data-bs-dismiss="modal"
                @click="$emit('close-modal')"
              >
                Salir
              </button>
            </div>
            <div class="col">
              <button
                type="button"
                class="btn btn-primary w-100 btn-lg"
                @click="createAppointment"
              >
                Confirmar Reservar
              </button>
            </div>
          </div>
          <div class="modal-footer justify-content-center" v-if="errorText">
            <p>{{ errorText }}</p>
          </div>
        </div>

        <!-- Step 5 -->
        <span v-if="step === 5">
          <div class="modal-body">
            <div class="text-center">
              <img
                src="@/src/assets/img-fuegos-artificiales-felicidades.svg"
                alt="Felicidades"
                style="height: 3rem"
              />
              <div class="text-primary fs-5 fw-semibold">Felicidades!</div>
            </div>

            <div
              class="bg-primary rounded-4 px-4 py-2"
              style="--bs-bg-opacity: 0.3"
            >
              <dl>
                <dt class="text-white">Fecha</dt>
                <dd class="text-primary fw-semibold">
                  Martes 26 Septiembre de 2023 a las 09:00 am.
                </dd>
              </dl>
              <dl>
                <dt class="text-white">Hospital o centro</dt>
                <dd class="text-primary fw-semibold">Hospital San José</dd>
              </dl>
              <dl>
                <dt class="text-white">Especialidad / motivo</dt>
                <dd class="text-primary fw-semibold">Operación de cataratas</dd>
              </dl>
              <dl>
                <dt class="text-white">Médico / Especialista</dt>
                <dd class="text-primary fw-semibold">Stephanie Powell</dd>
              </dl>
              <dl>
                <dt class="text-white">Paciente titular</dt>
                <dd class="text-primary fw-semibold">Ana Lorens</dd>
              </dl>
              <dl>
                <dt class="text-white">Modelo de servicio</dt>
                <dd class="text-primary fw-semibold">Seguro Médico: ASIS</dd>
              </dl>
              <dl>
                <dt class="text-white">Precio Final del servicio</dt>
                <dd class="text-primary fw-semibold">¢23000.00</dd>
              </dl>
            </div>
          </div>
          <div class="modal-footer">
            <div class="col">
              <button
                type="button"
                class="btn btn-white border w-100 btn-lg"
                data-bs-dismiss="modal"
                @click="$emit('close-modal')"
              >
                Salir
              </button>
            </div>
            <div class="col">
              <button
                type="button"
                class="btn btn-primary w-100 btn-lg"
                @click="$emit('close-modal')"
              >
                Ver En Citas
              </button>
            </div>
          </div>
        </span>
      </div>
    </div>
  </div>
</template>
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
