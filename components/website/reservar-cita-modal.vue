<script setup>
const { reserva } = useReserva()

</script>
<template>
  <!-- Button trigger modal -->
  <!-- <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
    Launch demo modal
  </button> -->
  <button @click="reserva[0].open = true" class="btn btn-primary w-100 btn-sm mt-2 rounded-2">Reserva Cita</button>
  <!-- Modal -->
  <div class="modal fade " :class="reserva[0].open ? 'show' : ''" id="exampleModal" tabindex="-1"
    aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable"
      :class="reserva[0].step !== 5 ? 'modal-xl' : ''">
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
          <div class="bg-primary rounded-4 h-100 p-4" style="--bs-bg-opacity: 0.04">
            <div class="form-group mb-3">
              <label for="persona" class="form-label">¿Para quien es la cita?</label>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="persona" id="persona1">
                <label class="form-check-label" for="persona1">
                  Para mí
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="persona" id="persona2" checked>
                <label class="form-check-label" for="persona2">
                  Para otra persona
                </label>
              </div>
            </div>
            <div class="form-group mb-3">
              <label for="modelo" class="form-label">Selecciona el modelo de servicio</label>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="modelo" id="modelo1">
                <label class="form-check-label" for="modelo1">
                  Tengo seguro médico
                </label>
              </div>
              <div class="form-check">
                <input class="form-check-input" type="radio" name="modelo" id="modelo2" checked>
                <label class="form-check-label" for="modelo2">
                  Cita Privada
                </label>
              </div>
            </div>
            <div class="form-group mb-3">
              <label for="aseguradora" class="form-label">Selecciona o busca tu aseguradora</label>
              <select name="aseguradora" id="aseguradora" class="form-select">
                <option disabled selected>Selecciona una aseguradora</option>
              </select>
            </div>

            <div class="form-group mb-4">
              <label for="vaucher" class="form-label">Ingresa el váucher</label>
              <p class="form-text">Su su aseguradora le generó un váucher para este servicio, por favor agrégelo aquí.
              </p>
              <p class="form-label">Código de Váucher </p>
              <input type="text" placeholder="XNROEBPORB" class="form-control">
            </div>

            <div class="form-group d-flex mb-3">
              <div class="form-check mt-2">
                <input type="checkbox" class="form-check-input" id="no-vaucher">
                <label class="form-check-label" for="no-vaucher">No tengo Váucher</label>
              </div>
              <div class="form-group ms-5">
                <button class="btn btn-light bg-white border">Solicitar un Váucher</button>
              </div>
            </div>

          </div>

          <div class="text-center py-3">
            <p class="fs-5 mb-1"><span class="text-muted">Precio final del servicio</span> <span
                class="fw-semibold text-primary ms-2">₡23000.00</span></p>
            <p><small class="text-primary text-decoration-line-through">Antes ₡44000.00</small></p>

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
            <button type="button" class="btn btn-primary w-100 btn-lg" @click="reserva[0].step = 4">Continuar</button>
          </div>
        </div>


        <!-- Step 4 -->
        <div class="modal-body" v-if="reserva[0].step === 4">
          <p class="my-4 fw-medium ps-4">Revisa los datos antes de confirmar la cita:</p>
          <div class="border p-3 rounded-4">
            <dl>
              <dt>Fecha</dt>
              <dd>Martes 26 Septiembre de 2023 a las 09:00 am.</dd>
            </dl>
            <dl>
              <dt>Hospital o centro</dt>
              <dd>Hospital San José</dd>
            </dl>
            <dl>
              <dt>Especialidad / motivo</dt>
              <dd>Operación de cataratas</dd>
            </dl>
            <dl>
              <dt>Médico / Especialista</dt>
              <dd>Stephanie Powell</dd>
            </dl>
            <dl>
              <dt>Paciente titular</dt>
              <dd>Ana Lorens</dd>
            </dl>
            <dl>
              <dt>Modelo de servicio</dt>
              <dd>Seguro Médico: ASIS</dd>
            </dl>
            <dl>
              <dt>Precio Final del servicio</dt>
              <dd>¢23000.00</dd>
            </dl>
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
            <button type="button" class="btn btn-primary w-100 btn-lg" @click="reserva[0].step = 5">Confirmar
              Reservar</button>
          </div>
        </div>


        <!-- Step 5 -->
        <span v-if="reserva[0].step === 5">
          <div class="modal-body">
            <div class="text-center">
              <img src="@/src/assets/img-fuegos-artificiales-felicidades.svg" alt="Felicidades" style="height:3rem;">
              <div class="text-primary fs-5 fw-semibold">Felicidades!</div>
            </div>

            <div class="bg-primary rounded-4 px-4 py-2" style="--bs-bg-opacity: 0.3">
              <dl>
                <dt class="text-white ">Fecha</dt>
                <dd class="text-primary fw-semibold">Martes 26 Septiembre de 2023 a las 09:00 am.</dd>
              </dl>
              <dl>
                <dt class="text-white ">Hospital o centro</dt>
                <dd class="text-primary fw-semibold">Hospital San José</dd>
              </dl>
              <dl>
                <dt class="text-white ">Especialidad / motivo</dt>
                <dd class="text-primary fw-semibold">Operación de cataratas</dd>
              </dl>
              <dl>
                <dt class="text-white ">Médico / Especialista</dt>
                <dd class="text-primary fw-semibold">Stephanie Powell</dd>
              </dl>
              <dl>
                <dt class="text-white ">Paciente titular</dt>
                <dd class="text-primary fw-semibold">Ana Lorens</dd>
              </dl>
              <dl>
                <dt class="text-white ">Modelo de servicio</dt>
                <dd class="text-primary fw-semibold">Seguro Médico: ASIS</dd>
              </dl>
              <dl>
                <dt class="text-white ">Precio Final del servicio</dt>
                <dd class="text-primary fw-semibold">¢23000.00</dd>
              </dl>

            </div>

          </div>
          <div class="modal-footer">
            <div class="col">
              <button type="button" class="btn btn-white border w-100 btn-lg" data-bs-dismiss="modal"
                @click="reserva[0].open = null">
                Salir
              </button>
            </div>
            <div class="col">
              <button type="button" class="btn btn-primary w-100 btn-lg" @click="reserva[0].open = null">Ver En
                Citas</button>
            </div>
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