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
      <NuxtLink class="navbar-brand" href="/pacientes/inicio"
        ><img src="@/src/assets/img-vitalink-logo.svg" alt="Vitalink"
      /></NuxtLink>
      <div class="d-flex">
        <div class="collapse navbar-collapse" id="navbarTogglerDemo03">
          <ul class="navbar-nav mx-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <!-- <a class="nav-link fw-light active" aria-current="page" href="#">Home</a> -->
              <NuxtLink
                href="/pacientes/inicio"
                class="nav-link fw-light"
                active-class="active bg-primary-subtle rounded-3  px-3"
                >Home
              </NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink
                href="/pacientes/citas"
                class="nav-link fw-light"
                active-class="active bg-primary-subtle rounded-3  px-3"
                >Mis Citas</NuxtLink
              >
            </li>
          </ul>
        </div>
        <ul class="navbar-nav align-items-center">
          <li class="d-none d-md-flex nav-item">
           
              <NuxtLink href="/buscar" class="nav-link">
                <Icon name="fa6-solid:magnifying-glass" />
              </NuxtLink>
          
          </li>
          <li class="nav-item d-none d-md-flex">
            <button class="nav-link">
              <AtomsIconsNotificationsIcon />
            </button>
          </li>
          <li class="nav-item">
            <div class="dropdown">
              <button
                class="nav-link"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <img src="@/src/assets/img-avatar-sm.png" alt="avatar" />
                <AtomsIconsChevronDown />
              </button>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <a class="dropdown-item" href="/pacientes/cuenta"
                    ><Icon name="fa6-solid:user" class="text-info" /> Mi
                    Cuenta</a
                  >
                </li>
                <li>
                  <a class="dropdown-item" href="/pacientes/ayuda"
                    ><Icon name="fa6-solid:circle-info" class="text-info" />
                    Ayuda y Soporte</a
                  >
                </li>
                <li>
                  <button class="dropdown-item a" @click="logout">
                    <Icon
                      name="fa6-solid:right-from-bracket"
                      class="text-info"
                    />
                    Cerrar Sesión
                  </button>
                </li>
              </ul>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
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
