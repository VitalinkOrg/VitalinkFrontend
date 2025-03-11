<script setup>
definePageMeta({
  middleware: ["auth-pacientes"],
});
const config = useRuntimeConfig();
const token = useCookie("token");
const user_info = useCookie("user_info");

console.log(user_info);

const { data: appointments, pending: pendingAppointments } = await useFetch(
  config.public.API_BASE_URL + "/internal_patient_dashboard/appointments",
  {
    headers: { Authorization: token.value },
    transform: (_appointments) => _appointments.data,
  }
);

// const { data: historial, pending: pendingHistorial } = await useFetch(
//   config.public.API_BASE_URL +
//     "/internal_patient_dashboard/doctors_and_hospitals",
//   {
//     headers: { Authorization: token.value },
//     transform: (_historial) => _historial.data,
//   },
// );
const historial = [
  {
    id: 1,
    review_score: 4.5,
    review_count: 20,
    name: "Dr. Juan Pérez",
    servicios: ["Cardiología", "Medicina Interna"],
  },
  {
    id: 2,
    review_score: 4.8,
    review_count: 35,
    name: "Dra. María López",
    servicios: ["Pediatría", "Neonatología"],
  },
  {
    id: 3,
    review_score: 4.2,
    review_count: 15,
    name: "Dr. Carlos García",
    servicios: ["Dermatología", "Cirugía Plástica"],
  },
  {
    id: 4,
    review_score: 4.9,
    review_count: 50,
    name: "Dra. Ana Martínez",
    servicios: ["Ginecología", "Obstetricia"],
  },
  {
    id: 5,
    review_score: 4.7,
    review_count: 40,
    name: "Dr. Luis Fernández",
    servicios: ["Neurología", "Psiquiatría"],
  },
  {
    id: 6,
    review_score: 4.3,
    review_count: 25,
    name: "Dra. Laura Gómez",
    servicios: ["Oftalmología", "Optometría"],
  },
  {
    id: 7,
    review_score: 4.6,
    review_count: 30,
    name: "Dr. Pedro Sánchez",
    servicios: ["Ortopedia", "Traumatología"],
  },
];
</script>
<template>
  <NuxtLayout name="pacientes-dashboard">
    <div v-if="pendingUser"></div>
    <div v-else>
      <header class="d-flex align-items-center">
        <div class="container">
          <h1 class="text-center fs-3 mb-4">
            <span class="fw-semibold"> Bienvenida {{ user_info.name }} </span>
            <span class="fw-light ms-1">
              ¿Qué servicio médico estás buscando?
            </span>
          </h1>
          <WebsiteSearchBar :solicitar="true" />
        </div>
      </header>

      <main class="pt-3 pb-5 bg-light">
        <div class="container">
          <section class="mb-5 pb-5">
            <div class="row">
              <div class="col">
                <p
                  class="mx-2 d-flex align-items-center justify-content-between"
                >
                  <span class="fw-semibold fs-5">Recomendados</span>
                </p>
                <div v-if="historial !== null" class="card-body">
                  <div class="row">
                    <div
                      class="col-md-4 mb-4"
                      v-for="medico in historial"
                      :key="medico.id"
                    >
                      <div class="card p-3">
                        <div class="d-flex align-items-center">
                          <div>
                            <img
                              src="@/src/assets/img-medico-thumbnail.png"
                              alt=""
                              class="img-fluid rounded-circle"
                              width="67.088px"
                              height="66.975px"
                            />
                            <div
                              class="bg-primary d-flex p-2 score justify-content-between gap-2"
                            >
                              <p class="text-white mb-0">
                                {{ medico.review_score }}
                              </p>
                              <img
                                src="@/src/assets/star.svg"
                                alt="Busca centro medico"
                                class="img-fluid"
                              />
                            </div>
                          </div>

                          <div class="ms-3">
                            <p class="fs-5 fw-semibold mb-1">
                              {{ medico.name }}
                            </p>
                            <div
                              class="d-flex align-items-center mt-3 mb-0 gap-2"
                            >
                              <img
                                src="@/src/assets/doctor-element.svg"
                                alt="Busca centro medico"
                                class="img-fluid"
                              />
                              <p class="text-muted mb-0">
                                {{ medico.servicios[0] }}
                              </p>
                            </div>

                            <div class="d-flex align-items-center gap-2">
                              <img
                                src="@/src/assets/marker.svg"
                                alt="Busca centro medico"
                                class="img-fluid"
                              />
                              <p class="text-muted mb-0">
                                +5 Hospitales diferentes
                              </p>
                            </div>
                          </div>
                        </div>
                        <div class="mt-3 availability p-2">
                          <p class="text-muted">Disponibilidad</p>
                          <div class="d-flex align-items-center gap-2">
                            <img
                              src="@/src/assets/calendar.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                            <p class="m-0">5 de Octubre, 2025</p>
                          </div>
                          <div class="d-flex align-items-center gap-2">
                            <img
                              src="@/src/assets/clock.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                            />
                            <p class="m-0">11:00 am</p>
                          </div>
                        </div>
                        <div class="mt-3">
                          <span class="badge me-2 text-primary p-2"
                            >Oftalmología</span
                          >
                          <span class="badge me-2 text-primary p-2"
                            >Cirugía</span
                          >
                          <span class="badge text-primary p-2">Pediatría</span>
                        </div>
                        <div
                          class="mt-3 d-flex justify-content-between align-items-center"
                        >
                          <div>
                            <p class="fw-bold mb-0">$23,200 USD</p>
                            <p class="text-muted mb-0">Precio de referencia</p>
                          </div>

                          <a
                            :href="'/perfiles/doctor/' + medico.id"
                            class="text-decoration-none"
                            >Ver paquetes<img
                              src="@/src/assets/arrow-next.svg"
                              alt="Busca centro medico"
                              class="img-fluid"
                          /></a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="card-body d-flex py-5">
                  <div class="col-sm-5 text-end">
                    <AtomsIconsChartVacio />
                  </div>
                  <div class="col-sm-7">
                    <p class="fs-5 text-muted fw-medium">
                      Aún no tienes actividad en tu tablero
                    </p>
                    <p class="fw-light text-secondary">
                      Muy pronto podrás administrar y verificar estadísticas y
                      actividades de los usuarios de Vitalink.
                    </p>
                    <button class="btn btn-primary border-danger">
                      Empezar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
    <MedicosCitaCancelModal
      :open="openDateCancelModal"
      :appointment="modalData"
      @close-modal="closeModal"
    />
  </NuxtLayout>
</template>

<style lang="scss" scoped>
header {
  background-color: #ebecf7;
  padding: 2rem 0 0;
}
.card {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
.badge {
  font-size: 0.9rem;
  background-color: #ebecf7;
  border-radius: 105.022px;
}

.score {
  width: 62px;
  border-radius: 23px;
}

.availability {
  background-color: #f9f8f8;
  border-radius: 9px;
}
</style>
