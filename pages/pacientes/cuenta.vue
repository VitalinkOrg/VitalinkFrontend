<script setup>
definePageMeta({
  middleware: ["auth-pacientes"],
});

const config = useRuntimeConfig();
const token = useCookie("token");
const user_info = useCookie("user_info");
const profilePicture = ref(null); // To store the selected file
const imagePreview = ref(null); // To store the image preview URL

// Handle file selection
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    profilePicture.value = file; // Store the file
    imagePreview.value = URL.createObjectURL(file); // Create a preview URL
  }
};

// Update user profile
const updateUser = async () => {
  const formData = new FormData();

  // Append user info to the form data
  for (const key in user_info.value) {
    formData.append(key, user_info.value[key]);
  }

  // Append the profile picture if selected
  if (profilePicture.value) {
    formData.append("profile_picture", profilePicture.value);
  }

  const { data, error } = await useFetch(
    config.public.API_BASE_URL + "/patients/" + user_info.value.id,
    {
      method: "PUT",
      headers: { Authorization: token.value },
      body: formData,
    }
  );

  if (error.value) {
    console.log(error.value, "Error updating profile");
  } else {
    console.log("Profile updated successfully", data.value);
    // Optionally, update the user_info cookie with the new data
    user_info.value = data.value;
  }
};
</script>

<template>
  <NuxtLayout name="pacientes-dashboard-perfil">
    <h4 class="fw-normal">Foto de Perfil</h4>
    <div class="d-flex align-items-end">
      <div class="profile-picture-container">
        <img
          :src="
            imagePreview ||
            user_info.profile_picture ||
            '/_nuxt/src/assets/picture.svg'
          "
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

    <h4 class="fw-normal mt-2">Datos Personales</h4>
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
            v-model="user_info.last_name"
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

.profile-picture-container img {
  width: 130px;
  height: 132px;
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
