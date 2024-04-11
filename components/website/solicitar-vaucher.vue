<template>
  <!-- Button trigger modal -->
  <div class="text-center">
  <p @click="openConfirmationModal" class="btn btn-link text-center">
    Solicitar un Vaucher Request
  </p>
  </div>
  <!-- Modal -->
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
    >
      <div class="modal-content">
        <div class="modal-header border-bottom align-items-center d-flex">
          <h1
            class="modal-title fs-4 fw-normal ms-2 mt-2"
            id="exampleModalLabel"
          >
          Solicitud de Vaucher
          </h1>
          <button
            type="button"
            class="btn-close btn btn-light me-2"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="open = false"
          ></button>
        </div>
        <!-- Step 1 -->
        <div class="modal-body" v-if="step === 1">
          <div
            class="bg-primary rounded-4 h-100 p-4"
            style="--bs-bg-opacity: 0.04"
          >
          <h6>Datos Personales del Beneficiado</h6>
            <div class="form-group mb-3">
              <label for="persona" class="form-label"
                >¿Para quien es la cita?</label
              >
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  name="persona"
                  id="persona1"
                />
                <label class="form-check-label" for="persona1"> Para mí </label>
              </div>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  name="persona"
                  id="persona2"
                  checked
                />
                <label class="form-check-label" for="persona2">
                  Para otra persona
                </label>
              </div>
            </div>
            <div class="form-group mb-3">
              <label for="modelo" class="form-label"
                >Selecciona el modelo de servicio</label
              >
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  name="modelo"
                  id="modelo1"
                />
                <label class="form-check-label" for="modelo1">
                  Tengo seguro médico
                </label>
              </div>
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  name="modelo"
                  id="modelo2"
                  checked
                />
                <label class="form-check-label" for="modelo2">
                  Cita Privada
                </label>
              </div>
            </div>
            <div class="form-group mb-3">
              <label for="aseguradora" class="form-label"
                >Selecciona o busca tu aseguradora</label
              >
              <select name="aseguradora" id="aseguradora" class="form-select">
                <option disabled selected>Selecciona una aseguradora</option>
              </select>
            </div>

            <div class="form-group mb-4">
              <label for="vaucher" class="form-label">Ingresa el váucher</label>
              <p class="form-text">
                Su su aseguradora le generó un váucher para este servicio, por
                favor agrégelo aquí.
              </p>
              <p class="form-label">Código de Váucher</p>
              <input
                type="text"
                placeholder="XNROEBPORB"
                class="form-control"
              />
            </div>

            <div class="form-group d-flex mb-3">
              <div class="form-check mt-2">
                <input
                  type="checkbox"
                  class="form-check-input"
                  id="no-vaucher"
                />
                <label class="form-check-label" for="no-vaucher"
                  >No tengo Váucher</label
                >
              </div>
              <div class="form-group ms-5">
                <button class="btn btn-light bg-white border">
                  Solicitar un Váucher
                </button>
              </div>
            </div>
          </div>

        </div>
        <div class="modal-footer" v-if="step === 1">
          <div class="col">
            <button
              type="button"
              class="btn btn-white border w-100 btn-lg"
              data-bs-dismiss="modal"
              @click="step = 2"
            >
              Cancelar
            </button>
          </div>
          <div class="col">
            <button
              type="button"
              class="btn btn-primary w-100 btn-lg"
              @click="step = 4"
            >
              Enviar
            </button>
          </div>
        </div>

        <!-- Step 4 -->
        <div class="modal-body" v-if="step === 4">
          <p class="my-4 fw-medium ps-4">
            Revisa los datos antes de confirmar la cita:
          </p>
          <div class="border p-3 rounded-4">
            <dl>
              <dt>Fecha</dt>
              <dd></dd>
            </dl>
            <dl>
              <dt>Hospital o centro</dt>
              <dd></dd>
            </dl>
            <dl>
              <dt>Especialidad / motivo</dt>
              <dd></dd>
            </dl>
            <dl v-if="service.doctor_name">
              <dt>Médico / Especialista</dt>
              <dd></dd>
            </dl>
            <dl v-if="user">
              <dt>Paciente titular</dt>
              <dd>{{ user.first_name + " " + user.last_name }}</dd>
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
                @click="step = 3"
              >
                Volver
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
                  {{ new Date(date).toDateString() + " a las " + time }}
                </dd>
              </dl>
              <dl>
                <dt class="text-white">Hospital o centro</dt>
                <dd class="text-primary fw-semibold"></dd>
              </dl>
              <dl>
                <dt class="text-white">Especialidad / motivo</dt>
                <dd class="text-primary fw-semibold"></dd>
              </dl>
              <dl v-if="service.doctor_name">
                <dt class="text-white">Médico / Especialista</dt>
                <dd class="text-primary fw-semibold"></dd>
              </dl>
              <dl>
                <dt class="text-white">Paciente titular</dt>
                <dd class="text-primary fw-semibold">
                  {{ user.first_name + " " + user.last_name }}
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
                @click="open = false"
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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useStore } from "~/store";
const router = useRouter();
const config = useRuntimeConfig();
const token = useCookie("token");
const store = useStore();
const user = store.user;
const open = ref(false);
const step = ref(1);
const route = useRoute();
const date = ref("");
const time = ref("");
const errorText = ref(null);
const errorSchedule = ref(null);

function openConfirmationModal() {
  if (store.authenticated) {
    open.value = true;
  } else {
    router.push("/pacientes/login");
  }
}

function nextStep() {
  if (!props.service.schedule) {
    errorSchedule.value = "No hay disponibilidad para este servicio.";
  } else {
    step.value = 2;
  }
}

const createAppointment = async () => {
  const { data, error } = await useFetch(
    config.public.API_BASE_URL + "/appointments",
    {
      method: "POST",
      headers: { Authorization: token.value },
      body: {
        date: date.value,
        time_from: time.value,
        time_to: "13:00",
        status: "CREATED",
        service_code: props.service.service_code,
        specialty_code: props.service.specialty_code,
        cpt_code: props.service.cpt_code,
        hospital_id: props.service.hospital_id,
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
