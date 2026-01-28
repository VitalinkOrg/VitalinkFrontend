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
      >
        <span class="nav__toggle-icon" aria-hidden="true"></span>
      </button>

      <div
        v-show="isMenuOpen"
        class="nav__overlay"
        @click="closeMenu"
        aria-hidden="true"
      ></div>

      <div
        id="nav-menu"
        class="nav__container"
        :class="{ 'nav__container--open': isMenuOpen }"
      >
        <ul class="nav__menu" role="menu">
          <li
            v-for="item in menuItems"
            :key="item.id"
            class="nav__menu-item"
            role="none"
          >
            <NuxtLink
              :to="item.to"
              class="nav__menu-link"
              :aria-current="isCurrentSection(item.id) ? 'page' : undefined"
              role="menuitem"
              @click="closeMenu"
            >
              {{ item.label }}
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

const menuItems = [
  { id: "home", to: "#home", label: "Home" },
  { id: "key_benefits", to: "#key_benefits", label: "Beneficios clave" },
  { id: "how-does-it-work", to: "#how-does-it-work", label: "¿Cómo funciona?" },
  { id: "trust", to: "#trust", label: "Confianza" },
  { id: "specialties", to: "#specialties", label: "Especialidades" },
  { id: "faqs", to: "#faqs", label: "Preguntas frecuentes" },
];

let lastScrollY = 0;
let ticking = false;
let previousActiveElement: HTMLElement | null = null;

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

const isCurrentSection = (section: string) => currentSection.value === section;

const toggleMenu = () => {
  isMenuOpen.value ? closeMenu() : openMenu();
};

const openMenu = () => {
  isMenuOpen.value = true;
  previousActiveElement = document.activeElement as HTMLElement;
  document.body.style.overflow = "hidden";
  statusMessage.value = "Menú de navegación abierto";

  document.addEventListener("keydown", handleKeyboard);
};

const closeMenu = () => {
  if (!isMenuOpen.value) return;

  isMenuOpen.value = false;
  document.body.style.overflow = "";
  statusMessage.value = "Menú de navegación cerrado";

  nextTick(() => {
    previousActiveElement?.focus();
  });

  document.removeEventListener("keydown", handleKeyboard);

  setTimeout(() => {
    statusMessage.value = "";
  }, 1000);
};

const handleKeyboard = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    closeMenu();
  }

  if (e.key === "Tab" && isMobile.value) {
    const focusableElements = document.querySelectorAll(
      "#nav-menu a, .nav__actions a, .nav__actions button",
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
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
  document.removeEventListener("keydown", handleKeyboard);
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
    outline: 0.1875rem solid $white;
    outline-offset: 0.25rem;
  }
}

.sr-only {
  @include visually-hidden;
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
  max-width: 1360px;
  width: 100%;
  margin: 0 auto;
  padding: 1rem;

  @include respond-to(md) {
    padding: 1.25rem 1.5rem;
  }

  @include respond-to(lg) {
    padding: 1.25rem 2rem;
  }

  &__brand {
    @include link-base;
    display: flex;
    align-items: center;
    z-index: 1002;

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
    width: 2.75rem;
    height: 2.75rem;
    padding: 0;
    background: transparent;
    border: none;
    z-index: 1002;

    @include respond-to(lg) {
      display: none;
    }

    &:focus-visible {
      outline: 0.125rem solid $color-primary;
      outline-offset: 0.25rem;
      border-radius: 0.25rem;
    }

    &:hover {
      background: rgba($color-primary, 0.05);
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
      background: rgba(0, 0, 0, 0.6);
      z-index: 998;
      backdrop-filter: blur(2px);
    }

    @include respond-to(lg) {
      display: none;
    }
  }

  &__container {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    @include respond-to-max(lg) {
      position: fixed;
      top: 0;
      right: 0;
      width: min(100%, 25rem);
      height: 100vh;
      flex-direction: column;
      justify-content: space-between;
      background: $white;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      padding: 2rem;
      box-shadow: -0.5rem 0 2rem rgba(0, 0, 0, 0.1);
      z-index: 1001;
      gap: 0;

      @media (prefers-reduced-motion: reduce) {
        transition: none;
      }
    }

    @include respond-to(lg) {
      display: flex;
    }

    &--open {
      @include respond-to-max(lg) {
        transform: translateX(0);
      }
    }
  }

  &__menu {
    display: flex;
    list-style: none;
    align-items: center;
    gap: 0.25rem;
    padding: 0;
    margin: 0;

    @include respond-to-max(lg) {
      flex-direction: column;
      justify-content: center;
      width: 100%;
      gap: 0.5rem;
      flex: 1;
    }
  }

  &__menu-item {
    padding: 0;

    @include respond-to(lg) {
      padding: 0 0.25rem;
    }

    @include respond-to-max(lg) {
      width: 100%;
    }
  }

  &__menu-link {
    @include link-base;
    font-weight: 500;
    font-size: 0.9375rem;
    line-height: 1.5;
    color: #353e5c;
    border-radius: 0.5rem;
    display: block;
    padding: 0.75rem 1rem;
    transition: all 0.2s ease;

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }

    @include respond-to-max(lg) {
      font-size: 1.125rem;
      padding: 1rem 1.5rem;
      text-align: center;
    }

    &:hover {
      color: $color-primary;
      background: rgba($color-primary, 0.05);
    }

    &:focus-visible {
      outline: 0.125rem solid $color-primary;
      outline-offset: 0.125rem;
      color: $color-primary;
    }

    &:active {
      color: $color-primary-darkened-10;
      background: rgba($color-primary, 0.1);
    }

    &[aria-current="page"] {
      color: $color-primary;
      font-weight: 600;
      background: rgba($color-primary, 0.08);
    }
  }

  &__actions {
    display: flex;
    gap: 0.75rem;

    @include respond-to-max(lg) {
      flex-direction: column;
      width: 100%;
      gap: 1rem;
      padding-top: 2rem;
      border-top: 1px solid rgba($color-primary, 0.1);
    }

    &--visible {
      @include respond-to-max(lg) {
        display: flex;
      }
    }
  }

  &__button {
    &--outline {
      @include outline-button;
      text-decoration: none;
      white-space: nowrap;
      font-size: 0.9375rem;

      @include respond-to-max(lg) {
        width: 100%;
        justify-content: center;
      }
    }

    &--primary {
      @include gradient-button;
      text-decoration: none;
      white-space: nowrap;
      font-size: 0.9375rem;

      @include respond-to-max(lg) {
        width: 100%;
        justify-content: center;
      }
    }
  }
}
</style>
