<script lang="ts" setup>
import type { Supplier } from "~/types";

interface Props {
  supplierData?: Supplier | Partial<Supplier> | null;
  supplier?: Supplier | Partial<Supplier> | null;
}

interface Emits {
  (e: "openModal"): void;
}

const props = withDefaults(defineProps<Props>(), {
  supplierData: null,
  supplier: null,
});

const emit = defineEmits<Emits>();

const { formatPhone } = useFormat();

const imageError = ref(false);

const handleOpenModal = (): void => {
  emit("openModal");
};

const currentSupplier = computed<Supplier | Partial<Supplier> | null>(() => {
  return props.supplierData || props.supplier || null;
});

const supplierName = computed<string>(() => {
  return currentSupplier.value?.name || "Nombre no disponible";
});

const supplierEmail = computed<string>(() => {
  return currentSupplier.value?.email || "";
});

const supplierPhone = computed<string>(() => {
  const phone = currentSupplier.value?.phone_number;
  return phone ? formatPhone(phone) : "";
});

const supplierPhoneHref = computed<string>(() => {
  return currentSupplier.value?.phone_number
    ? `tel:${currentSupplier.value.phone_number}`
    : "#";
});

const supplierEmailHref = computed<string>(() => {
  return currentSupplier.value?.email
    ? `mailto:${currentSupplier.value.email}`
    : "#";
});

const medicalEnrollmentNumber = computed<string>(() => {
  return currentSupplier.value?.num_medical_enrollment || "No disponible";
});

const primarySpecialty = computed<string>(() => {
  const services = currentSupplier.value?.services;
  if (!services || !Array.isArray(services) || services.length === 0) {
    return "Sin especialidad";
  }
  return services[0]?.medical_specialty?.name || "Sin especialidad";
});

const supplierServices = computed(() => {
  const services = currentSupplier.value?.services;
  if (!services || !Array.isArray(services)) {
    return [];
  }
  return services.map((service) => ({
    id: service.id || 0,
    specialty: service.medical_specialty?.name || "Especialidad desconocida",
  }));
});

const supplierAddress = computed<string>(() => {
  const supplier = currentSupplier.value;
  if (!supplier) return "Dirección no disponible";

  const parts = [
    supplier.street_number,
    supplier.address,
    supplier.city_name,
    supplier.country_iso_code,
  ].filter((part) => part && part.trim() !== "");

  return parts.length > 0 ? parts.join(", ") : "Dirección no disponible";
});

const experienceYears = computed<string>(() => {
  const years = currentSupplier.value?.experience_years;
  return years && years > 0 ? years.toString() : "0";
});

const patientsNumber = computed<string>(() => {
  const patients = currentSupplier.value?.patients_number;
  return patients && patients > 0 ? patients.toString() : "0";
});

const averageRating = computed<number>(() => {
  return 5.0;
});

const reviewsCount = computed<number>(() => {
  const reviews = currentSupplier.value?.reviews;
  return Array.isArray(reviews) ? reviews.length : 0;
});

const hasContactInfo = computed<boolean>(() => {
  return !!(
    currentSupplier.value?.phone_number || currentSupplier.value?.email
  );
});

const hasAddress = computed<boolean>(() => {
  return !!(
    currentSupplier.value?.address ||
    currentSupplier.value?.city_name ||
    currentSupplier.value?.country_iso_code
  );
});

const hasStatistics = computed<boolean>(() => {
  return !!(
    currentSupplier.value?.experience_years ||
    currentSupplier.value?.patients_number
  );
});

watch(
  () => currentSupplier.value?.profile_picture_url,
  () => {
    imageError.value = false;
  },
);
</script>

