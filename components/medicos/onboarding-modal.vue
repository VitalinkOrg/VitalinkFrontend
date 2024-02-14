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
            <div class="bg-primary rounded-4 d-flex align-items-center" style="--bs-bg-opacity: 0.05">
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
              <button type="button" class="btn btn-white border w-100 btn-lg" data-bs-dismiss="modal"
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
            <div class="container">
              <div class="row">
                <div class="col-3">
                  <div class="bg-primary rounded-4 p-4 h-100" style="--bs-bg-opacity: 0.07">
                    <span class="text-success fw-bold pt-4 d-block">1 a 2 pasos</span>
                    <span class="text-primary fw-bold fs-4 py-4 d-block">Completa tus Datos Personales</span>
                    <p class=" text-muted fw-medium">Empieza completando por tus datos personales o de empresa
                      imprescindibles para
                      la
                      plataforma</p>
                  </div>
                </div>
                <div class="col">
                  <div class="bg-primary rounded-4 h-100 p-4" style="--bs-bg-opacity: 0.04">
                    <div class="form-group mb-3">
                      <label for="nombre" class="form-label">Nombre (s)</label>
                      <input type="text" placeholder="Escribe tu nombre" class="form-control shadow-sm " id="nombre"
                        name="nombre">
                    </div>
                    <div class="form-group mb-3">
                      <label for="apellidos" class="form-label">Apellidos (s)</label>
                      <input type="text" placeholder="Escribe tu apellido" class="form-control shadow-sm " id="apellidos"
                        name="apellidos">
                    </div>
                    <div class="form-group mb-3">
                      <label for="telefono" class="form-label">Número de teléfono</label>
                      <input type="phone" placeholder="+1(555) 000-0000" class="form-control shadow-sm " id="telefono"
                        name="telefono">
                    </div>
                    <div class="form-group mb-3">
                      <label for="direccion" class="form-label">Dirección</label>
                      <input type="text" placeholder="Dirección" class="form-control shadow-sm " id="direccion"
                        name="direccion">
                    </div>
                    <div class="row row-cols-sm-3 mb-5">
                      <div class="form-group">
                        <label for="postal" class="form-label">Código Postal</label>
                        <input type="text" placeholder="0000000" class="form-control shadow-sm " id="postal"
                          name="postal">
                      </div>
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
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <div class="col">
              <button type="button" class="btn btn-white border w-100 btn-lg" data-bs-dismiss="modal"
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
            <div class="container">
              <div class="row">
                <div class="col-3">
                  <div class="bg-primary rounded-4 p-4 h-100" style="--bs-bg-opacity: 0.07">
                    <span class="text-success fw-bold pt-4 d-block">2 a 2 pasos</span>
                    <span class="text-primary fw-bold fs-4 py-4 d-block">Información Profesional</span>
                    <p class=" text-muted fw-medium">Esto ayudará a los pacientes a conocerte mejor.</p>
                  </div>
                </div>
                <div class="col">
                  <div class="bg-primary rounded-4 h-100 p-4" style="--bs-bg-opacity: 0.04">
                    <div class="form-group mb-3">
                      <label for="nombre" class="form-label">Foto de Perfil</label>
                      <div class="mb-3 text-muted fw-light">Esta será la foto que vean tu pacientes cuando encuentren tu
                        perfil en
                        Vitalink
                      </div>
                      <!-- <input type="text" placeholder="Escribe tu nombre" class="form-control shadow-sm " id="nombre"
                        name="nombre"> -->
                      <!-- <form action="/action_page.php"> -->
                      <input type="file" id="myFile" name="filename" class="form-control">
                      <!-- <input type="submit"> -->
                      <!-- </form> -->
                    </div>
                    <hr>
                    <div class="form-group mb-3">
                      <label for="descripcion" class="form-label">Escribe una breve descripción profesional</label>
                      <textarea placeholder="Escribe una descripción sobre ti y tu experiencia profesional"
                        class="form-control shadow-sm " id="descripcion" name="descripcion" rows="4" />
                    </div>
                    <div class="form-group mb-3">
                      <label for="numero-matricula" class="form-label">Nº Matrícula Medica </label>
                      <input type="text" placeholder="Escribe el número de tu matrícula" class="form-control shadow-sm "
                        id="numero-matricula" name="numero-matricula">
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <div class="col">
              <button type="button" class="btn btn-white border w-100 btn-lg" data-bs-dismiss="modal"
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
              <button type="button" class="btn btn-white border w-100 btn-lg" data-bs-dismiss="modal"
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