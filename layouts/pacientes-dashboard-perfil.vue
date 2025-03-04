<template>
  <NuxtLayout name="pacientes-dashboard">
    <div class="p-5">
      <p>
        <span class="fw-medium fs-4">Configuración</span>
      </p>

      <div class="d-flex align-items-end justify-content-between mb-4">
        <ul class="nav nav-underline d-flex flex-row w-100">
          <li class="nav-item">
            <NuxtLink
              href="/pacientes/cuenta"
              class="nav-link"
              active-class="active text-primary"
            >
              Cuenta
            </NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink
              href="/pacientes/notificaciones"
              class="nav-link"
              active-class="active text-primary"
            >
              Notificaciones
            </NuxtLink>
          </li>
          <li class="nav-item">
            <NuxtLink
              href="/pacientes/eliminar-cuenta"
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
    </div>
  </NuxtLayout>
</template>
