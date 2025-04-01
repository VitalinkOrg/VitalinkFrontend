<script setup>
/*definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});*/
const config = useRuntimeConfig();
const token = useCookie("token");
const user_info = useCookie("user_info");
const firstName = ref("");
const lastName = ref("");
const phoneNumber = ref("");
const address = ref("");
const city = ref("");
const country_iso_code = ref("");
const postal_code = ref("");
const step = ref(1);

const { data: hospitals } = await useFetch(
  config.public.API_BASE_URL + "/hospitals",
  {
    transform: (_hospitals) => _hospitals.data,
  }
);
/*const filteredArray = hospitals.value.filter((item) =>
  user_info.value.hospitals.includes(item.id)
);*/

const filteredArray = [
  {
    id: 1,
    name: "General Hospital",
    address: "123 Medical Drive",
    city: "New York",
    country_iso_code: "US",
    phone_number_1: "+1 555-123-4567",
    postal_code: "10001",
  },
  {
    id: 2,
    name: "City Medical Center",
    address: "456 Health Avenue",
    city: "Los Angeles",
    country_iso_code: "US",
    phone_number_1: "+1 555-987-6543",
    postal_code: "90001",
  },
];
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
      },
    }
  );
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
        group_name: user.group_name,
        medical_number: user.medical_number,
        name: firstName,
        phone_number_1: phoneNumber,
        address,
        city,
        country_iso_code,
        postal_code,
      },
    }
  );
  if (error.value) {
    console.log(error.value, "data");
  }
};
</script>

<template>
  <NuxtLayout name="medicos-dashboard" v-slot="res">
    <nav style="--bs-breadcrumb-divider: &quot;/&quot;" aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink href="/medicos/inicio" class="text-muted">Inicio</NuxtLink>
        </li>
        <li class="breadcrumb-item active fw-semibold" aria-current="page">
          Servicios
        </li>
      </ol>
    </nav>
    <p>
      <span class="fw-medium fs-4">Agregar servicio</span>
    </p>
    <form
      class="mt-4"
      @submit.prevent="
        res.last_name ? updateDoctor($event) : updateHospital($event)
      "
    >
      <div class="card border-0 shadow rounded-3">
        <div class="card-body p-4">
          <div v-if="step === 1">
            <div class="row">
              <div class="form-group mb-3 col-4">
                <label
                  for="nombre"
                  class="form-label mb-1 text-dark text-capitalize d-block"
                  >Especialidad</label
                >
                <small class="my-4"
                  >Selecciona una Especialidad Médica para este servicio</small
                >
                <input
                  type="text"
                  class="form-control mt-2"
                  placeholder="Escribe tu nombre"
                  v-model="firstName"
                  name="nombre"
                  id="nombre"
                />
              </div>
            </div>
            <hr class="mt-3" />
            <div class="row">
              <div class="form-group mb-3 col-4">
                <label
                  for="nombre"
                  class="form-label mb-1 text-dark text-capitalize d-block"
                  >Código CPT</label
                >
                <small class="my-4">Escribe el código CTP</small>
                <input
                  type="text"
                  class="form-control mt-2"
                  placeholder="Escribe tu nombre"
                  v-model="firstName"
                  name="nombre"
                  id="nombre"
                />
              </div>
              <div class="form-group mb-3 col-8">
                <label
                  for="nombre"
                  class="form-label mb-1 text-dark text-capitalize d-block"
                  >Procedimiento</label
                >
                <small class="my-4"
                  >Nombre del procedimiento que ofrecerás como servicio</small
                >
                <input
                  type="text"
                  class="form-control mt-2"
                  placeholder="Escribe tu nombre"
                  v-model="firstName"
                  name="nombre"
                  id="nombre"
                  disabled
                />
              </div>
              <div class="col-2">
                <button class="btn btn-outline-dark fw-light">
                  + Agregar CPT
                </button>
              </div>
            </div>
            <hr class="mt-3" />
            <div class="row">
              <div class="col">
                <label
                  for="nombre"
                  class="form-label mb-1 text-dark text-capitalize d-block"
                  >Descripción</label
                >
                <small class="my-4"
                  >Escribe una breve descripción sobre el servicio que
                  brindarás</small
                >
                <textarea
                  type="text"
                  class="form-control mt-2"
                  placeholder="Escribe tu nombre"
                  v-model="firstName"
                  name="nombre"
                  id="nombre"
                ></textarea>
              </div>
            </div>
          </div>
          <div v-if="step === 2">
            <h5>Lugar de atención</h5>
            <p class="text-secondary">
              Selecciona el lugar de atención disponible para atender a los
              pacientes en este servicio
            </p>
            <div v-if="user_info">
              <div
                v-for="hospital in filteredArray"
                :key="hospital.id"
                class="card rounded-4 mb-3"
              >
                <div class="card-body d-flex">
                  <div class="w-100">
                    <p class="fw-light fs-5 mb-1">{{ hospital.name }}</p>
                    <p class="m-0 fw-light text-muted">
                      {{ hospital.address }}
                    </p>
                    <p class="m-0 fw-light text-muted">
                      {{ hospital.city + ", " + hospital.country_iso_code }}
                    </p>
                  </div>
                  <div class="d-flex align-items-start">
                    <button class="btn btn-light bg-white border">
                      <AtomsIconsEditPencilIcon />
                    </button>
                    <button class="btn btn-light bg-white border ms-2">
                      <AtomsIconsTrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="d-flex justify-content-end mt-5 gap-4">
            <button class="btn btn-outline-dark" @click="step--">Atrás</button>
            <button class="btn btn-primary" @click="step++">Siguiente</button>
          </div>
        </div>
      </div>
    </form>
  </NuxtLayout>
</template>
