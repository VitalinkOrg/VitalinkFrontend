<script>
export default {
  data: () => ({
    tab: 1 // 1 Disponibilidad, 2 Servicios , 3 Ubicacion, 4 Galeria, 5 Reseñas, 6 Perfil
  })
}
</script>
<template>
  <NuxtLayout name="web">
    Perfil medico

    <button @click="tab = 1">Disponibilidad</button>
    <button @click="tab = 2">Servicios</button>
    <button @click="tab = 3">Ubicación</button>
    <button @click="tab = 4">Galería</button>
    <button @click="tab = 5">Reseñas</button>
    <button @click="tab = 6">Perfil</button>

    <div v-if="tab === 1">Reserva una cita</div>
    <div v-if="tab === 2">Lista de Servicios</div>
    <div v-if="tab === 3">Encuentranos Facilmente</div>
    <div v-if="tab === 4">Fotos</div>
    <div v-if="tab === 5">Reseñas logradas</div>
    <div v-if="tab === 6">Nuestra Historia</div>
  </NuxtLayout>
</template>