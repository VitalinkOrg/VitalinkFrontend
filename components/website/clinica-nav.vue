<script>
export default {
  props: ['data'],
  data: () => ({
    tab: 1
  })
}
</script>

<template>
  <ul class="nav nav-underline d-flex flex-row w-100">
    <li class="nav-item"><button class="nav-link" :class="tab === 1 ? 'active' : ''"
        @click="tab = 1">Disponibilidad</button></li>
    <li class="nav-item"><button class="nav-link" :class="tab === 2 ? 'active' : ''" @click="tab = 2">Servicios</button>
    </li>
    <li class="nav-item"><button class="nav-link" :class="tab === 3 ? 'active' : ''" @click="tab = 3">Ubicación</button>
    </li>
    <li class="nav-item"><button class="nav-link" :class="tab === 4 ? 'active' : ''" @click="tab = 4">Galería de
        fotos</button>
    </li>
    <li class="nav-item"><button class="nav-link" :class="tab === 5 ? 'active' : ''" @click="tab = 5">Reseñas</button>
    </li>
    <li class="nav-item"><button class="nav-link" :class="tab === 6 ? 'active' : ''" @click="tab = 6">Perfil</button></li>
  </ul>


  <section class="py-4 px-1">
    <!-- Dsiponibilidad  -->
    <div v-if="tab === 1">
      <p class="fw-semibold">Reserva una cita</p>

      <div class="bg-primary rounded-4 h-100 p-4 mb-3" style="--bs-bg-opacity: 0.04">
        
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

        <div class="d-flex justify-content-end">
          <button class="btn btn-outline-primary rounded-4 "><AtomsIconsActualizarIcon/> Actualizar Búsqueda</button>
        </div>
        <hr>

        <div class="d-flex align-items-center justify-content-between">
          <div>
            <div class="btn btn-outline-primary rounded-5">Váucher: <strong>Ninguno</strong></div>
            <button class="btn text-primary"><AtomsIconsPlusIcon/></button>
          </div>
          <div class="d-flex flex-column">
            <span class="fs-6">Precio final del servicio:</span>
            <span class="fs-5 fw-semibold">₡23000 CRC</span>
            <small class="text-muted">Precio original <span class="text-decoration-line-through">₡33000 CRC</span></small>
          </div>
        </div>

      </div>

      <div class="mb-2 d-flex align-items-center justify-content-between">
        <span class="fw-semibold">Resultados de la Disponibilidad:</span>
        <div class="d-flex align-items-center">
          <button class="btn rounded-5 btn-outline-success btn-sm me-2">Hospital Clinica Biblica <AtomsIconsTimesXIcon/></button>
          <button class="btn rounded-5 btn-outline-success btn-sm">Operación de Cataratas <AtomsIconsTimesXIcon/></button>
        </div>
      </div>

      <div class="bg-primary rounded-4 h-100 p-4" style="--bs-bg-opacity: 0.04">
        <div class="row row-cols-2">
          <div class="form-group mb-3">
          <label for="fecha" class="form-label">Seleccione una fecha</label>
          <input type="date" name="fecha" id="fecha" class="form-control">
        </div>
        <div class="form-group mb-3">
          <label for="hora" class="form-label">Seleccione la Hora</label>
          <input type="time" id="hora" name="hora" min="09:00" max="18:00" required class="form-control" />
        </div>
        </div>
      </div>

      <div class="text-end pt-4">
        <button class="btn btn-primary btn-lg" >Reservar Cita</button>
      </div>

    </div>
    <!-- Servicios  -->
    <WebsiteClinicaServiciosTab :data="data.data.servicesResult" v-if="tab === 2" />
    <!-- Ubicacion -->
    <div v-if="tab === 3">
      <div class="row">
        <div class="col-3">
          <p class="fw-semibold">Encuentranos Facilmente</p>
          <p class="d-flex">
            <span class="fs-4 text-success me-2"><AtomsIconsMapPointerIcon/></span>
            <span class="fw-light">C. 24, San José, San Bosco, Costa Rica</span>
          </p>
          <div>
            <button class="btn btn-info rounded-4 text-white me-2 py-1 px-2"><span class="fs-5"><AtomsIconsPhoneIcon/></span></button>
            <button class="btn btn-info rounded-4 text-white py-1 px-2"><span class="fs-5"><AtomsIconsMailIcon/></span></button>
          </div>
        </div>
        <div class="col">
          <AtomsMapaInteractivo/>
        </div>
      </div>
    </div>
    <!-- Galeria  -->
    <div v-if="tab === 4">
      <div class="row row-cols-3">
        <div class="col">
          <img src="@/src/assets/img-perfil-galeria-item.png" alt="" class="img-fluid">
        </div>
        <div class="col">
          <img src="@/src/assets/img-perfil-galeria-item.png" alt="" class="img-fluid">
        </div>
        <div class="col">
          <img src="@/src/assets/img-perfil-galeria-item.png" alt="" class="img-fluid">
        </div>
      </div>

      <nav aria-label="gallery pagination" class="d-flex justify-content-end pt-4">
        <ul class="pagination">
          <li class="page-item"><a class="page-link" href="#"><AtomsIconsArrowLeftIcon/></a></li>
          <li class="page-item"><a class="page-link active" href="#"><AtomsIconsArrowRightIcon/></a></li>
        </ul>
      </nav>
      
    </div>
    <!-- Reseñas  -->
    <div v-if="tab === 5">Reseñas logradas</div>
    <!-- Perfil  -->
    <div v-if="tab === 6">
      <h5>Nuestra historia</h5>
      <p>{{ data.data.doctor_information.personal.description }}</p>
    </div>
  </section>
</template>