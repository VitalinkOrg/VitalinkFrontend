<script setup>
const user_info = useCookie("user_info");
</script>
<template>
  <NuxtLayout name="medicos-dashboard">
    <nav style="--bs-breadcrumb-divider: &quot;/&quot;" aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink href="/medicos/inicio" class="text-muted">Inicio</NuxtLink>
        </li>
      </ol>
    </nav>
    <p>
      <span class="fw-medium fs-4">Mis Reseñas</span>
    </p>
    <div>
      <div class="p-4">
        <slot />
      </div>
    </div>
  </NuxtLayout>
</template>
