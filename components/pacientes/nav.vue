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
          <li class="header-container__search nav-item" role="none">
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
          <li class="header-container__notifications nav-item" role="none">
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
              <div class="avatar-container me-2">
                <img
                  src="@/src/assets/img-avatar-sm.png"
                  alt=""
                  class="rounded-circle"
                  width="32"
                  height="32"
                />
              </div>
              <AtomsIconsChevronDown />
            </button>

            <ul
              class="dropdown-menu dropdown-menu-end user-dropdown"
              role="menu"
            >
              <li role="none">
                <NuxtLink
                  class="dropdown-item user-dropdown__item"
                  href="/pacientes/cuenta"
                  role="menuitem"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clip-path="url(#clip0_5724_48537)">
                      <path
                        d="M10.0001 9.06897C12.2283 9.06897 14.0346 7.26267 14.0346 5.03448C14.0346 2.8063 12.2283 1 10.0001 1C7.77188 1 5.96558 2.8063 5.96558 5.03448C5.96558 7.26267 7.77188 9.06897 10.0001 9.06897Z"
                        stroke="#0CADBB"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                      <path
                        d="M3.60392 18.9999H16.3964C17.8139 18.9999 18.9058 17.781 18.2439 16.5276C17.2701 14.6838 15.0501 12.4827 10.0002 12.4827C4.95021 12.4827 2.73019 14.6838 1.75641 16.5276C1.09442 17.781 2.18636 18.9999 3.60392 18.9999Z"
                        stroke="#0CADBB"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_5724_48537">
                        <rect width="20" height="20" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>

                  <span>Mi cuenta</span>
                </NuxtLink>
              </li>
              <li role="none">
                <NuxtLink
                  class="dropdown-item user-dropdown__item"
                  href="/pacientes/ayuda"
                  role="menuitem"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 18 18"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 11.5312C8.53402 11.5312 8.15625 11.909 8.15625 12.375C8.15625 12.841 8.53402 13.2187 9 13.2187V11.5312ZM9.01125 13.2187C9.47722 13.2187 9.855 12.841 9.855 12.375C9.855 11.909 9.47722 11.5312 9.01125 11.5312V13.2187ZM9 13.2187H9.01125V11.5312H9V13.2187Z"
                      fill="#0CADBB"
                    />
                    <path
                      d="M6.60713 0.99116L0.99116 6.60713L2.1844 7.8004L7.8004 2.1844L6.60713 0.99116ZM0.99116 11.3929L6.60713 17.0088L7.8004 15.8156L2.1844 10.1996L0.99116 11.3929ZM11.3929 17.0088L17.0088 11.3929L15.8156 10.1996L10.1996 15.8156L11.3929 17.0088ZM17.0088 6.60713L11.3929 0.99116L10.1996 2.1844L15.8156 7.8004L17.0088 6.60713ZM17.0088 11.3929C18.3304 10.0713 18.3304 7.92865 17.0088 6.60713L15.8156 7.8004C16.4781 8.46291 16.4781 9.53706 15.8156 10.1996L17.0088 11.3929ZM6.60713 17.0088C7.92865 18.3304 10.0713 18.3304 11.3929 17.0088L10.1996 15.8156C9.53706 16.4781 8.46291 16.4781 7.8004 15.8156L6.60713 17.0088ZM0.99116 6.60713C-0.330387 7.92865 -0.330387 10.0713 0.99116 11.3929L2.1844 10.1996C1.52187 9.53706 1.52187 8.46291 2.1844 7.8004L0.99116 6.60713ZM7.8004 2.1844C8.46291 1.52187 9.53706 1.52187 10.1996 2.1844L11.3929 0.99116C10.0713 -0.330387 7.92865 -0.330387 6.60713 0.99116L7.8004 2.1844Z"
                      fill="#0CADBB"
                    />
                    <path
                      d="M9 5.34375V9.28124"
                      stroke="#0CADBB"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>

                  <span>Ayuda y Soporte</span>
                </NuxtLink>
              </li>
              <li role="none">
                <button
                  class="dropdown-item user-dropdown__item user-dropdown__item--logout"
                  @click="logout"
                  role="menuitem"
                >
                  <svg
                    class="user-dropdown__icon"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.3962 6.1897L18.4997 10L14.3962 13.8104"
                      stroke="#0CADBB"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M18.2071 10H8.53467"
                      stroke="#0CADBB"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M13.8103 1.5H3.84483C2.54981 1.5 1.5 2.54981 1.5 3.84483V16.1552C1.5 17.4502 2.54981 18.5 3.84483 18.5H13.8103"
                      stroke="#0CADBB"
                      stroke-width="1.5"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>

                  <span>Cerrar Sesión</span>
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
  background-color: #fff;
  box-shadow: 0px 4.2px 31.51px 0px #00000014;

  padding: 15px 20px;

  @include respond-to(sm) {
    padding: 18px 30px;
  }

  @include respond-to(md) {
    padding: 20px 40px;
  }

  @include respond-to(lg) {
    padding: 22.5px 60px;
  }
}

