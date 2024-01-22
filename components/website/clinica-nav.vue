<script>
export default {
  props: ['clinica'],
  data: () => ({
    tab: 1
  })
}
</script>

<template>
  <ul class="nav nav-underline d-flex flex-row w-100">
    <li class="nav-item"><button class="nav-link" :class="tab === 1 ? 'active' : ''"
        @click="tab = 1">Disponibilidad</button></li>
    <li class="nav-item"><button class="nav-link" :class="tab === 2 ? 'active' : ''" @click="tab = 2">Servicios</button>
    </li>
    <li class="nav-item"><button class="nav-link" :class="tab === 3 ? 'active' : ''" @click="tab = 3">Ubicación</button>
    </li>
    <li class="nav-item"><button class="nav-link" :class="tab === 4 ? 'active' : ''" @click="tab = 4">Galería de
        fotos</button>
    </li>
    <li class="nav-item"><button class="nav-link" :class="tab === 5 ? 'active' : ''" @click="tab = 5">Reseñas</button>
    </li>
    <li class="nav-item"><button class="nav-link" :class="tab === 6 ? 'active' : ''" @click="tab = 6">Perfil</button></li>
  </ul>


  <section class="py-4 px-1">
    <!-- Dsiponibilidad  -->
    <div v-if="tab === 1">
      <p class="fw-semibold">Reserva una cita</p>
    </div>
    <!-- Servicios  -->
    <WebsiteClinicaServiciosTab :clinica="clinica" v-if="tab === 2" />
    <!-- Ubicacion -->
    <div v-if="tab === 3">Encuentranos Facilmente</div>
    <!-- Galeria  -->
    <div v-if="tab === 4">Fotos</div>
    <!-- Reseñas  -->
    <div v-if="tab === 5">Reseñas logradas</div>
    <!-- Perfil  -->
    <div v-if="tab === 6">Nuestra Historia</div>
  </section>
</template>