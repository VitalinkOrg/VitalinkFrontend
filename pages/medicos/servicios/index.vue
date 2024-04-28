<script setup>
import { useStore } from "~/store";
definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});
const store = useStore();
const config = useRuntimeConfig();

const { data: services } = await useFetch(
  config.public.API_BASE_URL + "/services",
  {
    transform: (_services) => _services.data,
  }
);
const filteredArray = services.value.filter(item => store.user?.services.includes(item.code));
console.log(filteredArray, 'test');
</script>

<template>
  <NuxtLayout name="medicos-dashboard">
    <nav style="--bs-breadcrumb-divider: '/'" aria-label="breadcrumb">
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
    <WebsiteClinicaServiciosTab
      :services="filteredArray"
    />
  </NuxtLayout>
</template>
