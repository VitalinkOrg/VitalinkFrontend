<script setup>
const { pacientes, citas, vauchers, historial } = usePaciente()
console.log(citas, historial)
</script>
<template>
  <NuxtLayout name="pacientes-dashboard">
    <div>
      <header class="d-flex align-items-center">
        <div class="container">
          <h1 class="text-center fs-3 mb-4">
            <span class="fw-semibold">Bienvenida {{ pacientes[0].nombre }}</span>
            <span class="fw-light ms-1">¿Qué servicio médico estás buscando?</span>
          </h1>
          <WebsiteSearchBar :solicitar="true" />
        </div>
      </header>

      <main class="pt-3 pb-5 bg-light">
        <div class="container-fluid">
          <section class="mb-4">
            <p class="mx-2 d-flex align-items-center justify-content-between">
              <span class="fw-semibold fs-5">Próximas Citas</span>
              <NuxtLink class="btn btn-link text-dark" href="/pacientes/citas">Ver Todo [I]</NuxtLink>
            </p>
            <div class="card shadow-sm border-0">
              <div v-if="citas.length > 0" class="card-body">
                <div v-for="cita in citas">
                  {{ cita.medico.nombre }}
                  {{ cita.fecha }}
                  {{ cita.hora }}
                  {{ cita.procedimiento }}
                  {{ cita.lugar.texto }}
                  {{ cita.estado }}
                </div>
              </div>
              <div v-else class="card-body d-flex py-5">
                <div class="col-sm-5 text-end">
                  <img src="@/src/assets/img-chart-nocitas.svg" alt="">
                </div>
                <div class="col-sm-7">
                  <p class="fs-5 text-muted fw-medium">Aún no tienes actividad en tu tablero </p>
                  <p class="fw-light text-secondary">Muy pronto podrás administrar y verificar tu actividad.</p>
                  <button class="btn btn-primary border-danger">Empezar</button>
                </div>
              </div>
            </div>
          </section>
          <section class="mb-5 pb-5">
            <div class="row">
              <div class="col">
                <p class="mx-2 d-flex align-items-center justify-content-between">
                  <span class="fw-semibold fs-5">Historial de Hospitales y Médicos</span>
                  <NuxtLink class="btn btn-link text-dark" href="/pacientes/inicio">Ver Todo [I]</NuxtLink>
                </p>
                <div class="card shadow-sm border-0 h-100">
                  <div v-if="historial.length > 0" class="card-body">Mostrar citas</div>
                  <div v-else class="card-body d-flex py-5">
                    <div class="col-sm-5 text-end">
                      <img src="@/src/assets/img-chart-nocitas.svg" alt="">
                    </div>
                    <div class="col-sm-7">
                      <p class="fs-5 text-muted fw-medium">Aún no tienes actividad en tu tablero </p>
                      <p class="fw-light text-secondary">Muy pronto podrás administrar y verificar estadísticas y
                        actividades de los usuarios de Vitalink. </p>
                      <button class="btn btn-primary border-danger">Empezar</button>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col">
                <p class="mx-2 d-flex align-items-center justify-content-between">
                  <span class="fw-semibold fs-5">Mis Váuchers</span>
                  <NuxtLink class="btn btn-link text-dark" href="/pacientes/vauchers">Ver Todo [I]</NuxtLink>
                </p>
                <div class="card shadow-sm border-0 h-100">
                  <div v-if="vauchers.length > 0" class="card-body">
                    <div v-for="vaucher in vauchers">
                      {{ vaucher.id }}
                      {{ vaucher.servicio }}
                      {{ vaucher.estado }}
                    </div>
                  </div>
                  <div v-else class="card-body d-flex py-5">
                    <div class="col-sm-5 text-end">
                      <img src="@/src/assets/img-chart-nocitas.svg" alt="">
                    </div>
                    <div class="col-sm-7">
                      <p class="fs-5 text-muted fw-medium">Aún no tienes actividad en tu tablero </p>
                      <p class="fw-light text-secondary">Muy pronto podrás administrar y verificar estadísticas y
                        actividades de los usuarios de Vitalink. </p>
                      <button class="btn btn-primary border-danger">Empezar</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </section>
        </div>
      </main>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
header {
  background-color: #ebecf7;
  padding: 2rem 0 0;
}
</style>