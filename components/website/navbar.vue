<template>
  <a href="#main-content" class="skip-link">Saltar al contenido principal</a>

  <header class="header" :class="{ 'header--hidden': isHidden }" role="banner">
    <nav class="nav" aria-label="Navegación principal">
      <div>
        <NuxtLink
          class="nav__brand"
          to="/"
          aria-label="Vitalink - Ir a la página de inicio"
        >
          <img src="@/src/assets/img-vitalink-logo.svg" alt="Vitalink" />
        </NuxtLink>
      </div>

      <button
        class="nav__toggle"
        :aria-expanded="isMenuOpen"
        aria-controls="nav-menu"
        :aria-label="
          isMenuOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'
        "
        @click="toggleMenu"
        @keydown.enter="toggleMenu"
        @keydown.space.prevent="toggleMenu"
        @keydown.esc="closeMenu"
      >
        <span class="nav__toggle-icon" aria-hidden="true"></span>
      </button>

      <div
        v-if="isMenuOpen"
        class="nav__overlay"
        @click="closeMenu"
        aria-hidden="true"
      ></div>

      <ul
        id="nav-menu"
        class="nav__menu"
        :class="{ 'nav__menu--open': isMenuOpen }"
        role="list"
      >
        <li class="nav__menu-item" role="listitem">
          <NuxtLink
            to="#home"
            class="nav__menu-link"
            :aria-current="isCurrentSection('home') ? 'page' : undefined"
            @click="closeMenu"
            ref="firstMenuItem"
          >
            Home
          </NuxtLink>
        </li>
        <li class="nav__menu-item" role="listitem">
          <NuxtLink
            to="#key_benefits"
            class="nav__menu-link"
            :aria-current="
              isCurrentSection('key_benefits') ? 'page' : undefined
            "
            @click="closeMenu"
          >
            Beneficios clave
          </NuxtLink>
        </li>
        <li class="nav__menu-item" role="listitem">
          <NuxtLink
            to="#how-does-it-work"
            class="nav__menu-link"
            :aria-current="
              isCurrentSection('how-does-it-work') ? 'page' : undefined
            "
            @click="closeMenu"
          >
            ¿Cómo funciona?
          </NuxtLink>
        </li>
        <li class="nav__menu-item" role="listitem">
          <NuxtLink
            to="#trust"
            class="nav__menu-link"
            :aria-current="isCurrentSection('trust') ? 'page' : undefined"
            @click="closeMenu"
          >
            Confianza
          </NuxtLink>
        </li>
        <li class="nav__menu-item" role="listitem">
          <NuxtLink
            to="#specialties"
            class="nav__menu-link"
            :aria-current="isCurrentSection('specialties') ? 'page' : undefined"
            @click="closeMenu"
          >
            Especialidades
          </NuxtLink>
        </li>
        <li class="nav__menu-item" role="listitem">
          <NuxtLink
            to="#faqs"
            class="nav__menu-link"
            :aria-current="isCurrentSection('faqs') ? 'page' : undefined"
            @click="closeMenu"
            ref="lastMenuItem"
          >
            Preguntas frecuentes
          </NuxtLink>
        </li>
      </ul>

      <div
        class="nav__actions"
        :class="{ 'nav__actions--visible': isMenuOpen }"
      >
        <template v-if="isAuthenticated">
          <button
            class="nav__button--primary"
            @click="handleLogout"
            @keydown.enter="handleLogout"
            aria-label="Cerrar sesión de su cuenta"
          >
            Cerrar Sesión
          </button>
        </template>
        <template v-else>
          <NuxtLink
            to="/auth/login"
            class="nav__button--outline"
            @click="closeMenu"
            aria-label="Ingresar a su cuenta"
          >
            Ingresar
          </NuxtLink>
          <NuxtLink
            to="/pacientes/registro"
            class="nav__button--primary"
            @click="closeMenu"
            aria-label="Registrarse como nuevo usuario"
          >
            Registrarse
          </NuxtLink>
        </template>
      </div>
    </nav>

    <div role="status" aria-live="polite" aria-atomic="true" class="sr-only">
      {{ statusMessage }}
    </div>
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
const isMobile = ref(false);
const statusMessage = ref("");
const currentSection = ref("");

