<template>
  <div class="dropdown">
    <button
      ref="dropdownTrigger"
      class="input-dropdown-menu__trigger"
      type="button"
      data-bs-toggle="dropdown"
      :aria-expanded="isDropdownOpen"
      :aria-haspopup="true"
      aria-label="Menú de usuario - Abrir opciones de cuenta"
      :aria-describedby="ariaDescribedBy"
      @click="toggleDropdown"
      @keydown="handleTriggerKeydown"
    >
      <div class="input-dropdown-menu__trigger--avatar-container">
        <img
          v-if="shouldShowImage && withAvatar"
          :src="src"
          :alt="altText"
          class="input-dropdown-menu__trigger--avatar"
          @error="handleImageError"
          @load="handleImageLoad"
          loading="lazy"
        />
        <div
          v-else
          class="input-dropdown-menu__trigger--avatar input-dropdown-menu__trigger--avatar-fallback"
          :aria-label="altText"
          role="img"
        >
          <div
            class="input-dropdown-menu__trigger--avatar-fallback--background"
          >
            <span v-if="userName !== ''">
              {{ userName.charAt(0).toUpperCase() }}
            </span>
          </div>
        </div>
      </div>
      <AtomsIconsChevronDown
        size="20"
        class="input-dropdown-menu__trigger--icon"
        :class="{ rotated: isDropdownOpen }"
        aria-hidden="true"
      />
    </button>

    <div :id="ariaDescribedBy" class="sr-only">
      Menú desplegable con {{ visibleMenuItems.length }} opciones disponibles
    </div>

    <ul
      ref="dropdownMenu"
      class="dropdown-menu dropdown-menu-end"
      role="menu"
      :aria-labelledby="triggerId"
      :aria-hidden="!isDropdownOpen"
      @keydown="handleMenuKeydown"
      @focusout="handleFocusOut"
    >
      <li v-for="(item, index) in visibleMenuItems" :key="item.key" role="none">
        <NuxtLink
          v-if="item.type === 'link'"
          :ref="(el) => setMenuItemRef(el && '$el' in el ? el.$el : el, index)"
          class="input-dropdown-menu__item"
          :href="item.url"
          role="menuitem"
          :tabindex="isDropdownOpen ? 0 : -1"
          :aria-label="`${item.label} - Navegar a ${item.label}`"
          @click="handleMenuItemClick"
          @keydown="handleMenuItemKeydown($event, index)"
        >
          <component
            :is="item.iconComponent"
            size="20"
            class="input-dropdown-menu__item--icon"
            aria-hidden="true"
          />
          <span class="input-dropdown-menu__item--label">{{ item.label }}</span>
        </NuxtLink>

        <button
          v-else-if="item.type === 'button'"
          :ref="(el) => setMenuItemRef(el && '$el' in el ? el.$el : el, index)"
          type="button"
          role="menuitem"
          :tabindex="isDropdownOpen ? 0 : -1"
          :aria-label="`${item.label} - ${getButtonAriaLabel(item.key)}`"
          @click="handleButtonClick(item)"
          @keydown="handleMenuItemKeydown($event, index)"
          class="input-dropdown-menu__item"
        >
          <component
            :is="item.iconComponent"
            size="20"
            class="input-dropdown-menu__item--icon"
            aria-hidden="true"
          />
          <span class="input-dropdown-menu__item--label">{{ item.label }}</span>
        </button>
      </li>
    </ul>

    <div aria-live="polite" aria-atomic="true" class="sr-only">
      {{ announceText }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import AtomsIconsAlertIcon from "@/components/atoms/icons/alert-icon.vue";
import AtomsIconsLogOutIcon from "@/components/atoms/icons/log-out-icon.vue";
import AtomsIconsSettingsIcon from "@/components/atoms/icons/settings-icon.vue";
import AtomsIconsStarIcon from "@/components/atoms/icons/star-icon.vue";
import AtomsIconsUserAddIcon from "@/components/atoms/icons/user-add-icon.vue";
import AtomsIconsUserIcon from "@/components/atoms/icons/user-icon.vue";
import { useAuth } from "~/composables/api";

const { logout } = useAuth();
const { getUserInfo } = useUserInfo();
const router = useRouter();

interface MenuItem {
  key: string;
  label: string;
  url?: string;
  iconComponent: any;
  type: "link" | "button";
  action?: () => void;
  visible?: boolean;
}

interface Props {
  src: string;
  altText?: string;
  menuItems?: MenuItem[];
  hideDefaultItems?: string[];
  customUrls?: Record<string, string>;
  withAvatar: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  altText: "Avatar del usuario",
  menuItems: () => [],
  hideDefaultItems: () => [],
  customUrls: () => ({}),
  withAvatar: true,
});
const userInfo = getUserInfo();

const isDropdownOpen = ref(false);
const imageError = ref(false);
const imageLoaded = ref(false);
const announceText = ref("");
const dropdownTrigger = ref<HTMLButtonElement>();
const dropdownMenu = ref<HTMLUListElement>();
const menuItems = ref<(HTMLElement | null)[]>([]);
const currentFocusIndex = ref(-1);
const userName = computed(() => {
  return userInfo?.name ? userInfo.name : userInfo.email;
});

