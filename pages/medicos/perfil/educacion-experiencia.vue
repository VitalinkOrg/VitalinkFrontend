<template>
  <NuxtLayout name="medicos-dashboard-perfil">
    <!-- Educacion -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-normal m-0">Educación o Estudios</h4>
      <button class="btn btn-white border-dark fw-light">
        <span class="fw-semibold me-2">
          <AtomsIconsPlusIcon />
        </span> Agregar Nueva
      </button>
    </div>

    <div class="card rounded-4 mb-3">
      <div class="card-body d-flex">
        <div class="w-100">
          <p class="text-info fw-medium m-0">Feb. 2004 - Ene. 2011</p>
          <p class="fw-light fs-5 mb-1">Médico y Cirujano</p>
          <p class="m-0 fw-light text-muted ">Escuela Aútonoma de Ciencias Médicas (Actual UCIMED)..</p>
          <p class="m-0 fw-light text-muted ">San José, Costa Rica.</p>
        </div>
        <div class="d-flex align-items-start">
          <button class="btn btn-light bg-white border">
            <AtomsIconsEditPencilIcon />
          </button>
          <button class="btn btn-light bg-white border ms-2">
            <AtomsIconsTrashIcon />
          </button>
        </div>
      </div>
    </div>
    <div class="card rounded-4 mb-3">
      <div class="card-body d-flex">
        <div class="w-100">
          <p class="text-info fw-medium m-0">Mar. 2006 - Ene. 2009</p>
          <p class="fw-light fs-5 mb-1">Especialidad de Oftalmología</p>
          <p class="m-0 fw-light text-muted ">Universidad de Costa Rica - Facultad de Medicina.</p>
          <p class="m-0 fw-light text-muted ">San Pedro, San José, Costa Rica</p>
        </div>
        <div class="d-flex align-items-start">
          <button class="btn btn-light bg-white border">
            <AtomsIconsEditPencilIcon />
          </button>
          <button class="btn btn-light bg-white border ms-2">
            <AtomsIconsTrashIcon />
          </button>
        </div>
      </div>
    </div>


    <!-- Experiencia  -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-normal m-0">Experiencia</h4>
      <button class="btn btn-white border-dark fw-light">
        <span class="fw-semibold me-2">
          <AtomsIconsPlusIcon />
        </span> Agregar Nueva
      </button>
    </div>

    <!-- Cuando esta vacio  -->
    <!-- <div class="card rounded-4 mb-3">
      <div class="card-body d-flex">
        <div class="w-100">
          <p class="text-info fw-medium m-0">Desde 2019</p>
          <p class="fw-light fs-5 mb-1">Médico Especialista Asistente en el Depto. de Oftalmología</p>
          <p class="m-0 fw-light text-muted ">Hospital San Juan de Dios</p>
          <p class="m-0 fw-light text-muted ">San José, Costa Rica.</p>
        </div>
        <div class="d-flex align-items-start">
          <button class="btn btn-light bg-white border">
            <AtomsIconsEditPencilIcon />
          </button>
          <button class="btn btn-light bg-white border ms-2">
            <AtomsIconsTrashIcon />
          </button>
        </div>
      </div>
    </div> -->
    <div class="card rounded-5 mb-3 bg-primary border-0" style="--bs-bg-opacity: 0.05">
      <div class="card-body text-center py-5">
        <img src="@/src/assets/img-icon-profile-empty-experience.svg" alt="Experiencia">
        <div class="row">
          <div class="col-sm-6  mx-auto">
            <p class="fw-light text-muted my-3">Aún no tienes certificaciones en tu perfil. Añade certificaciones para
              demostrar
              credibilidad
              a tus pacientes.
            </p>
            <button class="btn btn-primary">Agregar Experiencia</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Idiomas -->

    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="fw-normal m-0">Idiomas</h4>
      <button class="btn btn-white border-dark fw-light">
        <span class="fw-semibold me-2">
          <AtomsIconsPlusIcon />
        </span> Agregar Nueva
      </button>
    </div>

    <div class="card rounded-4 mb-3">
      <div class="card-body d-flex align-items-center">
        <div class="w-100">
          <span class="fw-medium m-0 fs-5 me-3">Español</span>
          <span class="fw-light fs-5 text-muted">Nativo</span>
        </div>
        <div class="d-flex align-items-start">
          <button class="btn btn-light bg-white border">
            <AtomsIconsEditPencilIcon />
          </button>
          <button class="btn btn-light bg-white border ms-2">
            <AtomsIconsTrashIcon />
          </button>
        </div>
      </div>
    </div>

  </NuxtLayout>
</template>