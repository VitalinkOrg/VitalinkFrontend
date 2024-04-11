<template>
  <nav
    class="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow"
  >
    <div class="container-fluid">
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarTogglerDemo03"
        aria-controls="navbarTogglerDemo03"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <NuxtLink class="navbar-brand" href="/"
        ><img src="@/src/assets/img-vitalink-logo.svg" alt="Vitalink"
      /></NuxtLink>
      <div class="collapse navbar-collapse" id="navbarTogglerDemo03">
        <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <!-- <a class="nav-link active" aria-current="page" href="#">Home</a> -->
            <NuxtLink href="/" class="nav-link" active-class="active"
              >Home</NuxtLink
            >
          </li>
          <li class="nav-item">
            <NuxtLink href="/pacientes/registro" class="nav-link">¿Eres paciente?</NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink href="/medicos/registro" class="nav-link"
              >¿Eres Doctor o Clínica?</NuxtLink
            >
          </li>
          <li class="nav-item">
            <NuxtLink href="/aseguradoras/registro" class="nav-link">¿Eres aseguradora?</NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink href="" class="nav-link">Nosotros</NuxtLink>
          </li>
        </ul>
        <div v-if="!store.authenticated">
          <NuxtLink href="/pacientes/login" class="btn btn-outline-dark me-2"
            >Ingresar</NuxtLink
          >
          <NuxtLink href="/pacientes/registro" class="btn btn-primary"
            >Registrarse</NuxtLink
          >
        </div>
        <div class="d-flex" v-if="store.authenticated">
          <NuxtLink @click="logout" class="btn btn-primary"
            >Cerrar sesión</NuxtLink
          >
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { useStore } from "~/store";
const store = useStore();
const token = useCookie("token");
const router = useRouter();

const logout = () => {
  store.authenticated = false;
  store.user = null;
  store.role = '';
  token.value = null;
  router.push("/pacientes/login");
};
</script>
