<script setup>
definePageMeta({
  middleware: ["auth-pacientes"],
});
const config = useRuntimeConfig();
const token = useCookie("token");
const user_info = useCookie("user_info");

const { data: appointments, pending: pendingAppointments } = await useFetch(
  config.public.API_BASE_URL + "/internal_patient_dashboard/appointments",
  {
    headers: { Authorization: token.value },
    transform: (_appointments) => _appointments.data,
  },
);

// const { data: vouchers, pending: pendingVouchers } = await useFetch(
//   config.public.API_BASE_URL + "/internal_patient_dashboard/vouchers",
//   {
//     headers: { Authorization: token.value },
//     transform: (_vouchers) => _vouchers.data,
//   },
// );
const vouchers = [
  {
    id: 1,
    code: "ABC123",
    service_name: "Consulta General",
    status: "Activo",
  },
  {
    id: 2,
    code: "DEF456",
    service_name: "Examen de Sangre",
    status: "Completado",
  },
  {
    id: 3,
    code: "GHI789",
    service_name: "Radiografía",
    status: "Pendiente",
  },
];

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
            <span class="fw-semibold"
              >Bienvenida
              {{ user_info.first_name + " " + user_info.last_name }}</span
            >
            <span class="fw-light ms-1"
              >¿Qué servicio médico estás buscando?</span
            >
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
                  <div class="row pb-3">
                    <div
                      class="card col-2 p-2 m-2"
                      v-for="medico in historial"
                      :key="medico.id"
                    >
                      <div class="col-12">
                        <img
                          src="@/src/assets/img-medico-thumbnail.png"
                          alt=""
                          class="img-fluid"
                        />
                      </div>
                      <div class="col-12">
                        <div class="fs-5">
                          {{ medico.review_score }}
                          <AtomsIconsStar />
                          <span class="fw-light text-muted"
                            >({{ medico.review_count }} Reseñas)</span
                          >
                        </div>
                        <p class="fs-5 fw-semibold mt-2 mb-3">
                          {{ medico.name }}
                        </p>
                        <!-- <div>
                          <AtomsBadgeServicio
                            v-for="servicio in medico.servicios"
                            :servicio="servicio"
                          />
                        </div> -->
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
</style>
