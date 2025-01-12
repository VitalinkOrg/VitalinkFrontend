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
    <div class="accordion-item">
      <h2 class="accordion-header" id="headingOne">
        <button
          class="accordion-button"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapseOne"
          aria-expanded="true"
          aria-controls="collapseOne"
        >
          Cirugía de cataratas
        </button>
      </h2>
      <div
        id="collapseOne"
        class="accordion-collapse collapse show"
        aria-labelledby="headingOne"
        data-bs-parent="#accordionExample"
      >
        <div class="accordion-body">
          <!-- buttons actions -->
          <div style="display: flex; justify-content: end">
            <div class="m-2">
              <button class="btn btn-primary">Editar</button>
            </div>
            <div class="m-2">
              <button class="btn btn-primary">Eliminar</button>
            </div>
          </div>

          <ul class="nav nav-tabs">
            <li class="nav-item">
              <a
                class="nav-link"
                aria-current="page"
                href="#"
                :class="{ active: serviceSegmentOption === 'info' }"
                @click="serviceSegmentOption = 'info'"
                >Información general</a
              >
            </li>
            <li
              class="nav-item"
              :class="{ active: serviceSegmentOption === 'packs' }"
              @click="serviceSegmentOption = 'packs'"
            >
              <a class="nav-link" href="#">Precios y packs</a>
            </li>
          </ul>

          <!-- info -->
          <section v-if="serviceSegmentOption == 'info'" class="p-2">
            <div class="list-group list-group-flush">
              <!-- speciality -->
              <div
                class="list-group-item d-flex justify-content-between align-items-center m-2"
              >
                <span>Especialidad medica</span>
                <span>Oftalmología</span>
              </div>

              <!-- description -->
              <div
                class="list-group-item d-flex justify-content-between align-items-center m-2"
              >
                <span>Descripción</span>
              </div>
              <div>
                <p class="m-2">
                  El procedimiento de cirugía de cataratas implica realizar una
                  microincisión en el ojo para acceder al cristalino
                  opacificado. Utilizando tecnología láser o instrumentos
                  especializados, el cirujano fragmenta y extrae la lente
                  afectada, para luego implantar una lente intraocular que
                  restaura la claridad visual. Este proceso, llevado a cabo con
                  precisión milimétrica, permite una recuperación rápida y una
                  mejora significativa en la visión del paciente, contribuyendo
                  a su calidad de vida.
                </p>
              </div>

              <div
                class="list-group-item list-group-item-action m-2"
                aria-current="true"
              >
                <div class="d-flex w-100 justify-content-between">
                  <h5 class="mb-1">Hospital de atención</h5>
                </div>
                <p class="mb-1">
                  Indica el/los lugares donde tendrá disponibilidad este
                  servicio
                </p>
              </div>

              <div class="card m-2">
                <div class="card-body">
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

            <!-- plans -->
            <div class="container">
              <div class="row">
                <!-- standard -->
                <div class="col-4">
                  <div class="card">
                    <div class="card-header text-center">Standard</div>
                    <div class="card-body">
                      <h5 class="card-title">23.000 USD</h5>
                      <p class="card-text">Precio original 28.000 USD</p>
                      <p class="card-text">
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        (15 Reseñas)
                      </p>
                      <ul class="list-group list-group-flush">
                        <li class="list-group-item">Cita de valoración</li>
                        <li class="list-group-item">Medicamentos</li>
                        <li class="list-group-item">
                          Cita de seguimiento <br />
                          1 mes después.
                        </li>
                      </ul>
                      <p class="card-text">
                        Próxima Disponibilidad: 19/10/2024 11:00 am
                      </p>
                      <button
                        class="btn btn-outline-primary"
                        @click="openConfirmationModal()"
                      >
                        Solicitar cita de valoración
                      </button>
                    </div>
                  </div>
                </div>

                <!-- premium -->
                <div class="col-4">
                  <div class="card">
                    <div class="card-header text-center">Premium</div>
                    <div class="card-body">
                      <h5 class="card-title">23.000 USD</h5>
                      <p class="card-text">Precio original 28.000 USD</p>
                      <p class="card-text">
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        (15 Reseñas)
                      </p>
                      <ul class="list-group list-group-flush">
                        <li class="list-group-item">Cita de valoración</li>
                        <li class="list-group-item">Medicamentos</li>
                        <li class="list-group-item">
                          Cita de seguimiento <br />
                          1 mes después.
                        </li>
                      </ul>
                      <p class="card-text">
                        Próxima Disponibilidad: 19/10/2024 11:00 am
                      </p>
                      <button
                        class="btn btn-outline-primary"
                        @click="openConfirmationModal()"
                        data-bs-toggle="modal"
                        data-bs-target="#modalCitaValoracion"
                      >
                        Solicitar cita de valoración
                      </button>
                    </div>
                  </div>
                </div>

                <!-- basic -->
                <div class="col-4">
                  <div class="card">
                    <div class="card-header text-center">Pack basic</div>
                    <div class="card-body">
                      <h5 class="card-title">23.000 USD</h5>
                      <p class="card-text">Precio original 28.000 USD</p>
                      <p class="card-text">
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        <i class="bi bi-star-fill"></i>
                        (15 Reseñas)
                      </p>
                      <ul class="list-group list-group-flush">
                        <li class="list-group-item">Cita de valoración</li>
                        <li class="list-group-item">Medicamentos</li>
                        <li class="list-group-item">
                          Cita de seguimiento <br />
                          1 mes después.
                        </li>
                      </ul>
                      <p class="card-text">
                        Próxima Disponibilidad: 19/10/2024 11:00 am
                      </p>
                      <button
                        class="btn btn-outline-primary"
                        @click="openConfirmationModal()"
                        data-bs-toggle="modal"
                        data-bs-target="#modalCitaValoracion"
                      >
                        Solicitar cita de valoración
                      </button>
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
