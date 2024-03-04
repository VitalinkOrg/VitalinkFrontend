<script setup>
const { updateIdioma } = useMedico()
</script>
<template>
  <!-- Button trigger modal -->
  <!-- <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
    Launch demo modal
  </button> -->

  <!-- Modal -->
  <div class="modal fade " :class="updateIdioma[0].open ? 'show' : ''" id="exampleModal" tabindex="-1"
    aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header border-bottom align-items-center d-flex">
          <h1 class="modal-title fs-4 fw-normal ms-2 mt-2" id="exampleModalLabel">Añade un idioma</h1>
          <button type="button" class="btn-close btn btn-light me-2 " data-bs-dismiss="modal" aria-label="Close"
            @click="updateIdioma[0].open = false"></button>
        </div>
        <div class="modal-body">
         <div class="bg-primary rounded-4 h-100 p-4" style="--bs-bg-opacity: 0.04">
            <div class="form-group mb-3">
               <label for="idioma" class="form-label">Idioma</label>
               <select name="idioma" id="idioma" class="form-select">
                  <option disabled selected>Seleccione un idioma</option>
               </select>
            </div>
            <div class="form-group mb-3">
               <label for="nivel" class="form-label">Nivel de Habilidad</label>
               <select name="nivel" id="nivel" class="form-select">
                  <option disabled selected>Conversacional</option>
               </select>
            </div>

            
          </div>
        </div>
        <div class="modal-footer">
          <div class="col">
            <button type="button" class="btn btn-white border w-100 btn-lg" data-bs-dismiss="modal"
              @click="updateIdioma[0].open = false">
              Cancelar
            </button>
          </div>
          <div class="col">
            <button type="button" class="btn btn-primary w-100 btn-lg">Agregar</button>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
<style lang="scss" scoped>
.show {
  display: block;
  background-color: rgba(0, 0, 0, .1);
}
</style>