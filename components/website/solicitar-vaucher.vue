<template>
  <!-- Button trigger modal -->
  <div class="text-center">
    <p @click="openConfirmationModal" class="btn btn-link text-center">
      Solicitar un Vaucher
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
      v-if="authenticated"
      class="modal-dialog modal-lg modal-dialog-centered"
    >
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
        <form @submit.prevent="requestVoucher" v-if="step === 1">
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
                      v-model="user_info.first_name"
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
                      v-model="user_info.last_name"
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
                      v-model="user_info.phone_number"
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
                      v-model="user_info.address"
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
                      v-model="user_info.postal_code"
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
                      v-model="user_info.city"
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
                      v-model="user_info.country_iso_code"
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
                    <select
                      id="insurances"
                      class="form-select"
                      v-model="insurance_id"
                    >
                      <option value="" disabled selected>Selecciona una aseguradora</option>
                      <option
                        v-for="insurance in insurances"
                        :key="insurance.id"
                        :value="insurance.id"
                      >
                        {{ insurance.name }}
                      </option>
                    </select>
                  </div>
                </div>
                <!-- <div class="form-group my-2">
                  <label for="email" class="form-label text-capitalize"
                    >Número de asegurado</label
                  >
                  <input
                    v-model="insurance_id"
                    type="number"
                    class="form-control"
                    placeholder="Escribe tu número de asegurado"
                    id="insurance_id"
                    required
                  />
                </div> -->
                <div class="form-group my-2">
                  <label for="email" class="form-label text-capitalize"
                    >Motivo de la solicitud</label
                  >
                  <input
                    v-model="reason_for_request"
                    type="text"
                    class="form-control"
                    placeholder="Escribe los motivos"
                    id="reason_for_request"
                    required
                  />
                  <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                </div>
                <div class="form-group my-2">
                  <label for="email" class="form-label text-capitalize"
                    >Otros</label
                  >
                  <input
                    v-model="others"
                    type="text"
                    class="form-control"
                    placeholder="Escribe datos adicionales"
                    id="others"
                  />
                  <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                </div>
                <div class="form-group my-2">
                  <label for="email" class="form-label text-capitalize"
                    >Descripción</label
                  >
                  <textarea
                    v-model="description"
                    class="form-control"
                    placeholder="Escribe una descripción"
                    id="description"
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
              <button type="submit" class="btn btn-primary w-100">
                Enviar
              </button>
            </div>
          </div>
        </form>
        <!-- Step 5 -->
        <span v-if="step === 2">
          <div class="modal-body">
            <div class="text-center">
              <img
                src="@/src/assets/img-fuegos-artificiales-felicidades.svg"
                alt="Felicidades"
                style="height: 3rem"
              />
              <div class="text-primary fs-2 fw-semibold">Solicitud enviada con éxito</div>
              <p>La solicitud fue enviada exitosamente a tu aseguradora. </p>
              <p class="mt-5">Un representante se pondrá en contacto contigo en la brevedad</p>
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
              <NuxtLink class="btn btn-primary w-100" href="/pacientes/vauchers">
                Ver En Vouchers
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
definePageMeta({
  middleware: ["auth-pacientes"],
});
const router = useRouter();
const config = useRuntimeConfig();
const token = useCookie("token");
const authenticated = useCookie("authenticated");
const user_info = useCookie("user_info");
const open = ref(false);
const step = ref(1);
const errorText = ref(null);
const insurance_id = ref("");
const reason_for_request = ref("");
const others = ref("");
const description = ref("");
const appointmentSelected = ref();

function openConfirmationModal() {
  if (authenticated.value) {
    step.value = 1;
    open.value = true;
  } else {
    router.push("/pacientes/login");
  }
}

const { data: insurances } = await useFetch(
  config.public.API_BASE_URL + "/insurances/get_insurances",
  {
    transform: (_insurances) => _insurances.data,
  }
);

/*
const { data: appointments } = await useFetch(
  config.public.API_BASE_URL + "/appointments",
  {
    headers: { Authorization: token.value },
    transform: (_appointments) => _appointments.data,
  }
);

const filteredArray = appointments.value.filter(
  (item) => user_info.value.id === item.patient_id && (item.status === 'PENDING' || item.status === 'CREATED')
);
*/

const requestVoucher = async () => {
  console.log(appointmentSelected, 'appointment');
  const { data, error } = await useFetch(
    config.public.API_BASE_URL + "/vouchers/request_voucher",
    {
      method: "POST",
      headers: { Authorization: token.value },
      body: {
        insurance_id,
        // service_code: appointmentSelected.value.service_code,
        // hospital_id: appointmentSelected.value.hospital_id,
        // doctor_id: appointmentSelected.value.doctor_id,
        // appointment_id: appointmentSelected.value.id,
        reason_for_request,
        others,
        description,
      },
    }
  );
  if (data.value) {
    step.value = 2;
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
