<script setup>
import BarraLateralDoctor from "@/components/website/perfil-doctor/barra-lateral-doctor.vue";
import CarruselFotosAdicionales from "@/components/website/perfil-doctor/carrusel-fotos-adicionales.vue";
import PantallaCarga from "@/components/website/perfil-doctor/pantalla-carga.vue";

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
        <PantallaCarga v-if="pending" />

        <!-- Main content -->
        <div v-else class="content-wrapper">
          <BarraLateralDoctor
            :doctor-data="doctorData"
            :doctor="doctor"
            @open-modal="openModal"
          />

          <div class="details-column">
            <div class="details-card">
              <div class="details-card-body">
                <h3 class="details-title">Detalles y Agenda</h3>
                <p class="details-description">
                  Descubre el perfil completo de esta clínica, encuentra toda la
                  información relevante y reserva citas fácilmente para tu
                  atención médica personalizada.
                </p>
                <WebsitePerfilDoctorTabs :doctor="doctorData" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Image Carousel -->
      <CarruselFotosAdicionales :is-open="isModalOpen" @close="closeModal" />
    </main>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.navigation-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  margin-bottom: $spacing-md;

  @include respond-to-max(md) {
    flex-direction: column;
    align-items: flex-start;
    gap: $spacing-sm;
  }

  .return-link {
    display: flex;
    align-items: center;
    color: $color-foreground;
    font-size: 14px;
    text-decoration: none;
    font-weight: 300;
    font-family: $font-family-main;

    @include respond-to-max(sm) {
      font-size: 12px;
    }

    svg {
      margin-right: 7px;
      stroke: #353e5c;

      @include respond-to-max(sm) {
        width: 16px;
        height: 16px;
      }
    }

    &:hover {
      color: $color-primary;
    }
  }
}

.breadcrumb-container {
  margin-bottom: $spacing-md;

  @include respond-to-max(md) {
    margin-bottom: $spacing-sm;
    width: 100%;
  }
}

.breadcrumb-list {
  list-style: none;
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  font-weight: 300;
  font-family: $font-family-main;

  @include respond-to-max(sm) {
    flex-wrap: wrap;
    gap: $spacing-xs;
  }

  .breadcrumb-item {
    color: $color-text-secondary;
    font-size: 14px;

    @include respond-to-max(sm) {
      font-size: 12px;
    }

    &.active {
      color: $color-foreground;
    }

    &:not(.active) {
      .breadcrumb-link {
        text-decoration: none;
        color: $color-text-secondary;
        transition: color 0.2s;

        &:hover {
          color: $color-primary;
        }
      }
    }
  }

  .breadcrumb-separator {
    display: flex;
    align-items: center;
    margin: 0 8px;

    @include respond-to-max(sm) {
      margin: 0 4px;
    }

    svg {
      width: 10px;
      height: 10px;
      stroke: #353e5c;

      @include respond-to-max(sm) {
        width: 8px;
        height: 8px;
      }
    }
  }
}

.main-content {
  background-color: #f8f8f8;
  padding-top: 2rem;
  padding-bottom: 5rem;

  @include respond-to-max(lg) {
    padding-top: 1.5rem;
    padding-bottom: 3rem;
  }

  @include respond-to-max(md) {
    padding-top: 1rem;
    padding-bottom: 2rem;
  }

  .main-container {
    max-width: 1351px;
    margin: 0 auto;
    padding: 0 1rem;

    @include respond-to-max(lg) {
      max-width: 100%;
      padding: 0 $spacing-md;
    }

    @include respond-to-max(md) {
      padding: 0 $spacing-sm;
    }

    @include respond-to-max(sm) {
      padding: 0 $spacing-xs;
    }

    .content-wrapper {
      display: flex;
      gap: 1.5rem;

      @include respond-to-max(lg) {
        flex-direction: column;
        gap: $spacing-md;
      }

      @include respond-to-max(md) {
        gap: $spacing-sm;
      }

      .details-column {
        flex: 1;

        .details-card {
          background-color: #ffffff;
          border-radius: 20px;
          box-shadow: 0px 20px 24px 0px #14253f0f;
          box-shadow: 0px 0px 1px 0px #0c1a4b1a;
          height: 100%;

          @include respond-to-max(md) {
            border-radius: 16px;
          }

          @include respond-to-max(sm) {
            border-radius: 12px;
          }

          .details-card-body {
            padding: 2rem;

            @include respond-to-max(lg) {
              padding: 1.5rem;
            }

            @include respond-to-max(md) {
              padding: $spacing-md;
            }

            @include respond-to-max(sm) {
              padding: $spacing-sm;
            }

            .details-title {
              color: $color-foreground;
              margin-bottom: 10px;
              font-family: $font-family-main;
              font-weight: 600;
              font-size: 20px;
              line-height: 28.5px;

              @include respond-to-max(lg) {
                font-size: 1.375rem;
              }

              @include respond-to-max(md) {
                font-size: 1.25rem;
                margin-bottom: $spacing-sm;
              }

              @include respond-to-max(sm) {
                font-size: 1.125rem;
              }
            }

            .details-description {
              color: $color-text-secondary;
              font-weight: 300;
              line-height: 1.6;
              margin-bottom: 20px;
              font-family: $font-family-main;

              @include respond-to-max(lg) {
                font-size: 14px;
                margin-bottom: 1.5rem;
              }

              @include respond-to-max(md) {
                font-size: 13px;
                margin-bottom: $spacing-md;
                line-height: 1.5;
              }

              @include respond-to-max(sm) {
                font-size: 12px;
                margin-bottom: $spacing-sm;
              }
            }
          }
        }
      }
    }
  }
}
</style>
