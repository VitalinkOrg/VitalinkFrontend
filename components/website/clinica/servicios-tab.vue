<script>
export default {
  props: ["services"],
  data() {
    return {
      servicesTest: [
        {
          id: 1,
          doctor_service_id: "DS001",
          hospital_service_id: "HS001",
          service: "Consulta General",
          name: "Consulta General",
          cpt: "99213",
          description: "Consulta médica general",
          hospital_name: "Hospital Central",
          schedule: [
            { day: "Lunes", open: "08:00", close: "17:00" },
            { day: "Martes", open: "08:00", close: "17:00" },
          ],
          price: "500",
          currency: "MXN",
        },
        {
          id: 2,
          doctor_service_id: null,
          hospital_service_id: "HS002",
          service: "Radiografía",
          name: "Radiografía",
          cpt: "72050",
          description: "Radiografía de tórax",
          hospital_name: "Clínica Norte",
          schedule: [
            { day: "Miércoles", open: "09:00", close: "18:00" },
            { day: "Jueves", open: "09:00", close: "18:00" },
          ],
          price: "800",
          currency: "MXN",
        },
        {
          id: 3,
          doctor_service_id: "DS003",
          hospital_service_id: null,
          service: "Ultrasonido",
          name: "Ultrasonido",
          cpt: "76700",
          description: "Ultrasonido abdominal",
          hospital_name: "Hospital del Sur",
          schedule: [
            { day: "Viernes", open: "10:00", close: "15:00" },
            { day: "Sábado", open: "10:00", close: "14:00" },
          ],
          price: "1200",
          currency: "MXN",
        },
      ],
      serviceSegmentOption: "info",
    };
  },
};
</script>
<template>
  <!-- <div v-if="servicesTest.length" class="row row-cols-md-3 gx-3"> -->
  <!-- <div class="col" v-for="service in servicesTest" :key="service.id"> -->
  <!--   <div class="card border shadow-sm rounded-4"> -->
  <!--     <div class="card-body px-2"> -->
  <!--       <p -->
  <!--         v-if="service.doctor_service_id" -->
  <!--         class="card-text fs-6 text-primary fw-medium text-center mb-2" -->
  <!--       > -->
  <!--         {{ service.doctor_service_id || service.hospital_service_id }} - -->
  <!--         {{ service.service }} -->
  <!--       </p> -->
  <!--       <p -->
  <!--         v-else -->
  <!--         class="card-text fs-6 text-primary fw-medium text-center mb-2" -->
  <!--       > -->
  <!--         {{ service.name }} -->
  <!--       </p> -->
  <!--       <p v-if="service.cpt" class="lh-sm fw-light text-muted mb-2"> -->
  <!--         <small>{{ service.cpt }}</small> -->
  <!--       </p> -->
  <!--       <p v-else class="lh-sm fw-light text-muted mb-2 text-center"> -->
  <!--         {{ service.description }} -->
  <!--       </p> -->
  <!-- <ul class="text-muted list-unstyled border-top border-bottom py-1 mb-0">
            <li v-for="amenidad in service.amenidades" class="text-muted fw-light"><small>[I] {{ amenidad.nombre
            }}</small>
            </li>
          </ul> -->
  <!--         <p -->
  <!--           v-if="service.hospital_name" -->
  <!--           class="card-text text-center text-success fs-6 fw-semibold border-bottom py-2" -->
  <!--         > -->
  <!--           <small>{{ service.hospital_name }}</small> -->
  <!--         </p> -->
  <!--         <div class="text-center border-bottom pb-2" v-if="service.schedule"> -->
  <!--           <small -->
  <!--             v-for="horario in service.schedule" -->
  <!--             :key="horario.length" -->
  <!--             class="me-2 text-nowrap" -->
  <!--             ><strong class="fw-semibold me-1">{{ horario.day }}</strong> -->
  <!--             <span class="fw-light" -->
  <!--               >{{ horario.open }} - {{ horario.close }}</span -->
  <!--             ></small -->
  <!--           > -->
  <!--         </div> -->
  <!--         <div -->
  <!--           v-if="service.price" -->
  <!--           class="d-flex flex-column align-items-center pt-2" -->
  <!--         > -->
  <!--           <small class="text-muted fw-light">Precio a partir de:</small> -->
  <!--           <span class="fw-semibold fs-5 text-primary" -->
  <!--             >{{ parseFloat(service.price).toLocaleString() }} -->
  <!--             {{ service.currency }}</span -->
  <!--           > -->
  <!--         </div> -->
  <!--         <WebsiteReservarCitaModal :service="service" /> -->
  <!--       </div> -->
  <!--     </div> -->
  <!--   </div> -->
  <!-- </div> -->
  <!-- <div v-else> -->
  <!--   <p>No hay servicios disponibles.</p> -->
  <!-- </div> -->
  <div class="accordion" id="accordionExample">
    <div class="accordion" id="accordionExample">
      <div class="accordion-item">
        <div class="d-flex justify-content-between align-items-center p-3">
          <div class="accordion-header gap-2 mb-0" id="headingOne">
            <span class="fw-bold">Cirugía de cataratas</span>
            <small class="text-muted d-block mb-0">Oftalmología</small>
          </div>
          <div>
            <button class="btn text-muted btn-sm me-2">
              <span class="me-1">
                <img src="@/src/assets/edit.svg" alt="Ver Cita" />
              </span>
              Editar
            </button>
            <button class="btn text-muted btn-sm me-2">
              <span class="me-1">
                <img src="@/src/assets/remove.svg" alt="Cancelar Cita" />
              </span>

              Eliminar
            </button>
            <button
              class="btn btn-outline-secondary btn-sm fw-bold text-dark p-2 dropdown-toggle"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#collapseOne"
              aria-expanded="false"
              aria-controls="collapseOne"
            >
              Ver detalles
            </button>
          </div>
        </div>
      </div>
      <div
        id="collapseOne"
        class="accordion-collapse collapse show"
        aria-labelledby="headingOne"
        data-bs-parent="#accordionExample"
      >
        <div class="accordion-body bg-info-subtle">
          <!-- buttons actions -->

          <ul class="nav nav-tabs">
            <li
              class="nav-item border-bottom"
              :class="{
                'border-info': serviceSegmentOption === 'info',
              }"
              @click="serviceSegmentOption = 'info'"
            >
              <a
                :class="{
                  'text-info': serviceSegmentOption === 'info',
                  'text-muted': serviceSegmentOption !== 'info',
                }"
                class="nav-link"
                href="#"
                >Información general</a
              >
            </li>
            <li
              class="nav-item border-bottom"
              @click="serviceSegmentOption = 'packs'"
              :class="{
                'border-info': serviceSegmentOption === 'packs',
              }"
            >
              <a
                class="nav-link"
                :class="{
                  'text-info': serviceSegmentOption === 'packs',
                  'text-muted': serviceSegmentOption !== 'packs',
                }"
                href="#"
                >Precios y packs</a
              >
            </li>
          </ul>

          <!-- info -->
          <section v-if="serviceSegmentOption == 'info'" class="p-2">
            <div class="list-group list-group-flush">
              <!-- speciality -->
              <div class="d-flex flex-column m-2">
                <label>Especialidades Medicas:</label>
                <input
                  type="text"
                  value="Oftalmologia"
                  disabled
                  class="form-control bg-white"
                />
              </div>

              <!-- speciality -->
              <div class="d-flex flex-column m-2">
                <label>Descripción</label>
                <textarea
                  type="text"
                  rows="5"
                  disabled
                  class="form-control bg-white text-dark"
                >
