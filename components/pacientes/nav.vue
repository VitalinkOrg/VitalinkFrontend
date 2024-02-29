<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow">
    <div class="container-fluid">
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarTogglerDemo03"
        aria-controls="navbarTogglerDemo03" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>
      <NuxtLink class="navbar-brand" href="/"><img src="@/src/assets/img-vitalink-logo.svg" alt="Vitalink" /></NuxtLink>
      <div class="collapse navbar-collapse" id="navbarTogglerDemo03">
        <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <!-- <a class="nav-link fw-light active" aria-current="page" href="#">Home</a> -->
            <NuxtLink href="/pacientes/inicio" class="nav-link fw-light"
              active-class="active bg-primary-subtle rounded-3  px-3">Home
            </NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink href="/pacientes/citas" class="nav-link fw-light"
              active-class="active bg-primary-subtle rounded-3  px-3">Mis Citas</NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink href="/pacientes/vauchers" class="nav-link fw-light"
              active-class="active bg-primary-subtle rounded-3  px-3">Váuchers
            </NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink href="/pacientes/documentos" class="nav-link fw-light"
              active-class="active bg-primary-subtle rounded-3  px-3">Documentos
            </NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink href="/pacientes/facturas" class="nav-link fw-light"
              active-class="active bg-primary-subtle rounded-3  px-3">
              Facturación</NuxtLink>
          </li>
        </ul>
      </div>
      <ul class="navbar-nav d-flex align-items-center">
        <li class="nav-item">
          <button class="nav-link">
            <AtomsIconsStarOutline />
          </button>
        </li>
        <li class="nav-item"><button class="nav-link">
            <AtomsIconsNotificationsIcon />
          </button></li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" :class="open ? 'show' : ''" @click="open = !open" href="#" role="button"
            data-bs-toggle="dropdown" aria-expanded="false" data-bs-display="static">
            <img src="@/src/assets/img-avatar-sm.png" alt="avatar" />
            <AtomsIconsChevronDown />
          </a>
          <ul class="dropdown-menu dropdown-menu-start" :class="open ? 'show' : ''" style="transform: translateX(-5rem)">
            <li><a class="dropdown-item" href="#">[I] Mi Cuenta</a></li>
            <li><a class="dropdown-item" href="#">[I] Mis Reseñas</a></li>
            <li>
              <a class="dropdown-item" href="#">
                <AtomsIconsNotificationsIcon /> Notificaciones
              </a>
            </li>
            <li><a class="dropdown-item" href="#">[I] Ayuda y Soporte</a></li>
            <li>
              <button class="dropdown-item" @click="logout">
                [I] Cerrar Sesión
              </button>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import { useStore } from "~/store";
import { ref } from "vue";
const open = ref(false);
const store = useStore();
const token = useCookie("token");
const router = useRouter();

const logout = () => {
  store.authenticated = false;
  store.user = [];
  store.role = '';
  token.value = null;
  
  router.push("/pacientes/login");
};
</script>
