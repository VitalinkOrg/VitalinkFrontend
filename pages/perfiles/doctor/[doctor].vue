<script setup>
definePageMeta({
  middleware: ["auth-pacientes"],
});
const config = useRuntimeConfig();
const token = useCookie("token");
const route = useRoute();
const { data: doctorData, pending } = await useLazyFetch(
  config.public.API_BASE_URL + "/supplier/get",
  {
    headers: { Authorization: token.value },
    params: {
      id: route.params.doctor,
    },
    transform: (_doctor) => _doctor.data,
  }
);

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
</script>

<template>
  <NuxtLayout name="web">
    <main class="main-content">
      <div class="main-container">
        <div class="navigation-container">
          <NuxtLink to="/pacientes/inicio" class="return-link">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.9617 4.5L7.03857 10L12.9617 15.5"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>

            Volver
          </NuxtLink>
          <!-- Breadcrumb -->
          <div class="breadcrumb-container">
            <nav aria-label="breadcrumb">
              <ol class="breadcrumb-list">
                <li class="breadcrumb-item">
                  <NuxtLink to="/" class="breadcrumb-link">Inicio</NuxtLink>
                </li>

                <li class="breadcrumb-separator">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clip-path="url(#clip0_5929_15207)">
                      <path
                        d="M2.03835 10.5L7.96143 5L2.03835 -0.5"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_5929_15207">
                        <rect width="10" height="10" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </li>

                <li class="breadcrumb-item">
                  <a href="javascript:history.back()" class="breadcrumb-link">
                    Resultados de búsqueda
                  </a>
                </li>

                <li class="breadcrumb-separator">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <g clip-path="url(#clip0_5929_15207)">
                      <path
                        d="M2.03835 10.5L7.96143 5L2.03835 -0.5"
                        stroke="currentColor"
                        stroke-width="1.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_5929_15207">
                        <rect width="10" height="10" fill="white" />
                      </clipPath>
                    </defs>
                  </svg>
                </li>

                <li class="breadcrumb-item active">Perfil médico</li>
              </ol>
            </nav>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="pending" class="loading-container">
          <div class="loading-wrapper">
            <div class="loading-spinner">
              <div class="spinner-ring"></div>
              <div class="spinner-ring"></div>
              <div class="spinner-ring"></div>
            </div>
            <div class="loading-content">
              <h3 class="loading-title">Cargando perfil médico</h3>
              <p class="loading-description">
                Obteniendo información del doctor...
              </p>
            </div>
          </div>
        </div>

        <!-- Main content -->
        <div v-else class="content-wrapper">
          <div class="sidebar-column">
            <div class="profile-card">
              <div class="profile-card-body">
                <img
                  :src="doctorData.profile_picture_url"
                  alt="Foto del doctor"
                  class="profile-card-body__image"
                />

                <div class="profile-card-body__info-wrapper">
                  <!-- Rating -->
                  <div class="profile-card-body__rating-info">
                    <span class="profile-card-body__rating-score">
                      5.0
                      <AtomsIconsStarFilled color="#FFD835" size="20" />
                    </span>
                    <span class="profile-card-body__review-count"
                      >(13 Reseñas)</span
                    >
                  </div>
                  <h2 class="profile-card-body__doctor-name">
                    {{ doctorData.name }}
                  </h2>
                  <h2 class="profile-card-body__doctor-specialty">
                    {{
                      doctorData.services[0]?.medical_specialty?.name ||
                      "Sin especialidad"
                    }}
                  </h2>
                  <h2 class="profile-card-body__enrollment-number">
                    Nº de Colegiado: {{ doctorData.num_medical_enrollment }}
                  </h2>
                  <div class="profile-card-body__badge-wrapper">
                    <span
                      class="profile-card-body__badge"
                      v-for="service in doctor.servicesResult"
                      :key="service.doctor_service_id"
                      >{{ service.specialty }}</span
                    >
                  </div>
                </div>

                <div class="profile-card-body__contact-info">
                  <a
                    :href="`tel:${doctorData.phone_number}`"
                    class="profile-card-body__contact-link"
                    ><AtomsIconsPhoneIcon />
                  </a>
                  <a
                    :href="`mailto:${doctorData.email}`"
                    class="profile-card-body__contact-link"
                    ><AtomsIconsMailIcon
                  /></a>
                  <a
                    :href="`mailto:${doctorData.email}`"
                    class="profile-card-body__contact-link"
                    ><AtomsIconsMapPointerIcon
                  /></a>
                </div>
                <div class="profile-card-body__additional-info">
                  <p class="profile-card-body__address">
                    <small v-if="doctor">
                      <AtomsIconsMapPointerIcon />
                      {{
                        doctorData.street_number +
                        " " +
                        doctorData.address +
                        ", " +
                        doctorData.city_name +
                        ", " +
                        doctorData.country_iso_code
                      }}
                    </small>
                  </p>
                  <div class="profile-card-body__statistics">
                    <div class="profile-card-body__statistics-card">
                      <p class="profile-card-body__statistics-card-title">
                        Experiencia
                      </p>
                      <p class="profile-card-body__statistics-card-highlight">
                        +{{ doctorData.experience_years }} años
                      </p>
                    </div>
                    <div class="profile-card-body__statistics-card">
                      <p class="profile-card-body__statistics-card-title">
                        Pacientes
                      </p>
                      <p class="profile-card-body__statistics-card-highlight">
                        +{{ doctorData.patients_number }}
                      </p>
                    </div>
                  </div>
                  <!-- More Photos Section -->
                  <div class="profile-card-body__photos-section">
                    <div class="profile-card-body__photos-section-row">
                      <img
                        src="@/src/assets/img-clinica-thumbnail-md.png"
                        alt=""
                        @click="openModal"
                      />
                      <img
                        src="@/src/assets/img-clinica-thumbnail-md.png"
                        alt=""
                        @click="openModal"
                      />
                      <img
                        src="@/src/assets/img-clinica-thumbnail-md.png"
                        alt=""
                        @click="openModal"
                      />
                      <img
                        src="@/src/assets/img-clinica-thumbnail-md.png"
                        alt=""
                        @click="openModal"
                      />
                    </div>
                    <a
                      href="#"
                      class="profile-card-body__more-photos-link"
                      @click="openModal"
                      >Ver más Fotos</a
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-sm-9">
            <div class="card shadow border-0" style="height: 100%">
              <div class="card-body">
                <h3 class="fw-semibold fs-6">Detalles y Agenda</h3>
                <p class="fw-light text-muted">
                  Descubre el perfil completo de esta clínica, encuentra toda la
                  información relevante y reserva citas fácilmente para tu
                  atención médica personalizada.
                </p>

                <WebsiteDoctorNav :doctor="doctorData" />
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

