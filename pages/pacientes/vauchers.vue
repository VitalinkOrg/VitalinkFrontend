<script setup>
import { ref } from "vue";
import { useRefreshToken } from "#imports";
definePageMeta({
  middleware: "auth-pacientes",
});
const config = useRuntimeConfig();
const token = useCookie("token");
const tab = ref(1);
const sort = ref(false);
const allVouchers = ref();

// const { data: vouchers, loading } = await useFetch(
//   config.public.API_BASE_URL + "/internal_patient_dashboard/vouchers",
//   {
//     headers: { Authorization: token.value },
//     transform: (_vouchers) => _vouchers.data,
//   }
// );
const vouchers = ref([
  {
    id: 1,
    code: "ABC123",
    service_name: "Consulta General",
    status: "APPROVED",
    date: "2023-10-01",
    patient_name: "Juan Pérez",
    doctor_name: "Dr. Smith",
    location: "Clínica Central",
  },
  {
    id: 2,
    code: "DEF456",
    service_name: "Examen de Sangre",
    status: "APPROVED",
    date: "2023-09-15",
    patient_name: "María López",
    doctor_name: "Dra. Johnson",
    location: "Laboratorio Norte",
  },
  {
    id: 3,
    code: "GHI789",
    service_name: "Radiografía",
    status: "PENDING",
    date: "2023-10-10",
    patient_name: "Carlos García",
    doctor_name: "Dr. Brown",
    location: "Hospital Sur",
  },
  {
    id: 4,
    code: "JKL012",
    service_name: "Consulta Dental",
    status: "REJECTED",
    date: "2023-10-05",
    patient_name: "Ana Martínez",
    doctor_name: "Dra. Wilson",
    location: "Clínica Dental",
  },
]);
if (vouchers) {
  allVouchers.value = vouchers.value;
  useRefreshToken();
}

const applyFilter = (statusFilter, tabNumber) => {
  let filteredVouchers = allVouchers.value;
  if (statusFilter !== "ALL") {
    filteredVouchers = filteredVouchers.filter(
      (voucher) => voucher.status === statusFilter,
    );
  }
  vouchers.value = filteredVouchers;
  tab.value = tabNumber;
};
</script>

<template>
  <NuxtLayout name="pacientes-dashboard">
    <div v-if="loading"></div>
    <main v-else class="bg-light" style="min-height: 100vh">
      <section class="p-5">
        <p>
          <span class="fw-semibold fs-5">Mis Váuchers</span>
        </p>

        <div class="d-flex align-items-end justify-content-between mb-4">
          <ul class="nav nav-underline d-flex flex-row w-100">
            <li class="nav-item">
              <button
                class="nav-link"
                :class="tab === 1 ? 'active' : 'border-0'"
                @click="applyFilter('ALL', 1)"
              >
                Todas las citas
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link"
                :class="tab === 2 ? 'active' : 'border-0'"
                @click="applyFilter('APPROVED', 2)"
              >
                Utilizadas
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link"
                :class="tab === 3 ? 'active' : 'border-0'"
                @click="applyFilter('PENDING', 3)"
              >
                Pendientes de Aprobación
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link"
                :class="tab === 4 ? 'active' : 'border-0'"
                @click="applyFilter('REJECTED', 4)"
              >
                Rechazados
              </button>
            </li>
          </ul>
          <WebsiteSolicitarVaucher />
        </div>

        <div class="row mb-4">
          <div class="col-auto">
            <div class="input-group shadow-sm">
              <span
                class="input-group-text bg-transparent border-end-0 rounded-start-3"
                id="basic-addon1"
              >
                <AtomsIconsSearchIcon />
              </span>
              <input
                type="text"
                class="form-control border-start-0 rounded-end-3"
                placeholder="Buscar"
                aria-label="Buscar"
                aria-describedby="basic-addon1"
              />
            </div>
          </div>
          <div class="col-auto ms-auto d-flex">
            <div class="dropdown">
              <button
                class="btn btn-outline-dark dropdown-toggle bg-white"
                @click="sort = !sort"
                type="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Ordenar por
              </button>
              <ul class="dropdown-menu" :class="sort ? 'show' : ''">
                <li><a class="dropdown-item" href="#">Action</a></li>
                <li><a class="dropdown-item" href="#">Another action</a></li>
                <li>
                  <a class="dropdown-item" href="#">Something else here</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="card">
          <PacientesVauchersTable :vouchers="vouchers" />
        </div>
      </section>
    </main>
  </NuxtLayout>
</template>