const triggerId = `dropdown-trigger-${Math.random().toString(36).substring(2, 11)}`;
const ariaDescribedBy = `dropdown-description-${Math.random().toString(36).substring(2, 11)}`;

const shouldShowImage = computed(() => {
  return props.src && !imageError.value && props.src.trim() !== "";
});

const defaultMenuItems: MenuItem[] = [
  {
    key: "perfil",
    label: "Perfil",
    url: "/medicos/perfil",
    iconComponent: AtomsIconsUserAddIcon,
    type: "link",
    visible: true,
  },
  {
    key: "cuenta",
    label: "Mi Cuenta",
    url: "/pacientes/cuenta",
    iconComponent: AtomsIconsUserIcon,
    type: "link",
    visible: true,
  },
  {
    key: "configuracion",
    label: "Configuración",
    url: "/medicos/configuracion",
    iconComponent: AtomsIconsSettingsIcon,
    type: "link",
    visible: true,
  },
  {
    key: "resenas",
    label: "Reseñas",
    url: "/medicos/resenas",
    iconComponent: AtomsIconsStarIcon,
    type: "link",
    visible: true,
  },
  {
    key: "ayuda",
    label: "Ayuda y Soporte",
    url: "/pacientes/ayuda",
    iconComponent: AtomsIconsAlertIcon,
    type: "link",
    visible: true,
  },
  {
    key: "logout",
    label: "Cerrar Sesión",
    iconComponent: AtomsIconsLogOutIcon,
    type: "button",
    action: handleLogout,
    visible: true,
  },
];

function handleImageError(event: Event) {
  imageError.value = true;
  imageLoaded.value = false;

  nextTick(() => {});
}

function handleImageLoad() {
  imageError.value = false;
  imageLoaded.value = true;
}

function isValidImageUrl(url: string): boolean {
  if (!url || url.trim() === "") return false;

  try {
    new URL(url);
    return true;
  } catch {
    return url.startsWith("/") || url.startsWith("./") || url.startsWith("../");
  }
}

function handleLogout() {
  try {
    logout();

    announceText.value = "Sesión cerrada correctamente. Redirigiendo...";

    setTimeout(() => {
      router.push("/pacientes/login");
    }, 500);
  } catch (error) {
    console.error("Error durante el logout:", error);
    announceText.value = "Error al cerrar sesión. Inténtelo de nuevo.";
  }
}

function toggleDropdown() {
  isDropdownOpen.value = !isDropdownOpen.value;
  currentFocusIndex.value = -1;

  if (isDropdownOpen.value) {
    announceText.value = "Menú desplegado";
    nextTick(() => {
      focusFirstMenuItem();
    });
  } else {
    announceText.value = "Menú cerrado";
  }
}

function closeDropdown() {
  if (isDropdownOpen.value) {
    isDropdownOpen.value = false;
    currentFocusIndex.value = -1;
    announceText.value = "Menú cerrado";
    dropdownTrigger.value?.focus();
  }
}

function focusFirstMenuItem() {
  const firstItem = menuItems.value[0];
  if (firstItem) {
    currentFocusIndex.value = 0;
    firstItem.focus();
  }
}

function focusMenuItem(index: number) {
  const item = menuItems.value[index];
  if (item && index >= 0 && index < menuItems.value.length) {
    currentFocusIndex.value = index;
    item.focus();
  }
}

function setMenuItemRef(el: HTMLElement | null, index: number) {
  if (el) {
    menuItems.value[index] = el;
  }
}

function handleTriggerKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case "Enter":
    case " ":
    case "ArrowDown":
      event.preventDefault();
      if (!isDropdownOpen.value) {
        toggleDropdown();
      } else {
        focusFirstMenuItem();
      }
      break;
    case "ArrowUp":
      event.preventDefault();
      if (isDropdownOpen.value) {
        focusMenuItem(visibleMenuItems.value.length - 1);
      }
      break;
    case "Escape":
      if (isDropdownOpen.value) {
        event.preventDefault();
        closeDropdown();
      }
      break;
  }
}

function handleMenuKeydown(event: KeyboardEvent) {
  switch (event.key) {
    case "Escape":
      event.preventDefault();
      closeDropdown();
      break;
    case "Tab":
      closeDropdown();
      break;
  }
}

function handleMenuItemKeydown(event: KeyboardEvent, index: number) {
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      const nextIndex = (index + 1) % visibleMenuItems.value.length;
      focusMenuItem(nextIndex);
      break;
    case "ArrowUp":
      event.preventDefault();
      const prevIndex =
        index === 0 ? visibleMenuItems.value.length - 1 : index - 1;
      focusMenuItem(prevIndex);
      break;
    case "Home":
      event.preventDefault();
      focusMenuItem(0);
      break;
    case "End":
      event.preventDefault();
      focusMenuItem(visibleMenuItems.value.length - 1);
      break;
    case "Enter":
    case " ":
      event.preventDefault();
      (event.target as HTMLElement).click();
      break;
    case "Escape":
      event.preventDefault();
      closeDropdown();
      break;
  }
}

