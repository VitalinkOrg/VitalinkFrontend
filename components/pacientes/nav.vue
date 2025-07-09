<template>
  <nav class="navbar navbar-expand-lg header" aria-label="Navegación principal">
    <div class="header-container">
      <!-- Botón para colapsar el menú en dispositivos móviles -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarTogglerDemo03"
        aria-controls="navbarTogglerDemo03"
        aria-expanded="false"
        aria-label="Mostrar u ocultar menú de navegación"
      >
        <span class="navbar-toggler-icon" aria-hidden="true"></span>
      </button>

      <!-- Logo / Marca -->
      <NuxtLink
        class="header-container__brand"
        href="/pacientes/inicio"
        aria-label="Inicio - Vitalink"
      >
        <img src="@/src/assets/img-vitalink-logo.svg" alt="Logo de Vitalink" />
      </NuxtLink>

      <!-- Contenido principal del menú de navegación -->
      <div class="header-container__nav">
        <!-- Menú de navegación -->
        <div class="collapse navbar-collapse" id="navbarTogglerDemo03">
          <ul class="navbar-nav mx-auto mb-2 mb-lg-0" role="menubar">
            <li class="header-container__nav-item">
              <NuxtLink
                href="/pacientes/inicio"
                class="header-container__nav-link"
                active-class="header-container__nav-link--active"
                role="menuitem"
                >Home</NuxtLink
              >
            </li>
            <li class="header-container__nav-item">
              <NuxtLink
                href="/pacientes/citas"
                class="header-container__nav-link"
                active-class="header-container__nav-link--active"
                role="menuitem"
                >Mis Citas</NuxtLink
              >
            </li>
          </ul>
        </div>

        <!-- Barra lateral derecha: iconos e información del usuario -->
        <ul class="header-container__actions">
          <!-- Búsqueda -->
          <li class="d-none d-md-flex nav-item" role="none">
            <NuxtLink
              href="/buscar"
              class="nav-link"
              aria-label="Buscar"
              role="menuitem"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 25 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M17.4268 17.5401L20.9 20.9001M19.78 11.9401C19.78 16.27 16.2699 19.7801 11.94 19.7801C7.61006 19.7801 4.09998 16.27 4.09998 11.9401C4.09998 7.61019 7.61006 4.1001 11.94 4.1001C16.2699 4.1001 19.78 7.61019 19.78 11.9401Z"
                  stroke="#353E5C"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
              <span class="visually-hidden">Buscar</span>
            </NuxtLink>
          </li>

          <!-- Notificaciones -->
          <li class="nav-item d-none d-md-flex" role="none">
            <button class="nav-link" aria-label="Notificaciones">
              <svg
                width="24"
                height="24"
                viewBox="0 0 25 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.23 21.5C14.0542 21.8031 13.8018 22.0547 13.4982 22.2295C13.1946 22.4044 12.8504 22.4965 12.5 22.4965C12.1496 22.4965 11.8054 22.4044 11.5018 22.2295C11.1982 22.0547 10.9458 21.8031 10.77 21.5M18.5 8.5C18.5 6.9087 17.8679 5.38258 16.7426 4.25736C15.6174 3.13214 14.0913 2.5 12.5 2.5C10.9087 2.5 9.38258 3.13214 8.25736 4.25736C7.13214 5.38258 6.5 6.9087 6.5 8.5C6.5 15.5 3.5 17.5 3.5 17.5H21.5C21.5 17.5 18.5 15.5 18.5 8.5Z"
                  stroke="#353E5C"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span class="visually-hidden">Notificaciones</span>
            </button>
          </li>

          <!-- Menú de usuario -->
          <li class="nav-item dropdown" role="none">
            <button
              class="nav-link d-flex align-items-center"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              aria-label="Menú de usuario"
            >
              <img
                src="@/src/assets/img-avatar-sm.png"
                alt=""
                class="rounded-circle me-2"
                width="32"
                height="32"
              />
              <AtomsIconsChevronDown />
            </button>

            <ul class="dropdown-menu dropdown-menu-end" role="menu">
              <li role="none">
                <a
                  class="dropdown-item"
                  href="/pacientes/cuenta"
                  role="menuitem"
                >
                  <Icon name="fa6-solid:user" class="text-info me-2" />
                  Mi Cuenta
                </a>
              </li>
              <li role="none">
                <a
                  class="dropdown-item"
                  href="/pacientes/ayuda"
                  role="menuitem"
                >
                  <Icon name="fa6-solid:circle-info" class="text-info me-2" />
                  Ayuda y Soporte
                </a>
              </li>
              <li role="none">
                <button class="dropdown-item" @click="logout" role="menuitem">
                  <Icon
                    name="fa6-solid:right-from-bracket"
                    class="text-info me-2"
                  />
                  Cerrar Sesión
                </button>
              </li>
            </ul>
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

<style lang="scss" scoped>
.header {
  width: 100%;
  padding: 22.5px 60px;
  background-color: #fff;
  box-shadow: 0px 4.2px 31.51px 0px #00000014;
}

.header-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &__brand {
    width: 135px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (max-width: 768px) {
      width: 90px;
      height: auto;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6.3px;
  }

  &__nav-link {
    @include label-base;
    border-radius: 13px;
    padding: 10px 15px;
    font-weight: 300;
    font-style: Light;
    font-size: 14.7px;
    line-height: 23.1px;
    text-align: center;
  }

  &__nav-link--active {
    background-color: #e2e4fa4d;
    color: #6c78e8;
    font-weight: 400;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 31px;
    list-style: none;
    margin: 0 0 0 34px;
    padding: 0;
  }
}
</style>
