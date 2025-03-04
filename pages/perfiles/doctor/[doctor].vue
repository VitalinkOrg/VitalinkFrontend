<script setup>
// const config = useRuntimeConfig();
// const route = useRoute();
// const { data: doctor, pending } = await useLazyFetch(
//   config.public.API_BASE_URL + "/patient_dashboard/doctor_profile",
//   {
//     params: {
//       doctor_id: route.params.doctor,
//     },
//     transform: (_doctor) => _doctor.data,
//   },
// );

const isModalOpen = ref(false);

const openModal = () => {
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const doctor = ref({
  doctor_information: {
    personal: {
      first_name: "John",
      last_name: "Doe",
      phone_number: "+15551234567",
      email: "john.doe@example.com",
      address: "123 Main St",
      city: "Anytown",
      country_iso_code: "US",
      code: "4646225732",
    },
  },
  servicesResult: [
    { doctor_service_id: 1, specialty: "Cardiology" },
    { doctor_service_id: 2, specialty: "Internal Medicine" },
  ],
});

const pending = ref(false); // Mock pending state
</script>

<template>
  <NuxtLayout name="web">
    <main class="pt-2 pb-5">
      <div class="container-fluid">
        <div class="d-flex align-items-center mb-2">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb m-0">
              <li class="breadcrumb-item"></li>
              <li class="breadcrumb-item">
                <NuxtLink href="/" class="text-decoration-none"
                  >Inicio</NuxtLink
                >
              </li>
              <a
                href="javascript:history.back()"
                class="breadcrumb-item text-decoration-none"
                >Resultados de búsqueda</a
              >
              <li class="breadcrumb-item active" aria-current="page">
                Perfil médico
              </li>
            </ol>
          </nav>
        </div>
        <div v-if="pending">Loading clinica...</div>
        <div v-else class="row">
          <div class="col-sm-4">
            <div class="card shadow border-0">
              <div class="card-body text-left">
                <img
                  src="@/src/assets/img-clinica-thumbnail-md.png"
                  alt=""
                  class="img-fluid mb-3"
                />
                <div>
                  <small>
                    <span class="fw-semibold me-2">
                      5.0
                      <AtomsIconsStarFilled />
                    </span>
                    <span class="text-muted">13 Reseñas</span>
                  </small>
                </div>
                <h2 class="h5 fw-semibold my-2">
                  {{
                    doctor.doctor_information.personal.first_name +
                    " " +
                    doctor.doctor_information.personal.last_name
                  }}
                </h2>
                <h2 class="h5 fw-semibold my-2 text-muted">
                  Nº de Colegiado: {{ doctor.doctor_information.personal.code }}
                </h2>
                <span
                  class="badge bg-primary text-primary me-2 rounded-5 text-capitalize"
                  style="--bs-bg-opacity: 0.07"
                  v-for="service in doctor.servicesResult"
                  :key="service.doctor_service_id"
                  >{{ service.specialty }}</span
                >

                <div class="my-2">
                  <a
                    :href="`tel:${doctor.doctor_information.personal.phone_number}`"
                    class="badge bg-info rounded-2 mx-1 p-2"
                    ><AtomsIconsPhoneIcon
                  /></a>
                  <a
                    :href="`mailto:${doctor.doctor_information.personal.email}`"
                    class="badge bg-info rounded-2 mx-1 p-2"
                    ><AtomsIconsMailIcon
                  /></a>
                  <a
                    :href="`mailto:${doctor.doctor_information.personal.email}`"
                    class="badge bg-info rounded-2 mx-1 p-2"
                    ><AtomsIconsMapPointerIcon
                  /></a>
                </div>
                <p class="card-text py-2 text-muted fw-light">
                  <small v-if="doctor">
                    <AtomsIconsMapPointerIcon />
                    {{
                      doctor.doctor_information.personal.address +
                      ", " +
                      doctor.doctor_information.personal.city +
                      ", " +
                      doctor.doctor_information.personal.country_iso_code
                    }}
                  </small>
                </p>
                <div class="row row-cols-2">
                  <div class="col">
                    <div
                      class="card bg-primary rounded-4 border-0"
                      style="--bs-bg-opacity: 0.05"
                    >
                      <div class="card-body py-2">
                        <p class="text-muted m-0 text-center">Experiencia</p>
                        <p
                          class="fw-semibold text-primary text-center m-0 fs-5"
                        >
                          +10 años
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="col">
                    <div
                      class="card bg-primary rounded-4 border-0"
                      style="--bs-bg-opacity: 0.05"
                    >
                      <div class="card-body py-2">
                        <p class="text-muted m-0 text-center">Pacientes</p>
                        <p
                          class="fw-semibold text-primary text-center m-0 fs-5"
                        >
                          +1000
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- More Photos Section -->
                <div class="mt-3">
                  <h3 class="h6 fw-semibold">Más Fotos</h3>
                  <div class="row">
                    <div class="col-4 mb-2">
                      <img
                        src="@/src/assets/img-clinica-thumbnail-md.png"
                        alt=""
                        class="img-fluid rounded"
                        @click="openModal"
                      />
                    </div>
                    <div class="col-4 mb-2">
                      <img
                        src="@/src/assets/img-clinica-thumbnail-md.png"
                        alt=""
                        class="img-fluid rounded"
                        @click="openModal"
                      />
                    </div>
                    <div class="col-4 mb-2">
                      <img
                        src="@/src/assets/img-clinica-thumbnail-md.png"
                        alt=""
                        class="img-fluid rounded"
                        @click="openModal"
                      />
                    </div>
                  </div>
                  <a
                    href="#"
                    class="text-decoration-none btn btn-outline-dark me-2 w-100"
                    @click="openModal"
                    >Ver más Fotos</a
                  >
                </div>
              </div>
            </div>
          </div>
          <div class="col-sm-8">
            <div class="card shadow border-0" style="height: 100%">
              <div class="card-body">
                <h3 class="fw-semibold fs-6">Detalles y Agenda</h3>
                <p class="fw-light text-muted">
                  Descubre el perfil completo de esta clínica, encuentra toda la
                  información relevante y reserva citas fácilmente para tu
                  atención médica personalizada.
                </p>

                <WebsiteDoctorNav :doctor="doctor" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal for Additional Photos -->
      <div
        class="modal fade"
        :class="{ show: isModalOpen }"
        tabindex="-1"
        aria-labelledby="photoModalLabel"
        aria-hidden="true"
        v-if="isModalOpen"
      >
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="photoModalLabel">Más Fotos</h5>
              <button
                type="button"
                class="btn-close"
                @click="closeModal"
              ></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-4 mb-2">
                  <img
                    src="@/src/assets/img-clinica-thumbnail-md.png"
                    alt=""
                    class="img-fluid rounded"
                  />
                </div>
                <div class="col-4 mb-2">
                  <img
                    src="@/src/assets/img-clinica-thumbnail-md.png"
                    alt=""
                    class="img-fluid rounded"
                  />
                </div>
                <div class="col-4 mb-2">
                  <img
                    src="@/src/assets/img-clinica-thumbnail-md.png"
                    alt=""
                    class="img-fluid rounded"
                  />
                </div>
                <!-- Add more images as needed -->
              </div>
            </div>
            <div class="modal-footer">
              <button
                type="button"
                class="btn btn-secondary"
                @click="closeModal"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        class="modal-backdrop fade"
        :class="{ show: isModalOpen }"
        v-if="isModalOpen"
      ></div>
    </main>
  </NuxtLayout>
</template>

<style scoped>
.modal {
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
}
.modal.show {
  display: block;
}
.modal-backdrop.show {
  opacity: 0.5;
}
</style>
