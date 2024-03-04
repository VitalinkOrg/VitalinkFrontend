<script setup>
import { useStore } from "~/store";
const { citas } = useMedico()

definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});
const store = useStore();
const config = useRuntimeConfig();
const token = useCookie("token");
const role = useCookie("role");

// if(role.value == 'R_HOS') {
//   const { data: procedures, pending: pendingProcedures } = await useFetch(
//     config.public.API_BASE_URL + "/hospital_dashboard/count_procedures",
//     {
//       headers: { Authorization: token.value },
//       transform: (_procedures) => _procedures.data,
//     }
//   );
//   if (procedures) {
//     store.user.procedures = procedures;
//   }
// }

</script>
<template>
  <NuxtLayout name="medicos-dashboard">
    <div class="row row-cols-4 mb-3">
      <div class="col">
        <!-- Citas Pendientes  -->
        <!-- Vacio  -->
        <!-- <div class="card rounded-3 border-0 shadow-sm">
          <div class="card-body d-flex align-items-center px-1">
            <AtomsIconsNoActivityIcon />
            <p class="d-flex flex-column ms-3 mb-0">
              Aún no tienes actividad
              <button class="btn btn-primary btn-sm mt-2 rounded-3">
                Empezar
              </button>
            </p>
          </div>
          
        </div> -->
        <!-- con Data  -->
        <div class="card rounded-3 border-0 shadow-sm">
          <div class="card-body d-flex align-items-center ">
            <!-- <AtomsIconsNoActivityIcon /> -->
            <span class="icon-indicator bg-warning-subtle text-warning">
              <Icon name="fa6-solid:address-book"/>
            </span>
            <p class="d-flex flex-column ms-3 mb-0">
              <span class="fs-5 fw-semibold">202</span>
              <small class="text-muted">Citas Pendientes</small>
            </p>
          </div>
        </div>
      </div>
      <div class="col">
        <!-- Pacientes Atendidos  -->
        <!-- <div class="card rounded-3 border-0 shadow-sm">
          <div class="card-body d-flex align-items-center px-1">
            <AtomsIconsNoActivityIcon />
            <p class="d-flex flex-column ms-3 mb-0">
              Aún no tienes actividad
              <button class="btn btn-primary btn-sm mt-2 rounded-3">
                Empezar
              </button>
            </p>
          </div>
        </div> -->
        <!-- con Data  -->
        <div class="card rounded-3 border-0 shadow-sm">
          <div class="card-body d-flex align-items-center ">
            <!-- <AtomsIconsNoActivityIcon /> -->
            <span class="icon-indicator bg-warning-subtle text-warning">
              <Icon name="ic:round-favorite"/>
            </span>
            <p class="d-flex flex-column ms-3 mb-0">
              <span class="fs-5 fw-semibold">202</span>
              <small class="text-muted">Pacientes Atendidos</small>
            </p>
          </div>
        </div>
      </div>
      <div class="col">
        <!-- Reseñas Recibidas  -->
        <!-- <div class="card rounded-3 border-0 shadow-sm">
          <div class="card-body d-flex align-items-center px-1">
            <AtomsIconsNoActivityIcon />
            <p class="d-flex flex-column ms-3 mb-0">
              Aún no tienes actividad
              <button class="btn btn-primary btn-sm mt-2 rounded-3">
                Empezar
              </button>
            </p>
          </div>
        </div> -->
        <!-- con Data  -->
        <div class="card rounded-3 border-0 shadow-sm">
          <div class="card-body d-flex align-items-center ">
            <!-- <AtomsIconsNoActivityIcon /> -->
            <span class="icon-indicator bg-warning-subtle text-warning">
              <Icon name="mdi:star-shooting"/>
            </span>
            <p class="d-flex flex-column ms-3 mb-0">
              <span class="fs-5 fw-semibold">202</span>
              <small class="text-muted">Reseñas Recibidas</small>
            </p>
          </div>
        </div>
      </div>
      <div class="col">
        <!-- Procedimientos  -->
        <!-- <div class="card rounded-3 border-0 shadow-sm">
          <div class="card-body d-flex align-items-center px-1">
            <AtomsIconsNoActivityIcon />
            <p class="d-flex flex-column ms-3 mb-0">
              Aún no tienes actividad
              <button class="btn btn-primary btn-sm mt-2 rounded-3">
                Empezar
              </button>
            </p>
          </div>
        </div> -->
        <!-- con Data  -->
        <div class="card rounded-3 border-0 shadow-sm">
          <div class="card-body d-flex align-items-center ">
            <!-- <AtomsIconsNoActivityIcon /> -->
            <span class="icon-indicator bg-warning-subtle text-warning">
              <Icon name="ph:calendar-plus-fill"/>
            </span>
            <p class="d-flex flex-column ms-3 mb-0">
              <span class="fs-5 fw-semibold">202</span>
              <small class="text-muted">Procedimientos</small>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="row mb-3">
      <div class="col-sm-8">
        <p class="mx-2 d-flex align-items-center justify-content-between">
          <span class="fw-medium fs-5">Próximas Citas</span>
          <NuxtLink class="btn btn-link text-dark" href="/medicos/inicio"
            >Ver Todo
            <AtomsIconsArrowRightIcon />
          </NuxtLink>
        </p>
        <div class="card border-0 shadow rounded-3 py-5">
          <div class="card-body d-flex align-items-center p-5">
            <AtomsIconsChartVacio />
            <p class="d-flex flex-column align-items-start ms-3">
              <span class="fw-medium text-muted fs-5"
                >Aún no tienes actividad en tu tablero</span
              >
              <span class="fw-light text-muted"
                >Muy pronto podrás administrar y verificar tu actividad.</span
              >
              <button class="btn btn-primary btn-sm mt-2 rounded-3">
                Empezar
              </button>
            </p>
          </div>
        </div>
      </div>
      <div class="col">
        <p class="mx-2 d-flex align-items-center justify-content-between">
          <span class="fw-medium fs-5">Pacientes</span>
          <NuxtLink class="btn btn-link text-dark" href="/medicos/inicio"
            >Ver Todo
            <AtomsIconsArrowRightIcon />
          </NuxtLink>
        </p>
        <div class="card border-0 shadow rounded-3">
          <div class="card-body d-flex flex-column text-center p-5">
            <span class="w-75 mx-auto">
              <AtomsIconsChartVacio />
            </span>
            <p class="d-flex flex-column align-items-start ms-3">
              <span class="fw-medium text-muted fs-6"
                >Aún no tienes actividad en tu tablero</span
              >
              <span class="fw-light text-muted fs-6"
                >Muy pronto podrás administrar y verificar tu actividad.</span
              >
              <button class="btn btn-primary btn-sm mt-2 rounded-3 mx-auto">
                Empezar
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <p class="mx-2 d-flex align-items-center justify-content-between">
        <span class="fw-medium fs-5">Historial</span>
        <NuxtLink class="btn btn-link text-dark" href="/medicos/citas"
          >Ver Todo
          <AtomsIconsArrowRightIcon />
        </NuxtLink>
      </p>
      <!-- Sin Citas  -->
      <!-- <div class="card border-0 shadow rounded-3 py-4">
        <div class="card-body d-flex align-items-center p-5">
          <span class="w-50 text-center">
            <AtomsIconsChartVacio />
          </span>
          <p class="d-flex flex-column align-items-start ms-3">
            <span class="fw-medium text-muted fs-5"
              >Aún no tienes actividad en tu tablero</span
            >
            <span class="fw-light text-muted"
              >Muy pronto podrás administrar y verificar tu actividad.</span
            >
            <button class="btn btn-primary btn-sm mt-2 rounded-3">
              Empezar
            </button>
          </p>
        </div>
      </div> -->
        <!-- Con Citas  -->
        <div class="card">
          <table v-if="citas !== null" class="table fw-light">
            <thead>
              <tr>
                <th scope="col"></th>
                <th scope="col" class="text-muted">Nombre del paciente</th>
                <th scope="col" class="text-muted">Fecha</th>
                <th scope="col" class="text-muted">Hora</th>
                <th scope="col" class="text-muted">Procedimiento</th>
                <th scope="col" class="text-muted">Lugar</th>
                <th scope="col" class="text-muted">Váucher</th>
                <th scope="col" class="text-muted">Estado</th>
                <th scope="col" class="text-muted"></th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="cita in citas" :key="cita.id">
                <td>{{ cita.paciente }}</td>
                <td>{{ cita.fecha }}</td>
                <td>{{ cita.hora }}</td>
                <td>{{ cita.procedimiento }}</td>
                <td><small>{{ cita.lugar.texto }}</small></td>
                <td><span class="badge text-muted bg-white border rounded-5 w-100">{{ cita.vaucher }}</span></td>
                <td>
                  <span class="badge bg-success-subtle rounded-5 text-dark w-100">{{ cita.estado }}
                    <AtomsIconsChevronDown />
                  </span>
                </td>
                <td>
                  <AtomsIconsThreeDotsHorizontalIcon />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    <MedicosOnboardingModal />
  </NuxtLayout>
</template>

<style scoped lang="scss">
.icon-indicator {
  height: 3rem;
  width: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50rem;
  font-size: 1.5rem;
}
</style>
