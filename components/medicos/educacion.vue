<script setup>
const { updateEducacion } = useMedico()
</script>
<template>
  <!-- Button trigger modal -->
  <!-- <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
    Launch demo modal
  </button> -->

  <!-- Modal -->
  <div class="modal fade " :class="updateEducacion[0].open ? 'show' : ''" id="exampleModal" tabindex="-1"
    aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header border-bottom align-items-center d-flex">
          <h1 class="modal-title fs-4 fw-normal ms-2 mt-2" id="exampleModalLabel">Añade tu educación y estudios</h1>
          <button type="button" class="btn-close btn btn-light me-2 " data-bs-dismiss="modal" aria-label="Close"
            @click="updateEducacion[0].open = false"></button>
        </div>
        <div class="modal-body">
         <div class="bg-primary rounded-4 h-100 p-4" style="--bs-bg-opacity: 0.04">
            <div class="form-group mb-3">
               <label for="titulacion" class="form-label">Titulación</label>
               <input type="text" placeholder="Escribe el nombre de tu título" class="form-control shadow-sm " id="titulacion"
                  name="titulacion">
            </div>
            <div class="form-group mb-3">
               <label for="universidad" class="form-label">Universidad o Centro de estudios</label>
               <input type="text" placeholder="Escribe el nombre de la Universidad" class="form-control shadow-sm " id="universidad"
                  name="universidad">
            </div>
            <div class="row row-cols-sm-2 mb-3">
              <div class="form-group">
                  <label for="ciudad" class="form-label">Ciudad*</label>
                  <input type="text" placeholder="Ciudad" class="form-control shadow-sm " required id="ciudad"
                  name="ciudad">
               </div>
               <div class="form-group">
                  <label for="pais" class="form-label">País*</label>
                  <input type="text" placeholder="País" class="form-control shadow-sm " required id="pais"
                  name="pais">
               </div>
            </div>
            <div class="form-group d-flex align-items-center mb-3">
              <label for="cursando" class="form-label me-3">¿Cursando actualmente?</label>
              <div class="form-check me-3">
                <input class="form-check-input" type="radio" name="cursando" id="cursandosi">
                <label class="form-check-label" for="cursandosi">
                  Sí
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="cursando" id="cursandono" checked>
                <label class="form-check-label" for="cursandono">
                  No
                </label>
              </div>
            </div>

            <label for="">Fecha de inicio</label>
            <div class="row row-cols-sm-2 mb-3">
              <div class="form-group">
                  <label for="iniciomes" class="form-label">Desde</label>
                  <select name="iniciomes" id="iniciomes" class="form-select"></select>
               </div>
               <div class="form-group">
                  <label for="inicioyear" class="form-label">Año</label>
                  <select name="inicioyear" id="inicioyear" class="form-select"></select>
               </div>
            </div>

            <label for="">Fecha de Finalización</label>
            <div class="row row-cols-sm-2 mb-3">
              <div class="form-group">
                  <label for="finalmes" class="form-label">Desde</label>
                  <select name="finalmes" id="finalmes" class="form-select"></select>
               </div>
               <div class="form-group">
                  <label for="finalyear" class="form-label">Año</label>
                  <select name="finalyear" id="finalyear" class="form-select"></select>
               </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <div class="col">
            <button type="button" class="btn btn-white border w-100 btn-lg" data-bs-dismiss="modal"
              @click="updateEducacion[0].open = false">
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