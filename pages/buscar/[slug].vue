<script setup>
// const { clinicas } = await useSearch();
const { clinicas } = useSearch();
const panel = false
</script>


<template>
  <NuxtLayout name="web">
    <main class="bg-light">
      <div class="container">
        <div class="row py-5">
          <div class="col-sm-11 mx-auto">
            <h1 class="text-sm-center h3 mb-4">¿Qué servicio médico estás buscando?</h1>
            <WebsiteSearchBar />
          </div>
        </div>
        <section>
          <div class="row">
            <div class="col-7">
              <div class="d-flex align-items-center justify-content-between mb-3">
                <span class="fw-medium">{{ clinicas.length }} Medicos disponibles</span>
                <span class="d-flex align-items-center">
                  <span class="text-nowrap">Ordenar por:</span>
                  <select name="medicos-sort" id="medicos-sort" class="form-select form-select-sm border-0">
                    <option value="disponibilidad" selected>Disponibilidad</option>
                  </select>
                </span>
              </div>
              <WebsiteClinicasListItem v-for="clinica in clinicas" :clinica="clinica" />
            </div>
            <div class="col">
              MAPA
            </div>
          </div>
        </section>
      </div>
    </main>
  </NuxtLayout>
</template>

