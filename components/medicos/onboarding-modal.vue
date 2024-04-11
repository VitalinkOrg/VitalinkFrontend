<script setup>
import { ref, defineProps } from "vue";
const config = useRuntimeConfig();
const token = useCookie("token");
const open = ref(false);
const step = ref(1);
const props = defineProps(["data"]);
const user = props.data;
const servicesSelected = ref(user.services);
const specialtiesSelected = ref(user.specialties);
const hospitalsSelected = ref(user.hospitals);
const firstName = ref(user.first_name || user.name);
const lastName = ref(user.last_name);
const phoneNumber = ref(user.phone_number || user.phone_number_1);
const address = ref(user.address);
const city = ref(user.city);
const country_iso_code = ref(user.country_iso_code);
const postal_code = ref(user.postal_code);
const description = ref(user.description);
const medicalNumber = ref(user.medical_license_number || user.medical_number);

const { data: specialties } = await useFetch(
  config.public.API_BASE_URL + "/specialties",
  {
    transform: (_specialties) => _specialties.data,
  }
);

const { data: hospitals } = await useFetch(
  config.public.API_BASE_URL + "/hospitals",
  {
    transform: (_hospitals) => _hospitals.data,
  }
);

const { data: services } = await useFetch(
  config.public.API_BASE_URL + "/services",
  {
    transform: (_services) => _services.data,
  }
);

const updateDoctor = async () => {
  const { data, error } = await useFetch(
    config.public.API_BASE_URL + "/doctors/update_doctor",
    {
      method: "PUT",
      headers: { Authorization: token.value },
      body: {
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        address,
        city,
        country_iso_code,
        medical_license_number: medicalNumber,
        description,
        hospitals: hospitalsSelected,
        services: servicesSelected,
        specialties: specialtiesSelected,
      },
    }
  );
  if (data) {
    step.value = 5;
  }
  if (error.value) {
    console.log(error.value, "data");
  }
};

const updateHospital = async () => {
  const { data, error } = await useFetch(
    config.public.API_BASE_URL + "/hospitals/update_hospital",
    {
      method: "PUT",
      headers: { Authorization: token.value },
      body: {
        name: firstName,
        phone_number_1: phoneNumber,
        address,
        city,
        country_iso_code,
        postal_code,
        description,
        medical_number: medicalNumber,
        group_name: user.group_name,
        services: servicesSelected,
        specialties: specialtiesSelected,
      },
    }
  );
  if (data) {
    step.value = 5;
  }
  if (error.value) {
    console.log(error.value, "data");
  }
};

