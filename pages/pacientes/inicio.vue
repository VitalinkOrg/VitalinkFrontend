<script setup>
import { useStore } from "~/store";
import { useRefreshToken } from "#imports";
definePageMeta({
  middleware: "auth-pacientes",
});
const store = useStore();
const config = useRuntimeConfig();
const token = useCookie("token");
// const { pacientes, citas, vauchers, historial } = usePaciente();
const { data: user, pending: pendingUser } = await useFetch(
  config.public.API_BASE_URL + "/patients/getByUser",
  {
    headers: { Authorization: token.value },
    transform: (_user) => _user.data,
  }
);
if (user) {
  store.user = user;
  useRefreshToken();
}

const { data: appointments, pending: pendingAppointments } = await useFetch(
  config.public.API_BASE_URL + "/internal_patient_dashboard/appointments",
  {
    headers: { Authorization: token.value },
    transform: (_appointments) => _appointments.data,
  }
);
if (appointments) {
  store.user.appointments = appointments;
}

const { data: vouchers, pending: pendingVouchers } = await useFetch(
  config.public.API_BASE_URL + "/internal_patient_dashboard/vouchers",
  {
    headers: { Authorization: token.value },
    transform: (_vouchers) => _vouchers.data,
  }
);
if (vouchers) {
  store.user.vouchers = vouchers;
}

const { data: historial, pending: pendingHistorial } = await useFetch(
  config.public.API_BASE_URL +
  "/internal_patient_dashboard/doctors_and_hospitals",
  {
    headers: { Authorization: token.value },
    transform: (_historial) => _historial.data,
  }
);
if (historial) {
  store.user.historial = historial;
}
</script>
<template>
  <NuxtLayout name="pacientes-dashboard">
    <div v-if="pendingUser"></div>
    <div v-else>
      <header class="d-flex align-items-center">
        <div class="container">
          <h1 class="text-center fs-3 mb-4">
            <span class="fw-semibold">Bienvenida {{ user.first_name + " " + user.last_name }}</span>
            <span class="fw-light ms-1">¿Qué servicio médico estás buscando?</span>
          </h1>
          <WebsiteSearchBar :solicitar="true" />
        </div>
      </header>

      <main class="pt-3 pb-5 bg-light">
        <div class="container-fluid">
          <section class="mb-4">
            <p class="mx-2 d-flex align-items-center justify-content-between">
              <span class="fw-semibold fs-5">Próximas Citas</span>
              <NuxtLink class="btn btn-link text-dark" href="/pacientes/citas">Ver Todo
                <AtomsIconsArrowRightIcon />
              </NuxtLink>
            </p>
            <div v-if="pendingAppointments"></div>
            <div v-else class="card shadow-sm border-0" style="min-height: 15rem">
              <table class="table table-hover" v-if="appointments !== null">
                <thead>
                  <tr>
                    <th scope="col">Doctor</th>
                    <th scope="col">Fecha</th>
                    <th scope="col">Hora</th>
                    <th scope="col">Procedimiento</th>
                    <th scope="col">Lugar</th>
                    <th scope="col">Estado</th>
                    <th scope="col"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="appointment in appointments" :key="appointment.id">
                    <th scope="row" class="fw-light">
                      {{ appointment.professional_name }}
                    </th>
                    <td class="fw-light">{{ new Date(appointment.date).toLocaleDateString() }}</td>
                    <td class="fw-light">
                      {{ appointment.time_from + " - " + appointment.time_to }}
                    </td>
                    <td class="fw-light">{{ appointment.service_name }}</td>
                    <td class="fw-light">{{ appointment.hospital_address }}</td>
                    <td class="fw-light">
                      <span class="badge bg-success-subtle text-dark rounded-5 w-100">{{ appointment.state }}</span>
                    </td>
                    <td>
                      <AtomsIconsTrashIcon />
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-else class="card-body d-flex py-5">
                <div class="col-sm-5 text-end">
                  <AtomsIconsChartVacio />
                </div>
                <div class="col-sm-7">
                  <p class="fs-5 text-muted fw-medium">
                    Aún no tienes actividad en tu tablero
                  </p>
                  <p class="fw-light text-secondary">
                    Muy pronto podrás administrar y verificar tu actividad.
                  </p>
                  <button class="btn btn-primary border-danger">Empezar</button>
                </div>
              </div>
            </div>
          </section>
          <section class="mb-5 pb-5">
            <div class="row">
              <div class="col">
                <p class="mx-2 d-flex align-items-center justify-content-between">
                  <span class="fw-semibold fs-5">Historial de Hospitales y Médicos</span>
                  <NuxtLink class="btn btn-link text-dark" href="/pacientes/inicio">Ver Todo
                    <AtomsIconsArrowRightIcon />
                  </NuxtLink>
                </p>
                <div v-if="pendingHistorial"></div>
                <div v-else class="card shadow-sm border-0 h-100">
                  <div v-if="historial !== null" class="card-body">
                    <div v-for="medico in historial" :key="medico.id" class="row border-bottom pb-3">
                      <div class="col-3">
                        <img src="@/src/assets/img-medico-thumbnail.png" alt="" class="img-fluid" />
                      </div>
                      <div class="col">
                        <div class="fs-5">
                          {{ medico.review_score }}
                          <AtomsIconsStar />
                          <span class="fw-light text-muted">({{ medico.review_count }} Reseñas)</span>
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
              <div class="col">
                <p class="mx-2 d-flex align-items-center justify-content-between">
                  <span class="fw-semibold fs-5">Mis Váuchers</span>
                  <NuxtLink class="btn btn-link text-dark" href="/pacientes/vauchers">Ver Todo
                    <AtomsIconsArrowRightIcon />
                  </NuxtLink>
                </p>
                <div v-if="pendingVouchers"></div>
                <div v-else class="card shadow-sm border-0 h-100">
                  <table v-if="vouchers !== null" class="table table-hover">
                    <tbody>
                      <tr v-for="voucher in vouchers" :key="voucher.id">
                        <td class="fw-semibold fs-5">#{{ voucher.code }}</td>
                        <td class="fs-5">{{ voucher.service_name }}</td>
                        <td>
                          <span class="badge bg-success-subtle text-dark rounded-5 w-100 fs-5">{{ voucher.status }}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
            </div>
          </section>
        </div>
      </main>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
header {
  background-color: #ebecf7;
  padding: 2rem 0 0;
}
</style>
