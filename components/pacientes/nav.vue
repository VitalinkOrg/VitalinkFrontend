<template>
  <nav class="navbar navbar-expand-lg header" aria-label="Navegación principal">
    <div class="header-container">
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

      <NuxtLink
        class="header-container__brand"
        href="/pacientes/inicio"
        aria-label="Inicio - Vitalink"
      >
        <img src="@/src/assets/img-vitalink-logo.svg" alt="Logo de Vitalink" />
      </NuxtLink>

      <div class="header-container__nav">
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

        <ul class="header-container__actions">
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
          <UiInputDropdownMenu
            :src="imgVitalinkLogo"
            :hide-default-items="['perfil', 'configuracion', 'resenas']"
            :custom-urls="{
              cuenta: '/pacientes/cuenta',
              ayuda: '/pacientes/ayuda',
            }"
          />
        </ul>
      </div>
    </div>
  </nav>
</template>

<script lang="ts" setup>
import imgVitalinkLogo from "@/src/assets/img-avatar-sm.png";
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