El procedimiento de cirugía de cataratas implica realizar una microincisión en el ojo para acceder al cristalino opacificado. Utilizando tecnología láser o instrumentos especializados, el cirujano fragmenta y extrae la lente afectada, para luego implantar una lente intraocular que restaura la claridad visual. Este proceso, llevado a cabo con precisión milimétrica, permite una recuperación rápida y una mejora significativa en la visión del paciente, contribuyendo a su calidad de vida.</textarea
                >
              </div>

              <div class="m-2" aria-current="true">
                <div class="d-flex w-100 justify-content-between">
                  <p class="mb-1">Hospital de atención</p>
                </div>
                <p class="mb-1 text-muted">
                  Indica el/los lugares donde tendrá disponibilidad este
                  servicio
                </p>
              </div>

              <div class="card m-2 rounded-4">
                <div class="card-body p-0">
                  <div class="list-group list-group-flush">
                    <div
                      class="list-group-item list-group-item-action"
                      aria-current="true"
                    >
                      <div class="d-flex w-100 justify-content-between">
                        <h5 class="mb-1">Hospital CIMA</h5>
                      </div>
                      <p class="mb-1">
                        Autop. Próspero Fernández, San José, San Rafael, Costa
                        Rica
                      </p>
                      <small>Piso 1 - Pasillo 3</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- packs -->
          <section v-if="serviceSegmentOption == 'packs'" class="p-2">
            <p>Packs:</p>
            <div class="container">
              <div class="row">
                <!-- Option 1 -->
                <div class="col-4">
                  <div class="custom-card">
                    <div class="card-header text-center">OPCIÓN 1</div>
                    <div class="card-body">
                      <h5 class="card-title">19.000 USD</h5>
                      <p class="card-text">Precio original 28.000 USD</p>
                      <p class="card-text rating">
                        <span class="icon"
                          ><img
                            src="@/src/assets/star.svg"
                            alt="Busca centro medico"
                            class="img-fluid"
                        /></span>
                        5.0 <span class="text-muted">(13 Reseñas)</span>
                      </p>
                      <ul class="list-group list-group-flush">
                        <li class="list-group-item">
                          <span class="icon"
                            ><img
                              src="@/src/assets/check.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                          /></span>
                          Cita de valoración
                        </li>
                        <li class="list-group-item">
                          <span class="icon"
                            ><img
                              src="@/src/assets/check.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                          /></span>
                          Medicamentos
                        </li>
                        <li class="list-group-item">
                          <span class="icon"
                            ><img
                              src="@/src/assets/check.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                          /></span>
                          Cita de seguimiento 1 mes después.
                        </li>
                      </ul>
                      <p class="text-muted">Próxima Disponibilidad:</p>
                      <p class="card-text availability">
                        <span class="availability-text">
                          <span class="icon">
                            <img
                              src="@/src/assets/calendar.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                          </span>
                          19/10/2024
                        </span>
                        <span class="time-text">
                          <span class="icon">
                            <img
                              src="@/src/assets/clock.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                          </span>
                          11:00 am
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Option 2 -->
                <div class="col-4">
                  <div class="custom-card">
                    <div
                      class="card-header selected text-center d-flex gap-2 align-items-center justify-content-center"
                    >
                      <span
                        ><img
                          src="@/src/assets/crown.svg"
                          alt="Busca centro medico"
                          class="img-fluid"
                      /></span>
                      <p class="m-0">OPCIÓN 2</p>
                    </div>
                    <div class="card-body">
                      <h5 class="card-title">23.000 USD</h5>
                      <p class="card-text">Precio original 28.000 USD</p>
                      <p class="card-text rating">
                        <span class="icon"
                          ><img
                            src="@/src/assets/star.svg"
                            alt="Busca centro medico"
                            class="img-fluid"
                        /></span>
                        5.0 <span class="text-muted">(13 Reseñas)</span>
                      </p>
                      <ul class="list-group list-group-flush">
                        <li class="list-group-item">
                          <span class="icon"
                            ><img
                              src="@/src/assets/check.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                          /></span>
                          Cita de valoración
                        </li>
                        <li class="list-group-item">
                          <span class="icon"
                            ><img
                              src="@/src/assets/check.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                          /></span>
                          Medicamentos
                        </li>
                        <li class="list-group-item">
                          <span class="icon"
                            ><img
                              src="@/src/assets/check.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                          /></span>
                          Cita de seguimiento 1 mes después.
                        </li>
                      </ul>
                      <p class="text-muted">Próxima Disponibilidad:</p>
                      <p class="card-text availability">
                        <span class="availability-text">
                          <span class="icon">
                            <img
                              src="@/src/assets/calendar.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                          </span>
                          19/10/2024
                        </span>
                        <span class="time-text">
                          <span class="icon">
                            <img
                              src="@/src/assets/clock.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                          </span>
                          11:00 am
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Option 3 -->
                <div class="col-4">
                  <div class="custom-card">
                    <div class="card-header text-center">OPCIÓN 3</div>
                    <div class="card-body">
                      <h5 class="card-title">26.000 USD</h5>
                      <p class="card-text">Precio original 28.000 USD</p>
                      <p class="card-text rating">
                        <span class="icon"
                          ><img
                            src="@/src/assets/star.svg"
                            alt="Busca centro medico"
                            class="img-fluid"
                        /></span>
                        5.0 <span class="text-muted">(13 Reseñas)</span>
                      </p>
                      <ul class="list-group list-group-flush">
                        <li class="list-group-item">
                          <span class="icon"
                            ><img
                              src="@/src/assets/check.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                          /></span>
                          Cita con nutricionista
                        </li>
                        <li class="list-group-item">
                          <span class="icon"
                            ><img
                              src="@/src/assets/check.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                          /></span>
                          Cita con alergólogo
                        </li>
                        <li class="list-group-item">
                          <span class="icon"
                            ><img
                              src="@/src/assets/cross.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                          /></span>
                          Cita de seguimiento 1 mes después.
                        </li>
                      </ul>
                      <p class="text-muted">Próxima Disponibilidad:</p>
                      <p class="card-text availability">
                        <span class="availability-text">
                          <span class="icon">
                            <img
                              src="@/src/assets/calendar.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                          </span>
                          19/10/2024
                        </span>

                        <span class="time-text">
                          <span class="icon">
                            <img
                              src="@/src/assets/clock.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                          </span>
                          11:00 am
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
    <div class="accordion-item">
      <h2 class="accordion-header" id="headingTwo">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapseTwo"
          aria-expanded="false"
          aria-controls="collapseTwo"
        >
          Accordion Item #2
        </button>
      </h2>
      <div
        id="collapseTwo"
        class="accordion-collapse collapse"
        aria-labelledby="headingTwo"
        data-bs-parent="#accordionExample"
      >
        <div class="accordion-body">
          <strong>This is the second item's accordion body.</strong> It is
          hidden by default, until the collapse plugin adds the appropriate
          classes that we use to style each element. These classes control the
          overall appearance, as well as the showing and hiding via CSS
          transitions. You can modify any of this with custom CSS or overriding
          our default variables. It's also worth noting that just about any HTML
          can go within the <code>.accordion-body</code>, though the transition
          does limit overflow.
        </div>
      </div>
    </div>
    <div class="accordion-item">
      <h2 class="accordion-header" id="headingThree">
        <button
          class="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapseThree"
          aria-expanded="false"
          aria-controls="collapseThree"
        >
          Accordion Item #3
        </button>
      </h2>
      <div
        id="collapseThree"
        class="accordion-collapse collapse"
        aria-labelledby="headingThree"
        data-bs-parent="#accordionExample"
      >
        <div class="accordion-body">
          <strong>This is the third item's accordion body.</strong> It is hidden
          by default, until the collapse plugin adds the appropriate classes
          that we use to style each element. These classes control the overall
          appearance, as well as the showing and hiding via CSS transitions. You
          can modify any of this with custom CSS or overriding our default
          variables. It's also worth noting that just about any HTML can go
          within the <code>.accordion-body</code>, though the transition does
          limit overflow.
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.custom-card {
  border: 1px solid var(--Gray-Scale-300, #f1f3f7);
  background: var(--Gray-Scale-White, #fff);
  box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.08);
}

.custom-card .card-header {
  font-weight: bold;
  padding: 15px;
  background: linear-gradient(
    188deg,
    #f8faff 65.03%,
    rgba(248, 250, 255, 0.1) 112.13%
  );
  border: none;
}

.custom-card .card-header.selected {
  background: linear-gradient(
    180deg,
    #fffcf5 70.16%,
    rgba(255, 252, 245, 0.05) 100%
  );
}

.custom-card .card-body {
  padding: 20px;
}

.custom-card .card-title {
  font-size: 1.5em;
  margin-bottom: 10px;
}

.custom-card .card-text {
  margin-bottom: 10px;
}

.custom-card .list-group-item {
  border: none;
  padding-left: 0;
  padding-right: 0;
}

.custom-card .btn {
  width: 100%;
  margin-top: 15px;
}

.custom-card .rating .icon {
  color: #ffc107;
}

.custom-card .icon {
  margin-right: 5px;
}
</style>
