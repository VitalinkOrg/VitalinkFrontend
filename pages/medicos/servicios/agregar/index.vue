<script setup>
import { useStore } from "~/store";
definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});
const config = useRuntimeConfig();
const token = useCookie("token");
const firstName = ref("");
const lastName = ref("");
const phoneNumber = ref("");
const address = ref("");
const city = ref("");
const country_iso_code = ref("");
const postal_code = ref("");

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
  <NuxtLayout name="medicos-dashboard">
    <nav style="--bs-breadcrumb-divider: '/'" aria-label="breadcrumb">
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
        user.last_name ? updateDoctor($event) : updateHospital($event)
      "
    >
      <div class="card border-0 shadow rounded-3">
        <div class="card-body p-4">
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
                >Escribe una breve descripción sobre el servicio que brindarás</small
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
          <div class="d-flex justify-content-end mt-5 gap-4">
            <button class="btn btn-outline-dark fw-light">
                Atrás
              </button>
            <button type="submit" class="btn btn-primary">
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </form>
  </NuxtLayout>
</template>
