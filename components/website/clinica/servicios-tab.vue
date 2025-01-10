<script>
export default {
  props: ["services"],
};
</script>
<template>
  <div v-if="services.length" class="row gx-3">
    <!--   <div class="col" v-for="service in services" :key="service.id"> -->
    <!--     <div class="card border shadow-sm rounded-4"> -->
    <!--       <div class="card-body px-2"> -->
    <!--         <p -->
    <!--           v-if="service.doctor_service_id" -->
    <!--           class="card-text fs-6 text-primary fw-medium text-center mb-2" -->
    <!--         > -->
    <!--           {{ service.doctor_service_id || service.hospital_service_id }} - -->
    <!--           {{ service.service }} -->
    <!--         </p> -->
    <!--         <p -->
    <!--           v-else -->
    <!--           class="card-text fs-6 text-primary fw-medium text-center mb-2" -->
    <!--         > -->
    <!--           {{ service.name }} -->
    <!--         </p> -->
    <!--         <p v-if="service.cpt" class="lh-sm fw-light text-muted mb-2"> -->
    <!--           <small>{{ service.cpt }}</small> -->
    <!--         </p> -->
    <!--         <p v-else class="lh-sm fw-light text-muted mb-2 text-center"> -->
    <!--           {{ service.description }} -->
    <!--         </p> -->
    <!-- <ul class="text-muted list-unstyled border-top border-bottom py-1 mb-0">
            <li v-for="amenidad in service.amenidades" class="text-muted fw-light"><small>[I] {{ amenidad.nombre
            }}</small>
            </li>
          </ul> -->
    <!--       <p -->
    <!--         v-if="service.hospital_name" -->
    <!--         class="card-text text-center text-success fs-6 fw-semibold border-bottom py-2" -->
    <!--       > -->
    <!--         <small>{{ service.hospital_name }}</small> -->
    <!--       </p> -->
    <!--       <div class="text-center border-bottom pb-2" v-if="service.schedule"> -->
    <!--         <small -->
    <!--           v-for="horario in service.schedule" -->
    <!--           :key="horario.length" -->
    <!--           class="me-2 text-nowrap" -->
    <!--           ><strong class="fw-semibold me-1">{{ horario.day }}</strong> -->
    <!--           <span class="fw-light" -->
    <!--             >{{ horario.open }} - {{ horario.close }}</span -->
    <!--           ></small -->
    <!--         > -->
    <!--       </div> -->
    <!--       <div -->
    <!--         v-if="service.price" -->
    <!--         class="d-flex flex-column align-items-center pt-2" -->
    <!--       > -->
    <!--         <small class="text-muted fw-light">Precio a partir de:</small> -->
    <!--         <span class="fw-semibold fs-5 text-primary" -->
    <!--           >{{ parseFloat(service.price).toLocaleString() }} -->
    <!--           {{ service.currency }}</span -->
    <!--         > -->
    <!--       </div> -->
    <!--       <WebsiteReservarCitaModal :service="service" /> -->
    <!--     </div> -->
    <!--   </div> -->
    <!-- </div> -->
    <div class="col-12">
      <div class="row mb-5">
        <div class="col-12"><p>Seleccionar fecha</p></div>
        <div class="col-12">
          <div class="row">
            <div class="col-12">
              <div class="day-container">
                <div class="day day-active">5</div>
                <div class="day">6</div>
                <div class="day">7</div>
                <div class="day">8</div>
                <div class="day">9</div>
                <div class="day">10</div>
                <div class="day">11</div>
                <div class="day">12</div>
                <div class="day">13</div>
                <div class="day">14</div>
                <div class="day">15</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-12"><p>Seleccionar fecha</p></div>
        <div class="col-12">
          <div class="row">
            <div class="col-12">
              <div class="day-container">
                <div class="hour"><span> 11:00 AM </span></div>
                <div class="hour"><span>12:00 AM</span></div>
                <div class="hour"><span> 01:00 AM </span></div>
                <div class="hour"><span> 02:00 AM </span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-12 d-flex justify-content-end">
          <button class="btn btn-primary">Reservar cita</button>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <p>No hay servicios disponibles.</p>
  </div>
</template>

<style scoped>
.day-container {
  display: flex;
  /* margin-top: 20px; */
}

.day {
  width: 41px;
  height: 40px;
  text-align: center;
  line-height: 40px;
  background-color: #f0f0f0;
  border-radius: 5px;
  margin: 10px;
}

.day-active {
  background-color: #007bff;
  color: white;
}

.hour {
  width: auto;
  height: 40px;
  text-align: center;
  line-height: 40px;
  background-color: #f0f0f0;
  border-radius: 5px;
  margin: 10px;
}

.hour > span {
  padding: 16px;
}
</style>
