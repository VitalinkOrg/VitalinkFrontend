
<script setup>
const { historialVauchers } = useAseguradora()

</script>

<template>
  <NuxtLayout name="aseguradoras-dashboard">
    <nav style="--bs-breadcrumb-divider: '/';" aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink href="/aseguradoras/inicio" class="text-muted">Inicio</NuxtLink>
        </li>
        <li class="breadcrumb-item active fw-semibold" aria-current="page">Gestor de Váuchers</li>
      </ol>
    </nav>
    <p>
      <span class="fw-medium fs-4">Listado de Váuchers</span>
    </p>

    <div class="d-flex align-items-end justify-content-between mb-4">
      <ul class="nav nav-underline d-flex flex-row w-100">
        <li class="nav-item">
          <button class="nav-link active">Todos</button>
        </li>
        <li class="nav-item">
          <button class="nav-link">Utilizados</button>
        </li>
        <li class="nav-item">
          <button class="nav-link">Pendientes de aprobación</button>
        </li>
        <li class="nav-item">
          <button class="nav-link">Pendientes de usar</button>
        </li>
        <li class="nav-item">
          <button class="nav-link">Rechazados</button>
        </li>
      </ul>
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
          <button class="btn btn-outline-dark dropdown-toggle" type="button" data-bs-toggle="dropdown"
            aria-expanded="false">
            Ordenar por
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#">Action</a></li>
            <li><a class="dropdown-item" href="#">Another action</a></li>
            <li><a class="dropdown-item" href="#">Something else here</a></li>
          </ul>
        </div>
      </div>
    </div>

    <section>
      <p class="mx-2 d-flex align-items-center justify-content-between">
        <span class="fw-semibold fs-5 px-4">Historial</span>
        <!-- <NuxtLink class="btn btn-link text-dark" href="/aseguradoas">Ver Todo [I]</NuxtLink> -->
      </p>
      <div class="card ">
        <table class="table fw-light">
          <thead>
            <tr>
              <th scope="col"></th>
              <th scope="col" class="text-muted">Código</th>
              <th scope="col" class="text-muted">Nombre del asegurado</th>
              <th scope="col" class="text-muted">No de Asegurado</th>
              <th scope="col" class="text-muted">Procedimiento</th>
              <th scope="col" class="text-muted">Vencimiento</th>
              <th scope="col" class="text-muted">Estado</th>
              <th scope="col" class="text-muted"></th>
            </tr>
          </thead>

          <tbody>
            <AseguradorasVaucherTableItem v-for="vaucher in historialVauchers" :vaucher="vaucher" :selectable="true" />
          </tbody>
        </table>
      </div>

    </section>
  </NuxtLayout>
</template>