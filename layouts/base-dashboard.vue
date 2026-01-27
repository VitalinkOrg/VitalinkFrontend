<script lang="ts" setup>
import type { Supplier } from "@/types";
import { onMounted, onUnmounted, ref, type Component, type Ref } from "vue";

interface NavigationItem {
  href: string;
  label: string;
  icon: Component;
  visible: boolean;
}

interface Props {
  module: "medicos" | "socios";
  userType: "medical" | "financial";
  navigationItems: NavigationItem[];
  customUrls: Record<string, string>;
  middleware?: string;
  hideDefaultItems: string[];
  withAvatar?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  middleware: "auth-doctors-hospitals",
  withAvatar: true,
});

definePageMeta({
  middleware: props.middleware as any,
});

const sort: Ref<boolean> = ref(false);
const pending: Ref<boolean> = ref(false);
const sidebarOpen: Ref<boolean> = ref(false);
const isMobile: Ref<boolean> = ref(false);
const isTablet: Ref<boolean> = ref(false);
const { getUserInfo } = useUserInfo();

const userInfo = getUserInfo() || {};

const userProfilePicture = computed(() => userInfo.profile_picture_url ?? null);
const userMenuTrigger = ref<HTMLButtonElement>();

const token = useCookie("token");
const refreshToken = useCookie("refresh_token");
const role = useCookie("role");
const authenticated = useCookie("authenticated");
const router = useRouter();

const user_info: Partial<Supplier> = {
  id: 1,
  name:
    props.userType === "medical"
      ? "Dr. MockFirstName MockLastName"
      : "Socio Financiero Mock",
  email:
    props.userType === "medical" ? "mock@example.com" : "socio@example.com",
  profile_picture_url: null,
};

const visibleNavItems = computed(() =>
  props.navigationItems.filter((item) => item.visible),
);

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
  const redirectPath =
    props.userType === "medical" ? "/auth/login" : "/socios/login";
  router.push(redirectPath);
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
    :aria-label="`Panel de control ${userType === 'medical' ? 'médico' : 'socio financiero'}`"
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

        <UiSearchInput
          placeholder="Buscar"
          aria-label="Buscar"
          max-width="320px"
        />

        <button
          class="dashboard__notification-btn"
          aria-label="Ver notificaciones"
          title="Notificaciones"
        >
          <AtomsIconsNotificationsIcon aria-hidden="true" />
        </button>

        <UiInputDropdownMenu
          :src="userProfilePicture"
          :hide-default-items="hideDefaultItems"
          :custom-urls="customUrls"
          :with-avatar="withAvatar"
        />
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
              :href="`/${module}/inicio`"
              class="dashboard__logo"
              :aria-label="`VitaLink - Ir al inicio ${module}`"
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
            <li
              v-for="item in visibleNavItems"
              :key="item.href"
              class="dashboard__nav-item"
              role="none"
            >
              <NuxtLink
                :href="item.href"
                class="dashboard__nav-link"
                active-class="dashboard__nav-link--active"
                @click="isMobile && closeSidebar()"
                :aria-current="$route.path === item.href ? 'page' : undefined"
              >
                <span class="dashboard__nav-icon" aria-hidden="true">
                  <component :is="item.icon" />
                </span>
                <span class="dashboard__nav-text">{{ item.label }}</span>
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
                :href="`/${module}/inicio`"
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
        :aria-label="`Contenido principal ${userType === 'medical' ? 'médico' : 'socio financiero'}`"
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
    width: 292px;
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
    color: $color-primary;

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
    background: none;
    border: none;
    padding: 0;
    margin: 0;
  }

  &__main {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    margin-left: 292px;
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
