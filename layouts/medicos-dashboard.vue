<script lang="ts" setup>
import AtomsIconsCitasIcon from "~/components/atoms/icons/citas-icon.vue";
import AtomsIconsHomeIcon from "~/components/atoms/icons/home-icon.vue";
import AtomsIconsHospitalesIcon from "~/components/atoms/icons/hospitales-icon.vue";
import AtomsIconsPacientesIcon from "~/components/atoms/icons/pacientes-icon.vue";
import AtomsIconsServiciosIcon from "~/components/atoms/icons/servicios-icon.vue";
import BaseDashboard from "./base-dashboard.vue";

definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});

const navigationItems = [
  {
    href: "/medicos/inicio",
    label: "Inicio",
    icon: AtomsIconsHomeIcon,
    visible: true,
  },

  {
    href: "/medicos/citas",
    label: "Citas",
    icon: AtomsIconsCitasIcon,
    visible: true,
  },
  {
    href: "/medicos/servicios",
    label: "Servicios",
    icon: AtomsIconsServiciosIcon,
    visible: true,
  },
  {
    href: "/medicos/pacientes",
    label: "Pacientes",
    icon: AtomsIconsPacientesIcon,
    visible: true,
  },
  {
    href: "/medicos/hospitales",
    label: "Mis Hospitales",
    icon: AtomsIconsHospitalesIcon,
    visible: true,
  },
];

const customUrls = {
  perfil: "/medicos/perfil",
  configuracion: "/medicos/perfil",
  resenas: "/medicos/resenas",
  ayuda: "/medicos/perfil",
};
</script>

<template>
  <BaseDashboard
    module="medicos"
    user-type="medical"
    :navigation-items="navigationItems"
    :custom-urls="customUrls"
    :hide-default-items="['cuenta']"
    middleware="auth-doctors-hospitals"
  >
    <slot />
  </BaseDashboard>
</template>
