<script setup>
/*definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});*/
const config = useRuntimeConfig();
const token = useCookie("token");
const user_info = useCookie("user_info");
const user = user_info.value;
const firstName = ref(user.first_name || user.name);
const lastName = ref(user.last_name);
const phoneNumber = ref(user.phone_number || user.phone_number_1);
const address = ref(user.address);
const city = ref(user.city);
const country_iso_code = ref(user.country_iso_code);
const postal_code = ref(user.postal_code);
const profilePicture = ref(null); // To store the selected file
const imagePreview = ref(null); // To store the image preview URL

const updateDoctor = async () => {
  const { data: user, error } = await useFetch(
    config.public.API_BASE_URL + "/doctors/update_doctor",
    {
      method: "PUT",
      headers: { Authorization: token.value },
      transform: (_user) => _user.data,
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
  if (user) {
    user_info.value = user.value;
  }
  if (error.value) {
    console.log(error.value, "data");
  }
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    profilePicture.value = file; // Store the file
    imagePreview.value = URL.createObjectURL(file); // Create a preview URL
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
  <NuxtLayout name="socio-dashboard-perfil">
    <h4 class="fw-normal">Datos Personales</h4>
    <form
      class="mt-4"
      @submit.prevent="
        user.last_name ? updateDoctor($event) : updateHospital($event)
      "
    >
      <div class="form-group mb-3">
        <label class="fw-normal">Foto de Perfil</label>
        <div class="d-flex align-items-end">
          <div class="profile-picture-container">
            <img
              :src="
                imagePreview ||
                user_info.profile_picture ||
                '/_nuxt/src/assets/picture.svg'
              "
              :class="!profilePicture ? 'preview' : 'uploaded'"
              alt="Profile Picture"
            />
          </div>
          <label
            for="upload-picture"
            class="bg-primary badge upload-picture-button mb-0"
          >
            <img src="@/src/assets/camera.svg" alt="Upload Picture" />
          </label>
          <input
            type="file"
            id="upload-picture"
            accept="image/*"
            style="display: none"
            @change="handleFileChange"
          />
        </div>
      </div>
      <div class="row row-cols-2">
        <div class="form-group mb-3">
          <label for="nombre" class="form-label text-capitalize"
            >Nombre (s)</label
          >
          <input
            type="text"
            class="form-control"
            placeholder="Escribe tu nombre"
            v-model="firstName"
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
            :value="user.last_name"
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
            v-model="phoneNumber"
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
            v-model="address"
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
            v-model="postal_code"
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
            v-model="city"
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
            v-model="country_iso_code"
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
<style>
.profile-picture-container {
  border-radius: 18px;
  border: 3px solid var(--Primary-Gradients-Violet-02, #c2c6e9);
  background: #f8faff;
  width: 130px;
  height: 132px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-picture-container .preview {
  width: 40px;
  height: 40px;
}

.profile-picture-container .uploaded {
  width: 100%;
}

.upload-picture-button {
  border-radius: 39px;
  width: 40px;
  height: 40px;
  margin-left: -25px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
