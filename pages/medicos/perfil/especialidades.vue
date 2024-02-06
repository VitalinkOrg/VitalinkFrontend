<template>
  <NuxtLayout name="medicos-dashboard-perfil">
    <p class="m-0">Especialidades Médicas</p>
    <p class="text-muted fw-light">Escribe las Especialidades médicas que ofrecerás en la plataforma.</p>
    <button
      class="btn btn-light border w-100 fw-light text-start d-flex bg-white justify-content-between align-items-center mb-3">
      <span>Oftalomogía</span>
      <span class="fw-semibold">
        <AtomsIconsTimesXIcon />
      </span>
    </button>
    <button
      class="btn btn-light border w-100 fw-light text-start d-flex bg-white justify-content-between align-items-center mb-3">
      <span>Oftalomogía Pediátrica</span>
      <span class="fw-semibold">
        <AtomsIconsTimesXIcon />
      </span>
    </button>

    <div class="bg-primary rounded-4 p-3 mb-3" style="--bs-bg-opacity: 0.1">
      <input type="text" placeholder="Escriba la especialidad" class="form-control">
      <div class="text-end mt-2">
        <button class="btn btn-link text-dark">Cancelar</button>
        <button class="btn btn-light fw-light border-dark">Guardar</button>
      </div>
    </div>

    <button class="btn btn-info  text-white ">
      <AtomsIconsPlusIcon /> Agregar
    </button>

    <hr>
    <p class="m-0">Servicios / Procedimientos</p>
    <p class="text-muted fw-light">Agrega los servicios médicos que ofrecerás en la plataforma.</p>
    <button
      class="btn btn-light border w-100 fw-light text-start d-flex bg-white justify-content-between align-items-center mb-3">
      <span>Cirugía de catarata monofocal</span>
      <span class="fw-semibold">
        <AtomsIconsTimesXIcon />
      </span>
    </button>

    <button class="btn btn-info  text-white ">
      <AtomsIconsPlusIcon /> Agregar
    </button>

  </NuxtLayout>
</template>