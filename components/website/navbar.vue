<template>
  <header class="header" :class="{ 'header--hidden': isHidden }">
    <nav class="nav" aria-label="Navegación principal">
      <div>
        <NuxtLink
          class="nav__brand"
          to="/"
          aria-label="Ir a la página de inicio"
        >
          <img src="@/src/assets/img-vitalink-logo.svg" alt="Vitalink" />
        </NuxtLink>
      </div>

      <button
        class="nav__toggle"
        :aria-expanded="isMenuOpen"
        aria-controls="nav-menu"
        aria-label="Menú de navegación"
        @click="toggleMenu"
        @keydown.enter="toggleMenu"
        @keydown.space.prevent="toggleMenu"
      >
        <span class="nav__toggle-icon" aria-hidden="true"></span>
      </button>

      <ul
        id="nav-menu"
        class="nav__menu"
        :class="{ 'nav__menu--open': isMenuOpen }"
        role="list"
      >
        <li class="nav__menu-item" role="listitem">
          <NuxtLink to="#home" class="nav__menu-link" @click="closeMenu"
            >Home</NuxtLink
          >
        </li>
        <li class="nav__menu-item" role="listitem">
          <NuxtLink
            href="#key_benefits"
            class="nav__menu-link"
            @click="closeMenu"
            >Beneficios clave</NuxtLink
          >
        </li>
        <li class="nav__menu-item" role="listitem">
          <NuxtLink
            to="#how-does-it-work"
            class="nav__menu-link"
            @click="closeMenu"
            >¿Cómo funciona?</NuxtLink
          >
        </li>
        <li class="nav__menu-item" role="listitem">
          <NuxtLink to="#trust" class="nav__menu-link" @click="closeMenu"
            >Confianza</NuxtLink
          >
        </li>
        <li class="nav__menu-item" role="listitem">
          <NuxtLink to="#specialties" class="nav__menu-link" @click="closeMenu"
            >Especialidades</NuxtLink
          >
        </li>
        <li class="nav__menu-item" role="listitem">
          <NuxtLink to="#faqs" class="nav__menu-link" @click="closeMenu"
            >Preguntas frecuentes</NuxtLink
          >
        </li>
      </ul>

      <div class="nav__actions">
        <template v-if="isAuthenticated">
          <button class="nav__button--primary" @click="handleLogout">
            Cerrar Sesión
          </button>
        </template>
        <template v-else>
          <NuxtLink
            to="/pacientes/login"
            class="nav__button--outline"
            @click="closeMenu"
            >Ingresar</NuxtLink
          >
          <NuxtLink
            to="/registro"
            class="nav__button--primary"
            @click="closeMenu"
            >Registrarse</NuxtLink
          >
        </template>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { useAuth } from "@/composables/api";

const { getToken } = useAuthToken();
const { logout } = useAuth();
const router = useRouter();
const route = useRoute();

const isHidden = ref(false);
const isMenuOpen = ref(false);
const isAuthenticated = ref(false);
let lastScrollY = 0;
let ticking = false;

watch(
  () => getToken(),
  (newToken) => {
    isAuthenticated.value = !!newToken;
  },
  { immediate: true }
);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
  if (isMenuOpen.value) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
};

const closeMenu = () => {
  isMenuOpen.value = false;
  document.body.style.overflow = "";
};

const handleLogout = () => {
  logout();
  if (route.path !== "/") router.push("/pacientes/login");
  closeMenu();
};

const handleScroll = () => {
  if (!ticking) {
    window.requestAnimationFrame(() => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        isHidden.value = true;
        closeMenu();
      } else if (currentScrollY < lastScrollY) {
        isHidden.value = false;
      }

      lastScrollY = currentScrollY;
      ticking = false;
    });
    ticking = true;
  }
};

onMounted(() => {
  lastScrollY = window.scrollY;
  window.addEventListener("scroll", handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  document.body.style.overflow = "";
});
</script>

<style lang="scss" scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: $white;
  box-shadow: 0 0.25rem 1.25rem 0 rgba(0, 0, 0, 0.03);
  transition: transform 0.3s ease;

  &--hidden {
    transform: translateY(-100%);
  }
}

