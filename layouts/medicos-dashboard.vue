<template>
  <div class="dashboard bg-light">
    <div class="dashboard-sidebar bg-white shadow p-4">
      <nav class="nav d-flex flex-column align-items-start w-100">
        <span class="mb-5 ps-3">
          <AtomsVitalinkLogo />
        </span>
        <li class="nav-item w-100 mb-3">
          <NuxtLink href="/medicos/inicio" class="nav-link rounded-3 py-3 text-dark" active-class="bg-primary"
            style="--bs-bg-opacity: 0.05">
            <span class="text-primary me-2">
              <AtomsIconsHomeIcon />
            </span> Inicio
          </NuxtLink>
        </li>
        <li class="nav-item w-100 mb-3">
          <NuxtLink href="/medicos/citas" class="nav-link rounded-3 py-3 text-dark" active-class="bg-primary"
            style="--bs-bg-opacity: 0.05">
            <span class="text-primary me-2">
              <AtomsIconsCitasIcon />
            </span> Citas
          </NuxtLink>
        </li>
        <li class="nav-item w-100 mb-3">
          <NuxtLink href="/medicos/servicios" class="nav-link rounded-3 py-3 text-dark" active-class="bg-primary"
            style="--bs-bg-opacity: 0.05">
            <span class="text-primary me-2">
              <AtomsIconsServiciosIcon />
            </span> Servicios
          </NuxtLink>
        </li>
        <li class="nav-item w-100 mb-3">
          <NuxtLink href="/medicos/pacientes" class="nav-link rounded-3 py-3 text-dark" active-class="bg-primary"
            style="--bs-bg-opacity: 0.05">
            <span class="text-primary me-2">
              <AtomsIconsPacientesIcon />
            </span> Pacientes
          </NuxtLink>
        </li>
        <li class="nav-item w-100 mb-3">
          <NuxtLink href="/medicos/hospitales" class="nav-link rounded-3 py-3 text-dark" active-class="bg-primary"
            style="--bs-bg-opacity: 0.05">
            <span class="text-primary me-2">
              <AtomsIconsHospitalesIcon />
            </span> Hospitales
          </NuxtLink>
        </li>
      </nav>
      <nav class="nav">
        <hr>
        <li class="nav-item">
          <NuxtLink class="nav-link text-dark" href="/medicos/inicio">
            <span class="text-success me-2">
              <AtomsIconsInfoIcon />
            </span> Ayuda y Soporte
          </NuxtLink>
        </li>
        <li class="nav-item">
          <button class="nav-link text-dark">
            <span class="text-success me-2">
              <AtomsIconsLogoutDashboardIcon />
            </span> Cerrar Sesión
          </button>
        </li>
      </nav>
    </div>
    <main class="container-fluid" style="height: 100vh; overflow-y: auto;">
      <div class=" d-flex justify-content-end align-items-center py-3">
        <div class="input-group shadow-sm w-auto">
          <span class="input-group-text bg-transparent border-end-0 rounded-start-3" id="basic-addon1">
            <AtomsIconsSearchIcon />
          </span>
          <input type="text" class="form-control border-start-0 rounded-end-3" placeholder="Buscar" aria-label="Buscar"
            aria-describedby="basic-addon1">
        </div>
        <button class="btn btn-link">
          <AtomsIconsNotificationsIcon />
        </button>
        <button class="btn btn-link">
          <AtomsIconsChevronDown />
        </button>
      </div>
      <slot />
    </main>
  </div>
</template>
<style src="@/assets/styles/vitalink.scss" />
<style scoped lang="scss">
.dashboard {
  height: 100vh;
  display: flex;


  &-sidebar {
    height: 100%;
    max-width: 15rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
  }
}
</style>