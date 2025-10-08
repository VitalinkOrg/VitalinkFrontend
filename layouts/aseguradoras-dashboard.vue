<script lang="ts" setup>
import AtomsIconsHomeIcon from "~/components/atoms/icons/home-icon.vue";
import AtomsIconsReceiptIcon from "~/components/atoms/icons/receipt-icon.vue";
import BaseDashboard from "./base-dashboard.vue";

definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});

const navigationItems = [
  {
    href: "/socio-financiero/inicio",
    label: "Inicio",
    icon: AtomsIconsHomeIcon,
    visible: true,
  },
  {
    href: "/socio-financiero/creditos",
    label: "Gestor de crédito",
    icon: AtomsIconsReceiptIcon,
    visible: true,
  },
];

const customUrls = {
  configuracion: "/socio-financiero/inicio",
  ayuda: "/socio-financiero/inicio",
};
</script>

<template>
  <BaseDashboard
    module="medicos"
    user-type="medical"
    :navigation-items="navigationItems"
    :custom-urls="customUrls"
    middleware="auth-doctors-hospitals"
    :hide-default-items="['perfil', 'cuenta', 'resenas']"
    :with-avatar="false"
  >
    <slot />
  </BaseDashboard>
</template>
