<script setup>
import { ref } from "vue";
const sort = ref(false);
const token = useCookie("token");
const refreshToken = useCookie("refresh_token");
const role = useCookie("role");
const authenticated = useCookie("authenticated");
const user_info = useCookie("user_info");
const router = useRouter();

const logout = () => {
  token.value = null;
  refreshToken.value = null;
  role.value = null;
  authenticated.value = null;
  user_info.value = null;
  router.push("/pacientes/login");
};
</script>
<template>
  <div class="dashboard bg-light">
    <div class="dashboard-sidebar bg-white shadow py-4 px-2">
      <nav class="nav d-flex flex-column align-items-start w-100">
        <NuxtLink href="/socio-financiero/inicio" class="mb-5 ps-3">
          <AtomsVitalinkLogo />
        </NuxtLink>
        <li class="nav-item w-100 mb-3">
          <NuxtLink
            href="/socio-financiero/inicio"
            class="nav-link rounded-3 py-3 text-dark d-flex align-items-center"
            active-class="bg-primary"
            style="--bs-bg-opacity: 0.05"
          >
            <span class="text-primary me-3">
              <AtomsIconsHomeIcon />
            </span>
            Inicio
          </NuxtLink>
        </li>
        <li class="nav-item w-100 mb-3">
          <NuxtLink
            href="/socio-financiero/creditos"
            class="nav-link rounded-3 py-3 text-dark d-flex align-items-center"
            active-class="bg-primary"
            style="--bs-bg-opacity: 0.05"
          >
            <span class="text-primary me-3">
              <AtomsIconsVaucherIcon />
            </span>
            Gestor de créditos
          </NuxtLink>
        </li>
      </nav>
      <nav class="nav">
        <hr />
        <li class="nav-item">
          <NuxtLink
            class="nav-link text-dark d-flex align-items-center"
            href="/socio-financiero/inicio"
          >
            <span class="text-success me-3">
              <AtomsIconsInfoIcon />
            </span>
            Ayuda y Soporte
          </NuxtLink>
        </li>
        <li class="nav-item">
          <button
            class="dropdown-item nav-link text-dark d-flex align-items-center"
            @click="logout"
          >
            <span class="text-success me-3">
              <AtomsIconsLogoutDashboardIcon />
            </span>
            Cerrar Sesión
          </button>
        </li>
      </nav>
    </div>
    <main class="w-100 px-3 pb-5" style="height: 100vh; overflow-y: auto">
      <div class="container-fluid">
        <div class="row">
          <div class="col">
            <div class="d-flex justify-content-end align-items-center py-3">
              <div class="input-group shadow-sm w-auto">
                <span
                  class="input-group-text bg-transparent border-end-0 rounded-start-3"
                  id="basic-addon1"
                >
                  <AtomsIconsSearchIcon />
                </span>
                <input
                  type="text"
                  class="form-control border-start-0 rounded-end-3"
                  placeholder="Buscar"
                  aria-label="Buscar"
                  aria-describedby="basic-addon1"
                />
              </div>
              <button class="btn btn-link">
                <AtomsIconsNotificationsIcon />
              </button>
              <div class="dropdown">
                <button
                  v-if="user_info"
                  class="btn dropdown-toggle"
                  @click="sort = !sort"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  {{ user_info.name }}
                </button>
                <ul class="dropdown-menu" :class="sort ? 'show' : ''">
                  <li>
                    <NuxtLink
                      class="dropdown-item"
                      href="/socio-financiero/perfil"
                      >Configuración</NuxtLink
                    >
                  </li>
                  <li></li>
                  <li>
                    <NuxtLink
                      class="dropdown-item"
                      href="/socio-financiero/inicio"
                      >Ayuda y Soporte</NuxtLink
                    >
                  </li>
                  <li>
                    <button class="dropdown-item" @click="logout">
                      Cerrar Sesión
                    </button>
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
</style>
