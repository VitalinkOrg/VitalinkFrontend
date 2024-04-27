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
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header border-bottom align-items-center d-flex">
          <h1
            class="modal-title fs-5 fw-normal ms-2 mt-2"
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
        <form @submit.prevent="register" v-if="step === 1">
          <div class="modal-body">
            <div
              class="bg-primary rounded-4 h-100 p-4"
              style="--bs-bg-opacity: 0.04"
            >
              <div>
                <label class="form-label text-dark text-capitalize"
                  >Datos Personales del Beneficiado</label
                >
                <div class="row row-cols-2 my-2">
                  <div class="form-group mb-2">
                    <label for="nombre" class="form-label text-capitalize"
                      >Nombre</label
                    >
                    <input
                      v-model="user.first_name"
                      type="text"
                      class="form-control"
                      placeholder="Escribe tu nombre"
                      id="nombre"
                      disabled
                    />
                    <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                  </div>
                  <div class="form-group mb-2">
                    <label for="telefono" class="form-label text-capitalize"
                      >Apellido</label
                    >
                    <input
                      v-model="user.last_name"
                      type="text"
                      class="form-control"
                      placeholder="Escribe tu apellido"
                      id="telefono"
                      disabled
                    />
                    <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                  </div>
                  <div class="form-group mb-2">
                    <label for="dob" class="form-label text-capitalize"
                      >Número de teléfono</label
                    >
                    <input
                      v-model="user.phone_number"
                      type="phone"
                      class="form-control"
                      placeholder="000-0000"
                      id="dob"
                      disabled
                    />
                    <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                  </div>
                  <div class="form-group mb-2">
                    <label for="dob" class="form-label text-capitalize"
                      >Dirección</label
                    >
                    <input
                      v-model="user.address"
                      type="text"
                      class="form-control"
                      placeholder="Dirección"
                      id="dob"
                      disabled
                    />
                    <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                  </div>
                </div>
                <div class="row row-cols-3">
                  <div class="form-group mb-2">
                    <label for="apellido" class="form-label text-capitalize"
                      >Código Postal</label
                    >
                    <input
                      v-model="user.postal_code"
                      type="number"
                      class="form-control"
                      placeholder="000000"
                      id="apellido"
                      disabled
                    />
                    <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                  </div>
                  <div class="form-group mb-2">
                    <label for="apellido" class="form-label text-capitalize"
                      >Ciudad</label
                    >
                    <input
                      v-model="user.city"
                      type="text"
                      class="form-control"
                      placeholder="Ciudad"
                      id="apellido"
                      disabled
                    />
                    <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                  </div>
                  <div class="form-group mb-2">
                    <label for="apellido" class="form-label text-capitalize"
                      >País</label
                    >
                    <input
                      v-model="user.country_iso_code"
                      type="text"
                      class="form-control"
                      placeholder="País"
                      id="apellido"
                      disabled
                    />
                    <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                  </div>
                </div>
                <label class="form-label text-dark text-capitalize"
                  >Datos de la Aseguradora</label
                >
                <div class="row row-cols-2 my-2">
                  <div class="form-group mb-2">
                    <label for="nombre" class="form-label text-capitalize"
                      >Selecciona tu aseguradora</label
                    >
                    <input
                      v-model="name"
                      type="text"
                      class="form-control"
                      placeholder="Escribe tu nombre"
                      id="nombre"
                      required
                    />
                    <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                  </div>
                  <div class="form-group mb-2">
                    <label for="nombre" class="form-label text-capitalize"
                      >Busca tu aseguradora</label
                    >
                    <input
                      v-model="name"
                      type="text"
                      class="form-control"
                      placeholder="Escribe tu nombre"
                      id="nombre"
                      required
                    />
                    <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                  </div>
                </div>
                <div class="form-group my-2">
                  <label for="email" class="form-label text-capitalize"
                    >Número de asegurado</label
                  >
                  <input
                    v-model="medical_number"
                    type="number"
                    class="form-control"
                    placeholder="Escribe tu número de asegurado"
                    id="email"
                    required
                  />
                  <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                </div>
                <div class="form-group my-2">
                  <label for="email" class="form-label text-capitalize"
                    >Motivo de la solicitud</label
                  >
                  <input
                    v-model="medical_number"
                    type="number"
                    class="form-control"
                    placeholder="Escribe tu número de asegurado"
                    id="email"
                    required
                  />
                  <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                </div>
                <div class="form-group my-2">
                  <label for="email" class="form-label text-capitalize"
                    >Otros</label
                  >
                  <input
                    v-model="medical_number"
                    type="text"
                    class="form-control"
                    placeholder="Escribe los motivos"
                    id="email"
                    required
                  />
                  <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                </div>
                <div class="form-group my-2">
                  <label for="email" class="form-label text-capitalize"
                    >Descripción</label
                  >
                  <textarea
                    v-model="medical_number"
                    type="text"
                    class="form-control"
                    placeholder="Escribe una descripción"
                    id="email"
                    required
                  ></textarea>
                  <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                </div>
                
                <div v-if="errorPassword">
                  <p>{{ errorPassword }}</p>
                </div>
              </div>
              <div class="modal-footer justify-content-center" v-if="errorText">
                <p>{{ errorText }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <div class="col">
              <button
                type="button"
                class="btn btn-white border w-100"
                data-bs-dismiss="modal"
                @click="step = 2"
              >
                Cancelar
              </button>
            </div>
            <div class="col">
              <button
                type="button"
                class="btn btn-primary w-100"
                @click="step = 4"
              >
                Enviar
              </button>
            </div>
          </div>
        </form>
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
                class="btn btn-white border w-100"
                data-bs-dismiss="modal"
                @click="open = false"
              >
                Salir
              </button>
            </div>
            <div class="col">
              <NuxtLink
                class="btn btn-primary w-100"
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
import { useRefreshToken } from "#imports";
definePageMeta({
  middleware: ["auth-pacientes"],
});
const router = useRouter();
const config = useRuntimeConfig();
const token = useCookie("token");
const store = useStore();
const open = ref(false);
const step = ref(1);
const route = useRoute();
const date = ref("");
const time = ref("");
const errorText = ref(null);

const { data: user, pending: pendingUser } = await useFetch(
  config.public.API_BASE_URL + "/patients/getByUser",
  {
    headers: { Authorization: token.value },
    transform: (_user) => _user.data,
  }
);
if (user) {
  store.user = user;
  useRefreshToken();
}

function openConfirmationModal() {
  if (store.authenticated) {
    open.value = true;
  } else {
    router.push("/pacientes/login");
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
