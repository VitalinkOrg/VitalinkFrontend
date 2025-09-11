<script lang="ts" setup>
import { nextTick, onMounted, onUnmounted, ref, type Ref } from "vue";
import type { Supplier } from "~/types";

definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});

const sort: Ref<boolean> = ref(false);
const pending: Ref<boolean> = ref(false);
const sidebarOpen: Ref<boolean> = ref(false);
const isMobile: Ref<boolean> = ref(false);
const isTablet: Ref<boolean> = ref(false);
const searchInput = ref<HTMLInputElement>();
const userMenuTrigger = ref<HTMLButtonElement>();
const token = useCookie("token");
const refreshToken = useCookie("refresh_token");
const role = useCookie("role");
const authenticated = useCookie("authenticated");

const user_info: Supplier = {
  id: 1,
  id_type: {
    id: 1,
    code: "DOC",
    name: "Doctor",
    type: "medical",
    description: "Professional doctor",
    father_code: null,
    value1: null,
    created_date: "2025-01-01",
    updated_date: null,
    is_deleted: 0,
  },
  card_id: "12345678",
  num_medical_enrollment: "MLN-123",
  name: "Dr. MockFirstName MockLastName",
  phone_number: "123-456-7890",
  email: "mock@example.com",
  country_iso_code: "MCK",
  province: "Mock Province",
  city_name: "Mock City",
  postal_code: "12345",
  profile_picture_url: null,
  description: "Mock Description of User",
  address: "Mock Address 123",
  street_number: null,
  floor: null,
  door_number: null,
  latitude: null,
  longitude: null,
  experience_years: 10,
  patients_number: 500,
  is_hospital: false,
  our_history: null,
  mission: null,
  vision: null,
  code_card_id_file: null,
  code_medical_license_file: null,
  gender: "M",
  medical_type: {
    id: 1,
    code: "DOCTOR",
    name: "Doctor",
    type: "medical",
    description: "Professional doctor",
    father_code: null,
    value1: null,
    created_date: "2025-01-01",
    updated_date: null,
    is_deleted: 0,
  },
  legal_representative: {
    id: 1,
    card_id: "87654321",
    name: "Legal Rep Name",
    email: "legal@example.com",
    user_name: "legalrep",
    phone_number: "987-654-3210",
    gender: null,
    birth_date: null,
    country_iso_code: "MCK",
    province: "Mock Province",
    address: "Legal Address",
    city_name: "Mock City",
    postal_code: "54321",
    role_code: "LEGAL_REP",
    is_deleted: 0,
    is_active_from_email: 1,
    account_status: "ACTIVE",
    fail_login_number: 0,
    forgot_password_token: null,
    active_register_token: null,
    latitude: null,
    longitude: null,
    code_contract: null,
    language: "es",
    profile_picture_url: null,
    last_login_at: "2025-01-01",
    login_ip_address: "127.0.0.1",
    created_at: "2025-01-01",
    updated_at: "2025-01-01",
    verified_at: null,
    id_type: {
      id: 1,
      code: "DOC",
      name: "Doctor",
      type: "medical",
      description: "Professional doctor",
      father_code: null,
      value1: null,
      created_date: "2025-01-01",
      updated_date: null,
      is_deleted: 0,
    },
  },
  created_date: "2025-01-01",
  updated_date: null,
  date_availability: null,
  hour_availability: null,
  location_number: null,
  reviews: [],
  review_details_summary: [],
  services: [],
  availabilities: [],
  locations: [],
  is_deleted: 0,
};

const router = useRouter();

const checkScreenSize = (): void => {
  const width = window.innerWidth;
  isMobile.value = width < 768;
  isTablet.value = width >= 768 && width < 992;

  if (!isMobile.value) {
    sidebarOpen.value = false;
  }
};

const toggleSidebar = (): void => {
  sidebarOpen.value = !sidebarOpen.value;
};

const closeSidebar = (): void => {
  sidebarOpen.value = false;
};

