<template>
  <!-- Button trigger modal -->
  <button
    @click="openConfirmationModal"
    class="btn rounded-5 bg-white border-secondary-subtle shadow-sm mx-1 fw-light"
  >
    Más Filtros
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
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content text-start">
        <div class="modal-header border-bottom align-items-center d-flex">
          <h1
            class="modal-title fs-5 fw-semibold ms-2 mt-2"
            id="exampleModalLabel"
          >
            Filtros
          </h1>
          <button
            type="button"
            class="btn-close btn btn-light me-2"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="open = false"
          ></button>
        </div>
        <form @submit.prevent="register">
          <div class="modal-body">
            <div
              class="bg-primary rounded-4 h-100 p-4"
              style="--bs-bg-opacity: 0.04"
            >
              <div>
                <label class="fw-light fs-6">Rango de precios</label>
                <label class="text-secondary"
                  >Agregue un precio mínimo y un precio máximo por el que esté
                  dispuesto a pagar el servicio</label
                >
                <div class="row my-2">
                  <div class="form-group mb-2 col">
                    <input
                      v-model="name"
                      type="text"
                      class="form-control"
                      placeholder="Mínimo"
                      id="nombre"
                      required
                    />
                    <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                  </div>
                  <div class="col-1 text-center">-</div>
                  <div class="form-group mb-2 col">
                    <input
                      v-model="last_name"
                      type="text"
                      class="form-control"
                      placeholder="Máximo"
                      id="telefono"
                      required
                    />
                    <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                  </div>
                </div>
                <hr />
                <label class="fw-light fs-6">Servicios Integrales</label>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="flexRadioDefault"
                    id="flexRadioDefault1"
                  />
                  <label class="form-check-label" for="flexRadioDefault1">
                    Por Hospitales que cubran ese procedimiento y la sala de
                    cirugía
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="flexRadioDefault"
                    id="flexRadioDefault2"
                  />
                  <label class="form-check-label" for="flexRadioDefault2">
                    Por médico o especialista que cubran el procedimiento
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="flexRadioDefault"
                    id="flexRadioDefault3"
                  />
                  <label class="form-check-label" for="flexRadioDefault3">
                    Todas las opciones
                  </label>
                </div>
                <hr />
                <label class="text-secondary"
                  >Configure el tipo de hospitalización que desee recibir al
                  momento de ser ingresado por alguna operación o procedimiento
                  que requiera ser ingresado en el hospital.
                </label>
                <div>
                  <p class="fw-light fs-6 mb-0">
                    Comodidades en las Habitaciones
                  </p>
                  <p class="text-secondary mb-1">Habitaciones</p>
                </div>
                <div class="form-check form-check-inline">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="inlineRadioOptions"
                    id="inlineRadio1"
                    value="option1"
                  />
                  <label class="form-check-label" for="inlineRadio1"
                    >Habitación Privada</label
                  >
                </div>
                <div class="form-check form-check-inline">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="inlineRadioOptions"
                    id="inlineRadio2"
                    value="option2"
                  />
                  <label class="form-check-label" for="inlineRadio2"
                    >Habitación Compartida</label
                  >
                </div>
                <div class="form-check form-check-inline">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="inlineRadioOptions"
                    id="inlineRadio3"
                    value="option3"
                  />
                  <label class="form-check-label" for="inlineRadio3"
                    >Baño privado</label
                  >
                </div>
                <hr />
                <div>
                  <p class="fs-7 mb-1">
                    Televisión y entretenimiento
                  </p>
                  <div class="form-check form-check-inline">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="inlineCheckbox1"
                      value="option1"
                    />
                    <label class="form-check-label" for="inlineCheckbox1"
                      >Televisión por cable</label
                    >
                  </div>
                  <div class="form-check form-check-inline">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="inlineCheckbox2"
                      value="option2"
                    />
                    <label class="form-check-label" for="inlineCheckbox2"
                      >Televisión con Smart Tv</label
                    >
                  </div>
                  <div class="form-check form-check-inline">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="inlineCheckbox3"
                      value="option3"
                    />
                    <label class="form-check-label" for="inlineCheckbox3"
                      >Wifi</label
                    >
                  </div>
                </div>
                <hr />
                <div>
                  <p class="text-secondary mb-1">Más Servicios</p>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      value=""
                      id="flexCheckDefault"
                    />
                    <label class="form-check-label" for="flexCheckDefault">
                      Servicio de Comida personalizada a la habitación
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      value=""
                      id="flexCheckChecked"
                      checked
                    />
                    <label class="form-check-label" for="flexCheckChecked">
                      Accesibilidad: Ascensores
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      value=""
                      id="flexCheckChecked"
                    />
                    <label class="form-check-label" for="flexCheckChecked">
                      Programas de bienestar
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      value=""
                      id="flexCheckChecked"
                    />
                    <label class="form-check-label" for="flexCheckChecked">
                      Sala de entretenimiento
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      value=""
                      id="flexCheckChecked"
                    />
                    <label class="form-check-label" for="flexCheckChecked">
                      Sala de juegos para niños
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      value=""
                      id="flexCheckChecked"
                    />
                    <label class="form-check-label" for="flexCheckChecked">
                      Aire Acondicionado
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      value=""
                      id="flexCheckChecked"
                    />
                    <label class="form-check-label" for="flexCheckChecked">
                      Calefacción
                    </label>
                  </div>
                  <div class="form-check">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      value=""
                      id="flexCheckChecked"
                    />
                    <label class="form-check-label" for="flexCheckChecked">
                      Aparcamiento gratuito
                    </label>
                  </div>
                </div>
                <div>
                  <p class="fw-light fs-6 mb-0">
                    Comodidades en las Áreas de espera
                  </p>
                  <div class="form-check form-check-inline">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="inlineCheckbox1"
                      value="option1"
                    />
                    <label class="form-check-label" for="inlineCheckbox1"
                      >Wifi</label
                    >
                  </div>
                  <div class="form-check form-check-inline">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      id="inlineCheckbox1"
                      value="option1"
                    />
                    <label class="form-check-label" for="inlineCheckbox1"
                      >Opciones de refrigerios</label
                    >
                  </div>
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
              >
                Cancelar
              </button>
            </div>
            <div class="col">
              <button
                type="button"
                class="btn btn-primary w-100"
              >
                Confirmar
              </button>
            </div>
          </div>
        </form>
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
