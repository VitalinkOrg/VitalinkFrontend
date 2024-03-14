<script setup>
import { useStore } from "~/store";
const config = useRuntimeConfig();
const token = useCookie("token");
const store = useStore();
const user = store.user;
const specialties = ref([]);
const services = ref([]);

const getSpecialities = async () => {
  const {
    data: res,
    error,
  } = await useFetch(config.public.API_BASE_URL + "/specialties", {
    transform: (_res) => _res.data,
  });
  if (res) {
    specialties.value = res.value.filter((item1) => {
      return store.user.specialties.find((item2) => item1.code === item2);
    });
  }
  if (error.value) {
    console.log(error.value, "data");
  }
};

const getServices = async () => {
  const {
    data: res,
    error,
    pending,
  } = await useFetch(config.public.API_BASE_URL + "/services", {
    transform: (_res) => _res.data,
  });
  if (res) {
    services.value = res.value.filter((item1) => {
      return store.user.services.find((item2) => item1.code === item2);
    });
  }
  if (error.value) {
    console.log(error.value, "data");
  }
};

onMounted(() => {
  getSpecialities();
  getServices();
});
</script>

<template>
  <NuxtLayout name="medicos-dashboard-perfil">
    <div v-if="pending"></div>
    <div v-else>
      <p class="m-0">Especialidades Médicas</p>
      <p class="text-muted fw-light">
        Escribe las Especialidades médicas que ofrecerás en la plataforma.
      </p>
      <button
        v-for="specialty in specialties"
        :key="specialty.id"
        class="btn btn-light border w-100 fw-light text-start d-flex bg-white justify-content-between align-items-center mb-3"
      >
        <span>{{ specialty.name }}</span>
        <span class="fw-semibold">
          <AtomsIconsTimesXIcon />
        </span>
      </button>

      <div class="bg-primary rounded-4 p-3 mb-3" style="--bs-bg-opacity: 0.1">
        <input
          type="text"
          placeholder="Escriba la especialidad"
          class="form-control"
        />
        <div class="text-end mt-2">
          <button class="btn btn-link text-dark">Cancelar</button>
          <button class="btn btn-light fw-light border-dark">Guardar</button>
        </div>
      </div>

      <button class="btn btn-info text-white">
        <AtomsIconsPlusIcon /> Agregar
      </button>

      <hr />
      <p class="m-0">Servicios / Procedimientos</p>
      <p class="text-muted fw-light">
        Agrega los servicios médicos que ofrecerás en la plataforma.
      </p>
      <button
        v-for="service in services"
        :key="service.id"
        class="btn btn-light border w-100 fw-light text-start d-flex bg-white justify-content-between align-items-center mb-3"
      >
        <span>{{ service.name }}</span>
        <span class="fw-semibold">
          <AtomsIconsTimesXIcon />
        </span>
      </button>

      <button class="btn btn-info text-white">
        <AtomsIconsPlusIcon /> Agregar
      </button>
    </div>
  </NuxtLayout>
</template>
