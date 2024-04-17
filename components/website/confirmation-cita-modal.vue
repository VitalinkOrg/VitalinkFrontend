<script setup>
import { ref, defineProps } from "vue";
import { useStore } from "~/store";
const emit = defineEmits(['close-modal'])
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
        status: "CREATED",
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

function closeConfirmationModal() {
  emit('close-modal')
  step.value = 4;
}
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
      :class="step < 5 ? 'modal-xl' : ''"
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
            @click="closeConfirmationModal"
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
              <dd>
                {{
                  new Date(appointment.date).toDateString() +
                  " a las " +
                  appointment.time
                }}
              </dd>
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
            <dl v-if="user">
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
                @click="step = 6"
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
                  {{
                    new Date(appointment.date).toDateString() +
                    " a las " +
                    appointment.time
                  }}
                </dd>
              </dl>
              <dl>
                <dt class="text-white">Hospital o centro</dt>
                <dd class="text-primary fw-semibold">
                  {{ appointment.location }}
                </dd>
              </dl>
              <dl>
                <dt class="text-white">Especialidad / motivo</dt>
                <dd class="text-primary fw-semibold">
                  {{ appointment.service }}
                </dd>
              </dl>
              <dl v-if="result.doctor_name">
                <dt class="text-white">Médico / Especialista</dt>
                <dd class="text-primary fw-semibold">
                  {{ result.doctor_name }}
                </dd>
              </dl>
              <dl>
                <dt class="text-white">Paciente titular</dt>
                <dd class="text-primary fw-semibold">
                  {{ user.first_name + " " + user.last_name }}
                </dd>
              </dl>
              <!-- <dl>
                <dt class="text-white">Modelo de servicio</dt>
                <dd class="text-primary fw-semibold">Seguro Médico: ASIS</dd>
              </dl> -->
              <dl>
                <dt class="text-white">Precio Final del servicio</dt>
                <dd class="text-primary fw-semibold">
                  {{ parseFloat(result.price).toLocaleString() }}
                  {{ result.currency }}
                </dd>
              </dl>
            </div>
          </div>
          <div class="modal-footer">
            <div class="col">
              <button
                type="button"
                class="btn btn-white border w-100 btn-lg"
                data-bs-dismiss="modal"
                @click="closeConfirmationModal"
              >
                Salir
              </button>
            </div>
            <div class="col">
              <NuxtLink
                class="btn btn-primary w-100 btn-lg"
                href="/pacientes/citas"
              >
                Ver En Citas
              </NuxtLink>
            </div>
          </div>
        </span>
        <span v-if="step === 6">
          <div class="modal-body">
            <div class="text-center">
              <img
                src="@/src/assets/alert-triangle.svg"
                alt="Alerta"
                style="height: 4rem"
              />
              <div class="text-secondary fs-5 fw-semibold">Aún no has solicitado tu cita</div>
              <h4 class="fs-3 fw-semibold">¿Quieres salir del proceso de reserva?</h4>
            </div>
          </div>
          <div class="modal-footer">
            <div class="col">
              <button
                type="button"
                class="btn btn-white border w-100"
                data-bs-dismiss="modal"
                @click="step = 4"
              >
                Continuar con la reserva
              </button>
            </div>
            <div class="col">
              <button
                type="button"
                class="btn btn-danger border w-100"
                data-bs-dismiss="modal"
                @click="closeConfirmationModal"
              >
                Cancelar
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