.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 1.25rem 1rem;

  @include respond-to(lg) {
    padding: 1.25rem 0;
  }

  &__brand {
    @include link-base;
    display: flex;
    align-items: center;
    z-index: 1001;

    img {
      height: 2rem;
      width: auto;

      @include respond-to(md) {
        height: 2.5rem;
      }
    }

    &:focus-visible {
      outline: 0.125rem solid $color-primary;
      outline-offset: 0.25rem;
      border-radius: 0.25rem;
    }
  }

  &__toggle {
    @include button-base;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 2.5rem;
    height: 2.5rem;
    padding: 0;
    background: transparent;
    border: none;
    z-index: 1001;

    @include respond-to(lg) {
      display: none;
    }

    &:focus-visible {
      outline: 0.125rem solid $color-primary;
      outline-offset: 0.25rem;
      border-radius: 0.25rem;
    }
  }

  &__toggle-icon {
    position: relative;
    width: 1.5rem;
    height: 0.125rem;
    background-color: $color-foreground;
    transition: all 0.3s ease;

    &::before,
    &::after {
      content: "";
      position: absolute;
      width: 1.5rem;
      height: 0.125rem;
      background-color: $color-foreground;
      transition: all 0.3s ease;
    }

    &::before {
      top: -0.5rem;
    }

    &::after {
      bottom: -0.5rem;
    }
  }

  &__toggle[aria-expanded="true"] &__toggle-icon {
    background-color: transparent;

    &::before {
      top: 0;
      transform: rotate(45deg);
    }

    &::after {
      bottom: 0;
      transform: rotate(-45deg);
    }
  }

  &__menu {
    display: none;
    list-style: none;
    align-items: center;
    gap: 1.25rem;
    padding: 0;
    margin: 0;

    @include respond-to-max(lg) {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      flex-direction: column;
      justify-content: center;
      background: $white;
      gap: 1.5rem;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
    }

    @include respond-to(lg) {
      display: flex;
    }

    &--open {
      display: flex;
      transform: translateX(0);
    }
  }

  &__menu-item {
    padding: 0 0.525rem;

    @include respond-to-max(lg) {
      padding: 0;
      width: 100%;
      text-align: center;
    }
  }

  &__menu-link {
    @include link-base;
    font-weight: 400;
    font-size: 0.91875rem;
    line-height: 1.44375rem;
    letter-spacing: 0;
    text-align: center;
    color: #353e5c;
    border-radius: 0.5rem;
    display: block;
    transition:
      color 0.2s ease,
      background-color 0.2s ease;

    @include respond-to-max(lg) {
      font-size: 1.125rem;
      padding: 0.75rem 1.5rem;
    }

    &:hover {
      color: $color-primary;
    }

    &:focus-visible {
      outline: 0.125rem solid $color-primary;
      outline-offset: 0.125rem;
      color: $color-primary;
    }

    &:active {
      color: $color-primary-darkened-10;
    }
  }

  &__actions {
    display: none;
    gap: 0.75rem;

    @include respond-to(lg) {
      display: flex;
    }

    @include respond-to-max(lg) {
      position: fixed;
      bottom: 2rem;
      left: 1rem;
      right: 1rem;
      flex-direction: column;
      gap: 1rem;
      z-index: 1001;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
    }
  }

  &__menu--open ~ &__actions {
    @include respond-to-max(lg) {
      display: flex;
      opacity: 1;
      pointer-events: all;
    }
  }

  &__button {
    &--outline {
      @include outline-button;
      text-decoration: none;
      white-space: nowrap;

      @include respond-to-max(lg) {
        width: 100%;
        justify-content: center;
      }
    }

    &--primary {
      @include gradient-button;
      text-decoration: none;
      white-space: nowrap;

      @include respond-to-max(lg) {
        width: 100%;
        justify-content: center;
      }
    }
  }
}
</style>
