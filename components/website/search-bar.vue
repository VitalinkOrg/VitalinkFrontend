
<script setup lang="ts">
import { ref, onMounted } from 'vue'

// declare a ref to hold the element reference
// the name must match template ref value
const procedimiento = ref(null)
const lugar = ref(null)
const vaucher = ref(null)

onMounted(() => {
  procedimiento.value.focus()
  lugar.value.focus()
  vaucher.value.focus()
})
function searchResults() {
  console.log(procedimiento, lugar, vaucher)
}
</script>


<template>
  <div class="card shadow border-0 rounded-4">
    <div class="card-body">
      <!-- <form class="d-flex align-items-end" action="/buscar/wovnworv" @submit.prevent="searchResults"> -->
      <form class="d-flex align-items-end" action="/buscar/wovnworv">
        <div class="row row-cols-sm-3 w-100">
          <div class="form-group">
            <label for="procedimiento" class="form-label text-uppercase">Procedimiento</label>
            <input type="text" class="form-control" id="procedimiento" placeholder="Operacion de cataratas"
              aria-describedby="procedimiento-help" ref="procedimiento">
            <!-- <div id="procedimiento-help" class="form-text ">We'll never share your email with anyone else.</div> -->
          </div>
          <div class="form-group">
            <label for="lugar" class="form-label">Lugar</label>
            <input type="text" class="form-control" id="lugar" aria-describedby="lugar-help" placeholder="Costa Rica"
              ref="lugar">
            <!-- <div id="lugar-help" class="form-text ">We'll never share your email with anyone else.</div> -->
          </div>
          <div class="form-group">
            <label for="vaucher" class="form-label">Código de Vaucher</label>
            <input type="text" class="form-control" id="vaucher" aria-describedby="vaucher-help"
              placeholder="Código de Vaucher" ref="vaucher">
            <!-- <div id="vaucher-help" class="form-text ">We'll never share your email with anyone else.</div> -->
          </div>
        </div>
        <div class="form-group col-auto ms-4">
          <button type="submit" class="btn btn-warning px-4">Buscar</button>
        </div>
      </form>
    </div>
  </div>
  <div class="py-3 text-center">
    <button class="btn  rounded-5 bg-white border-secondary-subtle shadow-sm mx-1 fw-light">Precio</button>
    <button class="btn  rounded-5 bg-white border-secondary-subtle shadow-sm mx-1 fw-light">Especialidad</button>
    <button class="btn  rounded-5 bg-white border-secondary-subtle shadow-sm mx-1 fw-light">Aseguradora</button>
    <button class="btn  rounded-5 bg-white border-secondary-subtle shadow-sm mx-1 fw-light">Fecha</button>
    <button class="btn  rounded-5 bg-white border-secondary-subtle shadow-sm mx-1 fw-light">Hora</button>
    <button class="btn  rounded-5 bg-white border-secondary-subtle shadow-sm mx-1 fw-light">Cancelación Gratis</button>
    <button class="btn  rounded-5 bg-white border-secondary-subtle shadow-sm mx-1 fw-light">Más Filtros</button>
  </div>
  <p class="text-center">
    <NuxtLink class="btn-link">Solicitar un Vaucher Request</NuxtLink>
  </p>
</template>