.header-container {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;

  &__brand {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    width: 80px;
    height: 26px;

    @include respond-to(sm) {
      width: 100px;
      height: 33px;
    }

    @include respond-to(md) {
      width: 120px;
      height: 40px;
    }

    @include respond-to(lg) {
      width: 135px;
      height: 45px;
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

    @include respond-to-max(lg) {
      .navbar-collapse {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: #fff;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        border-radius: 0 0 8px 8px;
        margin-top: 15px;
        padding: 20px;
        z-index: 1000;

        .navbar-nav {
          flex-direction: column;
          gap: 10px;

          .header-container__nav-item {
            width: 100%;
            text-align: center;
          }
        }
      }
    }
  }

  &__nav-link {
    @include label-base;
    border-radius: 13px;
    padding: 10px 15px;
    font-weight: 300;
    font-style: Light;
    text-align: center;
    display: block;
    width: 100%;

    font-size: 13px;
    line-height: 20px;

    @include respond-to(sm) {
      font-size: 14px;
      line-height: 22px;
    }

    @include respond-to(lg) {
      font-size: 14.7px;
      line-height: 23.1px;
    }
  }

  &__nav-link--active {
    background-color: #e2e4fa4d;
    color: #6c78e8;
    font-weight: 400;
  }

  &__actions {
    display: flex;
    align-items: center;
    list-style: none;
    margin: 0;
    padding: 0;
    flex-shrink: 0;

    gap: 15px;

    @include respond-to(sm) {
      gap: 20px;
    }

    @include respond-to(md) {
      gap: 25px;
      margin-left: 20px;
    }

    @include respond-to(lg) {
      gap: 31px;
      margin-left: 34px;
    }
  }

  &__search {
    @include respond-to-max(sm) {
      display: none;
    }
  }

  &__notifications {
    @include respond-to-max(md) {
      display: none;
    }
  }
}

.navbar-toggler {
  border: none;
  padding: 4px 8px;

  &:focus {
    box-shadow: none;
  }

  @include respond-to(lg) {
    display: none;
  }
}

.user-dropdown {
  min-width: 200px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  margin-top: 8px;
  background-color: #ffffff;

  @include respond-to-max(sm) {
    position: absolute;
    right: 0;
    left: auto;
    min-width: 180px;
    transform: translateX(10px);
  }

  &__item {
    @include label-base;
    padding: 12px 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    border: none;
    background: transparent;
    width: 100%;
    color: #374151;
    transition: all 0.2s ease;
    font-weight: 500;
    font-style: Medium;
    font-size: 14px;
    line-height: 20px;
    letter-spacing: 0;

    color: #19213d;

    &:hover {
      background-color: #e7f7f8;
      color: #1f2937;
    }

    &:active {
      background-color: #e5e7eb;
    }

    span {
      font-weight: 400;
      line-height: 1.4;
    }
  }

  &__icon {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    color: #6b7280;
    transition: color 0.2s ease;
  }

  &__item:hover &__icon {
    color: #374151;
  }

  &__item--logout &__icon {
    color: #0891b2;
  }

  &.show {
    animation: dropdownFadeIn 0.2s ease;
  }
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.nav-link {
  svg {
    width: 20px;
    height: 20px;

    @include respond-to(sm) {
      width: 22px;
      height: 22px;
    }

    @include respond-to(md) {
      width: 24px;
      height: 24px;
    }
  }
}
.avatar-container {
  display: inline-block;
  padding: 2px;
  border-radius: 50%;
  background: linear-gradient(182.01deg, #04bfae 1.69%, #6c78e8 72.38%);
}

.rounded-circle {
  width: 39px;
  height: 39px;
  @include respond-to-max(sm) {
    width: 28px !important;
    height: 28px !important;
  }
}
</style>
