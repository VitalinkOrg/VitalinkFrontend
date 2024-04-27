<script setup>
import { useStore } from "~/store";
import { ref } from "vue";
import { useRefreshToken } from "#imports";
const sort = ref(false);
const router = useRouter();
const store = useStore();
const config = useRuntimeConfig();
const token = useCookie("token");

const { data: insurance } = await useFetch(
  config.public.API_BASE_URL + "/insurances/get_insurance_info",
  {
    headers: { Authorization: token.value },
    transform: (_insurance) => _insurance.data,
  }
);
if (insurance.length) {
  store.user = [];
  store.user = insurance;
  useRefreshToken();
}

const logout = () => {
  store.authenticated = false;
  store.user = null;
  store.role = '';
  token.value = null;
  router.push("/pacientes/login");
};
</script>
<template>
  <div class="dashboard bg-light">
    <div class="dashboard-sidebar bg-white shadow py-4 px-2">
      <nav class="nav d-flex flex-column align-items-start w-100">
        <span class="mb-5 ps-3">
          <AtomsVitalinkLogo />
        </span>
        <li class="nav-item w-100 mb-3">
          <NuxtLink href="/aseguradoras/inicio" class="nav-link rounded-3 py-3 text-dark d-flex align-items-center"
            active-class="bg-primary" style="--bs-bg-opacity: 0.05">
            <span class="text-primary me-3">
              <AtomsIconsHomeIcon />
            </span> Inicio
          </NuxtLink>
        </li>
        <li class="nav-item w-100 mb-3">
          <NuxtLink href="/aseguradoras/vauchers" class="nav-link rounded-3 py-3 text-dark d-flex align-items-center"
            active-class="bg-primary" style="--bs-bg-opacity: 0.05">
            <span class="text-primary me-3">
              <AtomsIconsVaucherIcon />
            </span> Gestor de Váuchers
          </NuxtLink>
        </li>
        <li class="nav-item w-100 mb-3">
          <NuxtLink href="/aseguradoras/proveedores" class="nav-link rounded-3 py-3 text-dark d-flex align-items-center"
            active-class="bg-primary" style="--bs-bg-opacity: 0.05">
            <span class="text-primary me-3">
              <AtomsIconsServiciosIcon />
            </span> Proveedores
          </NuxtLink>
        </li>
      </nav>
      <nav class="nav">
        <hr>
        <li class="nav-item">
          <NuxtLink class="nav-link text-dark d-flex align-items-center" href="/aseguradoras/inicio">
            <span class="text-success me-3">
              <AtomsIconsInfoIcon />
            </span> Ayuda y Soporte
          </NuxtLink>
        </li>
        <li class="nav-item">
          <button class="dropdown-item text-dark d-flex align-items-center" @click="logout">
            <span class="text-success me-3">
              <AtomsIconsLogoutDashboardIcon />
            </span> Cerrar Sesión
          </button>
        </li>
      </nav>
    </div>
    <main class="w-100 px-3 pb-5 " style="height: 100vh; overflow-y: auto;">
      <div class="container-fluid">
        <div class="row">
          <div class="col">
            <div class=" d-flex justify-content-end align-items-center py-3">
              <div class="input-group shadow-sm w-auto">
                <span class="input-group-text bg-transparent border-end-0 rounded-start-3" id="basic-addon1">
                  <AtomsIconsSearchIcon />
                </span>
                <input type="text" class="form-control border-start-0 rounded-end-3" placeholder="Buscar"
                  aria-label="Buscar" aria-describedby="basic-addon1">
              </div>
              <button class="btn btn-link">
                <AtomsIconsNotificationsIcon />
              </button>
              <div class="dropdown">
                <button class="btn dropdown-toggle" @click="sort = !sort" type="button" data-bs-toggle="dropdown"
                  aria-expanded="false">
                  {{ insurance.name }}
                </button>
                <ul class="dropdown-menu dropdown-menu-end" :class="sort ? 'show' : ''">
                  <li>
                    <NuxtLink class="dropdown-item" href="/aseguradoras/configuracion">Configuración</NuxtLink>
                  </li>
                  <li>
                  </li>
                  <li>
                    <NuxtLink class="dropdown-item" href="/aseguradoras/inicio">Ayuda y Soporte</NuxtLink>
                  </li>
                  <li>
                    <button class="dropdown-item" @click="logout">Cerrar Sesión</button>
                  </li>
                </ul>
              </div>
            </div>
            <slot />
          </div>
        </div>

      </div>
    </main>
  </div>
</template>
<style src="@/assets/styles/vitalink.scss" />
<style scoped lang="scss">
.dashboard {
  height: 100vh;
  display: flex;


  &-sidebar {
    height: 100%;
    max-width: 15rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
  }
}

.dropdown-menu-end.show {
  transform: translateX(-100px);
}
</style>