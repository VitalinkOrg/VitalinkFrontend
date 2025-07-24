<script setup lang="ts">
interface DoctorData {
  profile_picture_url: string;
  name: string;
  services: Array<{
    medical_specialty?: {
      name: string;
    };
  }>;
  num_medical_enrollment: string;
  phone_number: string;
  email: string;
  street_number: string;
  address: string;
  city_name: string;
  country_iso_code: string;
  experience_years: number;
  patients_number: number;
}

interface Doctor {
  servicesResult: Array<{
    doctor_service_id: number;
    specialty: string;
  }>;
}

interface Props {
  doctorData: DoctorData;
  doctor: Doctor;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  openModal: [];
}>();

const handleOpenModal = () => {
  emit("openModal");
};
</script>

<template>
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
            <span class="profile-card-body__review-count">(13 Reseñas)</span>
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
            >
              {{ service.specialty }}
            </span>
          </div>
        </div>

        <div class="profile-card-body__contact-info">
          <a
            :href="`tel:${doctorData.phone_number}`"
            class="profile-card-body__contact-link"
          >
            <AtomsIconsPhoneIcon />
          </a>
          <a
            :href="`mailto:${doctorData.email}`"
            class="profile-card-body__contact-link"
          >
            <AtomsIconsMailIcon />
          </a>
          <a
            :href="`mailto:${doctorData.email}`"
            class="profile-card-body__contact-link"
          >
            <AtomsIconsMapPointerIcon />
          </a>
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
              <p class="profile-card-body__statistics-card-title">Pacientes</p>
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
                @click="handleOpenModal"
              />
              <img
                src="@/src/assets/img-clinica-thumbnail-md.png"
                alt=""
                @click="handleOpenModal"
              />
              <img
                src="@/src/assets/img-clinica-thumbnail-md.png"
                alt=""
                @click="handleOpenModal"
              />
              <img
                src="@/src/assets/img-clinica-thumbnail-md.png"
                alt=""
                @click="handleOpenModal"
              />
            </div>
            <a
              href="#"
              class="profile-card-body__more-photos-link"
              @click="handleOpenModal"
            >
              Ver más Fotos
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sidebar-column {
  display: flex;
  background-color: #ffffff;
  border-radius: 20px;
  justify-content: space-between;
  padding: 20px;
  width: 423px;
  box-shadow: 0px 20px 24px 0px #14253f0f;
  box-shadow: 0px 0px 1px 0px #0c1a4b1a;

  @include respond-to-max(xl) {
    width: 380px;
    padding: $spacing-md;
  }

  @include respond-to-max(lg) {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }

  @include respond-to-max(md) {
    border-radius: 16px;
    padding: $spacing-sm;
  }

  @include respond-to-max(sm) {
    border-radius: 12px;
    padding: $spacing-xs;
  }

  .profile-card {
    width: 100%;

    .profile-card-body {
      &__image {
        width: 370px;
        height: 248px;
        border-radius: 26px;
        object-fit: cover;
        object-position: 0% 25%;

        @include respond-to-max(xl) {
          width: 100%;
          height: 220px;
        }

        @include respond-to-max(lg) {
          height: 280px;
          max-width: 100%;
        }

        @include respond-to-max(md) {
          height: 240px;
          border-radius: 20px;
        }

        @include respond-to-max(sm) {
          height: 200px;
          border-radius: 16px;
        }
      }

      &__info-wrapper {
        display: flex;
        flex-direction: column;
        gap: 15px;
        padding: 10px;

        @include respond-to-max(md) {
          gap: 12px;
          padding: $spacing-sm;
        }

        @include respond-to-max(sm) {
          gap: 10px;
          padding: $spacing-xs;
        }
      }

      &__rating-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-top: 0.5rem;

        @include respond-to-max(sm) {
          gap: 6px;
          margin-top: 6px;
        }
      }

      &__rating-score {
        font-weight: 600;
        font-size: 14.7px;
        line-height: 25.21px;
        color: #353e5c;
        font-family: $font-family-main;

        @include respond-to-max(md) {
          font-size: 13px;
          line-height: 20px;
        }

        @include respond-to-max(sm) {
          font-size: 12px;
          line-height: 18px;
        }
      }

      &__review-count {
        display: flex;
        align-items: center;
        font-weight: 300;
        font-size: 13.65px;
        line-height: 25.21px;
        color: $color-text-secondary;
        font-family: $font-family-main;

        @include respond-to-max(md) {
          font-size: 12px;
          line-height: 18px;
        }

        @include respond-to-max(sm) {
          font-size: 11px;
          line-height: 16px;
        }
      }

      &__doctor-name {
        font-weight: 600;
        font-style: Semi Bold;
        font-size: 24px;
        line-height: 25.21px;
        color: $color-foreground;
        font-family: $font-family-main;

        @include respond-to-max(md) {
          font-size: 20px;
          line-height: 24px;
        }

        @include respond-to-max(sm) {
          font-size: 18px;
          line-height: 22px;
        }
      }

      &__doctor-specialty {
        font-weight: 600;
        font-size: 16px;
        line-height: 25.21px;
        color: $color-foreground;
        font-family: $font-family-main;

        @include respond-to-max(md) {
          font-size: 15px;
          line-height: 20px;
        }

        @include respond-to-max(sm) {
          font-size: 14px;
          line-height: 18px;
        }
      }

      &__enrollment-number {
        font-weight: 500;
        font-size: 16px;
        line-height: 25.21px;
        color: $color-text-secondary;
        font-family: $font-family-main;

        @include respond-to-max(md) {
          font-size: 14px;
          line-height: 18px;
        }

        @include respond-to-max(sm) {
          font-size: 12px;
          line-height: 16px;
        }
      }

      &__badge-wrapper {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;

        @include respond-to-max(sm) {
          gap: 6px;
        }
      }

      &__badge {
        font-weight: 500;
        font-size: 12px;
        line-height: 18px;
        text-align: center;
        padding: 2px 8px;
        color: $color-primary;
        background-color: #ebecf7;
        display: inline-block;
        border-radius: 16px;
        font-family: $font-family-main;

        @include respond-to-max(md) {
          font-size: 11px;
          line-height: 16px;
          padding: 1px 6px;
        }

        @include respond-to-max(sm) {
          font-size: 10px;
          line-height: 14px;
          padding: 1px 4px;
          border-radius: 12px;
        }
      }

      &__contact-info {
        padding: 10px;
        display: flex;
        gap: 14px;

        @include respond-to-max(md) {
          padding: $spacing-sm;
          gap: 10px;
          justify-content: center;
        }

        @include respond-to-max(sm) {
          padding: $spacing-xs;
          gap: 8px;
        }
      }

      &__contact-link {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 11px;
        background-color: $primary-aqua;
        color: #fff;
        box-shadow: 0px 14.85px 23.76px 0px #14253f0f;
        box-shadow: 0px 0px 1.48px 0px #0c1a4b1a;
        transition: background-color 0.2s ease;

        &:hover {
          background-color: darken($primary-aqua, 5%);
        }

        @include respond-to-max(md) {
          width: 36px;
          height: 36px;
          border-radius: 9px;
        }

        @include respond-to-max(sm) {
          width: 32px;
          height: 32px;
          border-radius: 8px;
        }

        svg {
          width: 20px;
          height: 20px;

          @include respond-to-max(md) {
            width: 18px;
            height: 18px;
          }

          @include respond-to-max(sm) {
            width: 16px;
            height: 16px;
          }
        }
      }

      &__additional-info {
        display: flex;
        flex-direction: column;
        padding: 10px;
        gap: 15px;

        @include respond-to-max(md) {
          padding: $spacing-sm;
          gap: 12px;
        }

        @include respond-to-max(sm) {
          padding: $spacing-xs;
          gap: 10px;
        }
      }

      &__address {
        font-weight: 500;
        font-size: 14px;
        line-height: 25.21px;
        color: $color-text-secondary;
        font-family: $font-family-main;

        @include respond-to-max(md) {
          font-size: 13px;
          line-height: 18px;
        }

        @include respond-to-max(sm) {
          font-size: 12px;
          line-height: 16px;
        }

        small {
          display: flex;
          align-items: flex-start;
          gap: 6px;

          @include respond-to-max(sm) {
            gap: 4px;
          }
        }
      }

      &__statistics {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        margin-top: 1rem;

        @include respond-to-max(md) {
          gap: 12px;
          margin-top: 12px;
        }

        @include respond-to-max(sm) {
          gap: 8px;
          margin-top: 8px;
        }
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

        @include respond-to-max(md) {
          padding: $spacing-md;
          border-radius: 16px;
        }

        @include respond-to-max(sm) {
          padding: $spacing-sm;
          border-radius: 12px;
        }
      }

      &__statistics-card-title {
        font-weight: 400;
        line-height: 24px;
        color: $color-text-secondary;
        font-family: $font-family-main;
        font-size: 14px;

        @include respond-to-max(md) {
          font-size: 13px;
          line-height: 18px;
        }

        @include respond-to-max(sm) {
          font-size: 12px;
          line-height: 16px;
        }
      }

      &__statistics-card-highlight {
        font-weight: 700;
        font-size: 24px;
        line-height: 24px;
        color: $color-primary;
        font-family: $font-family-main;

        @include respond-to-max(md) {
          font-size: 20px;
          line-height: 20px;
        }

        @include respond-to-max(sm) {
          font-size: 18px;
          line-height: 18px;
        }
      }

      &__photos-section {
        border-radius: 20px;
        padding: 10px 12px;
        background-color: #f1f3f7;

        @include respond-to-max(md) {
          border-radius: 16px;
          padding: $spacing-sm 10px;
        }

        @include respond-to-max(sm) {
          border-radius: 12px;
          padding: $spacing-xs 8px;
        }
      }

      &__photos-section-row {
        display: flex;
        flex-wrap: nowrap;
        gap: 17px;
        overflow-x: auto;
        padding-bottom: 4px;

        @include respond-to-max(md) {
          gap: 12px;
        }

        @include respond-to-max(sm) {
          gap: 8px;
        }

        &::-webkit-scrollbar {
          height: 4px;
        }

        &::-webkit-scrollbar-track {
          background: #f1f3f7;
        }

        &::-webkit-scrollbar-thumb {
          background: #d0d5dd;
          border-radius: 2px;
        }

        img {
          width: 72px;
          height: 69px;
          border-radius: 20px;
          border: 3px solid #ffffff80;
          flex-shrink: 0;
          cursor: pointer;

          @include respond-to-max(md) {
            width: 64px;
            height: 60px;
            border-radius: 16px;
            border: 2px solid #ffffff80;
          }

          @include respond-to-max(sm) {
            width: 56px;
            height: 52px;
            border-radius: 12px;
            border: 2px solid #ffffff80;
          }
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
        border-radius: $border-radius-md;
        text-decoration: none;
        color: inherit;
        cursor: pointer;
        transition: background-color 0.2s ease;
        font-family: $font-family-main;

        @include respond-to-max(md) {
          font-size: 14px;
          line-height: 20px;
          padding: 10px 16px;
          margin-top: 8px;
        }

        @include respond-to-max(sm) {
          font-size: 12px;
          line-height: 18px;
          padding: 8px 12px;
          margin-top: 6px;
        }

        &:hover {
          background-color: #fafafa;
        }
      }
    }
  }
}
</style>