const firstMenuItem = ref<HTMLElement | null>(null);
const lastMenuItem = ref<HTMLElement | null>(null);
const previousActiveElement = ref<HTMLElement | null>(null);

let lastScrollY = 0;
let ticking = false;

watch(
  () => getToken(),
  (newToken) => {
    isAuthenticated.value = !!newToken;
  },
  { immediate: true },
);

watch(
  () => route.hash,
  (newHash) => {
    currentSection.value = newHash.replace("#", "");
  },
  { immediate: true },
);

const isCurrentSection = (section: string) => {
  return currentSection.value === section;
};

const toggleMenu = () => {
  if (isMenuOpen.value) {
    closeMenu();
  } else {
    openMenu();
  }
};

const openMenu = () => {
  isMenuOpen.value = true;
  previousActiveElement.value = document.activeElement as HTMLElement;

  document.body.style.overflow = "hidden";

  statusMessage.value = "Menú de navegación abierto";

  nextTick(() => {
    if (firstMenuItem.value) {
      (firstMenuItem.value as any).$el?.focus();
    }
  });

  document.addEventListener("keydown", handleEscapeKey);

  if (isMobile.value) {
    document.addEventListener("keydown", handleFocusTrap);
  }
};

const closeMenu = () => {
  if (!isMenuOpen.value) return;

  isMenuOpen.value = false;
  document.body.style.overflow = "";

  statusMessage.value = "Menú de navegación cerrado";

  nextTick(() => {
    if (previousActiveElement.value) {
      previousActiveElement.value.focus();
    }
  });

  document.removeEventListener("keydown", handleEscapeKey);
  document.removeEventListener("keydown", handleFocusTrap);

  setTimeout(() => {
    statusMessage.value = "";
  }, 1000);
};

const handleEscapeKey = (e: KeyboardEvent) => {
  if (e.key === "Escape" || e.key === "Esc") {
    closeMenu();
  }
};

const handleFocusTrap = (e: KeyboardEvent) => {
  if (e.key !== "Tab") return;

  const firstElement = firstMenuItem.value;
  const lastElement = lastMenuItem.value;

  if (!firstElement || !lastElement) return;

  if (e.shiftKey && document.activeElement === firstElement) {
    e.preventDefault();
    lastElement.focus();
  } else if (!e.shiftKey && document.activeElement === lastElement) {
    e.preventDefault();
    firstElement.focus();
  }
};

const handleLogout = () => {
  logout();
  statusMessage.value = "Sesión cerrada correctamente";
  if (route.path !== "/") router.push("/auth/login");
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

const checkIsMobile = () => {
  isMobile.value = window.innerWidth < 992;
};

onMounted(() => {
  lastScrollY = window.scrollY;
  checkIsMobile();

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", checkIsMobile);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("resize", checkIsMobile);
  document.removeEventListener("keydown", handleEscapeKey);
  document.removeEventListener("keydown", handleFocusTrap);
  document.body.style.overflow = "";
});
</script>

<style lang="scss" scoped>
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  background: $color-primary;
  color: $white;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  z-index: 10001;
  font-weight: 600;
  font-size: 1rem;
  transition: top 0.2s ease;

  &:focus {
    top: 0;
    outline: 0.25rem solid $white;
    outline-offset: 0.25rem;
  }

  &:focus-visible {
    top: 0;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: $white;
  box-shadow: 0 0.25rem 1.25rem 0 rgba(0, 0, 0, 0.03);
  transition: transform 0.3s ease;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }

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

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }

    &::before,
    &::after {
      content: "";
      position: absolute;
      width: 1.5rem;
      height: 0.125rem;
      background-color: $color-foreground;
      transition: all 0.3s ease;

      @media (prefers-reduced-motion: reduce) {
        transition: none;
      }
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

  &__overlay {
    @include respond-to-max(lg) {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
    }

    @include respond-to(lg) {
      display: none;
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

      @media (prefers-reduced-motion: reduce) {
        transition: none;
      }
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
    position: relative;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }

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

    &[aria-current="page"] {
      color: $color-primary;
      font-weight: 600;
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

      @media (prefers-reduced-motion: reduce) {
        transition: none;
      }

      &--visible {
        display: flex;
        opacity: 1;
        pointer-events: all;
      }
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
