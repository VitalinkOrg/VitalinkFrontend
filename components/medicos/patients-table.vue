<script>
export default {
  props: {
    patients: {
      type: Object,
      default: [],
    },
  },
  data() {
    return {
      openUserModal: false,
      openDateModal: false,
      openDateCancelModal: false,
      modalData: null,
    };
  },
  methods: {
    showUserDetails(appointment) {
      this.modalData = appointment;
      this.openUserModal = true;
    },
    showDateDetails(appointment) {
      this.modalData = appointment;
      this.openDateModal = true;
    },
    showDateCancel(appointment) {
      this.modalData = appointment;
      this.openDateCancelModal = true;
    },
    closeModal() {
      this.modalData = null;
      this.openUserModal = false;
      this.openDateModal = false;
      this.openDateCancelModal = false;
    },
  },
};
</script>
<template>
  <div class="card shadow rouded-3 border-0 p-3">
    <div class="table-responsive" v-if="patients !== null">
      <table class="table fw-light">
        <thead>
          <tr>
            <th scope="col"></th>
            <th scope="col" class="text-muted">ID</th>
            <th scope="col" class="text-muted">Nombre</th>
            <th scope="col" class="text-muted">Dirección</th>
            <th scope="col" class="text-muted">Teléfono de contacto</th>
            <th scope="col" class="text-muted">Correo electrónico</th>
            <th scope="col" class="text-muted"></th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="patient in patients" :key="patient.patient_id">
            <td style="vertical-align: middle">
              <div class="form-check">
                <input
                  class="form-check-input border-dark"
                  type="checkbox"
                  value=""
                  :id="patients.id"
                />
                <!-- <label class="form-check-label" for="flexCheckDefault"></label> -->
              </div>
            </td>
            <td style="vertical-align: middle">{{ patient.patient_id }}</td>
            <td style="vertical-align: middle">
              <span class="me-2">
                <img src="@/src/assets/img-avatar-sm.png" alt="avatar" />
              </span>
              {{ patient.patient_name }}
            </td>
            <td style="vertical-align: middle">
              {{ patient.patient_address }}
            </td>
            <td style="vertical-align: middle">{{ patient.patient_phone }}</td>
            <td style="vertical-align: middle">{{ patient.patient_email }}</td>
            <td style="vertical-align: middle">
              <div class="dropdown">
                <AtomsIconsThreeDotsHorizontalIcon
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  class="cursor-pointer"
                />
                <ul class="dropdown-menu">
                  <li>
                    <button
                      class="dropdown-item"
                      @click="showUserDetails(appointment)"
                    >
                      Ver Usuario
                    </button>
                  </li>
                  <li>
                    <button
                      class="dropdown-item"
                      @click="showDateDetails(appointment)"
                    >
                      Ver Cita
                    </button>
                  </li>
                  <li>
                    <button
                      class="dropdown-item"
                      @click="showDateCancel(appointment)"
                    >
                      Cancelar Cita
                    </button>
                  </li>
                  <!-- <li>
                  <a class="dropdown-item" href="#">Descargar Resumen</a>
                </li> -->
                </ul>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="card border-0 shadow rounded-3 py-4 h-100">
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
          <button class="btn btn-primary btn-sm mt-2 rounded-3">Empezar</button>
        </p>
      </div>
    </div>

    <div class="card-footer bg-transparent justify-content-end d-flex border-0">
      <nav>
        <ul class="pagination m-0">
          <li class="page-item">
            <button
              class="page-link border-0 text-nowrap"
              @click="getCitas()"
              aria-label="Previous"
            >
              <span aria-hidden="true">&laquo; Anterior</span>
            </button>
          </li>
          <li class="page-item">
            <button
              class="page-link border-0 shadow-sm mx-1 bg-light"
              @click="getCitas()"
            >
              1
            </button>
          </li>
          <li class="page-item">
            <button
              class="page-link border-0 shadow-sm mx-1 bg-light"
              @click="getCitas()"
            >
              2
            </button>
          </li>
          <li class="page-item">
            <button
              class="page-link border-0 shadow-sm mx-1 bg-light"
              @click="getCitas()"
            >
              3
            </button>
          </li>
          <li class="page-item">
            <button
              class="page-link border-0 text-nowrap"
              @click="getCitas()"
              aria-label="Next"
            >
              <span aria-hidden="true">Siguiente &raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
    <MedicosUserModal
      :open="openUserModal"
      :appointment="modalData"
      @close-modal="closeModal"
    />
    <MedicosCitaModal
      :open="openDateModal"
      :appointment="modalData"
      @close-modal="closeModal"
    />
    <MedicosCitaCancelModal
      :open="openDateCancelModal"
      :appointment="modalData"
      @close-modal="closeModal"
    />
  </div>
</template>
<style>
.cursor-pointer:hover {
  cursor: pointer;
}
</style>