const toggleUserMenu = async (): Promise<void> => {
  sort.value = !sort.value;
  if (sort.value) {
    await nextTick();
    const firstLink = document.querySelector(
      ".dashboard__dropdown-link"
    ) as HTMLElement;
    firstLink?.focus();
  }
};

const handleKeydown = (event: KeyboardEvent): void => {
  if (event.key === "Escape") {
    if (sort.value) {
      sort.value = false;
      userMenuTrigger.value?.focus();
    }
    if (sidebarOpen.value) {
      sidebarOpen.value = false;
    }
  }
};

const handleClickOutside = (event: MouseEvent): void => {
  const target = event.target as HTMLElement;
  const userMenu = document.querySelector(".dashboard__user-menu");

  if (sort.value && userMenu && !userMenu.contains(target)) {
    sort.value = false;
  }
};

const logout = (): void => {
  token.value = null;
  refreshToken.value = null;
  role.value = null;
  authenticated.value = null;
  router.push("/pacientes/login");
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkScreenSize);
  document.removeEventListener("keydown", handleKeydown);
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div
    v-if="pending"
    role="status"
    aria-live="polite"
    class="loading-container"
  >
    <span class="sr-only">Cargando...</span>
  </div>
  <div
    v-else
    class="dashboard"
    role="application"
    aria-label="Panel de control médico"
  >
    <header class="dashboard__header" role="banner">
      <div class="dashboard__header-content">
        <button
          v-if="isMobile"
          class="dashboard__menu-toggle"
          @click="toggleSidebar"
          :aria-expanded="sidebarOpen"
          aria-controls="main-sidebar"
          aria-label="Abrir menú de navegación"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div class="dashboard__search" role="search">
          <label for="search-input" class="sr-only">Buscar en el panel</label>
          <span class="dashboard__search-icon" aria-hidden="true">
            <AtomsIconsSearchIcon size="20" />
          </span>
          <input
            id="search-input"
            ref="searchInput"
            type="search"
            class="dashboard__search-input"
            placeholder="Buscar"
            aria-label="Campo de búsqueda"
            autocomplete="off"
          />
        </div>

        <button
          class="dashboard__notification-btn"
          aria-label="Ver notificaciones"
          title="Notificaciones"
        >
          <AtomsIconsNotificationsIcon aria-hidden="true" />
        </button>

        <div class="dashboard__user-menu">
          <button
            ref="userMenuTrigger"
            class="dashboard__user-menu-trigger"
            @click="toggleUserMenu"
            type="button"
            :aria-expanded="sort"
            aria-haspopup="menu"
            aria-controls="user-menu"
            aria-label="Menú de usuario"
          >
            <img
              src="@/src/assets/img-avatar-sm.png"
              alt="Foto de perfil del usuario"
              class="dashboard__user-avatar"
            />
          </button>

          <ul
            id="user-menu"
            class="dashboard__dropdown"
            :class="{ 'dashboard__dropdown--show': sort }"
            role="menu"
            :aria-hidden="!sort"
          >
            <li class="dashboard__dropdown-item" role="none">
              <NuxtLink
                class="dashboard__dropdown-link"
                href="/medicos/perfil"
                role="menuitem"
                :tabindex="sort ? 0 : -1"
                @click="sort = false"
              >
                Perfil
              </NuxtLink>
            </li>
            <li class="dashboard__dropdown-item" role="none">
              <NuxtLink
                class="dashboard__dropdown-link"
                href="/medicos/perfil"
                role="menuitem"
                :tabindex="sort ? 0 : -1"
                @click="sort = false"
              >
                Configuración
              </NuxtLink>
            </li>
            <li class="dashboard__dropdown-item" role="none">
              <NuxtLink
                class="dashboard__dropdown-link"
                href="/medicos/resenas"
                role="menuitem"
                :tabindex="sort ? 0 : -1"
                @click="sort = false"
              >
                Reseñas
              </NuxtLink>
            </li>
            <li class="dashboard__dropdown-item" role="none">
              <NuxtLink
                class="dashboard__dropdown-link"
                href="/medicos/perfil"
                role="menuitem"
                :tabindex="sort ? 0 : -1"
                @click="sort = false"
              >
                Ayuda y Soporte
              </NuxtLink>
            </li>
            <li class="dashboard__dropdown-item" role="none">
              <button
                class="dashboard__dropdown-link dashboard__dropdown-btn"
                @click="logout"
                role="menuitem"
                :tabindex="sort ? 0 : -1"
              >
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>

    <div
      v-if="isMobile && sidebarOpen"
      class="dashboard__overlay"
      @click="closeSidebar"
      aria-hidden="true"
    ></div>

    <div class="dashboard__body">
      <aside
        id="main-sidebar"
        class="dashboard__sidebar"
        :class="{
          'dashboard__sidebar--mobile-open': isMobile && sidebarOpen,
          'dashboard__sidebar--mobile': isMobile,
          'dashboard__sidebar--tablet': isTablet,
        }"
        role="navigation"
        :aria-label="
          isMobile ? 'Menú principal de navegación' : 'Navegación lateral'
        "
        :aria-hidden="isMobile && !sidebarOpen"
      >
        <nav class="dashboard__nav">
          <div class="dashboard__nav-header">
            <NuxtLink
              href="/medicos/inicio"
              class="dashboard__logo"
              aria-label="VitaLink - Ir al inicio"
            >
              <AtomsVitalinkLogo aria-hidden="true" />
            </NuxtLink>

            <button
              v-if="isMobile"
              class="dashboard__close-btn"
              @click="closeSidebar"
              aria-label="Cerrar menú de navegación"
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <ul class="dashboard__nav-list" role="list">
            <li class="dashboard__nav-item" role="none">
              <NuxtLink
                href="/medicos/inicio"
                class="dashboard__nav-link"
                active-class="dashboard__nav-link--active"
                @click="isMobile && closeSidebar()"
                :aria-current="
                  $route.path === '/medicos/inicio' ? 'page' : undefined
                "
              >
                <span class="dashboard__nav-icon" aria-hidden="true">
                  <AtomsIconsHomeIcon />
                </span>
                <span class="dashboard__nav-text">Inicio</span>
              </NuxtLink>
            </li>

            <li class="dashboard__nav-item" role="none">
              <NuxtLink
                href="/medicos/citas"
                class="dashboard__nav-link"
                active-class="dashboard__nav-link--active"
                @click="isMobile && closeSidebar()"
                :aria-current="
                  $route.path === '/medicos/citas' ? 'page' : undefined
                "
              >
                <span class="dashboard__nav-icon" aria-hidden="true">
                  <AtomsIconsCitasIcon />
                </span>
                <span class="dashboard__nav-text">Citas</span>
              </NuxtLink>
            </li>

            <li class="dashboard__nav-item" role="none">
              <NuxtLink
                href="/medicos/servicios"
                class="dashboard__nav-link"
                active-class="dashboard__nav-link--active"
                @click="isMobile && closeSidebar()"
                :aria-current="
                  $route.path === '/medicos/servicios' ? 'page' : undefined
                "
              >
                <span class="dashboard__nav-icon" aria-hidden="true">
                  <AtomsIconsServiciosIcon />
                </span>
                <span class="dashboard__nav-text">Servicios</span>
              </NuxtLink>
            </li>

            <li class="dashboard__nav-item" role="none">
              <NuxtLink
                href="/medicos/pacientes"
                class="dashboard__nav-link"
                active-class="dashboard__nav-link--active"
                @click="isMobile && closeSidebar()"
                :aria-current="
                  $route.path === '/medicos/pacientes' ? 'page' : undefined
                "
              >
                <span class="dashboard__nav-icon" aria-hidden="true">
                  <AtomsIconsPacientesIcon />
                </span>
                <span class="dashboard__nav-text">Pacientes</span>
              </NuxtLink>
            </li>

            <li class="dashboard__nav-item" role="none">
              <NuxtLink
                href="/medicos/hospitales"
                class="dashboard__nav-link"
                active-class="dashboard__nav-link--active"
                @click="isMobile && closeSidebar()"
                :aria-current="
                  $route.path === '/medicos/hospitales' ? 'page' : undefined
                "
              >
                <span class="dashboard__nav-icon" aria-hidden="true">
                  <AtomsIconsHospitalesIcon />
                </span>
                <span class="dashboard__nav-text">Mis Hospitales</span>
              </NuxtLink>
            </li>
          </ul>
        </nav>

        <nav
          class="dashboard__secondary-nav"
          aria-label="Navegación secundaria"
        >
          <div
            class="dashboard__divider"
            role="separator"
            aria-hidden="true"
          ></div>

          <ul class="dashboard__secondary-nav-list" role="list">
            <li class="dashboard__secondary-nav-item" role="none">
              <NuxtLink
                class="dashboard__secondary-nav-link"
                href="/medicos/inicio"
                @click="isMobile && closeSidebar()"
              >
                <span
                  class="dashboard__secondary-nav-icon dashboard__secondary-nav-icon--info"
                  aria-hidden="true"
                >
                  <AtomsIconsAlertIcon size="20" />
                </span>
                <span class="dashboard__secondary-nav-text"
                  >Ayuda y Soporte</span
                >
              </NuxtLink>
            </li>

            <li class="dashboard__secondary-nav-item" role="none">
              <button
                class="dashboard__secondary-nav-link dashboard__logout-btn"
                @click="logout"
                aria-label="Cerrar sesión y salir del sistema"
              >
                <span
                  class="dashboard__secondary-nav-icon dashboard__secondary-nav-icon--logout"
                  aria-hidden="true"
                >
                  <AtomsIconsLogoutDashboardIcon />
                </span>
                <span class="dashboard__secondary-nav-text">Cerrar Sesión</span>
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      <main
        class="dashboard__main"
        role="main"
        aria-label="Contenido principal"
      >
        <slot :user_info="user_info" />
      </main>
    </div>
  </div>
