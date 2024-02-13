
<template>
  <NuxtLayout name="aseguradoras-dashboard">


    <div class="row mb-3">
      <div class="col">
        <p class="mx-2 d-flex align-items-center justify-content-between">
          <span class="fw-medium fs-5">Váuchers Activos</span>
          <NuxtLink class="btn btn-link text-dark" href="/aseguradoras/inicio">Ver Todo
            <AtomsIconsArrowRightIcon />
          </NuxtLink>
        </p>
        <div class="card border-0 shadow rounded-3 py-5">
          <div class="card-body d-flex align-items-center p-5">
            <AtomsIconsChartVacio />
            <p class="d-flex flex-column align-items-start ms-3">
              <span class="fw-medium text-muted fs-5">Aún no tienes actividad en tu tablero</span>
              <span class="fw-light text-muted">Muy pronto podrás administrar y verificar tu actividad.</span>
              <button class="btn btn-primary btn-sm mt-2 rounded-3">Empezar</button>
            </p>
          </div>
        </div>
      </div>
      <div class="col">
        <p class="mx-2 d-flex align-items-center justify-content-between">
          <span class="fw-medium fs-5">Resumen Anual de Váuchers</span>
          <NuxtLink class="btn btn-link text-dark" href="/aseguradoras/inicio">Ver Todo
            <AtomsIconsArrowRightIcon />
          </NuxtLink>
        </p>
        <div class="card border-0 shadow rounded-3 ">
          <div class="card border-0 shadow rounded-3 py-5">
            <div class="card-body d-flex align-items-center p-5">
              <AtomsIconsChartVacio />
              <p class="d-flex flex-column align-items-start ms-3">
                <span class="fw-medium text-muted fs-5">Aún no tienes actividad en tu tablero</span>
                <span class="fw-light text-muted">Muy pronto podrás administrar y verificar tu actividad.</span>
                <button class="btn btn-primary btn-sm mt-2 rounded-3">Empezar</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <p class="mx-2 d-flex align-items-center justify-content-between">
        <span class="fw-medium fs-5">Historial</span>
        <NuxtLink class="btn btn-link text-dark" href="/aseguradoras/inicio">Ver Todo
          <AtomsIconsArrowRightIcon />
        </NuxtLink>
      </p>
      <div class="card border-0 shadow rounded-3 py-4">
        <div class="card-body d-flex align-items-center p-5">
          <span class="w-50 text-center">
            <AtomsIconsChartVacio />
          </span>
          <p class="d-flex flex-column align-items-start ms-3">
            <span class="fw-medium text-muted fs-5">Aún no tienes actividad en tu tablero</span>
            <span class="fw-light text-muted">Muy pronto podrás administrar y verificar tu actividad.</span>
            <button class="btn btn-primary btn-sm mt-2 rounded-3">Empezar</button>
          </p>
        </div>
      </div>
    </div>

  </NuxtLayout>
</template>
