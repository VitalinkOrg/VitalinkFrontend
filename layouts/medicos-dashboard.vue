<script setup>
import { ref } from "vue";
definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});
const sort = ref(false);
const token = useCookie("token");
const refreshToken = useCookie("refresh_token");
const role = useCookie("role");
const authenticated = useCookie("authenticated");
// const user_info = useCookie("user_info");

const user_info = {
  services: [
    { id: 101, name: "Mock Service A" },
    { id: 102, name: "Mock Service B" },
  ],
  specialties: [
    { id: 201, name: "Mock Specialty X" },
    { id: 202, name: "Mock Specialty Y" },
  ],
  hospitals: [
    { id: 301, name: "Mock Hospital 1" },
    { id: 302, name: "Mock Hospital 2" },
  ],
  first_name: "MockFirstName",
  name: "FallbackMockFirstName", // If first_name is undefined
  last_name: "MockLastName",
  phone_number: "123-456-7890",
  phone_number_1: "987-654-3210", // If phone_number is undefined
  address: "Mock Address 123",
  city: "Mock City",
  country_iso_code: "MCK",
  postal_code: "12345",
  description: "Mock Description of User",
  medical_license_number: "MLN-123",
  medical_number: "MN-456", // If medical_license_number is undefined
};
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
  <div v-if="pending"></div>
  <div v-else class="dashboard bg-light">
    <div class="dashboard-sidebar bg-white shadow p-4">
      <nav class="nav d-flex flex-column align-items-start w-100">
        <NuxtLink href="/medicos/inicio" class="mb-5 ps-3">
          <AtomsVitalinkLogo />
        </NuxtLink>
        <li class="nav-item w-100 mb-3">
          <NuxtLink
            href="/medicos/inicio"
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
            href="/medicos/citas"
            class="nav-link rounded-3 py-3 text-dark d-flex align-items-center"
            active-class="bg-primary"
            style="--bs-bg-opacity: 0.05"
          >
            <span class="text-primary me-3">
              <AtomsIconsCitasIcon />
            </span>
            Citas
          </NuxtLink>
        </li>
        <li class="nav-item w-100 mb-3">
          <NuxtLink
            href="/medicos/servicios"
            class="nav-link rounded-3 py-3 text-dark d-flex align-items-center"
            active-class="bg-primary"
            style="--bs-bg-opacity: 0.05"
          >
            <span class="text-primary me-3">
              <AtomsIconsServiciosIcon />
            </span>
            Servicios
          </NuxtLink>
        </li>
        <li class="nav-item w-100 mb-3">
          <NuxtLink
            href="/medicos/pacientes"
            class="nav-link rounded-3 py-3 text-dark d-flex align-items-center"
            active-class="bg-primary"
            style="--bs-bg-opacity: 0.05"
          >
            <span class="text-primary me-3">
              <AtomsIconsPacientesIcon />
            </span>
            Pacientes
          </NuxtLink>
        </li>
        <li class="nav-item w-100 mb-3">
          <!-- <li class="nav-item w-100 mb-3" v-if="role === 'R_DOC'"> -->
          <NuxtLink
            href="/medicos/hospitales"
            class="nav-link rounded-3 py-3 text-dark d-flex align-items-center"
            active-class="bg-primary"
            style="--bs-bg-opacity: 0.05"
          >
            <span class="text-primary me-3">
              <AtomsIconsHospitalesIcon />
            </span>
            Hospitales
          </NuxtLink>
        </li>
      </nav>
      <nav class="nav">
        <hr />
        <li class="nav-item">
          <NuxtLink
            class="nav-link text-dark d-flex align-items-center"
            href="/medicos/inicio"
          >
            <span class="text-success me-3">
              <AtomsIconsInfoIcon />
            </span>
            Ayuda y Soporte
          </NuxtLink>
        </li>
        <li class="nav-item">
          <button
            class="nav-link text-dark d-flex align-items-center"
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
              <button class="btn btn-link mx-2">
                <AtomsIconsNotificationsIcon />
              </button>
              <div class="dropdown">
                <button
                  class="btn dropdown-toggle"
                  @click="sort = !sort"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <img src="@/src/assets/img-avatar-sm.png" alt="avatar" />
                </button>
                <ul class="dropdown-menu" :class="sort ? 'show' : ''">
                  <li>
                    <NuxtLink class="dropdown-item" href="/medicos/perfil"
                      >Perfil
                    </NuxtLink>
                  </li>
                  <li>
                    <NuxtLink class="dropdown-item" href="/medicos/perfil"
                      >Configuración</NuxtLink
                    >
                  </li>
                  <li>
                    <NuxtLink class="dropdown-item" href="/medicos/resenas"
                      >Reseñas</NuxtLink
                    >
                  </li>
                  <li>
                    <NuxtLink class="dropdown-item" href="/medicos/perfil"
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
            <slot :res="res" />
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
