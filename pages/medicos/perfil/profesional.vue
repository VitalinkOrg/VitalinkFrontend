<script setup>
definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});
const config = useRuntimeConfig();
const token = useCookie("token");
const user_info = useCookie("user_info");
const description = ref(user_info.value.description);
const medicalNumber = ref(
  user_info.value.medical_license_number || user_info.value.medical_number
);

const updateDoctor = async () => {
  const { data: user, error } = await useFetch(
    config.public.API_BASE_URL + "/doctors/update_doctor",
    {
      method: "PUT",
      headers: { Authorization: token.value },
      transform: (_user) => _user.data,
      body: {
        description,
        medical_license_number: medicalNumber,
      },
    }
  );
  if (user) {
    user_info.value = user.value;
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
        description,
        medical_number: medicalNumber,
        group_name: user_info.group_name,
        name: user_info.name,
      },
    }
  );
  if (error.value) {
    console.log(error.value, "data");
  }
};
</script>

<template>
  <NuxtLayout name="medicos-dashboard-perfil">
    <!-- <p class="mb-0">Foto de Perfil</p>
    <p class="text-muted fw-light">
      Esta será la foto que vean tu pacientes cuando encuentren tu perfil en
      Vitalink
    </p> -->
    <form
      @submit.prevent="
        user_info.last_name ? updateDoctor($event) : updateHospital($event)
      "
    >
      <!-- <div>
        <input
          type="file"
          id="avatar"
          name="avatar"
          accept="image/png, image/jpeg"
          class="form-control"
        />
      </div>
      <hr /> -->
      <div class="form-group mb-3">
        <label for="descripcion" class="form-label text-capitalize"
          >Escribe una breve descripción profesional</label
        >
        <textarea
          name="descripcion"
          id="descripcion"
          cols="30"
          rows="3"
          class="form-control"
          v-model="description"
          placeholder="Escribe una descripción sobre ti y tu experiencia profesional"
        ></textarea>
      </div>
      <div class="form-group mb-3">
        <label for="matricula-medica" class="form-label text-capitalize"
          >Nº Matrícula Médica
        </label>
        <input
          type="text"
          name="matricula-medica"
          id="matricula-medica"
          v-model="medicalNumber"
          placeholder="Escribe el número de tu matrícula"
          class="form-control"
        />
      </div>
      <div class="mt-5">
        <button type="submit" class="btn btn-primary">Actualizar Perfil</button>
      </div>
    </form>
  </NuxtLayout>
</template>
