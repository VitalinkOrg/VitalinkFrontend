<script setup>
import { useStore } from "~/store";
import { useRefreshToken } from "#imports";
definePageMeta({
  middleware: ["auth-insurances"],
});
const store = useStore();
const config = useRuntimeConfig();
const token = useCookie("token");
// const { pacientes, citas, vauchers, historial } = usePaciente();
const { data: insurance, pending: pendingUser } = await useFetch(
  config.public.API_BASE_URL + "/insurances/get_insurance_info",
  {
    headers: { Authorization: token.value },
    transform: (_insurance) => _insurance.data,
  }
);
if (insurance) {
  store.user = [];
  store.user = insurance;
  useRefreshToken();
}

const { data: vouchers, pending: pendingVouchers } = await useFetch(
  config.public.API_BASE_URL + "/insurance_dashboard/list_vouchers",
  {
    headers: { Authorization: token.value },
    transform: (_vouchers) => _vouchers.data,
  }
);
if (vouchers.length) {
  store.user.vouchers = vouchers;
}
</script>
<template>
  <NuxtLayout name="aseguradoras-dashboard">
    <div v-if="pendingVouchers"></div>
    <div v-else>
      <div class="row mb-3">
        <div class="col">
          <p class="mx-2 d-flex align-items-center justify-content-between">
            <span class="fw-medium fs-5">Váuchers Activos</span>
            <NuxtLink class="btn btn-link text-dark" href="/aseguradoras/inicio"
              >Ver Todo
              <AtomsIconsArrowRightIcon />
            </NuxtLink>
          </p>
          <div class="card border-0 shadow rounded-3">
            <div v-if="vouchers !== null" class="card-body d-flex">
              <div
                class="col text-center align-items-center d-flex justify-content-center"
              >
                <div class="d-flex flex-column">
                  <span class="fs-1 fw-bold text-primary">85%</span>
                  <span class="fs-4 text-muted"
                    >de váuchers <br />
                    activos</span
                  >
                </div>
              </div>
              <div
                class="col-auto bg-light d-flex flex-column rounded-4 px-3 py-5"
              >
                <span class="fs-4">
                  <div>Total de</div>
                  <div class="display-4 fw-bold text-info">
                    {{ vouchers.length }}
                  </div>
                </span>
                <span class="fw-light text-muted fs-4 text-wrap"
                  >Vauchers <br />generados y <br />
                  confirmados</span
                >
              </div>
            </div>
            <div
              class="card-body d-flex align-items-center p-5"
              v-else
            >
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
            <span class="fw-medium fs-5">Resumen Anual de Váuchers</span>
            <NuxtLink class="btn btn-link text-dark" href="/aseguradoras/inicio"
              >Ver Todo
              <AtomsIconsArrowRightIcon />
            </NuxtLink>
          </p>
          <div class="card border-0 shadow rounded-3">
            <div class="card border-0 shadow rounded-3">
              <div v-if="vouchers !== null" class="card-body">
                <div
                  class="d-flex align-items-center justify-content-center py-5 bg-light text-muted mb-3"
                >
                  <span class="py-4"> Chart Goes Here </span>
                </div>
                <div class="row">
                  <div class="col">
                    <div
                      class="bg-light p-3 d-flex align-items-center rounded-4"
                    >
                      <span
                        class="fs-4 text-center pe-3 me-3 border-end border-dark text-info"
                      >
                        <div class="text-nowrap fw-medium">Total de</div>
                        <div class="fs-1 fw-bold">{{ vouchers.length }}</div>
                      </span>
                      <span class="fw-semibold text-muted"
                        >Vauchers generados y confirmados</span
                      >
                    </div>
                  </div>
                  <div class="col-auto d-flex align-items-center">
                    <ul class="list-unstyled m-0">
                      <li class="d-flex align-items-center text-muted">
                        <span class="square me-2 bg-primary"></span>Utilizados
                      </li>
                      <li class="d-flex align-items-center text-muted">
                        <span class="square me-2 bg-info"></span>Vauchers de
                        aprobación
                      </li>
                      <li class="d-flex align-items-center text-muted">
                        <span class="square me-2 bg-warning"></span>Cancelados
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div
                class="card-body d-flex align-items-center p-5"
                v-else
              >
                <AtomsIconsChartVacio />
                <p class="d-flex flex-column align-items-start ms-3">
                  <span class="fw-medium text-muted fs-5"
                    >Aún no tienes actividad en tu tablero</span
                  >
                  <span class="fw-light text-muted"
                    >Muy pronto podrás administrar y verificar tu
                    actividad.</span
                  >
                  <button class="btn btn-primary btn-sm mt-2 rounded-3">
                    Empezar
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <p class="mx-2 d-flex align-items-center justify-content-between">
          <span class="fw-medium fs-5">Historial</span>
          <NuxtLink class="btn btn-link text-dark" href="/aseguradoras/inicio"
            >Ver Todo
            <AtomsIconsArrowRightIcon />
          </NuxtLink>
        </p>
        <div v-if="vouchers !== null">
          <table class="table fw-light">
            <thead>
              <tr>
                <th scope="col" class="text-muted">Código</th>
                <th scope="col" class="text-muted">Nombre del asegurado</th>
                <th scope="col" class="text-muted">No de Asegurado</th>
                <th scope="col" class="text-muted">Procedimiento</th>
                <th scope="col" class="text-muted">Vencimiento</th>
                <th scope="col" class="text-muted">Estado</th>
                <th scope="col" class="text-muted"></th>
              </tr>
            </thead>

            <tbody>
              <AseguradorasVaucherTableItem
                v-for="voucher in vouchers"
                :key="voucher.voucher_id"
                :voucher="voucher"
              />
            </tbody>
          </table>
        </div>
        <div class="card border-0 shadow rounded-3 py-4" v-else>
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
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
<style lang="scss" scoped>
.square {
  display: inline-block;
  height: 1rem;
  width: 1rem;
  border-radius: 0.4rem;
}
</style>
