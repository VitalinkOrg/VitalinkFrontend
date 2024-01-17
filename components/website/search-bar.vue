<script setup lang="ts">
import { ref } from "vue";
const router = useRouter();


// declare a ref to hold the element reference
// the name must match template ref value
const procedimiento = ref("");
const lugar = ref("");
const vaucher = ref("");

function searchResults() {
  const routeOptions = {
    path: "/buscar",
  };
  if (procedimiento.value !== "") {
    routeOptions.query = { procedimiento: procedimiento.value };
  }
  router.push(routeOptions);
}
</script>

<template>
  <div>
    <div class="card shadow border-0 rounded-4">
      <div class="card-body">
        <form class="d-flex align-items-end" @submit.prevent="searchResults">
          <!-- <form class="d-flex align-items-end" action="/buscar/wovnworv"> -->
          <div class="row row-cols-sm-3 w-100">
            <div class="form-group">
              <label for="procedimiento" class="form-label text-uppercase">Procedimiento</label>
              <input type="text" class="form-control" v-model="procedimiento" id="procedimiento"
                placeholder="Operacion de cataratas" aria-describedby="procedimiento-help" />
              <!-- <div id="procedimiento-help" class="form-text ">We'll never share your email with anyone else.</div> -->
            </div>
            <div class="form-group">
              <label for="lugar" class="form-label">Lugar</label>
              <input type="text" class="form-control" v-model="lugar" id="lugar" aria-describedby="lugar-help"
                placeholder="Costa Rica" />
              <!-- <div id="lugar-help" class="form-text ">We'll never share your email with anyone else.</div> -->
            </div>
            <div class="form-group">
              <label for="vaucher" class="form-label">Código de Vaucher</label>
              <input type="text" class="form-control" v-model="vaucher" id="vaucher" aria-describedby="vaucher-help"
                placeholder="Código de Vaucher" />
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
      <button class="btn rounded-5 bg-white border-secondary-subtle shadow-sm mx-1 fw-light">
        Precio
      </button>
      <button class="btn rounded-5 bg-white border-secondary-subtle shadow-sm mx-1 fw-light">
        Especialidad
      </button>
      <button class="btn rounded-5 bg-white border-secondary-subtle shadow-sm mx-1 fw-light">
        Aseguradora
      </button>
      <button class="btn rounded-5 bg-white border-secondary-subtle shadow-sm mx-1 fw-light">
        Fecha
      </button>
      <button class="btn rounded-5 bg-white border-secondary-subtle shadow-sm mx-1 fw-light">
        Hora
      </button>
      <button class="btn rounded-5 bg-white border-secondary-subtle shadow-sm mx-1 fw-light">
        Cancelación Gratis
      </button>
      <button class="btn rounded-5 bg-white border-secondary-subtle shadow-sm mx-1 fw-light">
        Más Filtros
      </button>
    </div>
    <p class="text-center">
      <NuxtLink class="btn-link">Solicitar un Vaucher Request</NuxtLink>
    </p>
  </div>
</template>
