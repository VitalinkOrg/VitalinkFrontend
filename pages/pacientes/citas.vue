<script>
export default {
  data: () => ({
    tab: 1,
    sort: false
  })
}
</script>

<template>
  <NuxtLayout name="pacientes-dashboard">
    <section class="mb-4 container my-5">
      <p>
        <span class="fw-semibold fs-5">Mis Citas</span>
      </p>

      <div class="d-flex align-items-end justify-content-between mb-4">
        <ul class="nav nav-underline d-flex flex-row w-100">
          <li class="nav-item"><button class="nav-link" :class="tab === 1 ? 'active' : ''" @click="tab = 1">
              Todas las citas</button>
          </li>
          <li class="nav-item"><button class="nav-link" :class="tab === 2 ? 'active' : ''"
              @click="tab = 2">Concretadas</button>
          </li>
          <li class="nav-item"><button class="nav-link" :class="tab === 3 ? 'active' : ''"
              @click="tab = 3">Pendientes</button>
          </li>
          <li class="nav-item"><button class="nav-link" :class="tab === 4 ? 'active' : ''"
              @click="tab = 4">Canceladas</button>
          </li>
        </ul>
        <NuxtLink href="/buscar" class="btn btn-primary text-nowrap px-4">
          <AtomsIconsPlusIcon /> Nueva Cita
        </NuxtLink>
      </div>

      <div class="row mb-4">
        <div class="col-auto">
          <div class="input-group shadow-sm">
            <span class="input-group-text bg-transparent border-end-0 rounded-start-3" id="basic-addon1">
              <AtomsIconsSearchIcon />
            </span>
            <input type="text" class="form-control border-start-0 rounded-end-3" placeholder="Buscar" aria-label="Buscar"
              aria-describedby="basic-addon1">
          </div>
        </div>
        <div class="col-auto ms-auto d-flex">
          <button class="btn btn-outline-dark text-nowrap me-2">
            <AtomsIconsDownloadIcon /> Descargar
          </button>
          <div class="dropdown">
            <button class="btn btn-outline-dark dropdown-toggle" @click="sort = !sort" type="button"
              data-bs-toggle="dropdown" aria-expanded="false">
              Ordenar por
            </button>
            <ul class="dropdown-menu" :class="sort ? 'show' : ''">
              <li><a class="dropdown-item" href="#">Action</a></li>
              <li><a class="dropdown-item" href="#">Another action</a></li>
              <li><a class="dropdown-item" href="#">Something else here</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div class="card">
        <PacientesCitasNav v-if="tab === 1" />
      </div>


    </section>
  </NuxtLayout>
</template>
