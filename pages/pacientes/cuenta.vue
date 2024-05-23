<script setup>
definePageMeta({
  middleware: ["auth-pacientes"],
});
const config = useRuntimeConfig();
const token = useCookie("token");
const user_info = useCookie("user_info");

const updateUser = async () => {
  const { data, error } = await useFetch(
    config.public.API_BASE_URL + "/patients/" + user_info.value.id,
    {
      method: "PUT",
      headers: { Authorization: token.value },
      body: user_info
    }
  );
  if (error.value) {
    console.log(error.value, "data");
  }
};

</script>

<template>
  <NuxtLayout name="pacientes-dashboard-perfil">
    <h4 class="fw-normal">Datos Personales</h4>
    <form class="mt-4" @submit.prevent="updateUser">
      <div class="row row-cols-md-2">
        <div class="form-group mb-3">
          <label for="nombre" class="form-label text-capitalize"
            >Nombre (s)</label
          >
          <input
            type="text"
            class="form-control"
            placeholder="Escribe tu nombre"
            v-model="user_info.first_name"
            name="nombre"
            id="nombre"
          />
        </div>
        <div class="form-group mb-3">
          <label for="apellido" class="form-label text-capitalize"
            >Apellido (s)</label
          >
          <input
            type="text"
            class="form-control"
            placeholder="Escribe tu apellido"
            :value="user_info.last_name"
            id="apellido"
            name="apellido"
          />
        </div>
        <div class="form-group mb-3">
          <label class="form-label text-capitalize" for="telefono"
            >Número de teléfono</label
          >
          <input
            type="phone"
            placeholder="+1(555) 000-0000"
            v-model="user_info.phone_number"
            id="telefono"
            name="telefono"
            class="form-control"
          />
        </div>
        <div class="form-group mb-3">
          <label
            for="direccion"
            class="form-label text-capitalize"
            name="direccion"
            >Dirección</label
          >
          <input
            type="text"
            placeholder="Dirección"
            id="direccion"
            v-model="user_info.address"
            name="direccion"
            class="form-control"
          />
        </div>
      </div>
      <div class="row row-cols-3">
        <div class="form-group mb-3">
          <label class="form-label text-capitalize" for="postal"
            >Código Postal</label
          >
          <input
            type="number"
            placeholder="00000000"
            id="postal"
            name="postal"
            v-model="user_info.postal_code"
            class="form-control"
          />
        </div>
        <div class="form-group mb-3">
          <label class="form-label text-capitalize" for="ciudad">Ciudad*</label>
          <input
            type="text"
            placeholder="Ciudad"
            id="ciudad"
            name="ciudad"
            v-model="user_info.city"
            class="form-control"
            required
          />
        </div>
        <div class="form-group mb-3">
          <label class="form-label text-capitalize" for="pais">País</label>
          <input
            type="text"
            placeholder="País"
            id="pais"
            name="pais"
            v-model="user_info.country_iso_code"
            class="form-control"
            required
          />
        </div>
      </div>
      <div class="mt-5">
        <button type="submit" class="btn btn-primary">Actualizar Perfil</button>
      </div>
    </form>
  </NuxtLayout>
</template>
