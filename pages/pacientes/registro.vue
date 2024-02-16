<template>
  <NuxtLayout name="pacientes-login">
    <h1 class="text-center fw-semibold fs-2">Registrarse</h1>
    <p class="text-center text-muted fw-light fs-56">Es gratis y fácil</p>

    <form @submit.prevent="register">
      <div class="form-group mb-4">
        <label for="nombre" class="form-label text-capitalize">Tu Nombre</label>
        <input
          v-model="name"
          type="text"
          class="form-control"
          id="nombre"
          aria-describedby="nombreHelp"
          placeholder="Escribe tu nombre"
          required
        />
        <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
      </div>
      <div class="form-group mb-4">
        <label for="email" class="form-label text-capitalize"
          >Tu correo electrónico o número de teléfono</label
        >
        <input
          v-model="email"
          type="email"
          class="form-control"
          id="email"
          aria-describedby="emailHelp"
          placeholder="Tu correo electrónico o número de teléfono"
          required
        />
        <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
      </div>
      <div class="form-group mb-4">
        <label for="password" class="form-label text-capitalize"
          >Contraseña</label
        >
        <input
          v-model="password"
          type="password"
          class="form-control"
          id="password"
          placeholder="Escribe tu contraseña"
          aria-describedby="passwordHelp"
          required
        />
        <div id="passwordHelp" class="form-text">
          Deben ser 8 caracteres como mínimo
        </div>
      </div>
      <div class="form-check">
        <input
          type="checkbox"
          class="form-check-input border-dark"
          id="recordarme"
        />
        <label class="form-check-label fw-light" for="recordarme"
          ><small>Recordarme</small></label
        >
      </div>
      <div class="form-check">
        <input
          type="checkbox"
          class="form-check-input border-dark"
          id="condiciones"
        />
        <label class="form-check-label fw-light" for="condiciones"
          ><small
            >He leído y acepto la Política de Privacidad y condiciones de
            uso</small
          ></label
        >
      </div>
      <button type="submit" class="btn btn-primary w-100 mt-4">
        Registrarme
      </button>
      <div class="text-center py-3">
        <NuxtLink class="btn-link" href="/pacientes/login"
          >Ya tienes una cuenta?</NuxtLink
        >
      </div>
    </form>
    <hr />
    <p class="text-center">
      <small class="text-muted">O hacerlo con estas cuentas</small>
    </p>
    <div class="text-center">
      <button class="btn btn-light border-dark-subtle">
        <AtomsIconsGoogleIcon />
      </button>
      <button class="btn btn-light border-dark-subtle mx-4">
        <AtomsIconsAppleIcon />
      </button>
      <button class="btn btn-light border-dark-subtle">
        <AtomsIconsFacebookIcon />
      </button>
    </div>
  </NuxtLayout>
</template>

<script lang="ts" setup>
import { useStore } from "~/store";

const config = useRuntimeConfig();
const router = useRouter();
const store = useStore();
const token = useCookie("token");
const name = ref("");
const email = ref("");
const password = ref("");

const register = async () => {
  const { data, error }: any = await useFetch(
    config.public.API_BASE_URL + "/users/register_patient",
    {
      method: "POST",
      body: {
        name,
        email,
        password,
      },
    }
  );
  if (data.value) {
    router.push("/");
  }
  if (error.value) {
    console.log(error.value, "data");
  }
};
</script>