onMounted(() => {
  if (!props.data.description) {
    open.value = true;
  }
});
</script>
<template>
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
      class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable"
    >
      <div class="modal-content">
        <div class="modal-header border-bottom align-items-center d-flex">
          <h1
            class="modal-title fs-4 fw-normal ms-2 mt-2"
            id="exampleModalLabel"
          >
            Onboarding Bienvenida
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
            class="bg-primary rounded-4 d-flex align-items-center"
            style="--bs-bg-opacity: 0.05"
          >
            <div class="col">
              <img
                src="@/src/assets/img-bienvenida-medicos.svg"
                class="img-fluid"
                alt="Bienvenido!"
              />
            </div>
            <div class="col">
              <span class="display-3 text-primary">Bienvenido!</span>
              <p class="lead pe-5">
                Completar tu perfil te ayudará a destacar y conectar con más
                pacientes.
              </p>
            </div>
          </div>
        </div>
        <div class="modal-footer" v-if="step === 1">
          <div class="col">
            <button
              type="button"
              class="btn btn-white border w-100 btn-lg"
              data-bs-dismiss="modal"
              @click="open = null"
            >
              Ahora no
            </button>
          </div>
          <div class="col">
            <button
              type="button"
              class="btn btn-primary w-100 btn-lg"
              @click="step = 2"
            >
              Comenzar
            </button>
          </div>
        </div>

        <!-- Step 2 -->
        <div class="modal-body" v-if="step === 2">
          <div class="container">
            <div class="row">
              <div class="col-3">
                <div
                  class="bg-primary rounded-4 p-4 h-100"
                  style="--bs-bg-opacity: 0.07"
                >
                  <span class="text-success fw-bold pt-4 d-block"
                    >1 a 3 pasos</span
                  >
                  <span class="text-primary fw-bold fs-4 py-4 d-block"
                    >Completa tus Datos Personales</span
                  >
                  <p class="text-muted fw-medium">
                    Empieza completando por tus datos personales o de empresa
                    imprescindibles para la plataforma
                  </p>
                </div>
              </div>
              <div class="col">
                <div
                  class="bg-primary rounded-4 h-100 p-4"
                  style="--bs-bg-opacity: 0.04"
                >
                  <div class="form-group mb-3">
                    <label for="nombre" class="form-label">Nombre (s)</label>
                    <input
                      type="text"
                      placeholder="Escribe tu nombre"
                      class="form-control shadow-sm"
                      id="nombre"
                      name="nombre"
                      v-model="firstName"
                    />
                  </div>
                  <div class="form-group mb-3" v-if="data.last_name">
                    <label for="apellidos" class="form-label"
                      >Apellidos (s)</label
                    >
                    <input
                      type="text"
                      placeholder="Escribe tu apellido"
                      class="form-control shadow-sm"
                      id="apellidos"
                      name="apellidos"
                      v-model="lastName"
                    />
                  </div>
                  <div class="form-group mb-3">
                    <label for="telefono" class="form-label"
                      >Número de teléfono</label
                    >
                    <input
                      type="phone"
                      placeholder="+1(555) 000-0000"
                      class="form-control shadow-sm"
                      id="telefono"
                      name="telefono"
                      v-model="phoneNumber"
                    />
                  </div>
                  <div class="form-group mb-3">
                    <label for="direccion" class="form-label">Dirección</label>
                    <input
                      type="text"
                      placeholder="Dirección"
                      class="form-control shadow-sm"
                      id="direccion"
                      name="direccion"
                      v-model="address"
                    />
                  </div>
                  <div class="row row-cols-sm-3 mb-5">
                    <div class="form-group" v-if="postal_code in user">
                      <label for="postal" class="form-label"
                        >Código Postal</label
                      >
                      <input
                        type="text"
                        placeholder="0000000"
                        class="form-control shadow-sm"
                        id="postal"
                        name="postal"
                        v-model="postal_code"
                      />
                    </div>
                    <div class="form-group">
                      <label for="ciudad" class="form-label">Ciudad*</label>
                      <input
                        type="text"
                        placeholder="Ciudad"
                        class="form-control shadow-sm"
                        required
                        id="ciudad"
                        name="ciudad"
                        v-model="city"
                      />
                    </div>
                    <div class="form-group">
                      <label for="pais" class="form-label">País*</label>
                      <input
                        type="text"
                        placeholder="País"
                        class="form-control shadow-sm"
                        required
                        id="pais"
                        name="pais"
                        v-model="country_iso_code"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer" v-if="step === 2">
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
            <button
              type="button"
              class="btn btn-primary w-100 btn-lg"
              @click="step = 3"
            >
              Siguiente
            </button>
          </div>
        </div>

        <!-- Step 3 -->
        <div class="modal-body" v-if="step === 3">
          <div class="container">
            <div class="row">
              <div class="col-3">
                <div
                  class="bg-primary rounded-4 p-4 h-100"
                  style="--bs-bg-opacity: 0.07"
                >
                  <span class="text-success fw-bold pt-4 d-block"
                    >2 a 3 pasos</span
                  >
                  <span class="text-primary fw-bold fs-4 py-4 d-block"
                    >Información Profesional</span
                  >
                  <p class="text-muted fw-medium">
                    Esto ayudará a los pacientes a conocerte mejor.
                  </p>
                </div>
              </div>
              <div class="col">
                <div
                  class="bg-primary rounded-4 h-100 p-4"
                  style="--bs-bg-opacity: 0.04"
                >
                  <!-- <div class="form-group mb-3">
                    <label for="nombre" class="form-label">Foto de Perfil</label>
                    <div class="mb-3 text-muted fw-light">Esta será la foto que vean tu pacientes cuando encuentren tu
                      perfil en
                      Vitalink
                    </div>
                    <input type="file" id="myFile" name="filename" class="form-control">
                  </div>
                  <hr> -->
                  <div class="form-group mb-3">
                    <label for="descripcion" class="form-label"
                      >Escribe una breve descripción profesional</label
                    >
                    <textarea
                      placeholder="Escribe una descripción sobre ti y tu experiencia profesional"
                      class="form-control shadow-sm"
                      id="descripcion"
                      name="descripcion"
                      rows="4"
                      v-model="description"
                    />
                  </div>
                  <div class="form-group mb-3">
                    <label for="numero-matricula" class="form-label"
                      >Nº Matrícula Médica
                    </label>
                    <input
                      type="text"
                      placeholder="Escribe el número de tu matrícula"
                      class="form-control shadow-sm"
                      id="numero-matricula"
                      name="numero-matricula"
                      v-model="medicalNumber"
                    />
                  </div>
                </div>
              </div>
            </div>
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
              Siguiente
            </button>
          </div>
        </div>

        <!-- Step 4 -->
        <div class="modal-body" v-if="step === 4">
          <div class="container">
            <div class="row">
              <div class="col-3">
                <div
                  class="bg-primary rounded-4 p-4 h-100"
                  style="--bs-bg-opacity: 0.07"
                >
                  <span class="text-success fw-bold pt-4 d-block"
                    >3 a 3 pasos</span
                  >
                  <span class="text-primary fw-bold fs-4 py-4 d-block"
                    >Información Profesional</span
                  >
                  <p class="text-muted fw-medium">
                    Esto ayudará a los pacientes a conocerte mejor.
                  </p>
                </div>
              </div>
              <div class="col">
                <div
                  class="bg-primary rounded-4 h-100 p-4"
                  style="--bs-bg-opacity: 0.04"
                >
                  <!-- Hospitales CLinicas  -->
                  <div v-if="hospitals in user">
                    <p class="m-0">Selecciona Hospitales o Clínicas</p>
                    <p class="text-muted fw-light">
                      Selecciona los lugares donde tendrá disponibilidad para
                      atender a sus pacientes
                    </p>
                    <div class="form-group mb-4">
                      <select
                        id="hospitals"
                        class="form-select"
                        multiple
                        size="6"
                        v-model="hospitalsSelected"
                      >
                        <option
                          v-for="hospital in hospitals"
                          :key="hospital.id"
                          :value="hospital.id"
                        >
                          {{ hospital.name }}
                        </option>
                      </select>
                    </div>
                  </div>
                  <!-- <button
                    class="btn btn-light border w-100 fw-light text-start d-flex bg-white justify-content-between align-items-center mb-3"
                  >
                    <span>Hospital SIMA (Calle Nº....)</span>
                    <span class="fw-semibold">
                      <AtomsIconsTimesXIcon />
                    </span>
                  </button> -->

                  <!-- Agregar nuevo hospital o clinica -->
                  <!-- <div
                    class="bg-primary rounded-4 p-3 mb-3"
                    style="--bs-bg-opacity: 0.1"
                  >
                    <div class="form-group mb-4">
                      <label for="nombre" class="form-label text-capitalize"
                        >Nombre del Hospital/Clinica</label
                      >
                      <input
                        type="text"
                        class="form-control"
                        placeholder="Escribe el nombre del hospital"
                        name="nombre"
                        required
                      />
                    </div>
                    <div class="row row-cols-2">
                      <div class="form-group mb-4">
                        <label for="telefono" class="form-label text-capitalize"
                          >Número de teléfono</label
                        >
                        <input
                          type="phone"
                          class="form-control"
                          placeholder="0000-0000"
                          name="telefono"
                          required
                        />
                      </div>
                      <div class="form-group mb-4">
                        <label
                          for="direccion"
                          class="form-label text-capitalize"
                          >Dirección</label
                        >
                        <input
                          type="text"
                          class="form-control"
                          placeholder="Escribe la dirección"
                          name="direccion"
                          required
                        />
                      </div>
                    </div>
                    <hr />
                    <div class="form-group mb-4">
                      <label for="email" class="form-label text-capitalize"
                        >Correo Electrónico</label
                      >
                      <input
                        type="email"
                        class="form-control"
                        placeholder="Escribe tu correo electrónico"
                        name="email"
                        required
                      />
                    </div>
                    <div class="row row-cols-2">
                      <div class="form-group mb-4">
                        <label for="password" class="form-label text-capitalize"
                          >Contraseña</label
                        >
                        <input
                          type="password"
                          class="form-control"
                          id="password"
                          placeholder="Escribe tu contraseña"
                          aria-describedby="passwordHelp"
                          required
                          name="password"
                        />
                      </div>
                      <div class="form-group mb-4">
                        <label
                          for="confirmPassword"
                          class="form-label text-capitalize"
                          >Confirmar Contraseña</label
                        >
                        <input
                          type="password"
                          class="form-control"
                          id="confirmPassword"
                          placeholder="Escribe tu contraseña"
                          aria-describedby="confirmPasswordHelp"
                          required
                          name="confirmPassword"
                        />
                      </div>
                    </div>
                    <div class="row row-cols-2 mt-4">
                      <div class="col">
                        <button class="btn btn-light border-dark w-100">
                          Volver, no guardar
                        </button>
                      </div>
                      <div class="col">
                        <button class="btn btn-primary w-100">
                          Guardar y Continuar
                        </button>
                      </div>
                    </div>
                  </div> -->

                  <!-- <button class="btn btn-info text-white">
                    <AtomsIconsPlusIcon /> Agregar Hospital o Clínica
                  </button> -->

                  <hr />
                  <!-- Especialidades Medicas  -->
                  <!-- Hospitales CLinicas  -->
                  <p class="m-0">Especialidades Médicas</p>
                  <p class="text-muted fw-light">
                    Selecciona las Especialidades médicas que ofrecerás en la
                    plataforma.
                  </p>
                  <div class="form-group mb-4">
                    <select
                      id="servicios"
                      class="form-select"
                      multiple
                      size="6"
                      v-model="specialtiesSelected"
                    >
                      <option
                        v-for="specialty in specialties"
                        :key="specialty.id"
                        :value="specialty.code"
                      >
                        {{ specialty.name }}
                      </option>
                    </select>
                  </div>
                  <!-- <button
                    class="btn btn-light border w-100 fw-light text-start d-flex bg-white justify-content-between align-items-center mb-3"
                  >
                    <span>Oftalmología</span>
                    <span class="fw-semibold">
                      <AtomsIconsTimesXIcon />
                    </span>
                  </button> -->
                  <!-- <div
                    class="bg-primary rounded-4 p-3 mb-3"
                    style="--bs-bg-opacity: 0.1"
                  >
                    <input
                      type="text"
                      placeholder="Escriba la especialidad"
                      class="form-control"
                    />
                    <div class="text-end mt-2">
                      <button class="btn btn-link text-dark">Cancelar</button>
                      <button class="btn btn-light fw-light border-dark">
                        Guardar
                      </button>
                    </div>
                  </div> -->

                  <!-- <button class="btn btn-info text-white">
                    <AtomsIconsPlusIcon /> Agregar
                  </button> -->

                  <hr />

                  <!-- Servicios Procedimientos  -->
                  <p class="m-0">Servicios / Procedimientos</p>
                  <p class="text-muted fw-light">
                    Selecciona los servicios médicos que ofrecerás en la
                    plataforma.
                  </p>
                  <div class="form-group mb-4">
                    <select
                      id="servicios"
                      class="form-select"
                      multiple
                      size="6"
                      v-model="servicesSelected"
                    >
                      <option
                        v-for="service in services"
                        :key="service.id"
                        :value="service.code"
                      >
                        {{ service.name }}
                      </option>
                    </select>
                  </div>
                  <!-- <button
                    class="btn btn-light border w-100 fw-light text-start d-flex bg-white justify-content-between align-items-center mb-3"
                  >
                    <span>Cirugía de catarata monofocal</span>
                    <span class="fw-semibold">
                      <AtomsIconsTimesXIcon />
                    </span>
                  </button>
                  <div
                    class="bg-primary rounded-4 p-3 mb-3"
                    style="--bs-bg-opacity: 0.1"
                  >
                    <input
                      type="text"
                      placeholder="Escriba la especialidad"
                      class="form-control"
                    />
                    <div class="text-end mt-2">
                      <button class="btn btn-link text-dark">Cancelar</button>
                      <button class="btn btn-light fw-light border-dark">
                        Guardar
                      </button>
                    </div>
                  </div>

                  <button class="btn btn-info text-white">
                    <AtomsIconsPlusIcon /> Agregar
                  </button> -->
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer" v-if="step === 4">
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
              @click="
                data.last_name ? updateDoctor($event) : updateHospital($event)
              "
            >
              Confirmar
            </button>
          </div>
        </div>

        <!-- Step 5 -->
        <span v-if="step === 5">
          <div class="modal-body">
            <div
              class="bg-primary rounded-4 d-flex align-items-center justify-content-center text-center py-5"
              style="--bs-bg-opacity: 0.05"
            >
              <div class="my-5 text-center">
                <img
                  src="@/src/assets/img-fuegos-artificiales-felicidades.svg"
                  alt="Felicidades"
                />
                <div class="display-3 text-primary">Felicidades!</div>
                <p class="w-50 mx-auto fw-normal text-muted fs-5">
                  Has completado una buena parte de tu perfil, esto te ayudará a
                  destacar y conectar con más pacientes.
                </p>
              </div>

              <!-- <div class="col">
                <img src="@/src/assets/img-bienvenida-medicos.svg" class="img-fluid" alt="Bienvenido!">
              </div>
              <div class="col">
                <span class="display-3 text-primary">Bienvenido!</span>
                <p class="lead pe-5">Completar tu perfil te ayudará a destacar y conectar con más pacientes.</p>
              </div> -->
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-primary w-100 btn-lg"
              @click="open = false"
            >
              Siguiente
            </button>
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
</style>
