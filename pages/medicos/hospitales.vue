<script setup>
/*definePageMeta({
  middleware: ["auth-doctors-hospitals"],
});*/
import { ref, defineProps } from "vue";
const open = ref(false);
const remove = ref(false);
const selectedHospital = ref(null); // To track which hospital is being edited
const config = useRuntimeConfig();
// const user_info = useCookie("user_info");
const user_info = {
  value: {
    hospitals: [1, 3],
  },
};

// Mocked hospitals data matching your modal fields
const hospitals = {
  value: [
    {
      id: 1,
      name: "Hospital General de San José",
      address: "Avenida Central",
      streetNumber: "100",
      postalCode: "10101",
      city: "San José",
      country: "Costa Rica",
      floor: "3",
      doorNumber: "12",
      country_iso_code: "CR",
      phone_number_1: "2222-5555",
    },
    {
      id: 2,
      name: "Clínica Bíblica",
      address: "Calle Los Lagos",
      streetNumber: "45",
      postalCode: "10103",
      city: "San José",
      country: "Costa Rica",
      floor: "2",
      doorNumber: "5",
      country_iso_code: "CR",
      phone_number_1: "2522-1000",
    },
    {
      id: 3,
      name: "Hospital México",
      address: "Calle de la Salud",
      streetNumber: "200",
      postalCode: "10107",
      city: "San José",
      country: "Costa Rica",
      floor: "1",
      doorNumber: "1",
      country_iso_code: "CR",
      phone_number_1: "2233-4455",
    },
  ],
};

const filteredArray = hospitals.value.filter((item) =>
  user_info.value.hospitals.includes(item.id)
);

const openEditModal = (hospital) => {
  selectedHospital.value = hospital;
  open.value = true;
};

const openRemoveModal = (hospital) => {
  selectedHospital.value = hospital;
  remove.value = true;
};

const openAddModal = () => {
  selectedHospital.value = null;
  open.value = true;
};
</script>

<template>
  <NuxtLayout name="medicos-dashboard">
    <div v-if="pendingHospitals"></div>
    <div v-else>
      <nav
        style="--bs-breadcrumb-divider: &quot;/&quot;"
        aria-label="breadcrumb"
      >
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <NuxtLink href="/socio-financiero/inicio" class="text-muted"
              >Inicio</NuxtLink
            >
          </li>
          <li class="breadcrumb-item active fw-semibold" aria-current="page">
            Hospitales
          </li>
        </ol>
      </nav>
      <p>
        <span class="fw-medium fs-4">Mis Hospitales</span>
      </p>

      <div class="row mb-2">
        <div class="col-10">
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
        <div class="col-2 ms-auto d-flex">
          <div class="dropdown me-2 w-100">
            <button
              class="btn btn-outline-dark dropdown-toggle w-100"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Ordenar por
            </button>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#">Nombre</a></li>
              <li><a class="dropdown-item" href="#">Ciudad</a></li>
              <li><a class="dropdown-item" href="#">Reciente</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div class="fw-light text-muted mb-4">
        Listado de hospitales donde tendrás disponibilidad para atender a sus
        pacientes
      </div>
      <div class="row" v-if="filteredArray !== null">
        <div class="col">
          <div
            class="card shadow border-0 rounded-4 mb-4"
            v-for="hospital in filteredArray"
            :key="hospital.id"
          >
            <div
              class="card-body py-2 px-4 d-flex justify-content-between align-items-center"
            >
              <div
                class="w-100 d-flex justify-content-between align-items-center"
              >
                <div class="col">
                  <div>
                    <h2 class="h5 fw-semibold my-2">{{ hospital.name }}</h2>
                  </div>
                  <p class="fw-light text-muted d-flex align-items-center mb-0">
                    {{
                      hospital.address +
                      " " +
                      hospital.streetNumber +
                      ", " +
                      hospital.city +
                      ", " +
                      hospital.country
                    }}
                  </p>
                  <p class="fw-light text-muted d-flex align-items-center mb-0">
                    Piso {{ hospital.floor }} - Puerta {{ hospital.doorNumber }}
                  </p>
                </div>
                <div class="d-flex align-items-center gap-2">
                  <button
                    class="btn btn-outline-secondary"
                    @click="openEditModal(hospital)"
                  >
                    <img src="@/src/assets/edit.svg" alt="Editar Hospital" />
                  </button>
                  <button
                    class="btn btn-outline-secondary"
                    @click="openRemoveModal(hospital)"
                  >
                    <img
                      src="@/src/assets/remove.svg"
                      alt="Eliminar Hospital"
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
          <button class="btn btn-info text-white" @click="openAddModal">
            <small class="text-white"> + Agregar </small>
          </button>
        </div>
      </div>
    </div>
    <WebsiteAgregarHospitalModal
      :isOpen="open"
      @close="open = false"
      :hospitalInfo="selectedHospital"
      @add-hospital="handleAddHospital"
      @edit-hospital="handleEditHospital"
    />
    <WebsiteRemoverHospitalModal
      :isOpen="remove"
      @close="remove = false"
      @remove-hospital="handleRemoveHospital"
    />
  </NuxtLayout>
</template>
