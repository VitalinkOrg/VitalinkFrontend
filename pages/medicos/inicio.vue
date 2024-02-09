
<template>
  <NuxtLayout name="medicos-dashboard">
    <div class="row row-cols-4 mb-3">
      <div class="col">
        <div class="card rounded-3 border-0 shadow-sm">
          <div class="card-body d-flex align-items-center px-1">

            <AtomsIconsNoActivityIcon />
            <p class="d-flex flex-column ms-3 mb-0">
              Aún no tienes actividad
              <button class="btn btn-primary btn-sm mt-2 rounded-3">Empezar</button>
            </p>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card rounded-3 border-0 shadow-sm">
          <div class="card-body d-flex align-items-center px-1">

            <AtomsIconsNoActivityIcon />
            <p class="d-flex flex-column ms-3 mb-0">
              Aún no tienes actividad
              <button class="btn btn-primary btn-sm mt-2 rounded-3">Empezar</button>
            </p>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card rounded-3 border-0 shadow-sm">
          <div class="card-body d-flex align-items-center px-1">

            <AtomsIconsNoActivityIcon />
            <p class="d-flex flex-column ms-3 mb-0">
              Aún no tienes actividad
              <button class="btn btn-primary btn-sm mt-2 rounded-3">Empezar</button>
            </p>
          </div>
        </div>
      </div>
      <div class="col">
        <div class="card rounded-3 border-0 shadow-sm">
          <div class="card-body d-flex align-items-center px-1">

            <AtomsIconsNoActivityIcon />
            <p class="d-flex flex-column ms-3 mb-0">
              Aún no tienes actividad
              <button class="btn btn-primary btn-sm mt-2 rounded-3">Empezar</button>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-sm-8">
        <p class="mx-2 d-flex align-items-center justify-content-between">
          <span class="fw-medium fs-5">Próximas Citas</span>
          <NuxtLink class="btn btn-link text-dark" href="/pacientes/citas">Ver Todo
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
          <span class="fw-medium fs-5">Pacientes</span>
          <NuxtLink class="btn btn-link text-dark" href="/pacientes/citas">Ver Todo
            <AtomsIconsArrowRightIcon />
          </NuxtLink>
        </p>
        <div class="card border-0 shadow rounded-3 ">
          <div class="card-body d-flex flex-column text-center p-5">
            <span class="w-75 mx-auto">
              <AtomsIconsChartVacio />
            </span>
            <p class="d-flex flex-column align-items-start ms-3">
              <span class="fw-medium text-muted fs-6">Aún no tienes actividad en tu tablero</span>
              <span class="fw-light text-muted fs-6">Muy pronto podrás administrar y verificar tu actividad.</span>
              <button class="btn btn-primary btn-sm mt-2 rounded-3 mx-auto">Empezar</button>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <p class="mx-2 d-flex align-items-center justify-content-between">
        <span class="fw-medium fs-5">Historial</span>
        <NuxtLink class="btn btn-link text-dark" href="/pacientes/citas">Ver Todo
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
