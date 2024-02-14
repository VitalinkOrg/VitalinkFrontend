<script setup>
const { onboarding } = useMedico()

</script>
<template>
  <!-- Button trigger modal -->
  <!-- <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
    Launch demo modal
  </button> -->

  <!-- Modal -->
  <div class="modal fade " :class="onboarding[0].open ? 'show' : ''" id="exampleModal" tabindex="-1"
    aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header border-bottom align-items-center d-flex">
          <h1 class="modal-title fs-4 fw-normal ms-2 mt-2" id="exampleModalLabel">Onboarding Bienvenida</h1>
          <button type="button" class="btn-close btn btn-light me-2 " data-bs-dismiss="modal" aria-label="Close"
            @click="onboarding[0].open = false"></button>
        </div>
        <!-- Step 1 -->
        <span v-if="onboarding[0].step === 1">
          <div class="modal-body">
            <div class="bg-primary rounded-5 d-flex align-items-center" style="--bs-bg-opacity: 0.05">
              <div class="col">
                <img src="@/src/assets/img-bienvenida-medicos.svg" class="img-fluid" alt="Bienvenido!">
              </div>
              <div class="col">
                <span class="display-3 text-primary">Bienvenido!</span>
                <p class="lead pe-5">Completar tu perfil te ayudará a destacar y conectar con más pacientes.</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <div class="col">
              <button type="button" class="btn btn-white border-dark w-100 btn-lg" data-bs-dismiss="modal"
                @click="onboarding[0].open = null">
                Ahora no
              </button>
            </div>
            <div class="col">
              <button type="button" class="btn btn-primary w-100 btn-lg" @click="onboarding[0].step = 2">Comenzar</button>
            </div>
          </div>
        </span>


        <!-- Step 2 -->
        <span v-if="onboarding[0].step === 2">
          <div class="modal-body">
            Step 2
          </div>
          <div class="modal-footer">
            <div class="col">
              <button type="button" class="btn btn-white border-dark w-100 btn-lg" data-bs-dismiss="modal"
                @click="onboarding[0].step = 1">
                Volver
              </button>
            </div>
            <div class="col">
              <button type="button" class="btn btn-primary w-100 btn-lg"
                @click="onboarding[0].step = 3">Siguiente</button>
            </div>
          </div>
        </span>


        <!-- Step 3 -->
        <span v-if="onboarding[0].step === 3">
          <div class="modal-body">
            Step 3
          </div>
          <div class="modal-footer">
            <div class="col">
              <button type="button" class="btn btn-white border-dark w-100 btn-lg" data-bs-dismiss="modal"
                @click="onboarding[0].step = 2">
                Volver
              </button>
            </div>
            <div class="col">
              <button type="button" class="btn btn-primary w-100 btn-lg"
                @click="onboarding[0].step = 4">Siguiente</button>
            </div>
          </div>
        </span>


        <!-- Step 4 -->
        <span v-if="onboarding[0].step === 4">
          <div class="modal-body">
            Step 4
          </div>
          <div class="modal-footer">
            <div class="col">
              <button type="button" class="btn btn-white border-dark w-100 btn-lg" data-bs-dismiss="modal"
                @click="onboarding[0].step = 3">
                Volver
              </button>
            </div>
            <div class="col">
              <button type="button" class="btn btn-primary w-100 btn-lg"
                @click="onboarding[0].step = 5">Siguiente</button>
            </div>
          </div>
        </span>


        <!-- Step 5 -->
        <span v-if="onboarding[0].step === 5">
          <div class="modal-body">
            Step 5
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary w-100 btn-lg"
              @click="onboarding[0].open = false">Siguiente</button>
          </div>
        </span>







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