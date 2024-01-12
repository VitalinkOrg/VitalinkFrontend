<!-- <script setup>
import { ref, toRaw } from 'vue'
const clinicas = ref()
const { data : response } = await useFetch('http://13.58.69.25:3000/patients/dashboard', {mode: 'no-cors'})
clinicas.value = toRaw(response?.value?.data);
</script> -->
<!-- 
<script setup>
// const { clinicas } = useSearch();
const { data: clinicas, pending } = await useLazyFetch('http://13.58.69.25:3000/patients/dashboard', {
  mode: 'no-cors',
  transform: (_clinicas) => _clinicas.data
})
console.log(clinicas, 'value');
</script> -->

<script>
import axios from 'axios';
export default {
  data() {
    return {
      clinicas: [],
      loading: true,
    }
  },
  created() {
    this.getData()
  },
  methods: {
    async getData() {
      let procedimiento = '';
      if(this.$route.query.procedimiento !== undefined) {
        procedimiento = this.$route.query.procedimiento;
      }
      try {
        await axios.get(
          'https://dummyjson.com/products/search?q=' + procedimiento)
          .then((r) => {
          console.log(r, 'value');
          this.clinicas = r.data.products;
          this.loading = false;
        })
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>

<template>
  <NuxtLayout name="web">
    <main class="bg-light">
      <section class="bg-primary mb-4" style="--bs-bg-opacity: 0.03">
        <div class="container">
          <div class="row pt-5 pb-3">
            <div class="col-sm-11 mx-auto">
              <h1 class="text-sm-center h3 mb-4 fw-medium">
                ¿Qué servicio médico estás buscando?
              </h1>
              <WebsiteSearchBar />
            </div>
          </div>
        </div>
      </section>
      <div v-if="pending">Loading clinicas...</div>
      <div v-else class="container-fluid">
        <section class="pb-5">
          <div class="row">
            <div class="col-7">
              <div
                class="d-flex align-items-center justify-content-between mb-3"
              >
                <span class="fw-medium ms-2" v-if="clinicas"
                  >{{ clinicas.length }} Medicos disponibles</span
                >
                <span class="d-flex align-items-center">
                  <span class="text-nowrap">Ordenar por:</span>
                  <select
                    name="medicos-sort"
                    id="medicos-sort"
                    class="form-select form-select-sm border-0"
                  >
                    <option value="recomendados">Recomendados</option>
                    <option value="valoraciones">Valoraciones</option>
                    <option value="disponibilidad" selected>
                      Disponibilidad inmediata
                    </option>
                    <option value="cercania">Mayor cercanía</option>
                  </select>
                </span>
              </div>
              <WebsiteClinicasListItem v-for="clinica in clinicas" :clinica="clinica" />
            </div>
            <div class="col">
              <div
                class="card bg-dark-subtle d-flex align-items-center justify-content-center"
                style="min-height: 30rem"
              >
                MAPA INTERACTIVO
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </NuxtLayout>
</template>