<script setup>
const user_info = useCookie("user_info");
</script>
<template>
  <NuxtLayout name="aseguradoras-dashboard">
    <nav style="--bs-breadcrumb-divider: &quot;/&quot;" aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink href="/socio-financiero/inicio" class="text-muted"
            >Inicio</NuxtLink
          >
        </li>
      </ol>
    </nav>
    <p>
      <span class="fw-medium fs-4">Configuración de tu Perfil</span>
    </p>

    <div class="d-flex align-items-end justify-content-between mb-4">
      <ul class="nav nav-underline d-flex flex-row w-100">
        <li class="nav-item">
          <NuxtLink
            href="/socio-financiero/perfil"
            class="nav-link"
            active-class="active text-primary"
          >
            Información Básica
          </NuxtLink>
        </li>
        <li class="nav-item">
          <NuxtLink
            href="/socio-financiero/perfil/notificaciones"
            class="nav-link"
            active-class="active text-primary"
          >
            Notificaciones
          </NuxtLink>
        </li>
        <li class="nav-item">
          <NuxtLink
            href="/socio-financiero/perfil/privacidad"
            class="nav-link"
            active-class="active text-primary"
          >
            Privacidad
          </NuxtLink>
        </li>
        <!-- <li class="nav-item">
          <NuxtLink href="/socio-financiero/perfil/galeria" class="nav-link" active-class="active text-primary">
            Galería
          </NuxtLink>
        </li> -->
        <li class="nav-item">
          <NuxtLink
            href="/socio-financiero/perfil/eliminar-cuenta"
            class="nav-link"
            active-class="active text-primary"
          >
            Eliminar cuenta
          </NuxtLink>
        </li>
      </ul>
    </div>
    <div class="card border-0 shadow rounded-3">
      <div class="card-body p-4">
        <slot />
      </div>
    </div>
  </NuxtLayout>
</template>