function handleFocusOut(event: FocusEvent) {
  nextTick(() => {
    const dropdown = dropdownTrigger.value?.closest(".dropdown");
    if (!dropdown?.contains(event.relatedTarget as Node)) {
      closeDropdown();
    }
  });
}

function handleMenuItemClick() {
  closeDropdown();
}

function handleButtonClick(item: MenuItem) {
  if (item.action) {
    item.action();
  }
  closeDropdown();
}

function getButtonAriaLabel(key: string): string {
  const labels: Record<string, string> = {
    logout: "Cerrar sesión y salir de la aplicación",
    configuracion: "Abrir configuración de la cuenta",
    ayuda: "Obtener ayuda y soporte técnico",
  };
  return labels[key] || "Ejecutar acción";
}

const visibleMenuItems = computed(() => {
  const allItems = [...defaultMenuItems, ...props.menuItems];

  return allItems
    .filter((item) => {
      if (props.hideDefaultItems.includes(item.key)) {
        return false;
      }

      if (item.visible === false) {
        return false;
      }

      return true;
    })
    .map((item) => {
      if (item.type === "link" && props.customUrls[item.key]) {
        return {
          ...item,
          url: props.customUrls[item.key],
        };
      }

      return item;
    });
});

watch(
  () => props.src,
  (newSrc, oldSrc) => {
    imageError.value = false;
    imageLoaded.value = false;

    if (!isValidImageUrl(newSrc)) {
      console.warn("URL de imagen no válida:", newSrc);
      imageError.value = true;
    }
  },
  { immediate: true }
);

onMounted(async () => {
  if (!isValidImageUrl(props.src)) {
    imageError.value = true;
  }

  const handleClickOutside = (event: MouseEvent) => {
    const dropdown = dropdownTrigger.value?.closest(".dropdown");
    if (!dropdown?.contains(event.target as Node)) {
      closeDropdown();
    }
  };

  document.addEventListener("click", handleClickOutside);

  onUnmounted(() => {
    document.removeEventListener("click", handleClickOutside);
  });
});
</script>

<style lang="scss" scoped>
.sr-only {
  @include visually-hidden;
}

.dropdown-menu {
  background-color: $white;
  border: 0.0625rem solid #f1f3f7;
  box-shadow:
    0 0.25rem 0.375rem -0.125rem #1018281f,
    -0.5rem 0.75rem 1rem -0.25rem #1018281f;
}

.input-dropdown-menu {
  &__trigger {
    background: none;
    border: none;
    padding: 0.25rem;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    border-radius: 0.375rem;
    transition: all 0.2s ease;

    &:focus {
      outline: 0.125rem solid $primary-aqua;
      outline-offset: 0.125rem;
    }

    &:hover {
      background-color: rgba(4, 191, 174, 0.1);
    }

    &--avatar-container {
      position: relative;
      height: 2.4375rem;
      width: 2.4375rem;
    }

    &--avatar {
      height: 2.4375rem;
      width: 2.4375rem;
      border-radius: 50%;
      padding: 0.125rem;
      background: linear-gradient(182.01deg, #04bfae 1.69%, #6c78e8 72.38%);
      display: flex;
      align-items: center;
      justify-content: center;
      object-fit: cover;

      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
        display: block;
      }
    }

    &--avatar-fallback {
      font-weight: bold;
      font-size: 0.75rem;
      color: $color-primary;

      span {
        font-family: $font-family-montserrat-alt;
        font-weight: 700;
        font-size: 0.8203125rem;
        line-height: 1.230625rem;
        letter-spacing: 0;
      }

      &--background {
        border-radius: 50%;
        width: 2.125rem;
        height: 2.125rem;
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: #ebecf8;
      }
    }

    &--icon {
      color: #353e5c;
      transition: transform 0.2s ease;

      &.rotated {
        transform: rotate(180deg);
      }
    }
  }

  &__item {
    display: flex;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: none;
    width: 100%;
    text-align: left;
    background: none;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    color: inherit;

    &:focus {
      outline: 0.125rem solid $primary-aqua;
      outline-offset: -0.125rem;
      background-color: #e7f7f8;
    }

    &:hover {
      background: #e7f7f8;
    }

    &:focus,
    &:hover {
      background-color: #e7f7f8;
    }

    &--icon {
      color: $primary-aqua;
      flex-shrink: 0;
    }

    &--label {
      font-family: $font-family-main;
      font-weight: 500;
      font-size: 0.875rem;
      line-height: 1.25rem;
      letter-spacing: 0;
      text-wrap: nowrap;
      color: $color-foreground;
      min-height: 1.25rem;
      display: flex;
      align-items: center;
    }
  }
}

.dropdown-menu {
  transition:
    opacity 0.2s ease,
    visibility 0.2s ease;
}

@media (prefers-contrast: high) {
  .input-dropdown-menu__item {
    border: 0.0625rem solid transparent;

    &:focus,
    &:hover {
      border-color: $primary-aqua;
      background-color: #d0f2f0;
    }
  }
}
</style>
