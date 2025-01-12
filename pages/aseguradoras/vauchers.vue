<script setup>
definePageMeta({
  middleware: ["auth-insurances"],
});
const config = useRuntimeConfig();
const token = useCookie("token");

// const { data: vouchers, pending: pendingVouchers } = await useFetch(
//   config.public.API_BASE_URL + "/insurance_dashboard/list_vouchers",
//   {
//     headers: { Authorization: token.value },
//     transform: (_vouchers) => _vouchers.data,
//   },
// );
const vouchers = [
  {
    voucher_id: 1,
    code: "001",
    patient_name: "Juan Pérez",
    insurance_number: "123456",
    reason_for_request: "Consulta General",
    due_date: "2023-12-31",
    status: "Activo",
    address: "Calle Falsa 123",
    phone_number: "+506 1234-5678",
    city: "San José",
    postal_code: "1000",
    comment_by_insurance: "Aprobado",
  },
  {
    voucher_id: 2,
    code: "002",
    patient_name: "María Gómez",
    insurance_number: "654321",
    reason_for_request: "Examen de Sangre",
    due_date: "2023-11-30",
    status: "Vencido",
    address: "Avenida Siempre Viva 742",
    phone_number: "+506 8765-4321",
    city: "Cartago",
    postal_code: "2000",
    comment_by_insurance: "Rechazado",
  },
  {
    voucher_id: 3,
    code: "003",
    patient_name: "Carlos Rodríguez",
    insurance_number: "789012",
    reason_for_request: "Radiografía",
    due_date: "2023-10-15",
    status: "Pendiente",
    address: "Boulevard de los Sueños Rotos 456",
    phone_number: "+506 2345-6789",
    city: "Alajuela",
    postal_code: "3000",
    comment_by_insurance: "En revisión",
  },
  {
    voucher_id: 4,
    code: "004",
    patient_name: "Ana Fernández",
    insurance_number: "345678",
    reason_for_request: "Cirugía",
    due_date: "2023-09-20",
    status: "Aprobado",
    address: "Calle de la Amargura 789",
    phone_number: "+506 3456-7890",
    city: "Heredia",
    postal_code: "4000",
    comment_by_insurance: "Aprobado con condiciones",
  },
  {
    voucher_id: 5,
    code: "005",
    patient_name: "Luis Martínez",
    insurance_number: "901234",
    reason_for_request: "Terapia Física",
    due_date: "2023-08-25",
    status: "Rechazado",
    address: "Avenida Central 101",
    phone_number: "+506 4567-8901",
    city: "Puntarenas",
    postal_code: "5000",
    comment_by_insurance: "Falta documentación",
  },
];
</script>

<template>
  <NuxtLayout name="aseguradoras-dashboard">
    <nav style="--bs-breadcrumb-divider: &quot;/&quot;" aria-label="breadcrumb">
      <ol class="breadcrumb">
        <li class="breadcrumb-item">
          <NuxtLink href="/aseguradoras/inicio" class="text-muted"
            >Inicio</NuxtLink
          >
        </li>
        <li class="breadcrumb-item active fw-semibold" aria-current="page">
          Gestor de Váuchers
        </li>
      </ol>
    </nav>
    <p>
      <span class="fw-medium fs-4">Listado de Váuchers</span>
    </p>

    <div class="d-flex align-items-end justify-content-between mb-4">
      <ul class="nav nav-underline d-flex flex-row w-100">
        <li class="nav-item">
          <button class="nav-link active">Todos</button>
        </li>
        <li class="nav-item">
          <button class="nav-link">Utilizados</button>
        </li>
        <li class="nav-item">
          <button class="nav-link">Pendientes de aprobación</button>
        </li>
        <li class="nav-item">
          <button class="nav-link">Pendientes de usar</button>
        </li>
        <li class="nav-item">
          <button class="nav-link">Rechazados</button>
        </li>
      </ul>
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
        <button class="btn btn-outline-dark text-nowrap me-2">
          <AtomsIconsDownloadIcon /> Descargar
        </button>
        <div class="dropdown">
          <button
            class="btn btn-outline-dark dropdown-toggle"
            type="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Ordenar por
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#">Action</a></li>
            <li><a class="dropdown-item" href="#">Another action</a></li>
            <li><a class="dropdown-item" href="#">Something else here</a></li>
          </ul>
        </div>
      </div>
    </div>

    <section>
      <p class="mx-2 d-flex align-items-center justify-content-between">
        <span class="fw-semibold fs-5 px-4">Historial</span>
        <!-- <NuxtLink class="btn btn-link text-dark" href="/aseguradoas">Ver Todo [I]</NuxtLink> -->
      </p>
      <div v-if="vouchers !== null" class="card table-responsive">
        <table class="table fw-light">
          <thead>
            <tr>
              <th scope="col"></th>
              <th scope="col" class="text-muted">Código</th>
              <th scope="col" class="text-muted">Nombre del asegurado</th>
              <th scope="col" class="text-muted">Nº de Asegurado</th>
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
              :selectable="true"
            />
          </tbody>
        </table>
      </div>
      <div v-else class="card border-0 shadow rounded-3 py-4">
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
    </section>
  </NuxtLayout>
</template>