<style lang="scss" scoped>
// Loading Styles
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  width: 100%;
  background-color: #f8f8f8;
  padding: 2rem;
}

.loading-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  border-radius: 24px;
  padding: 3rem 2rem;
  box-shadow: 0px 20px 24px 0px #14253f0f;
  box-shadow: 0px 0px 1px 0px #0c1a4b1a;
  min-width: 320px;
}

.loading-spinner {
  position: relative;
  width: 80px;
  height: 80px;
  margin-bottom: 1.5rem;
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-radius: 50%;

  &:nth-child(1) {
    border-top-color: #3541b4;
    animation: spin 1.5s linear infinite;
  }

  &:nth-child(2) {
    border-top-color: #0cadbb;
    animation: spin 1.5s linear infinite;
    animation-delay: -0.5s;
    width: 60px;
    height: 60px;
    top: 10px;
    left: 10px;
  }

  &:nth-child(3) {
    border-top-color: #ebecf7;
    animation: spin 1.5s linear infinite;
    animation-delay: -1s;
    width: 40px;
    height: 40px;
    top: 20px;
    left: 20px;
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-content {
  text-align: center;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #19213d;
  margin-bottom: 0.5rem;
  font-family: inherit;
}

.loading-description {
  font-size: 1rem;
  color: #6d758f;
  margin: 0;
  font-weight: 400;
  opacity: 0.8;
}

// Responsive loading
@media (max-width: 768px) {
  .loading-wrapper {
    padding: 2rem 1.5rem;
    min-width: 280px;
  }

  .loading-spinner {
    width: 60px;
    height: 60px;
  }

  .loading-title {
    font-size: 1.25rem;
  }

  .loading-description {
    font-size: 0.9rem;
  }
}

// Existing styles
.navigation-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;

  .return-link {
    display: flex;
    align-items: center;
    color: #19213d;
    font-size: 14px;
    text-decoration: none;
    font-weight: 300;

    svg {
      margin-right: 7px;
      stroke: #353e5c;
    }

    &:hover {
      color: #3541b4;
    }
  }
}

.breadcrumb-container {
  margin-bottom: 1rem;
}

.breadcrumb-list {
  list-style: none;
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  font-weight: 300;
  font-family: inherit;

  .breadcrumb-item {
    color: #6d758f;
    font-size: 14px;

    &.active {
      color: #19213d;
    }

    &:not(.active) {
      .breadcrumb-link {
        text-decoration: none;
        color: #6d758f;
        transition: color 0.2s;

        &:hover {
          color: #3541b4;
        }
      }
    }
  }

  .breadcrumb-separator {
    display: flex;
    align-items: center;
    margin: 0 8px;

    svg {
      width: 10px;
      height: 10px;
      stroke: #353e5c;
    }
  }
}

.main-content {
  background-color: #f8f8f8;
  padding-top: 2rem;
  padding-bottom: 5rem;
  .main-container {
    max-width: 1320px;
    margin: 0 auto;

    .content-wrapper {
      display: flex;
      gap: 1rem;

      .sidebar-column {
        display: flex;
        background-color: #ffffff;
        border-radius: 20px;
        justify-content: space-between;
        padding: 20px;
        width: 423px;
        box-shadow: 0px 20px 24px 0px #14253f0f;
        box-shadow: 0px 0px 1px 0px #0c1a4b1a;

        .profile-card {
          .profile-card-body {
            &__image {
              width: 370px;
              height: 248px;
              border-radius: 26px;
              object-fit: cover;
              object-position: 0% 25%;
            }

            &__info-wrapper {
              display: flex;
              flex-direction: column;
              gap: 15px;
              padding: 10px;
            }

            &__rating-info {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              margin-top: 0.5rem;
            }

            &__rating-score {
              font-weight: 600;
              font-size: 14.7px;
              line-height: 25.21px;
              color: #353e5c;
            }

            &__review-count {
              display: flex;
              align-items: center;
              font-weight: 300;
              font-size: 13.65px;
              line-height: 25.21px;
              color: #6d758f;
            }

            &__doctor-name {
              font-weight: 600;
              font-style: Semi Bold;
              font-size: 24px;
              line-height: 25.21px;
              color: #19213d;
            }

            &__doctor-specialty {
              font-weight: 600;
              font-size: 16px;
              line-height: 25.21px;
              color: #19213d;
            }

            &__enrollment-number {
              font-weight: 500;
              font-size: 16px;
              line-height: 25.21px;
              color: #6d758f;
            }

            &__badge-wrapper {
              display: flex;
              flex-wrap: wrap;
              gap: 0.5rem;
            }

            &__badge {
              font-weight: 500;
              font-size: 12px;
              line-height: 18px;
              text-align: center;
              padding: 2px 8px;
              color: #3541b4;
              background-color: #ebecf7;
              display: inline-block;
              border-radius: 16px;
            }

            &__contact-info {
              padding: 10px;
              display: flex;
              gap: 14px;
            }

            &__contact-link {
              display: flex;
              align-items: center;
              justify-content: center;
              width: 40px;
              height: 40px;
              border-radius: 11px;
              background-color: #0cadbb;
              color: #fff;
              box-shadow: 0px 14.85px 23.76px 0px #14253f0f;
              box-shadow: 0px 0px 1.48px 0px #0c1a4b1a;

              &:hover {
                background-color: darken(#0cadbb, 0.5);
              }

              svg {
                width: 20px;
                height: 20px;
              }
            }

            &__additional-info {
              display: flex;
              flex-direction: column;
              padding: 10px;
              gap: 15px;
            }

            &__address {
              font-weight: 500;
              font-size: 14px;
              line-height: 25.21px;
              color: #6d758f;
            }

            &__statistics {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 1rem;
              margin-top: 1rem;
            }

            &__statistics-card {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border-radius: 20px;
              padding: 20px;
              background: #ebecf780;
              border: 1px solid #ebecf7;
            }

            &__statistics-card-title {
              font-weight: 400;
              line-height: 24px;
              color: #6d758f;
            }

            &__statistics-card-highlight {
              font-weight: 700;
              font-size: 24px;
              line-height: 24px;
              color: #3541b4;
            }

            &__photos-section {
              border-radius: 20px;
              padding: 10px 12px;
              background-color: #f1f3f7;
            }

            &__photos-section-row {
              display: flex;
              flex-wrap: nowrap;
              gap: 17px;
              overflow-x: auto;

              img {
                width: 72px;
                height: 69px;
                border-radius: 20px;
                border: 3px solid #ffffff80;
                flex-shrink: 0;
              }
            }

            &__more-photos-link {
              text-align: center;
              width: 100%;
              font-weight: 600;
              font-size: 16px;
              line-height: 24px;
              background-color: #ffffff;
              border: 1px solid #d0d5dd;
              display: inline-block;
              margin-top: 10px;
              box-shadow: 0px 1px 2px 0px #1018280d;
              padding: 12px 20px;
              border-radius: 8px;
              text-decoration: none;
              color: inherit;

              &:hover {
                background-color: #fafafa;
              }
            }
          }
        }
      }
    }
  }
}

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
