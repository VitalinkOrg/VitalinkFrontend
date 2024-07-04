<template>
  <!-- Button trigger modal -->
  <button
    @click="openConfirmationModal"
    class="btn btn-primary w-100 btn-sm mt-2 rounded-2"
  >
    Reservar Cita
  </button>
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
            @click="exitButton"
          ></button>
        </div>
        <div
          v-if="step < 5"
          class="d-flex align-items-center justify-content-center stepper"
        >
          <div class="stepper-item" :class="step >= 1 ? 'text-success' : ''">
            <span class="stepper-item-icon">
              <Icon
                name="ic:outline-radio-button-unchecked"
                class="text-dark"
                v-if="step < 1"
              />

              <Icon
                name="material-symbols:radio-button-checked-outline"
                v-if="step === 1"
              />
              <Icon name="material-symbols:check-circle" v-if="step > 1" />
            </span>
            1
          </div>
          <div class="stepper-item" :class="step >= 2 ? 'text-success' : ''">
            <span class="fs-3">
              <Icon
                name="ic:outline-radio-button-unchecked"
                class="text-secondary"
                v-if="step < 2"
              />

              <Icon
                name="material-symbols:radio-button-checked-outline"
                v-if="step === 2"
              />
              <Icon name="material-symbols:check-circle" v-if="step > 2" />
            </span>
            2
          </div>
          <div class="stepper-item" :class="step >= 3 ? 'text-success' : ''">
            <span class="fs-3">
              <Icon
                name="ic:outline-radio-button-unchecked"
                class="text-secondary"
                v-if="step < 3"
              />
              <Icon
                name="material-symbols:radio-button-checked-outline"
                v-if="step === 3"
              />
              <Icon name="material-symbols:check-circle" v-if="step > 3" />
            </span>
            3
          </div>
          <div class="stepper-item" :class="step >= 4 ? 'text-success' : ''">
            <span class="fs-3">
              <Icon
                name="ic:outline-radio-button-unchecked"
                class="text-secondary"
                v-if="step < 4"
              />

              <Icon
                name="material-symbols:radio-button-checked-outline"
                v-if="step === 4"
              />
              <Icon name="material-symbols:check-circle" v-if="step > 4" />
            </span>
            4
          </div>
        </div>
        <!-- Step 1 -->
        <div class="modal-body" v-if="step === 1">
          <div
            class="bg-primary rounded-4 h-100 p-4"
            style="--bs-bg-opacity: 0.04"
          >
            <div class="row row-cols-sm-2 mb-3">
              <div class="form-group">
                <label for="especialidad" class="form-label"
                  >Especialidad</label
                >
                <select
                  name="especialidad"
                  id="especialidad"
                  class="form-select"
                >
                  <option disabled selected>{{ service.specialty }}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="procedimiento" class="form-label"
                  >Procedimiento</label
                >
                <select
                  name="procedimiento"
                  id="procedimiento"
                  class="form-select"
                >
                  <option disabled selected>{{ service.service }}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="lugar" class="form-label">Lugar</label>
                <select name="lugar" id="lugar" class="form-select">
                  <option disabled selected>{{ service.hospital_name }}</option>
                </select>
              </div>
              <div class="form-group">
                <label for="tipodecita" class="form-label">Tipo de cita</label>
                <select name="tipodecita" id="tipodecita" class="form-select">
                  <option disabled selected>{{ service.cpt }}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div v-if="step === 1">
          <div class="modal-footer">
            <div class="col">
              <button
                type="button"
                class="btn btn-white border w-100 btn-lg"
                data-bs-dismiss="modal"
                @click="step = 6"
              >
                Cancelar
              </button>
            </div>
            <div class="col">
              <button
                type="button"
                class="btn btn-primary w-100 btn-lg"
                @click="nextStep"
              >
                Continuar
              </button>
            </div>
          </div>
          <div class="modal-footer justify-content-center" v-if="errorSchedule">
            <p>{{ errorSchedule }}</p>
          </div>
        </div>

        <!-- Step 2 -->
        <div v-if="step === 2">
          <form @submit.prevent="step = 3">
            <div class="modal-body">
              <div class="container">
                <div
                  class="bg-primary rounded-4 h-100 p-4"
                  style="--bs-bg-opacity: 0.04"
                >
                  <div class="form-group mb-3">
                    <label for="fecha" class="form-label">Fecha</label>
                    <input
                      type="date"
                      name="fecha"
                      id="fecha"
                      class="form-control"
                      v-model="date"
                      required
                    />
                  </div>
                  <div class="form-group mb-3">
                    <label for="hora" class="form-label">Hora</label>
                    <input
                      type="time"
                      id="hora"
                      name="hora"
                      :min="service.schedule[0].open + ':00'"
                      :max="service.schedule[0].close + ':00'"
                      v-model="time"
                      required
                      class="form-control"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <div class="col">
                <button
                  type="button"
                  class="btn btn-white border w-100 btn-lg"
                  data-bs-dismiss="modal"
                  @click="step = 1"
                >
                  Volver
                </button>
              </div>
              <div class="col">
                <button type="submit" class="btn btn-primary w-100 btn-lg">
                  Continuar
                </button>
              </div>
            </div>
          </form>
        </div>

        <!-- Step 3 -->
        <div class="modal-body" v-if="step === 3">
          <div
            class="bg-primary rounded-4 h-100 p-4"
            style="--bs-bg-opacity: 0.04"
          >
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
            <div class="form-group mb-2">
              <label for="nombre" class="form-label text-capitalize"
                >Selecciona tu aseguradora</label
              >
              <select
                id="insurances"
                class="form-select"
                v-model="insurance_id"
              >
                <option value="" disabled selected>
                  Selecciona una aseguradora
                </option>
                <option
                  v-for="insurance in insurances"
                  :key="insurance.id"
                  :value="insurance.id"
                >
                  {{ insurance.name }}
                </option>
              </select>
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
                Su aseguradora le generó un váucher para este servicio, por
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
                <WebsiteSolicitarVaucher />
              </div>
            </div>
          </div>

          <div class="text-center py-3">
            <p class="fs-5 mb-1">
              <span class="text-muted">Precio final del servicio</span>
              <span class="fw-semibold text-primary ms-2"
                >{{ parseFloat(service.price).toLocaleString() }}
                {{ service.currency }}</span
              >
            </p>
            <!-- <p>
              <small class="text-primary text-decoration-line-through"
                >Antes ₡44000.00</small
              >
            </p> -->
          </div>
        </div>
        <div class="modal-footer" v-if="step === 3">
          <div class="col">
            <button
              type="button"
              class="btn btn-white border w-100 btn-lg"
              data-bs-dismiss="modal"
              @click="step = 2"
            >
              Volver
            </button>
          </div>
          <div class="col">
            <button
              type="button"
              class="btn btn-primary w-100 btn-lg"
              @click="step = 4"
            >
              Continuar
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
              <dd>{{ new Date(date).toDateString() + " a las " + time }}</dd>
            </dl>
            <dl>
              <dt>Hospital o centro</dt>
              <dd>{{ service.hospital_name }}</dd>
            </dl>
            <dl>
              <dt>Especialidad / motivo</dt>
              <dd>{{ service.service }}</dd>
            </dl>
            <dl v-if="service.doctor_name">
              <dt>Médico / Especialista</dt>
              <dd>{{ service.doctor_name }}</dd>
            </dl>
            <dl v-if="user_info">
              <dt>Paciente titular</dt>
              <dd>{{ user_info.first_name + " " + user_info.last_name }}</dd>
            </dl>
            <!-- <dl>
              <dt>Modelo de servicio</dt>
              <dd>Seguro Médico: ASIS</dd>
            </dl> -->
            <dl>
              <dt>Precio Final del servicio</dt>
              <dd>
                {{ parseFloat(service.price).toLocaleString() }}
                {{ service.currency }}
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
                <dd class="text-primary fw-semibold">
                  {{ service.hospital_name }}
                </dd>
              </dl>
              <dl>
                <dt class="text-white">Especialidad / motivo</dt>
                <dd class="text-primary fw-semibold">
                  {{ service.service }}
                </dd>
              </dl>
              <dl v-if="service.doctor_name">
                <dt class="text-white">Médico / Especialista</dt>
                <dd class="text-primary fw-semibold">
                  {{ service.doctor_name }}
                </dd>
              </dl>
              <dl>
                <dt class="text-white">Paciente titular</dt>
                <dd class="text-primary fw-semibold">
                  {{ user_info.first_name + " " + user_info.last_name }}
                </dd>
              </dl>
              <!-- <dl>
                <dt class="text-white">Modelo de servicio</dt>
                <dd class="text-primary fw-semibold">Seguro Médico: ASIS</dd>
              </dl> -->
              <dl>
                <dt class="text-white">Precio Final del servicio</dt>
                <dd class="text-primary fw-semibold">
                  {{ parseFloat(service.price).toLocaleString() }}
                  {{ service.currency }}
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
              <div class="text-secondary fs-5 fw-semibold">
                Aún no has solicitado tu cita
              </div>
              <h4 class="fs-3 fw-semibold">
                ¿Quieres salir del proceso de reserva?
              </h4>
            </div>
          </div>
          <div class="modal-footer">
            <div class="col">
              <button
                type="button"
                class="btn btn-white border w-100"
                data-bs-dismiss="modal"
                @click="step = 1"
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

<script setup>
import { ref, defineProps } from "vue";
const router = useRouter();
const config = useRuntimeConfig();
const token = useCookie("token");
const authenticated = useCookie("authenticated");
const open = ref(false);
const step = ref(1);
const props = defineProps(["service"]);
const route = useRoute();
const date = ref("");
const time = ref("");
const errorText = ref(null);
const errorSchedule = ref(null);
const user_info = useCookie("user_info");
const insurance_id = ref("");

function openConfirmationModal() {
  if (authenticated.value) {
    open.value = true;
  } else {
    router.push("/pacientes/login");
  }
}

function closeConfirmationModal() {
  open.value = false;
  step.value = 1;
}

function exitButton() {
  if (step.value === 6) {
    open.value = false;
    step.value = 1;
  } else {
    step.value = 6;
  }
}

const { data: insurances } = await useFetch(
  config.public.API_BASE_URL + "/insurances/get_insurances",
  {
    transform: (_insurances) => _insurances.data,
  }
);

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
        patient_id: user_info.value.id,
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