</template>

<style src="@/assets/styles/vitalink.scss" />
<style lang="scss" scoped>
.sr-only {
  @include visually-hidden;
}

.loading-container {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

.dashboard {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
  position: relative;
  overflow: hidden;

  &__overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 150;
    display: none;
    opacity: 0;
    transition: opacity 0.3s ease;

    @include respond-to-max(md) {
      display: block;
      opacity: 1;
    }
  }

  &__header {
    width: 100%;
    background-color: $white;
    z-index: 50;
    position: relative;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
  }

  &__header-content {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding: $spacing-lg;
    gap: $spacing-md;
    background-color: $white;
    margin-left: 15rem;
    min-height: 5rem;

    @include respond-to-max(xl) {
      margin-left: 13rem;
      padding: $spacing-md $spacing-lg;
    }

    @include respond-to-max(lg) {
      margin-left: 12rem;
    }

    @include respond-to-max(md) {
      margin-left: 0;
      justify-content: space-between;
      padding: $spacing-md;
      min-height: 4.5rem;
      gap: $spacing-sm;
    }

    @include respond-to-max(sm) {
      padding: $spacing-sm $spacing-md;
      min-height: 4rem;
      gap: 0.5rem;
    }
  }

  &__menu-toggle,
  &__close-btn,
  &__notification-btn {
    @include button-base;
    background: none;
    border: none;
    padding: $spacing-sm;
    color: $color-text-muted;
    border-radius: $border-radius-md;
    flex-shrink: 0;

    &:hover,
    &:focus {
      color: $color-primary;
      outline: none;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }

    @include respond-to-max(sm) {
      padding: $spacing-xs;
    }
  }

  &__menu-toggle {
    display: none;
    order: -1;

    @include respond-to-max(md) {
      display: flex;
    }
  }

  &__close-btn {
    display: none;
    position: absolute;
    top: $spacing-md;
    right: $spacing-md;

    @include respond-to-max(md) {
      display: flex;
    }

    @include respond-to-max(sm) {
      top: $spacing-sm;
      right: $spacing-sm;
    }
  }

  &__notification-btn {
    @include respond-to-max(sm) {
      order: 2;
    }
  }

  &__body {
    display: flex;
    flex: 1;
    overflow: hidden;
    min-height: 0;
  }

  &__sidebar {
    height: 100vh;
    width: 15rem;
    max-width: 15rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    background-color: $white;
    box-shadow: 2px 4px 29px 0px #0000000d;
    gap: 4rem;
    padding: 2rem 1.5rem;
    border-top-right-radius: 20px;
    border-bottom-right-radius: 20px;
    z-index: 100;
    position: fixed;
    top: 0;
    left: 0;
    transition: transform 0.3s ease;
    flex-shrink: 0;

    @include respond-to-max(xl) {
      width: 13rem;
      max-width: 13rem;
      gap: 3rem;
      padding: 1.5rem 1.25rem;
    }

    @include respond-to-max(lg) {
      width: 12rem;
      max-width: 12rem;
      gap: 2.5rem;
      padding: 1.5rem 1rem;
    }

    @include respond-to-max(md) {
      width: 18rem;
      max-width: 18rem;
      transform: translateX(-100%);
      border-radius: 0;
      border-top-right-radius: 20px;
      border-bottom-right-radius: 20px;
      z-index: 200;
      gap: 2rem;
      padding: 2rem 1.5rem;

      &--mobile-open {
        transform: translateX(0);
      }
    }

    @include respond-to-max(sm) {
      width: 100vw;
      max-width: 100vw;
      border-radius: 0;
      padding: 1.5rem 1rem;
    }
  }

  &__nav {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  &__nav-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-lg * 2;

    @include respond-to-max(lg) {
      margin-bottom: $spacing-lg * 1.5;
    }

    @include respond-to-max(md) {
      margin-bottom: $spacing-lg;
      position: relative;
    }
  }

  &__logo {
    display: block;
    text-decoration: none;
    padding: $spacing-sm;
    border-radius: $border-radius-md;
    transition: all 0.2s ease;

    @include respond-to-max(md) {
      padding: $spacing-xs;
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }

  &__nav-list {
    list-style: none;
    margin: 0;
    padding: 0;
    width: 100%;
    flex: 1;
  }

  &__nav-item {
    width: 100%;
    margin-bottom: $spacing-md;

    @include respond-to-max(lg) {
      margin-bottom: $spacing-sm;
    }

    @include respond-to-max(md) {
      margin-bottom: $spacing-md;
    }
  }

  &__nav-link {
    @include link-base;
    display: flex;
    align-items: center;
    width: 100%;
    padding: 15px 15px;
    border-radius: $border-radius-md;
    color: $color-foreground;
    transition: all 0.3s ease;
    font-weight: 400;
    text-decoration: none;

    @include respond-to-max(xl) {
      padding: $spacing-md;
      font-size: 0.9rem;
    }

    @include respond-to-max(lg) {
      padding: $spacing-sm $spacing-md;
      font-size: 0.875rem;
    }

    @include respond-to-max(md) {
      padding: $spacing-md;
      font-size: 1rem;
    }

    @include respond-to-max(sm) {
      padding: $spacing-md $spacing-lg;
    }

    &:hover,
    &:focus {
      background-color: #f8faff;
      outline: none;

      @include respond-to-max(md) {
        transform: none;
      }
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: -2px;
    }

    &--active {
      background-color: #f8faff;
      color: #353e5c;
      font-weight: 500;
    }
  }

  &__nav-icon {
    margin-right: $spacing-md;
    color: inherit;
    flex-shrink: 0;
    display: flex;
    align-items: center;

    @include respond-to-max(xl) {
      margin-right: $spacing-sm;
    }

    @include respond-to-max(lg) {
      margin-right: $spacing-sm;
    }

    @include respond-to-max(md) {
      margin-right: $spacing-md;
    }
  }

  &__nav-text {
    font-size: inherit;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    @include respond-to-max(xl) {
      font-size: 0.9rem;
    }

    @include respond-to-max(lg) {
      font-size: 0.875rem;
    }

    @include respond-to-max(md) {
      font-size: 1rem;
    }
  }

  &__secondary-nav {
    width: 100%;
    margin-top: auto;
  }

  &__divider {
    height: 1px;
    background-color: rgba(#e0e0e0, 0.8);
    margin: $spacing-lg 0;
    width: 100%;

    @include respond-to-max(lg) {
      margin: $spacing-md 0;
    }
  }

  &__secondary-nav-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__secondary-nav-item {
    margin-bottom: $spacing-sm;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__secondary-nav-link {
    @include link-base;
    display: flex;
    align-items: center;
    width: 100%;
    padding: $spacing-sm 0;
    color: $color-foreground;
    font-size: 0.875rem;
    text-decoration: none;

    @include respond-to-max(xl) {
      font-size: 0.8125rem;
    }

    @include respond-to-max(lg) {
      font-size: 0.75rem;
    }

    @include respond-to-max(md) {
      font-size: 0.875rem;
      padding: $spacing-sm $spacing-md;
    }

    &:hover,
    &:focus {
      background-color: #f8faff;
      outline: none;

      @include respond-to-max(md) {
        background-color: rgba($color-primary, 0.05);
        border-radius: $border-radius-md;
      }
    }

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: -2px;
      border-radius: $border-radius-md;
    }
  }

  &__secondary-nav-icon {
    margin-right: $spacing-md;
    flex-shrink: 0;
    display: flex;
    align-items: center;

    @include respond-to-max(xl) {
      margin-right: $spacing-sm;
    }

    @include respond-to-max(lg) {
      margin-right: $spacing-sm;
    }

    @include respond-to-max(md) {
      margin-right: $spacing-md;
    }

    &--info {
      color: $primary-aqua;
    }

    &--logout {
      color: $color-danger;
    }
  }

  &__secondary-nav-text {
    font-size: inherit;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__logout-btn {
    @include button-base;
    background: none;
    border: none;
    padding: $spacing-sm 0;
    width: 100%;
    justify-content: flex-start;
    text-align: left;
    font-size: inherit;
    font-weight: inherit;

    @include respond-to-max(md) {
      padding: $spacing-sm $spacing-md;
    }
  }

  &__main {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    margin-left: 15rem;
    padding: 2.5rem;
    min-height: 0;
    position: relative;

    @include respond-to-max(xl) {
      margin-left: 13rem;
      padding: 2rem;
    }

    @include respond-to-max(lg) {
      margin-left: 12rem;
      padding: 1.5rem;
    }

    @include respond-to-max(md) {
      margin-left: 0;
      padding: 1.5rem;
    }

    @include respond-to-max(sm) {
      padding: 1rem;
    }

    @include respond-to-max(xs) {
      padding: 0.75rem;
    }
  }

  &__user-menu {
    position: relative;
    flex-shrink: 0;
    order: 3;

    @include respond-to-max(sm) {
      order: 1;
    }
  }

  &__search {
    position: relative;
    display: flex;
    align-items: center;
    background-color: $white;
    border-radius: $border-radius-md;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: auto;
    flex: 1;
    max-width: 24rem;

    @include respond-to-max(md) {
      flex: 1;
      max-width: none;
      order: 2;
      margin: 0 $spacing-sm;
    }

    @include respond-to-max(sm) {
      width: 100%;
      max-width: 20rem;
      margin: 0;
      order: 3;
    }

    &:focus-within {
      outline: 2px solid $color-primary;
      outline-offset: 1px;
    }
  }

  &__search-icon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 1.25rem;
    height: 1.25rem;
    color: $color-text-muted;
    background-color: transparent;
    border-right: none;
    margin-left: 0.875rem;
    flex-shrink: 0;

    @include respond-to-max(sm) {
      margin-left: 0.75rem;
    }
  }

  &__search-input {
    @include input-base;
    border: none;
    border-left: none;
    box-shadow: none;
    padding: 0.625rem 0.875rem;
    font-weight: 300;
    font-size: 1rem;
    line-height: 1.5;
    width: 100%;
    min-width: 0;
    background: transparent;

    @include respond-to-max(lg) {
      font-size: 0.9rem;
      padding: 0.5rem 0.75rem;
    }

    @include respond-to-max(sm) {
      font-size: 0.875rem;
      padding: 0.5rem 0.625rem;
    }

    &:focus-visible {
      box-shadow: none;
      border-color: transparent;
      outline: none;
    }

    &::placeholder {
      color: $color-text-muted;
      opacity: 0.8;
    }
  }

  &__user-menu-trigger {
    @include button-base;
    background: none;
    border: none;
    padding: $spacing-xs;
    border-radius: 50%;
    transition: all 0.2s ease;

    &:focus-visible {
      outline: 2px solid $color-primary;
      outline-offset: 2px;
    }
  }

  &__user-avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid transparent;
    transition: border-color 0.2s ease;

    @include respond-to-max(lg) {
      width: 2.25rem;
      height: 2.25rem;
    }

    @include respond-to-max(sm) {
      width: 2rem;
      height: 2rem;
    }

    &:hover {
      border-color: $color-primary;
    }
  }

  &__dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    background-color: $white;
    border-radius: $border-radius-md;
    box-shadow: 0px 4px 6px -2px #1018281f;
    box-shadow: -8px 12px 16px -4px #1018281f;
    list-style: none;
    margin: 0;
    padding: $spacing-sm 0;
    min-width: 11.25rem;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-0.625rem);
    transition: all 0.3s ease;
    z-index: 1000;
    border: 1px solid rgba(0, 0, 0, 0.05);

    @include respond-to-max(sm) {
      right: -0.625rem;
      min-width: 10rem;
    }

    @include respond-to-max(xs) {
      right: -1rem;
      left: auto;
      min-width: 9rem;
    }

    &--show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
  }

  &__dropdown-item {
    margin: 0;
  }

  &__dropdown-link {
    @include link-base;
    display: block;
    padding: $spacing-sm $spacing-md;
    color: #353e5c;
    transition: all 0.2s ease;
    font-size: 0.875rem;
    text-decoration: none;
    border-radius: 0;

    @include respond-to-max(sm) {
      padding: $spacing-xs $spacing-sm;
      font-size: 0.8125rem;
    }

    &:hover,
    &:focus {
      background-color: #e7f7f8;
      outline: none;
    }

    &:focus-visible {
      outline: 2px solid #e7f7f8;
      outline-offset: -2px;
    }
  }

  &__dropdown-btn {
    @include button-base;
    background: none;
    border: none;
    width: 100%;
    text-align: left;
    font-size: inherit;
    font-weight: inherit;
    justify-content: flex-start;
    color: #353e5c;

    &:hover,
    &:focus {
      background-color: #e7f7f8;
      outline: none;
    }

    &:focus-visible {
      outline: 2px solid #e7f7f8;
      outline-offset: -2px;
    }
  }
}

@include respond-to-max(sm) {
  .dashboard__header-content {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-template-areas: "menu search user";
    align-items: center;
    gap: 0.5rem;
  }

  .dashboard__menu-toggle {
    grid-area: menu;
  }

  .dashboard__search {
    grid-area: search;
    justify-self: stretch;
  }

  .dashboard__user-menu {
    grid-area: user;
    justify-self: end;
  }

  .dashboard__notification-btn {
    display: none;
  }
}

@include respond-to-max(xs) {
  .dashboard {
    &__sidebar {
      padding: 1rem 0.75rem;
    }

    &__main {
      padding: 0.5rem;
    }

    &__header-content {
      padding: 0.5rem 0.75rem;
      gap: 0.25rem;
    }

    &__search {
      max-width: none;
    }
  }
}
</style>
