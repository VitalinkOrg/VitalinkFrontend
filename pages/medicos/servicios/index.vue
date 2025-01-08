<script setup>
definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});
const config = useRuntimeConfig();
const user_info = useCookie("user_info");
const { data: services } = await useFetch(
  config.public.API_BASE_URL + "/services",
  {
    transform: (_services) => _services.data,
  }
);
const filteredArray = services.value.filter((item) =>
  user_info.value.services.includes(item.code)
);
</script>

<template>
  <NuxtLayout name="medicos-dashboard">
    <nav style="--bs-breadcrumb-divider: &quot;/&quot;" aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink href="/medicos/inicio" class="text-muted">Inicio</NuxtLink>
        </li>
        <li class="breadcrumb-item active fw-semibold" aria-current="page">
          Servicios
        </li>
      </ol>
    </nav>
    <p>
      <span class="fw-medium fs-4">Mis servicios</span>
    </p>
    <WebsiteClinicaServiciosTab :services="filteredArray" />
  </NuxtLayout>
</template>
