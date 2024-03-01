<script setup>
const { reserva } = useReserva()

</script>
<template>
  <!-- Button trigger modal -->
  <!-- <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
    Launch demo modal
  </button> -->

  <!-- Modal -->
  <div class="modal fade " :class="reserva[0].open ? 'show' : ''" id="exampleModal" tabindex="-1"
    aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header border-bottom align-items-center d-flex">
          <h1 class="modal-title fs-4 fw-normal ms-2 mt-2" id="exampleModalLabel">Reservar una Cita</h1>
          <button type="button" class="btn-close btn btn-light me-2 " data-bs-dismiss="modal" aria-label="Close"
            @click="reserva[0].open = false"></button>
        </div>
        <div v-if="reserva[0].step < 5" class=" d-flex align-items-center justify-content-center stepper">
          <div class="stepper-item" :class="reserva[0].step >= 1 ? 'text-success' : ''">
            <span class="stepper-item-icon">
              <Icon name="ic:outline-radio-button-unchecked" class="text-dark" v-if="reserva[0].step < 1" />

              <Icon name="material-symbols:radio-button-checked-outline" v-if="reserva[0].step === 1" />
              <Icon name="material-symbols:check-circle" v-if="reserva[0].step > 1" />
            </span>
            1
          </div>
          <div class="stepper-item" :class="reserva[0].step >= 2 ? 'text-success' : ''">
            <span class="fs-3">
              <Icon name="ic:outline-radio-button-unchecked" class="text-secondary" v-if="reserva[0].step < 2" />

              <Icon name="material-symbols:radio-button-checked-outline" v-if="reserva[0].step === 2" />
              <Icon name="material-symbols:check-circle" v-if="reserva[0].step > 2" />
            </span>
            2
          </div>
          <div class="stepper-item" :class="reserva[0].step >= 3 ? 'text-success' : ''">
            <span class="fs-3">
              <Icon name="ic:outline-radio-button-unchecked" class="text-secondary" v-if="reserva[0].step < 3" />
              <Icon name="material-symbols:radio-button-checked-outline" v-if="reserva[0].step === 3" />
              <Icon name="material-symbols:check-circle" v-if="reserva[0].step > 3" />
            </span>
            3
          </div>
          <div class="stepper-item" :class="reserva[0].step >= 4 ? 'text-success' : ''">
            <span class="fs-3">
              <Icon name="ic:outline-radio-button-unchecked" class="text-secondary" v-if="reserva[0].step < 4" />

              <Icon name="material-symbols:radio-button-checked-outline" v-if="reserva[0].step === 4" />
              <Icon name="material-symbols:check-circle" v-if="reserva[0].step > 4" />
            </span>
            4
          </div>
        </div>
        <!-- Step 1 -->
        <div class="modal-body" v-if="reserva[0].step === 1">
          <div class="bg-primary rounded-4 h-100 p-4" style="--bs-bg-opacity: 0.04">
            <div class="row row-cols-sm-2 mb-3">
              <div class="form-group">
                <label for="especialidad" class="form-label">Especialidad</label>
                <select name="especialidad" id="especialidad" class="form-select">
                  <option disabled selected>Oftalmología</option>
                </select>
              </div>
              <div class="form-group">
                <label for="procedimiento" class="form-label">Procedimiento</label>
                <select name="procedimiento" id="procedimiento" class="form-select">
                  <option disabled selected>Cirugía de Cataratas</option>
                </select>
              </div>
              <div class="form-group">
                <label for="lugar" class="form-label">Lugar</label>
                <select name="lugar" id="lugar" class="form-select">
                  <option disabled selected>Hospital Clínica Bíblica</option>
                </select>
              </div>
              <div class="form-group">
                <label for="tipodecita" class="form-label">Tipo de cita</label>
                <select name="tipodecita" id="tipodecita" class="form-select">
                  <option disabled selected>Cirugía</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer" v-if="reserva[0].step === 1">
          <div class="col">
            <button type="button" class="btn btn-white border w-100 btn-lg" data-bs-dismiss="modal"
              @click="reserva[0].open = null">
              Cancelar
            </button>
          </div>
          <div class="col">
            <button type="button" class="btn btn-primary w-100 btn-lg" @click="reserva[0].step = 2">Continuar</button>
          </div>
        </div>


        <!-- Step 2 -->
        <div class="modal-body" v-if="reserva[0].step === 2">
          <div class="container">

            <div class="bg-primary rounded-4 h-100 p-4" style="--bs-bg-opacity: 0.04">
              <div class="form-group mb-3">
                <label for="fecha" class="form-label">Fecha</label>
                <input type="date" name="fecha" id="fecha" class="form-control">
              </div>
              <div class="form-group mb-3">
                <label for="hora" class="form-label">Hora</label>
                <input type="time" id="hora" name="hora" min="09:00" max="18:00" required class="form-control" />
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer" v-if="reserva[0].step === 2">
          <div class="col">
            <button type="button" class="btn btn-white border w-100 btn-lg" data-bs-dismiss="modal"
              @click="reserva[0].step = 1">
              Volver
            </button>
          </div>
          <div class="col">
            <button type="button" class="btn btn-primary w-100 btn-lg" @click="reserva[0].step = 3">Continuar</button>
          </div>
        </div>


        <!-- Step 3 -->
        <div class="modal-body" v-if="reserva[0].step === 3">
          <div class="container">
            <div class="row">
              <div class="col-3">
                <div class="bg-primary rounded-4 p-4 h-100" style="--bs-bg-opacity: 0.07">
                  <span class="text-success fw-bold pt-4 d-block">2 a 3 pasos</span>
                  <span class="text-primary fw-bold fs-4 py-4 d-block">Información Profesional</span>
                  <p class=" text-muted fw-medium">Esto ayudará a los pacientes a conocerte mejor.</p>
                </div>
              </div>
              <div class="col">
                <div class="bg-primary rounded-4 h-100 p-4" style="--bs-bg-opacity: 0.04">
                  <div class="form-group mb-3">
                    <label for="nombre" class="form-label">Foto de Perfil</label>
                    <div class="mb-3 text-muted fw-light">Esta será la foto que vean tu pacientes cuando
                      encuentren tu
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
        <div class="modal-footer" v-if="reserva[0].step === 3">
          <div class="col">
            <button type="button" class="btn btn-white border w-100 btn-lg" data-bs-dismiss="modal"
              @click="reserva[0].step = 2">
              Volver
            </button>
          </div>
          <div class="col">
            <button type="button" class="btn btn-primary w-100 btn-lg" @click="reserva[0].step = 4">Siguiente</button>
          </div>
        </div>


        <!-- Step 4 -->
        <div class="modal-body" v-if="reserva[0].step === 4">
          <div class="container">
            <div class="row">
              <div class="col-3">
                <div class="bg-primary rounded-4 p-4 h-100" style="--bs-bg-opacity: 0.07">
                  <span class="text-success fw-bold pt-4 d-block">3 a 3 pasos</span>
                  <span class="text-primary fw-bold fs-4 py-4 d-block">Información Profesional</span>
                  <p class=" text-muted fw-medium">Esto ayudará a los pacientes a conocerte mejor.</p>
                </div>
              </div>
              <div class="col">
                <div class="bg-primary rounded-4 h-100 p-4" style="--bs-bg-opacity: 0.04">
                  <!-- Hospitales CLinicas  -->
                  <p class="m-0">Selecciona Hospitales o Clínicas</p>
                  <p class="text-muted fw-light">Selecciona los lugares donde tendrá disponibilidad para atender a
                    sus
                    pacientes </p>
                  <button
                    class="btn btn-light border w-100 fw-light text-start d-flex bg-white justify-content-between align-items-center mb-3">
                    <span>Hospital SIMA (Calle Nº....)</span>
                    <span class="fw-semibold">
                      <AtomsIconsTimesXIcon />
                    </span>
                  </button>

                  <!-- Agregar nuevo hospital o clinica -->
                  <div class="bg-primary rounded-4 p-3 mb-3" style="--bs-bg-opacity: 0.1">
                    <div class="form-group mb-4">
                      <label for="nombre" class="form-label text-capitalize">Nombre del Hospital/Clinica</label>
                      <input type="text" class="form-control" placeholder="Escribe el nombre del hospital" name="nombre"
                        required />
                      <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                    </div>
                    <div class="row row-cols-2">
                      <div class="form-group mb-4">
                        <label for="telefono" class="form-label text-capitalize">Número de teléfono</label>
                        <input type="phone" class="form-control" placeholder="0000-0000" name="telefono" required />
                        <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                      </div>
                      <div class="form-group mb-4">
                        <label for="direccion" class="form-label text-capitalize">Dirección</label>
                        <input type="text" class="form-control" placeholder="Escribe la dirección" name="direccion"
                          required />
                        <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                      </div>
                    </div>
                    <hr>
                    <div class="form-group mb-4">
                      <label for="email" class="form-label text-capitalize">Correo Electrónico</label>
                      <input type="email" class="form-control" placeholder="Escribe tu correo electrónico" name="email"
                        required />
                      <!-- <div id="nombreHelp" class="form-text">We'll never share your email with anyone else.</div> -->
                    </div>
                    <div class="row row-cols-2">
                      <div class="form-group mb-4">
                        <label for="password" class="form-label text-capitalize">Contraseña</label>
                        <input type="password" class="form-control" id="password" placeholder="Escribe tu contraseña"
                          aria-describedby="passwordHelp" required name="password" />
                        <!-- <div id="passwordHelp" class="form-text">Deben ser 8 caracteres como mínimo</div> -->
                      </div>
                      <div class="form-group mb-4">
                        <label for="confirmPassword" class="form-label text-capitalize">Confirmar
                          Contraseña</label>
                        <input type="password" class="form-control" id="confirmPassword"
                          placeholder="Escribe tu contraseña" aria-describedby="confirmPasswordHelp" required
                          name="confirmPassword" />
                        <!-- <div id="passwordHelp" class="form-text">Deben ser 8 caracteres como mínimo</div> -->
                      </div>
                    </div>
                    <div class="row row-cols-2 mt-4">
                      <div class="col">
                        <button class="btn btn-light border-dark w-100">
                          Volver, no guardar
                        </button>
                      </div>
                      <div class="col">
                        <button class="btn btn-primary w-100">
                          Guardar y Continuar
                        </button>
                      </div>
                    </div>

                  </div>

                  <button class="btn btn-info  text-white ">
                    <AtomsIconsPlusIcon /> Agregar Hospital o Clínica
                  </button>

                  <hr>
                  <!-- Especialidades Medicas  -->
                  <!-- Hospitales CLinicas  -->
                  <p class="m-0">Especialidades Médicas</p>
                  <p class="text-muted fw-light">Escribe las Especialidades médicas que ofrecerás en la
                    plataforma.</p>
                  <button
                    class="btn btn-light border w-100 fw-light text-start d-flex bg-white justify-content-between align-items-center mb-3">
                    <span>Oftalmología</span>
                    <span class="fw-semibold">
                      <AtomsIconsTimesXIcon />
                    </span>
                  </button>
                  <div class="bg-primary rounded-4 p-3 mb-3" style="--bs-bg-opacity: 0.1">
                    <input type="text" placeholder="Escriba la especialidad" class="form-control">
                    <div class="text-end mt-2">
                      <button class="btn btn-link text-dark">Cancelar</button>
                      <button class="btn btn-light fw-light border-dark">Guardar</button>
                    </div>
                  </div>

                  <button class="btn btn-info  text-white ">
                    <AtomsIconsPlusIcon /> Agregar
                  </button>

                  <hr>

                  <!-- Servicios Procedimientos  -->
                  <p class="m-0">Servicios / Procedimientos</p>
                  <p class="text-muted fw-light">Agrega los servicios médicos que ofrecerás en la plataforma.</p>
                  <button
                    class="btn btn-light border w-100 fw-light text-start d-flex bg-white justify-content-between align-items-center mb-3">
                    <span>Cirugía de catarata monofocal</span>
                    <span class="fw-semibold">
                      <AtomsIconsTimesXIcon />
                    </span>
                  </button>
                  <div class="bg-primary rounded-4 p-3 mb-3" style="--bs-bg-opacity: 0.1">
                    <input type="text" placeholder="Escriba la especialidad" class="form-control">
                    <div class="text-end mt-2">
                      <button class="btn btn-link text-dark">Cancelar</button>
                      <button class="btn btn-light fw-light border-dark">Guardar</button>
                    </div>
                  </div>

                  <button class="btn btn-info  text-white ">
                    <AtomsIconsPlusIcon /> Agregar
                  </button>

                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer" v-if="reserva[0].step === 4">
          <div class="col">
            <button type="button" class="btn btn-white border w-100 btn-lg" data-bs-dismiss="modal"
              @click="reserva[0].step = 3">
              Volver
            </button>
          </div>
          <div class="col">
            <button type="button" class="btn btn-primary w-100 btn-lg" @click="reserva[0].step = 5">Siguiente</button>
          </div>
        </div>


        <!-- Step 5 -->
        <span v-if="reserva[0].step === 5">
          <div class="modal-body">
            <div class="bg-primary rounded-4 d-flex align-items-center justify-content-center text-center py-5"
              style="--bs-bg-opacity: 0.05">
              <div class="my-5 text-center">
                <img src="@/src/assets/img-fuegos-artificiales-felicidades.svg" alt="Felicidades">
                <div class="display-3 text-primary">Felicidades!</div>
                <p class="w-50 mx-auto fw-normal text-muted fs-5">Has completado una buena parte de tu perfil, esto
                  te
                  ayudará
                  a destacar
                  y
                  conectar
                  con más pacientes.</p>
              </div>

              <!-- <div class="col">
                <img src="@/src/assets/img-bienvenida-medicos.svg" class="img-fluid" alt="Bienvenido!">
              </div>
              <div class="col">
                <span class="display-3 text-primary">Bienvenido!</span>
                <p class="lead pe-5">Completar tu perfil te ayudará a destacar y conectar con más pacientes.</p>
              </div> -->
            </div>

          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary w-100 btn-lg" @click="reserva[0].open = false">Siguiente</button>
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

.stepper {
  &-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 2rem;

    &-icon {
      font-size: 2rem;
    }
  }
}
</style>