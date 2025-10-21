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
            :src="userProfilePicture"
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
const { getUserInfo } = useUserInfo();

const userInfo = getUserInfo?.() ?? null;

const userProfilePicture = computed(() => {
  return (
    userInfo?.value?.profile_picture_url ??
    userInfo?.profile_picture_url ??
    "@/assets/img-avatar-sm.png"
  );
});
</script>

<style lang="scss" scoped>
.header {
  width: 100%;
  background-color: $white;
  box-shadow: 0 0.2625rem 1.969375rem 0 rgba(0, 0, 0, 0.078125);
  padding: 0.9375rem 1.25rem;

  @include respond-to(sm) {
    padding: 1.125rem 1.875rem;
  }

  @include respond-to(md) {
    padding: 1.25rem 2.5rem;
  }

  @include respond-to(lg) {
    padding: 1.40625rem 3.75rem;
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
    width: 5rem;
    height: 1.625rem;

    @include respond-to(sm) {
      width: 6.25rem;
      height: 2.0625rem;
    }

    @include respond-to(md) {
      width: 7.5rem;
      height: 2.5rem;
    }

    @include respond-to(lg) {
      width: 8.4375rem;
      height: 2.8125rem;
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
    gap: 0.39375rem;

    @include respond-to-max(lg) {
      .navbar-collapse {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: $white;
        box-shadow: 0 0.25rem 0.375rem rgba(0, 0, 0, 0.1);
        border-radius: 0 0 0.5rem 0.5rem;
        margin-top: 0.9375rem;
        padding: 1.25rem;
        z-index: 1000;

        .navbar-nav {
          flex-direction: column;
          gap: 0.625rem;

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
    border-radius: 0.8125rem;
    padding: 0.625rem 0.9375rem;
    font-weight: 300;
    font-style: normal;
    text-align: center;
    display: block;
    width: 100%;
    font-size: 0.8125rem;
    line-height: 1.25rem;

    @include respond-to(sm) {
      font-size: 0.875rem;
      line-height: 1.375rem;
    }

    @include respond-to(lg) {
      font-size: 0.91875rem;
      line-height: 1.44375rem;
    }
  }

  &__nav-link--active {
    background-color: rgba(226, 228, 250, 0.3);
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
    gap: 0.9375rem;

    @include respond-to(sm) {
      gap: 1.25rem;
    }

    @include respond-to(md) {
      gap: 1.5625rem;
      margin-left: 1.25rem;
    }

    @include respond-to(lg) {
      gap: 1.9375rem;
      margin-left: 2.125rem;
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
  padding: 0.25rem 0.5rem;

  &:focus {
    box-shadow: none;
  }

  @include respond-to(lg) {
    display: none;
  }
}

.user-dropdown {
  min-width: 12.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  background-color: $white;

  @include respond-to-max(sm) {
    position: absolute;
    right: 0;
    left: auto;
    min-width: 11.25rem;
    transform: translateX(0.625rem);
  }

  &__item {
    @include label-base;
    padding: 0.75rem 1rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border: none;
    background: transparent;
    width: 100%;
    color: $color-foreground;
    transition: all 0.2s ease;
    font-weight: 500;
    font-style: normal;
    font-size: 0.875rem;
    line-height: 1.25rem;
    letter-spacing: 0;

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
    width: 1.25rem;
    height: 1.25rem;
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
    transform: translateY(-0.5rem) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.nav-link {
  svg {
    width: 1.25rem;
    height: 1.25rem;

    @include respond-to(sm) {
      width: 1.375rem;
      height: 1.375rem;
    }

    @include respond-to(md) {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
}

.avatar-container {
  display: inline-block;
  padding: 0.125rem;
  border-radius: 50%;
  background: linear-gradient(182.01deg, #04bfae 1.69%, #6c78e8 72.38%);
}

.rounded-circle {
  width: 2.4375rem;
  height: 2.4375rem;
  @include respond-to-max(sm) {
    width: 1.75rem !important;
    height: 1.75rem !important;
  }
}
</style>
