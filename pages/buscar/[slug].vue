<script setup>
// const { clinicas } = await useSearch();
const { clinicas } = useSearch();
const panel = false
</script>


<template>
  <NuxtLayout name="web">
    <main class="bg-light">
      <section class="bg-primary mb-4" style="--bs-bg-opacity: .03">
        <div class="container">
          <div class="row pt-5 pb-3">
            <div class="col-sm-11 mx-auto">
              <h1 class="text-sm-center h3 mb-4 fw-medium">¿Qué servicio médico estás buscando?</h1>
              <WebsiteSearchBar />
            </div>
          </div>
        </div>
      </section>

      <div class="container-fluid">
        <section class="pb-5">
          <div class="row">
            <div class="col-7">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <span class="fw-medium ms-2">{{ clinicas.length }} Medicos disponibles</span>
                <span class="d-flex align-items-center">
                  <span class="text-nowrap">Ordenar por:</span>
                  <select name="medicos-sort" id="medicos-sort" class="form-select form-select-sm border-0">
                    <option value="recomendados">Recomendados</option>
                    <option value="valoraciones">Valoraciones</option>
                    <option value="disponibilidad" selected>Disponibilidad inmediata</option>
                    <option value="cercania">Mayor cercanía</option>
                  </select>
                </span>
              </div>
              <WebsiteClinicasListItem v-for="clinica in clinicas" :clinica="clinica" />
            </div>
            <div class="col">
              <div class="card bg-dark-subtle d-flex align-items-center justify-content-center" style="min-height:30rem">
                MAPA INTERACTIVO
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </NuxtLayout>
</template>