<template>
  <div class="sidebar-column">
    <div class="profile-card">
      <div class="profile-card-body">
        <div class="profile-card-body__image-container">
          <img
            v-if="currentSupplier?.profile_picture_url && !imageError"
            :src="currentSupplier.profile_picture_url"
            :alt="`Foto de ${supplierName}`"
            class="profile-card-body__image"
            @error="imageError = true"
          />
        </div>

        <div class="profile-card-body__info-wrapper">
          <div v-if="reviewsCount > 0" class="profile-card-body__rating-info">
            <span class="profile-card-body__rating-score">
              {{ averageRating.toFixed(1) }}
              <AtomsIconsStarFilled color="#FFD835" size="20" />
            </span>
            <span class="profile-card-body__review-count">
              ({{ reviewsCount }}
              {{ reviewsCount === 1 ? "Reseña" : "Reseñas" }})
            </span>
          </div>

          <h2 class="profile-card-body__doctor-name">
            {{ supplierName }}
          </h2>

          <h3 class="profile-card-body__doctor-specialty">
            {{ primarySpecialty }}
          </h3>

          <h4 class="profile-card-body__enrollment-number">
            Nº de Colegiado: {{ medicalEnrollmentNumber }}
          </h4>

          <div
            v-if="supplierServices.length > 0"
            class="profile-card-body__badge-wrapper"
          >
            <span
              v-for="service in supplierServices"
              :key="service.id"
              class="profile-card-body__badge"
            >
              {{ service.specialty }}
            </span>
          </div>
        </div>

        <div v-if="hasContactInfo" class="profile-card-body__contact-info">
          <a
            v-if="currentSupplier?.phone_number"
            :href="supplierPhoneHref"
            class="profile-card-body__contact-link"
            :title="`Llamar a ${supplierPhone}`"
          >
            <AtomsIconsPhoneIcon />
          </a>
          <a
            v-if="currentSupplier?.email"
            :href="supplierEmailHref"
            class="profile-card-body__contact-link"
            :title="`Enviar email a ${supplierEmail}`"
          >
            <AtomsIconsMailIcon />
          </a>
          <a
            v-if="hasAddress"
            href="#location"
            class="profile-card-body__contact-link"
            title="Ver ubicación"
          >
            <AtomsIconsMapPointerIcon />
          </a>
        </div>

        <div class="profile-card-body__additional-info">
          <p v-if="hasAddress" class="profile-card-body__address">
            <small>
              <AtomsIconsMapPointerIcon />
              {{ supplierAddress }}
            </small>
          </p>

          <div v-if="hasStatistics" class="profile-card-body__statistics">
            <div
              v-if="currentSupplier?.experience_years"
              class="profile-card-body__statistics-card"
            >
              <p class="profile-card-body__statistics-card-title">
                Experiencia
              </p>
              <p class="profile-card-body__statistics-card-highlight">
                +{{ experienceYears }} años
              </p>
            </div>
            <div
              v-if="currentSupplier?.patients_number"
              class="profile-card-body__statistics-card"
            >
              <p class="profile-card-body__statistics-card-title">Pacientes</p>
              <p class="profile-card-body__statistics-card-highlight">
                +{{ patientsNumber }}
              </p>
            </div>
          </div>

          <div class="profile-card-body__photos-section">
            <div class="profile-card-body__photos-section-row">
              <img
                src="@/src/assets/img-clinica-thumbnail-md.png"
                alt="Foto adicional de la clínica 1"
                @click="handleOpenModal"
                @error="
                  ($event.target as HTMLImageElement).style.display = 'none'
                "
              />
              <img
                src="@/src/assets/img-clinica-thumbnail-md.png"
                alt="Foto adicional de la clínica 2"
                @click="handleOpenModal"
                @error="
                  ($event.target as HTMLImageElement).style.display = 'none'
                "
              />
              <img
                src="@/src/assets/img-clinica-thumbnail-md.png"
                alt="Foto adicional de la clínica 3"
                @click="handleOpenModal"
                @error="
                  ($event.target as HTMLImageElement).style.display = 'none'
                "
              />
              <img
                src="@/src/assets/img-clinica-thumbnail-md.png"
                alt="Foto adicional de la clínica 4"
                @click="handleOpenModal"
                @error="
                  ($event.target as HTMLImageElement).style.display = 'none'
                "
              />
            </div>
            <a
              href="#"
              class="profile-card-body__more-photos-link"
              @click.prevent="handleOpenModal"
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
      &__image-container {
        width: 370px;
        height: 248px;
        border-radius: 26px;
        background-color: #f1f3f7;
        overflow: hidden;

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

      &__image {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: 0% 25%;
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
