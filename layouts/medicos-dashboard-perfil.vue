<template>
  <NuxtLayout name="medicos-dashboard">
    <nav style="--bs-breadcrumb-divider: '/';" aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink href="/medicos/inicio" class="text-muted">Inicio</NuxtLink>
        </li>
      </ol>
    </nav>
    <p>
      <span class="fw-medium fs-4">Configuración de tu Perfil</span>
    </p>

    <div class="d-flex align-items-end justify-content-between mb-4">
      <ul class="nav nav-underline d-flex flex-row w-100">
        <li class="nav-item">
          <NuxtLink href="/medicos/perfil" class="nav-link" active-class="active text-primary">
            Datos Personales
          </NuxtLink>
        </li>
        <li class="nav-item">
          <NuxtLink href="/medicos/perfil/profesional" class="nav-link" active-class="active text-primary">
            Datos Profesionales
          </NuxtLink>
        </li>
        <li class="nav-item">
          <NuxtLink href="/medicos/perfil/educacion-experiencia" class="nav-link" active-class="active text-primary">
            Educación y Experiencia
          </NuxtLink>
        </li>
        <li class="nav-item">
          <NuxtLink href="/medicos/perfil/galeria" class="nav-link" active-class="active text-primary">
            Galería
          </NuxtLink>
        </li>
        <li class="nav-item">
          <NuxtLink href="/medicos/perfil/especialidades" class="nav-link" active-class="active text-primary">
            Especialidades
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
