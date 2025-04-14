<script setup>
definePageMeta({
  middleware: ["auth-pacientes"],
});
</script>

<template>
  <NuxtLayout name="socio-dashboard-perfil">
    <form class="mt-4" @submit.prevent="updateUser">
      <div>
        <p class="fw-bold">Email, contraseña y seguridad</p>
        <p>
          Administra tus contraseñas, preferencias de inicio de sesión y métodos
          de recuperación.
        </p>
        <div class="form-group mb-3">
          <label for="nombre" class="form-label text-capitalize">Email*</label>
          <input
            type="mail"
            class="form-control"
            placeholder="Dra.Stephanie Powell@gmail..."
            v-model="firstName"
            name="nombre"
            id="nombre"
          />
        </div>
        <div class="form-group mb-3">
          <label for="nombre" class="form-label text-capitalize"
            >Contraseña</label
          >
          <input
            type="password"
            class="form-control"
            placeholder="*******************"
            v-model="firstName"
            name="nombre"
            id="nombre"
          />
        </div>
      </div>
      <div class="mt-5">
        <button type="submit" class="btn btn-primary">
          Cambiar Contraseña
        </button>
      </div>
    </form>
  </NuxtLayout>
</template>
